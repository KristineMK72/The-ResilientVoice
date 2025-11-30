// pages/cart.js ← FINAL WORKING CART (matches your product pages)
"use client";

import {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart"); // ← matches your product page
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main style={{ minHeight: "100vh", padding: "6rem 2rem", textAlign: "center", background: "#0f172a" }}>
        <h1 style={{ fontSize: "3.5rem", color: "#fff", marginBottom: "2rem" }}>Your Cart is Empty</h1>
        <Link href="/saved-by-grace" style={{ fontSize: "1.5rem", color: "#9f6baa", textDecoration: "underline" }}>
          ← Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "4rem auto", padding: "0 1rem", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "4rem", textAlign: "center", margin: "2rem 0 4rem", color: "#9f6baa" }}>
        Your Cart
      </h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 2fr 1fr",
              gap: "2rem",
              alignItems: "center",
              padding: "2rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(159,107,170,0.2)",
            }}
          >
            <div style={{ position: "relative", height: "160px", borderRadius: "12px", overflow: "hidden" }}>
              <Image src={item.image} alt={item.name} fill style={{ objectFit: "contain" }} />
            </div>

            <div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.6rem", color: "#fff" }}>{item.name}</h3>
              <p style={{ color: "#aaa", margin: 0 }}>Premium comfort fit</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ width: "40px", height: "40px", background: "#333", color: "#fff", border: "none", borderRadius: "50%", fontSize: "1.4rem" }}>-</button>
                <span style={{ fontSize: "1.6rem", minWidth: "40px", textAlign: "center", color: "#fff" }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, +1)} style={{ width: "40px", height: "40px", background: "#9f6baa", color: "#fff", border: "none", borderRadius: "50%", fontSize: "1.4rem" }}>+</button>
              </div>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f6baa", margin: "1rem 0" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => removeItem(item.id)} style={{ color: "#ff6b6b", background: "none", border: "none", fontSize: "0.95rem", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: "4rem", padding: "2.5rem", background: "rgba(159,107,170,0.15)", borderRadius: "24px", border: "2px solid #9f6baa" }}>
        <p style={{ fontSize: "2.5rem", margin: "0 0 2rem", color: "#fff" }}>
          Total: <span style={{ color: "#9f6baa", fontWeight: "900" }}>${total.toFixed(2)}</span>
        </p>
        <button
          style={{
            padding: "1.4rem 3rem",
            background: "#9f6baa",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "1.6rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => alert("Checkout coming soon!")}
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}
