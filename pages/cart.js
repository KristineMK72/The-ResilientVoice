'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load.');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session.');
      }

      const { id: sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        alert(result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="main">
      <section className="card cart-container">
        <h1 className="cart-title">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="cart-empty">
            Your cart is empty. <a href="/shop">Continue shopping</a>
          </p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span>
                  {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                </span>
                <button
                  type="button"
                  className="cart-remove-btn"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="cart-total">Total: ${total.toFixed(2)}</p>
            <button
              type="button"
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Checkout with Stripe'}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
