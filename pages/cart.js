"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(Array.isArray(stored) ? stored : []);
  }, []);

  const persist = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  // ✅ remove by unique fulfillment key
  const removeFromCart = (syncVariantId) => {
    const updated = cart.filter((item) => item.sync_variant_id !== syncVariantId);
    persist(updated);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity) || 1;
      return sum + (Number.isFinite(price) ? price : 0) * qty;
    }, 0);
  }, [cart]);

  const checkout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Checkout session error:", data);
      alert(data?.error || "Checkout failed. Check console logs.");
      return;
    }

    window.location = data.url;
  };

  // Helper to build mockup paths using sync_product_id
  const getMockupPaths = (syncProductId) => [
    `/${syncProductId}_1.png`,
    `/${syncProductId}_2.png`,
    `/${syncProductId}_3.png`,
  ];

  if (!cart.length) {
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
        {cart.map((item) => {
          const qty = Number(item.quantity) || 1;
          const displayPrice = Number(item.price) || 0;

          // Prefer stored image; fallback to something safe
          const image = item.image || "/Logo.jpeg";

          // Use sync_product_id for local mockups (fallback to stored productId if you have it)
          const syncProductId = item.sync_product_id || item.productId || null;

          return (
            <li
              key={item.sync_variant_id || `${item.name}-${Math.random()}`}
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
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>

                  {/* Optional: show variant info if present */}
                  {item.sync_variant_id && (
                    <div style={{ fontSize: "0.95rem", color: "#777", marginTop: "0.25rem" }}>
                      Variant: {item.sync_variant_id}
                    </div>
                  )}

                  <div style={{ fontSize: "1.2rem", color: "#555", marginTop: "0.35rem" }}>
                    {qty} × {formatPrice(displayPrice)}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.sync_variant_id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #9f6baa",
                    color: "#9f6baa",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Remove
                </button>
              </div>

              {/* Main product image */}
              <div style={{ marginTop: "1rem" }}>
                <img
                  src={image}
                  alt={item.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/Logo.jpeg";
                  }}
                />
              </div>

              {/* Additional mockups (only if we have a sync_product_id) */}
              {syncProductId && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "1rem",
                  }}
                >
                  {getMockupPaths(syncProductId).map((path, index) => (
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
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
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
        ❤️ Thank you for shopping and supporting non-profits. Your purchase helps us give back!
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
