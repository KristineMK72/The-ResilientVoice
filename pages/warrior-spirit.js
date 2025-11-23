// pages/warrior-spirit.js  
import ProductGrid from "../components/ProductGrid";

export default function Accessories() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#333" }}>Warrior Spirit and Co.</h1>
        <p style={{ fontSize: "1.3rem", color: "#666" }}>
          Warrior Spirit Co. is a tribute to the unbroken. This collection celebrates the fighters, survivors, and everyday warriors who rise with courage even in the face of storms. Each piece is designed as a symbol of strength and endurance — a reminder that resilience is not just about surviving, but about thriving with dignity and hope.
Crafted with intention, the Warrior Spirit line carries messages of empowerment and perseverance. Whether worn as a daily affirmation or gifted to someone walking their own path of resilience, these designs embody the spirit of those who refuse to be defined by hardship.
Step into the Warrior Spirit Co. collection and carry with you a bold declaration: I am unbroken, I am resilient, I am a warrior.
        </p>
      </div>
      <ProductGrid category="warrior-spirit" />
    </main>
  );
}
