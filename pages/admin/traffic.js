// /pages/admin/traffic.js
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";
import { PRINTFUL_PRODUCTS } from "../../lib/printfulMap";

/**
 * Phase 1:
 * - Use exact row latitude/longitude when present
 * - Else fall back to city centroid
 * - Else fall back to state centroid
 * - Else fall back to country centroid
 */

const STATE_CENTROIDS = {
  AL: { lat: 32.806671, lng: -86.791130 },
  AK: { lat: 61.370716, lng: -152.404419 },
  AZ: { lat: 33.729759, lng: -111.431221 },
  AR: { lat: 34.969704, lng: -92.373123 },
  CA: { lat: 36.116203, lng: -119.681564 },
  CO: { lat: 39.059811, lng: -105.311104 },
  CT: { lat: 41.597782, lng: -72.755371 },
  DE: { lat: 39.318523, lng: -75.507141 },
  FL: { lat: 27.766279, lng: -81.686783 },
  GA: { lat: 33.040619, lng: -83.643074 },
  HI: { lat: 21.094318, lng: -157.498337 },
  ID: { lat: 44.240459, lng: -114.478828 },
  IL: { lat: 40.349457, lng: -88.986137 },
  IN: { lat: 39.849426, lng: -86.258278 },
  IA: { lat: 42.011539, lng: -93.210526 },
  KS: { lat: 38.526600, lng: -96.726486 },
  KY: { lat: 37.668140, lng: -84.670067 },
  LA: { lat: 31.169546, lng: -91.867805 },
  ME: { lat: 44.693947, lng: -69.381927 },
  MD: { lat: 39.063946, lng: -76.802101 },
  MA: { lat: 42.230171, lng: -71.530106 },
  MI: { lat: 43.326618, lng: -84.536095 },
  MN: { lat: 45.694454, lng: -93.900192 },
  MS: { lat: 32.741646, lng: -89.678696 },
  MO: { lat: 38.456085, lng: -92.288368 },
  MT: { lat: 46.921925, lng: -110.454353 },
  NE: { lat: 41.125370, lng: -98.268082 },
  NV: { lat: 38.313515, lng: -117.055374 },
  NH: { lat: 43.452492, lng: -71.563896 },
  NJ: { lat: 40.298904, lng: -74.521011 },
  NM: { lat: 34.840515, lng: -106.248482 },
  NY: { lat: 42.165726, lng: -74.948051 },
  NC: { lat: 35.630066, lng: -79.806419 },
  ND: { lat: 47.528912, lng: -99.784012 },
  OH: { lat: 40.388783, lng: -82.764915 },
  OK: { lat: 35.565342, lng: -96.928917 },
  OR: { lat: 44.572021, lng: -122.070938 },
  PA: { lat: 40.590752, lng: -77.209755 },
  RI: { lat: 41.680893, lng: -71.511780 },
  SC: { lat: 33.856892, lng: -80.945007 },
  SD: { lat: 44.299782, lng: -99.438828 },
  TN: { lat: 35.747845, lng: -86.692345 },
  TX: { lat: 31.054487, lng: -97.563461 },
  UT: { lat: 40.150032, lng: -111.862434 },
  VT: { lat: 44.045876, lng: -72.710686 },
  VA: { lat: 37.769337, lng: -78.169968 },
  WA: { lat: 47.400902, lng: -121.490494 },
  WV: { lat: 38.491226, lng: -80.954453 },
  WI: { lat: 44.268543, lng: -89.616508 },
  WY: { lat: 42.755966, lng: -107.302490 },
  DC: { lat: 38.907200, lng: -77.036900 },
};

const COUNTRY_CENTROIDS = {
  US: { lat: 39.8283, lng: -98.5795 },
  CA: { lat: 56.1304, lng: -106.3468 },
  MX: { lat: 23.6345, lng: -102.5528 },

  GB: { lat: 55.3781, lng: -3.4360 },
  IE: { lat: 53.1424, lng: -7.6921 },
  FR: { lat: 46.2276, lng: 2.2137 },
  DE: { lat: 51.1657, lng: 10.4515 },
  ES: { lat: 40.4637, lng: -3.7492 },
  IT: { lat: 41.8719, lng: 12.5674 },
  NL: { lat: 52.1326, lng: 5.2913 },
  SE: { lat: 60.1282, lng: 18.6435 },
  NO: { lat: 60.4720, lng: 8.4689 },
  FI: { lat: 61.9241, lng: 25.7482 },
  DK: { lat: 56.2639, lng: 9.5018 },

  PL: { lat: 51.9194, lng: 19.1451 },
  CZ: { lat: 49.8175, lng: 15.4730 },
  AT: { lat: 47.5162, lng: 14.5501 },
  CH: { lat: 46.8182, lng: 8.2275 },

  AU: { lat: -25.2744, lng: 133.7751 },
  NZ: { lat: -40.9006, lng: 174.8860 },

  IN: { lat: 20.5937, lng: 78.9629 },
  CN: { lat: 35.8617, lng: 104.1954 },
  JP: { lat: 36.2048, lng: 138.2529 },
  KR: { lat: 35.9078, lng: 127.7669 },
  SG: { lat: 1.3521, lng: 103.8198 },

  BR: { lat: -14.2350, lng: -51.9253 },
  AR: { lat: -38.4161, lng: -63.6167 },
  CL: { lat: -35.6751, lng: -71.5430 },
  CO: { lat: 4.5709, lng: -74.2973 },

  ZA: { lat: -30.5595, lng: 22.9375 },
  NG: { lat: 9.0820, lng: 8.6753 },
  EG: { lat: 26.8206, lng: 30.8025 },

  TR: { lat: 38.9637, lng: 35.2433 },
  AE: { lat: 23.4241, lng: 53.8478 },
  SA: { lat: 23.8859, lng: 45.0792 },

  RU: { lat: 61.5240, lng: 105.3188 },
};

