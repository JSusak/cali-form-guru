import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FormCheck AI, an expert pose analysis coach for calisthenics, aerial circus (silks, hoop, trapeze), and pole fitness athletes.

When analyzing a pose image/video frame:
1. Identify the pose the athlete is attempting
2. Evaluate their form on a scale of 0-100
3. Provide specific corrections referencing body parts (use "your left/right" from the athlete's perspective)
4. Praise what they're doing well
5. Give actionable improvement tips

IMPORTANT: Always respond with valid JSON matching the requested format. Be encouraging but honest.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoBase64, imageBase64, mimeType, poseName, liveMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const mediaBase64 = imageBase64 || videoBase64;
    const mediaType = imageBase64 ? "image" : "video";

    let userPrompt: string;
    if (liveMode) {
      userPrompt = `The athlete is practicing: ${poseName}. Analyze this camera frame and give ONE short sentence of real-time coaching feedback. Also provide a score. Respond as JSON: {"feedback":"...","score":NUMBER}`;
    } else {
      userPrompt = `The athlete is attempting: ${poseName}. Analyze their form in detail. Respond as JSON:
{"score":NUMBER,"quickWin":"...","quickFix":"...","corrections":["..."],"praise":["..."],"tips":["..."]}
- score: 0-100 rating
- quickWin: ONE short sentence (max 10 words) summarizing what they did best
- quickFix: ONE short sentence (max 10 words) summarizing the #1 thing to fix
- corrections: 2-4 specific things to fix
- praise: 1-3 things done well
- tips: 2-3 actionable improvement suggestions`;
    }

    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${mediaBase64}`,
            },
          },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from the AI response - handle markdown code blocks and other formatting
    let cleaned = content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonStart = cleaned.search(/\{/);
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Raw AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fix trailing commas and control characters
      cleaned = cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1F\x7F]/g, "");
      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-pose error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
