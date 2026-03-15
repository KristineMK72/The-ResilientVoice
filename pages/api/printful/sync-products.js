import { supabaseAdmin } from "@/lib/supabase-admin";
import { printfulFetch } from "@/lib/printful";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const data = await printfulFetch("/store/products");

    for (const item of data.result || []) {
      const title = item?.sync_product?.name || `Product ${item.id}`;
      const slug = slugify(title);

      const { data: productRow, error: productError } = await supabaseAdmin
        .from("products")
        .upsert(
          {
            printful_sync_product_id: String(item.sync_product.id),
            title,
            slug,
            thumbnail_url: item?.sync_product?.thumbnail_url || null,
            active: true,
          },
          { onConflict: "printful_sync_product_id" }
        )
        .select("id")
        .single();

      if (productError) throw productError;

      for (const variant of item.sync_variants || []) {
        const variantImage = variant?.files?.[0]?.preview_url || null;

        const inferredFitNotes = /heavyweight/i.test(variant.name)
          ? "Heavier feel; good for cooler weather."
          : "Standard fit; check size guide if between sizes.";

        const sizeGuide = {
          note: "Use garment measurements when available. If between sizes, consider sizing up for a roomier fit.",
        };

        const { error: variantError } = await supabaseAdmin
          .from("product_variants")
          .upsert(
            {
              product_id: productRow.id,
              printful_sync_variant_id: String(variant.id),
              sku: variant.sku || null,
              name: variant.name,
              color: variant.color || null,
              size: variant.size || null,
              retail_price: variant.retail_price
                ? Number(variant.retail_price)
                : null,
              currency: variant.currency || "USD",
              fit_notes: inferredFitNotes,
              size_guide_json: sizeGuide,
              image_url: variantImage,
              in_stock: true,
            },
            { onConflict: "printful_sync_variant_id" }
          );

        if (variantError) throw variantError;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("sync-products error:", error);
    return res.status(500).json({
      ok: false,
      error: "Product sync failed",
      details: error.message,
    });
  }
}
