import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe once outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

console.log(
  "Stripe public key prefix:",
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(0, 8)
);

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend on mount
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error("Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  const updateQuantity = (id, variantId, delta) => {
    setCart((current) => {
      const updatedCart = current
        .map((item) => {
          if (item.id === id && item.variantId === variantId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean);
      return updatedCart;
    });
  };

  const removeItem = (id, variantId) => {
    setCart((current) =>
      current.filter((item) => !(item.id === id && item.variantId === variantId))
    );
  };

  // Stripe Checkout Handler
  const checkout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Cannot proceed.");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cart }),
      });

      const { id, error } = await response.json();

      if (id) {
        const stripe = await stripePromise;
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: id,
        });
        if (stripeError) {
          console.error("Stripe redirect error:", stripeError);
          alert(`Checkout failed: ${stripeError.message}`);
        }
      } else {
        console.error("Checkout session error:", error);
        alert(`Checkout failed: ${error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "6rem" }}>Loading Cart...</p>
    );

  return (
    <div style={{ maxWidth: "1000px", margin: "4rem auto", padding: "0 2rem" }}>
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
        }}
      >
        Your Cart ({totalItems})
      </h1>

      {cart.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            border: "1px dashed #ccc",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "1.4rem", color: "#555" }}>
            Your cart is empty.
          </p>
          <Link
            href="/"
            style={{
              fontSize: "1.1rem",
              color: "#9f6baa",
              textDecoration: "underline",
              marginTop: "1rem",
              display: "inline-block",
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr",
            gap: "3rem",
          }}
        >
          {/* Cart Items */}
          <div>
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.variantId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                  padding: "1.5rem 0",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    minWidth: "80px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginRight: "1.5rem",
                  }}
                >
                  <Image
                    src={item.image || "/fallback.png"}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized={true}
                  />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>
                    {item.name}
                  </h3>
                  <p style={{ fontWeight: "bold", color: "#9f6baa" }}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginLeft: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.variantId, -1)
                      }
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderLeft: "1px solid #ccc",
                        borderRight: "1px solid #ccc",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.variantId, 1)
                      }
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.variantId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4d",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div
            style={{
              background: "#f9f9f9",
              padding: "2rem",
              borderRadius: "12px",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                borderBottom: "1px solid #ddd",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              Order Summary
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={checkout}
              style={{
                marginTop: "1.5rem",
                width: "100%",
                padding: "1rem",
                background: "#9f6baa",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
