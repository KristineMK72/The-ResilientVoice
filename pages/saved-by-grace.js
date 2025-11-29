// pages/saved-by-grace.js
"use client";
export const revalidate = 0;

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/data/products"; // ← Correct import at top

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

  useEffect(() => {
    async function loadProducts() {
      try {
        const allProducts = await getAllProducts(); // ← Uses your data/products.js

        const filtered = allProducts.filter((p) =>
          p.tags?.includes("grace") ||
          p.tags?.includes("resilience") ||
          p.tags?.includes("warrior spirit") ||
          p.tags?.includes("accessories")
        );

        const withStories = filtered.map((p) => {
          const tags = p.tags || "";
          let storyKey = "accessories";
          if (tags.includes("grace")) storyKey = "grace";
          else if (tags.includes("resilience")) storyKey = "resilience";
          else if (tags.includes("warrior spirit")) storyKey = "warrior spirit";

          return { ...p, story: COLLECTION_STORIES[storyKey] };
        });

        setProducts(withStories);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "10rem 1rem", fontSize: "1.8rem", color: "#d4a5e0" }}>
        Loading your collections…
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "8rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#d4a5e0" }}>No products found yet</p>
        <p style={{ color: "#ccc", maxWidth: "700px", margin: "2rem auto" }}>
          Your real Printful products will appear here automatically when published and tagged with{" "}
          <strong>grace</strong>, <strong>resilience</strong>, <strong>warrior spirit</strong>, or{" "}
          <strong>accessories</strong>.
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
                  fontSize: "4.5rem",
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
                  fontSize: "1.8rem",
                  textAlign: "center",
                  maxWidth: "900px",
                  margin: "0 auto 5rem",
                  color: "#eee",
                  lineHeight: "1.6",
                }}
              >
                <strong>{story.hero}</strong> {story.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "3.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                }}
              >
                {items.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        borderRadius: "22px",
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
                        transition: "all 0.4s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-18px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div style={{ position: "relative", height: "400px" }}>
                        <Image
                          src={product.image || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: "2.2rem", textAlign: "center", background: "#fff" }}>
                        <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.7rem", color: "#333" }}>
                          {product.name}
                        </h3>
                        <p style={{ color: "#d4a5e0", fontWeight: "bold", fontSize: "1.6rem", margin: 0 }}>
                          ${product.price?.toFixed(2) || "View"}
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
