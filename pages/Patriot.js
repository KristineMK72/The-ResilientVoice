// pages/Patriot.js — Refined Patriot chapter
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";
import { loadChapterProducts } from "../lib/catalog/loadChapterProducts";

const PHRASES = [
  "Freedom isn't free. Thank a veteran.",
  "Honor the oath. Respect the service.",
  "Land of the free, because of the brave.",
  "Support those who protect and serve.",
];
const BUZZ = [
  "Valor",
  "Duty",
  "Honor",
  "Veterans",
  "Service",
  "Police",
  "Fire",
  "EMS",
  "Freedom",
  "Liberty",
];

const BAD_MARKERS = [
  "REPLACE_WITH_REAL_THUMB",
  "PUT_THE_IMAGE_URL_HERE",
  "missing-image",
  "placeholder",
];

function isUsableUrl(url) {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u) return false;
  if (BAD_MARKERS.some((m) => u.includes(m))) return false;
  return true;
}

/** Prefer local mockup, then real CDN, then brand logo */
function resolveImg(p) {
  const id = String(p?.sync_product_id ?? p?.id ?? "");
  const local = id ? `/${id}_1.png` : null;
  const remote = [p?.thumbnail_url, p?.preview_url].find(isUsableUrl);
  return local || remote || "/gritngrlogo.png";
}

