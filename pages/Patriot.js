// pages/Patriot.js
// Immersive Patriot chapter — background: /IMG_2041.jpeg
"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

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
  const [parallaxY, setParallaxY] = useState(0);

  const TITLE_BY_ID = useMemo(() => {
    const entries = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.sync_product_id && p?.title)
      .map((p) => [String(p.sync_product_id), p.title]);
    return Object.fromEntries(entries);
  }, []);

  const PATRIOT_PRODUCT_IDS = useMemo(() => {
    const list = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.category === "patriot" && p?.sync_product_id)
      .map((p) => ({
        id: String(p.sync_product_id),
        sort: typeof p.sort === "number" ? p.sort : null,
      }));

    const hasSort = list.some((x) => x.sort !== null);
    const ordered = hasSort
      ? [...list].sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
      : list;

    return Array.from(new Set(ordered.map((x) => x.id)));
  }, []);

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
    const intervalId = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % PATRIOTIC_PHRASES.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProductsFast() {
      try {
        setLoading(true);
        setError(null);

        if (!PATRIOT_PRODUCT_IDS.length) {
          setProducts([]);
          setLoading(false);
          setError("No Patriot products configured — check PRINTFUL_PRODUCTS category='patriot'.");
          return;
        }

        const CACHE_VERSION = "v3";
        const cacheKey = `patriot_products_${CACHE_VERSION}_${PATRIOT_PRODUCT_IDS.join("_")}`;

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
        const ids = [...PATRIOT_PRODUCT_IDS];
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
            setError("No Patriot products loaded — check /api/printful-product/:id responses.");
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
  }, [PATRIOT_PRODUCT_IDS]);

  return (
    <>
      <Head>
        <title>Patriot Collection | Grit & Grace</title>
        <meta
          name="description"
          content="Bold truthwear for those who stand for faith, freedom, and country — honoring veterans, first responders, and service."
        />
      </Head>

      <div className="patriotPage">
        <div
          className="patriotSky"
          style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.06)` }}
          aria-hidden
        >
          <div className="patriotSkyImg" />
          <div className="patriotSkyWash" />
        </div>

        <div className="patriotInner">
          <header className="patriotHero">
            <div className="patriotLogo">
              <Image
                src="/gritngrlogo.png"
                alt="Grit & Grace"
                width={72}
                height={72}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <p className="patriotEyebrow">Chapter · Patriot</p>
            <h1>Patriot Collection</h1>
            <p className="patriotLead">
              For those who stand unapologetically for faith, freedom, and country — and for those
              who serve to protect it. We honor veterans, active-duty military, law enforcement,
              and EMS.
            </p>
            <p className="patriotTag">Wear your values. Stand for what matters. Give with purpose.</p>
            <div className="patriotPill">
              <span>10% donated</span>
              <span className="dot">•</span>
              <span>veterans + community support</span>
            </div>
          </header>

          <div className="patriotPhrase">{PATRIOTIC_PHRASES[currentPhrase]}</div>

          <div className="patriotBuzz">
            {SERVICE_BUZZWORDS.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>

          {loading && (
            <div className="patriotStatus">Loading Patriot collection…</div>
          )}

          {error && (
            <div className="patriotStatus error">
              <p>{error}</p>
              <button type="button" onClick={() => location.reload()} className="patriotRetry">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="patriotGrid">
              {products.map((product, idx) => {
                const productId = String(product?.sync_product_id ?? product?.id ?? "");
                if (!productId) return null;

                const firstVariant = product?.variants?.[0];
                const price = firstVariant?.retail_price ?? firstVariant?.price ?? "0";
                const displayName = TITLE_BY_ID[productId] || product?.name || "Product";
                const imgSrc =
                  product?.thumbnail_url || product?.preview_url || "/gritngrlogo.png";

                return (
                  <div key={productId} className="patriotCard">
                    <Link href={`/product/${productId}`}>
                      <div className="patriotCardImg">
                        <Image
                          src={imgSrc}
                          alt={displayName}
                          fill
                          style={{ objectFit: "contain", padding: "36px" }}
                          priority={idx < 2}
                        />
                        <span className="patriotBadge">Patriot</span>
                      </div>
                    </Link>
                    <div className="patriotCardBody">
                      <h3>{displayName}</h3>
                      <p className="patriotPrice">{formatPrice(price)}</p>
                      <Link href={`/product/${productId}`} className="patriotBtn">
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="patriotFooter">
            More pieces coming soon · Designed with love · Powered by purpose
          </p>
        </div>
      </div>

      <style jsx>{`
        .patriotPage {
          position: relative;
          min-height: 100vh;
          color: #fff;
          overflow-x: hidden;
        }
        .patriotSky {
          position: fixed;
          inset: -6% 0 -15% 0;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .patriotSkyImg {
          position: absolute;
          inset: 0;
          background: #0b1220 url("/IMG_2041.jpeg") center / cover no-repeat;
        }
        .patriotSkyWash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(11, 18, 32, 0.55) 0%,
            rgba(11, 18, 32, 0.35) 28%,
            rgba(11, 18, 32, 0.55) 50%,
            rgba(2, 6, 23, 0.82) 75%,
            rgba(0, 0, 0, 0.92) 100%
          );
        }
        .patriotInner {
          position: relative;
          z-index: 2;
        }
        .patriotHero {
          text-align: center;
          padding: 4.5rem 1.25rem 2.5rem;
          max-width: 920px;
          margin: 0 auto;
        }
        .patriotLogo {
          width: 92px;
          height: 92px;
          margin: 0 auto 1.1rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .patriotEyebrow {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #93c5fd;
          margin: 0 0 0.5rem;
        }
        .patriotHero h1 {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900;
          margin: 0 0 0.9rem;
          letter-spacing: -0.02em;
          line-height: 1.05;
          background: linear-gradient(90deg, #ef4444, #ffffff, #3b82f6);
          -webkit-background-clip: text;
          color: transparent;
        }
        .patriotLead {
          font-size: clamp(1.05rem, 1.6vw, 1.25rem);
          color: #e5e7eb;
          line-height: 1.75;
          margin: 0 auto;
          max-width: 820px;
        }
        .patriotTag {
          margin: 0.85rem 0 0;
          color: #9ca3af;
          font-weight: 600;
        }
        .patriotPill {
          margin-top: 1.5rem;
          display: inline-flex;
          gap: 10px;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          font-weight: 700;
          color: #111827;
          font-size: 0.95rem;
        }
        .patriotPill .dot {
          opacity: 0.55;
        }
        .patriotPhrase {
          text-align: center;
          padding: 1.1rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          font-size: 1.12rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1.5rem;
          position: sticky;
          top: 0;
          z-index: 5;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          min-height: 3.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .patriotBuzz {
          max-width: 980px;
          margin: 0 auto 2.5rem;
          padding: 0 1rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.65rem;
        }
        .patriotBuzz span {
          padding: 0.5rem 0.9rem;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 999px;
          font-size: 0.9rem;
          color: #111827;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .patriotStatus {
          text-align: center;
          padding: 2rem 1rem;
          font-size: 1.5rem;
          color: #93c5fd;
          font-weight: 800;
        }
        .patriotStatus.error {
          color: #ff6b6b;
        }
        .patriotRetry {
          margin-top: 1rem;
          padding: 0.85rem 1.2rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-weight: 800;
          cursor: pointer;
        }
        .patriotGrid {
          padding: 0.5rem 1rem 4rem;
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          max-width: 1400px;
          margin: 0 auto;
        }
        .patriotCard {
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .patriotCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
        }
        .patriotCardImg {
          height: 360px;
          position: relative;
          background: #0b1220;
        }
        .patriotBadge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.14);
          color: #ef4444;
          font-weight: 900;
          font-size: 0.85rem;
          border: 1px solid rgba(239, 68, 68, 0.22);
        }
        .patriotCardBody {
          padding: 1.5rem 1.4rem 1.75rem;
          text-align: center;
        }
        .patriotCardBody h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 500;
          color: #1f2937;
        }
        .patriotPrice {
          margin: 0.5rem 0 1rem;
          font-size: 1.65rem;
          font-weight: 900;
          color: #0f172a;
        }
        .patriotBtn {
          display: inline-block;
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #ef4444 0%, #ffffff 50%, #3b82f6 115%);
          color: #0b1220;
          border-radius: 14px;
          font-size: 1.05rem;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.25);
        }
        .patriotFooter {
          text-align: center;
          padding: 2rem 1rem 4rem;
          color: #a1a1aa;
          font-size: 1rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .patriotSky {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
