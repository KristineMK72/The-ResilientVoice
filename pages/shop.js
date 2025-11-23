import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Shop() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/printful-products"); // ✅ Your API route
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Transform products into collection cards
        const grouped = data.map((product) => ({
          slug: product.slug || product.id, // fallback if slug missing
          name: product.name,
          description: product.description || "Explore this collection",
          thumbnail:
            product.thumbnail ||
            "https://via.placeholder.com/400?text=No+Image",
        }));

        setCollections(grouped);
      } catch (err) {
        console.error("Shop fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "6rem" }}>
        Loading Collections...
      </p>
    );
  }

  return (
    <>
      <Head>
        <title>Shop All Collections | The Resilient Voice</title>
        <meta
          name="description"
          content="Resilience, Grace, and Warrior Spirit collections — handcrafted jewelry for survivors."
        />
        <meta property="og:title" content="Shop | The Resilient Voice" />
      </Head>

      <main
        style={{
          padding: "4rem 1rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          Shop Our Collections
        </h1>

        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/product/${col.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "2px solid #d4a5e0",
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                  background: "#faf5ff",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "200px",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={col.thumbnail}
                    alt={col.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized={true}
                  />
                </div>
                <h2>{col.name}</h2>
                <p>{col.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
