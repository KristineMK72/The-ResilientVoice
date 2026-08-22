// lib/fulfillment/providers/printful.js
import { FulfillmentProvider } from "./base";

/**
 * Printful POD provider — used by the existing Stripe webhook path.
 * Items should include sync_variant_id (Printful sync variant).
 */
export class PrintfulProvider extends FulfillmentProvider {
  constructor({ accessToken } = {}) {
    super();
    this.accessToken = accessToken || process.env.PRINTFUL_ACCESS_TOKEN;
  }

  get name() {
    return "printful";
  }

  async createOrder({ storeOrderId, items, shipping, confirm = true }) {
    if (!this.accessToken) {
      throw new Error("PRINTFUL_ACCESS_TOKEN missing");
    }

    const printfulItems = (items || [])
      .map((i) => ({
        sync_variant_id: Number(i.sync_variant_id),
        quantity: Number(i.quantity),
      }))
      .filter(
        (i) =>
          Number.isFinite(i.sync_variant_id) &&
          i.sync_variant_id > 0 &&
          Number.isFinite(i.quantity) &&
          i.quantity > 0
      );

    if (!printfulItems.length) {
      throw new Error("No Printful sync_variant_id items");
    }

    const recipient = {
      name: shipping.name,
      email: shipping.email || undefined,
      address1: shipping.address1,
      address2: shipping.address2 || undefined,
      city: shipping.city,
      state_code: shipping.state_code,
      country_code: shipping.country_code,
      zip: shipping.zip,
    };

    const res = await fetch("https://api.printful.com/orders?update_existing=true", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: storeOrderId ? String(storeOrderId).slice(0, 32) : undefined,
        recipient,
        items: printfulItems,
        confirm,
        shipping: "STANDARD",
      }),
    });

    const data = await res.json();

    if (res.status === 409) {
      return {
        externalOrderId: data?.result?.id != null ? String(data.result.id) : null,
        status: "duplicate",
        raw: data,
      };
    }

    if (![200, 201].includes(res.status)) {
      const msg = data?.error?.message || JSON.stringify(data);
      throw new Error(`Printful order failed (${res.status}): ${msg}`);
    }

    return {
      externalOrderId: data?.result?.id != null ? String(data.result.id) : null,
      status: "created",
      raw: data,
    };
  }

  async getOrderStatus(externalOrderId) {
    if (!this.accessToken) throw new Error("PRINTFUL_ACCESS_TOKEN missing");
    const res = await fetch(`https://api.printful.com/orders/${externalOrderId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Printful status failed (${res.status})`);
    }
    const status = data?.result?.status || "unknown";
    const tracking =
      data?.result?.shipments?.[0]?.tracking_number ||
      data?.result?.tracking_number ||
      null;
    return { status, tracking, raw: data };
  }
}
