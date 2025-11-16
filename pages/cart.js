'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    }
    return [];
  });

  const removeFromCart = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert('Stripe failed to load. Please refresh the page.');
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const { id } = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId: id });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <main className="main">
      <section className="card cart-container">
        <h1 className="cart-title">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty. <a href="/shop">Continue shopping</a></p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span>
                  {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                </span>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))}
            <p className="cart-total">Total: ${total.toFixed(2)}</p>
            <button className="cart-checkout-btn" onClick={handleCheckout}>Checkout with Stripe</button>
          </>
        )}
      </section>
    </main>
  );
}
