import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Immersive home — storm → light story
 * Background: /IMG_2038.jpeg (in public/)
 * Parallax + soft atmosphere (no heavy weather engine)
 */

const FEATURED = {
  grace: ["402034024"],
  patriot: ["405190886"],
  social: ["408880904", "408875632", "408880721"],
};

function money(n) {
  const num = Number(n);
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "View";
}

function pickImage(product) {
  const v0 = product?.variants?.[0];
  return (
    v0?.preview_url ||
    product?.thumbnail_url ||
    (product?.sync_product_id ? `/${product.sync_product_id}_1.png` : null) ||
    "/fallback.png"
  );
}

export default function HomeImmersive() {
  const [products, setProducts] = useState({ grace: [], patriot: [], social: [] });
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const [emailStatus, setEmailStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setParallaxY(Math.min(y * 0.35, 280));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const fetchOne = async (id) => {
          const res = await fetch(`/api/printful-product/${id}`);
          if (!res.ok) return null;
          return res.json();
        };
        const [g, p, s] = await Promise.all([
          Promise.all(FEATURED.grace.map(fetchOne)),
          Promise.all(FEATURED.patriot.map(fetchOne)),
          Promise.all(FEATURED.social.map(fetchOne)),
        ]);
        if (!alive) return;
        setProducts({
          grace: g.filter(Boolean),
          patriot: p.filter(Boolean),
          social: s.filter(Boolean),
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Grit & Grace | The storm isn’t the end of the story</title>
        <meta
          name="description"
          content="Faith-driven apparel born from storms. Grace, grit, and social impact — shopping with hope. 10% of every sale supports healing and community."
        />
      </Head>

      <div className="immersive">
        <div
          className="sky"
          style={{
            transform: `translate3d(0, ${parallaxY}px, 0) scale(1.08)`,
          }}
          aria-hidden
        >
          <div className="skyImg" />
          <div className="skyWash" />
          <div className="atmRain" />
          <div className="atmGlow" />
        </div>

        <div className="immersiveInner">
          <section className="hero">
            <p className="eyebrow">Faith · Freedom · Healing · Purpose</p>
            <h1 className="title">
              The storm isn’t
              <br />
              the end of the story.
            </h1>
            <p className="lead">
              Grit gets you back up. Grace keeps you human. What you wear can carry both —
              and 10% of every sale helps someone else keep going.
            </p>
            <div className="ctaRow">
              <a href="#grace" className="btn btnPrimary">
                Begin the story ↓
              </a>
              <Link href="/about" className="btn btnGhost">
                Why we exist
              </Link>
            </div>
          </section>

          <section id="grace" className="chapter">
            <div className="chapterCard">
              <p className="eyebrow" style={{ color: "#d4a5e8" }}>
                Chapter · Saved by Grace
              </p>
              <h2>Faith for the soft days and the hard ones.</h2>
              <p>
                Designs that speak life — that you are seen, loved, and never alone. Grace is
                permission to be human while grit still rises.
              </p>
              <Link href="/saved-by-grace" className="btn btnGrace">
                Shop Saved by Grace →
              </Link>
              <ProductRow items={products.grace} loading={loading} badge="Grace" />
            </div>
          </section>

          <section id="patriot" className="chapter">
            <div className="chapterCard">
              <p className="eyebrow" style={{ color: "#fca5a5" }}>
                Chapter · Patriot
              </p>
              <h2>Courage for those who serve — and those who keep showing up.</h2>
              <p>
                We honor veterans, first responders, and everyday people carrying burdens others
                can’t always see. Freedom isn’t free; neither is hope.
              </p>
              <Link href="/Patriot" className="btn btnPatriot">
                Shop Patriot →
              </Link>
              <ProductRow items={products.patriot} loading={loading} badge="Patriot" />
            </div>
          </section>

          <section id="social" className="chapter">
            <div className="chapterCard">
              <p className="eyebrow" style={{ color: "#93c5fd" }}>
                Chapter · Social impact
              </p>
              <h2>Healing out loud. Hope you can wear.</h2>
              <p>
                Messy seasons. The climb. Mental health without shame. Apparel that starts honest
                conversations — and funds real support in our community and beyond.
              </p>
              <div className="ctaRow" style={{ justifyContent: "flex-start" }}>
                <Link href="/Social" className="btn btnSocial">
                  Shop Social →
                </Link>
                <Link href="/giving" className="btn btnGhost">
                  See our giving
                </Link>
              </div>
              <ProductRow items={products.social} loading={loading} badge="Social" />

              <div className="partners">
                <p className="partnersLabel">10% of every sale supports</p>
                <ul>
                  <li>Sexual Assault Services Minnesota</li>
                  <li>The Lighthouse Project</li>
                  <li>Lakes Area Restorative Justice</li>
                  <li>988 Suicide & Crisis Lifeline</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="close">
            <p className="quote">“You are not alone. You have strength. You are seen.”</p>
            <p className="signoff">With love, faith, and gratitude — Kristine · Grit & Grace</p>
            <div className="ctaRow">
              <Link href="/blog/storms" className="btn btnGhost">
                Read the full origin story
              </Link>
              <Link href="/about" className="btn btnGhost">
                About the brand
              </Link>
            </div>

            <div className="emailBox">
              <h3>Join the family</h3>
              <p>Encouragement, new releases, and impact updates.</p>
              <form
                className="emailForm"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  setEmailStatus({ state: "loading", message: "" });
                  const res = await fetch("/api/email-signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if (res.ok) {
                    setEmailStatus({ state: "success", message: "You're in! Welcome ♥️" });
                    e.target.reset();
                    setTimeout(() => {
                      window.location.href = "/welcome";
                    }, 900);
                  } else {
                    setEmailStatus({ state: "error", message: "Something went wrong." });
                  }
                }}
              >
                <input type="email" name="email" required placeholder="Your email" />
                <button type="submit" disabled={emailStatus.state === "loading"}>
                  {emailStatus.state === "loading" ? "Joining…" : "Join"}
                </button>
              </form>
              {emailStatus.message && (
                <p className={emailStatus.state === "success" ? "ok" : "err"}>{emailStatus.message}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .immersive {
          position: relative;
          min-height: 100vh;
          color: #fff;
          overflow-x: hidden;
        }
        .sky {
          position: fixed;
          inset: -8% 0 -20% 0;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .skyImg {
          position: absolute;
          inset: 0;
          background: #070b14 url("/IMG_2038.jpeg") center / cover no-repeat;
        }
        .skyWash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(7, 11, 20, 0.55) 0%,
            rgba(7, 11, 20, 0.35) 35%,
            rgba(7, 11, 20, 0.72) 70%,
            rgba(7, 11, 20, 0.92) 100%
          );
        }
        .atmRain {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(15, 23, 42, 0.35) 0%,
            transparent 42%,
            transparent 58%,
            rgba(255, 200, 120, 0.08) 100%
          );
          animation: breathe 14s ease-in-out infinite;
        }
        .atmGlow {
          position: absolute;
          top: 10%;
          right: 5%;
          width: 45%;
          height: 50%;
          background: radial-gradient(ellipse, rgba(255, 210, 140, 0.18), transparent 70%);
          animation: pulseGlow 10s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
        .immersiveInner {
          position: relative;
          z-index: 2;
          max-width: 920px;
          margin: 0 auto;
          padding: 2.5rem 1.25rem 4rem;
        }
        .hero {
          min-height: 78vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 3rem;
          text-align: center;
        }
        .eyebrow {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ffc0cb;
          margin: 0 0 0.75rem;
        }
        .title {
          font-size: clamp(2.2rem, 6vw, 3.6rem);
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1.1rem;
          text-shadow: 0 8px 40px rgba(0, 0, 0, 0.55);
        }
        .lead {
          font-size: clamp(1.05rem, 2vw, 1.2rem);
          line-height: 1.7;
          max-width: 36rem;
          margin: 0 auto 1.75rem;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
        }
        .ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.9rem 1.35rem;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }
        .btnPrimary {
          background: linear-gradient(90deg, #ff3b3b, #3b5bff);
          box-shadow: 0 12px 32px rgba(255, 59, 59, 0.25);
        }
        .btnGhost {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btnGrace {
          background: linear-gradient(135deg, #9f6baa, #c08bd0);
        }
        .btnPatriot {
          background: #00bfa5;
        }
        .btnSocial {
          background: #ff6b6b;
        }
        .chapter {
          margin: 2.5rem 0;
        }
        .chapterCard {
          background: rgba(7, 11, 20, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          padding: 1.75rem 1.5rem;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          text-align: left;
        }
        .chapterCard h2 {
          font-size: clamp(1.45rem, 3vw, 1.9rem);
          margin: 0 0 0.75rem;
          line-height: 1.2;
        }
        .chapterCard p {
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.88);
          margin: 0 0 1.15rem;
        }
        .partners {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .partnersLabel {
          font-weight: 800;
          color: #ffc0cb;
          margin: 0 0 0.5rem !important;
          font-size: 0.9rem;
        }
        .partners ul {
          margin: 0;
          padding-left: 1.1rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
        }
        .close {
          text-align: center;
          padding: 2rem 0 1rem;
        }
        .quote {
          font-size: clamp(1.2rem, 3vw, 1.55rem);
          font-style: italic;
          color: #e5dff1;
          margin: 0 0 0.75rem;
        }
        .signoff {
          color: #b0c4de;
          margin: 0 0 1.5rem;
        }
        .emailBox {
          margin: 2rem auto 0;
          max-width: 420px;
          padding: 1.5rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
        .emailBox h3 {
          margin: 0 0 0.35rem;
        }
        .emailBox p {
          margin: 0 0 1rem;
          opacity: 0.9;
        }
        .emailForm {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .emailForm input {
          flex: 1;
          min-width: 160px;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: none;
        }
        .emailForm button {
          background: #ff6b6b;
          color: #fff;
          border: none;
          padding: 0.8rem 1.2rem;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }
        .ok {
          color: #b9ffcc;
          font-weight: 800;
        }
        .err {
          color: #ffb4b4;
          font-weight: 800;
        }
        @media (prefers-reduced-motion: reduce) {
          .sky {
            transform: none !important;
          }
          .atmRain,
          .atmGlow {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

function ProductRow({ items, loading, badge }) {
  if (loading) {
    return <p style={{ opacity: 0.7, marginTop: "1.25rem" }}>Loading pieces…</p>;
  }
  if (!items?.length) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "0.85rem",
        marginTop: "1.35rem",
      }}
    >
      {items.map((p) => {
        const id = String(p.sync_product_id || p.id || "");
        const img = pickImage(p);
        const price = p.variants?.[0]?.retail_price;
        return (
          <Link
            key={id}
            href={`/product/${id}`}
            style={{
              textDecoration: "none",
              color: "#fff",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ position: "relative", height: 150, background: "#0b1220" }}>
              <Image src={img} alt={p.name || ""} fill style={{ objectFit: "contain", padding: 10 }} />
            </div>
            <div style={{ padding: "0.65rem 0.7rem 0.85rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, opacity: 0.75 }}>{badge}</div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ color: "#ff6b6b", fontWeight: 900, marginTop: 4 }}>{money(price)}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
