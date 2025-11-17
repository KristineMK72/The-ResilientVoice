// components/ProductGrid.js
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
        // Super-smart filtering so it works no matter how you name things
        const filtered = category
          ? data.filter((p) => {
              const name = p.name.toLowerCase();
              const search = category.toLowerCase();
              const searchSpace = search.replace("-", " ");
              const searchNoDash = search.replace("-", "");

              return (
                name.includes(search) ||
                name.includes(searchSpace) ||
                name.includes(searchNoDash) ||
                name.includes("grace") && search.includes("grace") ||
                name.includes("warrior") && search.includes("warrior") ||
                name.includes("accessories") && search.includes("accessories")
              );
            })
          : data;

        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.3rem", color: "#777" }}>
        Loading your resilient pieces…
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.3rem", color: "#777" }}>
        No products in this collection yet — more coming soon!
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        padding: "1rem",
      }}
    >
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              overflow: "hidden",
              background: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Image
              src={product.thumbnail || "/placeholder.jpg"}
              alt={product.name}
              width={400}
              height={400}
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>
                {product.name}
              </h3>
              <p style={{ margin: "0 0 1rem", color: "#666", fontSize: "0.95rem" }}>
                {product.sync_variants?.length > 0
                  ? `${product.sync_variants.length} variant${product.sync_variants.length > 1 ? "s" : ""}`
                  : "One size"}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>
                ${product.sync_variants?.[0]?.retail_price || "???"}
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  background: "#9f6baa",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "1rem",
                  fontWeight: "bold",
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
