// pages/admin/orders.js — see recent paid orders without opening Stripe
"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gg_admin_orders_pw";

function money(cents, currency = "usd") {
  if (cents == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(Number(cents) / 100);
  } catch {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  }
}

function itemsList(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try {
    return JSON.parse(items);
  } catch {
    return [];
  }
}

export default function AdminOrders() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPassword(saved);
        setAuthed(true);
      }
    } catch {}
  }, []);

  const load = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders?limit=30", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        if (res.status === 401) {
          setAuthed(false);
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
        setOrders([]);
      } else {
        setOrders(data.orders || []);
        setAuthed(true);
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  function login(e) {
    e.preventDefault();
    try {
      sessionStorage.setItem(STORAGE_KEY, password);
    } catch {}
    setAuthed(true);
  }

  function logout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPassword("");
    setAuthed(false);
    setOrders([]);
  }

  if (!authed) {
    return (
      <>
        <Head>
          <title>Orders · Admin</title>
        </Head>
        <div style={styles.page}>
          <form onSubmit={login} style={styles.card}>
            <h1 style={{ margin: "0 0 0.5rem" }}>Orders</h1>
            <p style={{ margin: "0 0 1rem", opacity: 0.8 }}>
              Recent paid orders from Supabase (no Stripe login needed).
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              required
              style={styles.input}
            />
            <button type="submit" style={styles.btn}>
              View orders
            </button>
            <p style={{ fontSize: "0.85rem", opacity: 0.65, marginTop: 12 }}>
              Set <code>ADMIN_PASSWORD</code> in Vercel (or use shop portal password).
            </p>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Orders · Admin</title>
      </Head>
      <div style={styles.page}>
        <header style={styles.top}>
          <div>
            <h1 style={{ margin: 0 }}>Recent orders</h1>
            <p style={{ margin: "0.35rem 0 0", opacity: 0.75 }}>Last 30 · from your database</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={load} style={styles.btnGhost}>
              Refresh
            </button>
            <button type="button" onClick={logout} style={styles.btnGhost}>
              Log out
            </button>
          </div>
        </header>

        {error && <p style={{ color: "#ff6b6b", fontWeight: 700 }}>{error}</p>}
        {loading && <p>Loading…</p>}
        {!loading && !orders.length && <p style={{ opacity: 0.8 }}>No orders found.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => {
            const lines = itemsList(o.items);
            return (
              <article key={o.stripe_session_id} style={styles.order}>
                <div style={styles.row}>
                  <div>
                    <strong>{o.customer_name || o.ship_name || "Customer"}</strong>
                    <div style={styles.meta}>{o.customer_email || "—"}</div>
                    <div style={styles.meta}>
                      {[o.ship_city, o.ship_state, o.ship_country].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900 }}>{money(o.amount_total, o.currency)}</div>
                    <span style={styles.badge}>{o.fulfillment_status || "—"}</span>
                  </div>
                </div>
                <ul style={styles.list}>
                  {lines.slice(0, 8).map((li, i) => (
                    <li key={i}>
                      {li.quantity || 1}× {li.description || li.product_name || "Item"}
                    </li>
                  ))}
                </ul>
                {o.tracking_number && (
                  <div style={styles.meta}>Tracking: {o.tracking_number}</div>
                )}
                <div style={{ ...styles.meta, fontSize: "0.75rem", marginTop: 8 }}>
                  {o.updated_at || o.created_at} · {String(o.stripe_session_id || "").slice(0, 24)}…
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    maxWidth: 720,
    margin: "0 auto",
    padding: "1.5rem 1.25rem 3rem",
    color: "#111",
  },
  card: {
    maxWidth: 360,
    margin: "10vh auto",
    padding: "1.5rem",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: "0.75rem",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: "1rem",
  },
  btn: {
    padding: "0.75rem",
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "0.5rem 0.85rem",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  top: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: "1.25rem",
  },
  order: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "1rem 1.1rem",
    background: "#fafafa",
  },
  row: { display: "flex", justifyContent: "space-between", gap: 12 },
  meta: { opacity: 0.75, fontSize: "0.9rem", marginTop: 4 },
  badge: {
    display: "inline-block",
    marginTop: 6,
    padding: "0.2rem 0.5rem",
    borderRadius: 999,
    background: "#e0e7ff",
    fontSize: "0.75rem",
    fontWeight: 800,
  },
  list: { margin: "0.5rem 0 0", paddingLeft: "1.1rem" },
};
