// pages/blog/storms.js
import Head from "next/head";

const POSTS = [
  {
    date: "December 16, 2025",
    title: "🎄 Finding Light in the Holiday Shadows",
    sections: [
      {
        type: "p",
        text:
          'While the world outside is covered in twinkling lights and joyful music, the reality for many of us is that the holidays can be the hardest time of the year. When you are battling depression, the “most wonderful time of the year” can feel like the loudest time of the year — highlighting the gaps, the grief, and the heaviness we carry inside.',
      },
      {
        type: "p",
        text:
          "The pressure can feel crushing: the pressure to smile, the pressure to show up, the pressure to be grateful, the pressure to act “normal.” But depression doesn’t disappear because the calendar says Christmas. Sometimes it actually gets worse — because the season magnifies what we’ve lost, what we don’t have, or what we wish life looked like right now.",
      },
      { type: "h2", text: "🌿 If you feel like you’re “behind” in life…" },
      {
        type: "p",
        text:
          "I want to gently say something that might be hard to believe when you’re in the thick of it: you are not behind. You are not failing. You are not less loved because you’re struggling. You are a human being carrying more than most people can see.",
      },
      {
        type: "p",
        text:
          "And even if you feel alone in a crowded room, God is not intimidated by your sadness. He doesn’t require you to be cheerful in order to be close to Him. He meets us honestly — especially in the low places.",
      },
      {
        type: "p",
        text:
          "In those quiet, dark moments when joy feels out of reach, two specific promises from Scripture have become my anchors:",
      },
      {
        type: "quote",
        text:
          "“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”",
        ref: "— Jeremiah 29:11",
      },
      {
        type: "quote",
        text: "“I can do all things through Christ who strengthens me.”",
        ref: "— Philippians 4:13",
      },
      { type: "h2", text: "🕯️ Small ways to survive the holidays (without pretending)" },
      {
        type: "p",
        text:
          "If your goal right now is just to make it through the next few days, that’s okay. Here are a few gentle reminders that have helped me — and might help you too:",
      },
      {
        type: "ul",
        items: [
          "Lower the expectations. You don’t have to “keep up” with anyone else’s holiday energy.",
          "Pick one safe person. Text them “Hey, I’m not doing great today” — you don’t have to explain everything.",
          "Create an exit plan. If you attend gatherings, drive yourself or plan a time limit. Protect your peace.",
          "Choose one small comfort. A shower, tea, a short walk, worship music, a blanket — tiny things count.",
          "Let “enough” be enough. You don’t have to do everything to be worthy of love.",
        ],
      },
      {
        type: "p",
        text:
          "Depression can lie. It can make you believe you’re a burden, that you’ve ruined everything, that you’ll always feel this way. But feelings are not facts — and storms do not last forever.",
      },
      { type: "h2", text: "✨ Jesus was born in a low place on purpose" },
      {
        type: "p",
        text:
          "One of the most powerful truths of Christmas is that Jesus wasn’t born into comfort, perfection, or polished beauty. He was born into a humble manger. That was not an accident — it’s a message. He came for the weary. He came for the broken. He came for the hurting.",
      },
      {
        type: "p",
        text:
          "So if you’re reading this while struggling, please know: you don’t have to perform. You don’t have to prove anything. You can come to God exactly as you are — exhausted, messy, unsure — and He will still meet you with love.",
      },
      { type: "pBold", text: "Merry Christmas — and keep fighting. Your story matters. Your life matters." },
      {
        type: "note",
        text:
          "If you’re in a dark moment right now and need immediate help, please call or text 988 (Suicide & Crisis Lifeline in the U.S.). You are not alone.",
      },
    ],
  },

  {
    date: "December 14, 2025",
    title: "✨ From Trials to Triumph: The Story Behind Grit & Grace",
    sections: [
      {
        type: "p",
        text:
          "There are moments in life when everything feels like it’s falling apart — moments when the storm is so intense, you can’t see more than inches in front of you. Grit & Grace was born out of storms like these. It was created to be a signal flare in the darkness that says: “You are strong. You are seen. You are loved. And God is not done with you yet.”",
      },
      { type: "h2", text: "⚡ Why “Grit & Grace”?" },
      {
        type: "p",
        text:
          "Because life requires both. GRIT is the strength to get back up when your heart is shattered. GRACE is the understanding that you don’t have to “have it all together” to be worthy.",
      },
      { type: "h2", text: "Our Purpose & Impact" },
      {
        type: "p",
        text:
          "Part of walking in purpose means giving back. That’s why 10% of all proceeds are donated to nonprofits that support:",
      },
      {
        type: "ul",
        items: [
          "🕊️ Suicide prevention & awareness",
          "💬 Anti-bullying programs",
          "💚 Mental health support networks",
          "🏠 Homelessness relief and restoration",
        ],
      },
      { type: "h2", text: "A Community of Faith & Strength" },
      {
        type: "p",
        text:
          "When you wear The Resilient Voice, you’re not just buying apparel — you’re becoming part of a movement. This brand is for the woman rebuilding her life, the man fighting silent battles, and the survivor learning to trust again.",
      },
      {
        type: "p",
        text:
          "My prayer is that this becomes a community of people who lift each other up and walk boldly in their purpose. Brokenness is not the end of your story; it’s the beginning of your testimony.",
      },
      {
        type: "signature",
        text: "🌿 With love, faith, and gratitude,\nKristine, The Resilient Voice",
      },
    ],
  },
];

const styles = {
  page: { backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "0 20px" },
  wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 0", textAlign: "left" },
  date: { fontSize: "0.9rem", color: "#888", marginBottom: 10, fontWeight: 600 },
  title: { textAlign: "left", marginTop: 0 },
  h2: { textAlign: "left", marginTop: 28 },
  quote: { borderLeft: "3px solid #ccc", paddingLeft: 15, fontStyle: "italic", margin: "20px 0" },
  divider: { border: 0, borderTop: "1px solid #ddd", margin: "60px 0" },
  note: { color: "#555", marginTop: 18 },
  bold: { fontWeight: "bold" },
  signature: { textAlign: "right", marginTop: 40, whiteSpace: "pre-line" },
};

export default function StormsBlog() {
  return (
    <>
      <Head>
        <title>Storms | The Resilient Voice Blog</title>
      </Head>

      <main style={styles.page}>
        <section style={styles.wrap}>
          {POSTS.map((post, idx) => (
            <article key={`${post.date}-${post.title}`}>
              <p style={styles.date}>{post.date}</p>
              <h1 className="about-title" style={styles.title}>
                {post.title}
              </h1>

              {post.sections.map((s, i) => {
                if (s.type === "p") return <p key={i} className="about-text">{s.text}</p>;
                if (s.type === "pBold") return <p key={i} className="about-text" style={styles.bold}>{s.text}</p>;
                if (s.type === "h2") return <h2 key={i} className="about-subtitle" style={styles.h2}>{s.text}</h2>;
                if (s.type === "quote")
                  return (
                    <blockquote key={i} className="about-quote" style={styles.quote}>
                      {s.text}
                      <br />
                      <strong>{s.ref}</strong>
                    </blockquote>
                  );
                if (s.type === "ul")
                  return (
                    <ul key={i} className="about-list">
                      {s.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  );
                if (s.type === "note") return <p key={i} className="about-text" style={styles.note}>{s.text}</p>;
                if (s.type === "signature") return <p key={i} className="about-signature" style={styles.signature}>{s.text}</p>;
                return null;
              })}

              {idx !== POSTS.length - 1 && <hr style={styles.divider} />}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
