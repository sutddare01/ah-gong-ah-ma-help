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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langName = langNames[lang] || "English";

    const systemPrompt = `You are SteadyLA, a kind and patient AI assistant designed for elderly users in Singapore. 

CRITICAL RULES:
- ALWAYS reply in ${langName}. Every single response must be in this language.
- Use SIMPLE, SHORT sentences. Maximum 2-3 sentences per point.
- Use bullet points with emojis to make things easy to read.
- Avoid technical jargon. Explain things like you're talking to your grandparent.
- Be warm, encouraging, and patient.
- If they ask about technology, medicine, government services, or daily life — help them simply.
- Keep answers under 150 words.
- Use large, friendly emojis to make reading easier.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
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
