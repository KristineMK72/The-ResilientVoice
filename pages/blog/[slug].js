import Head from "next/head";
import Link from "next/link";
import { BLOG_POSTS } from "../../lib/blogPosts";

export default function BlogPost({ post }) {
  if (!post) return null;

  return (
    <>
      <Head>
        <title>{post.title} | The Resilient Voice</title>
      </Head>

      <main style={{ backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "0 20px" }}>
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0", textAlign: "left" }}>
          <Link href="/blog" style={{ fontWeight: 700, textDecoration: "none" }}>← Back to Blog</Link>

          <p style={{ fontSize: "0.9rem", color: "#888", margin: "18px 0 10px", fontWeight: 600 }}>
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <h1 className="about-title" style={{ marginTop: 0 }}>{post.title}</h1>

          {post.content.map((block, i) => (
            <p key={i} className="about-text" style={{ whiteSpace: "pre-line" }}>
              {block}
            </p>
          ))}
        </section>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: BLOG_POSTS.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug) || null;
  return { props: { post } };
}
