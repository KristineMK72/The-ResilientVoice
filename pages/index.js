import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>The Resilient Voice | Apparel and Accesories born from the storm </title>
        <meta name="description" content="Apparel that carries messages of resilience, grace, and unbreakable spirit." />
        <meta property="og:title" content="The Resilient Voice" />
        <meta property="og:description" content="Apparel for survivors. Every piece tells a story of strength." />
        <meta property="og:type" content="website" />
      </Head>

      <main style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>The Resilient Voice</h1>
        <p style={{ fontSize: "1.5rem", maxWidth: "800px", margin: "0 auto 3rem" }}>
          Apparel and Accessories for survivors — carrying messages of resilience, grace, and unbreakable spirit.
        </p>
        <Link href="/shop">
          <button style={{ padding: "1rem 2.5rem", fontSize: "1.3rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Shop All Collections →
          </button>
        </Link>
      </main>
    </>
  );
}
