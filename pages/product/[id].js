import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); // NEW: Track selected size
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load cart on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // 2. Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 3. FETCH THE PRODUCT (The Big Fix)
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // 👇 NEW: Fetches from your specific API file
    fetch(`/api/printful-product/${id}`)
      .then((r) => r.json())
      .then((data) => {
        // Printful returns { sync_product: {...}, sync_variants: [...] }
        // We combine them into one easy object
        const formattedProduct = {
          ...data.sync_product,
          variants: data.sync_variants || [],
        };

        setProduct(formattedProduct);

        // Auto-select the first size (e.g., Small)
        if (formattedProduct.variants.length > 0) {
          setSelectedVariant(formattedProduct.variants[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        setLoading(false);
      });
  }, [id]);

  // 4. ADD TO CART (Updated for Sizes)
  const addToCart = () => {
    if (!product || !selectedVariant) return;

    // Use the specific price of the selected size
    const price = parseFloat(selectedVariant.retail_price);

    // Use the variant image, or fall back to the main thumbnail
    const image =
      selectedVariant.files?.find((f) => f.type === "preview")?.url ||
      product.thumbnail_url ||
      "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

    setCart((current) => {
      // Check if this exact product AND size is already in cart
      const exists = current.find(
        (i) => i.id === product.id && i.variantId === selectedVariant.id
      );

      if (exists) {
        return current.map((i) =>
          i.id === product.id && i.variantId === selectedVariant.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...current,
        {
          id: product.id,
          variantId: selectedVariant.id, // Important for Printful orders
          name: `${product.name} - ${selectedVariant.name}`, // Adds "Size S" to name
          price,
          quantity: 1,
          image,
        },
      ];
    });
  };

  // 5. LOADING / ERROR STATES
  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Loading...
      </p>
    );

  if (!product)
    return (
      <p style={{ textAlign: "center", padding: "6rem", fontSize: "1.4rem" }}>
        Product not found
      </p>
    );

  // Determine current display image and price
  const currentImage =
    selectedVariant?.files?.find((f) => f.type === "preview")?.url ||
    product.thumbnail_url;

  const currentPrice = selectedVariant
    ? selectedVariant.retail_price
    : "Loading...";

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "4rem auto",
        padding: "0 2rem",
        display: "grid",
        gap: "3rem",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* IMAGE SECTION */}
      <div>
        <Image
          src={currentImage}
          alt={product.name}
          width={600}
          height={600}
          style={{ width: "100%", borderRadius: "16px", objectFit: "cover" }}
          priority
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
            margin: "1.5rem 0",
          }}
        >
          ${currentPrice}
        </p>

        {/* SIZE SELECTOR (New!) */}
        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}
          >
            Select Size:
          </label>
          <select
            value={selectedVariant?.id || ""}
            onChange={(e) => {
              const v = product.variants.find(
                (v) => v.id === parseInt(e.target.value)
              );
              setSelectedVariant(v);
            }}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} - ${v.retail_price}
              </option>
            ))}
          </select>
        </div>

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
            cursor: "pointer",
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
                textDecoration: "underline",
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
