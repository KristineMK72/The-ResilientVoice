// pages/gallery.js  ←  paste this directly over your current gallery.js
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
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", padding: "6rem" }}>Loading Saved By Grace...</p>;

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
        <meta name="description" content="Jewelry and everyday armor for survivors — Saved By Grace, Resilience, and Warrior Spirit" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1300px", margin: "0 auto" }}>
        {Object.entries(grouped).map(([title, items]) => {
          const story = items[0].story;
          return (
            <section key={title} style={{ marginBottom: "7rem" }}>
              <h1 style={{ fontSize: "3.8rem", textAlign: "center", marginBottom: "1rem", color: "#d4a5e0" }}>
                {story.title}
              </h1>
              <p style={{ fontSize: "1.5rem", textAlign: "center", maxWidth: "900px", margin: "0 auto 3.5rem", color: "#eee" }}>
                <strong>{story.hero}</strong> {story.description}
              </p>

              <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {items.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      borderRadius: "16px", overflow: "hidden", background: "#fff",
                      boxShadow: "0 12px 35px rgba(0,0,0,0.2)", transition: "all 0.3s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-12px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      <div style={{ position: "relative", height: "340px" }}>
                        <Image src={product.thumbnail_url || "/images/placeholder.jpg"} alt={product.name} fill style={{ objectFit: "cover" }} unoptimized />
                      </div>
                      <div style={{ padding: "1.6rem", textAlign: "center" }}>
                        <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.4rem" }}>{product.name}</h3>
                        <p style={{ color: "#d4a5e0", fontWeight: "bold", fontSize: "1.3rem" }}>
                          ${product.variants?.[0]?.retail_price || "View"}
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
