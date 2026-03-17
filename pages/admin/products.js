import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const { data, error } = await supabaseBrowser
        .from("products")
        .select("title, printful_sync_product_id, thumbnail_url")
        .order("title")
        .limit(500);

      if (!error && active) {
        setProducts(data || []);
      }

      if (active) setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) =>
      `${p.title} ${p.printful_sync_product_id}`.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Manage Products</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Edit product titles, descriptions, featured status, hidden status, and image galleries.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by product name or ID..."
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ccc",
          marginBottom: 20,
        }}
      />

      {loading ? <p>Loading products...</p> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((p) => (
          <Link
            key={p.printful_sync_product_id}
            href={`/admin/products/${p.printful_sync_product_id}`}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              padding: 14,
              border: "1px solid #ddd",
              borderRadius: 14,
              textDecoration: "none",
              color: "#111",
              background: "#fafafa",
            }}
          >
            <img
              src={p.thumbnail_url || "/fallback.png"}
              alt={p.title}
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #eee",
              }}
            />

            <div>
              <div style={{ fontWeight: 800 }}>{p.title}</div>
              <div style={{ fontSize: 13, opacity: 0.65 }}>
                {p.printful_sync_product_id}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
