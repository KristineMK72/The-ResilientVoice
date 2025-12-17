import Head from "next/head";
import Link from "next/link";
import { BLOG_POSTS } from "../../lib/blogPosts";

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <Head>
        <title>Blog | The Resilient Voice</title>
      </Head>

      <main style={{ backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "0 20px" }}>
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0", textAlign: "left" }}>
          <h1 style={{ marginTop: 0 }}>Blog</h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            Stories, faith, healing, and strength — written from the storms.
          </p>

          <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#888", fontWeight: 600 }}>
                    {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <h2 style={{ margin: "10px 0 8px" }}>{p.title}</h2>
                  <p style={{ margin: 0, color: "#666", lineHeight: 1.5 }}>{p.excerpt}</p>
                  <p style={{ margin: "12px 0 0", fontWeight: 700 }}>Read →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
