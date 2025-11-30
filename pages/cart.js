// pages/cart.js ← FINAL ULTIMATE CART PAGE (2025 Edition)
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Load cart only on client (prevents hydration mismatch)
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Auto-save cart whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0) // auto-remove if reaches 0
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!isClient) {
    return (
      <main style={{ minHeight: "100vh", background: "#0f172a", display: "grid", placeItems: "center" }}>
        <p style={{ color: "#9f6baa", fontSize: "1.5rem" }}>Loading cart...</p>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main style={{ minHeight: "100vh", padding: "8rem 2rem", textAlign: "center", background: "#0f172a" }}>
        <h1 style={{ fontSize: "4rem", color: "#fff", marginBottom: "2rem", fontWeight: "900" }}>
          Your Cart is Empty
        </h1>
        <Link
          href="/saved-by-grace"
          style={{
            fontSize: "1.6rem",
            color: "#9f6baa",
            textDecoration: "underline",
            fontWeight: "600"
          }}
        >
          ← Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1rem", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "4.5rem", textAlign: "center", margin: "2rem 0 4rem", color: "#9f6baa", fontWeight: "900" }}>
        Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 2fr 1.2fr",
              gap: "2rem",
              alignItems: "center",
              padding: "2rem",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "24px",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(159,107,170,0.25)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ position: "relative", height: "180px", borderRadius: "16px", overflow: "hidden", background: "#111" }}>
              <Image
                src={item.image || "/Logo.jpeg"}
                alt={item.name}
                fill
                style={{ objectFit: "contain", padding: "1rem" }}
                sizes="(max-width: 768px) 100vw, 140px"
              />
            </div>

            <div>
              <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.9rem", color: "#fff", fontWeight: "700" }}>
                {item.name}
              </h3>
              <p style={{ color: "#aaa", margin: 0, fontSize: "1.1rem" }}>
                Premium comfort fit • Patriotic collection
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  style={{ width: "44px", height: "44px", background: "#333", color: "#fff", border: "none", borderRadius: "50%", fontSize: "1.6rem", fontWeight: "bold" }}
                >
                  −
                </button>
                <span style={{ fontSize: "1.8rem", minWidth: "50px", textAlign: "center", color: "#9f6baa", fontWeight: "900" }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, +1)}
                  style={{ width: "44px", height: "44px", background: "#9f6baa", color: "#fff", border: "none", borderRadius: "50%", fontSize: "1.6rem", fontWeight: "bold" }}
                >
                  +
                </button>
              </div>

              <p style={{ fontSize: "2.4rem", fontWeight: "900", color: "#9f6baa", margin: "1rem 0" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                style={{ color: "#ff6b6b", background: "none", border: "none", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total & Checkout */}
      <div style={{ textAlign: "right", marginTop: "5rem", padding: "3rem", background: "rgba(159,107,170,0.18)", borderRadius: "28px", border: "2px solid #9f6baa", backdropFilter: "blur(10px)" }}>
        <p style={{ fontSize: "3.2rem", margin: "0 0 2.5rem", color: "#fff" }}>
          Total: <span style={{ color: "#9f6baa", fontWeight: "900" }}>${total}</span>
        </p>

        <button
          style={{
            padding: "1.6rem 4rem",
            background: "linear-gradient(135deg, #9f6baa, #c084fc)",
            color: "white",
            border: "none",
            borderRadius: "20px",
            fontSize: "1.8rem",
            fontWeight: "900",
            cursor: "not-allowed",
            opacity: 0.7,
            boxShadow: "0 10px 30px rgba(159,107,170,0.4)",
          }}
          disabled
          title="Stripe checkout launching soon!"
        >
          Checkout Coming Soon
        </button>

        <div style={{ marginTop: "2rem" }}>
          <Link href="/saved-by-grace" style={{ color: "#aaa", fontSize: "1.2rem" }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
