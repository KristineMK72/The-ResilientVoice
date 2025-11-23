import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/printful-product/${id}`);
        const data = await res.json();
        setProduct(data);
        // ✅ Default to first variant
        setSelectedVariant(data.variants?.[0] || null);
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a variant.");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          variantId: selectedVariant.id,
          name: `${product.name} (${selectedVariant.name})`,
          price: selectedVariant.retail_price,
          thumbnail: product.thumbnail,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to cart");
      alert("Added to cart!");
      router.push("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Could not add to cart. Please try again.");
    }
  };

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

          {/* ✅ Variant selector */}
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Choose a variant:
            <select
              value={selectedVariant?.id || ""}
              onChange={(e) =>
                setSelectedVariant(product.variants.find((v) => v.id === parseInt(e.target.value)))
              }
              style={{ marginLeft: "0.5rem", padding: "0.5rem" }}
            >
              {product.variants?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — ${v.retail_price}
                </option>
              ))}
            </select>
          </label>

          {/* ✅ Show selected price */}
          {selectedVariant && (
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9f6baa" }}>
              ${selectedVariant.retail_price}
            </p>
          )}

          <button
            onClick={addToCart}
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
