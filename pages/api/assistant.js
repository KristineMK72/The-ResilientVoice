import { openai } from "../../lib/openai";
import { supabaseAdmin } from "../../lib/supabase-admin";

function detectIntent(message) {
  const text = String(message || "").toLowerCase();

  if (
    text.includes("ship") ||
    text.includes("delivery") ||
    text.includes("arrive")
  ) {
    return "shipping";
  }

  if (
    text.includes("size") ||
    text.includes("fit") ||
    text.includes("true to size") ||
    text.includes("runs big") ||
    text.includes("runs small") ||
    text.includes("material") ||
    text.includes("fabric")
  ) {
    return "sizing";
  }

  if (
    text.includes("return") ||
    text.includes("exchange") ||
    text.includes("refund")
  ) {
    return "policy";
  }

  if (
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("which one")
  ) {
    return "recommendation";
  }

  return "general";
}

async function getPolicies() {
  const { data, error } = await supabaseAdmin
    .from("store_policies")
    .select("key, value_markdown");

  if (error) {
    console.error("getPolicies error:", error);
    return [];
  }

  return data || [];
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const message = body.message || "";
    const sessionId = body.sessionId || `session-${Date.now()}`;
    const intent = detectIntent(message);
    const policies = await getPolicies();

    const systemPrompt = `
You are Sam, the Grit & Grace shopping assistant.

Your personality:
- Warm, compassionate, grateful, and welcoming
- Patriotic in a heartfelt and humble way
- Spiritual in a gentle, uplifting, inclusive way
- Encouraging, calm, neighborly, and kind
- Proud of community, resilience, service, faith, freedom, and giving back

Your job:
- Help customers with sizing, shipping, gift ideas, product details, materials, and store questions
- Answer only using the store context provided
- Never invent size, fit, stock, material, or shipping facts
- If exact shipping is unavailable, explain that a destination-specific or cart-specific estimate is needed
- Keep answers clear, concise, and helpful

Tone guidance:
- Sound like a caring patriotic guide, not a robotic chatbot
- You may warmly thank people for shopping with Grit & Grace
- You may mention gratitude and community impact when appropriate
- Keep spiritual language light, encouraging, and inclusive
`;

    const context = {
      intent,
      policies,
    };

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Customer message: ${message}\n\nStore context:\n${JSON.stringify(
            context,
            null,
            2
          )}`,
        },
      ],
    });

    const answer =
      response.output_text || "I’m sorry — I couldn’t generate a reply.";

    const { error: insertError } = await supabaseAdmin
      .from("assistant_conversations")
      .insert({
        session_id: sessionId,
        user_message: message,
        assistant_message: answer,
        intent,
      });

    if (insertError) {
      console.error("assistant_conversations insert error:", insertError);
    }

    return res.status(200).json({
      ok: true,
      answer,
      intent,
    });
  } catch (error) {
    console.error("assistant route error:", error);
    return res.status(500).json({
      ok: false,
      error: "Assistant request failed",
      details: error?.message || "Unknown server error",
    });
  }
}
