// pages/saved-by-grace.js — Grace chapter only
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { loadChapterProducts } from "../lib/catalog/loadChapterProducts";

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { products: list, warning } = await loadChapterProducts("grace");
        if (cancelled) return;
        if (!list?.length) {
          setError(warning || "No Grace products found.");
          setProducts([]);
        } else {
          setProducts(list);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem", fontSize: "1.8rem", color: "#9f6baa" }}>
        Loading your Grace collection…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ color: "#ff6b6b", fontSize: "1.6rem" }}>Unable to load Grace products</p>
        <p style={{ color: "#aaa" }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Saved By Grace | Grit & Grace</title>
        <meta name="description" content="Faith-fueled designs that speak truth, strength, and softness." />
      </Head>

      <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "4.5rem", color: "#9f6baa", fontWeight: "800", margin: "0 0 1rem" }}>
            Saved By Grace
          </h1>
          <p style={{ fontSize: "1.6rem", color: "#666", maxWidth: "800px", margin: "0 auto" }}>
            Strength wrapped in softness. Delicate pieces for the days you need to remember you are still whole.
          </p>
          <p style={{ marginTop: "1rem", color: "#9f6baa", fontWeight: "600" }}>
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {products.map((product) => {
            const id = String(product.sync_product_id || product.id);
            const name = product.title || product.name || "Product";
            const img = product.thumbnail_url || product.preview_url || "/images/placeholder.jpg";
            const price = product.variants?.[0]?.retail_price ?? product.variants?.[0]?.price;

            return (
              <Link key={id} href={`/product/${id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 16px 50px rgba(0,0,0,0.15)",
                    transition: "transform 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-12px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ position: "relative", height: "380px", background: "#f8f5fa" }}>
                    <Image
                      src={img}
                      alt={name}
                      fill
                      style={{ objectFit: "contain", padding: "30px" }}
                      unoptimized
                    />
                  </div>
                  <div style={{ padding: "1.8rem", textAlign: "center" }}>
                    <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.5rem", color: "#333" }}>{name}</h3>
                    <p style={{ color: "#9f6baa", fontWeight: "bold", fontSize: "1.4rem", margin: 0 }}>
                      {price != null && Number(price) > 0 ? `$${Number(price).toFixed(2)}` : "View"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p style={{ textAlign: "center", marginTop: "6rem", color: "#aaa", fontSize: "1.1rem" }}>
          More pieces coming every week · Hand-designed with love
        </p>
      </main>
    </>
  );
}
