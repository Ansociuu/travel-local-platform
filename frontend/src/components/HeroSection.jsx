"use client";
import { useState, useEffect } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { stats } from "../data/mockData";
import { Map, MapPin, Calendar, Clock, Users, Compass, Smile, Home, Star } from "lucide-react";

const bgImages = [
  "https://a.cdn-hotels.com/gdcs/production77/d1902/21336448-81d8-4643-a1b9-1545d08172de.jpg",
  "https://khoinguonsangtao.vn/wp-content/uploads/2022/11/hinh-anh-sapa.jpg",
  "https://www.agoda.com/wp-content/uploads/2024/01/Featured-image-Hoi-An-ancient-town.jpg",
  "https://static.vinwonders.com/production/kinh-nghiem-du-lich-phu-quoc-banner.jpg",
];
const textOptions = ["Hạ Long", "Sapa", "Hội An", "Phú Quốc"];
const suggestions = [
  { text: "Vịnh Hạ Long", icon: <Compass size={16} color="#0d9488" /> },
  { text: "Sapa mờ sương", icon: <Compass size={16} color="#0d9488" /> },
  { text: "Phố cổ Hội An", icon: <Compass size={16} color="#0d9488" /> }
];

const StatIcon = ({ name }) => {
  const props = { size: 28, color: "#0d9488", strokeWidth: 2 };
  if (name === "Map") return <Map {...props} />;
  if (name === "Smile") return <Smile {...props} />;
  if (name === "Home") return <Home {...props} />;
  if (name === "Star") return <Star {...props} />;
  return null;
};

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("tour");
  const [searchFocus, setSearchFocus] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [destQuery, setDestQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(p => (p + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const glassCard = {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
  };

  return (
    <section id="hero" className="hero-section" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", textAlign: "center", overflow: "hidden" }}>
      {/* BACKGROUND SLIDESHOW */}
      <div style={{ position: "absolute", inset: 0, zIndex: -2 }}>
        {bgImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: bgIndex === i ? 1 : 0, transition: "opacity 1.5s ease-in-out", transform: bgIndex === i ? "scale(1.05)" : "scale(1)", transitionProperty: "opacity, transform", transitionDuration: "1.5s, 6s" }}
          />
        ))}
      </div>

      {/* DARK OVERLAY - To keep white text readable on bright images */}
      <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 60%, #f8fafc 100%)" }} />

      <div className="hero-text" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "28px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#14b8a6", display: "inline-block", boxShadow: "0 0 10px #14b8a6", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        Nền tảng du lịch cao cấp
      </div>

      <h1 className="hero-text-2 hero-h1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "24px", maxWidth: "900px" }}>
        <span style={{ color: "#fff" }}>Khám phá </span>
        <span key={bgIndex} style={{ display: "inline-block", color: "#fbbf24", animation: "slideDown 0.5s ease", textShadow: "0 4px 20px rgba(251,191,36,0.3)" }}>
          {textOptions[bgIndex]}
        </span>
        <br />
        <span style={{ color: "#fff" }}>theo cách riêng của bạn</span>
      </h1>

      <p className="hero-text-3" style={{ fontSize: "17px", color: "rgba(255,255,255,0.9)", maxWidth: "560px", lineHeight: 1.7, marginBottom: "48px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
        Trải nghiệm những điểm đến tuyệt vời nhất với dịch vụ chuẩn 5 sao, mức giá minh bạch và hỗ trợ tận tâm 24/7.
      </p>

      {/* SEARCH BOX */}
      <div className="hero-search" style={{ width: "100%", maxWidth: "860px", marginBottom: "60px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", justifyContent: "center" }}>
          {[["tour", "Tour du lịch", <Map size={16} />], ["homestay", "Homestay", <Home size={16} />]].map(([key, label, icon]) => (
            <button key={key} className="tab-btn" onClick={() => setActiveTab(key)} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, background: activeTab === key ? "#fff" : "rgba(255,255,255,0.2)", backdropFilter: activeTab === key ? "none" : "blur(10px)", border: activeTab === key ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.3)", color: activeTab === key ? "#0f172a" : "#fff", display: "flex", alignItems: "center", gap: "8px", boxShadow: activeTab === key ? "0 4px 15px rgba(0,0,0,0.1)" : "none" }}>
              <span style={{ color: activeTab === key ? "#0d9488" : "inherit" }}>{icon}</span> {label}
            </button>
          ))}
        </div>

        <div style={{ ...glassCard, padding: "8px", boxShadow: searchFocus ? "0 20px 60px rgba(0,0,0,0.1)" : "0 10px 40px rgba(0,0,0,0.08)", transition: "box-shadow 0.3s ease" }}>
          <div className="search-grid" style={{ display: "grid", gridTemplateColumns: activeTab === "tour" ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr auto", gap: "6px" }}>

            <div style={{ position: "relative", background: "#f1f5f9", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                <MapPin size={12} /> Điểm đến
              </div>
              <input
                placeholder={`VD: ${textOptions[(bgIndex + 1) % textOptions.length]}...`}
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}
              />

              {searchFocus && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "12px", background: "#ffffff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", padding: "12px", zIndex: 20, textAlign: "left", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "slideDown 0.2s ease" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", fontWeight: 700, paddingLeft: "8px" }}>GỢI Ý PHỔ BIẾN</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        style={{ padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}
                        onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                        onMouseDown={(e) => { e.preventDefault(); setDestQuery(item.text); setSearchFocus(false); }}
                      >
                        {item.icon} {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#f1f5f9", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                <Calendar size={12} /> {activeTab === "tour" ? "Ngày đi" : "Nhận phòng"}
              </div>
              <input type="date" style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }} />
            </div>

            {activeTab === "tour" ? (
              <div style={{ background: "#f1f5f9", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                  <Clock size={12} /> Thời gian
                </div>
                <select style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                  <option>2 - 3 ngày</option><option>4 - 5 ngày</option><option>1 tuần</option><option>2 tuần+</option>
                </select>
              </div>
            ) : (
              <div style={{ background: "#f1f5f9", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                  <Users size={12} /> Số khách
                </div>
                <select style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                  <option>1 khách</option><option>2 khách</option><option>3 - 4 khách</option><option>5 - 6 khách</option><option>7+ khách</option>
                </select>
              </div>
            )}
            <button className="shimmer-btn search-btn-wrap" style={{ borderRadius: "14px", padding: "0 32px", color: "#fff", fontWeight: 800, fontSize: "15px", cursor: "pointer", minWidth: "140px", boxShadow: "0 4px 15px rgba(13,148,136,0.3)" }}>
              Khám phá
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="hero-stats stats-row" style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", padding: "16px 28px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <StatIcon name={s.icon} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
