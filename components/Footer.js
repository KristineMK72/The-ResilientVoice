import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <nav
          className="footerNav"
          aria-label="Footer navigation"
        >
          <Link href="/">Home</Link>
          <Link href="/saved-by-grace">Saved By Grace</Link>
          <Link href="/Patriot">Patriot</Link>
          <Link href="/Social">Social</Link>
          <Link href="/accessories">Accessories</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/LegalPage">Legal</Link>
          <Link href="/giving">Giving Back</Link>
        </nav>

        <p className="footerCopy">
          © {new Date().getFullYear()}{" "}
          <strong>Grit &amp; Grace / The Resilient Voice</strong> — Built to inspire
          courage, connection, and conversation.
        </p>
      </div>
    </footer>
  );
}
