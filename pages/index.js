// pages/index.js — Tiny inline product thumbnails woven into the story
"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function pickImage(p) {
  return (
    p?.image ||
    p?.thumbnail_url ||
    p?.preview_url ||
    "/gritngrlogo.png"
  );
}

function InlineThumb({ product }) {
  if (!product) return null;
  const id = String(product.id);
  const name = product.name || product.title || "Piece";
  const img = pickImage(product);

  return (
    <Link href={`/product/${id}`} className="inlineThumb" title={name}>
      <Image src={img} alt={name} width={48} height={48} style={{ objectFit: "contain" }} unoptimized />
    </Link>
  );
}

export default function HomeStory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallaxY(Math.min((window.scrollY || 0) * 0.14, 120));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/printful-products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const byName = (re) => products.find((p) => re.test(p.name || ""));

  const garden = byName(/garden of eden/i);
  const joy = byName(/^joy/i);
  const redeemed = byName(/redeemed/i);
  const saved = byName(/saved garment/i);
  const forgiven = byName(/forgiven and free/i);
  const gritGrace = byName(/grit\. grace\. freedom/i);
  const mnFlagLong = byName(/only minnesota flag long/i);
  const mnFlagShort = byName(/only mn flag short/i);
  const usaLeggings = byName(/usa flag youth/i);
  const patriotYoga = byName(/patriot yoga/i);
  const messy = byName(/messy heavyweight/i);
  const messyFine = byName(/messy fine jersey/i);
  const cheerleader = byName(/accidental cheerleader/i);
  const rockstar = byName(/rockstar/i);
  const mnLand = byName(/mn land of lakes/i);
  const mnHeritage = byName(/minnesota cotton heritage/i);
  const colorado = byName(/colorado/i);
  const toby = byName(/toby patriot/i);
  const savedRedeemedHoodie = byName(/saved and redeemed garment-dyed hoodie/i);
  const savedMessy = byName(/saved\/messy/i);

  return (
    <>
      <Head>
        <title>Grit & Grace | The Story</title>
        <meta name="description" content="One long story of grace, freedom, and healing — with every piece woven in." />
      </Head>

      <div className="story">
        <div className="sky" style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.04)` }} aria-hidden>
          <div className="skyImg" />
          <div className="skyWash" />
        </div>

        <article className="narrative">
          <header className="open">
            <p className="eyebrow">One story. Every piece.</p>
            <h1>From the garden to the climb — and back again.</h1>
            <p className="sub">
              Grace, patriotism, and the messy work of healing are not separate chapters. They are the same life, worn on the same body, told in the same breath.
            </p>
          </header>

          {loading ? (
            <p className="loading">Gathering the pieces…</p>
          ) : (
            <div className="flow">
              <p>
                It began in a garden. Not the one with perfect light and easy answers, but the one where everything broke and Someone still came looking. You can still feel the weight of that first covering when you pull on the <InlineThumb product={garden} /> tee — the soft cotton a reminder that grace arrived before the shame had a name.
              </p>

              <p>
                Morning light hits the kitchen counter. Joy is not the absence of the break. It is the decision to wear the light anyway. The <InlineThumb product={joy} /> shirt sits soft against your skin while the coffee cools, a single candle you refuse to put down even on the days the room stays dim.
              </p>

              <p>
                By midday the old name tries to speak. You answer with the weight of what has already been finished. The <InlineThumb product={redeemed} /> long sleeve becomes the proof you can carry on your back — heavy enough to feel real, soft enough to stay on while the day keeps moving.
              </p>

              <p>
                Afternoon wind cuts through the parking lot. Saved is not a feeling that comes and goes with your mood. It is a fact you can put on and walk around in. The heavyweight cotton of the <InlineThumb product={saved} /> shirt holds the heat while your mind catches up, hands still shaking, ground still uneven, but the fabric already knows you are covered.
              </p>

              <p>
                Evening settles. Forgiven and free is not a slogan for the good days. It is the ground under your feet on the hard ones. You pull the <InlineThumb product={forgiven} /> long sleeve over the places that still feel unfinished, and the debt that was already settled stops asking for more.
              </p>

              <p>
                Night comes and the three words refuse to stay in separate rooms. Grit. Grace. Freedom. The same hands that received mercy this morning are the hands that will stand for liberty tomorrow. The <InlineThumb product={gritGrace} /> shirt is the only fabric that can hold all three without tearing.
              </p>

              <p>
                Morning again. Freedom has a cost. You button the <InlineThumb product={mnFlagLong} /> and feel the weight of a place that still believes a person can start over. The land of lakes and long winters does not offer easy second chances, but it does not revoke them either.
              </p>

              <p>
                The weather turns. You switch to the <InlineThumb product={mnFlagShort} /> and the reminder stays close to your skin. Same flag. Same promise. Different temperature. The story does not require a full layer to stay true.
              </p>

              <p>
                A child runs past in the yard. The next generation learns it early. A youth who knows the flag is not a costume is already part of the story. The <InlineThumb product={usaLeggings} /> move with them — light enough for play, heavy enough to remember what it costs.
              </p>

              <p>
                Midday stillness. Strength is not only for the battlefield. It is for the mat. The <InlineThumb product={patriotYoga} /> hold the posture while your mind learns the same discipline — quiet, deliberate, unwilling to collapse even when no one is watching.
              </p>

              <p>
                The afternoon gets honest. Messy is not the opposite of holy. It is often the place holy shows up. The heavyweight <InlineThumb product={messy} /> does not wait for you to clean the kitchen. It sits on your shoulders while the counters stay cluttered and the grace stays anyway.
              </p>

              <p>
                Later you need the truth closer. The fine jersey version is for the days the heavyweight would be too much. Soft against your skin, ordinary enough for a Tuesday, honest enough for the climb that is still happening underneath. <InlineThumb product={messyFine} />
              </p>

              <p>
                Evening on the sidelines. You can be the accidental cheerleader of your own life. The one who shows up for the people who forgot how to show up for themselves. The <InlineThumb product={cheerleader} /> is the uniform for the ones who refuse to leave when someone else is still in the game.
              </p>

              <p>
                Night before the hard morning. Some days you need to feel like a rockstar just to get out of bed. The <InlineThumb product={rockstar} /> is survival with a little shine on it — the spotlight you put on yourself when the world does not hand it to you.
              </p>

              <p>
                Winter light. Land of lakes. Land of long winters. Land of people who know how to keep going when the light is short. The <InlineThumb product={mnLand} /> remembers the cold and the endurance it taught you. Endurance is not a personality trait. It is a practice you can wear.
              </p>

              <p>
                Closer to the skin. <InlineThumb product={mnHeritage} /> is for the days you want the story familiar — soft, the kind of fabric that remembers the hands that made it and the land that raised you. You do not have to explain the cold to anyone who has worn it.
              </p>

              <p>
                The story travels. Colorado mountains or Minnesota lakes — grace does not need a zip code. The <InlineThumb product={colorado} /> holds both altitudes. The climb looks different from the ridge, but the covering is the same.
              </p>

              <p>
                A name on the back. Toby. Someone is still standing for the ones who stood for us. The <InlineThumb product={toby} /> turns freedom from an idea into a face. You carry the name so the story does not become abstract.
              </p>

              <p>
                Night again. Saved and redeemed on a hoodie is for the hours when the weight of the day needs more fabric. You pull the hood up. You can still be seen. You can still be both. The garden is still there — you just wear the covering over it now. <InlineThumb product={savedRedeemedHoodie} />
              </p>

              <p>
                Morning returns. Saved/messy is not a contradiction. It is the honest middle. You can be rescued and still in process. The <InlineThumb product={savedMessy} /> sits close to the skin — soft enough for an ordinary day, honest enough for the climb that has not finished.
              </p>

              <p>
                Every piece on this page is part of the same sentence: you were chosen, you are free, and you are allowed to be messy while you heal. Wear the mix. Tell the whole story. 10% of every sale supports healing in our community — because the story is not only yours to carry.
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

        .narrative { position: relative; z-index: 2; max-width: 680px; margin: 0 auto; padding: 7vh 1.25rem 6rem; }
        .open { text-align: center; margin-bottom: 3rem; }
        .eyebrow { font-size: 0.76rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #d4a5e8; margin: 0 0 0.7rem; }
        .open h1 { font-size: clamp(2rem, 5vw, 2.9rem); font-weight: 900; line-height: 1.12; margin: 0 0 0.9rem; letter-spacing: -0.03em; }
        .sub { font-size: 1.08rem; line-height: 1.7; color: rgba(255,255,255,0.88); margin: 0 auto; max-width: 34rem; }

        .loading { text-align: center; padding: 3rem 0; color: #d4a5e8; font-weight: 700; }

        .flow p { font-size: 1.12rem; line-height: 1.75; margin: 0 0 1.4rem; color: rgba(255,255,255,0.92); }

        .inlineThumb {
          display: inline-block;
          vertical-align: middle;
          width: 48px;
          height: 48px;
          margin: 0 4px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          transition: transform 0.15s;
        }
        .inlineThumb:hover { transform: scale(1.08); }
        .inlineThumb img { display: block; }

        .close { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 2rem; }
        .btn { display: inline-flex; padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 800; text-decoration: none; background: linear-gradient(135deg, #9f6baa, #ef4444); color: #fff; }
        .btn.ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }

        @media (max-width: 640px) {
          .narrative { padding-top: 5vh; }
          .inlineThumb { width: 40px; height: 40px; }
        }
      `}</style>
    </>
  );
}
