// pages/Social.js — Primo chapter layout
"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const PHRASES = [
  "Take a deep breath. You are enough.",
  "Community is our greatest resource.",
  "Be kind to your mind.",
  "Healing starts with honest conversation.",
];
const BUZZ = ["Compassion", "Empathy", "Hope", "Support", "Resilience", "Connection", "Awareness", "Action"];

export default function Social() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phrase, setPhrase] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  const TITLE_BY_ID = useMemo(() => {
    const entries = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.sync_product_id && p?.title)
      .map((p) => [String(p.sync_product_id), p.title]);
    return Object.fromEntries(entries);
  }, []);

  const IDS = useMemo(() => {
    const list = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.category === "social" && p?.sync_product_id)
      .map((p) => ({ id: String(p.sync_product_id), sort: typeof p.sort === "number" ? p.sort : null }));
    const hasSort = list.some((x) => x.sort !== null);
    const ordered = hasSort ? [...list].sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999)) : list;
    return Array.from(new Set(ordered.map((x) => x.id)));
  }, []);

  useEffect(() => {
    const onScroll = () => setParallaxY(Math.min((window.scrollY || 0) * 0.28, 220));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!IDS.length) {
          setError("No products configured.");
          setLoading(false);
          return;
        }
        const cacheKey = `social_primo_v1_${IDS.join("_")}`;
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!cancelled && parsed?.length) {
              setProducts(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}
        const fetchOne = async (id) => {
          const res = await fetch(`/api/printful-product/${id}`);
          if (!res.ok) return null;
          return res.json();
        };
        const results = [];
        for (let i = 0; i < IDS.length; i += 6) {
          const chunk = IDS.slice(i, i + 6);
          const settled = await Promise.all(chunk.map(fetchOne));
          settled.forEach((r) => r && results.push(r));
        }
        const order = new Map(IDS.map((id, i) => [String(id), i]));
        results.sort(
          (a, b) =>
            (order.get(String(a?.sync_product_id ?? a?.id)) ?? 999) -
            (order.get(String(b?.sync_product_id ?? b?.id)) ?? 999)
        );
        if (!cancelled) {
          setProducts(results);
          setLoading(false);
          if (results.length) {
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(results));
            } catch {}
          } else setError("No products loaded.");
        }
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
  }, [IDS]);

  const featured = products[0];
  const rest = products.slice(1);
  function meta(p) {
    const id = String(p?.sync_product_id ?? p?.id ?? "");
    const v0 = p?.variants?.[0];
    return {
      id,
      name: TITLE_BY_ID[id] || p?.name || "Product",
      price: formatPrice(v0?.retail_price ?? v0?.price ?? "0"),
      img: p?.thumbnail_url || p?.preview_url || "/faithLogo.png",
    };
  }

  return (
    <>
      <Head>
        <title>Social Impact | Grit & Grace</title>
        <meta
          name="description"
          content="Healing out loud. Hope you can wear. Apparel that starts honest conversations — and funds real support."
        />
      </Head>
      <div className="ch">
        <div
          className="chSky"
          style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.06)` }}
          aria-hidden
        >
          <div className="chSkyImg" />
          <div className="chSkyWash" />
        </div>
        <div className="chInner">
          {loading ? (
            <div className="chStatus">Loading collection…</div>
          ) : error ? (
            <div className="chStatus err">
              <p>{error}</p>
              <button type="button" onClick={() => location.reload()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <header className="chHero">
                <p className="chEyebrow">Chapter · Social impact</p>
                <h1>Social Impact</h1>
                <p className="chLead">
                  Healing out loud. Hope you can wear. Apparel that starts honest conversations —
                  and funds real support.
                </p>
                <div className="chCtas">
                  <a href="#shop" className="chBtn primary">
                    Shop this chapter ↓
                  </a>
                  <Link href="/about" className="chBtn ghost">
                    Why we exist
                  </Link>
                </div>
              </header>
              <div className="chStrip">
                <p>
                  Kindness in action. 10% of every sale supports mental health, housing, and
                  community healing.
                </p>
                <div className="chStripLinks">
                  <a href="#shop">Shop</a>
                  <Link href="/giving">Giving</Link>
                  <Link href="/blog/storms">Journal</Link>
                </div>
              </div>
              <div className="chPhrase">{PHRASES[phrase]}</div>
              <div className="chBuzz">
                {BUZZ.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <section id="shop" className="chShop">
                {featured &&
                  (() => {
                    const m = meta(featured);
                    return (
                      <Link href={`/product/${m.id}`} className="chFeatured">
                        <div className="chFeaturedImg">
                          <Image
                            src={m.img}
                            alt={m.name}
                            fill
                            style={{ objectFit: "contain", padding: 24 }}
                            priority
                          />
                        </div>
                        <div className="chFeaturedBody">
                          <span className="chBadge">Signature</span>
                          <h2>{m.name}</h2>
                          <p className="chPrice">{m.price}</p>
                          <span className="chFeaturedCta">View piece →</span>
                        </div>
                      </Link>
                    );
                  })()}
                <div className="chGrid">
                  {rest.map((p, idx) => {
                    const m = meta(p);
                    return (
                      <Link key={m.id || idx} href={`/product/${m.id}`} className="chCard">
                        <div className="chCardImg">
                          <Image
                            src={m.img}
                            alt={m.name}
                            fill
                            style={{ objectFit: "contain", padding: 20 }}
                            priority={idx < 2}
                          />
                        </div>
                        <div className="chCardBody">
                          <h3>{m.name}</h3>
                          <p className="chPrice">{m.price}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
              <p className="chFoot">More pieces coming soon · Designed with love · Powered by purpose</p>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .ch { position: relative; min-height: 100vh; color: #fff; overflow-x: hidden; }
        .chSky { position: fixed; inset: -6% 0 -15% 0; z-index: 0; pointer-events: none; will-change: transform; }
        .chSkyImg { position: absolute; inset: 0; background: #1e293b url("/IMG_2042.jpeg") center / cover no-repeat; }
        .chSkyWash {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(30,41,59,0.3) 28%, rgba(2,6,23,0.8) 75%, rgba(2,6,23,0.94) 100%);
        }
        .chInner { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; }
        .chStatus { text-align: center; padding: 8rem 1rem; font-size: 1.4rem; font-weight: 800; color: #93c5fd; }
        .chStatus.err { color: #ff6b6b; }
        .chStatus button { margin-top: 1rem; padding: 0.75rem 1.2rem; border-radius: 999px; border: none; font-weight: 800; cursor: pointer; }
        .chHero { text-align: center; padding: 16vh 1.25rem 2rem; max-width: 640px; margin: 0 auto; }
        .chEyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #6ee7b7; margin: 0 0 0.6rem; }
        .chHero h1 {
          font-size: clamp(2.3rem, 5vw, 3.4rem); font-weight: 900; margin: 0 0 0.75rem; letter-spacing: -0.02em; line-height: 1.08;
          background: linear-gradient(135deg, #6ee7b7, #3b82f6, #9333ea); -webkit-background-clip: text; color: transparent;
        }
        .chLead { font-size: 1.1rem; line-height: 1.65; color: #e5e7eb; margin: 0 0 1.5rem; }
        .chCtas { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .chBtn { display: inline-flex; padding: 0.85rem 1.25rem; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 0.95rem; }
        .chBtn.primary { background: linear-gradient(135deg, #6ee7b7, #3b82f6, #9333ea); color: #0b1220; }
        .chBtn.ghost { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); }
        .chStrip { margin: 0 1rem 1rem; padding: 1.1rem 1.2rem; border-radius: 18px; background: rgba(255,255,255,0.9); color: #1f2937; text-align: center; }
        .chStrip p { margin: 0 0 0.6rem; line-height: 1.55; font-size: 0.95rem; }
        .chStripLinks { display: flex; gap: 1.2rem; justify-content: center; font-weight: 800; font-size: 0.9rem; }
        .chStripLinks a { color: #111827; text-decoration: none; }
        .chPhrase { text-align: center; padding: 0.85rem 1rem; background: rgba(255,255,255,0.92); font-size: 1rem; font-weight: 800; color: #1f2937; position: sticky; top: 0; z-index: 5; }
        .chBuzz { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; padding: 1rem; max-width: 900px; margin: 0 auto; }
        .chBuzz span { padding: 0.4rem 0.75rem; background: rgba(255,255,255,0.92); border-radius: 999px; font-size: 0.8rem; font-weight: 900; color: #111; text-transform: uppercase; }
        .chShop { padding: 1.25rem 1rem 3rem; }
        .chFeatured {
          display: grid; grid-template-columns: 1.1fr 1fr; margin-bottom: 1.5rem; border-radius: 22px; overflow: hidden;
          background: rgba(255,255,255,0.95); text-decoration: none; color: #111; box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .chFeatured:hover { transform: translateY(-2px); }
        .chFeaturedImg { position: relative; min-height: 300px; background: #0b1220; }
        .chFeaturedBody { padding: 1.75rem; display: flex; flex-direction: column; justify-content: center; }
        .chBadge {
          display: inline-block; width: fit-content; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.75rem;
          font-weight: 800; margin-bottom: 0.65rem; background: rgba(110,231,183,0.2); color: #059669;
        }
        .chFeaturedBody h2 { margin: 0 0 0.4rem; font-size: 1.45rem; font-weight: 700; }
        .chPrice { font-size: 1.4rem; font-weight: 900; margin: 0 0 0.75rem; color: #0f172a; }
        .chFeaturedCta { font-weight: 800; color: #111; }
        .chGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.9rem; }
        .chCard {
          border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.95); text-decoration: none; color: #111;
          box-shadow: 0 12px 36px rgba(0,0,0,0.2); transition: transform 0.18s ease;
        }
        .chCard:hover { transform: translateY(-3px); }
        .chCardImg { position: relative; height: 200px; background: #0b1220; }
        .chCardBody { padding: 0.85rem; text-align: center; }
        .chCardBody h3 { margin: 0 0 0.3rem; font-size: 0.95rem; font-weight: 600; line-height: 1.3; }
        .chCardBody .chPrice { font-size: 1.1rem; margin: 0; }
        .chFoot { text-align: center; padding: 1rem 1rem 3.5rem; color: #a1a1aa; font-size: 0.95rem; }
        @media (max-width: 720px) {
          .chFeatured { grid-template-columns: 1fr; }
          .chGrid { grid-template-columns: repeat(2, 1fr); }
          .chCardImg { height: 150px; }
          .chHero { padding-top: 12vh; }
        }
        @media (prefers-reduced-motion: reduce) { .chSky { transform: none !important; } }
      `}</style>
    </>
  );
}
