import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function Resilience() {
  return (
    <>
      <Head>
        <title>Resilience Collection | The Resilient Voice</title>
        <meta name="description" content="Wear messages of strength and endurance. Handcrafted jewelry for survivors." />
        <meta property="og:title" content="Resilience Collection | The Resilient Voice" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem" }}>Resilience Collection</h1>
          <p style={{ fontSize: "1.4rem", maxWidth: "800px", margin: "1.5rem auto" }}>
            Wear messages of strength and endurance. Every piece tells a story of survival.
          </p>
        </div>
        <ProductGrid category="resilience" />
      </main>
    </>
  );
}
