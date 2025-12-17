// pages/blog/storms.js

export default function Blog() {
  const postDate = "December 16, 2025";

  return (
    // Sets the soft background color across the entire page view
    <main style={{ backgroundColor: '#f9f5f1', minHeight: '100vh', padding: '0 20px' }}>
      
      {/* Centers the content block, but keeps the text left-aligned */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0', textAlign: 'left' }}>
        
        {/* --- NEW HOLIDAY POST --- */}
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', fontWeight: 'bold' }}>{postDate}</p>
        <h1 className="about-title" style={{ textAlign: 'left', marginBottom: '20px' }}>🎄 Finding Light in the Holiday Shadows</h1>
        
        <p className="about-text">
          While the world outside is covered in twinkling lights and joyful music, the reality for many of us is that the holidays can be the hardest time of the year. When you are battling depression, the "most wonderful time of the year" can feel like the loudest time of the year—highlighting the gaps and the heaviness we carry inside.
        </p>

        <p className="about-text">
          In those quiet, dark moments when joy feels out of reach, two specific promises from Scripture have become my anchors:
        </p>

        <blockquote className="about-quote" style={{ borderLeft: '3px solid #8a7b6a', paddingLeft: '15px', fontStyle: 'italic', margin: '20px 0', color: '#555' }}>
          “For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.” <br />
          <strong>— Jeremiah 29:11</strong>
        </blockquote>

        <p className="about-text">
          And when the mountain feels too high to climb, I lean on the truth that:
        </p>

        <blockquote className="about-quote" style={{ borderLeft: '3px solid #8a7b6a', paddingLeft: '15px', fontStyle: 'italic', margin: '20px 0', color: '#555' }}>
          “I can do all things through Christ who strengthens me.” <br />
          <strong>— Philippians 4:13</strong>
        </blockquote>

        <p className="about-text">
          If you are struggling this season, know that you don't have to "have it all together." God meets us exactly where we are—in the low places and the quiet moments. 
        </p>

        <p className="about-text" style={{ fontWeight: 'bold', color: '#7a6b5a' }}>
          Merry Christmas. Keep fighting. Your resilience is a beautiful testimony.
        </p>

        {/* --- DIVIDER --- */}
        <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '50px 0' }} />

        {/* --- ORIGINAL CONTENT --- */}
        <h1 className="about-title" style={{ textAlign: 'left' }}>About The Resilient Voice</h1>
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
        <blockquote className="about-quote" style={{ borderLeft: '3px solid #ccc', paddingLeft: '15px', fontStyle: 'italic', margin: '20px 0' }}>
          “You are not alone. You have strength. You are seen.”
        </blockquote>
        <h2 className="about-subtitle" style={{ textAlign: 'left' }}>Our Purpose & Impact</h2>
        <p className="about-text">
          Part of walking in purpose means giving back. That’s why{' '}
          <strong className="about-bold">
            10% of all proceeds are donated to nonprofits
          </strong>{' '}
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
        <h2 className="about-subtitle" style={{ textAlign: 'left' }}>A Community of Faith & Strength</h2>
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
        <p className="about-signature" style={{ textAlign: 'right', marginTop: '40px' }}>
          🌿 With love, faith, and gratitude,
          <br />
          Kristine, The Resilient Voice
        </p>
      </section>
    </main>
  );
}
