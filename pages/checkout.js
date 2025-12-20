// pages/checkout.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function Checkout() {
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
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const items = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(items);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cartItems]);

  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  const handleInputChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleCalculateShipping() {
    setError("");

    if (!cartItems.length) return setError("Your cart is empty.");
    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      return setError("Please fill in all required shipping fields.");
    }

    // Make sure every cart item has sync_variant_id
    const missingVariant = cartItems.find((i) => !i.sync_variant_id);
    if (missingVariant) {
      return setError(
        `Cart item is missing sync_variant_id (cannot rate shipping): ${missingVariant.name}`
      );
    }

    setCalculating(true);
    setRates([]);
    setSelectedRateId("");
    setShippingCost(0);

    try {
      const res = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Shipping calc failed:", data);
        setError(data?.error || "Could not calculate shipping.");
        return;
      }

      const newRates = data?.rates || [];
      if (!newRates.length) {
        setError("No shipping rates returned (Printful).");
        return;
      }

      setRates(newRates);

      // default select the cheapest
      const cheapest = [...newRates].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
      setSelectedRateId(String(cheapest.id));
      setShippingCost(Number(cheapest.rate) || 0);
    } catch (e) {
      console.error(e);
      setError("Could not calculate shipping. Please try again.");
    } finally {
      setCalculating(false);
    }
  }

  function onSelectRate(id) {
    setSelectedRateId(id);
    const chosen = rates.find((r) => String(r.id) === String(id));
    setShippingCost(chosen ? Number(chosen.rate) || 0 : 0);
  }

  async function handleCheckout() {
    setError("");

    if (!cartItems.length) return setError("Your cart is empty.");
    if (!selectedRateId) return setError("Please calculate shipping and select a shipping option.");
    if (!(shippingCost > 0)) return setError("Shipping cost is invalid. Recalculate shipping.");

    setCreating(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          address,
          shipping: {
            rate_id: selectedRateId,
            rate: shippingCost,
          },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Create session failed:", res.status, txt);
        setError(`Failed to create checkout session (Status ${res.status}).`);
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
      else setError("Stripe URL missing from response.");
    } catch (e) {
      console.error(e);
      setError("Failed to start checkout. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 20 }}>
      <h1>Checkout</h1>

      <p style={{ opacity: 0.85 }}>
        <Link href="/cart">← Back to cart</Link>
      </p>

      {error && (
        <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.15)", marginTop: 12 }}>
          {error}
        </div>
      )}

      <h2 style={{ marginTop: 22 }}>Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.sync_variant_id} style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
              <div>
                <strong>{item.name}</strong> × {item.quantity}
              </div>
              <div>${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</div>
            </div>
          ))}
          <hr style={{ opacity: 0.2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {shippingCost > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, marginTop: 12, fontWeight: 900 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}

      <h2 style={{ marginTop: 28 }}>Shipping Address</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} />
        <input name="address1" placeholder="Address Line 1 *" value={address.address1} onChange={handleInputChange} />
        <input name="address2" placeholder="Address Line 2" value={address.address2} onChange={handleInputChange} />
        <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input name="state_code" placeholder="State (e.g., MN) *" value={address.state_code} onChange={handleInputChange} />
          <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} />
        </div>
        <select name="country_code" value={address.country_code} onChange={handleInputChange}>
          <option value="US">United States</option>
        </select>

        <button
          type="button"
          onClick={handleCalculateShipping}
          disabled={calculating || cartItems.length === 0}
          style={btnDark}
        >
          {calculating ? "Calculating..." : "Calculate Shipping"}
        </button>

        {rates.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontWeight: 800 }}>Shipping Options</label>
            <select
              value={selectedRateId}
              onChange={(e) => onSelectRate(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 10, marginTop: 8 }}
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

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!selectedRateId || creating}
          style={btnPrimary}
        >
          {creating ? "Redirecting..." : `Pay $${total.toFixed(2)} with Stripe`}
        </button>
      </div>
    </div>
  );
}

const btnDark = {
  padding: 14,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  background: "#111827",
  color: "white",
};

const btnPrimary = {
  padding: 16,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  background: "linear-gradient(90deg, #7c3aed, #ec4899)",
  color: "white",
  marginTop: 10,
};
