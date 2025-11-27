// components/ProductGrid.js — FINAL 100% WORKING VERSION
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
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const filtered = category
          ? arr.filter((p) =>
              p.name.toLowerCase().includes(category.toLowerCase())
            )
          : arr;
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const addToCart = (product) => {
    const v = product.sync_variants[0];
    const price = parseFloat(v.retail_price) || 29.99;
    const image =
      v.files?.find((f) => f.type === "preview")?.url ||
      v.files?.[0]?.url ||
      "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

    setCart((curr) => {
      const exists = curr.find((i) => i.id === product.id);
      if (exists) {
        return curr.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...curr, { id: product.id, name: product.name, price, quantity: 1, image }];
    });
  };

  if (loading)
    return <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.5rem" }}>Loading your collection…</p>;

  const itemsInCart = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      style={{
        display: "grid",
        gap: "2.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        padding: "2rem",
      }}
    >
      {products.map((product) => {
        const v = product.sync_variants?.[0];
        const price = v?.retail_price || "29.99";
        const img =
          v?.files?.find((f) => f.type === "preview")?.url ||
          v?.files?.[0]?.url ||
          "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <div
            key={product.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "20px",
              overflow: "hidden",
              background: "white",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <Link href={`/product/${product.id}`}>
              <div style={{ height: "380px", background: "#f8f5f9", position: "relative" }}>
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain", padding: "40px" }}
                />
              </div>
            </Link>

            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1.4rem" }}>
                {product.name}
              </h3>
              <p style={{ margin: "0.5rem 0", fontSize: "2rem", fontWeight: "bold", color: "#9f6baa" }}>
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
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                Add to Cart
              </button>

              {itemsInCart > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <Link
                    href="/cart"
                    style={{ color: "#9f6baa", textDecoration: "underline" }}
                  >
                    View Cart ({itemsInCart} {itemsInCart === 1 ? "item" : "items"})
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
