// /pages/admin/traffic.js
import { useEffect, useRef, useState } from "react";
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

      rows.forEach((row) => {
        const color = row.visitor_type === "buyer" ? "red" : "blue";

        const marker = L.circleMarker([row.latitude, row.longitude], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        });

        marker.bindPopup(`
          <div style="min-width:220px">
            <div><strong>${row.city || "Unknown"}, ${row.region || ""}</strong></div>
            <div>${row.country || ""}</div>
            <div style="margin-top:6px"><strong>Path:</strong> ${row.path || "/"}</div>
            <div><strong>Type:</strong> ${row.visitor_type || "visitor"}</div>
            <div><strong>At:</strong> ${new Date(row.created_at).toLocaleString()}</div>
          </div>
        `);

        marker.addTo(markersLayerRef.current);
      });
    }

    drawMap();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin" style={{ color: "#fff", textDecoration: "underline" }}>
          ← Back to admin
        </Link>
      </div>

      <h1 style={{ color: "#fff", marginBottom: 8 }}>Traffic Map</h1>
      <p style={{ color: "rgba(255,255,255,0.82)", marginTop: 0 }}>
        Blue pins are visitors. Red pins will be buyers once checkout tracking is added.
      </p>

      {loading ? (
        <p style={{ color: "#fff" }}>Loading map...</p>
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
    </div>
  );
}
