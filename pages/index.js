// pages/index.js — One continuous story: Grace + Patriot + Social
"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadChapterProducts } from "../lib/catalog/loadChapterProducts";

function pickImage(p) {
  return (
    p?.thumbnail_url ||
    p?.preview_url ||
    p?.variants?.[0]?.preview_url ||
    (p?.sync_product_id ? `/${p.sync_product_id}_1.png` : null) ||
    "/gritngrlogo.png"
  );
}

function ProductCard({ product }) {
  if (!product) return null;
  const id = String(product.sync_product_id || product.id);
  const name = product.title || product.name || "Piece";
  const img = pickImage(product);
  const price = product.variants?.[0]?.retail_price;

  return (
    <Link href={`/product/${id}`} className="inlineCard">
      <div className="inlineImg">
        <Image src={img} alt={name} fill style={{ objectFit: "contain", padding: 12 }} unoptimized />
      </div>
      <div className="inlineMeta">
        <span className="inlineName">{name}</span>
        <span className="inlinePrice">{price ? `$${Number(price).toFixed(2)}` : "View"}</span>
      </div>
    </Link>
  );
}

export default function HomeStory() {
  const [all, setAll] = useState({ grace: [], patriot: [], social: [] });
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallaxY(Math.min((window.scrollY || 0) * 0.22, 180));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [g, p, s] = await Promise.all([
          loadChapterProducts("grace"),
          loadChapterProducts("patriot"),
          loadChapterProducts("social"),
        ]);
        if (!alive) return;
        setAll({
          grace: g.products || [],
          patriot: p.products || [],
          social: s.products || [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // Curated picks that fit the story beats
  const chosen = all.grace.find(p => /chosen/i.test(p.title || p.name || ""));
  const redeemed = all.grace.find(p => /redeemed/i.test(p.title || p.name || ""));
  const unshaken = all.grace.find(p => /unshaken/i.test(p.title || p.name || ""));
  const joy = all.grace.find(p => /joy/i.test(p.title || p.name || "") && !/seasonal/i.test(p.title || ""));
  const freedom = all.patriot.find(p => /freedom/i.test(p.title || p.name || ""));
  const weThePeople = all.patriot.find(p => /we the people/i.test(p.title || p.name || ""));
  const patriotHoodie = all.patriot.find(p => /patriot hoodie/i.test(p.title || p.name || ""));
  const climb = all.social.find(p => /climb/i.test(p.title || p.name || ""));
  const semicolon = all.social.find(p => p.title === ";" || /semicolon/i.test(p.title || ""));
  const yourStory = all.social.find(p => /your story/i.test(p.title || p.name || ""));
  const messy = all.social.find(p => /messy/i.test(p.title || p.name || "")) || all.grace.find(p => /messy/i.test(p.title || p.name || ""));

  return (
    <>
      <Head>
        <title>Grit & Grace | The Story</title>
        <meta name="description" content="One story of grace, freedom, and healing — wearable pieces that mix faith, patriotism, and social impact." />
      </Head>

      <div className="story">
        <div className="sky" style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.04)` }} aria-hidden>
          <div className="skyImg" />
          <div className="skyWash" />
        </div>

        <article className="narrative">
          <header className="open">
            <p className="eyebrow">One story. Three threads.</p>
            <h1>Grace, freedom, and the climb — worn together.</h1>
            <p className="sub">
              This is not three collections. It is one life: the grace that saves you, the freedom worth standing for, and the messy, beautiful work of loving your neighbor.
            </p>
          </header>

          {loading ? (
            <p className="loading">Gathering the pieces…</p>
          ) : (
            <div className="flow">
              <p>
                It starts with grace. You are not an accident. You were <em>chosen</em> before the world was loud.
              </p>
              <ProductCard product={chosen} />

              <p>
                And when the storm comes — and it will — you are still <em>redeemed</em>. The old name does not get the last word.
              </p>
              <ProductCard product={redeemed} />

              <p>
                That same grace makes you <em>unshaken</em>. Not because the ground never moves, but because you know Who holds it.
              </p>
              <ProductCard product={unshaken} />

              <p>
                Joy is not the absence of pain. It is the presence of that grace, even on the hard days. Wear it so you remember.
              </p>
              <ProductCard product={joy} />

              <p>
                Grace does not stay private. It walks into the public square. It stands for <em>freedom</em> — the kind that costs something, the kind worth defending.
              </p>
              <ProductCard product={freedom} />

              <p>
                We the People is not a slogan. It is a promise that every person bears dignity. Faith and patriotism are not opposites; they are two ways of saying the same thing: this life matters.
              </p>
              <ProductCard product={weThePeople} />

              <p>
                Put on the hoodie. Stand for the ones who stand for others. Courage is not loud; it is consistent.
              </p>
              <ProductCard product={patriotHoodie} />

              <p>
                And then the story gets personal again. Healing is not a private luxury. The climb is real. Mental health is not a side note. You are allowed to be <em>messy</em> and still loved.
              </p>
              <ProductCard product={messy} />

              <p>
                A semicolon is not the end of the sentence. It is a pause that says, “I choose to keep going.”
              </p>
              <ProductCard product={semicolon} />

              <p>
                Your story is not finished. The grace that chose you, the freedom worth standing for, and the neighbor still climbing — they all belong in the same sentence.
              </p>
              <ProductCard product={yourStory} />

              <p>
                Wear the mix. Tell the whole story. 10% of every sale supports healing in our community — because the story is not only yours.
              </p>

              <div className="close">
                <Link href="/shop" className="btn">Shop the whole story</Link>
                <Link href="/about" className="btn ghost">Why we exist</Link>
              </div>
            </div>
          )}
        </article>
      </div>

      <style jsx>{`
        .story { position: relative; min-height: 100vh; color: #f8fafc; overflow-x: hidden; }
        .sky { position: fixed; inset: -4% 0 -10% 0; z-index: 0; pointer-events: none; }
        .skyImg { position: absolute; inset: 0; background: #070b14 url("/IMG_2038.jpeg") center / cover no-repeat; }
        .skyWash { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,11,20,0.55) 0%, rgba(7,11,20,0.72) 40%, rgba(7,11,20,0.92) 100%); }

        .narrative { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; padding: 8vh 1.25rem 6rem; }
        .open { text-align: center; margin-bottom: 3.5rem; }
        .eyebrow { font-size: 0.78rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #d4a5e8; margin: 0 0 0.8rem; }
        .open h1 { font-size: clamp(2.1rem, 5.5vw, 3.2rem); font-weight: 900; line-height: 1.12; margin: 0 0 1rem; letter-spacing: -0.03em; }
        .sub { font-size: 1.12rem; line-height: 1.7; color: rgba(255,255,255,0.88); margin: 0 auto; max-width: 36rem; }

        .loading { text-align: center; padding: 4rem 0; color: #d4a5e8; font-weight: 700; }

        .flow p { font-size: 1.15rem; line-height: 1.8; margin: 0 0 1.5rem; color: rgba(255,255,255,0.92); }
        .flow p em { color: #ffc0cb; font-style: normal; font-weight: 700; }

        .inlineCard { display: block; margin: 0 auto 2.5rem; max-width: 280px; border-radius: 20px; overflow: hidden; background: rgba(255,255,255,0.96); text-decoration: none; color: #0f172a; box-shadow: 0 16px 40px rgba(0,0,0,0.25); transition: transform 0.2s; }
        .inlineCard:hover { transform: translateY(-4px); }
        .inlineImg { position: relative; height: 220px; background: #f8f5fa; }
        .inlineMeta { padding: 0.9rem 1rem; text-align: center; }
        .inlineName { display: block; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem; }
        .inlinePrice { color: #9f6baa; font-weight: 800; font-size: 1.05rem; }

        .close { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; margin-top: 2.5rem; }
        .btn { display: inline-flex; padding: 0.95rem 1.4rem; border-radius: 14px; font-weight: 800; text-decoration: none; background: linear-gradient(135deg, #9f6baa, #ef4444); color: #fff; }
        .btn.ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }

        @media (max-width: 640px) {
          .narrative { padding-top: 6vh; }
          .inlineCard { max-width: 100%; }
          .inlineImg { height: 200px; }
        }
      `}</style>
    </>
  );
}
