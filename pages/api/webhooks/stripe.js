// pages/api/webhooks/stripe.js

import Stripe from 'stripe';
import { buffer } from 'micro';
import fetch from 'node-fetch';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req, res) {
  /* -------------------------
     Only allow POST
  -------------------------- */
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  /* -------------------------
     Verify Stripe Signature
  -------------------------- */
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* -------------------------
     Only handle completed checkouts
  -------------------------- */
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  if (session.payment_status !== 'paid') {
    console.warn('⚠️ Checkout completed but payment not marked as paid');
    return res.status(200).json({ received: true });
  }

  /* -------------------------
     Fulfillment Logic
  -------------------------- */
  try {
    /* Recipient (from Stripe) */
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
      throw new Error('Missing recipient shipping details');
    }

    /* Parse cart metadata */
    if (!session.metadata?.cart) {
      throw new Error('Missing cart metadata from Stripe session');
    }

    const items = JSON.parse(session.metadata.cart);

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Cart metadata is empty or invalid');
    }

    /* Validate Printful items */
    for (const item of items) {
      if (
        (!item.variant_id && !item.sync_variant_id) ||
        !item.quantity
      ) {
        throw new Error(
          'Each item must include variant_id or sync_variant_id and quantity'
        );
      }
    }

    /* -------------------------
       Send Order to Printful
       (Idempotent via external_id)
    -------------------------- */
    const printfulRes = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: event.id, // ✅ prevents duplicate fulfillment
        recipient,
        items,
        confirm: true,
        shipping: 'STANDARD',
      }),
    });

    const printfulData = await printfulRes.json();

    /* Duplicate order (safe) */
    if (printfulRes.status === 409) {
      console.warn(
        '⚠️ Printful order already exists for Stripe event:',
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
      return res.status(500).json({ error: 'Printful order failed' });
    }

    console.log(
      '✅ Printful order created:',
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
