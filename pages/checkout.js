// pages/checkout.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

    // required fields
    if (
      !address.name ||
      !address.address1 ||
      !address.city ||
      !address.state_code ||
      !address.zip
    ) {
      setError("Please fill in all required shipping fields.");
      return;
    }

    // Ensure cart has sync_variant_id (Printful rating needs it)
    const missingVariant = cartItems.find((i) => !i.sync_variant_id);
    if (missingVariant) {
      setError(
        "A cart item is missing sync_variant_id (Printful variant). Please re-add the product."
      );
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

      // Save rates
      setRates(newRates);

      // Default-select first rate
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

  // When user changes shipping option, update cost
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
      setError("Shipping cost missing/invalid. Please calculate and select an option first.");
      return;
    }

    // Basic sanity
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
          shippingRate: selectedRate, // ✅ send the whole object
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Create checkout session failed:", res.status, errorText);
        // try parse
        try {
          const parsed = JSON.parse(errorText);
          setError(parsed?.error || `Failed to create checkout session (Status ${res.status}).`);
        } catch {
          setError(`Failed to create checkout session (Status ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("Could not get Stripe URL from server.");
      }
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
        <h1 style={styles.h1}>Checkout</h1>

        {/* Cart Summary */}
        <h2 style={styles.h2}>Your Order</h2>

        {cartItems.length === 0 ? (
          <p style={styles.p}>
            Your cart is empty. <Link href="/">Go shopping</Link>
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              {cartItems.map((item, idx) => (
                <div key={`${item.sync_variant_id || item.id || idx}`} style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>
                      Qty: {Number(item.quantity || 1)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.hr} />

            <div style={styles.totalsRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div style={styles.totalsRow}>
              <span>Shipping</span>
              <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "—"}</span>
            </div>

            <div style={{ ...styles.totalsRow, fontSize: 18, fontWeight: 900 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Shipping */}
        <h2 style={{ ...styles.h2, marginTop: 22 }}>Shipping Address</h2>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        <div style={styles.formGrid}>
          <input
            name="name"
            placeholder="Full Name *"
            value={address.name}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            name="address1"
            placeholder="Address Line 1 *"
            value={address.address1}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            name="address2"
            placeholder="Address Line 2"
            value={address.address2}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            name="city"
            placeholder="City *"
            value={address.city}
            onChange={handleInputChange}
            style={styles.input}
          />

          <div style={styles.twoCol}>
            <input
              name="state_code"
              placeholder="State (e.g., MN) *"
              value={address.state_code}
              onChange={handleInputChange}
              style={styles.input}
            />
            <input
              name="zip"
              placeholder="ZIP Code *"
              value={address.zip}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <select
            name="country_code"
            value={address.country_code}
            onChange={handleInputChange}
            style={styles.input}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>

          <button
            type="button"
            onClick={handleCalculateShipping}
            disabled={calculating || cartItems.length === 0}
            style={{
              ...styles.primaryBtn,
              opacity: calculating ? 0.7 : 1,
            }}
          >
            {calculating ? "Calculating..." : "Calculate Shipping"}
          </button>

          {/* Shipping Options Dropdown */}
          {rates.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <label style={styles.label}>Shipping option</label>
              <select
                value={selectedRateId}
                onChange={handleRateChange}
                style={styles.input}
              >
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
            style={{
              ...styles.checkoutBtn,
              opacity: !selectedRate || startingCheckout ? 0.7 : 1,
            }}
          >
            {startingCheckout ? "Starting Stripe..." : `Pay $${total.toFixed(2)} with Stripe`}
          </button>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
            Tip: If shipping fails, it usually means a cart item is missing <b>sync_variant_id</b>.
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
    maxWidth: 720,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 20px 80px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
  },
  h1: { margin: 0, fontSize: 28, fontWeight: 900 },
  h2: { margin: "16px 0 10px", fontSize: 18, fontWeight: 800 },
  p: { opacity: 0.9 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  hr: {
    height: 1,
    background: "rgba(255,255,255,0.10)",
    margin: "12px 0",
  },
  totalsRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  errorBox: {
    margin: "10px 0 12px",
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,0,0,0.14)",
    border: "1px solid rgba(255,0,0,0.35)",
    color: "#ffd6d6",
    fontWeight: 600,
  },
  formGrid: {
    display: "grid",
    gap: 12,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
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
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 700,
    opacity: 0.9,
  },
  primaryBtn: {
    padding: "14px",
    borderRadius: 14,
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    fontSize: 16,
    fontWeight: 800,
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
};
