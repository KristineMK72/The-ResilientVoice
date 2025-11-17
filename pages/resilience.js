import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function Resilience() {
  return (
    <>
      <Head>
        <title>Resilience Collection | The Resilient Voice</title>
      </Head>
      <main style={{ padding: "6rem 1rem", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.8rem", marginBottom: "1.5rem" }}>Resilience Collection</h1>
        <p style={{ fontSize: "1.5rem", lineHeight: "1.9", color: "#444", maxWidth: "800px", margin: "0 auto 3rem" }}>
          This is for the ones who got back up. Who turned scars into stories. Who learned that falling apart is sometimes the first step to becoming unbreakable. 
          Every piece here is a reminder: <strong>you survived the storm — now wear the proof</strong>.
        </p>
        <ProductGrid category="resilience" />
      </main>
    </>
  );
}
