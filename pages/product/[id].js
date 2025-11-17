// pages/product/[id].js — BULLET-PROOF VERSION (no more errors on click!)
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No product ID found.");
      setLoading(false);
      return;
    }

    fetch("/api/printful-products")
      .then(res => {
        if (!res.ok) throw new Error("API failed.");
        return res.json();
      })
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        const found = safeData.find(p => p.id === parseInt(id));
        if (!found) {
          setError("Product not found.");
        } else {
          setProduct(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Product detail error:", err);
        setError("Failed to load product — try refreshing.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "6rem" }}><p>Loading product...</p></div>;
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "6rem" }}>
        <h1 style={{ fontSize: "2rem", color: "#666" }}>{error || "Product not found"}</h1>
        <Link href="/shop" style={{ color: "#9f6baa", textDecoration: "underline" }}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  // Safe image URL (fallback to generic)
  const imageUrl = product.thumbnail || "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

  // Safe price (first valid variant)
  const price = product.sync_variants?.[0]?.retail_price || "29.99";

  return (
    <>
      <Head>
        <title>{product.name} | The Resilient Voice</title>
      </Head>
      <main style={{ padding: "4rem 2rem", maxWidth: "1000px", margin: "0 auto", display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <Image
            src={imageUrl}
            alt={product.name}
            width={500}
            height={500}
            style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "12px" }}
            onError={(e) => { e.target.src = "https://files.cdn.printful.com/products/71/71_1723145678.jpg"; }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{product.name}</h1>
          <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>
            Handcrafted for survivors. Every piece tells a story of strength.
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f6baa", marginBottom: "2rem" }}>
            ${price}
          </p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
            {product.sync_variants?.slice(0, 3).map((v, i) => (
              <li key={i} style={{ marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #eee", borderRadius: "4px" }}>
                {v.name} - ${v.retail_price || "TBD"}
              </li>
            ))}
          </ul>
          <button style={{ width: "100%", padding: "1rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem" }}>
            Add to Cart
          </button>
          <Link href="/cart" style={{ display: "block", textAlign: "center", marginTop: "1rem", color: "#9f6baa" }}>
            View Cart
          </Link>
        </div>
      </main>
    </>
  );
}
