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
    text.includes("runs small")
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

async function getProductContext(productSlug) {
  if (!productSlug) return null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      thumbnail_url,
      product_variants (
        printful_sync_variant_id,
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
    .eq("slug", productSlug)
    .single();

  if (error) {
    console.error("getProductContext error:", error);
    return null;
  }

  return data;
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

async function getShippingContext(cart, recipient) {
  if (!cart?.length || !recipient?.country_code) return null;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  const res = await fetch(`${appUrl}/api/printful/shipping-estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient,
      items: cart.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("getShippingContext failed:", text);
    return null;
  }

  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body;
    const message = body?.message || "";
    const sessionId = body?.sessionId || `session-${Date.now()}`;
    const productSlug = body?.productSlug || null;
    const cart = body?.cart || [];
    const recipient = body?.recipient || null;

    const intent = detectIntent(message);

    const [productContext, policies, shippingContext] = await Promise.all([
      getProductContext(productSlug),
      getPolicies(),
      intent === "shipping"
        ? getShippingContext(cart, recipient)
        : Promise.resolve(null),
    ]);

    const systemPrompt = `
You are the Grit & Grace shopping assistant.

Rules:
- Answer only using the provided store context.
- Never invent size, fit, stock, or shipping facts.
- If exact shipping is unavailable, say that a destination/cart-specific estimate is needed.
- Be warm, clear, helpful, and brand-friendly.
- Keep answers concise and useful.
- If the customer is between sizes and the fit data is uncertain, suggest checking measurements and sizing up for a roomier fit.
`;

    const context = {
      intent,
      productContext,
      policies,
      shippingContext,
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
      details: error.message,
    });
  }
}
