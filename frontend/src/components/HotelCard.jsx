"use client";
import { useState } from "react";
import { Heart, Star, Users, Bed, Bath, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HotelCard({ hotel, isWishlist, toggleWishlist }) {
  const router = useRouter();
  const [currentImg, setCurrentImg] = useState(0);

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === hotel.images.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? hotel.images.length - 1 : prev - 1));
  };

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s"
  };

  return (
    <div className="glass-hover" style={{ ...glassCard, display: "flex", flexDirection: "column" }} onClick={() => router.push(`/homestays/${hotel.id}`)}>
      {/* Image Gallery */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img src={hotel.images[currentImg]} alt={hotel.name} className="card-img" />
        
        {/* Wishlist Button */}
        <button 
          className="wishlist-btn" 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(hotel.id); }} 
          style={{ position: "absolute", top: "16px", right: "16px", width: "40px", height: "40px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 10 }}>
          <Heart size={20} fill={isWishlist ? "#ef4444" : "transparent"} color={isWishlist ? "#ef4444" : "#64748b"} />
        </button>

        {/* Carousel Controls */}
        {hotel.images.length > 1 && (
          <>
            <button 
              onClick={prevImg}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, opacity: 0.8, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
            >
              <ChevronLeft size={18} color="#0f172a" />
            </button>
            <button 
              onClick={nextImg}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, opacity: 0.8, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
            >
              <ChevronRight size={18} color="#0f172a" />
            </button>
            
            {/* Dots */}
            <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
              {hotel.images.map((_, idx) => (
                <div key={idx} style={{ width: idx === currentImg ? "8px" : "6px", height: idx === currentImg ? "8px" : "6px", borderRadius: "50%", background: idx === currentImg ? "#fff" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }} />
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
          <MapPin size={14} color="#0d9488" /> {hotel.location}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>{hotel.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "15px", fontWeight: 700, color: "#0f172a", flexShrink: 0, paddingLeft: "8px", paddingTop: "2px" }}>
            <Star size={14} fill="#d97706" color="#d97706" /> {hotel.rating}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><Bed size={14} color="#64748b" /> {hotel.beds} giường</span>
          <span style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><Bath size={14} color="#64748b" /> {hotel.baths} WC</span>
          <span style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><Users size={14} color="#64748b" /> {hotel.guests} khách</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#d97706" }}>₫{Number(hotel.price).toLocaleString('en-US')}</span>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>/ đêm</span>
          </div>
          <button style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }} onMouseEnter={e => { e.target.style.background = "#d97706"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = "rgba(217,119,6,0.1)"; e.target.style.color = "#d97706"; }}>Chi tiết</button>
        </div>
      </div>
    </div>
  );
}
