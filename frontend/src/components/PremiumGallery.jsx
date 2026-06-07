"use client";

import { useMemo, useState } from "react";
import { Camera, Grid } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function PremiumGallery({ images = [], title = "Gallery" }) {
  const [index, setIndex] = useState(-1);
  const gallery = useMemo(() => {
    const fallback = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80";
    return Array.isArray(images) && images.length > 0 ? images : [fallback];
  }, [images]);

  const visible = [gallery[0], ...gallery.slice(1, 5)];

  return (
    <>
      <div className="mobile-gallery" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, height: 500, borderRadius: 24, overflow: "hidden", marginBottom: 48, position: "relative", background: "var(--bg-muted)" }}>
        <button className="mobile-gallery-main" onClick={() => setIndex(0)} style={{ width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "transparent" }}>
          <img src={visible[0]} alt={title} loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(1.03)" }} />
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
          {visible.slice(1, 5).map((src, idx) => (
            <button key={`${src}-${idx}`} onClick={() => setIndex(idx + 1)} style={{ position: "relative", border: "none", padding: 0, cursor: "pointer", background: "transparent", overflow: "hidden" }}>
              <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {idx === 3 && gallery.length > 5 && (
                <span style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                  +{gallery.length - 5}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setIndex(0)} style={{ position: "absolute", bottom: 24, right: 24, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "9px 15px", display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontWeight: 850, cursor: "pointer", boxShadow: "0 8px 24px rgba(15,23,42,0.16)" }}>
          <Grid size={16} /> Xem tất cả {gallery.length} ảnh
        </button>
        <span style={{ position: "absolute", left: 18, bottom: 18, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 999, background: "rgba(15,23,42,0.65)", color: "#fff", fontSize: 12, fontWeight: 900 }}>
          <Camera size={14} /> Virtual tour sắp ra mắt
        </span>
      </div>
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={Math.max(index, 0)}
        slides={gallery.map((src) => ({ src }))}
      />
    </>
  );
}
