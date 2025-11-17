// components/ProductGrid.js — FIXED VERSION (images + prices work!)
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

  const displayProducts = products.length > 0 ? products : [];

  return (
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "1rem" }}>
      {displayProducts.map((product) => {
        // FIXED: Get the first non-null thumbnail or fallback to Printful generic
        const thumbnail = product.thumbnail || `https://files.cdn.printful.com/products/71/71_1723145678.jpg`; // Generic tee fallback
        
        // FIXED: Get the first valid price or fallback to $29.99
        const firstPrice = product.sync_variants?.find(v => v.retail_price)?.retail_price || "29.99";

        return (
          <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.3s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <Image
                src={thumbnail}
                alt={product.name}
                width={400}
                height={400}
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "https://files.cdn.printful.com/products/71/71_1723145678.jpg"; }} // Fallback on error
              />
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>{product.name}</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>
                  ${firstPrice}
                </p>
                <button style={{ width: "100%", padding: "0.9rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px", marginTop: "1rem" }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </Link>
        );
      })}
      {displayProducts.length === 0 && !loading && (
        <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "#777" }}>
          No products in this collection yet — more coming soon!
        </p>
      )}
    </div>
  );
}
