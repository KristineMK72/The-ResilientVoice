// pages/cart.js
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  // Load cart
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id, amount) => {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal.toFixed(2);

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "6rem" }}>
        <h1 style={{ fontSize: "2.4rem" }}>Your cart is empty 💜</h1>
        <Link href="/">
          <button style={{
            marginTop: "2rem",
            padding: "1rem 1.8rem",
            background: "#9f6baa",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.2rem",
            cursor: "pointer"
          }}>
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "4rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2.8rem", marginBottom: "2rem" }}>Your Cart</h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        {cart.map(item => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              gap: "1.5rem",
              alignItems: "center",
              padding: "1.5rem",
              borderRadius: "16px",
              border: "1px solid #eee",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
              background: "white"
            }}
          >
            {/* IMAGE */}
            <Image
              src={item.image}
              alt={item.name}
              width={120}
              height={120}
              style={{ borderRadius: "12px", objectFit: "cover" }}
            />

            {/* DETAILS */}
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>
                {item.name}
              </h2>

              <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#9f6baa" }}>
                ${item.price}
              </p>

              {/* QUANTITY BUTTONS */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  style={qtyBtn}
                >
                  -
                </button>
                <span style={{ fontSize: "1.2rem", padding: "0 .75rem" }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  style={qtyBtn}
                >
                  +
                </button>
              </div>
            </div>

            {/* REMOVE */}
            <button
              onClick={() => removeItem(item.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#d33",
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* TOTALS */}
      <div style={{
        marginTop: "3rem",
        padding: "2rem",
        border: "1px solid #eee",
        borderRadius: "16px",
        background: "white",
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Order Summary</h2>

        <p style={{ fontSize: "1.2rem", marginBottom: ".5rem" }}>
          Subtotal: <strong>${total}</strong>
        </p>

        <p style={{ fontSize: "1rem", color: "#666" }}>
          Shipping & tax calculated at checkout.
        </p>

        <button
          onClick={() => alert("Stripe checkout coming next!")}
          style={{
            width: "100%",
            padding: "1.2rem",
            background: "#9f6baa",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.3rem",
            marginTop: "2rem",
            cursor: "pointer"
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

// STYLE SHARED
const qtyBtn = {
  padding: ".5rem .9rem",
  background: "#eee",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1.1rem"
};
