"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const removeFromCart = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

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
      <div style={{ padding: "6rem", textAlign: "center" }}>
        <h1>Your Cart</h1>
        <p>No items yet — add some products!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "4rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Your Cart</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cart.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              borderBottom: "1px solid #ddd",
              paddingBottom: "1rem",
            }}
          >
            <div>
              <strong>{item.name}</strong>
              <div style={{ fontSize: "1.2rem", color: "#555" }}>
                {item.quantity} × {formatPrice(item.price)}
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                background: "transparent",
                border: "1px solid #9f6baa",
                color: "#9f6baa",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div
        style={{
          textAlign: "right",
          fontSize: "1.6rem",
          fontWeight: "bold",
          marginTop: "2rem",
        }}
      >
        Subtotal: {formatPrice(subtotal)}
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
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
          }}
        >
          Checkout with Stripe
        </button>
      </div>
    </div>
  );
}
