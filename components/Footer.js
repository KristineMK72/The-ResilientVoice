import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "white",
        padding: "3rem 1rem",
        textAlign: "center",
        fontSize: "1rem",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/SavedByGrace">Saved By Grace</Link>
          <Link href="/Patriot">Patriot</Link>
          <Link href="/accessories">Accessories</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/LegalPage">Legal</Link>
          <Link href="/giving">GivingBack</Link>
        </nav>
        <p style={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} Grit & Grace/Resilient Voice — Built to inspire courage, connection, and conversation.
        </p>
      </div>
    </footer>
  );
}
