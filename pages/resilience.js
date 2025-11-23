import ProductGrid from "../components/ProductGrid";

export default function Resilience() {
  return (
    <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: "300", marginBottom: "1.5rem", color: "#333" }}>
        Resilience Collection
      </h1>
      <p style={{ fontSize: "1.5rem", color: "#555", maxWidth: "900px", margin: "0 auto 4rem", lineHeight: "1.8" }}>
        For the ones who’ve been knocked down and still choose to rise. 
        Every design is a declaration: “I bent, I broke open, and I became unbreakable.”
        <br /><br />
        This is for you — the survivor, the thriver, the everyday warrior wearing your story with pride.
      </p>
      <ProductGrid category="resilience" />
    </main>
  );
}