const CITY_CENTROIDS = {
  "Brainerd|MN|US": { lat: 46.358, lng: -94.2008 },
  "Baxter|MN|US": { lat: 46.3433, lng: -94.2867 },
  "Saint Paul|MN|US": { lat: 44.9537, lng: -93.09 },
  "Phoenix|AZ|US": { lat: 33.4484, lng: -112.074 },
  "Los Angeles|CA|US": { lat: 34.0522, lng: -118.2437 },
  "Howell|MI|US": { lat: 42.6073, lng: -83.9294 },
  "Riverside|CA|US": { lat: 33.9806, lng: -117.3755 },
  "Council Bluffs|IA|US": { lat: 41.2619, lng: -95.8608 },
  "Washington|VA|US": { lat: 38.8951, lng: -77.0364 },
  "Reston|VA|US": { lat: 38.9586, lng: -77.357 },
  "San Jose|CA|US": { lat: 37.3382, lng: -121.8863 },
  "Santa Clara|CA|US": { lat: 37.3541, lng: -121.9552 },
  "Prineville|OR|US": { lat: 44.2998, lng: -120.8345 },
  "Forest City|NC|US": { lat: 35.334, lng: -81.8651 },
  "Fort Worth|TX|US": { lat: 32.7555, lng: -97.3308 },
  "Altoona|IA|US": { lat: 41.6447, lng: -93.4755 },
  "Springfield|NE|US": { lat: 41.0586, lng: -96.1378 },
  "Clonee||IE": { lat: 53.4116, lng: -6.4252 },
  "Luleå||SE": { lat: 65.5848, lng: 22.1547 },
};

const PRODUCT_ID_TO_TITLE = Object.fromEntries(
  Object.values(PRINTFUL_PRODUCTS || {}).map((p) => [String(p.sync_product_id), p.title])
);

function normalizeCity(value) {
  return String(value || "").replace(/%20/g, " ").trim();
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
  return (
    ip === "172.87.11.213" ||
    ip === "174.234.138.107" ||
    ip === "174.234.146.246"
  );
}

function formatPathLabel(path) {
  const cleanPath = String(path || "/");

  if (cleanPath === "/") return "Home";
  if (cleanPath === "/about") return "About";
  if (cleanPath === "/giving") return "Giving";
  if (cleanPath === "/saved-by-grace") return "Saved by Grace";
  if (cleanPath === "/Social") return "Social";
  if (cleanPath === "/Patriot") return "Patriot";
  if (cleanPath === "/cart") return "Cart";
  if (cleanPath === "/admin") return "Admin";
  if (cleanPath === "/admin/traffic") return "Admin Traffic";

  if (cleanPath.startsWith("/product/")) {
    const productId = cleanPath.split("/product/")[1]?.split("?")[0] || "";
    return PRODUCT_ID_TO_TITLE[productId] || `Product ${productId}`;
  }

  return cleanPath;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
        `${row.city_normalized || ""}|${row.region || ""}|${row.country || ""}|${
          row.map_precision || ""
        }`
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

        const pathCounts = {};
        for (const row of loc.rows) {
          const rawPath = row.path || "/";
          pathCounts[rawPath] = (pathCounts[rawPath] || 0) + 1;
        }

        const topPaths = Object.entries(pathCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        const topPathsHtml = topPaths.length
          ? `<ul style="margin:8px 0 0 18px; padding:0;">
              ${topPaths
                .map(([path, count]) => {
                  const label = escapeHtml(formatPathLabel(path));
                  return `<li><strong>${label}</strong> (${count})</li>`;
                })
                .join("")}
            </ul>`
          : "<div>No path data</div>";

        const recentVisitsHtml = loc.rows
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map((row) => {
            const when = new Date(row.created_at).toLocaleString();
            return `<div style="margin-top:4px;">${escapeHtml(
              formatPathLabel(row.path || "/")
            )} · ${escapeHtml(when)}</div>`;
          })
          .join("");

        marker.bindPopup(`
          <div style="min-width:260px; line-height:1.4;">
            <div style="font-weight:800; font-size:16px;">
              ${escapeHtml(loc.city)}${loc.region ? `, ${escapeHtml(loc.region)}` : ""}
            </div>
            <div style="opacity:0.75;">${escapeHtml(loc.country || "")}</div>

            <div style="margin-top:8px;"><strong>Total visits:</strong> ${loc.count}</div>
            <div><strong>Type:</strong> ${escapeHtml(loc.visitor_type)}</div>
            <div><strong>Map precision:</strong> ${escapeHtml(loc.precision)}</div>
            <div><strong>Latest visit:</strong> ${escapeHtml(
              new Date(loc.latestAt).toLocaleString()
            )}</div>

            <div style="margin-top:10px; font-weight:700;">Top pages/products</div>
            ${topPathsHtml}

            <div style="margin-top:10px; font-weight:700;">Recent activity</div>
            ${recentVisitsHtml || "<div>No recent activity</div>"}
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
                {formatPathLabel(row.path || "/")} · {row.visitor_type || "visitor"}
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
