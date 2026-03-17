import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function TrafficMapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [views, setViews] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      setViews(data || []);
    }

    load();
  }, []);

  useEffect(() => {
    if (!views.length) return;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([46.3, -94.2], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        }).addTo(mapInstance.current);
      }

      views.forEach((row) => {
        if (!row.city) return;

        // Quick fallback coords for MN (you later replace with real geocode)
        let lat = 46.3;
        let lon = -94.2;

        // SUPER BASIC city mapping (we'll upgrade this)
        if (row.city === "Brainerd") {
          lat = 46.358;
          lon = -94.200;
        }

        const color = row.visitor_type === "buyer" ? "red" : "blue";

        const marker = L.circleMarker([lat, lon], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.7,
        }).addTo(mapInstance.current);

        marker.bindPopup(`
          <b>${row.city}, ${row.region}</b><br/>
          ${row.path}<br/>
          ${new Date(row.created_at).toLocaleString()}
        `);
      });
    }

    initMap();
  }, [views]);

  return (
    <div style={{ padding: 20 }}>
      <Link href="/admin" style={{ color: "white" }}>
        ← Back
      </Link>

      <h1 style={{ color: "white" }}>Traffic Map</h1>

      <div
        ref={mapRef}
        style={{
          height: "600px",
          borderRadius: 12,
          overflow: "hidden",
          marginTop: 20,
        }}
      />
    </div>
  );
}
