// pages/checkout.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  // ---------------------------
  // State
  // ---------------------------
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

  const [rates, setRates] = useState([]); // Printful rates list
  const [selectedRateId, setSelectedRateId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingName, setShippingName] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------
  // Load cart on mount
  // ---------------------------
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      const items = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  // ---------------------------
  // Helpers
  // ---------------------------
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const total = useMemo(() => {
    return subtotal + Number(shippingCost || 0);
  }, [subtotal, shippingCost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));

    // If user changes address, invalidate old shipping selection
    if (["address1", "address2", "city", "state_code", "zip", "country_code"].includes(name)) {
      setRates([]);
      setSelectedRateId("");
      setShippingCost(0);
      setShippingName("");
    }
  };

  const validateForShipping = () => {
    if (!cartItems.length) return "Your cart is empty.";
    if (!address.name) return "Full name is required.";
    if (!address.address1) return "Address Line 1 is required.";
    if (!address.city) return "City is required.";
    if (!address.state_code) return "State is required.";
    if (!address.zip) return "ZIP code is required.";
    if (!address.country_code) return "Country is required.";
    return "";
  };

  // ---------------------------
  // 1) Calculate shipping rates
  // ---------------------------
  const handleCalculateShipping = async () => {
    const msg = validateForShipping();
    if (msg) {
      setError(msg);
      return;
    }

    setCalculating(true);
    setError("");
    setRates([]);
    setSelectedRateId("");
    setShippingCost(0);
    setShippingName("");

    try {
      const res = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems, address }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        console.error("Shipping API error:", data);
        setError(data?.error || "Could not calculate shipping.");
        return;
      }

      const list = Array.isArray(data?.rates) ? data.rates : [];
      if (!list.length) {
        setError("No shipping options returned. Try another address or item.");
        return;
      }

      // Save rates
      setRates(list);

      // Auto-select cheapest
      const cheapest = list.reduce((best, r) => {
        const rate = Number(r.rate);
        if (!Number.isFinite(rate)) return best;
        if (!best) return r;
        return Number(best.rate) <= rate ? best : r;
      }, null);

      if (cheapest) {
        setSelectedRateId(String(cheapest.id));
        setShippingCost(Number(cheapest.rate));
        setShippingName(String(cheapest.name || "Shipping"));
      }
    } catch (err) {
      console.error("Shipping API call failed:", err);
      setError("Could not calculate shipping. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  const onSelectRate = (rateId) => {
    setSelectedRateId(rateId);
    const chosen = rates.find((r) => String(r.id) === String(rateId));
    if (!chosen) return;

    const amount = Number(chosen.rate);
    setShippingCost(Number.isFinite(amount) ? amount : 0);
    setShippingName(String(chosen.name || "Shipping"));
  };

  // ---------------------------
  // 2) Create checkout session
  // ---------------------------
  const handleCheckout = async () => {
    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!selectedRateId || shippingCost <= 0) {
      setError("Shipping cost missing/invalid. Please calculate shipping and select an option first.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          address,
          shippingCost,
          shippingName,
          selectedRateId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create checkout session failed:", res.status, text);
        setError(`Failed to create checkout session (Status ${res.status}).`);
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("Could not get Stripe checkout URL.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to start checkout. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ maxWidth: 720, margin: "30px auto", padding: 16, color: "white" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 10 }}>Checkout</h1>

      {/* Order summary */}
      <div style={{ background: "rgba(0,0,0,0.35)", padding: 16, borderRadius: 16, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Order Summary</h2>

        {cartItems.length === 0 ? (
          <p>
            Your cart is empty. <Link href="/">Go shopping</Link>
          </p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.sync_variant_id || item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ maxWidth: 460 }}>
                  <strong>{item.name}</strong> × {item.quantity}
                </div>
                <div>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
              </div>
            ))}

            <hr style={{ opacity: 0.25 }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {shippingCost > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span>Shipping ({shippingName || "Selected"})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: "1.4rem", fontWeight: 900 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Shipping form */}
      <div style={{ background: "rgba(0,0,0,0.35)", padding: 16, borderRadius: 16 }}>
        <h2 style={{ marginTop: 0 }}>Shipping Address</h2>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.45)", padding: 12, borderRadius: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} style={inputStyle} />
          <input name="address1" placeholder="Address Line 1 *" value={address.address1} onChange={handleInputChange} style={inputStyle} />
          <input name="address2" placeholder="Address Line 2" value={address.address2} onChange={handleInputChange} style={inputStyle} />
          <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} style={inputStyle} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input name="state_code" placeholder="State (e.g., NY) *" value={address.state_code} onChange={handleInputChange} style={inputStyle} />
            <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} style={inputStyle} />
          </div>

          <select name="country_code" value={address.country_code} onChange={handleInputChange} style={inputStyle}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>

          {/* Calculate */}
          <button
            type="button"
            onClick={handleCalculateShipping}
            disabled={calculating || cartItems.length === 0}
            style={buttonDark}
          >
            {calculating ? "Calculating..." : "Calculate Shipping"}
          </button>

          {/* Shipping options */}
          {rates.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <label style={{ fontWeight: 900, display: "block", marginBottom: 8 }}>
                Select Shipping Option
              </label>
              <select
                value={selectedRateId}
                onChange={(e) => onSelectRate(e.target.value)}
                style={inputStyle}
              >
                {rates.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name} — ${Number(r.rate).toFixed(2)}
                    {r.minDays != null && r.maxDays != null ? ` (${r.minDays}-${r.maxDays} days)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pay */}
          {selectedRateId && shippingCost > 0 && (
            <button type="button" onClick={handleCheckout} disabled={creating} style={buttonPay}>
              {creating ? "Redirecting..." : `Pay $${total.toFixed(2)} with Stripe`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Styles
// ---------------------------
const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.18)",
  outline: "none",
  fontSize: "1rem",
};

const buttonDark = {
  padding: "14px",
  background: "#111827",
  color: "#fff",
  border: "none",
  fontSize: "1.1em",
  cursor: "pointer",
  marginTop: "8px",
  borderRadius: "12px",
  width: "100%",
  fontWeight: 800,
};

const buttonPay = {
  padding: "16px",
  background: "linear-gradient(90deg, #7c3aed, #ec4899)",
  color: "#fff",
  border: "none",
  fontSize: "1.25em",
  cursor: "pointer",
  marginTop: "14px",
  borderRadius: "14px",
  width: "100%",
  fontWeight: 900,
};
