import Link from "next/link";

const pages = [
  { key: "home", label: "Home", description: "Hero text, homepage messaging, featured intro" },
  { key: "about", label: "About", description: "About page intro and main story content" },
  { key: "giving", label: "Giving Back", description: "Giving mission and community impact copy" },
  { key: "social", label: "Social", description: "Social collection intro and messaging" },
  { key: "saved-by-grace", label: "Saved By Grace", description: "Saved By Grace page content" },
  { key: "patriot", label: "Patriot", description: "Patriot page content and collection intro" },
];

export default function AdminPages() {
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto", color: "white" }}>
      <h1 style={{ marginBottom: 8 }}>Edit Pages</h1>
      <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 24 }}>
        Choose a page to update its editable website content.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {pages.map((p) => (
          <Link
            key={p.key}
            href={`/admin/pages/${p.key}`}
            style={{
              display: "block",
              padding: 20,
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 16,
              textDecoration: "none",
              color: "white",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              {p.label}
            </div>
            <div style={{ opacity: 0.78 }}>
              {p.description}
            </div>
            <div style={{ marginTop: 10, fontWeight: 700, color: "#fca5a5" }}>
              Open editor →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
