// pages/index.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
          <h1 style={{ fontSize: "4.5rem", marginBottom: "1rem", color: "#333", fontWeight: "300" }}>
            The Resilient Voice
          </h1>
          <p style={{ fontSize: "1.8rem", color: "#666", maxWidth: "800px", margin: "0 auto 1rem" }}>
            Born from the storm. Every piece carries a message of survival, grace, and unbreakable spirit.
          </p>
        </div>

        {/* Collection Cards */}
        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            marginBottom: "8rem",
          }}
        >
          {[
            { href: "/resilience", title: "Resilience Collection", desc: "Wear messages of strength and endurance" },
            { href: "/grace", title: "Grace Collection", desc: "Elegance born from the storm" },
            { href: "/warrior-spirit", title: "Warrior Spirit", desc: "Unbroken Series — for the fighter in you" },
            { href: "/accessories", title: "Accessories", desc: "Carry your resilience everywhere" },
          ].map((collection) => (
            <Link key={collection.href} href={collection.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#f9f5fa",
                  borderRadius: "20px",
                  padding: "2.5rem 2rem",
                  boxShadow: "0 10px 30px rgba(159,107,170,0.15)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    background: "#e8d4ed",
                    height: "220px",
                    borderRadius: "16px",
                    marginBottom: "1.5rem",
                    backgroundImage: "url('/hero-placeholder.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <h2 style={{ fontSize: "1.9rem", color: "#333", margin: "0 0 0.5rem" }}>
                  {collection.title}
                </h2>
                <p style={{ color: "#777", fontSize: "1.1rem" }}>{collection.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* About / Mission Section */}
        <section style={{ maxWidth: "900px", margin: "0 auto 6rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "3rem", marginBottom: "2rem", color: "#333" }}>
            About The Resilient Voice
          </h2>
          <div style={{ fontSize: "1.35rem", lineHeight: "1.8", color: "#444", textAlign: "left" }}>
            <p style={{ marginBottom: "1.5rem" }}>
              The Resilient Voice was born from storms — the kind that shake you, refine you, and push you closer to God’s purpose. 
              Every hardship, heartbreak, and silent battle became a reminder that even when life breaks us open, grace pours in.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              This brand is more than apparel. It is a mission rooted in healing, faith, and courage. Every design is crafted to speak life — 
              to remind you that you are seen, you are strong, and you are deeply loved.
            </p>
            <p style={{ fontWeight: "600", fontSize: "1.5rem", margin: "2rem 0", color: "#333" }}>
              “You are not alone. You have strength. You are seen.”
            </p>

            <h3 style={{ fontSize: "2rem", margin: "2.5rem 0 1.5rem", color: "#333" }}>
              Our Purpose & Impact
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Part of walking in purpose means giving back. That’s why <strong>10% of all proceeds</strong> are donated to nonprofits that support people who need hope the most:
            </p>
            <ul style={{ paddingLeft: "2rem", margin: "1.5rem 0", fontSize: "1.3rem" }}>
              <li style={{ marginBottom: "0.8rem" }}>Suicide prevention & awareness</li>
              <li style={{ marginBottom: "0.8rem" }}>Anti-bullying programs</li>
              <li style={{ marginBottom: "0.8rem" }}>Mental health support networks</li>
              <li style={{ marginBottom: "0.8rem" }}>Homelessness relief and restoration</li>
            </ul>
            <p style={{ marginTop: "1.5rem" }}>
              These causes resonate deeply because they reflect the storms I’ve survived — moments when hope felt far away, 
              yet grace showed up through a message, a person, or a single act of compassion.
            </p>

            <h3 style={{ fontSize: "2rem", margin: "3rem 0 1.5rem", color: "#333" }}>
              A Community of Faith & Strength
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              When you wear The Resilient Voice, you’re not just buying apparel — you’re becoming part of a movement. 
              You’re spreading messages of hope, resilience, and God’s unshakable grace.
            </p>
            <p style={{ marginBottom: "2rem" }}>
              My prayer is that this becomes a community of people who lift each other up, speak life into one another, 
              and walk boldly in their purpose.
            </p>

            <p style={{ fontSize: "1.4rem", fontStyle: "italic", color: "#555" }}>
              With love, faith, and gratitude,<br />
              <strong>Kristine — Founder, The Resilient Voice</strong>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
