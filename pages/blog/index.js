// pages/blog/index.js
import Head from "next/head";
import Link from "next/link";

const POSTS = [
  {
    slug: "christmas",
    date: "December 16, 2025",
    title: "🎄 Finding Light in the Holiday Shadows",
    excerpt:
      "When the season feels heavy, you don’t have to perform. A faith-filled reminder for the weary and hurting.",
  },
  {
    slug: "storms",
    date: "December 14, 2025",
    title: "✨ From Trials to Triumph: The Story Behind Grit & Grace",
    excerpt:
      "How Grit & Grace was born from real storms — and why strength and softness can live in the same heart.",
  },
];

function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        style={{
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#777", fontWeight: 600 }}>
          {post.date}
        </p>

        <h2 style={{ margin: "10px 0 8px", fontSize: "1.25rem", lineHeight: 1.25 }}>
          {post.title}
        </h2>

        <p style={{ margin: 0, color: "#555", lineHeight: 1.55 }}>
          {post.excerpt}
        </p>

        <p style={{ margin: "14px 0 0", fontWeight: 800, color: "#333" }}>
          Read →
        </p>
      </article>
    </Link>
  );
}

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog | The Resilient Voice</title>
      </Head>

      <main
        style={{
          minHeight: "100vh",
          padding: "52px 20px",
          background:
            "radial-gradient(1200px 700px at 20% 10%, rgba(255,255,255,0.95), rgba(249,245,241,1)), radial-gradient(900px 600px at 85% 15%, rgba(255,255,255,0.65), rgba(249,245,241,0.9))",
        }}
      >
        <section style={{ maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: "2.1rem" }}>Blog</h1>
            <p style={{ margin: "10px 0 0", color: "#666", lineHeight: 1.6, maxWidth: 680 }}>
              Stories, faith, healing, and strength — written from the storms.
            </p>
          </header>

          <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
            {POSTS.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>

          <footer style={{ marginTop: 26, color: "#777", fontSize: "0.95rem" }}>
           Love, Kris
          </footer>
        </section>
      </main>
    </>
  );
}
