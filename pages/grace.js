// pages/grace.js  
import ProductGrid from "../components/ProductGrid";

export default function Accessories() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#333" }}>The Grace Collection</h1>
        <p style={{ fontSize: "1.3rem", color: "#666" }}>
          Grace isn’t about never falling. It’s about rising with quiet strength — soft, elegant, and unapologetically whole. These pieces are for the woman who carried the weight of the world and still chose beauty.
        </p>
      </div>
      <ProductGrid category="grace" />
    </main>
  );
}
