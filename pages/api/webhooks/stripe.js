// pages/api/webhooks/stripe.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import fetch from 'node-fetch'; // Used for the server-side API call

// Stripe requires the raw body, so we disable Next.js body parser
export const config = {
  api: { bodyParser: false },
};

// Initialize Stripe with your secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30', // Use your current API version
});

export default async function handler(req, res) {
  /* -------------------------
     1. Basic Method Check
  -------------------------- */
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  /* -------------------------
     2. Verify Stripe Signature
  -------------------------- */
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Your webhook signing secret
    );
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* -------------------------
     3. Filter for Completed Payments
  -------------------------- */
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, message: `Ignoring event type: ${event.type}` });
  }

  const session = event.data.object;

  if (session.payment_status !== 'paid') {
    console.warn('⚠️ Checkout completed but payment not marked as paid:', session.id);
    return res.status(200).json({ received: true, message: 'Payment not paid' });
  }

  /* -------------------------
     4. Fulfillment Logic
  -------------------------- */
  try {
    /* A. Recipient Data (from Stripe) */
    const recipient = {
      name: session.customer_details?.name,
      email: session.customer_details?.email,
      address1: session.customer_details?.address?.line1,
      city: session.customer_details?.address?.city,
      state_code: session.customer_details?.address?.state,
      country_code: session.customer_details?.address?.country,
      zip: session.customer_details?.address?.postal_code,
    };

    if (!recipient.name || !recipient.address1) {
      throw new Error('Missing recipient shipping details for fulfillment.');
    }

    /* B. Parse and Validate Cart Metadata */
    if (!session.metadata?.cart) {
      throw new Error('Missing cart metadata from Stripe session.');
    }

    // 1. Get your internal cart data from the Stripe session metadata
    const items = JSON.parse(session.metadata.cart); 

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Cart metadata is empty or invalid.');
    }

    // 2. Map/Transform the data into the Printful structure (CRITICAL STEP)
    // --- FIX APPLIED HERE ---
    const printfulItems = items.map(item => {
        // Validation: Ensure the critical design URL is present
        if (!item.design_url) { 
            throw new Error(`Missing design file URL for item ${item.name}. Cannot fulfill.`);
        }
        
        // Validation: Ensure the Printful ID is present
        if (!item.sync_variant_id) {
             throw new Error(`Missing Printful ID for item ${item.name}. Cannot fulfill.`);
        }

        return {
          // ✅ FIX: Use the explicit Printful sync_variant_id
          variant_id: item.sync_variant_id, 
          
          quantity: item.quantity,
          
          // Use item.price which was sent in metadata
          retail_price: String(item.price), 
          
          // Printful requires the design URL in this nested 'files' array format:
          files: [
            {
              url: item.design_url, // Must be the URL to your print-ready file
            }
          ],
          name: item.name, // Custom name for the packing slip
        };
    });
    // ------------------------

    /* -------------------------
       5. Send Order to Printful (Idempotent via external_id)
    -------------------------- */
    const printfulRes = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        // Use the correct environment variable name!
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: event.id, // Uses the unique Stripe event ID to prevent duplicate orders
        recipient,
        items: printfulItems, // <-- Sending the correctly structured array
        confirm: true, // Auto-submit to fulfillment
        shipping: 'STANDARD', // You can change this based on customer selection if tracked
      }),
    });

    const printfulData = await printfulRes.json();

    /* Duplicate order (safe) */
    if (printfulRes.status === 409) {
      console.warn(
        '⚠️ Printful order already exists (409) for Stripe event:',
        event.id
      );
      return res.status(200).json({ duplicate: true });
    }

    /* Failure */
    if (![200, 201].includes(printfulRes.status)) {
      console.error('❌ Printful API error:', {
        status: printfulRes.status,
        response: printfulData,
      });
      // Optionally notify yourself (Slack, email) of a critical failure
      return res.status(500).json({ error: 'Printful order failed' });
    }

    console.log(
      '✅ Printful order successfully created:',
      printfulData.result?.id,
      'for Stripe event:',
      event.id
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Fulfillment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
