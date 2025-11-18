// pages/cart.js
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from '@stripe/stripe-js'; // Import Stripe JS helper

// Load Stripe (must be loaded once outside the component)
// You MUST ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local and Vercel
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key' // Placeholder if not found
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

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id, variantId, delta) => {
    setCart(current => {
      const updatedCart = current.map(item => {
        if (item.id === id && item.variantId === variantId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean); // Remove items with quantity <= 0
      return updatedCart;
    });
  };

  const removeItem = (id, variantId) => {
    setCart(current => current.filter(item => 
      !(item.id === id && item.variantId === variantId)
    ));
  };
  
  // Stripe Checkout Handler
  const checkout = async () => {
    if (cart.length === 0) {
      console.log("Cart is empty! Cannot proceed.");
      return;
    }
    
    // 1. Fetch the Stripe session URL from our API
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: cart }), // Send the current cart
    });

    const data = await response.json();

    if (data.url) {
      // 2. Redirect to the Stripe hosted page
      window.location.href = data.url;
    } else {
      console.error("Could not get a checkout URL:", data.error);
      // In a real app, you would use a custom modal for the error
      window.alert(`Checkout failed: ${data.error || 'Unknown error'}`); 
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <p style={{ textAlign: "center", padding: "6rem" }}>Loading Cart...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "4rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Your Cart ({totalItems})
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", border: "1px dashed #ccc", borderRadius: "12px" }}>
          <p style={{ fontSize: "1.4rem", color: "#555" }}>Your cart is empty.</p>
          <Link href="/" style={{ fontSize: "1.1rem", color: "#9f6baa", textDecoration: "underline", marginTop: "1rem", display: "inline-block" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '3rem' }}>
          
          {/* Cart Items */}
          <div>
            {cart.map(item => (
              <div key={`${item.id}-${item.variantId}`} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
                
                <div style={{ position: 'relative', width: '80px', height: '80px', minWidth: '80px', borderRadius: '8px', overflow: 'hidden', marginRight: '1.5rem' }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized={true} />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.name}</h3>
                  <p style={{ fontWeight: 'bold', color: '#9f6baa' }}>${item.price.toFixed(2)}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '2rem' }}>
                  <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <button onClick={() => updateQuantity(item.id, item.variantId, -1)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0.5rem 0.75rem', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.variantId, 1)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id, item.variantId)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem' }}>
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '12px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', paddingTop: '1rem', borderTop: '1px solid #ddd', marginTop: '1rem' }}>
              <span>Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={checkout}
              style={{
                width: "100%",
                padding: "1.2rem",
                background: "#9f6baa",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.3rem",
                marginTop: "2rem",
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
