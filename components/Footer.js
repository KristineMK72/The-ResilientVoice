// components/Footer.js
"use client";

import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/saved-by-grace", label: "Saved By Grace" },
  { href: "/Patriot", label: "Patriot" },
  { href: "/Social", label: "Social" },
  { href: "/giving", label: "Giving Back" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" },
  { href: "/LegalPage", label: "Legal" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <nav className="nav" aria-label="Footer navigation">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="link">
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="copy">
        © {new Date().getFullYear()} <strong>Grit &amp; Grace</strong> / The Resilient Voice — Built
        to inspire courage, connection, and conversation.
      </div>

      <style jsx>{`
        .footer {
          position: relative;
          z-index: 20;
          margin-top: 40px;
          padding: 26px 16px 34px;
          text-align: center;
          background: rgba(5, 5, 20, 0.92);
          backdrop-filter: blur(14px);
          border-top: 4px solid;
          border-image: linear-gradient(90deg, #ff0000 0%, #ffffff 50%, #0000ff 100%) 1;
        }

        /* ✅ fixes "smashed together" */
        .nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px 14px; /* row gap, column gap */
          margin: 0 auto 14px;
          max-width: 980px;
        }

        .link {
          display: inline-flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 999px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.92);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-weight: 800;
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }

        .link:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-1px);
        }

        .copy {
          max-width: 980px;
          margin: 0 auto;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
        }

        @media (max-width: 480px) {
          .link {
            padding: 9px 10px;
            font-size: 0.95rem;
          }
          .copy {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </footer>
  );
}
