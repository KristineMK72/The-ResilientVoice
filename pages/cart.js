//pages/cart.js
"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const checkout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });

    const { url } = await res.json();
    window.location = url;
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Your Cart</h1>
        <p>No items yet — add some products!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Your Cart</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cart.map((item) => (
          <li key={item.id} style={{ marginBottom: "2rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
            <strong>{item.name}</strong> — {item.quantity} × ${item.price}
          </li>
        ))}
      </ul>

      <button
        onClick={checkout}
        style={{
          padding: "1.6rem 4rem",
          background: "linear-gradient(135deg, #9f6baa, #c084fc)",
          color: "white",
          border: "none",
          borderRadius: "20px",
          fontSize: "1.8rem",
          fontWeight: "900",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(159,107,170,0.4)",
          marginTop: "3rem",
        }}
      >
        Checkout with Stripe
      </button>
    </div>
  );
}
