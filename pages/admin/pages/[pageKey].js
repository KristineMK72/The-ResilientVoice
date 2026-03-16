import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";

export default function AdminPageEditor() {
  const router = useRouter();
  const { pageKey } = router.query;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    page_key: "",
    section_key: "main",
    title: "",
    body: "",
    button_label: "",
    button_url: "",
    enabled: true,
  });

  useEffect(() => {
    if (!pageKey) return;

    let active = true;

    async function load() {
      const { data } = await supabaseBrowser
        .from("page_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("section_key", "main")
        .maybeSingle();

      if (active) {
        if (data) {
          setForm(data);
        } else {
          setForm({
            page_key: pageKey,
            section_key: "main",
            title: "",
            body: "",
            button_label: "",
            button_url: "",
            enabled: true,
          });
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [pageKey]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      page_key: pageKey,
      section_key: "main",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseBrowser
      .from("page_content")
      .upsert(payload, { onConflict: "page_key,section_key" });

    setMessage(error ? error.message : "Saved.");
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Edit page: {pageKey}</h1>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => updateField("enabled", e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Enabled
        </label>

        <div>
          <label>Title</label>
          <input
            value={form.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Body</label>
          <textarea
            value={form.body || ""}
            onChange={(e) => updateField("body", e.target.value)}
            style={{ ...inputStyle, minHeight: 140 }}
          />
        </div>

        <div>
          <label>Button label</label>
          <input
            value={form.button_label || ""}
            onChange={(e) => updateField("button_label", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Button URL</label>
          <input
            value={form.button_url || ""}
            onChange={(e) => updateField("button_url", e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Save page content
        </button>

        {message ? <p>{message}</p> : null}
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
};
