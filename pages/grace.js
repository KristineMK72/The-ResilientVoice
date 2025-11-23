import ProductGrid from "../components/ProductGrid";

export default function Grace() {
  return (
    <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: "300", marginBottom: "1.5rem", color: "#333" }}>
        Grace Collection
      </h1>
      <p style={{ fontSize: "1.5rem", color: "#555", maxWidth: "900px", margin: "0 auto 4rem", lineHeight: "1.8" }}>
        Soft lines. Gentle truths. Unshakable faith.  
        These pieces were born in the aftermath of storms — 
        where brokenness met mercy, and beauty rose from ashes.
        <br /><br />
        Wear grace. Live grace. Be grace.
      </p>
      <ProductGrid category="grace" />
    </main>
  );
}
