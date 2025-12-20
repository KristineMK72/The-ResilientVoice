// pages/checkout.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "selected_shipping_rate_v1";

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
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  // Load cart + previously selected shipping (important for mobile refresh)
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    setCartItems(savedCart ? JSON.parse(savedCart) : []);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) setSelectedRateId(parsed.id);
        if (parsed?.address) setAddress((a) => ({ ...a, ...parsed.address }));
      } catch {}
    }
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  const selectedRate = useMemo(() => {
    if (!selectedRateId) return null;
    return rates.find((r) => String(r.id) === String(selectedRateId)) || null;
  }, [rates, selectedRateId]);

  const shippingCost = selectedRate?.rate ? Number(selectedRate.rate) : 0;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculateShipping = async () => {
    setError("");
    setRates([]);
    setSelectedRateId("");

    if (!cartItems.length) {
      setError("Your cart is empty");
      return;
    }

    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      setError("Please fill in all required shipping fields");
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
        console.error("Shipping rates error:", data);
        setError(data?.error || "Could not calculate shipping");
        return;
      }

      const list = Array.isArray(data.rates) ? data.rates : [];
      if (!list.length) {
        setError("No shipping rates returned. Try a different address or cart.");
        return;
      }

      setRates(list);

      // Auto-select the cheapest rate
      const cheapest = [...list].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
      setSelectedRateId(String(cheapest.id));

      // Persist to survive refresh (mobile)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          id: String(cheapest.id),
          address,
        })
      );
    } catch (e) {
      console.error(e);
      setError("Could not calculate shipping. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  const handleChooseRate = (id) => {
    setSelectedRateId(String(id));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        id: String(id),
        address,
      })
    );
  };

  const handleCheckout = async () => {
    setError("");

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedRate || !Number.isFinite(shippingCost) || shippingCost <= 0) {
      alert("Shipping cost missing/invalid. Please calculate shipping and select an option first.");
      return;
    }

    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      alert("Please fill in all shipping fields before checking out.");
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          address,
          shipping: {
            id: selectedRate.id,
            name: selectedRate.name,
            rate: shippingCost,
            currency: selectedRate.currency || "USD",
          },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Create checkout session failed:", res.status, txt);
        setError(`Checkout failed (Status ${res.status}). Check console logs.`);
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
      else setError("No Stripe checkout URL returned.");
    } catch (e) {
      console.error(e);
      setError("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 20 }}>
      <h1>Checkout</h1>

      <h2>Your Order Summary</h2>
      {!cartItems.length ? (
        <p>
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.sync_variant_id || item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <strong>{item.name}</strong> × {item.quantity}
              </div>
              <div>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {selectedRate && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping: {selectedRate.name}</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3em", marginTop: 14 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}

      <h2 style={{ marginTop: 28 }}>Shipping Address</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} />
        <input name="address1" placeholder="Address Line 1 *" value={address.address1} onChange={handleInputChange} />
        <input name="address2" placeholder="Address Line 2" value={address.address2} onChange={handleInputChange} />
        <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input name="state_code" placeholder="State (e.g., MN) *" value={address.state_code} onChange={handleInputChange} />
          <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} />
        </div>

        <button
          type="button"
          onClick={handleCalculateShipping}
          disabled={calculating || !cartItems.length}
          style={{ padding: 14, background: "#000", color: "#fff", border: "none", fontSize: "1.05em" }}
        >
          {calculating ? "Calculating..." : "Calculate Shipping"}
        </button>

        {!!rates.length && (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ marginBottom: 8 }}>Select a shipping option</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {rates.map((r) => {
                const isSelected = String(r.id) === String(selectedRateId);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleChooseRate(r.id)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 10,
                      border: isSelected ? "2px solid #7c3aed" : "1px solid #444",
                      background: isSelected ? "rgba(124,58,237,0.15)" : "transparent",
                      color: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                      <span>{r.name}</span>
                      <span>${Number(r.rate).toFixed(2)}</span>
                    </div>
                    {(r.minDays || r.maxDays) && (
                      <div style={{ opacity: 0.8, fontSize: 14 }}>
                        Est. {r.minDays || "?"}–{r.maxDays || "?"} days
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!selectedRate}
          style={{
            marginTop: 16,
            padding: 16,
            background: selectedRate ? "#7c3aed" : "#999",
            color: "#fff",
            border: "none",
            fontSize: "1.2em",
            fontWeight: "bold",
            borderRadius: 12,
            cursor: selectedRate ? "pointer" : "not-allowed",
          }}
        >
          Checkout with Stripe (${total.toFixed(2)})
        </button>
      </div>
    </div>
  );
}
