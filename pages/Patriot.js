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
];

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

export default function Patriot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      const loaded = [];
      let hadAnyError = false;

      for (const id of PATRIOT_PRODUCT_IDS) {
        try {
          const res = await fetch(`/api/printful-product/${id}`);
          const data = await res.json().catch(() => ({}));

          if (res.ok && data?.sync_product_id) {
            loaded.push(data);
          } else {
            hadAnyError = true;
            console.warn(`Failed to load ${id}: ${res.status}`, data);
          }
        } catch (err) {
          hadAnyError = true;
          console.error(`Error loading ${id}:`, err);
        }
      }

      setProducts(loaded);
      setLoading(false);

      if (loaded.length === 0) {
        setError(
          hadAnyError
            ? "Failed to load products — check console."
            : "No products returned."
        );
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % PATRIOTIC_PHRASES.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // (Optional) If you still want "add to cart" from the grid, keep this.
  // Note: your Product Page already adds to cart more correctly with variants,
  // so most stores just use "View Details" here.
  const addToCart = (product) => {
    const firstVariant = product?.variants?.[0];
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const cartItem = {
      sync_product_id: product.sync_product_id,
      sync_variant_id: firstVariant?.sync_variant_id,
      catalog_variant_id: firstVariant?.catalog_variant_id,
      name: product.name,
      price: firstVariant?.retail_price || "0",
      image: product.thumbnail_url || firstVariant?.preview_url || "/Logo.jpeg",
      quantity: 1,
      is_synced: true,
    };

    // If we don't have a variant, don’t add (Stripe/Printful won’t know what to fulfill)
    if (!cartItem.sync_variant_id) {
      alert("Please open the product and choose a variant first.");
      return;
    }

    const existing = cart.find(
      (item) => item.sync_variant_id === cartItem.sync_variant_id
    );

    if (existing) existing.quantity += 1;
    else cart.push(cartItem);

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <>
      <Head>
        <title>Patriot Collection | Grit & Grace</title>
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
            For those who stand unapologetically for faith, freedom, and country —
            and for those who serve to protect it.
          </p>
        </div>

        {/* Phrase rotation */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#0000ff",
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
            minHeight: "3.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "4px solid #ff0000",
          }}
        >
          {PATRIOTIC_PHRASES[currentPhrase]}
        </div>

        {/* Buzzword cloud */}
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
                color: "#ff0000",
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

          {products.map((product) => {
            const price = product?.variants?.[0]?.retail_price || "0";
            const href = `/product/${product.sync_product_id}`;

            return (
              <div
                key={product.sync_product_id}
                style={{
                  borderRadius: "28px",
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                }}
              >
                <Link href={href}>
                  <div
                    style={{
                      height: "460px",
                      position: "relative",
                      background: "#111",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={product.thumbnail_url || product.variants?.[0]?.preview_url}
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
                    {formatPrice(price)}
                  </p>

                  <Link href={href}>
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

                  {/* Optional quick add */}
                  {/* <button onClick={() => addToCart(product)}>Quick Add</button> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
