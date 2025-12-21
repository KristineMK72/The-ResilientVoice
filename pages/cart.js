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
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cart]);

  function save(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function inc(sync_variant_id) {
    const next = cart.map((i) =>
      i.sync_variant_id === sync_variant_id
        ? { ...i, quantity: (Number(i.quantity) || 1) + 1 }
        : i
    );
    save(next);
  }

  function dec(sync_variant_id) {
    const next = cart.map((i) =>
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
    <div style={{ maxWidth: 920, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 14, fontSize: 34, fontWeight: 950 }}>
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <p style={{ opacity: 0.9 }}>
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 14 }}>
            {cart.map((item) => {
              const qty = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const lineTotal = price * qty;

              return (
                <div key={item.sync_variant_id} style={card}>
                  {/* LEFT: image */}
                  <div style={thumbWrap}>
                    <img
                      src={item.image || "/gritngrlogo.png"}
                      alt={item.name || "Product"}
                      style={thumb}
                      onError={(e) => {
                        e.currentTarget.src = "/gritngrlogo.png";
                      }}
                    />
                  </div>

                  {/* MIDDLE: details */}
                  <div style={{ minWidth: 0 }}>
                    <div style={titleRow}>
                      <div style={title}>{item.name || "Item"}</div>
                      <div style={linePrice}>${lineTotal.toFixed(2)}</div>
                    </div>

                    <div style={metaRow}>
                      <span style={eachPrice}>${price.toFixed(2)} each</span>
                      {/* ✅ sync_variant_id removed from UI */}
                    </div>

                    <div style={controlsRow}>
                      <div style={qtyRow}>
                        <button
                          onClick={() => dec(item.sync_variant_id)}
                          style={btnSmall}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <div style={qtyPill}>{qty}</div>
                        <button
                          onClick={() => inc(item.sync_variant_id)}
                          style={btnSmall}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.sync_variant_id)}
                        style={btnDanger}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <hr style={{ margin: "22px 0", opacity: 0.2 }} />

          <div style={totalsRow}>
            <strong style={{ fontSize: 18 }}>Subtotal</strong>
            <strong style={{ fontSize: 18 }}>${subtotal.toFixed(2)}</strong>
          </div>

          <div style={actionsRow}>
            <Link href="/" style={btnGhost}>
              Keep shopping
            </Link>

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

/* =========================
   STYLES
========================= */

const card = {
  display: "grid",
  gridTemplateColumns: "92px 1fr",
  gap: 14,
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
};

const thumbWrap = {
  width: 92,
  height: 92,
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
};

const thumb = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const titleRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const title = {
  fontWeight: 900,
  fontSize: 18,
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const linePrice = {
  fontWeight: 900,
  fontSize: 18,
  whiteSpace: "nowrap",
};

const metaRow = {
  marginTop: 8,
  opacity: 0.9,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const eachPrice = {
  opacity: 0.85,
};

const controlsRow = {
  marginTop: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const qtyRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const qtyPill = {
  minWidth: 34,
  textAlign: "center",
  fontWeight: 900,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
};

const totalsRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const actionsRow = {
  marginTop: 18,
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

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
  display: "inline-block",
};

const btnSmall = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 900,
};

const btnDanger = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(239,68,68,0.18)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};
