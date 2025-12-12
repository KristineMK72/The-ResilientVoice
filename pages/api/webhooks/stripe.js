// pages/api/webhooks/stripe.js
import Stripe from 'stripe';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status === 'paid') {
      const { address, cart } = session.metadata;

      const recipient = JSON.parse(address);
      const items = JSON.parse(cart).map(item => ({
        variant_id: item.variant_id, // must exist in your cart data
        quantity: item.quantity,
      }));

      try {
        const printfulRes = await fetch('https://api.printful.com/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient,
            items,
            confirm: true,
            shipping: 'STANDARD',
          }),
        });

        const printfulData = await printfulRes.json();

        if (printfulData.code !== 200) {
          console.error('Printful order creation failed:', printfulData);
          // Optional: send yourself an email or log to Slack
        } else {
          console.log('Printful order created:', printfulData.result.id);
          // Optional: save order ID to your database
        }
      } catch (err) {
        console.error('Error creating Printful order:', err);
      }
    }
  }

  res.status(200).end();
}
