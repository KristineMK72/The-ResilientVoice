import Link from "next/link";

const LINKS = [
  { href: "/saved-by-grace", label: "Saved By Grace" },
  { href: "/Patriot", label: "Patriot" },
  { href: "/Social", label: "Social Impact" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/giving", label: "Giving Back" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function FooterPrimo() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--gg-border)",
        background: "rgba(0,0,0,0.35)",
        padding: "2.75rem 1.25rem 2rem",
      }}
    >
      <div className="gg-container" style={{ textAlign: "center" }}>
        <div
          style={{
            fontWeight: 950,
            letterSpacing: "0.08em",
            marginBottom: 8,
            background: "var(--gg-gradient-brand)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            fontSize: "1.15rem",
          }}
        >
          GRIT & GRACE
        </div>
        <p className="gg-muted" style={{ margin: "0 auto 1.25rem", maxWidth: 480, lineHeight: 1.6 }}>
          Apparel born from storms. Faith for the soft days, courage for the hard ones.
          10% of every sale supports healing and hope.
        </p>

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.65rem 1.1rem",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="gg-muted"
              style={{ fontWeight: 700, fontSize: "0.92rem" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="gg-dim" style={{ margin: 0, fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} The Resilient Voice · Grit & Grace
        </p>
        <p className="gg-dim" style={{ margin: "0.5rem 0 0", fontSize: "0.8rem" }}>
          If you are in crisis, call or text 988 (U.S.)
        </p>
      </div>
    </footer>
  );
}
