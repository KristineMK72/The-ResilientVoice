// pages/saved-by-grace.js
export const dynamic = 'force-dynamic';

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
        const res = await fetch("/api/printful-products");

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} – ${text || res.statusText}`);
        }

        const raw = await res.json();

        // THIS IS THE KEY FIX
        // Printful returns { products: [...] } or sometimes { result: [...] }
        const data = raw.products || raw.result || raw || [];

        // Make sure we always have an array before calling .filter
        if (!Array.isArray(data)) {
          console.warn("Unexpected API response:", raw);
          setProducts([]);
          setLoading(false);
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
        console.error("Failed to load products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Render states (unchanged – beautiful as before)
  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "8rem 1rem", fontSize: "1.4rem", color: "#d4a5e0" }}>
        Loading your collections…
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", padding: "8rem 1rem", color: "#ff6b6b" }}>
        Unable to load products right now.<br />
        <small style={{ color: "#aaa" }}>{error}</small>
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "10rem 1rem", fontSize: "1.6rem", color: "#aaa" }}>
        No products found with the current tags.<br />
        <small>
          Make sure your Printful products are tagged with “grace”, “resilience”, “warrior spirit”, or “accessories”.
        </small>
      </p>
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
        <meta name="description" content="Jewelry and everyday armor for survivors — Saved By Grace, Resilience Rising, Warrior Spirit, and Everyday Armor collections." />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto", minHeight: "80vh" }}>
        {Object.entries(grouped).map(([title, items]) => {
          const story = items[0].story;
          return (
            <section key={title} style={{ marginBottom: "8rem" }}>
              <h1 style={{ fontSize: "4rem", textAlign: "center", marginBottom: "1rem", color: "#d4a5e0", fontWeight: "700" }}>
                {story.title}
              </h1>
              <p style={{ fontSize: "1.6rem", textAlign: "center", maxWidth: "900px", margin: "0 auto 4rem", color: "#eee", lineHeight: "1.5" }}>
                <strong>{story.hero}</strong> {story.description}
              </p>

              <div style={{ display: "grid", gap: "2.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {items.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        borderRadius: "18px",
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                        transition: "all 0.35s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-14px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div style={{ position: "relative", height: "360px" }}>
                        <Image
                          src={product.thumbnail_url || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: "1.8rem", textAlign: "center", background: "#fff" }}>
                        <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.5rem", color: "#333" }}>
                          {product.name}
                        </h3>
                        <p style={{ color: "#d4a5e0", fontWeight: "bold", fontSize: "1.4rem", margin: 0 }}>
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
