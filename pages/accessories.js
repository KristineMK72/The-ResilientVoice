// pages/accessories.js  
import ProductGrid from "../components/ProductGrid";

export default function Accessories() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#333" }}>Accessories & More</h1>
        <p style={{ fontSize: "1.3rem", color: "#666" }}>
          Hats, totes, mugs, and accessories designed with purpose.
        </p>
      </div>
      <ProductGrid category="accessories" />
    </main>
  );
}
