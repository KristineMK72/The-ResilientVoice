// pages/saved-by-grace.js
// Immersive Grace chapter — background: /IMG_2039.jpeg
// Same product load + short titles from printfulMap

"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";
import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);

  const scriptures = [
    "“My grace is sufficient for you.” — 2 Corinthians 12:9",
    "“He restores my soul.” — Psalm 23:3",
    "“You are chosen, holy, and dearly loved.” — Colossians 3:12",
    "“Fear not, for I have redeemed you.” — Isaiah 43:1",
  ];
  const [currentScripture, setCurrentScripture] = useState(0);

  const GRACE_KEYS = useMemo(
    () => [
      "joy",
      "seasonal_joy",
      "strong",
      "courageous",
      "watchman",
      "builder",
      "power",
      "redeemed",
      "unshaken",
      "radiant",
      "chosen_tee",
      "love_tee",
      "faith_tee",
      "truth_tee",
      "light_classic_tee",
      "saved_messy_heavyweight_tee",
      "messy_fine_jersey_tee",
      "saved_long_sleeve",
      "forgiven_free_long_sleeve",
      "saved_redeemed_long_sleeve",
      "saved_redeemed_hoodie",
    ],
    []
  );

  const TITLE_BY_ID = useMemo(() => {
    const entries = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.sync_product_id && p?.title)
      .map((p) => [String(p.sync_product_id), p.title]);
    return Object.fromEntries(entries);
  }, []);

  const YOUR_PRODUCT_IDS = useMemo(() => {
    const ids = GRACE_KEYS.map((k) => PRINTFUL_PRODUCTS[k]?.sync_product_id)
      .filter(Boolean)
      .map(String);

    const extraGrace = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.category === "grace" && p?.sync_product_id)
      .map((p) => String(p.sync_product_id))
      .filter((id) => !ids.includes(id));

    return Array.from(new Set([...ids, ...extraGrace]));
  }, [GRACE_KEYS]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setParallaxY(Math.min(y * 0.28, 220));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScripture((prev) => (prev + 1) % scriptures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [scriptures.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadProductsFast() {
      try {
        setLoading(true);
        setError(null);

        if (!YOUR_PRODUCT_IDS.length) {
          setProducts([]);
          setLoading(false);
          setError("No products configured — check PRINTFUL_PRODUCTS (Grace IDs).");
          return;
        }

        const cacheKey = `saved_by_grace_v5_${YOUR_PRODUCT_IDS.join("_")}`;

        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!cancelled && Array.isArray(parsed) && parsed.length) {
              setProducts(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }

        const withTimeout = async (fn, ms = 15000) => {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), ms);
          try {
            return await fn(controller.signal);
          } finally {
            clearTimeout(t);
          }
        };

        const fetchOne = (id) =>
          withTimeout(async (signal) => {
            const res = await fetch(`/api/printful-product/${id}`, { signal });
            if (!res.ok) return { __error: true, id, status: res.status };
            return await res.json();
          });

        const CONCURRENCY = 6;
        const ids = [...YOUR_PRODUCT_IDS];
        const results = [];

        for (let i = 0; i < ids.length; i += CONCURRENCY) {
          const chunk = ids.slice(i, i + CONCURRENCY);
          const settled = await Promise.allSettled(chunk.map(fetchOne));

          settled.forEach((r) => {
            if (r.status === "fulfilled" && r.value && !r.value.__error) {
              results.push(r.value);
            } else if (r.status === "fulfilled" && r.value?.__error) {
              console.warn(`⚠️ Failed ${r.value.id}: ${r.value.status}`);
            } else {
              console.warn("⚠️ Fetch error:", r.reason?.message || r.reason);
            }
          });
        }

        const orderIndex = new Map(ids.map((id, i) => [String(id), i]));
        results.sort((a, b) => {
          const aId = String(a?.sync_product_id ?? a?.id ?? "");
          const bId = String(b?.sync_product_id ?? b?.id ?? "");
          return (orderIndex.get(aId) ?? 9999) - (orderIndex.get(bId) ?? 9999);
        });

        if (!cancelled) {
          setProducts(results);
          setLoading(false);

          if (results.length === 0) {
            setError("No products loaded — check /api/printful-product/:id responses.");
          } else {
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(results));
            } catch {
              // ignore
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          setLoading(false);
          setError(
            e?.name === "AbortError"
              ? "Loading timed out — please refresh."
              : "Failed to load products — check console."
          );
        }
      }
    }

    loadProductsFast();
    return () => {
      cancelled = true;
    };
  }, [YOUR_PRODUCT_IDS]);

  return (
    <>
      <Head>
        <title>Saved By Grace Collection | Grit & Grace</title>
        <meta
          name="description"
          content="Faith-fueled designs that speak truth, strength, and softness — all while giving back."
        />
      </Head>

      <div className="gracePage">
        {/* Fixed landscape — crosses / light */}
        <div
          className="graceSky"
          style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.06)` }}
          aria-hidden
        >
          <div className="graceSkyImg" />
          <div className="graceSkyWash" />
        </div>

        <div className="graceInner">
          {loading ? (
            <div className="graceStatus">Loading your Grace collection…</div>
          ) : error ? (
            <div className="graceStatus error">
              <p>{error}</p>
              <button type="button" onClick={() => location.reload()} className="graceRetry">
                Retry
              </button>
            </div>
          ) : (
            <>
              <header className="graceHero">
                <div className="graceLogo">
                  <Image
                    src="/faithLogo.png"
                    alt="Faith logo"
                    width={72}
                    height={72}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
                <p className="graceEyebrow">Chapter · Saved by Grace</p>
                <h1>Saved By Grace</h1>
                <p className="graceLead">
                  A collection shaped by grace. These pieces speak life through words like{" "}
                  <strong>Redeemed</strong>, <strong>Chosen</strong>, <strong>Strength</strong>, and{" "}
                  <strong>Hope</strong> — echoing the scriptures that uplift weary hearts and remind
                  us of God’s unshakable love.
                </p>
                <p className="graceTag">Wear His truth. Walk in grace. Give with purpose.</p>
                <div className="gracePill">
                  <span>10% donated</span>
                  <span className="dot">•</span>
                  <span>mental health + housing support</span>
                </div>
              </header>

              <div className="graceScripture">{scriptures[currentScripture]}</div>

              <div className="graceGrid">
                {products.map((product, idx) => {
                  const productId = String(product?.sync_product_id ?? product?.id ?? "");
                  const firstVariant = product?.variants?.[0];
                  const price = firstVariant?.retail_price ?? firstVariant?.price ?? "0";
                  const displayName = TITLE_BY_ID[productId] || product?.name || "Product";
                  const imgSrc =
                    product?.thumbnail_url || product?.preview_url || "/faithLogo.png";

                  return (
                    <div key={productId || idx} className="graceCard">
                      <Link href={`/product/${productId}`}>
                        <div className="graceCardImg">
                          <Image
                            src={imgSrc}
                            alt={displayName}
                            fill
                            style={{ objectFit: "contain", padding: "28px" }}
                            priority={idx < 2}
                          />
                          <span className="graceBadge">Grace Collection</span>
                        </div>
                      </Link>
                      <div className="graceCardBody">
                        <h3>{displayName}</h3>
                        <p className="gracePrice">{formatPrice(price)}</p>
                        <Link href={`/product/${productId}`} className="graceBtn">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="graceFooter">
                More pieces coming every week · Designed with love · Powered by purpose
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .gracePage {
          position: relative;
          min-height: 100vh;
          color: #2b2b2b;
          overflow-x: hidden;
        }
        .graceSky {
          position: fixed;
          inset: -6% 0 -15% 0;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .graceSkyImg {
          position: absolute;
          inset: 0;
          background: #1a1520 url("/IMG_2039.jpeg") center / cover no-repeat;
        }
        .graceSkyWash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 21, 32, 0.45) 0%,
            rgba(26, 21, 32, 0.25) 30%,
            rgba(255, 248, 242, 0.55) 55%,
            rgba(255, 248, 242, 0.88) 78%,
            rgba(253, 243, 231, 0.96) 100%
          );
        }
        .graceInner {
          position: relative;
          z-index: 2;
          max-width: 1600px;
          margin: 0 auto;
        }
        .graceStatus {
          text-align: center;
          padding: 10rem 1rem;
          font-size: 1.6rem;
          color: #9f6baa;
          font-weight: 800;
        }
        .graceStatus.error {
          color: #ff6b6b;
        }
        .graceRetry {
          margin-top: 1rem;
          padding: 0.85rem 1.2rem;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.85);
          color: #7a4f85;
          font-weight: 800;
          cursor: pointer;
        }
        .graceHero {
          text-align: center;
          padding: 4.5rem 1.25rem 2.5rem;
          max-width: 920px;
          margin: 0 auto;
        }
        .graceLogo {
          width: 92px;
          height: 92px;
          margin: 0 auto 1.1rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .graceEyebrow {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9f6baa;
          margin: 0 0 0.5rem;
        }
        .graceHero h1 {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900;
          color: #7a4f85;
          margin: 0 0 0.9rem;
          letter-spacing: -0.02em;
          line-height: 1.05;
          text-shadow: 0 2px 24px rgba(255, 255, 255, 0.6);
        }
        .graceLead {
          font-size: clamp(1.05rem, 1.6vw, 1.25rem);
          color: #333;
          line-height: 1.75;
          margin: 0 auto;
          max-width: 820px;
        }
        .graceTag {
          margin: 0.85rem 0 0;
          color: #5a5a5a;
          font-weight: 600;
        }
        .gracePill {
          margin-top: 1.5rem;
          display: inline-flex;
          gap: 10px;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          font-weight: 700;
          color: #7a4f85;
          font-size: 0.95rem;
        }
        .gracePill .dot {
          opacity: 0.55;
        }
        .graceScripture {
          text-align: center;
          padding: 1.1rem 1rem;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          font-size: 1.12rem;
          font-weight: 700;
          color: #7a4f85;
          margin-bottom: 2rem;
          position: sticky;
          top: 0;
          z-index: 5;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .graceGrid {
          padding: 0.5rem 1rem 4rem;
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          max-width: 1400px;
          margin: 0 auto;
        }
        .graceCard {
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .graceCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.16);
        }
        .graceCardImg {
          height: 360px;
          position: relative;
          background: linear-gradient(180deg, #faf7ff 0%, #f6f1fb 100%);
        }
        .graceBadge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(159, 107, 170, 0.14);
          color: #7a4f85;
          font-weight: 800;
          font-size: 0.85rem;
          border: 1px solid rgba(159, 107, 170, 0.2);
        }
        .graceCardBody {
          padding: 1.5rem 1.4rem 1.75rem;
          text-align: center;
        }
        .graceCardBody h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 500;
          color: #2b2b2b;
        }
        .gracePrice {
          margin: 0.5rem 0 1rem;
          font-size: 1.65rem;
          font-weight: 900;
          color: #9f6baa;
        }
        .graceBtn {
          display: inline-block;
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #9f6baa 0%, #c08bd0 100%);
          color: white;
          border-radius: 14px;
          font-size: 1.05rem;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(159, 107, 170, 0.28);
        }
        .graceFooter {
          text-align: center;
          padding: 2rem 1rem 4rem;
          color: #6a6a6a;
          font-size: 1rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .graceSky {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
