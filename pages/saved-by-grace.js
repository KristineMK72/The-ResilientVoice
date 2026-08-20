// pages/saved-by-grace.js — Primo chapter layout
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
    "\u201cMy grace is sufficient for you.\u201d \u2014 2 Corinthians 12:9",
    "\u201cHe restores my soul.\u201d \u2014 Psalm 23:3",
    "\u201cYou are chosen, holy, and dearly loved.\u201d \u2014 Colossians 3:12",
    "\u201cFear not, for I have redeemed you.\u201d \u2014 Isaiah 43:1",
  ];
  const [currentScripture, setCurrentScripture] = useState(0);

  const GRACE_KEYS = useMemo(
    () => [
      "joy", "seasonal_joy", "strong", "courageous", "watchman", "builder", "power",
      "redeemed", "unshaken", "radiant", "chosen_tee", "love_tee", "faith_tee", "truth_tee",
      "light_classic_tee", "saved_messy_heavyweight_tee", "messy_fine_jersey_tee",
      "saved_long_sleeve", "forgiven_free_long_sleeve", "saved_redeemed_long_sleeve", "saved_redeemed_hoodie",
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
    const ids = GRACE_KEYS.map((k) => PRINTFUL_PRODUCTS[k]?.sync_product_id).filter(Boolean).map(String);
    const extra = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.category === "grace" && p?.sync_product_id)
      .map((p) => String(p.sync_product_id))
      .filter((id) => !ids.includes(id));
    return Array.from(new Set([...ids, ...extra]));
  }, [GRACE_KEYS]);

  useEffect(() => {
    const onScroll = () => setParallaxY(Math.min((window.scrollY || 0) * 0.28, 220));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentScripture((p) => (p + 1) % scriptures.length), 5000);
    return () => clearInterval(t);
  }, [scriptures.length]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!YOUR_PRODUCT_IDS.length) {
          setError("No products configured.");
          setLoading(false);
          return;
        }
        const cacheKey = `sbg_primo_v1_${YOUR_PRODUCT_IDS.join("_")}`;
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
        for (let i = 0; i < YOUR_PRODUCT_IDS.length; i += 6) {
          const chunk = YOUR_PRODUCT_IDS.slice(i, i + 6);
          const settled = await Promise.all(chunk.map(fetchOne));
          settled.forEach((r) => r && results.push(r));
        }
        const order = new Map(YOUR_PRODUCT_IDS.map((id, i) => [String(id), i]));
        results.sort(
          (a, b) =>
            (order.get(String(a?.sync_product_id ?? a?.id)) ?? 999) -
            (order.get(String(b?.sync_product_id ?? b?.id)) ?? 999)
        );
        if (!cancelled) {
          setProducts(results);
          setLoading(false);
          if (results.length) {
            try { sessionStorage.setItem(cacheKey, JSON.stringify(results)); } catch {}
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
    return () => { cancelled = true; };
  }, [YOUR_PRODUCT_IDS]);

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
        <title>Saved By Grace | Grit & Grace</title>
        <meta name="description" content="Faith-fueled designs that speak truth, strength, and softness — all while giving back." />
      </Head>

      <div className="ch">
        <div className="chSky" style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.06)` }} aria-hidden>
          <div className="chSkyImg" />
          <div className="chSkyWash" />
        </div>

        <div className="chInner">
          {loading ? (
            <div className="chStatus">Loading your Grace collection…</div>
          ) : error ? (
            <div className="chStatus err">
              <p>{error}</p>
              <button type="button" onClick={() => location.reload()}>Retry</button>
            </div>
          ) : (
            <>
              <header className="chHero">
                <p className="chEyebrow">Chapter · Saved by Grace</p>
                <h1>Saved By Grace</h1>
                <p className="chLead">
                  Grace is permission to be human. Wear the words that still speak when the storm is loud.
                </p>
                <div className="chCtas">
                  <a href="#shop" className="chBtn primary">Shop this chapter ↓</a>
                  <Link href="/about" className="chBtn ghost">Why we exist</Link>
                </div>
              </header>

              <div className="chStrip">
                <p>
                  Designs shaped by <strong>Redeemed</strong>, <strong>Chosen</strong>,{" "}
                  <strong>Strength</strong>, and <strong>Hope</strong> — with 10% of every sale
                  supporting healing in our community.
                </p>
                <div className="chStripLinks">
                  <a href="#shop">Shop</a>
                  <Link href="/giving">Giving</Link>
                  <Link href="/blog/storms">Journal</Link>
                </div>
              </div>

              <div className="chScripture">{scriptures[currentScripture]}</div>

              <section id="shop" className="chShop">
                {featured && (() => {
                  const m = meta(featured);
                  return (
                    <Link href={`/product/${m.id}`} className="chFeatured">
                      <div className="chFeaturedImg">
                        <Image src={m.img} alt={m.name} fill style={{ objectFit: "contain", padding: 24 }} priority />
                      </div>
                      <div className="chFeaturedBody">
                        <span className="chBadge">Signature · Grace</span>
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
                          <Image src={m.img} alt={m.name} fill style={{ objectFit: "contain", padding: 20 }} priority={idx < 2} />
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

              <p className="chFoot">More pieces every week · Designed with love · Powered by purpose</p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .ch { position: relative; min-height: 100vh; color: #2b2b2b; overflow-x: hidden; }
        .chSky { position: fixed; inset: -6% 0 -15% 0; z-index: 0; pointer-events: none; will-change: transform; }
        .chSkyImg { position: absolute; inset: 0; background: #1a1520 url("/IMG_2039.jpeg") center / cover no-repeat; }
        .chSkyWash {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(26,21,32,0.5) 0%, rgba(26,21,32,0.28) 32%, rgba(255,248,242,0.65) 58%, rgba(253,243,231,0.94) 100%);
        }
        .chInner { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; }
        .chStatus { text-align: center; padding: 8rem 1rem; font-size: 1.4rem; font-weight: 800; color: #9f6baa; }
        .chStatus.err { color: #ff6b6b; }
        .chStatus button { margin-top: 1rem; padding: 0.75rem 1.2rem; border-radius: 999px; border: none; font-weight: 800; cursor: pointer; background: #fff; color: #7a4f85; }
        .chHero { text-align: center; padding: 18vh 1.25rem 2rem; max-width: 640px; margin: 0 auto; }
        .chEyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #9f6baa; margin: 0 0 0.6rem; }
        .chHero h1 { font-size: clamp(2.4rem, 5.5vw, 3.5rem); font-weight: 900; color: #7a4f85; margin: 0 0 0.75rem; letter-spacing: -0.02em; line-height: 1.08; }
        .chLead { font-size: 1.15rem; line-height: 1.65; color: #333; margin: 0 0 1.5rem; }
        .chCtas { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .chBtn { display: inline-flex; align-items: center; padding: 0.85rem 1.25rem; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 0.95rem; }
        .chBtn.primary { background: linear-gradient(135deg, #9f6baa, #c08bd0); color: #fff; box-shadow: 0 10px 28px rgba(159,107,170,0.35); }
        .chBtn.ghost { background: rgba(255,255,255,0.75); color: #7a4f85; border: 1px solid rgba(159,107,170,0.25); }
        .chStrip { margin: 0 1rem 1.25rem; padding: 1.15rem 1.25rem; border-radius: 18px; background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(159,107,170,0.12); text-align: center; }
        .chStrip p { margin: 0 0 0.65rem; line-height: 1.6; color: #333; font-size: 0.98rem; }
        .chStripLinks { display: flex; gap: 1.25rem; justify-content: center; font-weight: 800; font-size: 0.9rem; }
        .chStripLinks a { color: #7a4f85; text-decoration: none; }
        .chScripture { text-align: center; padding: 0.85rem 1rem; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); font-size: 1rem; font-weight: 700; color: #7a4f85; position: sticky; top: 0; z-index: 5; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .chShop { padding: 1.5rem 1rem 3rem; }
        .chFeatured { display: grid; grid-template-columns: 1.1fr 1fr; gap: 0; margin-bottom: 1.75rem; border-radius: 22px; overflow: hidden; background: rgba(255,255,255,0.92); box-shadow: 0 20px 50px rgba(0,0,0,0.12); text-decoration: none; color: inherit; transition: transform 0.2s ease; }
        .chFeatured:hover { transform: translateY(-2px); }
        .chFeaturedImg { position: relative; min-height: 320px; background: linear-gradient(180deg, #faf7ff, #f0e8f5); }
        .chFeaturedBody { padding: 2rem 1.75rem; display: flex; flex-direction: column; justify-content: center; }
        .chBadge { display: inline-block; width: fit-content; padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.75rem; background: rgba(159,107,170,0.14); color: #7a4f85; }
        .chFeaturedBody h2 { margin: 0 0 0.5rem; font-size: 1.55rem; font-weight: 700; color: #2b2b2b; }
        .chPrice { font-size: 1.5rem; font-weight: 900; margin: 0 0 1rem; color: #9f6baa; }
        .chFeaturedCta { font-weight: 800; color: #7a4f85; }
        .chGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .chCard { border-radius: 18px; overflow: hidden; background: rgba(255,255,255,0.92); box-shadow: 0 12px 36px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .chCard:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(0,0,0,0.14); }
        .chCardImg { position: relative; height: 220px; background: linear-gradient(180deg, #faf7ff, #f6f1fb); }
        .chCardBody { padding: 0.9rem 1rem 1.1rem; text-align: center; }
        .chCardBody h3 { margin: 0 0 0.35rem; font-size: 1rem; font-weight: 600; color: #2b2b2b; line-height: 1.3; }
        .chCardBody .chPrice { font-size: 1.15rem; margin: 0; }
        .chFoot { text-align: center; padding: 1rem 1rem 3.5rem; color: #6a6a6a; font-size: 0.95rem; }
        @media (max-width: 720px) {
          .chFeatured { grid-template-columns: 1fr; }
          .chFeaturedImg { min-height: 260px; }
          .chHero { padding-top: 12vh; }
          .chGrid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .chCardImg { height: 160px; }
        }
        @media (prefers-reduced-motion: reduce) { .chSky { transform: none !important; } }
      `}</style>
    </>
  );
}
