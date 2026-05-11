"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import L from "leaflet";

function MapBounds({ homestays }) {
  const map = useMap();
  
  useEffect(() => {
    const validHomestays = homestays.filter(h => h.lat && h.lng);
    if (validHomestays.length === 0) return;
    
    if (validHomestays.length === 1) {
      map.setView([validHomestays[0].lat, validHomestays[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(validHomestays.map(h => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, homestays]);
  
  return null;
}

export default function MapComponent({ homestays }) {
  const router = useRouter();

  // Vietnam center
  const center = [16.0544, 108.2022];
  const zoom = 5;

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "24px", overflow: "hidden", position: "relative", zIndex: 1 }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <MapBounds homestays={homestays} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {homestays.map((hotel) => {
          if (!hotel.lat || !hotel.lng) return null;
          return (
            <Marker key={hotel.id} position={[hotel.lat, hotel.lng]}>
              <Popup>
                <div style={{ cursor: "pointer", width: "200px" }} onClick={() => router.push(`/homestays/${hotel.id}`)}>
                  <div style={{ height: "120px", width: "100%", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                    <img src={hotel.images?.[0]} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{hotel.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                    <Star size={12} fill="#d97706" color="#d97706" /> {hotel.rating}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#d97706" }}>
                    ₫{Number(hotel.price).toLocaleString('en-US')} <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>/ đêm</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
