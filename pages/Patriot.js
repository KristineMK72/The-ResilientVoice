"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const PATRIOT_PRODUCT_IDS = [
  "405190886",
  "405370119",
  "405370052",
  "405369860",
  "405368640",
  "405370509",
  "405508342",
  "405510593",
  "406371194",
  "406372796",
  // 👈 your newest shirt
  // add other Patriot product IDs here
];

// --- New Definitions for Rotation and Buzzwords ---

const PATRIOTIC_PHRASES = [
  "Freedom isn't free. Thank a veteran.",
  "Honor the oath. Respect the service.",
  "Always faithful. Always prepared.",
  "First Responders: Courage under fire.",
  "United we stand, for Faith, Freedom, and Family.",
  "Land of the free, because of the brave.",
  "Support those who protect and serve.",
  "God, Country, Corps.",
];

const SERVICE_BUZZWORDS = [
  "Valor",
  "Duty",
  "Honor",
  "Military",
  "Veterans",
  "Service",
  "Police",
  "Fire",
  "EMS",
  "Freedom",
  "Liberty",
  "Sacrifice",
  "Patriot",
];

// --------------------------------------------------

export default function Patriot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- New State for Phrase Rotation ---
  const [currentPhrase, setCurrentPhrase] = useState(0);

  // --- Product Loading Logic (Existing) ---
  useEffect(() => {
    async function loadProducts() {
      const loaded = [];
      let hasError = false;

      for (const id of PATRIOT_PRODUCT_IDS) {
        try {
          const res = await fetch(`/api/printful-product/${id}`);
          if (res.ok) {
            const data = await res.json();
            loaded.push(data);
          } else {
            console.warn(`Failed to load ${id}: ${res.status}`);
          }
        } catch (err) {
          console.error(`Error loading ${id}:`, err);
          hasError = true;
        }
      }

      setProducts(loaded);
      setLoading(false);
      if (hasError && loaded.length === 0) {
        setError("Failed to load products — check console.");
      }
    }

    loadProducts();
  }, []);

  // --- Phrase Rotation Logic (New) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase(
        (prevIndex) => (prevIndex + 1) % PATRIOTIC_PHRASES.length
      );
    }, 5000); // Change phrase every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  // ------------------------------------


  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    const productImage = product.thumbnail_url || product.preview_url;

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.variants?.[0]?.price) || 29.99,
        image: productImage,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <>
      <Head>
        <title>Patriot Collection | The Resilient Voice</title>
        <meta
          name="description"
          content="Bold truthwear for those who stand for faith, freedom, and country."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)",
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}
      >
        {/* animated patriotic glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #ffffff 120deg, #0000ff 360deg)",
            opacity: 0.08,
            animation: "spin 40s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        {/* Hero section */}
        <div
          style={{
            textAlign: "center",
            padding: "6rem 1rem 4rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <Image
              src="/gritngrlogo.png"
              alt="Patriot Collection"
              width={600}
              height={600}
              priority
              style={{
                maxWidth: "90vw",
                height: "auto",
                filter: "drop-shadow(0 0 40px rgba(255,255,255,0.6))",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "5rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #ff0000, #ffffff, #0000ff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              margin: "1rem 0 2rem",
              letterSpacing: "0.08em",
            }}
          >
            PATRIOT COLLECTION
          </h1>

          <p
            style={{
              fontSize: "2rem",
              maxWidth: "900px",
              margin: "0 auto 2rem",
              lineHeight: "1.6",
              color: "#ccc",
            }}
          >
            For those who stand unapologetically for faith, freedom, and country — and for those who serve to protect it.
            This collection is a tribute to bold voices, sacred values, and the American spirit.
            We honor veterans, active-duty military, law enforcement, and EMS — the everyday heroes who carry the weight of our safety and liberty.
            Every purchase helps us give back to organizations that support their service, sacrifice, and recovery.
            Designed to speak truth. Built to give back.
          </p>
        </div>

        {/* --- New: Patriotic Phrase Rotation (Sticky) --- */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#0000ff", // Using blue from the patriotic colors
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
            minHeight: "3.5rem", // Ensures consistent height
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "4px solid #ff0000", // Red accent
          }}
        >
          {PATRIOTIC_PHRASES[currentPhrase]}
        </div>
        
        {/* --- New: Buzzword cloud --- */}
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 4rem",
            padding: "0 1rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {SERVICE_BUZZWORDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.6rem 1.2rem",
                background: "#fff",
                borderRadius: "20px",
                fontSize: "1.1rem",
                color: "#ff0000", // Using red from the patriotic colors
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontWeight: "700",
                textTransform: "uppercase",
                border: "2px solid #0000ff",
              }}
            >
              {word}
            </span>
          ))}
        </div>
        {/* ------------------------------------------------- */}

        {/* Product grid */}
        <div
          style={{
            padding: "2rem 1rem 6rem",
            display: "grid",
            gap: "4rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            maxWidth: "1600px",
            margin: "0 auto",
            position: "relative",
            zIndex: 10,
          }}
        >
          {loading && (
            <p
              style={{
                textAlign: "center",
                fontSize: "2rem",
                color: "#ff0000",
                gridColumn: "1/-1",
              }}
            >
              Loading Patriot collection…
            </p>
          )}
          {error && (
            <p
              style={{
                textAlign: "center",
                fontSize: "1.8rem",
                color: "#ff4444",
                gridColumn: "1/-1",
              }}
            >
              {error}
            </p>
          )}
          {!loading && !error && products.length === 0 && (
            <p
              style={{
                textAlign: "center",
                fontSize: "2rem",
                color: "#aaa",
                gridColumn: "1/-1",
              }}
            >
              No Patriot products loaded yet
            </p>
          )}
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                borderRadius: "28px",
                overflow: "hidden",
                background: "white",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              }}
            >
              <Link href={`/product/${product.id}`}>
                <div
                  style={{
                    height: "460px",
                    position: "relative",
                    background: "#111",
                  }}
                >
                  <Image
                    src={product.thumbnail_url || product.preview_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain", padding: "40px" }}
                    priority
                  />
                </div>
              </Link>
              <div style={{ padding: "2.5rem", textAlign: "center" }}>
                <h3
                  style={{
                    margin: "0 0 1rem",
                    fontSize: "1.7rem",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    margin: "1rem 0",
                    fontSize: "2.2rem",
                    fontWeight: "bold",
                    color: "#ff0000",
                  }}
                >
                  {formatPrice(product.variants?.[0]?.price)}
                </p>
                <Link href={`/product/${product.id}`}>
                  <a
                    style={{
                      display: "inline-block",
                      width: "100%",
                      padding: "1.4rem",
                      background: "#ff0000",
                      color: "white",
                      borderRadius: "16px",
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    View Details →
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