export default function Patriot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phrase, setPhrase] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  // Track broken image ids → swap to logo
  const [broken, setBroken] = useState({});

  useEffect(() => {
    const onScroll = () =>
      setParallaxY(Math.min((window.scrollY || 0) * 0.25, 200));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 5200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { products: list, warning } = await loadChapterProducts("patriot");
        if (cancelled) return;
        if (!list.length) {
          setError(warning || "No products loaded.");
          setLoading(false);
          return;
        }
        setProducts(list);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError("Failed to load products.");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products[0];
  const rest = products.slice(1);

  function meta(p) {
    const id = String(p?.sync_product_id ?? p?.id ?? "");
    const v0 = p?.variants?.[0];
    const img = broken[id] ? "/gritngrlogo.png" : resolveImg(p);
    return {
      id,
      name: p?.title || p?.name || "Product",
      price: formatPrice(v0?.retail_price ?? v0?.price ?? "0"),
      img,
    };
  }

  function onImgError(id) {
    setBroken((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }

  return (
    <>
      <Head>
        <title>Patriot Collection | Grit & Grace</title>
        <meta
          name="description"
          content="Courage for those who serve — and those who keep showing up. Honor veterans, first responders, and everyday grit."
        />
      </Head>

      <div className="pat">
        <div
          className="sky"
          style={{
            transform: `translate3d(0, ${parallaxY}px, 0) scale(1.05)`,
          }}
          aria-hidden
        >
          <div className="skyImg" />
          <div className="skyWash" />
        </div>

        <div className="inner">
          {loading ? (
            <div className="status">Loading collection…</div>
          ) : error ? (
            <div className="status err">
              <p>{error}</p>
              <button type="button" onClick={() => location.reload()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <header className="hero">
                <p className="eyebrow">Chapter · Patriot</p>
                <h1>Patriot Collection</h1>
                <p className="lead">
                  Courage for those who serve — and those who keep showing up.
                  Honor veterans, first responders, and everyday grit.
                </p>
                <div className="ctas">
                  <a href="#shop" className="btn primary">
                    Shop this chapter
                  </a>
                  <Link href="/about" className="btn ghost">
                    Why we exist
                  </Link>
                </div>
              </header>

              <div className="strip">
                <p>
                  Wear your values. Stand for what matters. 10% of every sale
                  supports veterans and community care.
                </p>
                <div className="stripLinks">
                  <a href="#shop">Shop</a>
                  <Link href="/giving">Giving</Link>
                  <Link href="/blog/storms">Journal</Link>
                </div>
              </div>

              <div className="phrase" key={phrase}>
                {PHRASES[phrase]}
              </div>

              <div className="buzz">
                {BUZZ.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <section id="shop" className="shop">
                {featured &&
                  (() => {
                    const m = meta(featured);
                    return (
                      <Link href={`/product/${m.id}`} className="featured">
                        <div className="featuredImg">
                          <Image
                            src={m.img}
                            alt={m.name}
                            fill
                            style={{ objectFit: "contain", padding: 28 }}
                            priority
                            onError={() => onImgError(m.id)}
                          />
                        </div>
                        <div className="featuredBody">
                          <span className="badge">Signature</span>
                          <h2>{m.name}</h2>
                          <p className="price">{m.price}</p>
                          <span className="featuredCta">View piece →</span>
                        </div>
                      </Link>
                    );
                  })()}

                <div className="grid">
                  {rest.map((p, idx) => {
                    const m = meta(p);
                    return (
                      <Link
                        key={m.id || idx}
                        href={`/product/${m.id}`}
                        className="card"
                      >
                        <div className="cardImg">
                          <Image
                            src={m.img}
                            alt={m.name}
                            fill
                            style={{ objectFit: "contain", padding: 18 }}
                            priority={idx < 2}
                            onError={() => onImgError(m.id)}
                          />
                        </div>
                        <div className="cardBody">
                          <h3>{m.name}</h3>
                          <p className="price">{m.price}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <p className="foot">
                More pieces coming soon · Designed with love · Powered by
                purpose
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .pat {
          position: relative;
          min-height: 100vh;
          color: #f8fafc;
          overflow-x: hidden;
        }
        .sky {
          position: fixed;
          inset: -5% 0 -12% 0;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .skyImg {
          position: absolute;
          inset: 0;
          background: #0b1220 url("/IMG_2041.jpeg") center / cover no-repeat;
        }
        .skyWash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(11, 18, 32, 0.58) 0%,
            rgba(11, 18, 32, 0.36) 30%,
            rgba(2, 6, 23, 0.8) 70%,
            rgba(0, 0, 0, 0.94) 100%
          );
        }
        .inner {
          position: relative;
          z-index: 2;
          max-width: 1080px;
          margin: 0 auto;
        }
        .status {
          text-align: center;
          padding: 8rem 1.25rem;
          font-size: 1.35rem;
          font-weight: 800;
          color: #93c5fd;
        }
        .status.err {
          color: #ff6b6b;
        }
        .status button {
          margin-top: 1rem;
          padding: 0.8rem 1.3rem;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          background: #fff;
          color: #0b1220;
        }
        .hero {
          text-align: center;
          padding: 15vh 1.35rem 2.1rem;
          max-width: 640px;
          margin: 0 auto;
        }
        .eyebrow {
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #93c5fd;
          margin: 0 0 0.7rem;
        }
        .hero h1 {
          font-size: clamp(2.4rem, 5.5vw, 3.5rem);
          font-weight: 900;
          margin: 0 0 0.85rem;
          letter-spacing: -0.03em;
          line-height: 1.06;
          background: linear-gradient(135deg, #ef4444 0%, #f8fafc 48%, #3b82f6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .lead {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #e2e8f0;
          margin: 0 0 1.55rem;
        }
        .ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.9rem 1.35rem;
          border-radius: 14px;
          font-weight: 800;
          text-decoration: none;
          font-size: 0.95rem;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        .btn.primary {
          background: linear-gradient(135deg, #ef4444, #f8fafc, #3b82f6);
          color: #0b1220;
          box-shadow: 0 12px 32px rgba(239, 68, 68, 0.28);
        }
        .btn.ghost {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.22);
        }
        .strip {
          margin: 0 1.15rem 1.15rem;
          padding: 1.2rem 1.35rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.93);
          color: #1e293b;
          text-align: center;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        .strip p {
          margin: 0 0 0.65rem;
          line-height: 1.6;
          font-size: 0.97rem;
        }
        .stripLinks {
          display: flex;
          gap: 1.35rem;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }
        .stripLinks a {
          color: #0f172a;
          text-decoration: none;
        }
        .stripLinks a:hover {
          text-decoration: underline;
        }
        .phrase {
          text-align: center;
          padding: 0.95rem 1.25rem;
          background: rgba(255, 255, 255, 0.94);
          font-size: 1.02rem;
          font-weight: 800;
          color: #0f172a;
          position: sticky;
          top: 0;
          z-index: 5;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .buzz {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          padding: 1.15rem 1rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .buzz span {
          padding: 0.42rem 0.8rem;
          background: rgba(255, 255, 255, 0.93);
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .shop {
          padding: 1.5rem 1.15rem 3rem;
        }
        .featured {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          margin-bottom: 1.75rem;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          text-decoration: none;
          color: #0f172a;
          box-shadow: 0 22px 56px rgba(0, 0, 0, 0.28);
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s ease;
        }
        .featured:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.32);
        }
        .featuredImg {
          position: relative;
          min-height: 320px;
          background: #0b1220;
        }
        .featuredBody {
          padding: 2rem 1.85rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .badge {
          display: inline-block;
          width: fit-content;
          padding: 0.36rem 0.72rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.8rem;
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
        }
        .featuredBody h2 {
          margin: 0 0 0.5rem;
          font-size: 1.55rem;
          font-weight: 750;
          line-height: 1.25;
        }
        .price {
          font-size: 1.4rem;
          font-weight: 900;
          margin: 0 0 1rem;
          color: #0f172a;
        }
        .featuredCta {
          font-weight: 800;
          color: #0f172a;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 1rem;
        }
        .card {
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          text-decoration: none;
          color: #0f172a;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.26);
        }
        .cardImg {
          position: relative;
          height: 200px;
          background: #0b1220;
        }
        .cardBody {
          padding: 0.9rem 0.95rem 1.1rem;
          text-align: center;
        }
        .cardBody h3 {
          margin: 0 0 0.3rem;
          font-size: 0.96rem;
          font-weight: 650;
          line-height: 1.3;
        }
        .cardBody .price {
          font-size: 1.1rem;
          margin: 0;
        }
        .foot {
          text-align: center;
          padding: 0.5rem 1rem 3.75rem;
          color: #94a3b8;
          font-size: 0.94rem;
        }
        @media (max-width: 720px) {
          .featured {
            grid-template-columns: 1fr;
          }
          .featuredImg {
            min-height: 250px;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }
          .cardImg {
            height: 148px;
          }
          .hero {
            padding-top: 11vh;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sky {
            transform: none !important;
          }
          .btn:hover,
          .featured:hover,
          .card:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
