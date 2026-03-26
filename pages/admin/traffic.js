// /pages/admin/traffic.js
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function TrafficMapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const { data, error } = await supabaseBrowser
        .from("page_views")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .not("path", "like", "/admin%")
        .not("user_agent", "ilike", "vercel-screenshot%")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!error && active) {
        setRows(data || []);
      }

      if (active) setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const validRows = useMemo(() => {
    return (rows || []).filter((row) => {
      const lat = Number(row.latitude);
      const lng = Number(row.longitude);

      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    });
  }, [rows]);

  const visitorCount = useMemo(() => {
    return validRows.filter((r) => r.visitor_type !== "buyer").length;
  }, [validRows]);

  const buyerCount = useMemo(() => {
    return validRows.filter((r) => r.visitor_type === "buyer").length;
  }, [validRows]);

  const uniqueLocations = useMemo(() => {
    const seen = new Set();
    for (const row of validRows) {
      seen.add(`${row.city || ""}|${row.region || ""}|${row.country || ""}`);
    }
    return seen.size;
  }, [validRows]);

  useEffect(() => {
    let cancelled = false;

    async function drawMap() {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);

        markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      }

      markersLayerRef.current.clearLayers();

      const bounds = [];

      validRows.forEach((row) => {
        const lat = Number(row.latitude);
        const lng = Number(row.longitude);
        const color = row.visitor_type === "buyer" ? "red" : "blue";

        const marker = L.circleMarker([lat, lng], {
          radius: row.visitor_type === "buyer" ? 9 : 7,
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        });

        marker.bindPopup(`
          <div style="min-width:220px">
            <div><strong>${row.city || "Unknown"}${row.region ? `, ${row.region}` : ""}</strong></div>
            <div>${row.country || ""}</div>
            <div style="margin-top:6px"><strong>Path:</strong> ${row.path || "/"}</div>
            <div><strong>Type:</strong> ${row.visitor_type || "visitor"}</div>
            <div><strong>Session:</strong> ${row.session_id || "n/a"}</div>
            <div><strong>IP:</strong> ${row.ip || "n/a"}</div>
            <div><strong>At:</strong> ${new Date(row.created_at).toLocaleString()}</div>
          </div>
        `);

        marker.addTo(markersLayerRef.current);
        bounds.push([lat, lng]);
      });

      if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 8);
      } else if (bounds.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      } else {
        mapInstanceRef.current.setView([39.8283, -98.5795], 4);
      }
    }

    drawMap();

    return () => {
      cancelled = true;
    };
  }, [validRows]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin"
          style={{ color: "#fff", textDecoration: "underline", fontWeight: 700 }}
        >
          ← Back to admin
        </Link>
      </div>

      <h1 style={{ color: "#fff", marginBottom: 8 }}>Traffic Map</h1>
      <p style={{ color: "rgba(255,255,255,0.82)", marginTop: 0, marginBottom: 20 }}>
        Blue pins are visitors. Red pins are buyers once checkout tracking is added.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard label="Mapped Visits" value={String(validRows.length)} />
        <StatCard label="Visitors" value={String(visitorCount)} />
        <StatCard label="Buyers" value={String(buyerCount)} />
        <StatCard label="Locations" value={String(uniqueLocations)} />
      </div>

      {loading ? (
        <p style={{ color: "#fff" }}>Loading map...</p>
      ) : validRows.length === 0 ? (
        <div
          style={{
            background: "#fff",
            color: "#111827",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
          }}
        >
          No mapped traffic yet. Add latitude/longitude to your `page_views` rows and reload.
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            height: 650,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
          }}
        />
      )}

      <div
        style={{
          marginTop: 20,
          background: "#fff",
          color: "#111827",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Recent mapped traffic</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {validRows.slice(0, 12).map((row) => (
            <div
              key={row.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {row.city || "Unknown"}
                {row.region ? `, ${row.region}` : ""}
                {row.country ? ` (${row.country})` : ""}
              </div>
              <div style={{ opacity: 0.8, marginTop: 4 }}>
                {row.path || "/"} · {row.visitor_type || "visitor"}
              </div>
              <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
                {new Date(row.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        color: "#111827",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
    </div>
  );
}
