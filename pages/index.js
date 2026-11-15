// pages/index.js — Even longer continuous story with smaller product cards
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

function SmallCard({ product }) {
  if (!product) return null;
  const id = String(product.id);
  const name = product.name || product.title || "Piece";
  const img = pickImage(product);

  return (
    <Link href={`/product/${id}`} className="smallCard">
      <div className="smallImg">
        <Image src={img} alt={name} fill style={{ objectFit: "contain", padding: 8 }} unoptimized />
      </div>
      <span className="smallName">{name.split(" ").slice(0, 5).join(" ")}{name.split(" ").length > 5 ? "…" : ""}</span>
    </Link>
  );
}

export default function HomeStory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallaxY(Math.min((window.scrollY || 0) * 0.16, 140));
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
                It began in a garden. Not the one with perfect light and easy answers, but the one where everything broke and Someone still came looking. That is where grace starts — before the shame had a name, before the hiding had a strategy.
              </p>
              <SmallCard product={garden} />

              <p>
                Joy is not the absence of the break. It is the decision to wear the light anyway, even on the days the light is hard to see. Some seasons the light is a single candle. You still wear it.
              </p>
              <SmallCard product={joy} />

              <p>
                You are redeemed. Not improved. Not managed. Redeemed. The old name does not get the last word. The story does not end where the fall began.
              </p>
              <SmallCard product={redeemed} />

              <p>
                Saved is not a feeling that comes and goes with your mood. It is a fact you can put on your back and walk around in, even when your hands are still shaking and the ground still feels uneven.
              </p>
              <SmallCard product={saved} />

              <p>
                Forgiven and free is not a slogan for the good days. It is the ground under your feet on the hard ones — the ones where you need to remember you are not still paying a debt that was already settled.
              </p>
              <SmallCard product={forgiven} />

              <p>
                Grit. Grace. Freedom. Three words that refuse to stay in separate rooms. The same hands that receive mercy are the hands that stand for liberty. You cannot keep one and discard the others without losing the whole.
              </p>
              <SmallCard product={gritGrace} />

              <p>
                Freedom has a cost. Some of us wear the flag of the place that still believes a person can start over. Minnesota. The land of lakes and long winters and second chances that do not come with fine print.
              </p>
              <SmallCard product={mnFlagLong} />

              <p>
                The short sleeve version is for the days the weather turns and you still want the reminder close to your skin. Same flag. Same promise. Different temperature.
              </p>
              <SmallCard product={mnFlagShort} />

              <p>
                The next generation learns it early. A youth who knows the flag is not a costume — it is a promise — is already part of the story. They do not have to wait until they are older to understand what it costs.
              </p>
              <SmallCard product={usaLeggings} />

              <p>
                Strength is not only for the battlefield. It is for the mat, the classroom, the quiet morning when you choose to show up anyway. Patriotism can look like stillness. It can look like discipline. It can look like yoga.
              </p>
              <SmallCard product={patriotYoga} />

              <p>
                And then the story gets honest. Messy is not the opposite of holy. It is often the place holy shows up — unannounced, unpolished, unwilling to wait until you have cleaned the kitchen.
              </p>
              <SmallCard product={messy} />

              <p>
                The fine jersey version is for the days you need the truth close, soft against your skin, without the weight of a heavyweight reminder. Soft does not mean weak. Soft means wearable on the ordinary days.
              </p>
              <SmallCard product={messyFine} />

              <p>
                You can be the accidental cheerleader of your own life. The one who shows up for the people who forgot how to show up for themselves. Sometimes the most radical thing you can do is refuse to leave the sidelines when someone else is still in the game.
              </p>
              <SmallCard product={cheerleader} />

              <p>
                Some days you need to feel like a rockstar just to get out of bed. That is not vanity. That is survival with a little shine on it. The world does not always hand you the spotlight. Sometimes you have to put it on yourself.
              </p>
              <SmallCard product={rockstar} />

              <p>
                Land of lakes. Land of long winters. Land of people who know how to keep going when the light is short and the cold is honest. Wear the place that shaped you. Let it remind you that endurance is not a personality trait — it is a practice.
              </p>
              <SmallCard product={mnLand} />

              <p>
                Minnesota Cotton Heritage is for the days you want the story closer to the skin — soft, familiar, the kind of fabric that remembers the hands that made it and the land that raised you.
              </p>
              <SmallCard product={mnHeritage} />

              <p>
                Colorado, Minnesota, or anywhere else — the story travels. Grace does not need a zip code. The mountains and the lakes both know how to hold a person who is still becoming free.
              </p>
              <SmallCard product={colorado} />

              <p>
                Toby. The name on the back of a shirt that says someone is still standing for the ones who stood for us. Names matter. They are how we remember that freedom is not abstract — it has faces.
              </p>
              <SmallCard product={toby} />

              <p>
                Saved and redeemed on a hoodie is for the nights when the weight of the day needs a little more fabric. You can pull the hood up. You can still be seen. You can still be both.
              </p>
              <SmallCard product={savedRedeemedHoodie} />

              <p>
                Saved/messy is not a contradiction. It is the honest middle. You can be rescued and still in process. You can be clean in the places that matter and still learning how to live like it.
              </p>
              <SmallCard product={savedMessy} />

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

        .flow p { font-size: 1.12rem; line-height: 1.75; margin: 0 0 1.1rem; color: rgba(255,255,255,0.92); }

        .smallCard {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          width: 140px;
          margin: 0.35rem 0.55rem 1.3rem 0;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255,255,255,0.95);
          text-decoration: none;
          color: #1f1a24;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transition: transform 0.18s;
          vertical-align: top;
        }
        .smallCard:hover { transform: translateY(-3px); }
        .smallImg { position: relative; width: 140px; height: 140px; background: #f8f5fa; }
        .smallName {
          display: block;
          padding: 0.4rem 0.45rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-align: center;
          line-height: 1.25;
          color: #333;
        }

        .close { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 2rem; }
        .btn { display: inline-flex; padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 800; text-decoration: none; background: linear-gradient(135deg, #9f6baa, #ef4444); color: #fff; }
        .btn.ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }

        @media (max-width: 640px) {
          .narrative { padding-top: 5vh; }
          .smallCard { width: 120px; margin-right: 0.4rem; }
          .smallImg { width: 120px; height: 120px; }
        }
      `}</style>
    </>
  );
}
