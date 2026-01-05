// pages/blog/storms.js
import Head from "next/head";

export default function StormsPost() {
  const DATE = "December 14, 2025";

  return (
    <>
      <Head>
        <title>From Storms to Purpose: The Story Behind Grit & Grace | The Resilient Voice</title>
      </Head>

      <main style={{ backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "0 20px" }}>
        <section
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "40px 0",
            textAlign: "left",
            color: "#2a2a2a",
          }}
        >
          <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: 12, fontWeight: 600 }}>
            {DATE}
          </p>

          <h1
            style={{
              fontSize: "2.2rem",
              lineHeight: "1.3",
              marginTop: 0,
              marginBottom: "1.5rem",
              color: "#1f1f1f",
            }}
          >
            From Storms to Purpose: The Story Behind Grit & Grace
          </h1>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            People often see the finished product — the website, the designs, the message — but they don’t always see the
            storms that came first. Grit & Grace wasn’t built in a season of ease. It was born in the kind of seasons that
            make you question everything: your strength, your direction, your faith, and your worth.
          </p>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            I’ve learned that storms don’t just disrupt life — they reveal it. They show you what you’ve been carrying,
            what you’ve been surviving, and what you’ve been missing. They also show you what is still standing when the
            noise quiets down. For me, that “still standing” has always been God’s presence, even when I didn’t have the
            words to explain it.
          </p>

          <h2 style={{ fontSize: "1.6rem", marginTop: "2.5rem", marginBottom: "1rem", color: "#1f1f1f" }}>
            Grit and grace can live in the same heart
          </h2>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            For a long time, I thought I had to choose one version of myself: either strong or soft, tough or tender,
            resilient or honest. But real healing taught me something different. You can be both. You can fight and still
            feel. You can be brave and still need help. You can have faith and still have hard days.
          </p>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            That’s the heartbeat of Grit & Grace. It’s for the people who have been through things they didn’t deserve —
            and are still here. It’s for the ones rebuilding. The ones learning boundaries. The ones who keep showing up
            even when it would be easier to disappear.
          </p>

          <h2 style={{ fontSize: "1.6rem", marginTop: "2.5rem", marginBottom: "1rem", color: "#1f1f1f" }}>
            This brand is not just apparel
          </h2>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            I wanted to create something that speaks life — something that reminds people they’re not alone. A shirt can’t
            solve everything, but it can carry a message. And sometimes a message lands at exactly the right time.
          </p>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            This is why giving back matters so much to me. It’s not a marketing line. It’s personal. When you’ve lived
            through storms, you recognize storms in other people. You notice what’s hidden behind smiles. You understand
            how much it means when someone shows up.
          </p>

          <h2 style={{ fontSize: "1.6rem", marginTop: "2.5rem", marginBottom: "1rem", color: "#1f1f1f" }}>
            Why we donate
          </h2>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.2rem" }}>
            A portion of proceeds goes to causes that reflect the storms that shaped this story:
          </p>

          <ul style={{ fontSize: "1.1rem", lineHeight: "1.8", paddingLeft: 20, marginTop: 0 }}>
            <li><strong>Suicide prevention and awareness</strong></li>
            <li><strong>Anti-bullying support</strong></li>
            <li><strong>Mental health resources</strong></li>
            <li><strong>Homelessness relief and restoration</strong></li>
          </ul>

          <h2 style={{ fontSize: "1.6rem", marginTop: "2.5rem", marginBottom: "1rem", color: "#1f1f1f" }}>
            If you’re in a storm right now
          </h2>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            I don’t know what your storm looks like. But I know what it’s like to wonder if you’ll ever feel like yourself
            again. I know what it’s like to keep going on the outside while everything on the inside feels heavy.
          </p>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            Here’s what I want you to remember: you are not behind. You are not weak for struggling. You are not forgotten.
            God does not waste pain. And even if you can’t see the purpose yet, it doesn’t mean it isn’t being formed.
          </p>

          <blockquote
            style={{
              borderLeft: "4px solid #999",
              paddingLeft: 16,
              fontStyle: "italic",
              margin: "24px 0",
              color: "#333",
            }}
          >
            “He gives strength to the weary and increases the power of the weak.”
            <br />
            <strong>— Isaiah 40:29</strong>
          </blockquote>

          <p style={{ fontSize: "1.15rem", fontWeight: "bold", marginTop: "2rem" }}>
            Thank you for being here. Thank you for supporting this mission. And if you’re still fighting through your own
            storm, I’m proud of you for staying.
          </p>

          <p style={{ fontSize: "1rem", color: "#444", marginTop: "1.2rem" }}>
            If you’re in a dark moment and need immediate help, please call or text <strong>988</strong> (U.S. Suicide &amp;
            Crisis Lifeline).
          </p>

          <p style={{ marginTop: "2rem", color: "#555" }}>Love, Kris</p>
        </section>
      </main>
    </>
  );
}
