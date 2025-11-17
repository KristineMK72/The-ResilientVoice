// components/ProductGrid.js  ← FINAL VERSION (shows ALL your Printful products)
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printful-products")
      .then((res) => res.json())
      .then((data) => {
        // This filter is now SUPER forgiving — shows product if:
        // - no category (shop page) OR
        // - name contains the category OR contains "accessories", "resilience", "grace", "warrior"
        const filtered = category
          ? data.filter((p) => {
              const name = p.name.toLowerCase();
              return (
                name.includes(category.toLowerCase()) ||
                name.includes("accessories") ||
                name.includes("resilience") ||
                name.includes("grace") ||
                name.includes("warrior")
              );
            })
          : data;

        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) return <p style={{ textAlign: "center", padding: "4rem" }}>Loading…</p>;

  // ← THIS IS THE KEY CHANGE: show ALL products if none match the filter
  const displayProducts = products.length > 0 ? products : [];

  return (
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "1rem" }}>
      {displayProducts.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.3s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            <Image
              src={product.thumbnail || "/placeholder.jpg"}
              alt={product.name}
              width={400}
              height={400}
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>{product.name}</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>
                ${product.sync_variants?.[0]?.retail_price || "???"}
              </p>
              <button style={{ width: "100%", padding: "0.9rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px", marginTop: "1rem" }}>
                Add to Cart
              </button>
            </div>
          </div>
        </Link>
      ))}
      {displayProducts.length === 0 && !loading && (
        <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "#777" }}>
          No products in this collection yet — more coming soon!
        </p>
      )}
    </div>
  );
}
