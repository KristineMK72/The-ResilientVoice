// pages/api/webhooks/stripe.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // Required for Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req); // ✅ THIS IS THE FIX
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status === 'paid') {
      try {
        const recipient = JSON.parse(session.metadata.address);
        const cartItems = JSON.parse(session.metadata.cart);

        const items = cartItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        }));

        const printfulRes = await fetch('https://api.printful.com/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient,
            items,
            confirm: true,
            shipping: 'STANDARD',
          }),
        });

        const printfulStatus = printfulRes.status;
        const printfulData = await printfulRes.json();

        if (printfulStatus !== 200 || printfulData.code !== 200) {
          console.error('❌ Printful order failed:', printfulStatus, printfulData);
        } else {
          console.log('✅ Printful order created:', printfulData.result.id);
        }
      } catch (err) {
        console.error('❌ Error creating Printful order:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}
