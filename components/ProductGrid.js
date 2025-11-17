// components/ProductGrid.js
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];

        const filtered = category
          ? arr.filter(p => p.collection === category.toLowerCase())
          : arr;

        setProducts(filtered);
        setLoading(false);
      });
  }, [category]);

  const addToCart = (product) => {
    const variant = product.sync_variants[0];
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
      return [...current, { id: product.id, name: product.name, price, quantity: 1, image }];
    });
  };

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Loading your pieces…
      </p>
    );
  }

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{
      display: "grid",
      gap: "2.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      padding: "2rem"
    }}>
      {products.map(product => {
        const v = product.sync_variants?.[0];
        const price = v?.retail_price || "29.99";

        const img =
          v?.files?.find(f => f.type === "preview")?.url ||
          v?.files?.[0]?.url ||
          product.thumbnail ||
          "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <div key={product.id} style={{
            border: "1px solid #eee",
            borderRadius: "16px",
            overflow: "hidden",
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
          }}>
            <Link href={`/product/${product.id}`}>
              <Image
                src={img}
                alt={product.name}
                width={600}
                height={600}
                style={{ width: "100%", height: "360px", objectFit: "cover" }}
              />
            </Link>

            <div style={{ padding: "1.8rem" }}>
              <h3 style={{ fontSize: "1.35rem", marginBottom: "0.8rem" }}>
                {product.name}
              </h3>

              <p style={{
                fontSize: "1.9rem",
                fontWeight: "bold",
                color: "#9f6baa",
                margin: "0.6rem 0"
              }}>
                ${price}
              </p>

              <button
                onClick={() => addToCart(product)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "#9f6baa",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  cursor: "pointer"
                }}>
                Add to Cart
              </button>

              {itemCount > 0 && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <Link href="/cart"
                    style={{ color: "#9f6baa", textDecoration: "underline", fontSize: "1rem" }}>
                    View Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
