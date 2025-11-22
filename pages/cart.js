import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe once outside the component
// Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in Vercel (.env.production)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ✅ Debug log to confirm we’re using the public key
console.log(
  "Stripe public key prefix:",
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(0, 8)
);

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
        .filter(Boolean); // Remove items with quantity <= 0
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
    <div
      style={{ maxWidth: "1000px", margin: "4rem auto", padding: "0 2rem" }}
    >
      {/* ...rest of your cart UI unchanged */}
    </div>
  );
}

