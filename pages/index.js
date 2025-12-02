"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// *** NEW: List of IDs to feature on the homepage ***
const FEATURED_PRODUCT_IDS = [
  "402034024", // Example ID for Saved By Grace (original shirt)
  "405190886", // Patriot shirt ID (your new shirt)
];
// ****************************************************

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]); // Changed to an array
  
  useEffect(() => {
    async function loadFeaturedProducts() {
      const loaded = [];
      for (const id of FEATURED_PRODUCT_IDS) {
        try {
          const res = await fetch(`/api/printful-product/${id}`);
          if (res.ok) {
            const data = await res.json();
            // Assign a collection key for linking buttons
            data.collection = (id === "405190886") ? "Patriot" : "Saved By Grace";
            loaded.push(data);
          }
        } catch (err) {
          console.error(`Error loading featured product ${id}:`, err);
        }
      }
      setFeaturedProducts(loaded);
    }
    loadFeaturedProducts();
  }, []);

  return (
    <>
      <Head>
        <title>Grit & Grace: A Resilient Voice Brand | Patriotic Truth Wear</title>
        <meta name="description" content="American-made apparel for those who refuse to be silenced." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* animated glow background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #0000ff 120deg, #ff0000 360deg)",
            opacity: 0.08,
            animation: "spin 30s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Logo */}
        <div style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <Image
  src="/gritngrlogo.png"   // ✅ new logo file in /public
  alt="Grit & Grace Logo"
  width={700}
  height={700}
  priority
  style={{
    maxWidth: "95vw",
    height: "auto",
    filter: "drop-shadow(0 0 50px rgba(255,255,255,0.7))",
  }}
/>
        </div>

        {/* *** UPDATED: FEATURED PRODUCT TEASERS *** */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '30px', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            marginBottom: "2rem", 
            position: 'relative', 
            zIndex: 10 
          }}
        >
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              style={{ padding: "1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "16px", maxWidth: "350px" }}
            >
              <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 1rem' }}>{product.collection} Featured</h4>
              <Image
                src={product.image || product.thumbnail_url}
                alt={product.name}
                width={300}
                height={300}
                style={{ borderRadius: "12px", marginBottom: "1rem" }}
              />
              <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "#fff" }}>{product.name}</h3>
              <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#ff6b6b", margin: "0 0 1rem" }}>
                ${product.variants?.[0]?.price}
              </p>

              <Link href={`/product/${product.id}`} legacyBehavior>
                <a style={{ 
                  display: "inline-block", 
                  padding: "0.8rem 1.5rem", 
                  background: "#ff6b6b", 
                  color: "white", 
                  borderRadius: "8px", 
                  textDecoration: "none",
                  fontWeight: "600"
                }}>
                  View Product
                </a>
              </Link>
            </div>
          ))}
        </div>
        {/* *** END FEATURED PRODUCT TEASERS *** */}
        
        {/* Title */}
        <h1
          style={{
            fontSize: "4.8rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #ff4444, #ffffff, #4444ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            margin: "1rem 0 2rem",
            letterSpacing: "0.08em",
          }}
        >
          GRIT & GRACE
        </h1>

        {/* Mission Statement */}
        <p
          style={{
            fontSize: "1.9rem",
            maxWidth: "800px",
            margin: "0 auto 2rem",
            lineHeight: "1.6",
          }}
        >
          Grit & Grace is more than apparel — it's the retail movement founded by **The Resilient Voice** to unite Christianity, patriotism, and social sustainability.
          Every design speaks truth with boldness, while proceeds support nonprofits tackling homelessness, housing insecurity,
          mental health, and suicide prevention. Wear your story. Live your values. Stand for hope.
        </p>

        {/* *** NEW: COLLECTION CALL-TO-ACTION BUTTONS *** */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', zIndex: 10 }}>
            {/* Saved By Grace Button */}
            <Link
              href="/saved-by-grace"
              style={{
                marginTop: "2rem",
                padding: "1.2rem 2.4rem",
                fontSize: "1.6rem",
                fontWeight: "600",
                background: "linear-gradient(90deg, #ff4444, #4444ff)",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 0 25px rgba(255,255,255,0.2)",
              }}
            >
              Shop Saved By Grace
            </Link>
             {/* Patriot Button */}
<Link
  href="/Patriot"
  style={{
    marginTop: "2rem",
    padding: "1.2rem 2.4rem",
    fontSize: "1.6rem",
    fontWeight: "600",
    background: "#00bfa5",
    color: "white",
    borderRadius: "12px",
    textDecoration: "none",
    boxShadow: "0 0 25px rgba(255,255,255,0.2)",
  }}
>
  Shop Patriot
</Link>

{/* Social Button */}
<Link
  href="/Social"
  style={{
    marginTop: "2rem",
    padding: "1.2rem 2.4rem",
    fontSize: "1.6rem",
    fontWeight: "600",
    background: "#ff6b6b",
    color: "white",
    borderRadius: "12px",
    textDecoration: "none",
    boxShadow: "0 0 25px rgba(255,255,255,0.2)",
  }}
>
  Shop Social
</Link>
        </div>
        {/* *** END CALL-TO-ACTION BUTTONS *** */}
      </div>
    </>
  );
}
