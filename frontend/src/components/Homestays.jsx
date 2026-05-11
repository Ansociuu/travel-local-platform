"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { homestays } from "../data/mockData";
import { Heart, MapPin, Bed, Bath, Users, Star } from "lucide-react";

export default function Homestays() {
  const router = useRouter();
  const [visibleCards, setVisibleCards] = useState({});
  const [wishlist, setWishlist] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisibleCards(p => ({ ...p, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(cardRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleWishlist = (id) => setWishlist(p => ({ ...p, [id]: !p[id] }));

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
  };

  return (
    <section id="homestay" className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0 40px 80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>✦ HOMESTAY CHỌN LỌC</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "40px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", color: "#0f172a" }}>
            Căn nhà thứ hai<br />
            <span style={{ color: "#d97706" }}>của bạn</span>
          </h2>
        </div>
        <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {homestays.map((h, i) => (
            <div key={h.id} ref={el => cardRefs.current[`home-${h.id}`] = el} data-id={`home-${h.id}`} className={`card-reveal glass-hover ${visibleCards[`home-${h.id}`] ? "visible" : ""}`} style={{ ...glassCard, overflow: "hidden", cursor: "pointer", transitionDelay: `${i * 0.1}s` }} onClick={() => router.push(`/homestays/${h.id}`)}>
              <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                <img src={h.img} alt={h.name} className="card-img" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
                <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  <Star size={14} color="#d97706" fill="#d97706" /> {h.rating}
                </div>
                <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(`h${h.id}`); }} style={{ position: "absolute", top: "12px", right: "12px", width: "36px", height: "36px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  <Heart size={16} fill={wishlist[`h${h.id}`] ? "#ef4444" : "transparent"} color={wishlist[`h${h.id}`] ? "#ef4444" : "#64748b"} />
                </button>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                  <MapPin size={12} color="#0d9488" /> {h.location}
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", color: "#0f172a" }}>{h.name}</h3>
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  {[
                    [<Bed size={14} color="#64748b" />, h.beds + " phòng ngủ"], 
                    [<Bath size={14} color="#64748b" />, h.baths + " WC"], 
                    [<Users size={14} color="#64748b" />, h.guests + " khách"]
                  ].map(([icon, text], j) => (
                    <span key={j} style={{ fontSize: "13px", color: "#475569", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>{icon} {text}</span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                  <div>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#d97706" }}>₫{h.price}</span>
                    <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>/{h.per}</span>
                  </div>
                  <button style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", padding: "8px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.background = "#d97706"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = "rgba(217,119,6,0.1)"; e.target.style.color = "#d97706"; }}>Chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
