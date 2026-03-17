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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 460,
          border: "1px solid #d1d5db",
          borderRadius: 20,
          padding: 28,
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
            color: "#111827",
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 22,
            color: "#4b5563",
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          Sign in to manage banners, pages, products, and metrics for Grit & Grace.
        </p>

        <label
          htmlFor="admin-email"
          style={{
            display: "block",
            marginBottom: 8,
            color: "#111827",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Email
        </label>
        <input
          id="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          style={inputStyle}
        />

        <label
          htmlFor="admin-password"
          style={{
            display: "block",
            marginBottom: 8,
            color: "#111827",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Password
        </label>
        <input
          id="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#0f172a",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 18,
            cursor: "pointer",
            marginTop: 6,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message ? (
          <p
            style={{
              color: "#b91c1c",
              marginTop: 16,
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        ) : null}

        <div style={{ marginTop: 18 }}>
          <Link
            href="/"
            style={{
              color: "#374151",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            ← Back to website
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  color: "#111827",
  background: "#ffffff",
  fontSize: 16,
  boxSizing: "border-box",
};
