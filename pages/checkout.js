// pages/checkout.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState({
    name: "",
    address1: "",
    city: "",
    state_code: "",
    country_code: "US",
    zip: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState("");
  const [selectedRateCost, setSelectedRateCost] = useState(0);
  const [selectedRateName, setSelectedRateName] = useState("");

  const [loadingRates, setLoadingRates] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const items = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(items);

    // restore shipping selection if present
    const savedId = localStorage.getItem("shippingRateId") || "";
    const savedName = localStorage.getItem("shippingRateName") || "";
    const savedCost = Number(localStorage.getItem("shippingCost") || "0");

    if (savedId && Number.isFinite(savedCost) && savedCost > 0) {
      setSelectedRateId(savedId);
      setSelectedRateName(savedName);
      setSelectedRateCost(savedCost);
    }
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cartItems]
  );

  const total = useMemo(() => subtotal + (Number.isFinite(selectedRateCost) ? selectedRateCost : 0), [
    subtotal,
    selectedRateCost,
  ]);

  const handleInputChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleGetShippingRates() {
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    // validate address
    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      setError("Please fill in all required shipping fields.");
      return;
    }

    // Build Printful items from cart (sync_variant_id)
    const items = cartItems.map((i) => ({
      sync_variant_id: Number(i.sync_variant_id),
      quantity: Number(i.quantity),
    }));

    setLoadingRates(true);
    try {
      const res = await fetch("/api/printful-shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: {
            address1: address.address1,
            address2: address.address2 || "",
            city: address.city,
            state_code: address.state_code,
            country_code: address.country_code,
            zip: address.zip,
          },
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Rates error:", data);
        setError(data?.error || "Could not fetch shipping rates.");
        return;
      }

      const list = Array.isArray(data?.rates) ? data.rates : [];
      if (!list.length) {
        setError("No shipping rates returned. Check address/variants.");
        return;
      }

      setRates(list);

      // auto select cheapest
      const cheapest = [...list].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
      setSelectedRateId(cheapest.id);
      setSelectedRateCost(Number(cheapest.rate));
      setSelectedRateName(cheapest.name);

      localStorage.setItem("shippingRateId", String(cheapest.id));
      localStorage.setItem("shippingRateName", String(cheapest.name));
      localStorage.setItem("shippingCost", String(cheapest.rate));
    } catch (e) {
      console.error(e);
      setError("Could not calculate shipping. Try again.");
    } finally {
      setLoadingRates(false);
    }
  }

  function chooseRate(r) {
    setSelectedRateId(r.id);
    setSelectedRateCost(Number(r.rate));
    setSelectedRateName(r.name);

    localStorage.setItem("shippingRateId", String(r.id));
    localStorage.setItem("shippingRateName", String(r.name));
    localStorage.setItem("shippingCost", String(r.rate));
  }

  async function handleCheckout() {
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedRateId || !Number.isFinite(selectedRateCost) || selectedRateCost <= 0) {
      setError("Shipping cost missing/invalid. Please calculate shipping and select an option first.");
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          shipping: {
            id: selectedRateId,
            name: selectedRateName || "Shipping",
            cost: selectedRateCost,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create checkout session.");
        return;
      }

      if (data.url) window.location.href = data.url;
      else setError("Missing Stripe checkout URL.");
    } catch (e) {
      console.error(e);
      setError("Checkout failed. Try again.");
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 20 }}>
      <h1>Checkout</h1>

      <h2>Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.sync_variant_id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
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

          {selectedRateCost > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping ({selectedRateName || "Selected"})</span>
              <span>${Number(selectedRateCost).toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25em", marginTop: 12 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}

      <h2 style={{ marginTop: 30 }}>Shipping Address</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} />
        <input name="address1" placeholder="Address Line 1 *" value={address.address1} onChange={handleInputChange} />
        <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input name="state_code" placeholder="State (e.g., MN) *" value={address.state_code} onChange={handleInputChange} />
          <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} />
        </div>

        <button
          type="button"
          onClick={handleGetShippingRates}
          disabled={loadingRates || cartItems.length === 0}
          style={{ padding: 14, background: "#111", color: "white", border: "none", cursor: "pointer", marginTop: 10 }}
        >
          {loadingRates ? "Getting rates..." : "Get Shipping Rates"}
        </button>

        {rates.length > 0 && (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Choose a shipping option:</p>
            <div style={{ display: "grid", gap: 8 }}>
              {rates.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => chooseRate(r)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 10,
                    border: r.id === selectedRateId ? "2px solid #0070f3" : "1px solid #ccc",
                    background: r.id === selectedRateId ? "rgba(0,112,243,0.08)" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{r.name}</span>
                    <span>${Number(r.rate).toFixed(2)}</span>
                  </div>
                  {(r.minDeliveryDays || r.maxDeliveryDays) && (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Est. {r.minDeliveryDays || "?"}–{r.maxDeliveryDays || "?"} days
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!selectedRateId || !Number.isFinite(selectedRateCost) || selectedRateCost <= 0}
          style={{
            padding: 16,
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.15em",
            fontWeight: "bold",
            marginTop: 14,
            borderRadius: 12,
          }}
        >
          Pay ${total.toFixed(2)} with Stripe
        </button>
      </div>
    </div>
  );
}
