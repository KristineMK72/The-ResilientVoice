// components/ProductGrid.js
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

        // THIS IS THE BULLETPROOF PART
        let list = [];
        if (data.result && Array.isArray(data.result)) {
          list = data.result;
        } else if (Array.isArray(data)) {
          list = data;
        }

        // Filter by category if needed (optional – you can remove if you want all)
        const filtered = category
          ? list.filter((p) =>
              p.name.toLowerCase().includes(category.toLowerCase())
            )
          : list;

        setProducts(filtered);
      } catch (err) {
        console.error("ProductGrid fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>Loading beautiful things…</p>;
  }

  if (products.length === 0) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>No products found.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        padding: "2rem 0",
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
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              background: "#fff",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ position: "relative", height: "320px", background: "#f0e6f2" }}>
              <Image
                src={product.image || "/fallback.png"}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem" }}>{product.name}</h3>
              <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
