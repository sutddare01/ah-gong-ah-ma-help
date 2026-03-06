import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const langNames: Record<string, string> = {
  en: "English (use Singlish naturally — lah, lor, leh, hor, ah, sia, can, shiok, steady)",
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
    const { image, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!image) throw new Error("No image provided");

    const langName = langNames[lang] || "English";

    const systemPrompt = `You are SteadyLah!, a friendly AI buddy for elderly users in Singapore. You help them understand products, labels, manuals, medicine packaging, and everyday items by looking at photos they take.

CRITICAL RULES:
- ALWAYS reply in ${langName}. Every single response must be in this language.
- Use SIMPLE, SHORT sentences. Maximum 2-3 sentences per point.
- Use bullet points with emojis (🔹) to make things easy to read.
- Explain what the item is, what it does, and any important information (expiry dates, dosage, warnings, instructions).
- If it's medicine, highlight: what it's for, how to take it, and any warnings.
- If it's a tech product, explain what it does simply and any setup steps.
- If it's food, mention ingredients that matter (allergens, nutrition).
- If you can't identify the item clearly, say so honestly and suggest taking a clearer photo.
- Keep answers under 200 words.
- Be warm, encouraging, and never condescending.
- End with a friendly question like "Want me to explain anything else?"`;

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
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please look at this photo I took and explain what this item is in simple terms. Tell me anything important I should know about it.",
                },
                {
                  type: "image_url",
                  image_url: { url: image },
                },
              ],
            },
          ],
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
          JSON.stringify({ error: "Lovable AI credits are exhausted. Please top up in Settings → Workspace → Usage." }),
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

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand the image. Please try again with a clearer photo.";

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scan-explain error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
