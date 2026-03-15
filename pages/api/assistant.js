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
    text.includes("sizing guide") ||
    text.includes("material") ||
    text.includes("fabric")
  ) {
    return "product_help";
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

async function getProductContext(productId) {
  if (!productId) return null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      printful_sync_product_id,
      title,
      slug,
      description,
      thumbnail_url,
      product_variants (
        printful_sync_variant_id,
        sku,
        name,
        color,
        size,
        retail_price,
        currency,
        material,
        fit_notes,
        size_guide_json,
        image_url,
        in_stock
      )
    `)
    .eq("printful_sync_product_id", String(productId))
    .single();

  if (error) {
    console.error("getProductContext error:", error);
    return null;
  }

  return data;
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
    const productId = body.productId || null;
    const conversation = Array.isArray(body.conversation)
      ? body.conversation.slice(-6)
      : [];

    const intent = detectIntent(message);

    const [policies, productContext] = await Promise.all([
      getPolicies(),
      getProductContext(productId),
    ]);

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
- Answer only using the provided context
- Never invent size, fit, stock, material, or shipping facts
- If product info is incomplete, say so honestly
- If you are still gathering item details, say that clearly and invite a follow-up question
- If sizing data exists, summarize it clearly
- If a sizing guide is missing, say that honestly
- Keep answers helpful, warm, concise, and conversational

Tone guidance:
- Sound like a caring patriotic guide, not a robotic chatbot
- You may warmly thank people for supporting Grit & Grace
- You may gently mention community impact and gratitude
- Keep spiritual language light, encouraging, and inclusive

Helpful fallback language:
- "I’m still gathering the full details for this item, so I may not have every specification just yet."
- "I can help with a follow-up if you’d like me to keep narrowing it down."
`;

    const context = {
      intent,
      productContext,
      policies,
    };

    const historyText = conversation
      .map((m) => `${m.role === "user" ? "Customer" : "Sam"}: ${m.text}`)
      .join("\n");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Recent conversation:
${historyText}

Current customer message:
${message}

Store context:
${JSON.stringify(context, null, 2)}`,
        },
      ],
    });

    const answer =
      response.output_text ||
      "I’m still gathering the full details for this item, but I’m happy to help with a follow-up question.";

    await supabaseAdmin.from("assistant_conversations").insert({
      session_id: sessionId,
      user_message: message,
      assistant_message: answer,
      intent,
    });

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
