import { openai } from "../../lib/openai";
import { supabaseAdmin } from "../../lib/supabase-admin";

function detectIntent(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("ship") || text.includes("delivery") || text.includes("arrive")) {
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
    text.includes("fabric") ||
    text.includes("what size should i get")
  ) {
    return "product_help";
  }

  if (text.includes("return") || text.includes("exchange") || text.includes("refund")) {
    return "policy";
  }

  if (text.includes("recommend") || text.includes("suggest") || text.includes("which one")) {
    return "recommendation";
  }

  return "general";
}

async function getPolicies() {
  const { data } = await supabaseAdmin
    .from("store_policies")
    .select("key,value_markdown");

  return data || [];
}

async function getProductContext(productId) {
  if (!productId) return null;

  const { data } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      printful_sync_product_id,
      title,
      description,
      brand,
      product_variants(
        size,
        color,
        material,
        brand,
        fit_notes
      )
    `)
    .eq("printful_sync_product_id", String(productId))
    .single();

  return data || null;
}

function buildProductSummary(product) {
  if (!product) return null;

  const variants = product.product_variants || [];

  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const materials = [...new Set(variants.map(v => v.material).filter(Boolean))];
  const brands = [...new Set(variants.map(v => v.brand).filter(Boolean))];

  return {
    title: product.title,
    description: product.description,
    brand: product.brand || brands[0] || null,
    sizes,
    colors,
    materials,
    fitNotes: variants.map(v => v.fit_notes).filter(Boolean)
  };
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const body = req.body || {};

    const message = body.message || "";
    const productId = body.productId || null;
    const sessionId = body.sessionId || `session-${Date.now()}`;

    const conversation = Array.isArray(body.conversation)
      ? body.conversation.slice(-6)
      : [];

    const intent = detectIntent(message);

    const [policies, productContext] = await Promise.all([
      getPolicies(),
      getProductContext(productId),
    ]);

    const productSummary = buildProductSummary(productContext);

    const systemPrompt = `
You are Sam, the Grit & Grace shopping assistant.

Personality:
- warm
- compassionate
- grateful
- patriotic in a humble heartfelt way
- encouraging and neighborly

Tone:
Speak like a friendly guide who appreciates the customer supporting the store.

Rules:
- Only answer using provided store context.
- Never invent facts.
- If information is missing, say you are still gathering details.

Product behavior:
- If productSummary.sizes exists, ALWAYS list available sizes.
- If productSummary.materials exists, mention the material early.
- If productSummary.brand exists, mention the brand.
- If asked about sizing and no size chart exists, suggest starting with the usual size.
- If someone asks what size they should get, ask one short follow-up question if needed.

Store values:
You may briefly thank customers for supporting Grit & Grace and the community.

Keep answers warm, helpful, and concise.
`;

    const historyText = conversation
      .map(m => `${m.role === "user" ? "Customer" : "Sam"}: ${m.text}`)
      .join("\n");

    const context = {
      intent,
      productSummary,
      policies
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
          content: `
Conversation:
${historyText}

Customer message:
${message}

Store context:
${JSON.stringify(context, null, 2)}
`,
        },
      ],
    });

    const answer =
      response.output_text ||
      "I’m still gathering the details for that item, but I’d be happy to help with a follow-up question.";

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
    console.error("assistant error:", error);

    return res.status(500).json({
      ok: false,
      error: "Assistant request failed",
      details: error?.message || "Unknown server error",
    });
  }
}
