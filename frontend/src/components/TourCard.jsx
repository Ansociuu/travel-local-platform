"use client";
import { useState } from "react";
import { Heart, Moon, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";

export default function TourCard({ tour, isWishlist, toggleWishlist }) {
  const router = useRouter();
  const [currentImg, setCurrentImg] = useState(0);

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === tour.images.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? tour.images.length - 1 : prev - 1));
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
    <div className="glass-hover" style={{ ...glassCard, display: "flex", flexDirection: "column" }} onClick={() => router.push(`/tours/${tour.id}`)}>
      {/* Image Gallery */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img src={tour.images[currentImg]} alt={tour.name} className="card-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
        
        {/* Tags */}
        <span className="tag-badge" style={{ position: "absolute", top: "12px", right: "12px", background: tour.tagColor || "#0d9488", color: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", zIndex: 10 }}>
          {tour.tag || "BESTSELLER"}
        </span>

        {/* Wishlist Button */}
        <button 
          className="wishlist-btn" 
          onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(tour.id); }} 
          style={{ position: "absolute", top: "12px", left: "12px", width: "32px", height: "32px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 10 }}>
          <Heart size={14} fill={isWishlist ? "#ef4444" : "transparent"} color={isWishlist ? "#ef4444" : "#64748b"} />
        </button>

        {/* Duration Badge */}
        <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 10 }}>
          <Moon size={14} color="#d97706" /> {tour.durationDays} Ngày {tour.durationNights > 0 ? `${tour.durationNights} Đêm` : ''}
        </div>

        {/* Carousel Controls */}
        {tour.images.length > 1 && (
          <>
            <button 
              onClick={prevImg}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, opacity: 0, transition: "opacity 0.2s" }}
              className="carousel-btn"
            >
              <ChevronLeft size={16} color="#0f172a" />
            </button>
            <button 
              onClick={nextImg}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, opacity: 0, transition: "opacity 0.2s" }}
              className="carousel-btn"
            >
              <ChevronRight size={16} color="#0f172a" />
            </button>
            
            {/* Dots */}
            <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "4px", zIndex: 10 }}>
              {tour.images.map((_, idx) => (
                <div key={idx} style={{ width: idx === currentImg ? "6px" : "4px", height: idx === currentImg ? "6px" : "4px", borderRadius: "50%", background: idx === currentImg ? "#fff" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }} />
              ))}
            </div>
            
            <style>{`
              .glass-hover:hover .carousel-btn {
                opacity: 0.8 !important;
              }
              .carousel-btn:hover {
                opacity: 1 !important;
                background: #fff !important;
              }
            `}</style>
          </>
        )}
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
          <MapPin size={14} color="#0d9488" /> {tour.location}
        </div>
        
        <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px", color: "#0f172a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
          {tour.name}
        </h3>
        
        {/* Tiện ích nổi bật */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg> Xe đưa đón
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> Bữa ăn
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 15h8"/></svg> HDV
          </span>
        </div>
        
        <StarRating rating={tour.rating || 0} />
        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "16px", fontWeight: 500 }}>
          {(tour.reviewCount || 0).toLocaleString()} đánh giá
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#0d9488", letterSpacing: "-0.5px" }}>₫{Number(tour.basePrice).toLocaleString('en-US')}</span>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>/ người</span>
          </div>
          <button style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.2)", color: "#0d9488", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }} onMouseEnter={e => { e.target.style.background = "#0d9488"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = "rgba(13,148,136,0.1)"; e.target.style.color = "#0d9488"; }}>Đặt ngay</button>
        </div>
      </div>
    </div>
  );
}
