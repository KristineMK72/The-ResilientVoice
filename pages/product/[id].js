// pages/product/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch product by ID
  useEffect(() => {
    if (!id) return;

    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found || null);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const variant = product.sync_variants?.[0] || {};
    const price = parseFloat(variant.retail_price) || 29.99;

    const image =
      variant.files?.find(f => f.type === "preview")?.url ||
      variant.files?.[0]?.url ||
      product.thumbnail ||
      "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

    setCart(current => {
      const exists = current.find(i => i.id === product.id);
      if (exists) {
        return current.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...current,
        { id: product.id, name: product.name, price, quantity: 1, image }
      ];
    });
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Loading…
      </p>
    );

  if (!product)
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Product not found
      </p>
    );

  const variant = product.sync_variants?.[0] || {};
  const price = variant.retail_price || "29.99";

  const img =
    variant.files?.find(f => f.type === "preview")?.url ||
    variant.files?.[0]?.url ||
    product.thumbnail ||
    "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "4rem auto",
        padding: "0 2rem",
        display: "grid",
        gap: "3rem",
        gridTemplateColumns: "1fr 1fr"
      }}
    >
      {/* IMAGE SECTION */}
      <div>
        <Image
          src={img}
          alt={product.name}
          width={600}
          height={600}
          style={{ width: "100%", borderRadius: "16px", objectFit: "cover" }}
        />
      </div>

      {/* INFO SECTION */}
      <div>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>
          {product.name}
        </h1>

        <p
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#9f6baa",
            margin: "1.5rem 0"
          }}
        >
          ${price}
        </p>

        <p style={{ fontSize: "1.2rem", color: "#555", lineHeight: "1.7" }}>
          Crafted for resilience. Every piece supports healing, empowerment, and
          the journey forward.
        </p>

        <button
          onClick={addToCart}
          style={{
            width: "100%",
            padding: "1.2rem",
            background: "#9f6baa",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.3rem",
            marginTop: "2rem",
            cursor: "pointer"
          }}
        >
          Add to Cart
        </button>

        {itemCount > 0 && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link
              href="/cart"
              style={{
                color: "#9f6baa",
                fontSize: "1.2rem",
                textDecoration: "underline"
              }}
            >
              View Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
