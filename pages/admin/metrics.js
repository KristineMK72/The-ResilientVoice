import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

function money(n) {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
}

export default function AdminMetricsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [emailSignups, setEmailSignups] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const [
        ordersRes,
        orderItemsRes,
        emailRes,
      ] = await Promise.all([
        supabaseBrowser
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabaseBrowser
          .from("order_items")
          .select("*")
          .limit(1000),
        supabaseBrowser
          .from("email_signups")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      if (!active) return;

      setOrders(ordersRes.data || []);
      setOrderItems(orderItemsRes.data || []);
      setEmailSignups(emailRes.data || []);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => {
      const amount =
        o.total ??
        o.amount_total ??
        o.total_amount ??
        0;
      return sum + Number(amount || 0);
    }, 0);
  }, [orders]);

  const totalOrders = orders.length;
  const totalSignups = emailSignups.length;

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);
  const recentSignups = useMemo(() => emailSignups.slice(0, 8), [emailSignups]);

  const salesByDay = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      const rawDate = order.created_at;
      if (!rawDate) continue;

      const day = new Date(rawDate).toISOString().slice(0, 10);
      const amount =
        Number(
          order.total ??
          order.amount_total ??
          order.total_amount ??
          0
        ) || 0;

      map.set(day, (map.get(day) || 0) + amount);
    }

    return Array.from(map.entries())
      .map(([day, total]) => ({ day, total }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [orders]);

  const signupsByDay = useMemo(() => {
    const map = new Map();

    for (const row of emailSignups) {
      const rawDate = row.created_at;
      if (!rawDate) continue;

      const day = new Date(rawDate).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [emailSignups]);

  const topProducts = useMemo(() => {
    const map = new Map();

    for (const item of orderItems) {
      const name =
        item.product_name ||
        item.name ||
        item.title ||
        item.sku ||
        "Unnamed Product";

      const qty = Number(item.quantity || 1);
      const current = map.get(name) || { name, quantity: 0 };

      current.quantity += qty;
      map.set(name, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [orderItems]);

  const maxSales = useMemo(() => {
    return Math.max(1, ...salesByDay.map((d) => d.total));
  }, [salesByDay]);

  const maxSignups = useMemo(() => {
    return Math.max(1, ...signupsByDay.map((d) => d.count));
  }, [signupsByDay]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading metrics...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          ← Back to admin
        </Link>
      </div>

      <h1 style={{ marginBottom: 8 }}>Metrics Dashboard</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Sales, newsletter growth, and top products.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
          marginBottom: 28,
        }}
      >
        <StatCard label="Total Revenue" value={money(totalRevenue)} />
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Email Signups" value={String(totalSignups)} />
        <StatCard label="Top Product Count" value={String(topProducts[0]?.quantity || 0)} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 24,
        }}
      >
        <Panel title="Sales by Day">
          {salesByDay.length ? (
            <MiniBarChart
              rows={salesByDay.map((d) => ({
                label: d.day,
                value: d.total,
                display: money(d.total),
              }))}
              maxValue={maxSales}
            />
          ) : (
            <EmptyText>No order history yet.</EmptyText>
          )}
        </Panel>

        <Panel title="Newsletter Signups by Day">
          {signupsByDay.length ? (
            <MiniBarChart
              rows={signupsByDay.map((d) => ({
                label: d.day,
                value: d.count,
                display: String(d.count),
              }))}
              maxValue={maxSignups}
            />
          ) : (
            <EmptyText>No signups yet.</EmptyText>
          )}
        </Panel>

        <Panel title="Top Products">
          {topProducts.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {topProducts.map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ opacity: 0.75 }}>{item.quantity} sold</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyText>No order items yet.</EmptyText>
          )}
        </Panel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          <Panel title="Recent Orders">
            {recentOrders.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {recentOrders.map((order, i) => {
                  const amount =
                    order.total ??
                    order.amount_total ??
                    order.total_amount ??
                    0;

                  return (
                    <div
                      key={order.id || i}
                      style={{
                        padding: 12,
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {order.customer_email || order.email || "Order"}
                      </div>
                      <div style={{ opacity: 0.7, fontSize: 14 }}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "No date"}
                      </div>
                      <div style={{ marginTop: 4 }}>{money(amount)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyText>No recent orders.</EmptyText>
            )}
          </Panel>

          <Panel title="Recent Email Signups">
            {recentSignups.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {recentSignups.map((row, i) => (
                  <div
                    key={row.id || i}
                    style={{
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{row.email}</div>
                    <div style={{ opacity: 0.7, fontSize: 14 }}>
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "No date"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>No recent signups.</EmptyText>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: 18,
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        background: "#fafafa",
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        background: "#fff",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

function MiniBarChart({ rows, maxValue }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((row, i) => (
        <div key={`${row.label}-${i}`}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            <span>{row.label}</span>
            <span>{row.display}</span>
          </div>

          <div
            style={{
              height: 14,
              background: "#e5e7eb",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(4, (row.value / maxValue) * 100)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ef4444, #3b82f6)",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyText({ children }) {
  return <p style={{ opacity: 0.7, margin: 0 }}>{children}</p>;
}
