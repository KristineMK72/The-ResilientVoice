import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function AdminBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    enabled: false,
    text: "",
    link_url: "",
    link_label: "",
    bg: "#7f1d1d",
    fg: "#ffffff",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: authData } = await supabaseBrowser.auth.getUser();
      if (!authData?.user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabaseBrowser
        .from("site_settings")
        .select("value_json")
        .eq("key", "site_banner")
        .single();

      if (!error && data?.value_json && active) {
        setForm(data.value_json);
      }

      if (active) setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabaseBrowser.from("site_settings").upsert({
      key: "site_banner",
      value_json: form,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    setMessage(error ? error.message : "Banner saved.");
  }

  if (loading) return <div style={{ padding: 24 }}>Loading banner editor...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Edit Site Banner</h1>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => updateField("enabled", e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Banner enabled
        </label>

        <div>
          <label>Banner text</label>
          <input
            value={form.text}
            onChange={(e) => updateField("text", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Link URL</label>
          <input
            value={form.link_url}
            onChange={(e) => updateField("link_url", e.target.value)}
            style={inputStyle}
            placeholder="/product/420489968"
          />
        </div>

        <div>
          <label>Link label</label>
          <input
            value={form.link_label}
            onChange={(e) => updateField("link_label", e.target.value)}
            style={inputStyle}
            placeholder="Shop now"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label>Background color</label>
            <input
              value={form.bg}
              onChange={(e) => updateField("bg", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Text color</label>
            <input
              value={form.fg}
              onChange={(e) => updateField("fg", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: 12,
            background: form.bg || "#7f1d1d",
            color: form.fg || "#fff",
          }}
        >
          {form.text || "Your banner preview will appear here"}
          {form.link_label ? ` — ${form.link_label}` : ""}
        </div>

        <button
          type="submit"
          disabled={saving}
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
          {saving ? "Saving..." : "Save banner"}
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
