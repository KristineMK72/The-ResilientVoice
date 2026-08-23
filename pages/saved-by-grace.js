// pages/saved-by-grace.js — Refined Grace chapter
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";
import { loadChapterProducts } from "../lib/catalog/loadChapterProducts";

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);

  const scriptures = [
    "\u201cMy grace is sufficient for you.\u201d \u2014 2 Corinthians 12:9",
    "\u201cHe restores my soul.\u201d \u2014 Psalm 23:3",
    "\u201cYou are chosen, holy, and dearly loved.\u201d \u2014 Colossians 3:12",
    "\u201cFear not, for I have redeemed you.\u201d \u2014 Isaiah 43:1",
  ];
  const [currentScripture, setCurrentScripture] = useState(0);

  useEffect(() => {
    const onScroll = () =>
      setParallaxY(Math.min((window.scrollY || 0) * 0.25, 200));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setCurrentScripture((p) => (p + 1) % scriptures.length),
      5200
    );
    return () => clearInterval(t);
  }, [scriptures.length]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = "sbg_catalog_v2";
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!cancelled && parsed?.length) {
              setProducts(parsed);
              setLoading(false);
            }
          }
        } catch {}

        const { products: list, warning } = await loadChapterProducts("grace");
        if (cancelled) return;
        if (!list.length) {
          setError(warning || "No products loaded.");
          setLoading(false);
          return;
        }
        setProducts(list);
        setLoading(false);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(list));
        } catch {}
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
    return {
      id,
      name: p?.title || p?.name || "Product",
      price: formatPrice(v0?.retail_price ?? v0?.price ?? "0"),
      img: p?.thumbnail_url || p?.preview_url || "/faithLogo.png",
    };
  }

  return (
    <>
      <Head>
        <title>Saved By Grace | Grit & Grace</title>
        <meta
          name="description"
          content="Faith-fueled designs that speak truth, strength, and softness — all while giving back."
        />
      </Head>

      <div className="grace">
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
            <div className="status">Loading your Grace collection…</div>
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
                <p className="eyebrow">Chapter · Saved by Grace</p>
                <h1>Saved By Grace</h1>
                <p className="lead">
                  Grace is permission to be human. Wear the words that still
                  speak when the storm is loud.
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
                  Designs shaped by <strong>Redeemed</strong>,{" "}
                  <strong>Chosen</strong>, <strong>Strength</strong>, and{" "}
                  <strong>Hope</strong> — with 10% of every sale supporting
                  healing in our community.
                </p>
                <div className="stripLinks">
                  <a href="#shop">Shop</a>
                  <Link href="/giving">Giving</Link>
                  <Link href="/blog/storms">Journal</Link>
                </div>
              </div>

              <div className="scripture" key={currentScripture}>
                {scriptures[currentScripture]}
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
                          />
                        </div>
                        <div className="featuredBody">
                          <span className="badge">Signature · Grace</span>
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
                More pieces every week · Designed with love · Powered by purpose
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .grace {
          position: relative;
          min-height: 100vh;
          color: #1f1a24;
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
          background: #1a1520 url("/IMG_2039.jpeg") center / cover no-repeat;
        }
        .skyWash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 21, 32, 0.52) 0%,
            rgba(26, 21, 32, 0.26) 30%,
            rgba(255, 248, 242, 0.72) 58%,
            rgba(253, 245, 236, 0.96) 100%
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
          color: #9f6baa;
        }
        .status.err {
          color: #e85a5a;
        }
        .status button {
          margin-top: 1rem;
          padding: 0.8rem 1.3rem;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          background: #fff;
          color: #7a4f85;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        /* Hero */
        .hero {
          text-align: center;
          padding: 16vh 1.35rem 2.25rem;
          max-width: 620px;
          margin: 0 auto;
        }
        .eyebrow {
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9f6baa;
          margin: 0 0 0.7rem;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 3.6rem);
          font-weight: 900;
          color: #6b3f78;
          margin: 0 0 0.85rem;
          letter-spacing: -0.03em;
          line-height: 1.06;
        }
        .lead {
          font-size: 1.12rem;
          line-height: 1.7;
          color: #3a3540;
          margin: 0 0 1.6rem;
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
          filter: brightness(1.04);
        }
        .btn.primary {
          background: linear-gradient(135deg, #9f6baa, #c08bd0);
          color: #fff;
          box-shadow: 0 12px 32px rgba(159, 107, 170, 0.32);
        }
        .btn.ghost {
          background: rgba(255, 255, 255, 0.8);
          color: #6b3f78;
          border: 1px solid rgba(159, 107, 170, 0.22);
        }

        /* Strip */
        .strip {
          margin: 0 1.15rem 1.35rem;
          padding: 1.25rem 1.4rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(159, 107, 170, 0.12);
          text-align: center;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }
        .strip p {
          margin: 0 0 0.7rem;
          line-height: 1.65;
          color: #333;
          font-size: 0.98rem;
        }
        .strip strong {
          color: #6b3f78;
        }
        .stripLinks {
          display: flex;
          gap: 1.4rem;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }
        .stripLinks a {
          color: #6b3f78;
          text-decoration: none;
        }
        .stripLinks a:hover {
          text-decoration: underline;
        }

        /* Scripture */
        .scripture {
          text-align: center;
          padding: 0.95rem 1.25rem;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          font-size: 1.02rem;
          font-weight: 700;
          color: #6b3f78;
          position: sticky;
          top: 0;
          z-index: 5;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          letter-spacing: 0.01em;
        }

        /* Shop */
        .shop {
          padding: 1.75rem 1.15rem 3rem;
        }

        .featured {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 0;
          margin-bottom: 1.85rem;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 22px 56px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s ease;
        }
        .featured:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.13);
        }
        .featuredImg {
          position: relative;
          min-height: 340px;
          background: linear-gradient(165deg, #faf7ff 0%, #f0e8f5 100%);
        }
        .featuredBody {
          padding: 2.1rem 1.9rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .badge {
          display: inline-block;
          width: fit-content;
          padding: 0.38rem 0.75rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
          background: rgba(159, 107, 170, 0.14);
          color: #6b3f78;
        }
        .featuredBody h2 {
          margin: 0 0 0.55rem;
          font-size: 1.6rem;
          font-weight: 750;
          color: #1f1a24;
          line-height: 1.25;
        }
        .price {
          font-size: 1.45rem;
          font-weight: 900;
          margin: 0 0 1.1rem;
          color: #9f6baa;
        }
        .featuredCta {
          font-weight: 800;
          color: #6b3f78;
          font-size: 0.95rem;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.05rem;
        }
        .card {
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
        }
        .cardImg {
          position: relative;
          height: 210px;
          background: linear-gradient(165deg, #faf7ff, #f4eef9);
        }
        .cardBody {
          padding: 0.95rem 1rem 1.15rem;
          text-align: center;
        }
        .cardBody h3 {
          margin: 0 0 0.35rem;
          font-size: 0.98rem;
          font-weight: 650;
          color: #1f1a24;
          line-height: 1.3;
        }
        .cardBody .price {
          font-size: 1.12rem;
          margin: 0;
        }

        .foot {
          text-align: center;
          padding: 0.5rem 1rem 3.75rem;
          color: #6a6570;
          font-size: 0.94rem;
        }

        @media (max-width: 720px) {
          .featured {
            grid-template-columns: 1fr;
          }
          .featuredImg {
            min-height: 260px;
          }
          .featuredBody {
            padding: 1.5rem 1.25rem;
          }
          .hero {
            padding-top: 11vh;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }
          .cardImg {
            height: 150px;
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
