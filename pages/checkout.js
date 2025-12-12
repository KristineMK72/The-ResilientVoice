// pages/checkout.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Checkout() {
    // --- STATE MANAGEMENT ---
    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState({
        name: '',
        address1: '',
        city: '',
        state_code: '',
        country_code: 'US',
        zip: '',
    });
    const [shippingCost, setShippingCost] = useState(0);
    const [total, setTotal] = useState(0); // This should hold the Subtotal + Shipping
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState('');

    // --- INITIAL LOAD ---
    useEffect(() => {
        // Load cart from localStorage (change this if you use a different cart system)
        const savedCart = localStorage.getItem('cart');
        const items = savedCart ? JSON.parse(savedCart) : [];
        setCartItems(items);

        // Calculate initial subtotal
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(subtotal); // Total is initially just the subtotal
    }, []);

    const handleInputChange = (e) => {
        setAddress((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // --- 1. CALCULATE SHIPPING ---
    const handleCalculateShipping = async () => {
        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        // Basic validation
        if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
            setError('Please fill in all required shipping fields');
            return;
        }

        setCalculating(true);
        setError('');

        try {
            const res = await fetch('/api/calculate-shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cartItems, address }),
            });

            const data = await res.json();

            if (data.error) {
                // If API returns an error message (e.g., Printful validation failed)
                setError(data.error);
            } else {
                // Success: Update shipping cost and the new grand total
                const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                setShippingCost(data.shipping);
                setTotal(subtotal + data.shipping); // Total is now Subtotal + Shipping
                setError(''); // Clear error on success
            }
        } catch (err) {
            console.error("Shipping API call failed:", err);
            setError('Could not calculate shipping. Please check your address or try again.');
        } finally {
            setCalculating(false);
        }
    };

    // --- 2. INITIATE CHECKOUT (WITH IMPROVED VALIDATION) ---
    const handleCheckout = async () => {
        // **STEP 1: Robust Validation**
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        // Must have a calculated shipping cost (must be a positive number)
        if (shippingCost <= 0 || isNaN(shippingCost)) {
            alert('Shipping cost is invalid or 0. Please click "Calculate Shipping & Taxes" first.');
            return;
        }

        // Address validation (basic check)
        if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
            alert('Please fill in all shipping fields before checking out.');
            return;
        }
        
        // Final total sanity check
        const finalTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost;
        if (finalTotal <= 0 || isNaN(finalTotal)) {
            alert('Order total is invalid. Cannot proceed to payment.');
            return;
        }
        
        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cartItems,
                    shippingCost, // Guaranteed to be a number > 0 here
                    address,
                }),
            });
            
            // **STEP 2: Detailed Server Error Capture**
            if (!res.ok) {
                // Read the crash output from the server
                const errorText = await res.text();
                console.error("Stripe Session API Failed with status:", res.status, "\nServer Response:", errorText);
                
                // Alert the user with a clearer message
                setError(`Failed to create session (Status ${res.status}). See console for details.`);
                return;
            }

            const { url } = await res.json();
            
            if (url) {
                // Success: Redirect to Stripe
                window.location.href = url;
            } else {
                setError('Could not get Stripe URL from the server response.');
            }

        } catch (err) {
            console.error('Failed to start checkout. Please try again.', err);
            setError('Failed to start checkout. Check console for technical details.');
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
            <h1>Checkout</h1>

            {/* Cart summary */}
            <h2>Your Order Summary</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. <Link href="/">Go shopping</Link></p>
            ) : (
                <>
                    {cartItems.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <strong>{item.name}</strong> × {item.quantity}
                            </div>
                            <div>${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    ))}
                    <hr />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {shippingCost > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Shipping (Standard)</span>
                            <span>${shippingCost.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3em', marginTop: '16px' }}>
                        <span>Total</span>
                        {/* Note: total now includes shipping cost */}
                        <span>${total.toFixed(2)}</span>
                    </div>
                </>
            )}

            {/* Shipping form */}
            <h2>Shipping Address</h2>
            {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'grid', gap: '12px' }}>
                <input
                    name="name"
                    placeholder="Full Name *"
                    value={address.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    name="address1"
                    placeholder="Address Line 1 *"
                    value={address.address1}
                    onChange={handleInputChange}
                    required
                />
                <input
                    name="city"
                    placeholder="City *"
                    value={address.city}
                    onChange={handleInputChange}
                    required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                        name="state_code"
                        placeholder="State (e.g., MN) *"
                        value={address.state_code}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        name="zip"
                        placeholder="ZIP Code *"
                        value={address.zip}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <select name="country_code" value={address.country_code} onChange={handleInputChange}>
                    <option value="US">United States</option>
                    {/* Add other countries here if needed */}
                </select>

                <button
                    type="button"
                    onClick={handleCalculateShipping}
                    disabled={calculating || cartItems.length === 0}
                    style={{
                        padding: '14px',
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        fontSize: '1.1em',
                        cursor: 'pointer',
                        marginTop: '12px',
                    }}
                >
                    {calculating ? 'Calculating...' : 'Calculate Shipping & Taxes'}
                </button>

                {shippingCost > 0 && (
                    <button
                        type="button"
                        onClick={handleCheckout}
                        style={{
                            padding: '16px',
                            background: '#0070f3',
                            color: '#fff',
                            border: 'none',
                            fontSize: '1.3em',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '16px',
                        }}
                    >
                        Pay ${(total).toFixed(2)} with Stripe
                    </button>
                )}
            </div>
        </div>
    );
}
