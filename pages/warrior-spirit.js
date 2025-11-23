import ProductGrid from "../components/ProductGrid";

export default function WarriorSpirit() {
  return (
    <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: "300", marginBottom: "1.5rem", color: "#333" }}>
        Warrior Spirit Co.
      </h1>
      <p style={{ fontSize: "1.5rem", color: "#555", maxWidth: "900px", margin: "0 auto 4rem", lineHeight: "1.8" }}>
        For the fighters who never tap out.  
        The ones who stand when their legs shake, speak when their voice trembles, 
        and love even when it hurts.
        <br /><br />
        This is armor for your soul — bold, unapologetic, and forged in fire.
      </p>
      <ProductGrid category="warrior" />
    </main>
  );
}
