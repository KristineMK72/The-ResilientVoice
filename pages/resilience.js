// pages/resilience.js  
import ProductGrid from "../components/ProductGrid";

export default function Accessories() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#333" }}>Resilience Collection</h1>
        <p style={{ fontSize: "1.3rem", color: "#666" }}>
         This is for the ones who got back up. Who turned scars into stories. Who learned that falling apart is sometimes the first step to becoming unbreakable. Every piece here is a reminder: you survived the storm — now wear the proof..
        </p>
      </div>
      <ProductGrid category="resilience" />
    </main>
  );
}
