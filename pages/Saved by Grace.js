// pages/grace.js  ←  final version with rich category descriptions
export const dynamic = 'force-dynamic';

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const COLLECTION_STORIES = {
  grace: {
    title: "Grace Collection",
    hero: "Strength wrapped in softness.",
    description:
      "For the pieces we wear on the days we need to remember we are still whole. Delicate, feminine, and unapologetically resilient — because surviving is beautiful.",
  },
  resilience: {
    title: "Resilience Collection",
    hero: "Forged in fire. Worn with pride.",
    description:
      "Every scar has a story. This collection turns pain into power with bold, unbreakable designs that scream “I’m still here.”",
  },
  "warrior spirit": {
    title: "Warrior Spirit Collection",
    hero: "The fight is not over.",
    description:
      "For the ones still in the battle. Raw, fearless pieces that remind you the war is worth winning — one breath, one day, one victory at a time.",
  },
  accessories: {
    title: "Everyday Armor",
    hero: "Little reminders you carry.",
    description:
      "Mugs that start your morning with truth. Beanies that keep your head held high. Totes that carry both groceries and grit. Because resilience lives in the ordinary moments too.",
  },
};

export default function GraceCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/printful-products");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const filtered = data.filter((product) => {
          const tags = (product.tags || "").toLowerCase();
          return (
            tags.includes("grace") ||
            tags.includes("resilience") ||
            tags.includes("warrior spirit") ||
            tags.includes("accessories")
          );
        });

        // Attach the right story to each product
        const withStories = filtered.map((p) => {
          const tags = (p.tags || "").toLowerCase();
          let storyKey = "accessories"; // default
          if (tags.includes("grace")) storyKey = "grace";
          else if (tags.includes("resilience")) storyKey = "resilience";
          else if (tags.includes("warrior spirit")) storyKey = "warrior spirit";

          return { ...p, story: COLLECTION_STORIES[storyKey] };
        });

        setProducts(withStories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", padding: "6rem" }}>Loading Grace Collection...</p>;

  // Group by story so we can show beautiful sections
  const grouped = products.reduce((acc, product) => {
    const key = product.story.title;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Grace & Resilience Collections | The Resilient Voice</title>
        <meta
          name="description"
          content="Jewelry, apparel, and everyday armor for survivors. Grace • Resilience • Warrior Spirit"
        />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1300px", margin: "0 auto" }}>
        {Object.entries(grouped).map(([title, items]) => {
          const story = items[0].story;
          return (
            <section key={title} style={{ marginBottom: "6rem" }}>
              <h1 style={{ fontSize: "3.5rem", textAlign: "center", marginBottom: "1rem" }}>
                {story.title}
              </h1>
              <p style={{ fontSize: "1.4rem", textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem", color: "#555" }}>
                <strong>{story.hero}</strong> {story.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "2.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {items.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-12px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div style={{ position: "relative", height: "320px" }}>
                        <Image
                          src={product.thumbnail_url || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: "1.5rem", textAlign: "center" }}>
                        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.35rem" }}>
                          {product.name}
                        </h3>
                        <p style={{ color: "#d4a5e0", fontWeight: "bold" }}>
                          {product.variants?.[0]?.retail_price
                            ? `$${product.variants[0].retail_price}`
                            : "View →"}
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
