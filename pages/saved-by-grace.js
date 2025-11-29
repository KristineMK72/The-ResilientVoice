// pages/saved-by-grace.js   ← FINAL BEAUTIFUL VERSION
"use client";

import Head from "next/head";
import ProductGrid from "../components/ProductGrid"; // ← works even without jsconfig

export default function SavedByGrace() {
  return (
    <>
      <Head>
        <title>Saved By Grace Collection | The Resilient Voice</title>
        <meta name="description" content="Jewelry and everyday armor for survivors." />
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

        {/* THIS SHOWS ALL YOUR REAL PRINTFUL PRODUCTS INSTANTLY */}
        <ProductGrid />

        <div style={{ textAlign: "center", padding: "6rem 1rem", color: "#aaa", fontSize: "1.1rem" }}>
          More pieces coming every week · Hand-designed with love
        </div>
      </div>
    </>
  );
}
