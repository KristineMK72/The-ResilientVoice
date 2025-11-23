// pages/index.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [heroImages, setHeroImages] = useState({
    resilience: "/fallback.png",
    grace: "/fallback.png",
    warrior: "/fallback.png",
    accessories: "/fallback.png",
  });

  useEffect(() => {
    async function loadHeroImages() {
      try {
        const res = await fetch("/api/printful-products");
        const data = await res.json();
        const products = Array.isArray(data.result) ? data.result : [];

        const images = {
          resilience: "/fallback.png",
          grace: "/fallback.png",
          warrior: "/fallback.png",
          accessories: "/fallback.png",
        };

        products.forEach(p => {
          const name = p.name.toLowerCase();
          if (name.includes("grace") && images.grace === "/fallback.png")
            images.grace = p.image;
          if ((name.includes("resilien") || name.includes("joy")) && images.resilience === "/fallback.png")
            images.resilience = p.image;
          if ((name.includes("warrior") || name.includes("power") || name.includes("coura")) && images.warrior === "/fallback.png")
            images.warrior = p.image;
          if ((name.includes("mug") || name.includes("beanie")) && images.accessories === "/fallback.png")
            images.accessories = p.image;
        });

        setHeroImages(images);
      } catch (err) {
        console.log("Could not load hero images, using fallback");
      }
    }
    loadHeroImages();
  }, []);

  const collections = [
    { href: "/resilience", title: "Resilience Collection", desc: "Wear messages of strength and endurance", img: heroImages.resilience },
    { href: "/grace", title: "Grace Collection", desc: "Elegance born from the storm", img: heroImages.grace },
    { href: "/warrior-spirit", title: "Warrior Spirit", desc: "Unbroken Series — for the fighter in you", img: heroImages.warrior },
    { href: "/accessories", title: "Accessories", desc: "Carry your resilience everywhere", img: heroImages.accessories },
  ];

  return (
    <>
      <Head>
        <title>The Resilient Voice | Wear Your Story</title>
        <meta
          name="description"
          content="Apparel born from storms. Faith-fueled messages of resilience, grace, and unbreakable spirit. 10% of every purchase supports suicide prevention, anti-bullying, mental health, and homelessness relief."
        />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h1 style={{ fontSize: "4.8rem", marginBottom: "1rem", color: "#333", fontWeight: "300", letterSpacing: "-0.5px" }}>
            The Resilient Voice
          </h1>
          <p style={{ fontSize: "1.9rem", color: "#555", maxWidth: "900px", margin: "0 auto 1.5rem", lineHeight: "1.7" }}>
            Born from the storm. Every piece carries a message of survival, grace, and unbreakable spirit.
          </p>
        </div>

        {/* Collection Cards — NOW WITH REAL PRINTFUL IMAGES */}
        <div
          style={{
            display: "grid",
            gap: "3rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            marginBottom: "10rem",
          }}
        >
          {collections.map((c) => (
            <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 15px 40px rgba(159,107,170,0.18)",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-16px)";
                  e.currentTarget.style.boxShadow = "0 25px 50px rgba(159,107,170,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(159,107,170,0.18)";
                }}
              >
                <div style={{ position: "relative", height: "380px", background: "#f8f5f9" }}>
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "contain", padding: "30px" }}
                    priority
                  />
                </div>
                <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                  <h2 style={{ fontSize: "2.1rem", margin: "0 0 0.8rem", color: "#333", fontWeight: "500" }}>
                    {c.title}
                  </h2>
                  <p style={{ color: "#666", fontSize: "1.2rem", lineHeight: "1.6" }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* About / Mission Section — unchanged, still beautiful */}
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
            <p style={{ fontWeight: "600", fontSize: "1.6rem", margin: "2.5rem 0", color: "#333", textAlign: "center" }}>
              “You are not alone. You have strength. You are seen.”
            </p>
            {/* Rest of your beautiful about text stays exactly the same */}
            <h3 style={{ fontSize: "2.1rem", margin: "3rem 0 1.5rem", color: "#333" }}>
              Our Purpose & Impact
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              That’s why <strong>10% of all proceeds</strong> are donated to nonprofits that support:
            </p>
            <ul style={{ paddingLeft: "2rem", margin: "2rem 0", fontSize: "1.3rem" }}>
              <li style={{ marginBottom: "1rem" }}>Suicide prevention & awareness</li>
              <li style={{ marginBottom: "1rem" }}>Anti-bullying programs</li>
              <li style={{ marginBottom: "1rem" }}>Mental health support networks</li>
              <li style={{ marginBottom: "1rem" }}>Homelessness relief and restoration</li>
            </ul>
            <h3 style={{ fontSize: "2.1rem", margin: "3.5rem 0 1.5rem", color: "#333" }}>
              A Community of Faith & Strength
            </h3>
            <p style={{ marginBottom: "2rem" }}>
              When you wear The Resilient Voice, you’re becoming part of a movement.
              You’re spreading messages of hope, resilience, and God’s unshakable grace.
            </p>
            <p style={{ fontSize: "1.4rem", fontStyle: "italic", color: "#555", textAlign: "center" }}>
              With love, faith, and gratitude,<br />
              <strong>Kristine — Founder, The Resilient Voice</strong>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
