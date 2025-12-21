// pages/checkout.js
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function money(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

export default function Checkout() {
  // ----------------------------
  // State
  // ----------------------------
  const [cartItems, setCartItems] = useState([]);

  const [address, setAddress] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state_code: "",
    country_code: "US",
    zip: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  const [calculating, setCalculating] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // Derived totals
  // ----------------------------
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    const ship = Number(shippingCost || 0);
    return subtotal + (Number.isFinite(ship) ? ship : 0);
  }, [subtotal, shippingCost]);

  const selectedRate = useMemo(() => {
    if (!selectedRateId) return null;
    return rates.find((r) => String(r.id) === String(selectedRateId)) || null;
  }, [rates, selectedRateId]);

  // ----------------------------
  // Initial load: cart
  // ----------------------------
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const items = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(Array.isArray(items) ? items : []);
  }, []);

  // ----------------------------
  // Input change handler
  // ----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------------
  // Shipping calculation
  // ----------------------------
  const handleCalculateShipping = async () => {
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      setError("Please fill in all required shipping fields.");
      return;
    }

    const missingVariant = cartItems.find((i) => !i.sync_variant_id);
    if (missingVariant) {
      setError("A cart item is missing Printful variant info. Please remove it and re-add that product.");
      return;
    }

    setCalculating(true);

    try {
      const res = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Shipping API error:", data);
        setError(data?.error || "Shipping calculation failed.");
        setRates([]);
        setSelectedRateId("");
        setShippingCost(0);
        return;
      }

      const newRates = Array.isArray(data?.rates) ? data.rates : [];
      if (!newRates.length) {
        setError("No shipping rates available for this address.");
        setRates([]);
        setSelectedRateId("");
        setShippingCost(0);
        return;
      }

      setRates(newRates);

      const first = newRates[0];
      setSelectedRateId(String(first.id));
      setShippingCost(Number(first.rate) || 0);
    } catch (err) {
      console.error("Shipping calculation failed:", err);
      setError("Could not calculate shipping. Please try again.");
      setRates([]);
      setSelectedRateId("");
      setShippingCost(0);
    } finally {
      setCalculating(false);
    }
  };

  const handleRateChange = (e) => {
    const id = e.target.value;
    setSelectedRateId(id);

    const r = rates.find((x) => String(x.id) === String(id));
    const cost = r ? Number(r.rate) : 0;
    setShippingCost(Number.isFinite(cost) ? cost : 0);
  };

  // ----------------------------
  // Start Stripe Checkout
  // ----------------------------
  const handleCheckout = async () => {
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedRateId || !selectedRate) {
      setError("Please calculate shipping and choose a shipping option.");
      return;
    }

    const ship = Number(selectedRate.rate);
    if (!Number.isFinite(ship) || ship <= 0) {
      setError("Shipping cost missing/invalid. Please calculate and select an option first.");
      return;
    }

    setStartingCheckout(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          address,
          shippingRate: selectedRate,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Create checkout session failed:", res.status, errorText);
        try {
          const parsed = JSON.parse(errorText);
          setError(parsed?.error || `Failed to create checkout session (Status ${res.status}).`);
        } catch {
          setError(`Failed to create checkout session (Status ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else setError("Could not get Stripe URL from server.");
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to start checkout. Please try again.");
    } finally {
      setStartingCheckout(false);
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <h1 style={styles.h1}>Checkout</h1>
          <Link href="/cart" style={styles.backLink}>
            ← Back to Cart
          </Link>
        </div>

        {/* Order */}
        <h2 style={styles.h2}>Your Order</h2>

        {cartItems.length === 0 ? (
          <p style={styles.p}>
            Your cart is empty. <Link href="/">Go shopping</Link>
          </p>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
              {cartItems.map((item, idx) => {
                const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
                return (
                  <div key={`${item.sync_variant_id || item.id || idx}`} style={styles.itemRow}>
                    <div style={styles.imgBox}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || "Product"}
                          width={92}
                          height={92}
                          style={{ borderRadius: 14, objectFit: "cover" }}
                        />
                      ) : (
                        <div style={styles.imgPlaceholder}>No image</div>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemMeta}>
                        Qty: {Number(item.quantity || 1)} • ${money(item.price)} each
                      </div>
                    </div>

                    <div style={styles.itemTotal}>${money(lineTotal)}</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.hr} />

            <div style={styles.totalsRow}>
              <span>Subtotal</span>
              <span>${money(subtotal)}</span>
            </div>

            <div style={styles.totalsRow}>
              <span>Shipping</span>
              <span>{shippingCost > 0 ? `$${money(shippingCost)}` : "—"}</span>
            </div>

            <div style={{ ...styles.totalsRow, fontSize: 18, fontWeight: 900 }}>
              <span>Total</span>
              <span>${money(total)}</span>
            </div>
          </>
        )}

        {/* Shipping */}
        <h2 style={{ ...styles.h2, marginTop: 22 }}>Shipping Address</h2>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        <div style={styles.formGrid}>
          <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} style={styles.input} />
          <input name="address1" placeholder="Address Line 1 *" value={address.address1} onChange={handleInputChange} style={styles.input} />
          <input name="address2" placeholder="Address Line 2" value={address.address2} onChange={handleInputChange} style={styles.input} />
          <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} style={styles.input} />

          <div style={styles.twoCol}>
            <input name="state_code" placeholder="State (e.g., MN) *" value={address.state_code} onChange={handleInputChange} style={styles.input} />
            <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} style={styles.input} />
          </div>

          <select name="country_code" value={address.country_code} onChange={handleInputChange} style={styles.input}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>

          <button
            type="button"
            onClick={handleCalculateShipping}
            disabled={calculating || cartItems.length === 0}
            style={{ ...styles.primaryBtn, opacity: calculating ? 0.7 : 1 }}
          >
            {calculating ? "Calculating..." : "Calculate Shipping"}
          </button>

          {rates.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <label style={styles.label}>Shipping option</label>
              <select value={selectedRateId} onChange={handleRateChange} style={styles.input}>
                {rates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — ${Number(r.rate).toFixed(2)}
                    {r.minDays && r.maxDays ? ` (${r.minDays}-${r.maxDays} days)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!selectedRate || startingCheckout || cartItems.length === 0}
            style={{ ...styles.checkoutBtn, opacity: !selectedRate || startingCheckout ? 0.7 : 1 }}
          >
            {startingCheckout ? "Starting Stripe..." : `Pay $${money(total)} with Stripe`}
          </button>

          <div style={styles.safeNote}>
            By clicking “Pay”, you’ll be redirected to Stripe to complete your purchase securely.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px 14px",
    background: "radial-gradient(circle at top, #0b1220 0%, #000 70%)",
    color: "white",
    display: "grid",
    placeItems: "start center",
  },
  card: {
    width: "100%",
    maxWidth: 780,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 20px 80px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
  },
  topRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  backLink: {
    textDecoration: "none",
    fontWeight: 800,
    color: "rgba(255,255,255,0.85)",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
  },
  h1: { margin: 0, fontSize: 28, fontWeight: 900 },
  h2: { margin: "16px 0 10px", fontSize: 18, fontWeight: 800 },
  p: { opacity: 0.9 },

  itemRow: {
    display: "grid",
    gridTemplateColumns: "92px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
  },
  imgBox: { width: 92, height: 92, borderRadius: 14, overflow: "hidden" },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 800,
    fontSize: 12,
  },
  itemName: {
    fontWeight: 900,
    fontSize: 16,
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemMeta: { opacity: 0.8, fontSize: 13, marginTop: 6 },
  itemTotal: { fontWeight: 900, fontSize: 16 },

  hr: { height: 1, background: "rgba(255,255,255,0.10)", margin: "12px 0" },
  totalsRow: { display: "flex", justifyContent: "space-between", padding: "6px 0" },

  errorBox: {
    margin: "10px 0 12px",
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,0,0,0.14)",
    border: "1px solid rgba(255,0,0,0.35)",
    color: "#ffd6d6",
    fontWeight: 700,
  },

  formGrid: { display: "grid", gap: 12 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    outline: "none",
    fontSize: 16,
  },
  label: { display: "block", marginBottom: 6, fontWeight: 800, opacity: 0.9 },

  primaryBtn: {
    padding: "14px",
    borderRadius: 14,
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  },
  checkoutBtn: {
    padding: "16px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
    color: "white",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 6,
  },
  safeNote: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 1.4,
  },
};
