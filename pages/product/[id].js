"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 🏆 THE REWRITTEN AND FIXED PRODUCT PAGE COMPONENT 🏆
export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  
  // 🟢 NEW: State to track the ID of the selected variant
  const [selectedVariantId, setSelectedVariantId] = useState(null); 

  useEffect(() => {
    if (!id) return;

    fetch(`/api/printful-product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // 🟢 FIX 1: Set the default selected variant (the first one) when data loads
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id); 
        }
      })
      .catch((err) => console.error("Product fetch error:", err));
  }, [id]);

  // 🟢 FIX 2: Updated Cart Handler to use the selected variant ID
  const handleAddToCart = () => {
    if (!selectedVariantId) {
      alert("Please select a size first!");
      return;
    }

    // Find the full data object for the selected size/variant
    const variantToAdd = product.variants.find((v) => v.id === selectedVariantId);

    if (!variantToAdd) {
      alert("Error: Could not find variant details.");
      return;
    }

    // Construct the cart item using the selected variant's details
    const cartItem = {
      id: selectedVariantId, // CRITICAL: Use the unique VARIANT ID for cart tracking
      productId: product.id, 
      name: variantToAdd.name, // The full variant name (e.g., "T-Shirt / M")
      price: variantToAdd.price, 
      image: product.thumbnail_url,
      quantity: 1,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Find item based on its unique variant ID
    const exists = existingCart.find((item) => item.id === cartItem.id);

    if (exists) {
      exists.quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };
  
  // Display loading screen if product is null
  if (!product)
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "white", fontSize: "1.5rem" }}>
        Loading...
      </div>
    );

  // Find the price of the currently selected variant (defaults to 0 if none is selected)
  const currentPrice = product.variants.find(v => v.id === selectedVariantId)?.price || product.variants?.[0]?.price || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        padding: "4rem 1rem",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* Backdrop glow (using a neutral glow for safety) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "conic-gradient(from 180deg at 50% 50%, #4f46e5 0deg, #be185d 120deg, #4f46e5 360deg)",
          opacity: 0.08,
          animation: "spin 40s linear infinite",
          pointerEvents: "none",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Product Image */}
      <div style={{ maxWidth: "500px", margin: "0 auto 2rem" }}>
        <Image
          src={product.thumbnail_url || product.image || "/Logo.jpeg"} 
          alt={product.name}
          width={600}
          height={600}
          priority
          style={{ borderRadius: "16px", boxShadow: "0 0 40px rgba(255,255,255,0.2)" }}
        />
      </div>

      {/* Product Details */}
      <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: "1rem 0" }}>
        {product.name}
      </h1>
      {product.description && (
        <p style={{ fontSize: "1.4rem", maxWidth: "700px", margin: "1.5rem auto", lineHeight: "1.7", opacity: 0.9 }}>
          {product.description}
        </p>
      )}
      
      {/* Display Price (uses the price of the currently selected variant) */}
      <p style={{ fontSize: "2.4rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${parseFloat(currentPrice).toFixed(2)}
      </p>

      {/* 🟢 FIX 3: Variant Selection UI */}
      {product.variants?.length > 0 && (
        <div className="size-selector" style={{ margin: "2rem auto 2.5rem", maxWidth: "400px" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontWeight: "600" }}>
            Choose Your Size:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {product.variants.map((variant) => {
              // Extracts the size label (e.g., "S") from the full name string
              const sizeName = variant.name.split('/').pop().trim();
              const isSelected = variant.id === selectedVariantId;

              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  style={{
                    padding: "10px 20px",
                    border: isSelected ? "3px solid #ff4444" : "1px solid #475569",
                    backgroundColor: isSelected ? "#ff444420" : "transparent",
                    color: isSelected ? "#ff4444" : "white",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* End Variant Selection UI */}


      {/* Add to Cart Button */}
      {!added ? (
        <button
          onClick={handleAddToCart}
          style={{
            padding: "1.2rem 3rem",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(255,68,68,0.4)",
            transition: "all 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "2rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Added to cart!
          </p>
          <Link href="/cart">
            <a
              style={{
                display: "inline-block",
                padding: "1rem 2.5rem",
                background: "white",
                color: "#ff4444",
                borderRadius: "12px",
                fontWeight: "bold",
                textDecoration: "none",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              }}
            >
              Go to Cart →
            </a>
          </Link>
        </div>
      )}

      {/* Back to Collection */}
      <div style={{ marginTop: "3rem" }}>
        <Link href="/saved-by-grace">
          <a
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(90deg, #ff4444, #4444ff)",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "1.2rem",
              display: "inline-block",
            }}
          >
            ← Explore Full Collection
          </a>
        </Link>
      </div>
    </div>
  );
}
