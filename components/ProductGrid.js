import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from our API
  useEffect(() => {
    fetch("/api/printful-products")
      .then((r) => r.json())
      .then((data) => {
        // Safety check: ensure data is an array
        const arr = Array.isArray(data) ? data : [];
        
        // Filter by category if one is provided
        const filtered = category
          ? arr.filter((p) => {
              // Safety check: ensure name exists before lowercase
              const name = p.name ? p.name.toLowerCase() : "";
              const cat = category.toLowerCase();
              return name.includes(cat);
            })
          : arr;

        setProducts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products", err);
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Loading your pieces...
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem", color: "#666" }}>
        No products found for "{category}".
      </p>
    );
  }

  return (
    <div style={{
      display: "grid",
      gap: "2.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      padding: "2rem"
    }}>
      {products.map((product) => {
        // 🔍 SMART IMAGE FINDER (The Fix)
        // Checks 3 different places for the image so it never fails
        const imageUrl = 
          product.thumbnail_url || 
          product.image || 
          (product.files && product.files.find(f => f.type === "preview")?.url) ||
          (product.files && product.files[0]?.url) ||
          "https://via.placeholder.com/400x400?text=No+Image";

        return (
          <div key={product.id} style={{
            border: "1px solid #eee",
            borderRadius: "16px",
            overflow: "hidden",
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "transform 0.2s ease"
          }}>
            <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ cursor: "pointer" }}>
                
                {/* Image Container */}
                <div style={{ position: "relative", height: "360px", width: "100%" }}>
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized={true} // 👈 Important: Stops Next.js from blocking external images
                  />
                </div>

                <div style={{ padding: "1.8rem" }}>
                  <h3 style={{ fontSize: "1.35rem", marginBottom: "0.8rem", minHeight: "60px" }}>
                    {product.name}
                  </h3>

                  <p style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#9f6baa",
                    margin: "0.6rem 0"
                  }}>
                    Check Price
                  </p>

                  <div style={{
                    width: "100%",
                    padding: "1rem",
                    background: "#9f6baa",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    textAlign: "center",
                    marginTop: "10px"
                  }}>
                    View Details
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
