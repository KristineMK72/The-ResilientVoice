import ProductGrid from "../components/ProductGrid";

export default function Accessories() {
  return (
    <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "3.8rem", fontWeight: "300", marginBottom: "1.5rem", color: "#333" }}>
        Accessories That Speak
      </h1>
      <p style={{ fontSize: "1.5rem", color: "#555", maxWidth: "800px", margin: "0 auto 4rem", lineHeight: "1.7" }}>
        From mugs that hold your morning courage to beanies that carry quiet strength — 
        these are more than accessories. They’re daily reminders that resilience travels with you.
      </p>
      <ProductGrid category="accessories" />
    </main>
  );
}
