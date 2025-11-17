import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function Grace() {
  return (
    <>
      <Head>
        <title>Grace Collection | The Resilient Voice</title>
      </Head>
      <main style={{ padding: "6rem 1rem", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.8rem", marginBottom: "1.5rem" }}>Grace Collection</h1>
        <p style={{ fontSize: "1.5rem", lineHeight: "1.9", color: "#444", maxWidth: "800px", margin: "0 auto 3rem" }}>
          Grace isn’t about never falling. It’s about rising with quiet strength — soft, elegant, and unapologetically whole. 
          These pieces are for the woman who carried the weight of the world and still chose beauty.
        </p>
        <ProductGrid category="grace" />
      </main>
    </>
  );
}
