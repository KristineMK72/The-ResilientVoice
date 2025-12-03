export default function AboutPage() {
  // Define common styles for a clean, consistent look
  const paragraphStyle = {
    fontSize: "1.2rem",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
  };

  const linkStyle = {
    color: "#ffc0cb", // Light pink for contrast
    textDecoration: "underline",
    fontWeight: "bold",
  };

  return (
    <main
      // Main container uses the deep, resilient indigo-to-purple gradient
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        // The main card uses semi-transparent glassmorphism styling
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
          color: "#ffffff",
        }}
      >
        {/* === SECTION 1: MISSION & VOICE === */}
        <h1
          style={{
            fontSize: "3.2rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de",
            textAlign: "center",
          }}
        >
          Our Mission: The Resilient Voice & Grit & Grace
        </h1>

        <p style={paragraphStyle}>
          The **Grit & Grace** store is the retail voice born from storms — the kind that shake you,
          refine you, and push you closer to God’s purpose. Every hardship and silent battle became a
          reminder that even when life breaks us open, **God’s grace** pours in.
        </p>

        <p style={paragraphStyle}>
          This brand is more than apparel. It is a ministry rooted in healing, faith, and courage. Every
          design is crafted to speak life — to remind you that you are seen, you are strong, and you are
          **deeply loved** by God.
        </p>

        <blockquote
          style={{
            fontSize: "1.5rem",
            fontStyle: "italic",
            margin: "2rem 0",
            paddingLeft: "1.5rem",
            borderLeft: "4px solid #b0c4de",
            color: "#b0c4de",
          }}
        >
          “You are not alone. You have strength. You are seen.”
        </blockquote>

        <hr style={{ border: "0", borderTop: "1px solid rgba(255, 255, 255, 0.1)", margin: "3rem 0" }} />

        {/* === SECTION 2: IMPACT & CAUSES === */}
        <div style={{ padding: "0 0" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              marginBottom: "1.5rem",
              color: "#ffc0cb",
              textAlign: "center",
            }}
          >
            Giving Back: Our Commitment to Impact
          </h2>
          <p style={paragraphStyle}>
            Part of walking in God’s purpose means giving back in abundance. That’s why, through every
            purchase from our Grit & Grace apparel line, we're committed to donating{" "}
            <strong style={{ color: "#ffc0cb" }}>10% of every sale</strong> to organizations that uplift
            lives and restore hope in our communities.
          </p>

          <h3
            style={{
              fontSize: "1.5rem",
              marginTop: "2rem",
              marginBottom: "1rem",
              color: "#b0c4de",
            }}
          >
            Our Supported Causes
          </h3>
          <ul style={{ listStyle: "none", paddingLeft: "0", fontSize: "1.1rem" }}>
            <li style={{ marginBottom: "0.8rem" }}>
              🏠 <strong>Homelessness Support:</strong>{" "}
              <a
                href="https://www.bridgesofhopemn.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Bridges of Hope
              </a>{" "}
              — Providing shelter, food, and crisis support in Central Minnesota.
            </li>
            <li style={{ marginBottom: "0.8rem" }}>
              💚 <strong>Mental Health Advocacy:</strong>{" "}
              <a
                href="https://mnwitw.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Wellness in the Woods
              </a>{" "}
              — Offering 24/7 peer support and recovery programs across rural communities.
            </li>
            <li style={{ marginBottom: "0.8rem" }}>
              💙 <strong>Suicide Prevention:</strong>{" "}
              <a
                href="https://www.smilesforjake.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Smiles for Jake
              </a>{" "}
              — A Brainerd Lakes movement spreading hope through connection and education.
            </li>
            <li style={{ marginBottom: "0.8rem" }}>
              🛠️ <strong>Affordable Housing:</strong>{" "}
              <a
                href="https://lakesareahabitat.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Lakes Area Habitat for Humanity
              </a>{" "}
              — Building homes and hope across Cass, Crow Wing, Hubbard, and Wadena counties.
            </li>
          </ul>

          <p style={{ ...paragraphStyle, marginTop: "2rem" }}>
            Your support directly funds these efforts, turning a simple piece of apparel into an{" "}
            <strong style={{ color: "#ffc0cb" }}>active investment in hope and restoration.</strong>
          </p>
        </div>

        {/* --- SIGNATURE --- */}
        <p
          style={{
            textAlign: "right",
            marginTop: "40px",
            fontStyle: "italic",
            color: "#b0c4de",
          }}
        >
          🌿 With love, faith, and gratitude,
          <br />
          Kristine — The Resilient Voice & Grit & Grace
        </p>
      </section>
    </main>
  );
}
