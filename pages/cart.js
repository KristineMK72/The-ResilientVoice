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

  // Helper to build mockup paths
  const getMockupPaths = (id) => [
    `/${id}_1.png`,
    `/${id}_2.png`,
    `/${id}_3.png`,
  ];

  return (
    <div style={{ padding: "4rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Your Cart</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cart.map((item) => (
          <li
            key={item.id}
            style={{
              marginBottom: "2rem",
              borderBottom: "1px solid #ddd",
              paddingBottom: "1.5rem",
            }}
          >
            {/* Product info row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
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
            </div>

            {/* Main product image */}
            <div style={{ marginTop: "1rem" }}>
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              />
            </div>

            {/* Additional mockups */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "1rem",
              }}
            >
              {getMockupPaths(item.productId || item.id).map((path, index) => (
                <img
                  key={index}
                  src={path}
                  alt={`${item.name} mockup ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"; // hide if file doesn’t exist
                  }}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Subtotal */}
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

      {/* Thank you message */}
      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "1.4rem",
          color: "#444",
          fontWeight: "500",
        }}
      >
        ❤️ Thank you for shopping and supporting non‑profits.  
        Your purchase helps us give back!
      </div>

      {/* Checkout button */}
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
