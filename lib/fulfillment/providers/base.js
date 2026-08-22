// lib/fulfillment/providers/base.js
// Shared contract for POD / print vendors (Printful, local shop, …)

/**
 * @typedef {Object} FulfillmentItem
 * @property {string} [sku]
 * @property {number} [sync_variant_id]  // Printful
 * @property {string} [local_sku]        // local catalog
 * @property {number} quantity
 * @property {string} [name]
 * @property {string} [print_file_url]
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} name
 * @property {string} [email]
 * @property {string} address1
 * @property {string} [address2]
 * @property {string} city
 * @property {string} state_code
 * @property {string} country_code
 * @property {string} zip
 */

export class FulfillmentProvider {
  /** @returns {string} */
  get name() {
    return "base";
  }

  /**
   * Create a production order at the vendor.
   * @param {{ storeOrderId: string, items: FulfillmentItem[], shipping: ShippingAddress, metadata?: object }}
   * @returns {Promise<{ externalOrderId: string|null, status: string, raw?: any }>}
   */
  async createOrder(_payload) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} externalOrderId
   * @returns {Promise<{ status: string, tracking?: string|null, raw?: any }>}
   */
  async getOrderStatus(_externalOrderId) {
    throw new Error("Not implemented");
  }
}
