import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from("products")
        .select("id,title,printful_sync_product_id,thumbnail_url")
        .order("title");

      setProducts(data || []);
    }

    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>

      <div style={{ display: "grid", gap: 12 }}>
        {products.map((p) => (
          <Link
            key={p.printful_sync_product_id}
            href={`/admin/products/${p.printful_sync_product_id}`}
            style={{
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <img
              src={p.thumbnail_url}
              style={{ width: 60, borderRadius: 8 }}
            />
            <div>{p.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
