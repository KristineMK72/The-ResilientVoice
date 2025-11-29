// pages/saved-by-grace.js
"use client";                           // ← Makes it a Client Component
export const revalidate = 0;            // ← Forces fresh data on every visit (pages router)

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const COLLECTION_STORIES = {
  grace: {
    title: "Saved By Grace",
    hero: "Strength wrapped in softness.",
    description:
      "Delicate pieces for the days you need to remember you are still whole. Feminine, beautiful, and unapologetically resilient — because surviving is sacred.",
  },
  resilience: {
    title: "Resilience Rising",
    hero: "Forged in fire. Worn with pride.",
    description:
      "Bold designs that turn every scar into a story of triumph. You’re still here — and that’s everything.",
  },
  "warrior spirit": {
    title: "Warrior Spirit",
    hero: "The fight is not over.",
    description:
      "Raw, fearless pieces for the ones still in the battle. One breath, one day, one victory at a time.",
  },
  accessories: {
    title: "Everyday Armor",
    hero: "Little reminders you carry.",
    description:
      "Mugs that speak truth. Beanies that keep your head high. Totes that carry both groceries and grit.",
  },
};

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
      import { getAllProducts } from '@/data/products';

// Then inside useEffect:
const rawProducts = await getAllProducts();
const filtered = rawProducts.filter(p => 
  p.tags.includes("grace") || 
  p.tags.includes("resilience") || 
  p.tags.includes("warrior spirit") || 
  p.tags.includes("accessories")
);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch products: ${res.status} – ${text}`);
        }

        const raw = await res.json();
        const data = raw.products || raw.result || raw || [];

        if (!Array.isArray(data)) {
          console.warn("Printful API returned unexpected format:", raw);
          setProducts([]);
          return;
        }

        const filtered = data.filter((product) => {
          const tags = (product.tags || "").toLowerCase();
          return (
            tags.includes("grace") ||
            tags.includes("resilience") ||
            tags.includes("warrior spirit") ||
            tags.includes("accessories")
          );
        });

        const withStories = filtered.map((p) => {
          const tags = (p.tags || "").toLowerCase();
          let storyKey = "accessories";
          if (tags.includes("grace")) storyKey = "grace";
          else if (tags.includes("resilience")) storyKey = "resilience";
          else if (tags.includes("warrior spirit")) storyKey = "warrior spirit";

          return { ...p, story: COLLECTION_STORIES[storyKey] };
        });

        setProducts(withStories);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // ────────────────────────── RENDER ──────────────────────────

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "10rem 1rem", fontSize: "1.6rem", color: "#d4a5e0" }}>
        Loading your collections…
      </p>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <p style={{ color: "#ff6b6b", fontSize: "1.6rem" }}>Unable to load products right now.</p>
        <p style={{ color: "#aaa", marginTop: "1rem" }}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "8rem 1rem" }}>
        <p style={{ fontSize: "1.8rem", color: "#d4a5e0" }}>No products found yet</p>
        <p style={{ color: "#aaa", maxWidth: "600px", margin: "2rem auto" }}>
          Make sure your Printful products are tagged with “grace”, “resilience”, “warrior spirit”, or “accessories”.
        </p>
      </div>
    );
  }

  const grouped = products.reduce((acc, product) => {
    const key = product.story.title;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Saved By Grace Collection | The Resilient Voice</title>
        <meta
          name="description"
          content="Jewelry and everyday armor for survivors — Saved By Grace, Resilience Rising, Warrior Spirit, and Everyday Armor."
        />
      </Head>

      <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
        {Object.entries(grouped).map(([title, items]) => {
          const story = items[0].story;

          return (
            <section key={title} style={{ marginBottom: "9rem" }}>
              <h1
                style={{
                  fontSize: "4.2rem",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  color: "#d4a5e0",
                  fontWeight: "700",
                }}
              >
                {story.title}
              </h1>
              <p
                style={{
                  fontSize: "1.7rem",
                  textAlign: "center",
                  maxWidth: "900px",
                  margin: "0 auto 4.5rem",
                  color: "#eee",
                  lineHeight: "1.6",
                }}
              >
                <strong>{story.hero}</strong> {story.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "3rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {items.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: "0 16px 50px rgba(0,0,0,0.3)",
                        transition: "transform 0.4s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-16px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div style={{ position: "relative", height: "380px" }}>
                        <Image
                          src={product.thumbnail_url || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: "2rem", textAlign: "center", background: "#fff" }}>
                        <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.6rem", color: "#333" }}>
                          {product.name}
                        </h3>
                        <p style={{ color: "#d4a5e0", fontWeight: "bold", fontSize: "1.5rem", margin: 0 }}>
                          ${product.variants?.[0]?.retail_price?.toFixed(2) || "View"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
