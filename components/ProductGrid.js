// components/ProductGrid.js   ← OVERWRITE COMPLETELY
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/printful-products");
        const data = await res.json();
        const list = Array.isArray(data.result) ? data.result : [];

        // SMART CATEGORY FILTERING (this is what you were missing)
        const filtered = category
          ? list.filter((p) => {
              const lower = p.name.toLowerCase();
              return (
                lower.includes("grace") && category === "grace" ||
                lower.includes("resilien") && category === "resilience" ||
                lower.includes("warrior") && category === "warrior" ||
                (category === "accessories" && (lower.includes("mug") || lower.includes("beanie") || lower.includes("tote")))
              );
            })
          : list;

        setProducts(filtered);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);

  if (loading) return <p style={{ textAlign: "center", padding: "4rem" }}>Loading…</p>;
  if (products.length === 0) return <p style={{ textAlign: "center", padding: "4rem" }}>No products yet.</p>;

  return (
    <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "2rem 0" }}>
      {products.map((p) => (
        <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", background: "#fff", transition: "0.3s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ position: "relative", height: "360px", background: "#f8f5f9" }}>
              <Image
                src={p.image || "/fallback.png"}
                alt={p.name}
                fill
                sizes="(max-width: 768px
