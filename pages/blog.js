// components/BlogPostOne.js or pages/blog.js

export default function BlogPostOne() {
  const containerStyle = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif',
    color: '#333',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#30264a', // Deep purple
    marginBottom: '0.5rem',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#9f6baa', // Muted pink-purple
    textAlign: 'center',
    marginBottom: '3rem',
    fontStyle: 'italic',
  };

  const headingStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#30264a',
    marginTop: '2.5rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem',
  };

  const paragraphStyle = {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
  };

  const blockquoteStyle = {
    borderLeft: '4px solid #9f6baa',
    paddingLeft: '1.5rem',
    fontStyle: 'italic',
    fontSize: '1.3rem',
    margin: '2.5rem 0',
    color: '#555',
  };

  const listStyle = {
    listStyle: 'none',
    paddingLeft: '0',
    marginBottom: '2rem',
  };

  const listItemStyle = {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    color: '#555',
  };

  return (
    <div style={containerStyle}>
      {/* --- HEADER --- */}
      <h1 style={titleStyle}>
        ✨ From Trials to Triumph: The Story Behind Grit & Grace
      </h1>
      <p style={subtitleStyle}>~ A message of faith, resilience, and purpose ~</p>

      <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '3rem' }} />

      {/* --- INTRODUCTION --- */}
      <p style={paragraphStyle}>
        There are moments in life when everything feels like it’s falling apart — moments when the storm is so intense, you can’t see more than inches in front of you. Anyone who has ever walked through heartbreak, loss, betrayal, depression, or trauma knows this feeling. It’s the kind of storm that breaks you open… but also the kind **God uses to rebuild you stronger.**
      </p>
      <p style={paragraphStyle}>
        **Grit & Grace** was born out of storms like these. Not from comfort, not from certainty, not from perfection. But from the raw, unfiltered reality of being human — and learning to lean on God when everything else shakes.
      </p>
      <p style={{ ...paragraphStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '1.3rem', color: '#30264a' }}>
        This brand, this mission, this movement… it was created to be a reminder. A voice. A testimony. A signal flare in the darkness that says:
      </p>

      <blockquote style={{...blockquoteStyle, color: '#30264a', borderLeft: '4px solid #30264a'}}>
        <p>“You are strong. You are seen. You are loved. And God is not done with you yet.”</p>
      </blockquote>
      <p style={paragraphStyle}>
        This is the story behind Grit & Grace — and how God turned trials into triumph.
      </p>

      {/* --- SECTION: THE STORM --- */}
      <h2 style={headingStyle}>🌧️ The Storm That Started It All</h2>
      <p style={paragraphStyle}>
        Every brand has a beginning, but ours didn’t start in a business plan or a design sketchbook. It started in a **season of crisis** — a storm full of heartbreak, loss, and moments that felt impossible to survive. There were days the tears outnumbered the hours. Nights filled with fear and questions. And moments where it felt like everything was slipping away.
      </p>
      <p style={paragraphStyle}>
        But in the middle of that darkness, something unexpected happened: A quiet whisper. A gentle nudge. A reminder from God: **“I am with you. This storm won’t break you — it will build you.”**
      </p>
      <p style={paragraphStyle}>
        When you walk through fire and survive, something shifts inside you. You stop shrinking. You stop apologizing for existing. You start fighting for yourself — and for others who feel the same pain you’ve known. Out of that fight, out of that awakening, out of that collision between brokenness and faith… **Grit & Grace was born.**
      </p>

      {/* --- SECTION: WHY GRIT & GRACE --- */}
      <h2 style={headingStyle}>⚡ Why “Grit & Grace”?</h2>
      <p style={paragraphStyle}>
        Because life requires both.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>**GRIT** — the strength to face hard days, get back up again, and refuse to quit even when your heart is shattered.</li>
        <li style={listItemStyle}>**GRACE** — the understanding that healing takes time, God’s love covers your imperfections, and you don’t have to “have it all together” to be worthy.</li>
      </ul>
      <p style={paragraphStyle}>
        These two words became a banner — a reminder that you can be both strong and soft, both fierce and faithful, both a warrior and a work in progress. That’s what the apparel represents. That’s what the movement stands for. That’s what the mission is built on.
      </p>

      {/* --- SECTION: MISSION --- */}
      <h2 style={headingStyle}>✝️ A Mission Rooted in Faith, Hope, and Purpose</h2>
      <p style={paragraphStyle}>
        From day one, Grit & Grace carried a promise: **“This brand will not just clothe people — it will uplift them.”** Every design, every word, every product is created with intention. Not trendy. Not empty. Not meaningless.
      </p>
      <p style={paragraphStyle}>
        But infused with scripture, strength, truth, and encouragement. Clothing can be a conversation. A doorway. A small act of ministry. A seed of hope planted in someone who desperately needs it. In a world drowning in negativity, comparison, and pressure, Grit & Grace exists to remind people—especially those walking through storms—of the God who sees them.
      </p>

      {/* --- SECTION: GIVING BACK --- */}
      <h2 style={headingStyle}>❤️ Giving Back Is the Heartbeat</h2>
      <p style={paragraphStyle}>
        Pain gives you empathy. Empathy gives you purpose. From the start, Grit & Grace committed to giving **10% of all proceeds** to nonprofits that fight for the vulnerable:
      </p>
      <ul style={{ ...listStyle, paddingLeft: '20px', listStyleType: 'disc' }}>
        <li>Suicide prevention organizations</li>
        <li>Mental health support programs</li>
        <li>Homelessness and housing-insecurity initiatives</li>
        <li>Domestic violence and anti-bullying organizations</li>
        <li>Faith-based nonprofits bringing hope to hurting communities</li>
      </ul>
      <p style={paragraphStyle}>
        This isn’t charity. This is personal. This is honoring every person who didn’t get the support they needed. This is fighting for the people still in the storm. This is carrying hope into dark places. **Every purchase becomes part of that mission.**
      </p>

      {/* --- SECTION: HEALING --- */}
      <h2 style={headingStyle}>🌱 Healing Through Creation</h2>
      <p style={paragraphStyle}>
        Designing shirts with scripture, affirmations, and bold statements of faith wasn’t just a business idea—**It was part of the healing journey.** Each collection came from something real:
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>**Saved By Grace** — a reminder that God rescues us from our lowest.</li>
        <li style={listItemStyle}>**Warrior Spirit** — for the fighters battling silent wars.</li>
        <li style={listItemStyle}>**Resilience Collection** — for those rebuilding after trauma.</li>
        <li style={listItemStyle}>**Patriot Line** — honoring faith, country, and sacrifice.</li>
      </ul>
      <p style={paragraphStyle}>
        The creative process became a form of prayer, a way to reclaim identity, a way to transform pain into purpose. And when customers started writing messages like: **“Your shirt helped me get through a panic attack,”** or **“This brand saved my life,”** …it became clear: This wasn’t just a store. **This was a ministry.**
      </p>

      {/* --- SECTION: AUDIENCE --- */}
      <h2 style={headingStyle}>🌟 Built for the Broken — and the Brave</h2>
      <p style={paragraphStyle}>
        Grit & Grace is for the woman rebuilding her life, the man fighting silent battles, the teen struggling with identity, and the survivor learning to trust again.
      </p>
      <p style={paragraphStyle}>
        If you’ve ever felt lost, overlooked, overwhelmed, or unworthy—**this brand was created for you.** Your story matters. Your voice matters. Your survival matters. And your resilience is not accidental — it’s God-built.
      </p>

      {/* --- SECTION: CONCLUSION --- */}
      <h2 style={headingStyle}>🔥 A Movement, Not Merchandise</h2>
      <p style={paragraphStyle}>
        When you wear Grit & Grace, you’re not just putting on clothes. You’re putting on: **Courage, Identity, Scripture, Purpose,** and **A testimony.** You’re also becoming part of a community that believes: **Brokenness is not the end of your story. It’s the beginning of your testimony.**
      </p>
      <p style={paragraphStyle}>
        If you are walking through your own storm right now, hear this: You are not alone. You are stronger than you know. And God is not finished with you.
      </p>
      <p style={{...paragraphStyle, fontSize: '1.3rem', fontWeight: 'bold', color: '#9f6baa', textAlign: 'center', marginTop: '3rem'}}>
        This is your grit. This is your grace. This is your comeback story.
      </p>
      
      <hr style={{ border: '0', borderTop: '1px solid #ddd', marginTop: '3rem' }} />

    </div>
  );
}
