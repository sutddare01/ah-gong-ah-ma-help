import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const langNames: Record<string, string> = {
  en: "English",
  zh: "Simplified Chinese (华语)",
  ms: "Malay (Bahasa Melayu)",
  ta: "Tamil (தமிழ்)",
  hk: "Hokkien-style Simplified Chinese",
  ct: "Cantonese (广东话)",
  tc: "Teochew (潮州话)",
  vi: "Vietnamese (Tiếng Việt)",
  th: "Thai (ภาษาไทย)",
  ko: "Korean (한국어)",
  ja: "Japanese (日本語)",
  hi: "Hindi (हिन्दी)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const langName = langNames[lang] || "English";

    const systemPrompt = `You are SteadyLah!, a friendly and warm AI buddy for elderly users in Singapore. You talk like a close friend or family member — casual, caring, and encouraging.

CRITICAL RULES:
- ALWAYS reply in ${langName}. Every single response must be in this language.
- When replying in English, use Singlish naturally! Use lah, lor, leh, hor, ah, sia, can, shiok, steady, etc. Example: "Wah, this one very easy lah! Don't worry ah, I explain for you."
- Talk like a friendly younger person chatting with their ah gong/ah ma — respectful but warm and casual.
- Use SIMPLE, SHORT sentences. Maximum 2-3 sentences per point.
- Use bullet points with emojis to make things easy to read.
- Avoid technical jargon. Explain like you're talking to family.
- Be encouraging! Use phrases like "No worries!", "Can one!", "Steady lah!", "Very good!"
- If they ask about technology, medicine, government services, or daily life — help them simply.
- Keep answers under 150 words.
- Use large, friendly emojis to make reading easier.
- Never be condescending. Treat them like a respected elder friend.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 1024,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "OpenRouter API key has no credits or is invalid. Please top up your OpenRouter account at openrouter.ai." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service error: " + (t || response.status) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
