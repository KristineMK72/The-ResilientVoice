// pages/warrior-spirit.js
import ProductGrid from "../components/ProductGrid";

export default function WarriorSpiritPage() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#333" }}>Warrior Spirit Co.</h1>
        <p style={{ fontSize: "1.3rem", color: "#666" }}>
          Warrior Spirit Co. is a tribute to the unbroken. This collection celebrates the fighters,
          survivors, and everyday warriors who rise with courage even in the face of storms. Each
          piece is designed as a symbol of strength and endurance — a reminder that resilience is
          not just about surviving, but about thriving with dignity and hope.
        </p>
      </div>
      {/* ✅ Only warrior-spirit products will be returned now */}
      <ProductGrid category="warrior-spirit" />
    </main>
  );
}
