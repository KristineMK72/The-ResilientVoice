// pages/blog/index.js
import Head from "next/head";
import Link from "next/link";

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog | The Resilient Voice</title>
      </Head>

      <main style={{ backgroundColor: "#f9f5f1", minHeight: "100vh", padding: "40px 20px" }}>
        <section style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Blog</h1>
          <li style={{ marginBottom: 10 }}>
          <Link href="/blog/christmas">Christmas</Link>
          </li>
          <ul style={{ paddingLeft: 18, marginTop: 24 }}>
            <li style={{ marginBottom: 10 }}>
              <Link href="/blog/storms">Storms</Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
