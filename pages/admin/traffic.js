// /pages/admin/traffic.js
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

/**
 * Phase 1:
 * - Use exact row latitude/longitude when present
 * - Else fall back to city centroid
 * - Else fall back to state centroid
 * - Else fall back to country centroid
 *
 * Later:
 * - Expand CITY_CENTROIDS as you collect more cities
 * - Or move centroids into a Supabase lookup table
 */

const STATE_CENTROIDS = {
  MN: { lat: 46.7296, lng: -94.6859 },
  AZ: { lat: 34.0489, lng: -111.0937 },
  CA: { lat: 36.7783, lng: -119.4179 },
  MI: { lat: 44.3148, lng: -85.6024 },
  IA: { lat: 41.8780, lng: -93.0977 },
  VA: { lat: 37.4316, lng: -78.6569 },
  OR: { lat: 43.8041, lng: -120.5542 },
  TX: { lat: 31.9686, lng: -99.9018 },
  NC: { lat: 35.7596, lng: -79.0193 },
  NE: { lat: 41.4925, lng: -99.9018 },
};

const COUNTRY_CENTROIDS = {
  US: { lat: 39.8283, lng: -98.5795 },
  IE: { lat: 53.1424, lng: -7.6921 },
  SE: { lat: 60.1282, lng: 18.6435 },
};

const CITY_CENTROIDS = {
  "Brainerd|MN|US": { lat: 46.3580, lng: -94.2008 },
  "Baxter|MN|US": { lat: 46.3433, lng: -94.2867 },
  "Saint Paul|MN|US": { lat: 44.9537, lng: -93.0900 },
  "Phoenix|AZ|US": { lat: 33.4484, lng: -112.0740 },
  "Los Angeles|CA|US": { lat: 34.0522, lng: -118.2437 },
  "Howell|MI|US": { lat: 42.6073, lng: -83.9294 },
  "Riverside|CA|US": { lat: 33.9806, lng: -117.3755 },
  "Council Bluffs|IA|US": { lat: 41.2619, lng: -95.8608 },
  "Washington|VA|US": { lat: 38.8951, lng: -77.0364 },
  "Reston|VA|US": { lat: 38.9586, lng: -77.3570 },
  "San Jose|CA|US": { lat: 37.3382, lng: -121.8863 },
  "Santa Clara|CA|US": { lat: 37.3541, lng: -121.9552 },
  "Prineville|OR|US": { lat: 44.2998, lng: -120.8345 },
  "Forest City|NC|US": { lat: 35.3340, lng: -81.8651 },
  "Fort Worth|TX|US": { lat: 32.7555, lng: -97.3308 },
  "Altoona|IA|US": { lat: 41.6447, lng: -93.4755 },
  "Springfield|NE|US": { lat: 41.0586, lng: -96.1378 },
  "Clonee||IE": { lat: 53.4116, lng: -6.4252 },
  "Luleå||SE": { lat: 65.5848, lng: 22.1547 },
};

function normalizeCity(value) {
  return String(value || "")
    .replace(/%20/g, " ")
    .trim();
}

function hasExactLatLng(row) {
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
}

function getFallbackCoords(row) {
  if (hasExactLatLng(row)) {
    return {
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      precision: "exact",
    };
  }

  const city = normalizeCity(row.city);
  const region = String(row.region || "").trim();
  const country = String(row.country || "").trim();

  const cityKey = `${city}|${region}|${country}`;
  if (CITY_CENTROIDS[cityKey]) {
    return { ...CITY_CENTROIDS[cityKey], precision: "city" };
  }

  const cityCountryKey = `${city}||${country}`;
  if (CITY_CENTROIDS[cityCountryKey]) {
    return { ...CITY_CENTROIDS[cityCountryKey], precision: "city" };
  }

  if (region && STATE_CENTROIDS[region]) {
    return { ...STATE_CENTROIDS[region], precision: "state" };
  }

  if (country && COUNTRY_CENTROIDS[country]) {
    return { ...COUNTRY_CENTROIDS[country], precision: "country" };
  }

  return null;
}

function isBotRow(row) {
  const ua = String(row.user_agent || "").toLowerCase();
  const ip = String(row.ip || "");

  if (
    ua.includes("vercel-screenshot") ||
    ua.includes("headless") ||
    ua.includes("bot") ||
    ua.includes("crawl") ||
    ua.includes("spider")
  ) {
    return true;
  }

  if (
    ip.startsWith("31.13.") ||
    ip.startsWith("173.252.") ||
    ip.startsWith("66.220.") ||
    ip.startsWith("66.249.") ||
    ip.startsWith("40.77.")
  ) {
    return true;
  }

  return false;
}

function isSelfRow(row) {
  const ip = String(row.ip || "");
  return ip === "172.87.11.213" || ip === "174.234.138.107" || ip === "174.234.146.246";
}

