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
    text.includes("fabric") ||
    text.includes("cotton") ||
    text.includes("brand") ||
    text.includes("what size should i get")
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

async function printfulFetch(path, init = {}) {
  const res = await fetch(`https://api.printful.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printful error ${res.status}: ${text}`);
  }

  return res.json();
}

async function fetchCatalogVariantInfo(catalogVariantId) {
  if (!catalogVariantId) return null;

  try {
    const data = await printfulFetch(`/products/variant/${catalogVariantId}`);
    return data?.result || null;
  } catch (error) {
    console.error("fetchCatalogVariantInfo error:", error);
    return null;
  }
}

async function fetchPrintfulProductContext(productId) {
  const detailData = await printfulFetch(`/store/products/${productId}`);
  const item = detailData?.result;

  if (!item) return null;

  const title =
    item?.sync_product?.name ||
    item?.name ||
    `Product ${productId}`;

  const variants = [];

  for (const variant of item?.sync_variants || []) {
    const catalogVariantId = variant?.variant_id || null;
    const catalog = catalogVariantId
      ? await fetchCatalogVariantInfo(catalogVariantId)
      : null;

    const productInfo = catalog?.product || null;

    variants.push({
      id: String(variant?.id || ""),
      name: variant?.name || "Unnamed Variant",
      size: variant?.size || null,
      color: variant?.color || null,
      material:
        productInfo?.material ||
        productInfo?.description ||
        null,
      brand:
        productInfo?.brand ||
        productInfo?.model ||
        null,
      fit_notes: /heavyweight/i.test(variant?.name || "")
        ? "Heavier feel; great for cooler weather."
        : "Standard fit; if you are between sizes, consider sizing up for a roomier fit.",
      size_guide_json:
        catalog?.size_guide || {
          available_sizes: [variant?.size].filter(Boolean),
          note:
            "If you are between sizes and want a roomier fit, consider sizing up.",
        },
      product_details_json: productInfo,
      in_stock: true,
    });
  }

  return {
    id: null,
    printful_sync_product_id: String(productId),
    title,
    slug: null,
    description: item?.sync_product?.name || null,
    brand: null,
    thumbnail_url:
      item?.sync_product?.thumbnail_url ||
      item?.thumbnail_url ||
      null,
    size_guide_json: null,
    product_details_json: null,
    product_variants: variants,
  };
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
      brand,
      thumbnail_url,
      size_guide_json,
      product_details_json,
      product_variants (
        id,
        name,
        size,
        color,
        material,
        brand,
        fit_notes,
        size_guide_json,
        product_details_json,
        in_stock
      )
    `)
    .eq("printful_sync_product_id", String(productId))
    .maybeSingle();

  if (data) {
    return data;
  }

  if (error) {
    console.error("getProductContext supabase error:", error);
  }

  try {
    const fallback = await fetchPrintfulProductContext(productId);
    return fallback;
  } catch (fallbackError) {
    console.error("getProductContext fallback error:", fallbackError);
    return null;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sizeSort(a, b) {
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const ai = order.indexOf(String(a).toUpperCase());
  const bi = order.indexOf(String(b).toUpperCase());

  if (ai === -1 && bi === -1) return String(a).localeCompare(String(b));
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

function cleanMaterial(material) {
  if (!material) return null;

  const text = String(material).trim();

  const bullets = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.startsWith("•"));

  const materialBullets = bullets.filter((line) =>
    /cotton|polyester|spandex|blend|jersey|fleece/i.test(line)
  );

  if (materialBullets.length) {
    return materialBullets.join(" ");
  }

  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

function buildProductSummary(product) {
  if (!product) return null;

  const variants = Array.isArray(product.product_variants)
    ? product.product_variants
    : [];

  const sizes = unique(variants.map((v) => v.size)).sort(sizeSort);
  const colors = unique(variants.map((v) => v.color));
  const materials = unique(
    variants.map((v) => cleanMaterial(v.material))
  );
  const variantBrands = unique(variants.map((v) => v.brand));
  const fitNotes = unique(variants.map((v) => v.fit_notes));

  const sizeGuideNotes = unique(
    variants
      .map((v) => v.size_guide_json?.note)
      .concat(product?.size_guide_json?.note || null)
  );

  return {
    title: product.title || null,
    description: product.description || null,
    brand: product.brand || variantBrands[0] || null,
    sizes,
    colors,
    materials,
    fitNotes,
    sizeGuideNotes,
    variantCount: variants.length,
    inStockSizes: unique(
      variants.filter((v) => v.in_stock !== false).map((v) => v.size)
    ).sort(sizeSort),
  };
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
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

    console.log("Assistant productId:", productId);
    console.log(
      "Assistant productSummary:",
      JSON.stringify(productSummary, null, 2)
    );

    const systemPrompt = `
You are Sam, the Grit & Grace shopping assistant.

Personality:
- Warm, compassionate, grateful, and welcoming
- Patriotic in a heartfelt and humble way
- Spiritual in a gentle, uplifting, inclusive way
- Encouraging, calm, neighborly, and kind
- Proud of community, resilience, service, faith, freedom, and giving back

Rules:
- Answer only using the provided store context.
- Never invent facts.
- If information is missing, say so honestly.
- Keep answers warm, helpful, concise, and conversational.

Critical product behavior:
- If productSummary.sizes has values, ALWAYS list the available sizes.
- If productSummary.materials has values, mention the material in the first sentence.
- If productSummary.brand exists, mention the garment brand.
- Never say sizes are unavailable if productSummary.sizes contains values.
- Never say material is unavailable if productSummary.materials contains values.
- If asked what size someone should get and there is no exact measurement chart, recommend their usual size as a starting point.
- If fit notes say to size up for a roomier fit, mention that.
- If the user asks about sizing, answer directly first, then optionally invite one short follow-up.
- If productSummary.inStockSizes has values, prefer listing those.

Tone guidance:
- Sound like a caring patriotic guide, not a robotic chatbot.
- You may thank people for supporting Grit & Grace.
- You may briefly mention the community-focused mission.
`;

    const historyText = conversation
      .map((m) => `${m.role === "user" ? "Customer" : "Sam"}: ${m.text}`)
      .join("\n");

    const context = {
      intent,
      productId,
      productSummary,
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
      "I’m still gathering the full details for this item, but I’d be happy to help with a follow-up question.";

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
    console.error("assistant error:", error);

    return res.status(500).json({
      ok: false,
      error: "Assistant request failed",
      details: error?.message || "Unknown server error",
    });
  }
}
