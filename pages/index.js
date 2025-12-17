import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Add as many IDs as you want to rotate through
const FEATURED_PRODUCT_IDS = [
  "402034024", // Saved By Grace
  "405190886", // Patriot
  // Add more IDs here to rotate:
  // "403261853",
  // "403262072",
  // "403262589",
];

function getCollectionLabel(id) {
  // Keep your current logic; expand as you add more IDs
  if (id === "405190886") return "Patriot";
  return "Saved By Grace";
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load featured products (parallel)
  useEffect(() => {
    let alive = true;

    async function loadFeaturedProducts() {
      try {
        setLoadingFeatured(true);

        const results = await Promise.all(
          FEATURED_PRODUCT_IDS.map(async (id) => {
            try {
              const res = await fetch(`/api/printful-product/${id}`);
              if (!res.ok) return null;
              const data = await res.json();
              return { ...data, collection: getCollectionLabel(id), _id: id };
            } catch (e) {
              console.error("Featured product fetch failed:", id, e);
              return null;
            }
          })
        );

        if (!alive) return;
        const cleaned = results.filter(Boolean);
        setFeaturedProducts(cleaned);
        setActiveIndex(0);
      } finally {
        if (alive) setLoadingFeatured(false);
      }
    }

    loadFeaturedProducts();
    return () => {
      alive = false;
    };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (!featuredProducts.length) return;

    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % featuredProducts.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const activeProduct = useMemo(() => {
    if (!featuredProducts.length) return null;
    return featuredProducts[Math.min(activeIndex, featuredProducts.length - 1)];
  }, [featuredProducts, activeIndex]);

  return (
    <>
      <Head>
        <title>Grit & Grace | Faith, Freedom, Purpose</title>
        <meta
          name="description"
          content="Faith-driven apparel born from storms—created to inspire courage, healing, and grace. Every purchase supports mental health, suicide prevention, and homelessness relief."
        />
      </Head>

      <div className="page">
        <div className="glow" />

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: radial-gradient(circle at center, #0f172a 0%, #000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2.25rem 1.25rem 2.75rem;
            color: #fff;
            position: relative;
            overflow: hidden;
          }

          .glow {
            position: absolute;
            inset: 0;
            background: conic-gradient(
              from 180deg at 50% 50%,
              #ff0000 0deg,
              #0000ff 120deg,
              #ff0000 360deg
            );
            opacity: 0.08;
            animation: spin 30s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .content {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 1100px;
          }

          .logoWrap {
            margin: 0 auto 1.25rem;
            display: flex;
            justify-content: center;
          }

          .heroTitle {
            font-size: clamp(2.6rem, 6vw, 4.6rem);
            font-weight: 950;
            margin: 0.75rem 0 0.75rem;
            letter-spacing: 0.07em;
            background: linear-gradient(90deg, #ff4444, #ffffff, #4444ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .heroTagline {
            font-size: clamp(1.1rem, 2.2vw, 1.35rem);
            line-height: 1.6;
            opacity: 0.92;
            margin: 0 auto 1.25rem;
            max-width: 900px;
          }

          .ctaRow {
            display: flex;
            gap: 14px;
            justify-content: center;
            flex-wrap: wrap;
            margin: 1.25rem 0 1.75rem;
          }

          .btn {
            display: inline-block;
            padding: 0.95rem 1.3rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 800;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.18);
            transition: transform 0.12s ease, opacity 0.12s ease;
          }
          .btn:hover {
            transform: translateY(-1px);
            opacity: 0.98;
          }

          .btnPrimary {
            background: linear-gradient(90deg, #ff4444, #4444ff);
            color: #fff;
          }
          .btnPatriot {
            background: #00bfa5;
            color: #fff;
          }
          .btnSocial {
            background: #ff6b6b;
            color: #fff;
          }

          .sectionTitle {
            margin: 0.6rem 0 0.8rem;
            font-weight: 950;
            letter-spacing: 0.03em;
            font-size: 1.35rem;
          }

          /* Carousel */
          .carouselWrap {
            width: 100%;
            max-width: 560px;
            margin: 0.75rem auto 1.75rem;
          }

          .carouselCard {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 1.25rem;
            text-align: left;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.14);
          }

          .tag {
            font-size: 0.95rem;
            opacity: 0.9;
            margin: 0 0 0.75rem;
          }

          .pname {
            font-size: 1.25rem;
            margin: 0.65rem 0 0.4rem;
            font-weight: 900;
          }

          .price {
            font-size: 1.35rem;
            font-weight: 950;
            color: #ff6b6b;
            margin: 0.2rem 0 0.9rem;
          }

          .carouselActions {
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
            flex-wrap: wrap;
          }

          .navBtn {
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 0.7rem 1rem;
            border-radius: 12px;
            font-weight: 900;
            cursor: pointer;
          }

          .dots {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 14px;
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.25);
            border: none;
            cursor: pointer;
          }

          .dotActive {
            background: rgba(255, 255, 255, 0.9);
          }

          /* Impact + sections */
          .impact {
            margin: 1.25rem auto 0;
            max-width: 920px;
            padding: 1.1rem 1.1rem;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          .impactTitle {
            font-weight: 950;
            margin: 0 0 0.55rem;
            font-size: 1.05rem;
          }
          .impactRow {
            display: flex;
            gap: 14px;
            justify-content: center;
            flex-wrap: wrap;
            opacity: 0.95;
            line-height: 1.5;
          }

          .subSection {
            margin: 1.8rem auto 0;
            max-width: 920px;
            padding: 1.2rem 1.2rem;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            text-align: left;
          }
          .subSection h2 {
            margin: 0 0 0.55rem;
            font-size: 1.25rem;
            font-weight: 950;
          }
          .subSection p {
            margin: 0;
            opacity: 0.95;
            line-height: 1.65;
            font-size: 1.03rem;
          }
          .subCtas {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 0.9rem;
          }

          .finePrint {
            margin-top: 1.2rem;
            opacity: 0.7;
            font-size: 0.95rem;
          }
        `}</style>

        <div className="content">
          {/* Logo */}
          <div className="logoWrap">
            <Image
              src="/gritngrlogo.png"
              alt="Grit & Grace Logo"
              width={560}
              height={560}
              priority
              style={{
                maxWidth: "92vw",
                height: "auto",
                filter: "drop-shadow(0 0 45px rgba(255,255,255,0.6))",
              }}
            />
          </div>

          {/* Hero */}
          <h1 className="heroTitle">GRIT &amp; GRACE</h1>

          <p className="heroTagline">
            Faith-driven apparel born from storms—created to unite resilience, freedom,
            and purpose. Founded by <strong>The Resilient Voice</strong>.
            <br />
            Every purchase supports mental health, suicide prevention, and homelessness relief.
          </p>

          {/* CTAs (KEEP Social/Patriot refs same as your current pages) */}
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

          {/* Featured Carousel */}
          <div className="carouselWrap">
            <div className="sectionTitle">Featured Drops</div>

            {loadingFeatured ? (
              <p style={{ opacity: 0.85 }}>Loading featured products…</p>
            ) : activeProduct ? (
              <div className="carouselCard">
                <div className="tag">{activeProduct.collection} Featured</div>

                <Image
                  src={activeProduct.image || activeProduct.thumbnail_url}
                  alt={activeProduct.name}
                  width={520}
                  height={520}
                  style={{ borderRadius: 12, width: "100%", height: "auto" }}
                />

                <div className="pname">{activeProduct.name}</div>

                {(() => {
                  const price =
                    activeProduct?.variants?.[0]?.price ?? activeProduct?.price ?? null;
                  return price ? (
                    <div className="price">${price}</div>
                  ) : (
                    <div className="price">See options</div>
                  );
                })()}

                <div className="carouselActions">
                  <button
                    className="navBtn"
                    onClick={() =>
                      setActiveIndex((i) =>
                        (i - 1 + featuredProducts.length) % featuredProducts.length
                      )
                    }
                    aria-label="Previous product"
                    type="button"
                  >
                    ← Prev
                  </button>

                  <Link href={`/product/${activeProduct.id}`} className="btn btnPrimary">
                    View Product
                  </Link>

                  <button
                    className="navBtn"
                    onClick={() =>
                      setActiveIndex((i) => (i + 1) % featuredProducts.length)
                    }
                    aria-label="Next product"
                    type="button"
                  >
                    Next →
                  </button>
                </div>

                <div className="dots">
                  {featuredProducts.map((p, i) => (
                    <button
                      key={p.id || i}
                      className={`dot ${i === activeIndex ? "dotActive" : ""}`}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Go to featured product ${i + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ opacity: 0.85 }}>No featured products found.</p>
            )}
          </div>

          {/* Impact block */}
          <div className="impact">
            <div className="impactTitle">Your purchase makes an impact</div>
            <div className="impactRow">
              <span>🕊 Suicide prevention</span>
              <span>💬 Anti-bullying</span>
              <span>💚 Mental health</span>
              <span>🏠 Homelessness relief</span>
            </div>
          </div>

          {/* Brand story section */}
          <div className="subSection">
            <h2>Born from storms. Built on grace.</h2>
            <p>
              Grit &amp; Grace is more than apparel—it’s a testimony in motion.
              Every design is created to remind you that you are seen, strengthened,
              and deeply loved, even when life gets heavy.
            </p>
            <div className="subCtas">
              <Link href="/about" className="btn btnPrimary">
                Read Our Story
              </Link>
              <Link href="/giving" className="btn btnSocial">
                Giving Back
              </Link>
            </div>
            <div className="finePrint">
              Email signup is coming next (we’ll add Mailchimp or Klaviyo when you’re ready).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
