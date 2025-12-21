export default function AboutPage() {
  const paragraphStyle = {
    fontSize: "1.2rem",
    lineHeight: "1.75",
    marginBottom: "1.25rem",
    opacity: 0.95,
  };

  const linkStyle = {
    color: "#ffc0cb",
    textDecoration: "underline",
    fontWeight: "bold",
  };

  const pillStyle = {
    display: "inline-block",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    background: "rgba(176, 196, 222, 0.14)",
    border: "1px solid rgba(176, 196, 222, 0.35)",
    color: "#b0c4de",
    marginBottom: "0.75rem",
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    padding: "1.5rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
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
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
        }}
      >
        {/* === HERO === */}
        <h1
          style={{
            fontSize: "3.2rem",
            fontWeight: "900",
            marginBottom: "0.75rem",
            color: "#b0c4de",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          The Resilient Voice
          <span style={{ color: "#ffc0cb" }}> × </span>
          Grit & Grace
        </h1>

        <p style={{ ...paragraphStyle, textAlign: "center", maxWidth: 760, margin: "0 auto 2rem" }}>
          A faith-rooted brand and ministry built for people who’ve been through storms —
          and refuse to let the storm be the end of the story.
        </p>

        {/* === MISSION / VISION / VALUES GRID === */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginTop: "1.5rem",
            marginBottom: "2.25rem",
          }}
        >
          <div style={cardStyle}>
            <div style={pillStyle}>MISSION</div>
            <p style={paragraphStyle}>
              To speak life, restore hope, and strengthen faith through truth-filled designs,
              community impact, and a message that reminds people they are seen, loved, and not alone.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={pillStyle}>VISION</div>
            <p style={paragraphStyle}>
              A world where pain doesn’t silence people — it refines them —
              and where resilience, healing, and God’s grace create real change in homes and communities.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={pillStyle}>HOW WE LIVE IT</div>
            <p style={paragraphStyle}>
              We create apparel that carries a message, and we give back with every sale —
              turning what you wear into encouragement and tangible support for those who need it most.
            </p>
          </div>
        </div>

        {/* === STORY + VOICE === */}
        <h2
          style={{
            fontSize: "2.4rem",
            marginBottom: "1rem",
            color: "#ffc0cb",
            textAlign: "center",
          }}
        >
          Why We Exist
        </h2>

        <p style={paragraphStyle}>
          <strong>Grit & Grace</strong> was born from storms — the kind that shake you, refine you,
          and push you closer to God’s purpose. Every hardship and silent battle became a reminder
          that even when life breaks us open, <strong>God’s grace</strong> pours in.
        </p>

        <p style={paragraphStyle}>
          This brand is more than apparel. It is a ministry rooted in healing, faith, courage,
          and truth. Every design is crafted to speak life — to remind you that you are{" "}
          <strong>deeply loved</strong> by God.
        </p>

        {/* === HONOR / SERVICE === */}
        <div style={{ ...cardStyle, marginTop: "1.75rem" }}>
          <div style={{ ...pillStyle, background: "rgba(255, 192, 203, 0.12)", border: "1px solid rgba(255, 192, 203, 0.35)", color: "#ffc0cb" }}>
            WHO WE HONOR
          </div>
          <p style={paragraphStyle}>
            We honor the men and women who serve our communities and our country — veterans,
            active-duty military, law enforcement, firefighters, and EMS. Their courage and sacrifice
            reflect the heart of resilience and service this mission stands for.
          </p>
        </div>

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

        <hr
          style={{
            border: "0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            margin: "2.5rem 0",
          }}
        />

        {/* === IMPACT === */}
        <h2
          style={{
            fontSize: "2.5rem",
            marginBottom: "1.25rem",
            color: "#ffc0cb",
            textAlign: "center",
          }}
        >
          Giving Back
        </h2>

        <p style={paragraphStyle}>
          Part of walking in God’s purpose means giving back in abundance. That’s why, through every
          purchase, we commit to donating{" "}
          <strong style={{ color: "#ffc0cb" }}>10% of every sale</strong> to organizations that uplift lives,
          restore hope, and support those facing the hardest battles.
        </p>

        <h3 style={{ fontSize: "1.5rem", marginTop: "1.5rem", marginBottom: "1rem", color: "#b0c4de" }}>
          Our Supported Causes
        </h3>

        <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: "1.1rem" }}>
          <li style={{ marginBottom: "0.8rem" }}>
            🏠 <strong>Homelessness Support:</strong>{" "}
            <a href="https://www.nationalhomeless.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              National Coalition for the Homeless
            </a>{" "}
            — Advocating for housing, dignity, and systemic change across the U.S.
          </li>

          <li style={{ marginBottom: "0.8rem" }}>
            💚 <strong>Mental Health Advocacy:</strong>{" "}
            <a href="https://www.nami.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              NAMI (National Alliance on Mental Illness)
            </a>{" "}
            — Providing education, support, and awareness for mental health nationwide.
          </li>

          <li style={{ marginBottom: "0.8rem" }}>
            💙 <strong>Suicide Prevention:</strong>{" "}
            <a href="https://afsp.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              American Foundation for Suicide Prevention
            </a>{" "}
            — Leading research, education, and support to save lives and bring hope.
          </li>

          <li style={{ marginBottom: "0.8rem" }}>
            🎖️ <strong>Veteran Support:</strong>{" "}
            <a href="https://www.woundedwarriorproject.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              Wounded Warrior Project
            </a>{" "}
            — Empowering veterans through mental health care, career support, and community.
          </li>
        </ul>

        <p style={{ ...paragraphStyle, marginTop: "1.75rem" }}>
          Your support turns a simple purchase into an{" "}
          <strong style={{ color: "#ffc0cb" }}>active investment in healing and resilience.</strong>
        </p>

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