export default function TrafficMapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideBots, setHideBots] = useState(true);
  const [hideSelf, setHideSelf] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const { data, error } = await supabaseBrowser
        .from("page_views")
        .select("*")
        .not("path", "like", "/admin%")
        .order("created_at", { ascending: false })
        .limit(1000);

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

  const preparedRows = useMemo(() => {
    return (rows || [])
      .map((row) => {
        const coords = getFallbackCoords(row);
        return {
          ...row,
          city_normalized: normalizeCity(row.city),
          map_latitude: coords?.lat ?? null,
          map_longitude: coords?.lng ?? null,
          map_precision: coords?.precision ?? null,
          is_bot: isBotRow(row),
          is_self: isSelfRow(row),
        };
      })
      .filter((row) => {
        if (!Number.isFinite(Number(row.map_latitude))) return false;
        if (!Number.isFinite(Number(row.map_longitude))) return false;
        if (hideBots && row.is_bot) return false;
        if (hideSelf && row.is_self) return false;
        return true;
      });
  }, [rows, hideBots, hideSelf]);

  const visitorCount = useMemo(() => {
    return preparedRows.filter((r) => r.visitor_type !== "buyer").length;
  }, [preparedRows]);

  const buyerCount = useMemo(() => {
    return preparedRows.filter((r) => r.visitor_type === "buyer").length;
  }, [preparedRows]);

  const uniqueLocations = useMemo(() => {
    const seen = new Set();
    for (const row of preparedRows) {
      seen.add(
        `${row.city_normalized || ""}|${row.region || ""}|${row.country || ""}|${row.map_precision || ""}`
      );
    }
    return seen.size;
  }, [preparedRows]);

  const groupedLocations = useMemo(() => {
    const grouped = new Map();

    for (const row of preparedRows) {
      const key = `${row.map_latitude}|${row.map_longitude}|${row.visitor_type || "visitor"}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.count += 1;
        existing.rows.push(row);
        if (new Date(row.created_at) > new Date(existing.latestAt)) {
          existing.latestAt = row.created_at;
        }
      } else {
        grouped.set(key, {
          key,
          latitude: Number(row.map_latitude),
          longitude: Number(row.map_longitude),
          visitor_type: row.visitor_type || "visitor",
          precision: row.map_precision || "unknown",
          city: row.city_normalized || "Unknown",
          region: row.region || "",
          country: row.country || "",
          latestAt: row.created_at,
          count: 1,
          rows: [row],
        });
      }
    }

    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.latestAt) - new Date(a.latestAt)
    );
  }, [preparedRows]);

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

      groupedLocations.forEach((loc) => {
        const color = loc.visitor_type === "buyer" ? "red" : "blue";
        const radius = Math.min(8 + loc.count, 18);

        const marker = L.circleMarker([loc.latitude, loc.longitude], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        });

        const recentPaths = loc.rows
          .slice(0, 5)
          .map((r) => r.path || "/")
          .join("<br/>");

        marker.bindPopup(`
          <div style="min-width:240px">
            <div><strong>${loc.city}${loc.region ? `, ${loc.region}` : ""}</strong></div>
            <div>${loc.country || ""}</div>
            <div style="margin-top:6px"><strong>Visits:</strong> ${loc.count}</div>
            <div><strong>Precision:</strong> ${loc.precision}</div>
            <div><strong>Type:</strong> ${loc.visitor_type}</div>
            <div><strong>Latest:</strong> ${new Date(loc.latestAt).toLocaleString()}</div>
            <div style="margin-top:6px"><strong>Recent paths:</strong><br/>${recentPaths}</div>
          </div>
        `);

        marker.addTo(markersLayerRef.current);
        bounds.push([loc.latitude, loc.longitude]);
      });

      if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 7);
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
  }, [groupedLocations]);

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
        Blue pins are visitors. Red pins are buyers. Exact row coordinates are used first,
        then city/state/country centroids as fallback.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <label style={{ color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={hideBots}
            onChange={(e) => setHideBots(e.target.checked)}
          />
          Hide bots
        </label>

        <label style={{ color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={hideSelf}
            onChange={(e) => setHideSelf(e.target.checked)}
          />
          Hide me
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard label="Mapped Visits" value={String(preparedRows.length)} />
        <StatCard label="Visitors" value={String(visitorCount)} />
        <StatCard label="Buyers" value={String(buyerCount)} />
        <StatCard label="Locations" value={String(uniqueLocations)} />
      </div>

      {loading ? (
        <p style={{ color: "#fff" }}>Loading map...</p>
      ) : groupedLocations.length === 0 ? (
        <div
          style={{
            background: "#fff",
            color: "#111827",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
          }}
        >
          No mapped traffic yet. Add row coordinates or expand your centroid lookups.
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
          {preparedRows.slice(0, 12).map((row) => (
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
                {row.city_normalized || "Unknown"}
                {row.region ? `, ${row.region}` : ""}
                {row.country ? ` (${row.country})` : ""}
              </div>

              <div style={{ opacity: 0.8, marginTop: 4 }}>
                {row.path || "/"} · {row.visitor_type || "visitor"}
              </div>

              <div style={{ opacity: 0.7, marginTop: 4 }}>
                Precision: {row.map_precision || "none"}
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
