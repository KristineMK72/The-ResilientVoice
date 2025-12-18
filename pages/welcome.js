import Head from "next/head";
import Link from "next/link";

export default function Welcome() {
  return (
    <>
      <Head>
        <title>Welcome | Grit & Grace</title>
      </Head>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 900, marginBottom: "0.75rem" }}>
          You’re in. Welcome ♥️
        </h1>

        <p style={{ opacity: 0.9, lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Thanks for joining the Grit &amp; Grace family. Watch for encouragement drops,
          new releases, and impact updates.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/saved-by-grace">Shop Saved By Grace</Link>
          <Link href="/Patriot">Shop Patriot</Link>
          <Link href="/Social">Shop Social</Link>
        </div>

        <div style={{ marginTop: "1.25rem", opacity: 0.75 }}>
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </>
  );
}
