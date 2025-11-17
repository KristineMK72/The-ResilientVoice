// pages/cart.js — BEAUTIFUL + FULLY WORKING CART
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty === 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const { id: sessionId } = await res.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert('Checkout failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  if (cart.length === 0) {
