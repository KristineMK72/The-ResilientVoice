import Head from "next/head";
import Link from "next/link";

export default function Shop() {
  return (
    <>
      <Head>
        <title>Shop All Collections | The Resilient Voice</title>
        <meta name="description" content="Resilience, Grace, and Warrior Spirit collections — handcrafted jewelry for survivors." />
        <meta property="og:title" content="Shop | The Resilient Voice" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", textAlign: "center", marginBottom: "3rem" }}>Shop Our Collections</h1>
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Link href="/resilience" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "2px solid #d4a5e0", borderRadius: "12px", padding: "2rem", textAlign: "center", background: "#faf5ff" }}>
              <div style={{ background: "#e0c8eb", height: "200px", borderRadius: "8px", marginBottom: "1rem" }} />
              <h2>Resilience Collection</h2>
              <p>Wear messages of strength and endurance</p>
            </div>
          </Link>

          <Link href="/grace" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "2px solid #d4a5e0", borderRadius: "12px", padding: "2rem", textAlign: "center", background: "#faf5ff" }}>
              <div style={{ background: "#e0c8eb", height: "200px", borderRadius: "8px", marginBottom: "1rem" }} />
              <h2>Grace Collection</h2>
              <p>Elegance born from the storm</p>
            </div>
          </Link>

          <Link href="/warrior-spirit" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "2px solid #d4a5e0", borderRadius: "12px", padding: "2rem", textAlign: "center", background: "#faf5ff" }}>
              <div style={{ background: "#e0c8eb", height: "200px", borderRadius: "8px", marginBottom: "1rem" }} />
              <h2>Warrior Spirit Co.</h2>
              <p>Unbroken Series — for the fighter in you</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
