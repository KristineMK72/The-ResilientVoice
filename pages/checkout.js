// pages/checkout.js
import { useState, useEffect } from "react";
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

  // Shipping rates from Printful
  const [shippingOptions, setShippingOptions] = useState([]); // [{id,name,rate,currency,delivery_days?...}]
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  const [total, setTotal] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const items = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(items);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(subtotal);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper: build Printful items from cart
  // IMPORTANT: your cart items must include ONE of:
  // - item.sync_variant_id (preferred)
  // - item.variant_id
  // If you only have SKU in cart, we can map SKU -> sync_variant_id using Supabase later.
  function buildPrintfulItemsFromCart(items) {
    return items
      .map((item) => {
        const quantity = Number(item.quantity || 0);
        if (!Number.isFinite(quantity) || quantity <= 0) return null;

        // Try common field names
        const sync_variant_id =
          item.sync_variant_id ?? item.syncVariantId ?? item.printful_sync_variant_id ?? null;
        const variant_id = item.variant_id ?? item.variantId ?? null;

        if (sync_variant_id != null) return { sync_variant_id: Number(sync_variant_id), quantity };
        if (variant_id != null) return { variant_id: Number(variant_id), quantity };

        return null;
      })
      .filter(Boolean);
  }

  // 1) Calculate shipping (Printful rates)
  const handleCalculateShipping = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      setError("Please fill in all required shipping fields");
      return;
    }

    const items = buildPrintfulItemsFromCart(cartItems);
    if (!items.length) {
      setError(
        "Your cart items are missing Printful variant IDs. (Need sync_variant_id or variant_id per item.)"
      );
      return;
    }

    setCalculating(true);
    setError("");
    setShippingOptions([]);
    setSelectedShippingId("");
    setShippingCost(0);

    try {
      const res = await fetch("/api/printful-shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: {
            name: address.name,
            address1: address.address1,
            city: address.city,
            state_code: address.state_code,
            country_code: address.country_code,
            zip: address.zip,
          },
          items,
          currency: "USD",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Shipping rates error:", data);
        setError(data?.error || "Could not calculate shipping rates.");
        return;
      }

      const rates = data?.result || [];
      if (!rates.length) {
        setError("No shipping rates returned from Printful for this address/items.");
        return;
      }

      // Normalize to something easy for UI
      const normalized = rates.map((r, idx) => ({
        id: r.id || `${r.name || "rate"}-${idx}`,
        name: r.name || "Shipping",
        rate: Number(r.rate || 0),
        currency: r.currency || "USD",
        delivery_days: r.delivery_days || r.delivery_days_min || null,
        minDeliveryDays: r.minDeliveryDays ?? r.min_delivery_days ?? null,
        maxDeliveryDays: r.maxDeliveryDays ?? r.max_delivery_days ?? null,
      }));

      setShippingOptions(normalized);

      // Default select cheapest
      const cheapest = normalized
        .slice()
        .sort((a, b) => (a.rate || 0) - (b.rate || 0))[0];

      setSelectedShippingId(cheapest.id);
      setShippingCost(cheapest.rate);

      setTotal(subtotal + cheapest.rate);
    } catch (err) {
      console.error("Shipping API call failed:", err);
      setError("Could not calculate shipping. Please check your address and try again.");
    } finally {
      setCalculating(false);
    }
  };

  // When user chooses a different shipping option
  const handleSelectShipping = (e) => {
    const id = e.target.value;
    setSelectedShippingId(id);

    const choice = shippingOptions.find((o) => o.id === id);
    const rate = choice ? Number(choice.rate || 0) : 0;

    setShippingCost(rate);
    setTotal(subtotal + rate);
  };

  // 2) Initiate Stripe Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedShippingId || shippingCost <= 0 || Number.isNaN(shippingCost)) {
      alert('Please click "Calculate Shipping & Taxes" and select a shipping option first.');
      return;
    }

    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      alert("Please fill in all shipping fields before checking out.");
      return;
    }

    const finalTotal = subtotal + shippingCost;
    if (finalTotal <= 0 || Number.isNaN(finalTotal)) {
      alert("Order total is invalid. Cannot proceed to payment.");
      return;
    }

    const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartItems,
          shippingCost, // numeric
          shippingOption: selectedShipping
            ? {
                id: selectedShipping.id,
                name: selectedShipping.name,
                rate: selectedShipping.rate,
                currency: selectedShipping.currency,
              }
            : null,
          address,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Stripe Session API Failed:", res.status, errorText);
        setError(`Failed to create session (Status ${res.status}). See console for details.`);
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
      else setError("Could not get Stripe URL from the server response.");
    } catch (err) {
      console.error("Failed to start checkout:", err);
      setError("Failed to start checkout. Check console for technical details.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h1>Checkout</h1>

      <h2>Your Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}
            >
              <div>
                <strong>{item.name}</strong> × {item.quantity}
              </div>
              <div>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {shippingCost > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3em", marginTop: "16px" }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}

      <h2>Shipping Address</h2>
      {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

      <div style={{ display: "grid", gap: "12px" }}>
        <input name="name" placeholder="Full Name *" value={address.name} onChange={handleInputChange} required />
        <input
          name="address1"
          placeholder="Address Line 1 *"
          value={address.address1}
          onChange={handleInputChange}
          required
        />
        <input name="city" placeholder="City *" value={address.city} onChange={handleInputChange} required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <input
            name="state_code"
            placeholder="State (e.g., MN) *"
            value={address.state_code}
            onChange={handleInputChange}
            required
          />
          <input name="zip" placeholder="ZIP Code *" value={address.zip} onChange={handleInputChange} required />
        </div>

        <select name="country_code" value={address.country_code} onChange={handleInputChange}>
          <option value="US">United States</option>
        </select>

        <button
          type="button"
          onClick={handleCalculateShipping}
          disabled={calculating || cartItems.length === 0}
          style={{
            padding: "14px",
            background: "#000",
            color: "#fff",
            border: "none",
            fontSize: "1.1em",
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          {calculating ? "Calculating..." : "Calculate Shipping"}
        </button>

        {/* Shipping options */}
        {shippingOptions.length > 0 && (
          <div style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Choose shipping:</div>

            <select
              value={selectedShippingId}
              onChange={handleSelectShipping}
              style={{ width: "100%", padding: "12px", fontSize: "1em" }}
            >
              {shippingOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} — ${Number(opt.rate || 0).toFixed(2)} {opt.currency}
                </option>
              ))}
            </select>
          </div>
        )}

        {shippingCost > 0 && (
          <button
            type="button"
            onClick={handleCheckout}
            style={{
              padding: "16px",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              fontSize: "1.3em",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "16px",
            }}
          >
            Pay ${total.toFixed(2)} with Stripe
          </button>
        )}
      </div>
    </div>
  );
}
