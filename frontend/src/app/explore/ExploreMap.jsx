"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";

function FitMarkers({ markers }) {
  const map = useMap();
  useEffect(() => {
    const valid = markers.filter((item) => item.lat && item.lng);
    if (valid.length === 0) {
      map.setView([16.0544, 108.2022], 5);
      return;
    }
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(valid.map((item) => [item.lat, item.lng])), { padding: [50, 50] });
  }, [markers, map]);
  return null;
}

export default function ExploreMap({ markers = [], onSelect }) {
  return (
    <MapContainer center={[16.0544, 108.2022]} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%", minHeight: 420 }}>
      <FitMarkers markers={markers} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((item) => (
        <Marker key={`${item.type}-${item.id}`} position={[item.lat, item.lng]} eventHandlers={{ click: () => onSelect(item) }}>
          <Popup>
            <button onClick={() => onSelect(item)} style={{ width: 210, border: "none", background: "transparent", textAlign: "left", cursor: "pointer", padding: 0 }}>
              <img src={item.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=260&q=80"} alt="" style={{ width: "100%", height: 110, borderRadius: 8, objectFit: "cover", marginBottom: 8 }} />
              <strong style={{ display: "block", color: "#0f172a", marginBottom: 5 }}>{item.name}</strong>
              <span style={{ color: "#64748b", fontWeight: 700 }}>{item.type === "tour" ? "Tour" : "Homestay"}</span>
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
