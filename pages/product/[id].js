import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const res = await fetch(`/api/printful-product/${id}`);
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", padding: "4rem" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center", padding: "4rem" }}>Product not found.</p>;

  return (
    <main style={{ maxWidth: "900px", margin: "4rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{product.name}</h1>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1", position: "relative", minHeight: "400px" }}>
          <Image
            src={product.thumbnail || "/fallback.png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover", borderRadius: "12px" }}
            unoptimized={true}
          />
        </div>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
            {product.description || "No description available."}
          </p>

          {/* ✅ Show all variants */}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {product.variants?.map((v) => (
              <li key={v.id} style={{ marginBottom: "0.5rem" }}>
                {v.name} — <strong>${v.retail_price}</strong>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              // Example: add first variant to cart
              fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: product.id,
                  variantId: product.variants[0].id,
                  name: product.name,
                  price: product.variants[0].retail_price,
                  thumbnail: product.thumbnail,
                  quantity: 1,
                }),
              });
              alert("Added to cart!");
              router.push("/cart");
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
