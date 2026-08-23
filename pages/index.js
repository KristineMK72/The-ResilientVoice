import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadChapterProducts } from "../lib/catalog/loadChapterProducts";

/**
 * Grit & Grace — Immersive homepage redesign
 * Storm → light story. All original logic preserved.
 */

function money(n) {
  const num = Number(n);
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "View";
}

function pickImage(product) {
  const v0 = product?.variants?.[0];
  return (
    v0?.preview_url ||
    product?.thumbnail_url ||
    product?.preview_url ||
    (product?.sync_product_id ? `/${product.sync_product_id}_1.png` : null) ||
    "/faithLogo.png"
  );
}

const EMPTY = { grace: [], patriot: [], social: [] };

export default function HomeImmersive() {
  const [products, setProducts] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const [emailStatus, setEmailStatus] = useState({ state: "idle", message: "" });

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
    let alive = true;

    async function loadCategory(cat) {
      try {
        const { products: list } = await loadChapterProducts(cat);
        return (list || []).slice(0, 4);
      } catch {
        return [];
      }
    }

    async function load() {
      setLoading(true);
      try {
        const timed = Promise.race([
          Promise.all([
            loadCategory("grace"),
            loadCategory("patriot"),
            loadCategory("social"),
          ]),
          new Promise((resolve) =>
            setTimeout(() => resolve([[], [], []]), 8000)
          ),
        ]);

        const [g, p, s] = await timed;
        if (!alive) return;
        setProducts({
          grace: g || [],
          patriot: p || [],
          social: s || [],
        });
      } catch (e) {
        console.error(e);
        if (alive) setProducts(EMPTY);
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

      <div className="home">
        {/* Fixed atmospheric background */}
        <div
          className="sky"
          style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.06)` }}
          aria-hidden
        >
          <div className="skyImg" />
          <div className="skyWash" />
          <div className="skyGlow" />
        </div>

        <div className="homeInner">
          {/* HERO */}
          <section className="hero">
            <p className="eyebrow">Faith · Freedom · Healing · Purpose</p>
            <h1 className="title">
              The storm isn’t
              <span className="titleBreak">the end of the story.</span>
            </h1>
            <p className="lead">
              Grit gets you back up. Grace keeps you human. What you wear can
              carry both — and <strong>10% of every sale</strong> helps someone
              else keep going.
            </p>
            <div className="ctaRow">
              <a href="#chapters" className="btn btnPrimary">
                Begin the story
              </a>
              <Link href="/about" className="btn btnGhost">
                Why we exist
              </Link>
            </div>
          </section>

          {/* CHAPTERS */}
          <div id="chapters" className="chapters">
            {/* GRACE */}
            <section className="chapter chapterGrace">
              <div className="chapterMeta">
                <span className="chapterNum">01</span>
                <p className="chapterLabel">Chapter · Saved by Grace</p>
              </div>
              <h2 className="chapterTitle">
                Faith for the soft days and the hard ones.
              </h2>
              <p className="chapterBody">
                Designs that speak life — that you are seen, loved, and never
                alone. Grace is permission to be human while grit still rises.
              </p>
              <Link href="/saved-by-grace" className="btn btnGrace">
                Shop Saved by Grace →
              </Link>
              <ProductRow
                items={products.grace}
                loading={loading}
                badge="Grace"
                href="/saved-by-grace"
              />
            </section>

            {/* PATRIOT */}
            <section className="chapter chapterPatriot">
              <div className="chapterMeta">
                <span className="chapterNum">02</span>
                <p className="chapterLabel">Chapter · Patriot</p>
              </div>
              <h2 className="chapterTitle">
                Courage for those who serve — and those who keep showing up.
              </h2>
              <p className="chapterBody">
                We honor veterans, first responders, and everyday people
                carrying burdens others can’t always see. Freedom isn’t free;
                neither is hope.
              </p>
              <Link href="/Patriot" className="btn btnPatriot">
                Shop Patriot →
              </Link>
              <ProductRow
                items={products.patriot}
                loading={loading}
                badge="Patriot"
                href="/Patriot"
              />
            </section>

            {/* SOCIAL */}
            <section className="chapter chapterSocial">
              <div className="chapterMeta">
                <span className="chapterNum">03</span>
                <p className="chapterLabel">Chapter · Social impact</p>
              </div>
              <h2 className="chapterTitle">
                Healing out loud. Hope you can wear.
              </h2>
              <p className="chapterBody">
                Messy seasons. The climb. Mental health without shame. Apparel
                that starts honest conversations — and funds real support in our
                community and beyond.
              </p>
              <div className="ctaRow left">
                <Link href="/Social" className="btn btnSocial">
                  Shop Social →
                </Link>
                <Link href="/giving" className="btn btnGhost">
                  See our giving
                </Link>
              </div>
              <ProductRow
                items={products.social}
                loading={loading}
                badge="Social"
                href="/Social"
              />

              <div className="partners">
                <p className="partnersLabel">10% of every sale supports</p>
                <ul className="partnersList">
                  <li>Sexual Assault Services Minnesota</li>
                  <li>The Lighthouse Project</li>
                  <li>Lakes Area Restorative Justice</li>
                  <li>988 Suicide & Crisis Lifeline</li>
                </ul>
              </div>
            </section>
          </div>

          {/* CLOSE */}
          <section className="close">
            <blockquote className="quote">
              “You are not alone. You have strength. You are seen.”
            </blockquote>
            <p className="signoff">
              With love, faith, and gratitude — Kristine · Grit & Grace
            </p>
            <div className="ctaRow">
              <Link href="/blog/storms" className="btn btnGhost">
                Read the origin story
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
                    setEmailStatus({
                      state: "success",
                      message: "You're in! Welcome ♥️",
                    });
                    e.target.reset();
                    setTimeout(() => {
                      window.location.href = "/welcome";
                    }, 900);
                  } else {
                    setEmailStatus({
                      state: "error",
                      message: "Something went wrong.",
                    });
                  }
                }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your email"
                  aria-label="Email address"
                />
                <button type="submit" disabled={emailStatus.state === "loading"}>
                  {emailStatus.state === "loading" ? "Joining…" : "Join"}
                </button>
              </form>
              {emailStatus.message && (
                <p
                  className={
                    emailStatus.state === "success" ? "msg ok" : "msg err"
                  }
                >
                  {emailStatus.message}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .home {
          position: relative;
          min-height: 100vh;
          color: #f8fafc;
          overflow-x: hidden;
        }

        /* —— Atmosphere —— */
        .sky {
          position: fixed;
          inset: -6% 0 -18% 0;
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
            rgba(7, 11, 20, 0.62) 0%,
            rgba(7, 11, 20, 0.38) 32%,
            rgba(7, 11, 20, 0.78) 68%,
            rgba(7, 11, 20, 0.94) 100%
          );
        }
        .skyGlow {
          position: absolute;
          top: 8%;
          right: 0;
          width: 55%;
          height: 55%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 200, 130, 0.14) 0%,
            transparent 68%
          );
          animation: pulseGlow 12s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.65;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .homeInner {
          position: relative;
          z-index: 2;
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1.35rem 5rem;
        }

        /* —— Hero —— */
        .hero {
          min-height: 82vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 3.5rem;
          text-align: center;
        }
        .eyebrow {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffc0cb;
          margin: 0 0 1rem;
        }
        .title {
          font-size: clamp(2.4rem, 7vw, 3.85rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0 0 1.25rem;
          text-shadow: 0 10px 48px rgba(0, 0, 0, 0.55);
        }
        .titleBreak {
          display: block;
        }
        .lead {
          font-size: clamp(1.08rem, 2.1vw, 1.25rem);
          line-height: 1.75;
          max-width: 38rem;
          margin: 0 auto 2rem;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
        }
        .lead strong {
          color: #ffc0cb;
          font-weight: 800;
        }

        /* —— Buttons —— */
        .ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        .ctaRow.left {
          justify-content: flex-start;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.95rem 1.4rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.2s ease, box-shadow 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.07);
        }
        .btnPrimary {
          background: linear-gradient(90deg, #ff3b3b, #3b5bff);
          box-shadow: 0 14px 36px rgba(255, 59, 59, 0.28);
        }
        .btnGhost {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .btnGrace {
          background: linear-gradient(135deg, #9f6baa, #c08bd0);
          box-shadow: 0 10px 28px rgba(159, 107, 170, 0.3);
        }
        .btnPatriot {
          background: #00bfa5;
          box-shadow: 0 10px 28px rgba(0, 191, 165, 0.25);
        }
        .btnSocial {
          background: #ff6b6b;
          box-shadow: 0 10px 28px rgba(255, 107, 107, 0.28);
        }

        /* —— Chapters —— */
        .chapters {
          display: flex;
          flex-direction: column;
          gap: 2.75rem;
          margin-top: 1rem;
        }
        .chapter {
          background: rgba(7, 11, 20, 0.74);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem 1.75rem 1.85rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
        }
        .chapterMeta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .chapterNum {
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
        }
        .chapterLabel {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0;
        }
        .chapterGrace .chapterLabel {
          color: #d4a5e8;
        }
        .chapterPatriot .chapterLabel {
          color: #fca5a5;
        }
        .chapterSocial .chapterLabel {
          color: #93c5fd;
        }
        .chapterTitle {
          font-size: clamp(1.5rem, 3.2vw, 1.95rem);
          font-weight: 850;
          line-height: 1.22;
          letter-spacing: -0.02em;
          margin: 0 0 0.85rem;
        }
        .chapterBody {
          font-size: 1.02rem;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.86);
          margin: 0 0 1.35rem;
          max-width: 38rem;
        }

        /* Partners */
        .partners {
          margin-top: 1.75rem;
          padding-top: 1.4rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .partnersLabel {
          font-weight: 800;
          font-size: 0.88rem;
          color: #ffc0cb;
          margin: 0 0 0.6rem;
        }
        .partnersList {
          margin: 0;
          padding-left: 1.15rem;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        /* —— Close —— */
        .close {
          text-align: center;
          padding: 3.5rem 0 1rem;
        }
        .quote {
          font-size: clamp(1.25rem, 3.2vw, 1.65rem);
          font-style: italic;
          font-weight: 500;
          color: #e8e0f4;
          margin: 0 0 0.85rem;
          line-height: 1.45;
        }
        .signoff {
          color: #a8b8d0;
          margin: 0 0 1.75rem;
          font-size: 0.98rem;
        }

        /* Email */
        .emailBox {
          margin: 2.5rem auto 0;
          max-width: 440px;
          padding: 1.75rem 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
        .emailBox h3 {
          margin: 0 0 0.3rem;
          font-size: 1.2rem;
        }
        .emailBox > p {
          margin: 0 0 1.15rem;
          opacity: 0.88;
          font-size: 0.95rem;
        }
        .emailForm {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .emailForm input {
          flex: 1;
          min-width: 160px;
          padding: 0.85rem 1.05rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.25);
          color: #fff;
        }
        .emailForm input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
        .emailForm button {
          background: #ff6b6b;
          color: #fff;
          border: none;
          padding: 0.85rem 1.3rem;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: filter 0.15s ease;
        }
        .emailForm button:hover:not(:disabled) {
          filter: brightness(1.08);
        }
        .emailForm button:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .msg {
          margin: 0.75rem 0 0;
          font-weight: 800;
          font-size: 0.92rem;
        }
        .msg.ok {
          color: #b9ffcc;
        }
        .msg.err {
          color: #ffb4b4;
        }

        @media (max-width: 640px) {
          .homeInner {
            padding: 1.5rem 1.1rem 4rem;
          }
          .chapter {
            padding: 1.5rem 1.2rem 1.4rem;
          }
          .hero {
            min-height: 74vh;
            padding-bottom: 2.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sky {
            transform: none !important;
          }
          .skyGlow {
            animation: none;
          }
          .btn:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}

function ProductRow({ items, loading, badge, href }) {
  if (loading) {
    return (
      <div className="productGrid" aria-busy="true" aria-label="Loading products">
        {[0, 1, 2].map((i) => (
          <div key={i} className="productCard skeleton">
            <div className="productImg skeletonImg" />
            <div className="productBody">
              <div className="skelLine short" />
              <div className="skelLine" />
            </div>
          </div>
        ))}
        <style jsx>{`
          .productGrid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.9rem;
            margin-top: 1.5rem;
          }
          .productCard {
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.32);
            min-height: 220px;
          }
          .skeletonImg {
            height: 155px;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04),
              rgba(255, 255, 255, 0.09),
              rgba(255, 255, 255, 0.04)
            );
            background-size: 200% 100%;
            animation: shimmer 1.4s ease-in-out infinite;
          }
          .productBody {
            padding: 0.75rem;
          }
          .skelLine {
            height: 11px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.12);
            margin-bottom: 8px;
          }
          .skelLine.short {
            width: 38%;
          }
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <p className="emptyMsg">
        <Link href={href || "#"} className="emptyLink">
          Browse the full {badge} collection →
        </Link>
        <style jsx>{`
          .emptyMsg {
            margin: 1.35rem 0 0;
            font-size: 0.95rem;
            opacity: 0.85;
          }
          .emptyLink {
            color: #ffc0cb;
            font-weight: 800;
            text-decoration: none;
          }
          .emptyLink:hover {
            text-decoration: underline;
          }
        `}</style>
      </p>
    );
  }

  return (
    <div className="productGrid">
      {items.map((p) => {
        const id = String(p.sync_product_id || p.id || "");
        const img = pickImage(p);
        const price = p.variants?.[0]?.retail_price ?? p.variants?.[0]?.price;
        return (
          <Link key={id} href={`/product/${id}`} className="productCard">
            <div className="productImg">
              <Image
                src={img}
                alt={p.name || p.title || ""}
                fill
                sizes="(max-width: 640px) 45vw, 180px"
                style={{ objectFit: "contain", padding: 12 }}
              />
            </div>
            <div className="productBody">
              <span className="productBadge">{badge}</span>
              <span className="productName">{p.title || p.name}</span>
              <span className="productPrice">{money(price)}</span>
            </div>
          </Link>
        );
      })}
      <style jsx>{`
        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.9rem;
          margin-top: 1.5rem;
        }
        .productCard {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #fff;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .productCard:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        }
        .productImg {
          position: relative;
          height: 155px;
          background: #0b1220;
        }
        .productBody {
          padding: 0.7rem 0.75rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .productBadge {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .productName {
          font-weight: 700;
          font-size: 0.92rem;
          line-height: 1.3;
        }
        .productPrice {
          color: #ff6b6b;
          font-weight: 900;
          font-size: 0.95rem;
          margin-top: 0.15rem;
        }
      `}</style>
    </div>
  );
}
