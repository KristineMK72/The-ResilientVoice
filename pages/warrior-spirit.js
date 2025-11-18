import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function WarriorSpirit() {
  return (
    <>
      <Head>
        <title>Warrior Spirit Co. Unbroken Series | The Resilient Voice</title>
        <meta name="description" content="Unbreakable jewelry for the fighter in you. Limited Unbroken Series." />
        <meta property="og:title" content="Warrior Spirit Co. | The Resilient Voice" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem" }}>Warrior Spirit Co.</h1>
          <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#9f6baa" }}>Unbroken Series</p>
          <p style={{ fontSize: "1.4rem", maxWidth: "800px", margin: "1.5rem auto" }}>
            For the fighter in you. Limited pieces that refuse to break.
          </p>
        </div>
        <ProductGrid category="Warrior" />
      </main>
    </>
  );
}
