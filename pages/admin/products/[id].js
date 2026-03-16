import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";

export default function AdminProductEdit() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: "",
    description: "",
    images: [],
    featured: false
  });

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data } = await supabaseBrowser
        .from("product_content")
        .select("*")
        .eq("sync_product_id", id)
        .single();

      if (data) setForm(data);
    }

    load();
  }, [id]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    await supabaseBrowser.from("product_content").upsert({
      sync_product_id: id,
      ...form,
      updated_at: new Date().toISOString()
    });

    alert("Saved!");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Product</h1>

      <label>Title</label>
      <input
        value={form.title || ""}
        onChange={(e) => update("title", e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <label>Description</label>
      <textarea
        value={form.description || ""}
        onChange={(e) => update("description", e.target.value)}
        style={{ width: "100%", height: 120 }}
      />

      <label>
        <input
          type="checkbox"
          checked={form.featured || false}
          onChange={(e) => update("featured", e.target.checked)}
        />
        Featured product
      </label>

      <button onClick={save} style={{ marginTop: 20 }}>
        Save product
      </button>
    </div>
  );
}
