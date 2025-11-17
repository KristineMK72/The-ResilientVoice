// components/ProductGrid.js — FIXED IMAGES & PRICES (pulls from variant files)
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/printful-products")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        const filtered = category
          ? safeData.filter((p) => {
              if (!p || !p.name) return false;
              const name = p.name.toLowerCase();
              return (
                name.includes(category.toLowerCase()) ||
                name.includes("accessories") ||
                name.includes("resilience") ||
                name.includes("grace") ||
                name.includes("warrior")
              );
            })
          : safeData;

        setProducts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ProductGrid fetch error:", err);
        setError("Failed to load products — check connection and try again.");
        setLoading(false);
      });
  }, [category]);

  if (loading) return <div style={{ textAlign: "center", padding: "4rem" }}><p>Loading resilient pieces…</p></div>;
  if (error) return <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  const displayProducts = products.length > 0 ? products : [];

  return (
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "1rem" }}>
      {displayProducts.map((product) => {
        if (!product || !product.name) return null;

        // FIXED: Pull first image URL from variant files (Printful's real mockup)
        const variantFile = product.sync_variants?.[0]?.files?.[0];
        const imageUrl = variantFile?.url || product.thumbnail || "https://files.cdn.printful.com/products/71/71_1723145678.jpg"; // Fallback tee mockup

        // FIXED: Get first valid retail price from variants
        const validPrices = product.sync_variants?.map(v => v.retail_price).filter(p => p && p !== "0.00") || [];
        const price = validPrices.length > 0 ? validPrices[0] : "29.99";

        return (
          <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.3s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <Image
                src={imageUrl}
                alt={product.name}
                width={400}
                height={250}
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "https://files.cdn.printful.com/products/71/71_1723145678.jpg"; }}
              />
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>{product.name}</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>${price}</p>
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
