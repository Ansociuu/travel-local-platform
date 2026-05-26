"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";
import { toursApi } from "@/lib/api";
import { Heart, MapPin, Moon } from "lucide-react";

const regionFilters = [
  { key: "all", label: "Tất cả" },
  { key: "bac", label: "Miền Bắc" },
  { key: "trung", label: "Miền Trung" },
  { key: "nam", label: "Miền Nam" },
];

const regionOf = (location = "") => {
  if (["Hà Giang", "Sapa", "Hạ Long", "Cát Bà", "Ninh Bình", "Tà Xùa"].some((key) => location.includes(key))) return "bac";
  if (["Đà Nẵng", "Hội An", "Huế", "Đà Lạt", "Quảng Nam"].some((key) => location.includes(key))) return "trung";
  if (["Cần Thơ", "Sài Gòn", "Phú Quốc", "Mekong"].some((key) => location.includes(key))) return "nam";
  return "all";
};

export default function Destinations() {
  const router = useRouter();
  const [regionFilter, setRegionFilter] = useState("all");
  const [visibleCards, setVisibleCards] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [destinations, setDestinations] = useState([]);
  const cardRefs = useRef({});

  const filteredDestinations = regionFilter === "all"
    ? destinations
    : destinations.filter(d => d.region === regionFilter);

  useEffect(() => {
    toursApi.getAll()
      .then((data) => {
        setDestinations(data.slice(0, 8).map((tour, index) => ({
          id: tour.id,
          name: tour.name,
          country: tour.location,
          region: regionOf(tour.location),
          price: Number(tour.basePrice || 0).toLocaleString("vi-VN"),
          nights: tour.durationNights || Math.max(0, (tour.durationDays || 1) - 1),
          rating: tour.rating || 0,
          reviews: tour.reviewCount || 0,
          tag: ["Bestseller", "Hot", "New", "Luxury"][index % 4],
          img: Array.isArray(tour.images) && tour.images.length ? tour.images[0] : "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80",
        })));
      })
      .catch(() => setDestinations([]));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisibleCards(p => ({ ...p, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(cardRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filteredDestinations]);

  const toggleWishlist = (id) => setWishlist(p => ({ ...p, [id]: !p[id] }));

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
  };

  const tagColor = {
    Bestseller: "#0d9488", // Teal
    Hot: "#d97706", // Amber
    New: "#059669", // Emerald
    Luxury: "#b45309", // Gold
  };

  return (
    <section id="tours" className="section-pad" style={{ position: "relative", zIndex: 1, padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="dest-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>✦ TOUR NỔI BẬT</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "40px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", color: "#0f172a" }}>
              Hành trình được<br />
              <span style={{ color: "#d97706" }}>yêu thích nhất</span>
            </h2>
          </div>
          <button style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", color: "#475569", padding: "10px 24px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: "all 0.2s", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }} onMouseEnter={e => {e.target.style.background="#f8fafc"; e.target.style.color="#0f172a";}} onMouseLeave={e => {e.target.style.background="#ffffff"; e.target.style.color="#475569";}}>Xem tất cả →</button>
        </div>

        {/* Region filter */}
        <div className="region-scroll" style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "nowrap" }}>
          {regionFilters.map(f => (
            <button key={f.key} className="region-btn" onClick={() => setRegionFilter(f.key)} style={{ background: regionFilter === f.key ? "rgba(13,148,136,0.1)" : "#ffffff", border: regionFilter === f.key ? "1px solid rgba(13,148,136,0.3)" : "1px solid rgba(0,0,0,0.05)", color: regionFilter === f.key ? "#0d9488" : "#64748b", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>{f.label}</button>
          ))}
        </div>

        <div className="dest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
          {filteredDestinations.map((dest, i) => (
            <div
              key={dest.id}
              ref={el => cardRefs.current[`dest-${dest.id}`] = el}
              data-id={`dest-${dest.id}`}
              className={`card-reveal glass-hover ${visibleCards[`dest-${dest.id}`] ? "visible" : ""}`}
              style={{ ...glassCard, overflow: "hidden", cursor: "pointer", transitionDelay: `${i * 0.07}s` }}
              onClick={() => router.push(`/tours/${dest.id}`)}
            >
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <img src={dest.img} alt={dest.name} className="card-img" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
                <span className="tag-badge" style={{ position: "absolute", top: "16px", right: "16px", background: tagColor[dest.tag] || "#0d9488", color: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>{dest.tag}</span>
                {/* Wishlist */}
                <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(dest.id); }} style={{ position: "absolute", top: "12px", left: "12px", width: "36px", height: "36px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  <Heart size={16} fill={wishlist[dest.id] ? "#ef4444" : "transparent"} color={wishlist[dest.id] ? "#ef4444" : "#64748b"} />
                </button>
                <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  <Moon size={14} color="#d97706" /> {dest.nights} đêm
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                  <MapPin size={12} color="#0d9488" /> {dest.country}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px", color: "#0f172a" }}>{dest.name}</h3>
                <StarRating rating={dest.rating} />
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", marginBottom: "18px", fontWeight: 500 }}>{dest.reviews.toLocaleString()} đánh giá</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                  <div>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#0d9488" }}>₫{dest.price}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>/người</span>
                  </div>
                  <button style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.2)", color: "#0d9488", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.background = "#0d9488"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = "rgba(13,148,136,0.1)"; e.target.style.color = "#0d9488"; }}>Đặt ngay</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
            <MapPin size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <p style={{ fontWeight: 500 }}>Không có tour nào cho khu vực này.</p>
          </div>
        )}
      </div>
    </section>
  );
}
