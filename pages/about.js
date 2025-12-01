// This is the updated code for your About page file (e.g., pages/about.js)

export default function AboutPage() {
  return (
    <main
      // *** AMAZING BACKGROUND STYLING ADDED HERE ***
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        // A deep, resilient indigo-to-purple gradient
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)", 
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        className="card about-card"
        // Added inline styles to the card for a clean, floating look
        style={{
          maxWidth: "900px",
          width: "90%",
          padding: "4rem 3rem",
          margin: "80px 0",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.05)", // Semi-transparent white overlay
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)", // Blurs the background behind the card
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1
          className="about-title"
          // Updated title to the new brand name
          style={{ 
            fontSize: "3.2rem", 
            fontWeight: "900", 
            marginBottom: "1.5rem",
            color: "#b0c4de" // Light, subtle color
          }}
        >
          Our Mission: The Resilient Voice behind Grit & Grace
        </h1>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          The **Grit & Grace** store is the retail voice born from storms — the kind that shake you,
          refine you, and push you closer to God’s purpose. Every hardship,
          heartbreak, and silent battle became a reminder that even when life
          breaks us open, grace pours in.
        </p>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          This brand is more than apparel. It is a mission rooted in healing,
          faith, and courage. Every design is crafted to speak life — to remind
          you that you are seen, you are strong, and you are deeply loved.
        </p>
        <blockquote 
          className="about-quote"
          style={{ 
            fontSize: "1.5rem", 
            fontStyle: "italic", 
            margin: "2rem 0", 
            paddingLeft: "1.5rem",
            borderLeft: "4px solid #f8f8f8" // Subtle quote highlight
          }}
        >
          “You are not alone. You have strength. You are seen.”
        </blockquote>
        <h2 className="about-subtitle" style={{ fontSize: "2rem", marginTop: "2rem", color: "#87cefa" }}>Our Purpose & Impact</h2>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          Part of walking in purpose means giving back. That’s why{" "}
          <strong className="about-bold" style={{ color: "#ffc0cb" }}>
            10% of all proceeds are donated to nonprofits
          </strong>{" "}
          that support people who need hope the most:
        </p>
        <ul className="about-list" style={{ listStyle: "none", paddingLeft: "0", fontSize: "1.2rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>🕊️ Suicide prevention & awareness</li>
          <li style={{ marginBottom: "0.5rem" }}>💬 Anti-bullying programs</li>
          <li style={{ marginBottom: "0.5rem" }}>💚 Mental health support networks</li>
          <li style={{ marginBottom: "0.5rem" }}>🏠 Homelessness relief and restoration</li>
        </ul>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          These causes resonate deeply because they reflect the storms I’ve
          survived — moments when hope felt far away, yet grace showed up through
          a message, a person, or a single act of compassion.
        </p>
        <h2 className="about-subtitle" style={{ fontSize: "2rem", marginTop: "2rem", color: "#87cefa" }}>A Community of Faith & Strength</h2>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          When you wear **Grit & Grace**, you’re not just buying apparel —
          you’re becoming part of a movement. You’re spreading messages of hope,
          resilience, and God’s unshakable grace.
        </p>
        <p className="about-text" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
          My prayer is that this becomes a community of people who lift each
          other up, speak life into one another, and walk boldly in their
          purpose.
        </p>
        <p className="about-signature" style={{ marginTop: "2rem", fontStyle: "italic", color: "#ffc0cb" }}>
          🌿 With love, faith, and gratitude,
          <br />
          Kristine — Founder, Grit & Grace (The Resilient Voice)
        </p>
      </section>
    </main>
  );
}
