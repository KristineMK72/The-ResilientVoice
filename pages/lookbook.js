// pages/lookbook.js — Editorial story of the pieces
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";

const CHAPTERS = [
  {
    id: "grace",
    label: "Saved by Grace",
    href: "/saved-by-grace",
    accent: "#c08bd0",
    eyebrow: "Chapter · Faith",
    title: "Words that hold you.",
    body: "Redeemed. Chosen. Unshaken. Pieces shaped for soft days and hard ones — grace you can wear.",
    bg: "/IMG_2039.jpeg",
  },
  {
    id: "patriot",
    label: "Patriot",
    href: "/Patriot",
    accent: "#ef4444",
    eyebrow: "Chapter · Freedom",
    title: "Courage for those who serve.",
    body: "Veterans, first responders, and everyday grit. Freedom isn’t free — neither is hope.",
    bg: "/IMG_2041.jpeg",
  },
  {
    id: "social",
    label: "Social Impact",
    href: "/Social",
    accent: "#6ee7b7",
    eyebrow: "Chapter · Healing",
    title: "Hope you can wear out loud.",
    body: "Messy seasons. The climb. Conversations that matter — with 10% of every sale going back to community care.",
    bg: "/IMG_2042.jpeg",
  },
];

function byCategory(cat) {
  return Object.values(PRINTFUL_PRODUCTS).filter(
    (p) => p?.category === cat && p?.sync_product_id && p?.title
  );
}

export default function Lookbook() {
  const groups = useMemo(
    () =>
      CHAPTERS.map((ch) => ({
        ...ch,
        products: byCategory(ch.id).slice(0, 8),
      })),
    []
  );

  return (
    <>
      <Head>
        <title>Lookbook | Grit & Grace</title>
        <meta
          name="description"
          content="An editorial walk through Grace, Patriot, and Social — the story behind the pieces."
        />
      </Head>

      <div className="lb">
        <header className="lbHero">
          <p className="lbEyebrow">Lookbook</p>
          <h1>
            The pieces that
            <br />
            tell the story.
          </h1>
          <p className="lbLead">
            Three chapters. One brand. Scroll through faith, freedom, and healing — then shop what
            speaks to you.
          </p>
          <div className="lbJump">
            {CHAPTERS.map((c) => (
              <a key={c.id} href={`#${c.id}`} style={{ borderColor: c.accent, color: c.accent }}>
                {c.label}
              </a>
            ))}
          </div>
        </header>

        {groups.map((ch) => (
          <section key={ch.id} id={ch.id} className="lbChapter">
            <div
              className="lbChapterBg"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(7,11,20,0.55), rgba(7,11,20,0.88)), url(${ch.bg})`,
              }}
            />
            <div className="lbChapterInner">
              <div className="lbChapterCopy">
                <p className="lbEyebrow" style={{ color: ch.accent }}>
                  {ch.eyebrow}
                </p>
                <h2>{ch.title}</h2>
                <p>{ch.body}</p>
                <Link href={ch.href} className="lbShop" style={{ background: ch.accent }}>
                  Shop {ch.label} →
                </Link>
              </div>

              <div className="lbGrid">
                {ch.products.map((p) => {
                  const id = String(p.sync_product_id);
                  const img = p.thumbnail_url || `/${id}_1.png` || "/fallback.png";
                  return (
                    <Link key={id} href={`/product/${id}`} className="lbCard">
                      <div className="lbCardImg">
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          style={{ objectFit: "contain", padding: 14 }}
                          unoptimized={img.startsWith("http")}
                        />
                      </div>
                      <div className="lbCardBody">
                        <span style={{ color: ch.accent }}>{ch.label}</span>
                        <strong>{p.title}</strong>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {!ch.products.length && (
                <p className="lbEmpty">Pieces for this chapter are loading in — check back soon.</p>
              )}
            </div>
          </section>
        ))}

        <section className="lbClose">
          <p className="lbQuote">“You are not alone. You have strength. You are seen.”</p>
          <div className="lbCloseCtas">
            <Link href="/">Back home</Link>
            <Link href="/giving">See our giving</Link>
            <Link href="/about">Why we exist</Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .lb {
          background: #070b14;
          color: #fff;
          min-height: 100vh;
        }
        .lbHero {
          text-align: center;
          padding: 4rem 1.25rem 3rem;
          max-width: 720px;
          margin: 0 auto;
        }
        .lbEyebrow {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ffc0cb;
          margin: 0 0 0.6rem;
        }
        .lbHero h1 {
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .lbLead {
          font-size: 1.1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 1.5rem;
        }
        .lbJump {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .lbJump a {
          padding: 0.55rem 1rem;
          border-radius: 999px;
          border: 1px solid;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.04);
        }
        .lbChapter {
          position: relative;
          padding: 3.5rem 0 4rem;
          overflow: hidden;
        }
        .lbChapterBg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.55;
          pointer-events: none;
        }
        .lbChapterInner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        .lbChapterCopy {
          max-width: 520px;
          margin-bottom: 1.75rem;
        }
        .lbChapterCopy h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          margin: 0 0 0.65rem;
          font-weight: 900;
        }
        .lbChapterCopy p {
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1.1rem;
        }
        .lbShop {
          display: inline-flex;
          padding: 0.75rem 1.2rem;
          border-radius: 12px;
          color: #0b1220;
          font-weight: 900;
          text-decoration: none;
        }
        .lbGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.85rem;
        }
        .lbCard {
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          text-decoration: none;
          color: #111;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
          transition: transform 0.18s ease;
        }
        .lbCard:hover {
          transform: translateY(-3px);
        }
        .lbCardImg {
          position: relative;
          height: 170px;
          background: #f4f4f8;
        }
        .lbCardBody {
          padding: 0.7rem 0.75rem 0.9rem;
        }
        .lbCardBody span {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.2rem;
        }
        .lbCardBody strong {
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .lbEmpty {
          opacity: 0.8;
          font-style: italic;
        }
        .lbClose {
          text-align: center;
          padding: 3.5rem 1.25rem 4rem;
        }
        .lbQuote {
          font-size: clamp(1.15rem, 2.5vw, 1.45rem);
          font-style: italic;
          color: #e5dff1;
          margin: 0 0 1.5rem;
        }
        .lbCloseCtas {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .lbCloseCtas a {
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        @media (max-width: 520px) {
          .lbGrid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lbCardImg {
            height: 140px;
          }
        }
      `}</style>
    </>
  );
}
