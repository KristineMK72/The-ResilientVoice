import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query; // dynamic slug/id from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/printful-product/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>Loading product...</p>;
  }

  if (!product) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>Product not found.</p>;
  }

  return (
    <main style={{ maxWidth: "900px", margin: "4rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{product.name}</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: "1", position: "relative", height: "400px" }}>
          <Image
            src={product.thumbnail || "https://via.placeholder.com/400?text=No+Image"}
            alt={product.name}
            fill
            style={{ objectFit: "cover", borderRadius: "12px" }}
            unoptimized={true}
          />
        </div>
        <div style={{ flex: "1" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
            {product.description || "No description available."}
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>
            ${product.price?.toFixed(2)}
          </p>
          <button
            onClick={() => {
              // Add to cart logic (localStorage or API)
              const cart = JSON.parse(localStorage.getItem("cart")) || [];
              cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                thumbnail: product.thumbnail,
                quantity: 1,
              });
              localStorage.setItem("cart", JSON.stringify(cart));
              alert("Added to cart!");
            }}
            style={{
              marginTop: "1.5rem",
              padding: "1rem 2rem",
              background: "#9f6baa",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}
