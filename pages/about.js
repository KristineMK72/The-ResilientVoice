import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="main">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card about-card"
      >
        <h1 className="about-title">About The Resilient Voice</h1>
        <p className="about-text">
          The Resilient Voice was born from storms — the kind that shake you,
          refine you, and push you closer to God’s purpose. Every hardship,
          heartbreak, and silent battle became a reminder that even when life
          breaks us open, grace pours in.
        </p>
        <p className="about-text">
          This brand is more than apparel. It is a mission rooted in healing,
          faith, and courage. Every design is crafted to speak life — to remind
          you that you are seen, you are strong, and you are deeply loved.
        </p>
        <blockquote className="about-quote">
          “You are not alone. You have strength. You are seen.”
        </blockquote>
        <h2 className="about-subtitle">Our Purpose & Impact</h2>
        <p className="about-text">
          Part of walking in purpose means giving back. That’s why{" "}
          <strong className="about-bold">
            10% of all proceeds are donated to nonprofits
          </strong>{" "}
          that support people who need hope the most:
        </p>
        <ul className="about-list">
          <li>🕊️ Suicide prevention & awareness</li>
          <li>💬 Anti-bullying programs</li>
          <li>💚 Mental health support networks</li>
          <li>🏠 Homelessness relief and restoration</li>
        </ul>
        <p className="about-text">
          These causes resonate deeply because they reflect the storms I’ve
          survived — moments when hope felt far away, yet grace showed up through
          a message, a person, or a single act of compassion.
        </p>
        <h2 className="about-subtitle">A Community of Faith & Strength</h2>
        <p className="about-text">
          When you wear The Resilient Voice, you’re not just buying apparel —
          you’re becoming part of a movement. You’re spreading messages of hope,
          resilience, and God’s unshakable grace.
        </p>
        <p className="about-text">
          My prayer is that this becomes a community of people who lift each
          other up, speak life into one another, and walk boldly in their
          purpose.
        </p>
        <p className="about-signature">
          🌿 With love, faith, and gratitude,
          <br />
          Kristine — Founder, The Resilient Voice
        </p>
      </motion.section>
    </main>
  );
}
