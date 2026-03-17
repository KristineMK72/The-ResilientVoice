import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function AdminHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data?.user;

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      if (active) {
        setEmail(user.email || "");
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading admin...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>Grit & Grace Admin</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>{email}</p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            cursor: "pointer",
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          Log out
        </button>
      </div>

      {/* Dashboard grid */}
      <div style={{ display: "grid", gap: 16 }}>

        <Link href="/admin/banner" style={cardStyle}>
          📢 Edit Site Banner
        </Link>

        <Link href="/admin/pages" style={cardStyle}>
          📝 Edit Page Content
        </Link>

        <Link href="/admin/products" style={cardStyle}>
          🛍 Manage Products
        </Link>

        <Link href="/admin/media" style={cardStyle}>
          🖼 Manage Images / Media
        </Link>

        <Link href="/admin/metrics" style={cardStyle}>
          📊 Metrics Dashboard
        </Link>
        
        <Link href="/" style={cardStyle}>
          🌐 View Live Website
        </Link>
        
        <Link href="/admin/traffic" style={cardStyle}>
          🗺️ Traffic Map
        </Link>

      </div>
    </div>
  );
}

const cardStyle = {
  display: "block",
  padding: 20,
  border: "1px solid #ddd",
  borderRadius: 14,
  textDecoration: "none",
  color: "#111",
  fontWeight: 700,
  background: "#fafafa",
};
