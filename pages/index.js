// pages/index.js — Full narrative techniques applied
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

function SmallCard({ product, scene }) {
  if (!product) return null;
  const id = String(product.id);
  const name = product.name || product.title || "Piece";
  const img = pickImage(product);

  return (
    <Link href={`/product/${id}`} className="smallCard">
      <div className="smallImg">
        <Image src={img} alt={name} fill style={{ objectFit: "contain", padding: 8 }} unoptimized />
      </div>
      <span className="smallName">{name.split(" ").slice(0, 4).join(" ")}{name.split(" ").length > 4 ? "…" : ""}</span>
      {scene && <span className="smallScene">{scene}</span>}
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
                It began in a garden. Not the one with perfect light and easy answers, but the one where everything broke and Someone still came looking. You can still feel the weight of that first covering when you pull on the <em>Garden of Eden</em> tee — the soft cotton a reminder that grace arrived before the shame had a name.
              </p>
              <SmallCard product={garden} scene="The first covering after the break." />

              <p>
                Morning light hits the kitchen counter. Joy is not the absence of the break. It is the decision to wear the light anyway. The <em>Joy</em> shirt sits soft against your skin while the coffee cools, a single candle you refuse to put down even on the days the room stays dim.
              </p>
              <SmallCard product={joy} scene="The candle you carry into the ordinary morning." />

              <p>
                By midday the old name tries to speak. You answer with the weight of what has already been finished. The <em>Redeemed</em> long sleeve becomes the proof you can carry on your back — heavy enough to feel real, soft enough to stay on while the day keeps moving.
              </p>
              <SmallCard product={redeemed} scene="The weight of a finished story on your shoulders." />

              <p>
                Afternoon wind cuts through the parking lot. Saved is not a feeling that comes and goes with your mood. It is a fact you can put on and walk around in. The heavyweight cotton of the <em>Saved</em> shirt holds the heat while your mind catches up, hands still shaking, ground still uneven, but the fabric already knows you are covered.
              </p>
              <SmallCard product={saved} scene="The heat that stays when your hands are still cold." />

              <p>
                Evening settles. Forgiven and free is not a slogan for the good days. It is the ground under your feet on the hard ones. You pull the <em>Forgiven & Free</em> long sleeve over the places that still feel unfinished, and the debt that was already settled stops asking for more.
              </p>
              <SmallCard product={forgiven} scene="The ground that holds when the day does not." />

              <p>
                Night comes and the three words refuse to stay in separate rooms. Grit. Grace. Freedom. The same hands that received mercy this morning are the hands that will stand for liberty tomorrow. The <em>Grit. Grace. Freedom.</em> shirt is the only fabric that can hold all three without tearing.
              </p>
              <SmallCard product={gritGrace} scene="The one garment that refuses to choose a side." />

              <p>
                Morning again. Freedom has a cost. You button the Minnesota flag long sleeve and feel the weight of a place that still believes a person can start over. The land of lakes and long winters does not offer easy second chances, but it does not revoke them either.
              </p>
              <SmallCard product={mnFlagLong} scene="The flag you wear when the winter is honest." />

              <p>
                The weather turns. You switch to the short sleeve and the reminder stays close to your skin. Same flag. Same promise. Different temperature. The story does not require a full layer to stay true.
              </p>
              <SmallCard product={mnFlagShort} scene="The same promise, closer to the skin." />

              <p>
                A child runs past in the yard. The next generation learns it early. A youth who knows the flag is not a costume is already part of the story. The <em>USA Flag Youth Leggings</em> move with them — light enough for play, heavy enough to remember what it costs.
              </p>
              <SmallCard product={usaLeggings} scene="The promise the next generation wears while they run." />

              <p>
                Midday stillness. Strength is not only for the battlefield. It is for the mat. The <em>Patriot Yoga Leggings</em> hold the posture while your mind learns the same discipline — quiet, deliberate, unwilling to collapse even when no one is watching.
              </p>
              <SmallCard product={patriotYoga} scene="The discipline that looks like stillness." />

              <p>
                The afternoon gets honest. Messy is not the opposite of holy. It is often the place holy shows up. The heavyweight <em>Messy</em> long sleeve does not wait for you to clean the kitchen. It sits on your shoulders while the counters stay cluttered and the grace stays anyway.
              </p>
              <SmallCard product={messy} scene="Holy that arrives before the kitchen is clean." />

              <p>
                Later you need the truth closer. The fine jersey version is for the days the heavyweight would be too much. Soft against your skin, ordinary enough for a Tuesday, honest enough for the climb that is still happening underneath.
              </p>
              <SmallCard product={messyFine} scene="The soft version for the ordinary Tuesday." />

              <p>
                Evening on the sidelines. You can be the accidental cheerleader of your own life. The one who shows up for the people who forgot how to show up for themselves. The <em>Accidental Cheerleader</em> long sleeve is the uniform for the ones who refuse to leave when someone else is still in the game.
              </p>
              <SmallCard product={cheerleader} scene="The uniform for the ones who stay." />

              <p>
                Night before the hard morning. Some days you need to feel like a rockstar just to get out of bed. The <em>Rockstar</em> tee is survival with a little shine on it — the spotlight you put on yourself when the world does not hand it to you.
              </p>
              <SmallCard product={rockstar} scene="The shine you put on yourself when no one else does." />

              <p>
                Winter light. Land of lakes. Land of long winters. Land of people who know how to keep going when the light is short. The <em>MN Land of Lakes</em> shirt remembers the cold and the endurance it taught you. Endurance is not a personality trait. It is a practice you can wear.
              </p>
              <SmallCard product={mnLand} scene="The practice of keeping going when the light is short." />

              <p>
                Closer to the skin. Minnesota Cotton Heritage is for the days you want the story familiar — soft, the kind of fabric that remembers the hands that made it and the land that raised you. You do not have to explain the cold to anyone who has worn it.
              </p>
              <SmallCard product={mnHeritage} scene="The fabric that remembers the land." />

              <p>
                The story travels. Colorado mountains or Minnesota lakes — grace does not need a zip code. The <em>Colorado</em> tee holds both altitudes. The climb looks different from the ridge, but the covering is the same.
              </p>
              <SmallCard product={colorado} scene="The same covering at a different altitude." />

              <p>
                A name on the back. Toby. Someone is still standing for the ones who stood for us. The <em>Toby Patriot</em> shirt turns freedom from an idea into a face. You carry the name so the story does not become abstract.
              </p>
              <SmallCard product={toby} scene="The name that keeps freedom from becoming abstract." />

              <p>
                Night again. Saved and redeemed on a hoodie is for the hours when the weight of the day needs more fabric. You pull the hood up. You can still be seen. You can still be both. The garden is still there — you just wear the covering over it now.
              </p>
              <SmallCard product={savedRedeemedHoodie} scene="The hood you pull up when the day needs more covering." />

              <p>
                Morning returns. Saved/messy is not a contradiction. It is the honest middle. You can be rescued and still in process. The <em>Saved/Messy</em> tee sits close to the skin — soft enough for an ordinary day, honest enough for the climb that has not finished.
              </p>
              <SmallCard product={savedMessy} scene="The honest middle you can wear to the grocery store." />

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

        .flow p { font-size: 1.12rem; line-height: 1.75; margin: 0 0 1rem; color: rgba(255,255,255,0.92); }
        .flow p em { color: #ffc0cb; font-style: normal; font-weight: 700; }

        .smallCard {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          width: 150px;
          margin: 0.4rem 0.6rem 1.6rem 0;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.96);
          text-decoration: none;
          color: #1f1a24;
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
          transition: transform 0.18s;
          vertical-align: top;
        }
        .smallCard:hover { transform: translateY(-3px); }
        .smallImg { position: relative; width: 150px; height: 150px; background: #f8f5fa; }
        .smallName {
          display: block;
          padding: 0.4rem 0.5rem 0.15rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-align: center;
          line-height: 1.25;
          color: #333;
        }
        .smallScene {
          display: block;
          padding: 0 0.5rem 0.55rem;
          font-size: 0.68rem;
          font-style: italic;
          text-align: center;
          line-height: 1.35;
          color: #6b3f78;
          opacity: 0.9;
        }

        .close { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 2rem; }
        .btn { display: inline-flex; padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 800; text-decoration: none; background: linear-gradient(135deg, #9f6baa, #ef4444); color: #fff; }
        .btn.ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }

        @media (max-width: 640px) {
          .narrative { padding-top: 5vh; }
          .smallCard { width: 130px; margin-right: 0.4rem; }
          .smallImg { width: 130px; height: 130px; }
        }
      `}</style>
    </>
  );
}
