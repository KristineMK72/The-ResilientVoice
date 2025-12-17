// pages/blog/storms.js

export default function Blog() {
  const POST_ONE_DATE = "December 14, 2025";
  const POST_TWO_DATE = "December 16, 2025";

  return (
    // Sets the soft background color across the entire page view
    <main style={{ backgroundColor: '#f9f5f1', minHeight: '100vh', padding: '0 20px' }}>
      
      {/* Centers the content block, but keeps the text left-aligned */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0', textAlign: 'left' }}>
        
        {/* --- NEW BLOG POST: HOLIDAYS & DEPRESSION --- */}
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', fontWeight: '600' }}>{POST_TWO_DATE}</p>
        <h1 className="about-title" style={{ textAlign: 'left' }}>🎄 Finding Light in the Holiday Shadows</h1>
        
        <p className="about-text">
          While the world outside is covered in twinkling lights and joyful music, the reality for many of us is that the holidays can be the hardest time of the year. When you are battling depression, the "most wonderful time of the year" can feel like the loudest time of the year—highlighting the gaps and the heaviness we carry inside.
        </p>

        <p className="about-text">
          In those quiet, dark moments when joy feels out of reach, two specific promises from Scripture have become my anchors:
        </p>

        <blockquote className="about-quote" style={{ borderLeft: '3px solid #ccc', paddingLeft: '15px', fontStyle: 'italic', margin: '20px 0' }}>
          “For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.” <br />
          <strong>— Jeremiah 29:11</strong>
        </blockquote>

        <blockquote className="about-quote" style={{ borderLeft: '3px solid #ccc', paddingLeft: '15px', fontStyle: 'italic', margin: '20px 0' }}>
          “I can do all things through Christ who strengthens me.” <br />
          <strong>— Philippians 4:13</strong>
        </blockquote>

        <p className="about-text">
          If you’re struggling to feel the "spirit" of the season, please know that you don't have to perform. God meets us in the low places. He was born in a humble manger because He came for the weary, the broken, and the hurting. Hold on to the grit to keep going and the grace to be kind to yourself.
        </p>
        
        <p className="about-text" style={{ fontWeight: 'bold' }}>Merry Christmas, and keep fighting. Your story matters.</p>

        {/* --- DIVIDER --- */}
        <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '60px 0' }} />

        {/* --- PREVIOUS BLOG POST: TRIALS TO TRIUMPH --- */}
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', fontWeight: '600' }}>{POST_ONE_DATE}</p>
        <h1 className="about-title" style={{ textAlign: 'left' }}>✨ From Trials to Triumph: The Story Behind Grit & Grace</h1>
        
        <p className="about-text">
          There are moments in life when everything feels like it’s falling apart — moments when the storm is so intense, you can’t see more than inches in front of you. <strong>Grit & Grace</strong> was born out of storms like these. It was created to be a signal flare in the darkness that says: <em>“You are strong. You are seen. You are loved. And God is not done with you yet.”</em>
        </p>

        <h2 className="about-subtitle" style={{ textAlign: 'left' }}>⚡ Why “Grit & Grace”?</h2>
        <p className="about-text">
          Because life requires both. <strong>GRIT</strong> is the strength to get back up when your heart is shattered. <strong>GRACE</strong> is the understanding that you don’t have to “have it all together” to be worthy.
        </p>

        <h2 className="about-subtitle" style={{ textAlign: 'left' }}>Our Purpose & Impact</h2>
        <p className="about-text">
          Part of walking in purpose means giving back. That’s why{' '}
          <strong className="about-bold">
            10% of all proceeds are donated to nonprofits
          </strong>{' '}
          that support:
        </p>
        <ul className="about-list">
          <li>🕊️ Suicide prevention & awareness</li>
          <li>💬 Anti-bullying programs</li>
          <li>💚 Mental health support networks</li>
          <li>🏠 Homelessness relief and restoration</li>
        </ul>

        <h2 className="about-subtitle" style={{ textAlign: 'left' }}>A Community of Faith & Strength</h2>
        <p className="about-text">
          When you wear The Resilient Voice, you’re not just buying apparel —
          you’re becoming part of a movement. This brand is for the woman rebuilding her life, the man fighting silent battles, and the survivor learning to trust again.
        </p>
        <p className="about-text">
          My prayer is that this becomes a community of people who lift each
          other up and walk boldly in their purpose. Brokenness is not the end of your story; it’s the beginning of your testimony.
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
