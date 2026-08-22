// lib/fulfillment/providers/localShop.js
import { createClient } from "@supabase/supabase-js";
import { FulfillmentProvider } from "./base";

/**
 * Local print-shop provider.
 * Writes/reads the same Supabase `orders` table the Vendor POD Console uses.
 * Does not call Printful.
 */
export class LocalShopProvider extends FulfillmentProvider {
  constructor(opts = {}) {
    super();
    this.supabase =
      opts.supabase ||
      createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
  }

  get name() {
    return "local";
  }

  async createOrder({ storeOrderId, items, shipping, metadata = {} }) {
    if (!storeOrderId) throw new Error("storeOrderId required");

    const lineItems = (items || []).map((i) => ({
      description: i.name || i.sku || i.local_sku || "Item",
      quantity: i.quantity,
      sku: i.sku || i.local_sku || null,
      print_file_url: i.print_file_url || null,
    }));

    const row = {
      stripe_session_id: String(storeOrderId),
      status: "paid",
      customer_email: shipping.email || null,
      customer_name: shipping.name || null,
      ship_name: shipping.name || null,
      ship_line1: shipping.address1 || null,
      ship_line2: shipping.address2 || null,
      ship_city: shipping.city || null,
      ship_state: shipping.state_code || null,
      ship_postal: shipping.zip || null,
      ship_country: shipping.country_code || null,
      shipping_address: shipping,
      fulfillment_status: "local_queue",
      items: lineItems,
      updated_at: new Date().toISOString(),
      ...(metadata.amount_total != null ? { amount_total: metadata.amount_total } : {}),
      ...(metadata.currency ? { currency: metadata.currency } : {}),
    };

    const { error } = await this.supabase
      .from("orders")
      .upsert(row, { onConflict: "stripe_session_id" });

    if (error) throw new Error(error.message);

    return {
      externalOrderId: String(storeOrderId),
      status: "local_queue",
      raw: { provider: "local" },
    };
  }

  async getOrderStatus(externalOrderId) {
    const { data, error } = await this.supabase
      .from("orders")
      .select("fulfillment_status, tracking_number")
      .eq("stripe_session_id", externalOrderId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return { status: "unknown", tracking: null };

    return {
      status: data.fulfillment_status || "unknown",
      tracking: data.tracking_number || null,
    };
  }
}
