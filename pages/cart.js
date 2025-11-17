// pages/cart.js — BEAUTIFUL + FULLY WORKING
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const updateQuantity = (id, newQty) => {
    if (newQty === 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const { id: sessionId } = await res.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  if (cart.length === 0) {
    return (
      <main style={{ padding: "6rem 2rem", textAlign: "center", minHeight: "60vh" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Your cart is empty</h1>
        <p style={{ fontSize: "1.4rem", color: "#666", marginBottom: "2rem" }}>
          But your story is just beginning.
        </p>
        <Link href="/shop" style={{ padding: "1rem 2.5rem", background: "#9f6baa", color: "white", borderRadius: "50px", fontSize: "1.3rem", textDecoration: "none" }}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "3.5rem", textAlign: "center", marginBottom: "2rem" }}>
        Your Resilient Pieces
      </h1>
      <div style={{ background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 30px rgba(159,107,170,0.1)" }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 150px", gap: "1.5rem", padding: "1.5rem 0", borderBottom: "1px solid #eee" }}>
            <Image src={item.image || "https://files.cdn.printful.com/products/71/71_1723145678.jpg"} alt={item.name} width={100} height={100} style={{ borderRadius: "12px", objectFit: "cover" }} />
            <div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>{item.name}</h3>
              <p style={{ color: "#9f6baa", fontWeight: "bold" }}>${item.price.toFixed(2)} each</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: "32px", height: "32px", border: "1px solid #ddd", background: "white", borderRadius: "8px" }}>-</button>
                <span style={{ minWidth: "30px", textAlign: "center", fontWeight: "bold" }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: "32px", height: "32px", border: "1px solid #ddd", background: "white", borderRadius: "8px" }}>+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ color: "#c66", fontSize: "0.9rem", background: "none", border: "none", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "2rem", textAlign: "right", fontSize: "1.8rem", fontWeight: "bold", color: "#9f6baa" }}>
          Total: ${total}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button onClick={handleCheckout} disabled={loading} style={{ padding: "1.2rem 3rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "50px", fontSize: "1.4rem" }}>
            {loading ? "Processing..." : "Checkout Securely with Stripe"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}>
          Every purchase carries your story forward.
        </p>
      </div>
    </main>
  );
}
