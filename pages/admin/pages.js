import Link from "next/link";

const pages = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "giving", label: "Giving Back" },
  { key: "social", label: "Social" },
  { key: "saved-by-grace", label: "Saved By Grace" },
  { key: "patriot", label: "Patriot" },
];

export default function AdminPages() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Edit Pages</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {pages.map((p) => (
          <Link
            key={p.key}
            href={`/admin/pages/${p.key}`}
            style={{
              display: "block",
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 12,
              textDecoration: "none",
              color: "#111",
              fontWeight: 700,
            }}
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
