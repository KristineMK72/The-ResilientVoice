// pages/lookbook.js — Your Stunning Static Image Gallery
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function Lookbook() {
  return (
    <>
      <Head>
        <title>Lookbook | The Resilient Voice</title>
        <meta name="description" content="See the full collection — every piece tells a story of strength, grace, and survival." />
      </Head>

      <main style={{ padding: "6rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3.8rem", textAlign: "center", marginBottom: "1rem" }}>
          The Resilient Voice Lookbook
        </h1>
        <p style={{ fontSize: "1.5rem", textAlign: "center", color: "#555", maxWidth: "800px", margin: "0 auto 4rem" }}>
          Real pieces. Real stories. Worn by survivors, made for warriors.
        </p>

        {/* GALLERY GRID */}
        <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))" }}>
          {/* Add as many as you want — just change the src and caption */}
          <div>
            <Image src="/products/beanie.jpg" alt="Resilient Beanie" width={800} height={800} style={{ borderRadius: "16px", width: "100%", height: "auto" }} />
            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Resilient Beanie</p>
          </div>

          <div>
            <Image src="/products/joy-tshirt.jpg" alt="Joy T-Shirt" width={800} height={800} style={{ borderRadius: "16px", width: "100%", height: "auto" }} />
            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Joy T-Shirt – Resilience Collection</p>
          </div>

          <div>
            <Image src="/products/mug.jpg" alt="White Glossy Mug" width={800} height={800} style={{ borderRadius: "16px", width: "100%", height: "auto" }} />
            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Morning Reminder Mug</p>
          </div>

          {/* Add more here anytime */}
        </div>

        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <Link href="/shop" style={{ 
            padding: "1rem 2rem", 
            background: "#9f6baa", 
            color: "white", 
            borderRadius: "50px", 
            fontSize: "1.3rem", 
            textDecoration: "none" 
          }}>
            Shop the Collection →
          </Link>
        </div>
      </main>
    </>
  );
}
