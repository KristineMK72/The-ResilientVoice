import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load cart
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // 2. Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 3. Fetch Product with Debugging
  useEffect(() => {
    if (!id) return;

    console.log("Fetching ID:", id); // DEBUG LOG

    fetch(`/api/printful-product/${id}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("API DATA RECEIVED:", data); // DEBUG LOG - Check your browser console!

        // Safety check: Ensure sync_product exists
        const baseProduct = data.sync_product || data; 
        const variants = data.sync_variants || [];

        const formattedProduct = {
          ...baseProduct,
          variants: variants,
        };

        setProduct(formattedProduct);

        // Auto-select first variant
        if (variants.length > 0) {
          setSelectedVariant(variants[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        setLoading(false);
      });
  }, [id]);

  // Helper function to safely find an image
  const getImageUrl = () => {
    // 1. Try selected variant preview
    const variantImage = selectedVariant?.files?.find((f) => f.type === "preview")?.url;
    if (variantImage) return variantImage;

    // 2. Try selected variant generic image
    if (selectedVariant?.files?.[0]?.url) return selectedVariant.files[0].url;

    // 3. Try main product thumbnail
    if (product?.thumbnail_url) return product.thumbnail_url;

    // 4. LAST RESORT: A placeholder image so the app doesn't crash
    return "https://via.placeholder.com/600x600?text=No+Image+Available";
  };

  const addToCart = () => {
    if (!product || !selectedVariant) return;

    const price = parseFloat(selectedVariant.retail_price);
    const image = getImageUrl();

    setCart((current) => {
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
          variantId: selectedVariant.id,
          name: `${product.name} - ${selectedVariant.name}`,
          price,
          quantity: 1,
          image,
        },
      ];
    });
  };

  if (loading) return <p style={{ padding: "4rem", textAlign: "center" }}>Loading...</p>;
  if (!product) return <p style={{ padding: "4rem", textAlign: "center" }}>Product not found</p>;

  const currentImage = getImageUrl();
  const currentPrice = selectedVariant ? selectedVariant.retail_price : "---";
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 2rem", display: "grid", gap: "3rem", gridTemplateColumns: "1fr 1fr" }}>
      
      {/* IMAGE SECTION */}
      <div>
        <Image
          src={currentImage}
          alt={product.name || "Product Image"}
          width={600}
          height={600}
          style={{ width: "100%", borderRadius: "16px", objectFit: "cover" }}
          priority
          unoptimized={true} // This helps if external images are blocked
        />
      </div>

      {/* INFO SECTION */}
      <div>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>{product.name}</h1>
        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f6baa", margin: "1.5rem 0" }}>${currentPrice}</p>

        {/* SIZE SELECTOR */}
        {product.variants.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Select Option:</label>
            <select
              value={selectedVariant?.id || ""}
              onChange={(e) => {
                const v = product.variants.find((v) => v.id === parseInt(e.target.value));
                setSelectedVariant(v);
              }}
              style={{ width: "100%", padding: "10px", fontSize: "1rem", borderRadius: "8px", border: "1px solid #ccc" }}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - ${v.retail_price}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={addToCart}
          style={{ width: "100%", padding: "1.2rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "12px", fontSize: "1.3rem", marginTop: "2rem", cursor: "pointer" }}
        >
          Add to Cart
        </button>

        {itemCount > 0 && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/cart" style={{ color: "#9f6baa", fontSize: "1.2rem", textDecoration: "underline" }}>
              View Cart ({itemCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
