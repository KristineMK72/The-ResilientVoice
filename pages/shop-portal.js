// pages/shop-portal.js — Vendor POD console: Queue + Catalog
"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gg_shop_portal_pw";

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

export default function ShopPortal() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("queue"); // queue | catalog
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [catalogWarning, setCatalogWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("open");
  const [busyId, setBusyId] = useState(null);
  const [demoBusy, setDemoBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPassword(saved);
        setAuthed(true);
      }
    } catch {}
  }, []);

  const loadOrders = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/shop-portal/orders?status=${filter}`, {
        headers: { "x-shop-password": password },
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
  }, [password, filter]);

  const loadCatalog = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    setCatalogWarning("");
    try {
      const res = await fetch("/api/shop-portal/catalog?active=1", {
        headers: { "x-shop-password": password },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load catalog");
        if (res.status === 401) {
          setAuthed(false);
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
        setCatalog([]);
      } else {
        setCatalog(data.items || []);
        if (data.warning) setCatalogWarning(data.warning);
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (!authed) return;
    if (tab === "queue") loadOrders();
    else loadCatalog();
  }, [authed, tab, filter, loadOrders, loadCatalog]);

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
    setCatalog([]);
  }

  async function updateOrder(sessionId, fulfillment_status, extra = {}) {
    setBusyId(sessionId);
    try {
      const res = await fetch("/api/shop-portal/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-shop-password": password,
        },
        body: JSON.stringify({
          stripe_session_id: sessionId,
          fulfillment_status,
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Update failed");
      else await loadOrders();
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function createDemo() {
    setDemoBusy(true);
    try {
      const res = await fetch("/api/shop-portal/demo-order", {
        method: "POST",
        headers: { "x-shop-password": password },
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Could not create demo");
      else {
        setTab("queue");
        setFilter("open");
        await loadOrders();
      }
    } catch (e) {
      alert(e.message || "Could not create demo");
    } finally {
      setDemoBusy(false);
    }
  }

  if (!authed) {
    return (
      <>
        <Head>
          <title>Vendor POD Console</title>
        </Head>
        <div style={styles.page}>
          <form onSubmit={login} style={styles.loginCard}>
            <p style={styles.kicker}>Vendor POD Console</p>
            <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.65rem" }}>Print shop login</h1>
            <p style={{ margin: "0 0 1.25rem", opacity: 0.8, lineHeight: 1.5 }}>
              Queue + catalog of items you can produce for partner brands.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Shop password"
              required
              style={styles.input}
              autoComplete="current-password"
            />
            <button type="submit" style={styles.btnPrimary}>
              Open console
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Vendor POD Console</title>
      </Head>
      <div style={styles.page}>
        <header style={styles.top}>
          <div>
            <p style={styles.kicker}>Vendor POD Console</p>
            <h1 style={{ margin: 0, fontSize: "1.45rem" }}>
              {tab === "queue" ? "Production queue" : "Available catalog"}
            </h1>
            <p style={{ margin: "0.35rem 0 0", opacity: 0.75, fontSize: "0.95rem" }}>
              {tab === "queue"
                ? "Jobs to print and ship"
                : "Items this shop is set up to produce (like a Printful catalog)"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setTab("queue")}
              style={tab === "queue" ? styles.btnTabOn : styles.btnGhost}
            >
              Queue
            </button>
            <button
              type="button"
              onClick={() => setTab("catalog")}
              style={tab === "catalog" ? styles.btnTabOn : styles.btnGhost}
            >
              Catalog
            </button>
            {tab === "queue" && (
              <>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={styles.select}
                >
                  <option value="open">Open</option>
                  <option value="shipped">Shipped</option>
                  <option value="all_local">All local</option>
                </select>
                <button type="button" onClick={createDemo} disabled={demoBusy} style={styles.btnGhost}>
                  {demoBusy ? "Creating…" : "+ Demo ticket"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => (tab === "queue" ? loadOrders() : loadCatalog())}
              style={styles.btnGhost}
            >
              Refresh
            </button>
            <button type="button" onClick={logout} style={styles.btnGhost}>
              Log out
            </button>
          </div>
        </header>

        {error && <p style={{ color: "#ff6b6b", fontWeight: 700 }}>{error}</p>}
        {loading && <p>Loading…</p>}

        {tab === "queue" && (
          <>
            <div style={styles.help}>
              <strong>Queue:</strong> Print → <em>Printing</em> → ship → <em>Mark shipped</em>.{" "}
              <em>Hold</em> if something is wrong. Use <strong>Catalog</strong> to see every item
              you’re set up to produce.
            </div>
            {!loading && !orders.length && (
              <p style={{ opacity: 0.85 }}>
                No open tickets. Try <strong>+ Demo ticket</strong> or wait for a partner order.
              </p>
            )}
            <div style={styles.list}>
              {orders.map((o) => {
                const lines = itemsList(o.items);
                const id = o.stripe_session_id;
                const busy = busyId === id;
                const isDemo = String(id || "").startsWith("demo_");
                return (
                  <article key={id} style={styles.card}>
                    <div style={styles.cardHead}>
                      <div>
                        <strong>
                          {o.ship_name || o.customer_name || "Customer"}
                          {isDemo ? " · DEMO" : ""}
                        </strong>
                        <div style={styles.meta}>{o.customer_email || "—"}</div>
                        <div style={styles.meta}>
                          {o.ship_line1}
                          {o.ship_line2 ? `, ${o.ship_line2}` : ""}
                          <br />
                          {[o.ship_city, o.ship_state, o.ship_postal].filter(Boolean).join(", ")}{" "}
                          {o.ship_country}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={styles.badge}>{o.fulfillment_status}</span>
                        <div style={{ marginTop: 6, fontWeight: 800 }}>
                          {money(o.amount_total, o.currency)}
                        </div>
                      </div>
                    </div>
                    <ul style={styles.items}>
                      {lines.map((li, i) => (
                        <li key={i}>
                          {li.quantity || 1}× {li.description || li.product_name || "Item"}
                        </li>
                      ))}
                    </ul>
                    {o.tracking_number && (
                      <p style={{ ...styles.meta, marginBottom: 10 }}>
                        Tracking: <strong>{o.tracking_number}</strong>
                      </p>
                    )}
                    <div style={styles.actions}>
                      <button
                        type="button"
                        disabled={busy}
                        style={styles.btnSmall}
                        onClick={() => updateOrder(id, "local_printing")}
                      >
                        Printing
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        style={styles.btnSmall}
                        onClick={() => {
                          const tracking = window.prompt(
                            "Tracking number (optional)",
                            o.tracking_number || ""
                          );
                          if (tracking === null) return;
                          updateOrder(id, "local_shipped", { tracking_number: tracking });
                        }}
                      >
                        Mark shipped
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        style={{ ...styles.btnSmall, opacity: 0.85 }}
                        onClick={() => updateOrder(id, "local_hold")}
                      >
                        Hold
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        style={{ ...styles.btnSmall, opacity: 0.85 }}
                        onClick={() => updateOrder(id, "local_queue")}
                      >
                        Back to queue
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {tab === "catalog" && (
          <>
            <div style={styles.help}>
              <strong>Catalog:</strong> Everything this shop is configured to print — blanks,
              colors, sizes, and print files. Same idea as browsing a Printful product list.
            </div>
            {catalogWarning && (
              <p style={{ color: "#fbbf24", fontWeight: 700 }}>{catalogWarning}</p>
            )}
            {!loading && !catalog.length && !catalogWarning && (
              <p style={{ opacity: 0.85 }}>
                No catalog items yet. Brand owner adds rows to <code>local_catalog</code> (see{" "}
                docs/VENDOR-CATALOG.md).
              </p>
            )}
            <div style={styles.catGrid}>
              {catalog.map((item) => (
                <article key={item.id || item.sku} style={styles.catCard}>
                  <div style={styles.catImg}>
                    {item.mockup_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.mockup_url}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>No mockup</span>
                    )}
                  </div>
                  <div style={{ padding: "0.85rem 1rem 1rem" }}>
                    <div style={styles.meta}>{item.category || item.blank_type || "Item"}</div>
                    <strong style={{ display: "block", margin: "0.25rem 0" }}>{item.title}</strong>
                    <div style={{ ...styles.meta, fontSize: "0.8rem" }}>SKU: {item.sku}</div>
                    {item.colors?.length > 0 && (
                      <div style={styles.meta}>Colors: {item.colors.join(", ")}</div>
                    )}
                    {item.sizes?.length > 0 && (
                      <div style={styles.meta}>Sizes: {item.sizes.join(", ")}</div>
                    )}
                    {item.base_cost_cents != null && (
                      <div style={styles.meta}>Base: {money(item.base_cost_cents)}</div>
                    )}
                    {item.print_file_url && (
                      <a
                        href={item.print_file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.fileLink}
                      >
                        Download print file →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#fff",
    padding: "1.5rem 1.25rem 3rem",
    maxWidth: 960,
    margin: "0 auto",
  },
  kicker: {
    margin: "0 0 0.35rem",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#93c5fd",
  },
  loginCard: {
    maxWidth: 400,
    margin: "12vh auto",
    padding: "1.75rem",
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "0.85rem 1rem",
    borderRadius: 10,
    border: "none",
    fontSize: "1rem",
  },
  btnPrimary: {
    padding: "0.85rem",
    borderRadius: 10,
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    background: "linear-gradient(90deg,#ff6b6b,#3b82f6)",
    color: "#fff",
  },
  top: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  help: {
    marginBottom: "1.25rem",
    padding: "0.9rem 1rem",
    borderRadius: 12,
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.25)",
    fontSize: "0.92rem",
    lineHeight: 1.55,
  },
  select: {
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "#111827",
    color: "#fff",
  },
  btnGhost: {
    padding: "0.5rem 0.85rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnTabOn: {
    padding: "0.5rem 0.85rem",
    borderRadius: 8,
    border: "1px solid #3b82f6",
    background: "rgba(59,130,246,0.25)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "1.15rem 1.2rem",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  meta: { opacity: 0.8, fontSize: "0.9rem", lineHeight: 1.45, marginTop: 4 },
  badge: {
    display: "inline-block",
    padding: "0.25rem 0.55rem",
    borderRadius: 999,
    background: "rgba(59,130,246,0.25)",
    fontSize: "0.75rem",
    fontWeight: 800,
  },
  items: { margin: "0 0 12px", paddingLeft: "1.1rem", lineHeight: 1.55 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8 },
  btnSmall: {
    padding: "0.45rem 0.75rem",
    borderRadius: 8,
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    background: "#fff",
    color: "#0b1220",
    fontSize: "0.85rem",
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  catCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    overflow: "hidden",
  },
  catImg: {
    height: 160,
    background: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileLink: {
    display: "inline-block",
    marginTop: 8,
    color: "#93c5fd",
    fontWeight: 800,
    fontSize: "0.9rem",
  },
};
