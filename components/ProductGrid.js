import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from our fixed API
  useEffect(() => {
    fetch("/api/printful-products")
      .then((r) => r.json())
      .then((data) => {
        // Safety check: ensure data is an array
        const arr = Array.isArray(data) ? data : [];
        
        // Filter by category if one is provided
        const filtered = category
          ? arr.filter((p) => {
              // We only have the name to guess category right now
              // You can improve this later with tags
              const name = p.name.toLowerCase();
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

  return (
    <div style={{
      display: "grid",
      gap: "2.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      padding: "2rem"
    }}>
      {products.map((product) => {
        // 1. Use the correct image field from our API (thumbnail_url)
        const img = product.thumbnail_url || "https://files.cdn.printful.com/products/71/71_1723145678.jpg";
        
        // 2. Default price because the main list doesn't have it
        // We will fetch the real price on the Product Detail page
        const price = "Check Price"; 

        return (
          <div key={product.id} style={{
            border: "1px solid #eee",
            borderRadius: "16px",
            overflow: "hidden",
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "transform 0.2s ease"
          }}>
            {/* CRITICAL LINK FIX:
               1. Ensure this matches your folder name (product vs products).
               2. We use the 'id' directly.
            */}
            <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ cursor: "pointer" }}>
                <Image
                  src={img}
                  alt={product.name}
                  width={600}
                  height={600}
                  style={{ width: "100%", height: "360px", objectFit: "cover" }}
                />

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
                    {price}
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
