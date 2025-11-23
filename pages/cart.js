// pages/cart.js
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "../components/CheckoutButton";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // This reads the exact same key we saved in the product page
    const saved = localStorage.getItem("resilientvoice_cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  const updateQuantity = (index, newQty) => {
    if (newQty === 0) {
      removeItem(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
    localStorage.setItem("resilientvoice_cart", JSON.stringify(updated));
  };

  const removeItem = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("resilientvoice_cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main style={{ padding: "6rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Your Cart is Empty</h1>
        <Link href="/shop" style={{ color: "#6b46c1", fontSize: "1.3rem" }}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "3.5rem", textAlign: "center", marginBottom: "3rem" }}>Your Cart</h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        {cart.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "2rem", alignItems: "center", padding: "1.5rem", background: "#f9f5fb", borderRadius: "16px" }}>
            <div style={{ position: "relative", height: "180px" }}>
              <Image src={item.image || "/fallback.png"} alt={item.name} fill style={{ objectFit: "contain" }} />
            </div>

            <div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>{item.name}</h3>
              <p style={{ margin: 0, color: "#666" }}>Size: {item.size}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => updateQuantity(i, item.quantity - 1)} style={{ padding: "0.5rem 1rem" }}>-</button>
                <span style={{ margin: "0 1rem", fontSize: "1.3rem" }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(i, item.quantity + 1)} style={{ padding: "0.5rem 1rem" }}>+</button>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#6b46c1" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => removeItem(i)} style={{ color: "#c33", fontSize: "0.9rem" }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: "3rem", padding: "2rem", background: "#f3e8ff", borderRadius: "16px" }}>
        <p style={{ fontSize: "2rem", margin: "0 0 1.5rem" }}>
          Total: <strong style={{ color: "#6b46c1" }}>${total.toFixed(2)}</strong>
        </p>
        <CheckoutButton cartItems={cart} />
      </div>
    </main>
  );
}
