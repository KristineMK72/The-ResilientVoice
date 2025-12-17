import Head from "next/head";

export default function ChristmasPost() {
  const DATE = "December 16, 2025";

  return (
    <>
      <Head>
        <title>Finding Light in the Holiday Shadows | The Resilient Voice</title>
      </Head>

      <main style={{ backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "0 20px" }}>
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0", textAlign: "left" }}>
          <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: 10, fontWeight: 600 }}>{DATE}</p>

          <h1 className="about-title" style={{ textAlign: "left", marginTop: 0 }}>
            🎄 Finding Light in the Holiday Shadows
          </h1>

          <p className="about-text">
            While the world outside is covered in twinkling lights and joyful music, the reality for many of us is that the holidays can be the hardest time of the year.
            When you are battling depression, the “most wonderful time of the year” can feel like the loudest time of the year — highlighting the gaps, the grief,
            and the heaviness we carry inside.
          </p>

          <p className="about-text">
            The pressure can feel crushing: the pressure to smile, the pressure to show up, the pressure to be grateful, the pressure to act “normal.”
            But depression doesn’t disappear because the calendar says Christmas. Sometimes it gets worse — because the season magnifies what we’ve lost,
            what we don’t have, or what we wish life looked like right now.
          </p>

          <h2 className="about-subtitle" style={{ textAlign: "left" }}>🌿 If you feel like you’re “behind” in life…</h2>
          <p className="about-text">
            You are not behind. You are not failing. You are not less loved because you’re struggling. You are a human being carrying more than most people can see.
            And even if you feel alone in a crowded room, God is not intimidated by your sadness. He meets us honestly — especially in the low places.
          </p>

          <p className="about-text">
            In those quiet, dark moments when joy feels out of reach, two promises from Scripture have become my anchors:
          </p>

          <blockquote className="about-quote" style={{ borderLeft: "3px solid #ccc", paddingLeft: 15, fontStyle: "italic", margin: "20px 0" }}>
            “For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”
            <br />
            <strong>— Jeremiah 29:11</strong>
          </blockquote>

          <blockquote className="about-quote" style={{ borderLeft: "3px solid #ccc", paddingLeft: 15, fontStyle: "italic", margin: "20px 0" }}>
            “I can do all things through Christ who strengthens me.”
            <br />
            <strong>— Philippians 4:13</strong>
          </blockquote>

          <h2 className="about-subtitle" style={{ textAlign: "left" }}>🕯️ Small ways to survive the holidays (without pretending)</h2>
          <ul className="about-list">
            <li><strong>Lower expectations.</strong> You don’t have to keep up with anyone else’s holiday energy.</li>
            <li><strong>Pick one safe person.</strong> Text “I’m not doing great today.” No long explanation needed.</li>
            <li><strong>Create an exit plan.</strong> Protect your peace at gatherings.</li>
            <li><strong>Choose one small comfort.</strong> Tea, a shower, worship music, a short walk — tiny things matter.</li>
            <li><strong>Let “enough” be enough.</strong> You don’t have to do everything to be worthy of love.</li>
          </ul>

          <h2 className="about-subtitle" style={{ textAlign: "left" }}>✨ Jesus was born in a low place on purpose</h2>
          <p className="about-text">
            Jesus wasn’t born into comfort, perfection, or polished beauty. He was born in a humble manger. That’s not an accident — it’s a message:
            He came for the weary. He came for the broken. He came for the hurting.
          </p>

          <p className="about-text">
            So if you’re reading this while struggling, please know: you don’t have to perform. You don’t have to prove anything.
            You can come to God exactly as you are — exhausted, messy, unsure — and He will still meet you with love.
          </p>

          <p className="about-text" style={{ fontWeight: "bold" }}>
            Merry Christmas — and keep fighting. Your story matters. Your life matters.
          </p>

          <p className="about-text" style={{ color: "#555" }}>
            If you’re in a dark moment right now and need immediate help, please call or text <strong>988</strong> (U.S. Suicide & Crisis Lifeline).
            You are not alone.
          </p>
        </section>
      </main>
    </>
  );
}
