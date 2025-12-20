// pages/cart.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    setCart(saved ? JSON.parse(saved) : []);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }, [cart]);

  function save(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function inc(sync_variant_id) {
    const next = cart.map((i) =>
      i.sync_variant_id === sync_variant_id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i
    );
    save(next);
  }

  function dec(sync_variant_id) {
    const next = cart
      .map((i) =>
        i.sync_variant_id === sync_variant_id
          ? { ...i, quantity: Math.max(1, (Number(i.quantity) || 1) - 1) }
          : i
      );
    save(next);
  }

  function remove(sync_variant_id) {
    const next = cart.filter((i) => i.sync_variant_id !== sync_variant_id);
    save(next);
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 10 }}>Your Cart</h1>

      {cart.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 14 }}>
            {cart.map((item) => (
              <div
                key={item.sync_variant_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{item.name}</div>
                  <div style={{ opacity: 0.85, marginTop: 6 }}>
                    ${Number(item.price || 0).toFixed(2)} each
                  </div>

                  {/* Useful debug (optional): */}
                  <div style={{ opacity: 0.65, marginTop: 6, fontSize: 12 }}>
                    sync_variant_id: {String(item.sync_variant_id || "")}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                  <div style={{ fontWeight: 800 }}>
                    ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => dec(item.sync_variant_id)} style={btnSmall}>
                      −
                    </button>
                    <div style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>
                      {Number(item.quantity || 1)}
                    </div>
                    <button onClick={() => inc(item.sync_variant_id)} style={btnSmall}>
                      +
                    </button>
                  </div>

                  <button onClick={() => remove(item.sync_variant_id)} style={btnDanger}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ margin: "22px 0", opacity: 0.2 }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
            <strong>Subtotal</strong>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/">
              <a style={btnGhost}>Keep shopping</a>
            </Link>

            {/* ✅ IMPORTANT: cart NEVER goes to Stripe */}
            <button
              onClick={() => (window.location.href = "/checkout")}
              style={btnPrimary}
            >
              Go to Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const btnPrimary = {
  padding: "14px 18px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  background: "linear-gradient(90deg, #7c3aed, #ec4899)",
  color: "white",
};

const btnGhost = {
  padding: "14px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "white",
  fontWeight: 800,
  textDecoration: "none",
};

const btnSmall = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 800,
};

const btnDanger = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(239,68,68,0.18)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};
