import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function Grace() {
  return (
    <>
      <Head>
        <title>Grace Collection | The Resilient Voice</title>
        <meta name="description" content="Elegant jewelry born from the storm — beauty rising from chaos." />
        <meta property="og:title" content="Grace Collection | The Resilient Voice" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem" }}>Grace Collection</h1>
          <p style={{ fontSize: "1.4rem", maxWidth: "800px", margin: "1.5rem auto" }}>
            Elegant pieces that whisper beauty rising from chaos.
          </p>
        </div>
        <ProductGrid category="grace" />
      </main>
    </>
  );
}
