export default function Blog() {
  return (
    <main style={{ backgroundColor: '#f9f5f1', minHeight: '100vh' }}>
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>About The Resilient Voice</h1>
        <p>
          The Resilient Voice was born from storms — the kind that shake you, refine you, and push you closer to God’s purpose.
          Every hardship, heartbreak, and silent battle became a reminder that even when life breaks us open, grace pours in.
        </p>
        <p>
          This brand is more than apparel. It is a mission rooted in healing, faith, and courage. Every design is crafted to speak life —
          to remind you that you are seen, you are strong, and you are deeply loved.
        </p>
        <blockquote style={{ borderLeft: '3px solid #ccc', paddingLeft: '15px', fontStyle: 'italic', margin: '2rem 0' }}>
          “You are not alone. You have strength. You are seen.”
        </blockquote>

        <h2 style={{ fontSize: '1.8rem', marginTop: '3rem' }}>Giving Back with Purpose</h2>
        <p>
          At Warrior Spirit Co., we believe in resilience — not just in words, but in action. That’s why we’re committed to donating
          <strong> 10% of every sale </strong> to organizations that uplift lives and restore hope. These nonprofits are doing vital work in our community and beyond:
        </p>

        <ul style={{ paddingLeft: '1rem', marginTop: '1rem' }}>
          <li>
            🏠 <strong>Homelessness Support:</strong>{' '}
            <a href="https://www.bridgesofhopemn.org/" target="_blank" rel="noopener noreferrer">
              Bridges of Hope
            </a> — Providing shelter, food, and crisis support in Central Minnesota.
          </li>
          <li>
            💚 <strong>Mental Health Advocacy:</strong>{' '}
            <a href="https://mnwitw.org/" target="_blank" rel="noopener noreferrer">
              Wellness in the Woods
            </a> — Offering 24/7 peer support and recovery programs across rural communities.
          </li>
          <li>
            💙 <strong>Suicide Prevention:</strong>{' '}
            <a href="https://www.smilesforjake.org/" target="_blank" rel="noopener noreferrer">
              Smiles for Jake
            </a> — A Brainerd Lakes movement spreading hope through connection and education.
          </li>
          <li>
            🛠️ <strong>Affordable Housing:</strong>{' '}
            <a href="https://lakesareahabitat.org/" target="_blank" rel="noopener noreferrer">
              Lakes Area Habitat for Humanity
            </a> — Building homes and hope across Cass, Crow Wing, Hubbard, and Wadena counties.
          </li>
        </ul>

        <p style={{ marginTop: '1rem' }}>
          These causes resonate deeply because they reflect the storms I’ve survived — moments when hope felt far away, yet grace showed up
          through a message, a person, or a single act of compassion.
        </p>

        <h2 style={{ fontSize: '1.8rem', marginTop: '3rem' }}>A Community of Faith & Strength</h2>
        <p>
          When you wear The Resilient Voice, you’re not just buying apparel — you’re becoming part of a movement. You’re spreading messages
          of hope, resilience, and God’s unshakable grace.
        </p>
        <p>
          My prayer is that this becomes a community of people who lift each other up, speak life into one another, and walk boldly in their purpose.
        </p>

        <p style={{ textAlign: 'right', marginTop: '40px', fontStyle: 'italic' }}>
          🌿 With love, faith, and gratitude,<br />
          Kristine — Founder, The Resilient Voice
        </p>
      </section>
    </main>
  );
}
