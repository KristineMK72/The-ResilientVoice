// pages/index.js ← FINAL VERSION – points to new categories
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [heroImages, setHeroImages] = useState({
    savedByGrace: null,
    success: null,
    patriot: null,
    social: null,
  });

  useEffect(() => {
    async function loadCollectionPreviews() {
      try {
        const res = await fetch("/api/printful-products");
        if (!res.ok) return;
        const data = await res.json();
        const products = Array.isArray(data.result) ? data.result : [];

        const previews = {
          savedByGrace: null,
          success: null,
          patriot: null,
          social: null,
        };

        for (const p of products) {
          const name = p.name.toLowerCase();

          if (!previews.savedByGrace && name.includes("grace")) {
            previews.savedByGrace = p.image;
          }
          if (!previews.success && name.includes("success")) {
            previews.success = p.image;
          }
          if (!previews.patriot && name.includes("patriot")) {
            previews.patriot = p.image;
          }
          if (!previews.social && name.includes("social")) {
            previews.social = p.image;
          }

          if (Object.values(previews).every(img => img !== null)) break;
        }

        setHeroImages(previews);
      } catch (err) {
        console.log("Printful preview images skipped (normal on first load)");
      }
    }

    loadCollectionPreviews();
  }, []);

  const collections = [
    {
      href: "/saved-by-grace",
      title: "Saved By Grace",
      desc: "Explore all collections in one place",
      img: heroImages.savedByGrace || "/fallback.png",
    },
    {
      href: "/success",
      title: "Success Stories",
      desc: "Celebrate victories and milestones",
      img: heroImages.success || "/fallback.png",
    },
    {
      href: "/patriot",
      title: "Patriot Collection",
      desc: "Strength and pride woven together",
      img: heroImages.patriot || "/fallback.png",
    },
    {
      href: "/social",
      title: "Social Impact",
      desc: "Pieces that spark conversation and change",
      img: heroImages.social || "/fallback.png",
    },
  ];

  return (
    <>
      <Head>
        <title>The Resilient Voice | Wear Your Story</title>
        <meta
          name="description"
          content="Apparel born from storms. Faith-fueled messages of resilience, grace, and unbreakable spirit. 10% of proceeds support mental health and suicide prevention."
        />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "7rem" }}>
          <h1 style={{ fontSize: "5rem", marginBottom: "1rem", color: "#333", fontWeight: "300" }}>
            The Resilient Voice
          </h1>
          <p style={{ fontSize: "1.9rem", color: "#555", maxWidth: "900px", margin: "0 auto" }}>
            Born from the storm. Every piece carries a message of survival, grace, and unbreakable spirit.
          </p>
        </div>

        {/* Collection Cards */}
        <div
          style={{
            display: "grid",
            gap: "3.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            marginBottom: "10rem",
          }}
        >
          {collections.map((c) => (
            <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 15px 45px rgba(159,107,170,0.2)",
                  transition: "all 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-20px)";
                  e.currentTarget.style.boxShadow = "0 30px 70px rgba(159,107,170,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 15px 45px rgba(159,107,170,0.2)";
                }}
              >
                <div style={{ position: "relative", height: "420px", background: "#f9f5fa" }}>
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "contain", padding: "50px" }}
                    priority
                  />
                </div>
                <div style={{ padding: "2.8rem 2rem", textAlign: "center" }}>
                  <h2 style={{ fontSize: "2.3rem", margin: "0 0 1rem", color: "#333", fontWeight: "500" }}>
                    {c.title}
                  </h2>
                  <p style={{ color: "#666", fontSize: "1.3rem", lineHeight: "1.7" }}>{c.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* About Section (unchanged) */}
        <section style={{ maxWidth: "900px", margin: "0 auto 6rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "3.2rem", marginBottom: "2.5rem", color: "#333" }}>
            About The Resilient Voice
          </h2>
          <div style={{ fontSize: "1.35rem", lineHeight: "1.9", color: "#444", textAlign: "left" }}>
            <p style={{ marginBottom: "1.8rem" }}>
              The Resilient Voice was born from storms — the kind that shake you, refine you, and push you closer to God’s purpose.
              Every hardship, heartbreak, and silent battle became a reminder that even when life breaks us open, grace pours in.
            </p>
            <p style={{ marginBottom: "1.8rem" }}>
              This brand is more than apparel. It is a mission rooted in healing, faith, and courage. Every design is crafted to speak life —
              to remind you that you are seen, you are strong, and you are deeply loved.
            </p>
            <p
              style={{
                fontWeight: "600",
                fontSize: "1.6rem",
                margin: "3rem 0",
                color: "#333",
                textAlign: "center",
              }}
            >
              “You are not alone. You have strength. You are seen.”
            </p>
            <p
              style={{
                fontSize: "1.4rem",
                fontStyle: "italic",
                color: "#555",
                textAlign: "center",
                marginTop: "4rem",
              }}
            >
              With love, faith, and gratitude,<br />
              <strong>Kristine — The Resilient Voice</strong>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
