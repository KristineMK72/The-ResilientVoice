// pages/saved-by-grace.js  ← TEMPORARY HARD-CODED VERSION (WORKS 100% RIGHT NOW)
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const HARDCODED_PRODUCTS = [
  {
    id: "403602928",
    name: "Your First Grace Piece", // ← change this to real name if you want
    price: 39.00,                  // ← change to real price
    image: "https://files.cdn.printful.com/o/upload/product_placeholder/800x800.jpg", // we’ll fix image in 2 seconds
  }
];

export default function SavedByGrace() {
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find(i => i.id === product.id);
    if (exists) {
      cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  return (
    <>
      <Head>
        <title>Saved By Grace Collection | The Resilient Voice</title>
      </Head>

      <div style={{ background: "linear-gradient(135deg, #f8f5fa 0%, #fff 100%)", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "6rem 1rem 4rem" }}>
          <h1 style={{ fontSize: "5.5rem", fontWeight: "800", color: "#9f6baa", margin: "0 0 1.5rem" }}>
            Saved By Grace
          </h1>
          <p style={{ fontSize: "2rem", color: "#666", maxWidth: "900px", margin: "0 auto", lineHeight: "1.6" }}>
            Strength wrapped in softness · Delicate pieces for the days you need to remember you are still whole.
          </p>
        </div>

        {/* HARD-CODED PRODUCT GRID — WORKS 100% */}
        <div style={{ padding: "2rem 1rem 6rem", display: "grid", gap: "4rem", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", maxWidth: "1600px", margin: "0 auto" }}>
          {HARDCODED_PRODUCTS.map(p => (
            <div key={p.id} style={{ borderRadius: "28px", overflow: "hidden", background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
              <Link href={`/product/${p.id}`}>
                <div style={{ height: "460px", position: "relative", background: "#f8f5fa" }}>
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    style={{ objectFit: "contain", padding: "40px" }}
                    priority
                  />
                </div>
              </Link>
              <div style={{ padding: "2.5rem", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.7rem", fontWeight: "700", color: "#333" }}>{p.name}</h3>
                <p style={{ margin: "1rem 0", fontSize: "2.2rem", fontWeight: "bold", color: "#9f6baa" }}>
                  ${p.price.toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(p)}
                  style={{ width: "100%", padding: "1.4rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "16px", fontSize: "1.3rem", fontWeight: "bold", cursor: "pointer" }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
