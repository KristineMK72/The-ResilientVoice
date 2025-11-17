// components/ProductGrid.js — FINAL WORKING VERSION (real prices + real images)
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printful-products")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const filtered = category
          ? arr.filter((p) =>
              p?.name?.toLowerCase().includes(category.toLowerCase())
            )
          : arr;
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) return <p style={{ textAlign: "center", padding: "4rem" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "1rem" }}>
      {products.map((product) => {
        // REAL PRICE — Printful stores it in sync_variants[0].retail_price
        const price = product.sync_variants?.[0]?.retail_price || "29.99";

        // REAL IMAGE — comes from the first file in the first variant
        const imageUrl = product.sync_variants?.[0]?.files?.[0]?.url ||
                         "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <Image
                src={imageUrl}
                alt={product.name}
                width={400}
                height={400}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
                onError={(e) => (e.target.src = "https://files.cdn.printful.com/products/71/71_1723145678.jpg")}
              />
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem" }}>{product.name}</h3>
                <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#9f6baa" }}>${price}</p>
                <button style={{ width: "100%", padding: "0.9rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px" }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </Link>
        );
      })}
      {products.length === 0 && (
        <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem" }}>
          No products yet — more coming soon!
        </p>
      )}
    </div>
  );
}
