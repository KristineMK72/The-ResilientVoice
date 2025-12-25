import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ============================
   CONFIG
============================ */
const FEATURED_PRODUCT_IDS = [
  "402034024", // Saved By Grace
  "405190886", // Patriot

  // ✅ Social featured items (new)
  "408880904", // Messy
  "408880721", // Accidental Cheerleader
  "408880474", // Men’s Heavy Tee
  "408880393", // Heavy Long Sleeve
  "408875632", // The Climb/Unforgettable
];

const SOCIAL_IDS = new Set([
  "408880904",
  "408880721",
  "408880474",
  "408880393",
  "408875632",
]);

function getCollectionLabel(id) {
  if (id === "405190886") return "Patriot";
  if (id === "402034024") return "Saved By Grace";
  if (SOCIAL_IDS.has(id)) return "Social";
  return "Featured";
}

function money(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const [emailStatus, setEmailStatus] = useState({
    state: "idle", // idle | loading | success | error
    message: "",
  });

  /* ============================
     LOAD FEATURED PRODUCTS
  ============================ */
  useEffect(() => {
    let alive = true;

    async function loadFeatured() {
      setLoadingFeatured(true);

      try {
        const results = await Promise.all(
          FEATURED_PRODUCT_IDS.map(async (id) => {
            const res = await fetch(`/api/printful-product/${id}`);
            if (!res.ok) return null;
            const data = await res.json();

            return {
              ...data,
              collection: getCollectionLabel(id),
            };
          })
        );

        if (!alive) return;

        const clean = results.filter(Boolean);
        setFeaturedProducts(clean);
        setActiveIndex(0);
      } catch (e) {
        console.error("Featured load failed:", e);
        if (alive) setFeaturedProducts([]);
      } finally {
        if (alive) setLoadingFeatured(false);
      }
    }

    loadFeatured();
    return () => {
      alive = false;
    };
  }, []);

  /* ============================
     CAROUSEL ROTATION
  ============================ */
  useEffect(() => {
    if (!featuredProducts.length) return;
    const t = setInterval(
      () => setActiveIndex((i) => (i + 1) % featuredProducts.length),
      4500
    );
    return () => clearInterval(t);
  }, [featuredProducts.length]);

  const activeProduct = useMemo(
    () => featuredProducts[activeIndex] || null,
    [featuredProducts, activeIndex]
  );

  const activeImage = useMemo(() => {
    if (!activeProduct) return "/gritngrlogo.png";
    const v0 = activeProduct.variants?.[0];
    // Prefer thumbnail (most reliable), fallback to variant preview
    return activeProduct.thumbnail_url || v0?.preview_url || "/gritngrlogo.png";
  }, [activeProduct]);

  const activePrice = useMemo(() => {
    if (!activeProduct) return "0.00";
    const v0 = activeProduct.variants?.[0];
    return money(v0?.retail_price);
  }, [activeProduct]);

  const activeProductId = activeProduct?.sync_product_id;

  /* ============================
     EMAIL SIGNUP
  ============================ */
  async function onEmailSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value?.trim();
    if (!email) return;

    setEmailStatus({ state: "loading", message: "" });

    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmailStatus({ state: "success", message: "You’re in! Welcome ♥️" });
        form.reset();
        setTimeout(() => {
          window.location.href = "/welcome";
        }, 900);
      } else {
        setEmailStatus({ state: "error", message: "Something went wrong." });
      }
    } catch (err) {
      console.error(err);
      setEmailStatus({
        state: "error",
        message: "Network error — try again.",
      });
    }
  }

  return (
    <>
      <Head>
        <title>Grit & Grace | Faith, Freedom, Purpose</title>
        <meta
          name="description"
          content="Faith-driven apparel born from storms. Every purchase supports mental health, suicide prevention, and homelessness relief."
        />
      </Head>

      <div className="page">
        <div className="glow" />

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: radial-gradient(circle at center, #0f172a 0%, #000 100%);
            color: white;
            padding: 2rem 1.25rem 2.5rem;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .glow {
            position: absolute;
            inset: 0;
            background: conic-gradient(from 180deg, #ff0000, #0000ff, #ff0000);
            opacity: 0.08;
            animation: spin 30s linear infinite;
            pointer-events: none;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .content {
            position: relative;
            z-index: 10;
            max-width: 1100px;
            margin: 0 auto;
          }

          /* ===== Top Video ===== */
          .heroVideoWrap {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto 1.5rem;
            border-radius: 22px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .heroVideo {
            width: 100%;
            height: auto;
            display: block;
          }

          .logoRow {
            display: grid;
            place-items: center;
            margin-top: 1.25rem;
          }

          .heroTitle {
            font-size: clamp(2.8rem, 6vw, 4.6rem);
            font-weight: 950;
            letter-spacing: 0.08em;
            background: linear-gradient(90deg, #ff4444, #fff, #4444ff);
            -webkit-background-clip: text;
            color: transparent;
            margin: 0.75rem 0 0.25rem;
          }

          .heroTagline {
            max-width: 900px;
            margin: 1rem auto 1.5rem;
            line-height: 1.6;
            opacity: 0.92;
          }

          .ctaRow {
            display: flex;
            gap: 14px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 2rem;
          }

          .btn {
            padding: 0.95rem 1.4rem;
            border-radius: 12px;
            font-weight: 800;
            text-decoration: none;
            color: white;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
            display: inline-block;
          }

          .btnPrimary {
            background: linear-gradient(90deg, #ff4444, #4444ff);
          }
          .btnPatriot {
            background: #00bfa5;
          }
          .btnSocial {
            background: #ff6b6b;
          }

          /* ===== Carousel ===== */
          .carousel {
            max-width: 560px;
            margin: 2rem auto;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .price {
            font-size: 1.4rem;
            font-weight: 900;
            color: #ff6b6b;
            margin: 0.5rem 0 1rem;
          }

          .dots {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 12px;
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.3);
            border: none;
            cursor: pointer;
          }

          .dotActive {
            background: white;
          }

          /* ===== Email ===== */
          .emailBox {
            margin-top: 2.5rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.07);
            border-radius: 18px;
            max-width: 520px;
            margin-left: auto;
            margin-right: auto;
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .emailForm {
            display: flex;
            gap: 10px;
            margin-top: 1rem;
          }

          .emailInput {
            flex: 1;
            padding: 0.8rem;
            border-radius: 10px;
            border: none;
          }

          .emailBtn {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 0.8rem 1.2rem;
            border-radius: 10px;
            font-weight: 800;
            cursor: pointer;
          }

          .emailBtn:disabled {
            opacity: 0.6;
          }

          .emailMsg {
            margin-top: 0.75rem;
            font-weight: 800;
          }

          .success {
            color: #b9ffcc;
          }
          .error {
            color: #ffb4b4;
          }
        `}</style>

        <div className="content">
          {/* ✅ TOP VIDEO (no text overlay) */}
          <div className="heroVideoWrap">
            <video
              className="heroVideo"
              src="/GritStyle.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              preload="metadata"
            />
          </div>

          {/* Logo */}
          <div className="logoRow">
            <Image
              src="/gritngrlogo.png"
              alt="Grit & Grace Logo"
              width={520}
              height={520}
              priority
            />
          </div>

          <h1 className="heroTitle">GRIT & GRACE</h1>

          <p className="heroTagline">
            Faith-driven apparel born from storms. Founded by{" "}
            <strong>The Resilient Voice</strong>. Every purchase supports mental
            health, suicide prevention, and homelessness relief.
          </p>

          <div className="ctaRow">
            <Link href="/saved-by-grace" className="btn btnPrimary">
              Shop Saved By Grace
            </Link>
            <Link href="/Patriot" className="btn btnPatriot">
              Shop Patriot
            </Link>
            <Link href="/Social" className="btn btnSocial">
              Shop Social
            </Link>
          </div>

          {/* Featured */}
          {loadingFeatured ? (
            <div className="carousel">Loading featured…</div>
          ) : activeProduct ? (
            <div className="carousel">
              <div style={{ opacity: 0.9, fontWeight: 800 }}>
                {activeProduct.collection} Featured
              </div>

              <div style={{ margin: "12px 0" }}>
                <Image
                  src={activeImage}
                  alt={activeProduct.name || "Featured product"}
                  width={520}
                  height={520}
                  style={{ borderRadius: 14, objectFit: "contain" }}
                />
              </div>

              <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>
                {activeProduct.name}
              </div>

              <div className="price">${activePrice}</div>

              {activeProductId ? (
                <Link href={`/product/${activeProductId}`} className="btn btnPrimary">
                  View Product
                </Link>
              ) : (
                <div style={{ opacity: 0.8 }}>Product unavailable</div>
              )}

              <div className="dots">
                {featuredProducts.map((_, i) => (
                  <button
                    key={i}
                    className={`dot ${i === activeIndex ? "dotActive" : ""}`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Featured ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="carousel">No featured products found.</div>
          )}

          {/* Email */}
          <div className="emailBox">
            <h2>Join the Grit & Grace Family</h2>
            <p>Get encouragement, new releases, and impact updates.</p>

            <form className="emailForm" onSubmit={onEmailSubmit}>
              <input
                type="email"
                name="email"
                required
                placeholder="Your email"
                className="emailInput"
              />
              <button
                className="emailBtn"
                disabled={emailStatus.state === "loading"}
              >
                {emailStatus.state === "loading" ? "Joining…" : "Join"}
              </button>
            </form>

            {emailStatus.state !== "idle" && (
              <div
                className={`emailMsg ${
                  emailStatus.state === "success" ? "success" : "error"
                }`}
              >
                {emailStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
