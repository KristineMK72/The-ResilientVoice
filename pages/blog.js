export default function Blog() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #181d33 0%, #30264a 30%, #f9f5f1 60%, #ffffff 100%)",
        padding: "1rem 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          width: "90%",
          padding: "4rem 3rem",
          margin: "80px 0",
          borderRadius: "16px",
          // Overlay gradient inside the card itself
          background:
            "linear-gradient(180deg, rgba(24,29,51,0.9) 0%, rgba(255,255,255,0.9) 100%)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#111", // darker text for the lighter bottom
        }}
      >
        <h1
          style={{
            fontSize: "3.2rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de",
            textAlign: "center",
          }}
        >
          The Resilient Voice: Mission & Ministry
        </h1>

        <p style={{ fontSize: "1.2rem", lineHeight: "1.6", color: "#fff" }}>
          The <strong>Resilient Voice</strong> is a ministry and movement born
          from storms—the kind that shake you, refine you, and push you closer
          to God’s purpose. Every hardship and silent battle became a reminder
          that even when life breaks us open, <strong>God’s grace</strong> pours
          in.
        </p>

        <p style={{ fontSize: "1.2rem", lineHeight: "1.6", color: "#fff" }}>
          The <strong>Grit & Grace</strong> apparel line is the physical
          expression of this faith. It's more than clothing; it is a ministry
          rooted in healing, faith, and courage. Every design is crafted to
          speak life, to remind you that you are seen, you are strong, and you
          are <strong>deeply loved</strong> by God.
        </p>

        <blockquote
          style={{
            borderLeft: "4px solid #f8f8f8",
            paddingLeft: "1.5rem",
            fontStyle: "italic",
            fontSize: "1.5rem",
            margin: "2rem 0",
            color: "#fff",
          }}
        >
          “You are not alone. You have strength. You are seen.”
        </blockquote>

        {/* --- SECTION 2: GIVING BACK --- */}
        <div
          style={{
            padding: "2rem 0",
            marginTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1.5rem",
              color: "#30264a",
              textAlign: "center",
            }}
          >
            Giving Back Through Grit & Grace
          </h2>
          <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
            Part of walking in God’s purpose means giving back in abundance.
            That’s why, through every purchase from our Grit & Grace apparel
            line, we’re committed to donating <strong>10% of every sale</strong>{" "}
            to organizations that uplift lives and restore hope in our
            communities.
          </p>

          <h3
            style={{
              fontSize: "1.5rem",
              marginTop: "2rem",
              color: "#9f6baa",
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
                style={{ color: "#9f6baa" }}
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
                style={{ color: "#9f6baa" }}
              >
                Wellness in the Woods
              </a>{" "}
              — Offering 24/7 peer support and recovery programs across rural
              communities.
            </li>
            <li style={{ marginBottom: "0.8rem" }}>
              💙 <strong>Suicide Prevention:</strong>{" "}
              <a
                href="https://www.smilesforjake.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#9f6baa" }}
              >
                Smiles for Jake
              </a>{" "}
              — A Brainerd Lakes movement spreading hope through connection and
              education.
            </li>
            <li style={{ marginBottom: "0.8rem" }}>
              🛠️ <strong>Affordable Housing:</strong>{" "}
              <a
                href="https://lakesareahabitat.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#9f6baa" }}
              >
                Lakes Area Habitat for Humanity
              </a>{" "}
              — Building homes and hope across Cass, Crow Wing, Hubbard, and
              Wadena counties.
            </li>
          </ul>

          <p style={{ fontSize: "1.2rem", lineHeight: "1.6", marginTop: "2rem" }}>
            Your support directly funds these efforts, turning a simple piece of
            apparel into an <strong>active investment in hope and restoration.</strong>
          </p>
        </div>

        {/* --- SIGNATURE --- */}
        <p
          style={{
            textAlign: "right",
            marginTop: "40px",
            fontStyle: "italic",
            color: "#9f6baa",
          }}
        >
          🌿 With love, faith, and gratitude,
          <br />
          Kristine — Founder, The Resilient Voice & Grit & Grace
        </p>
      </section>
    </main>
  );
}
