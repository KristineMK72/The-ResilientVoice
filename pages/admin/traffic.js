const grouped = groupVisits(rows);

grouped.forEach((place) => {
  const marker = L.circleMarker([place.latitude, place.longitude], {
    radius: Math.min(8 + place.count, 18),
  });

  marker.bindPopup(`
    <div>
      <strong>${place.city || "Unknown"}, ${place.region || ""}</strong><br/>
      Visits: ${place.count}<br/>
      Latest: ${new Date(place.latest).toLocaleString()}
    </div>
  `);

  marker.addTo(markersLayerRef.current);
});
