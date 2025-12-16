// pages/api/calculate-shipping.js

import fetch from 'node-fetch';

// This is the V2 endpoint for shipping rates
const PRINTFUL_SHIPPING_ENDPOINT = 'https://api.printful.com/v2/shipping/rates';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Expecting cart data and recipient address from the request body
  // The frontend will send this when the user inputs their address.
  const { cart, recipient } = req.body;
  
  // Basic validation
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid.' });
  }
  
  // Printful requires at least the country code for shipping calculation
  if (!recipient || !recipient.country_code) {
    return res.status(400).json({ error: 'Recipient country code is missing.' });
  }

  try {
    const token = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing Printful API Token" });
    }

    // Map your local cart items to the V2 'order_items' format
    // V2 requires 'catalog_variant_id' and 'source: "catalog"'
    const orderItems = cart.map(item => {
      // NOTE: We rely on 'sync_variant_id' being the same as the Printful Catalog ID
      if (!item.sync_variant_id) {
        throw new Error(`Item ${item.name} is missing sync_variant_id.`);
      }
      
      return {
        source: 'catalog', 
        quantity: Number(item.quantity),
        catalog_variant_id: Number(item.sync_variant_id), // V2 name for the ID
      };
    });

    // Build the V2 request body
    const printfulBody = {
      recipient: recipient, 
      order_items: orderItems,
      currency: "USD", // Ensure this matches the currency you sell in
    };

    const response = await fetch(PRINTFUL_SHIPPING_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printfulBody),
    });

    const json = await response.json();

    if (!response.ok || !json.data) {
      console.error('Printful Shipping API Error:', json);
      // Return a 500 status and the Printful error message if available
      return res.status(response.status).json({ 
        error: json.error?.message || "Failed to calculate shipping rates." 
      });
    }

    // Return the list of shipping rates to the frontend
    return res.status(200).json({ rates: json.data });

  } catch (err) {
    console.error('❌ Shipping Calculation Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
