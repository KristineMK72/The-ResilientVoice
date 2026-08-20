import Link from "next/link";

/**
 * Story chapter panel — sits under collection heroes.
 * Pass beat from lib/story if you added the story package; otherwise pass props.
 */
export default function StoryStrip({
  label = "Chapter",
  title,
  short,
  scripture,
  accent,
  shopHref,
  shopLabel = "Shop this chapter →",
  lookbookHref = "/lookbook",
  journal,
}) {
  return (
    <section className="gg-container" style={{ marginBottom: "2.5rem" }}>
      <div className="gg-glass" style={{ padding: "1.5rem 1.4rem", textAlign: "left" }}>
        <p className="gg-eyebrow" style={{ color: accent || undefined }}>
          {label}
        </p>
        {title && <h2 className="gg-h2" style={{ fontSize: "1.45rem" }}>{title}</h2>}
        {short && <p className="gg-muted" style={{ margin: 0, lineHeight: 1.7 }}>{short}</p>}
        {scripture && (
          <p style={{ margin: "1rem 0 0", fontStyle: "italic", opacity: 0.85 }}>{scripture}</p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            marginTop: "1.25rem",
            alignItems: "center",
          }}
        >
          {shopHref && (
            <Link href={shopHref} style={{ fontWeight: 800, color: accent || "var(--gg-red-soft)" }}>
              {shopLabel}
            </Link>
          )}
          <Link href={lookbookHref} className="gg-muted" style={{ fontWeight: 700 }}>
            View in Lookbook →
          </Link>
        </div>

        {journal && journal.length > 0 && (
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--gg-border)",
            }}
          >
            <p className="gg-dim" style={{ margin: "0 0 0.5rem", fontWeight: 800, fontSize: "0.85rem" }}>
              From the journal
            </p>
            {journal.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                style={{ display: "block", marginBottom: 8 }}
              >
                <strong>{p.title}</strong>
                <span className="gg-muted" style={{ display: "block", fontSize: "0.95rem" }}>
                  {p.excerpt}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
