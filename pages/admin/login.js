import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 440,
          border: "1px solid #ddd",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Admin Login</h1>
        <p style={{ marginTop: 0, opacity: 0.75, marginBottom: 20 }}>
          Sign in to manage Grit & Grace content, banners, pages, and products.
        </p>

        <label style={{ display: "block", marginBottom: 8 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          style={{ width: "100%", marginBottom: 16, padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <label style={{ display: "block", marginBottom: 8 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          style={{ width: "100%", marginBottom: 16, padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message ? <p style={{ color: "crimson", marginTop: 14 }}>{message}</p> : null}

        <div style={{ marginTop: 18 }}>
          <Link href="/" style={{ opacity: 0.75 }}>
            ← Back to website
          </Link>
        </div>
      </form>
    </div>
  );
}
