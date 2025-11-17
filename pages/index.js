// pages/index.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>The Resilient Voice | Wear Your Story</title>
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem", color: "#333" }}>
          The Resilient Voice
        </h1>
        <p style={{ fontSize: "1.6rem", color: "#666", maxWidth: "800px", margin: "0 auto 4rem" }}>
          Born from the storm. Every piece carries a message of survival, grace, and unbreakable spirit.
        </p>

        {/* The 4 collection cards — now including Accessories again */}
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Link href="/resilience" style={{ textDecoration: "none" }}>
            <div style={{ background: "#f5e6f8", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 20px rgba(159,107,170,0.15)" }}>
              <div style={{ background: "#e8d4ed", height: "200px", borderRadius: "12px", marginBottom: "1.5rem" }} />
              <h2 style={{ fontSize: "1.8rem", color: "#333" }}>Resilience Collection</h2>
              <p style={{ color: "#666" }}>Wear messages of strength and endurance</p>
            </div>
          </Link>

          <Link href="/grace" style={{ textDecoration: "none" }}>
            <div style={{ background: "#f5e6f8", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 20px rgba(159,107,170,0.15)" }}>
              <div style={{ background: "#e8d4ed", height: "200px", borderRadius: "12px", marginBottom: "1.5rem" }} />
              <h2 style={{ fontSize: "1.8rem", color: "#333" }}>Grace Collection</h2>
              <p style={{ color: "#666" }}>Elegance born from the storm</p>
            </div>
          </Link>

          <Link href="/warrior-spirit" style={{ textDecoration: "none" }}>
            <div style={{ background: "#f5e6f8", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 20px rgba(159,107,170,0.15)" }}>
              <div style={{ background: "#e8d4ed", height: "200px", borderRadius: "12px", marginBottom: "1.5rem" }} />
              <h2 style={{ fontSize: "1.8rem", color: "#333" }}>Warrior Spirit</h2>
              <p style={{ color: "#666" }}>Unbroken Series — for the fighter in you</p>
            </div>
          </Link>

          <Link href="/accessories" style={{ textDecoration: "none" }}>
            <div style={{ background: "#f5e6f8", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 20px rgba(159,107,170,0.15)" }}>
              <div style={{ background: "#e8d4ed", height: "200px", borderRadius: "12px", marginBottom: "1.5rem" }} />
              <h2 style={{ fontSize: "1.8rem", color: "#333" }}>Accessories</h2>
              <p style={{ color: "#666" }}>Carry your resilience everywhere</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
