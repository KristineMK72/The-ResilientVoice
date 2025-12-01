// This component acts as a central hub for all policies and legal documents.
// File name suggestion: pages/legal.js or pages/policies.js

export default function LegalPage() {
  return (
    <main
      // Match the deep, resilient indigo-to-purple gradient background style
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        className="card legal-card"
        // Match the floating card style from the About page
        style={{
          maxWidth: "900px",
          width: "90%",
          padding: "4rem 3rem",
          margin: "80px 0",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1
          className="legal-title"
          style={{
            fontSize: "3.2rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de" // Light, subtle color
          }}
        >
          Company Policies & Legal Information
        </h1>

        <p className="legal-intro" style={{ fontSize: "1.2rem", lineHeight: "1.6", marginBottom: "3rem" }}>
          Transparency is key to The Resilient Voice. Below you will find all the necessary information regarding how we operate, process orders, and protect your privacy.
        </p>

        <div className="policy-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}>

          {/* Policy Link Card 1: Shipping */}
          <PolicyCard
            title="Shipping Policy"
            description="Details on order processing times, shipping estimates, costs, and tracking."
            linkPath="/shipping-policy"
            icon="🚚"
          />

          {/* Policy Link Card 2: Refund & Return */}
          <PolicyCard
            title="Refund & Return Policy"
            description="Our guidelines for replacements and refunds for damaged or incorrect items."
            linkPath="/refund-policy"
            icon="🔄"
          />

          {/* Policy Link Card 3: Terms of Service */}
          <PolicyCard
            title="Terms of Service"
            description="The rules and regulations governing the use of our website and services."
            linkPath="/terms"
            icon="⚖️"
          />

          {/* Policy Link Card 4: Privacy Policy */}
          <PolicyCard
            title="Privacy Policy"
            description="How we collect, use, and protect your personal information and data."
            linkPath="/privacy"
            icon="🔒"
          />

          {/* Policy Link Card 5: FAQ */}
          <PolicyCard
            title="Frequently Asked Questions (FAQ)"
            description="Quick answers to common questions about our mission, products, and sizing."
            linkPath="/faq"
            icon="❓"
          />

        </div>
        
        <p className="legal-contact" style={{ fontSize: "1rem", lineHeight: "1.6", marginTop: "4rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          For specific legal inquiries, please contact us at <a href="mailto:legal@theresilientvoice.com" style={{ color: "#ffc0cb", textDecoration: "none" }}>legal@theresilientvoice.com</a>.
        </p>

      </section>
    </main>
  );
}

// Helper component for styled policy links
function PolicyCard({ title, description, linkPath, icon }) {
  return (
    <a 
      href={linkPath} 
      style={{
        display: "block",
        padding: "1.5rem",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.08)",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.3s, transform 0.3s",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        // Hover effect for interactivity
        ":hover": {
          background: "rgba(255, 255, 255, 0.15)",
          transform: "translateY(-5px)",
        }
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#87cefa" }}>{title}</h3>
      <p style={{ fontSize: "0.95rem", opacity: "0.8" }}>{description}</p>
    </a>
  );
}
