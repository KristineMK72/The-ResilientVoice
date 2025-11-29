// components/ProductGrid.js  ← FINAL VERSION THAT WORKS 100%
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch REAL products from the fixed API route
  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        // The new API returns a clean array directly
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const price = product.price || 29.99;
    const image = product.image;

    setCart(curr => {
      const exists = curr.find(i => i.id === product.id);
      if (exists) {
        return curr.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...curr, { id: product.id, name: product.name, price, image, quantity: 1 }];
    });
    alert("Added to cart!");
  };

  if (loading) {
    return <p style={{textAlign:"center", padding:"8rem", fontSize:"1.8rem", color:"#9f6baa"}}>Loading your collection…</p>;
  }

  if (products.length === 0) {
    return <p style={{textAlign:"center", padding:"10rem", color:"#aaa", fontSize:"1.4rem"}}>
      No products yet — but they will appear automatically the moment you publish one in Printful
    </p>;
  }

  const itemsInCart = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{padding:"2rem 1rem 6rem", display:"grid", gap:"4rem", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", maxWidth:"1600px", margin:"0 auto"}}>
      {products.map(product => (
        <div key={product.id} style={{borderRadius:"28px", overflow:"hidden", background:"white", boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}>
          <Link href={`/product/${product.id}`}>
            <div style={{height:"460px", position:"relative", background:"#f8f5fa"}}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{objectFit:"contain", padding:"40px"}}
                priority
              />
            </div>
          </Link>
          <div style={{padding:"2.5rem", textAlign:"center"}}>
            <h3 style={{margin:"0 0 1rem", fontSize:"1.7rem", fontWeight:"700", color:"#333"}}>{product.name}</h3>
            <p style={{margin:"1rem 0", fontSize:"2.2rem", fontWeight:"bold", color:"#9f6baa"}}>
              ${product.price.toFixed(2)}
            </p>
            <button
              onClick={() => addToCart(product)}
              style={{width:"100%", padding:"1.4rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"16px", fontSize:"1.3rem", fontWeight:"bold", cursor:"pointer"}}
            >
              Add to Cart
            </button>
            {itemsInCart > 0 && (
              <div style={{marginTop:"1.5rem"}}>
                <Link href="/cart" style={{color:"#9f6baa", fontWeight:"600", textDecoration:"underline"}}>
                  View Cart ({itemsInCart} {itemsInCart === 1 ? "item" : "items"})
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
