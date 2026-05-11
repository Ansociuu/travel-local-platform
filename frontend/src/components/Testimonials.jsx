"use client";
import { useState, useEffect, useRef } from "react";
import { Quote, Star, User } from "lucide-react";

export default function Testimonials() {
  const [visibleCards, setVisibleCards] = useState({});
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

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
  };

  return (
    <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0 40px 80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "12px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>✦ CẢM NHẬN KHÁCH HÀNG</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.5px", color: "#0f172a" }}>
            Họ đã nói gì về <span style={{ color: "#d97706" }}>VietJourney?</span>
          </h2>
        </div>
        <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {[
            { name: "Nguyễn Minh Tuấn", loc: "Hà Nội", text: "Tour Hạ Long quá tuyệt vời! Guide nhiệt tình, dịch vụ 5 sao. Tôi đã book lần 3 rồi và chưa bao giờ thất vọng.", stars: 5 },
            { name: "Lê Thị Hoa", loc: "TP. Hồ Chí Minh", text: "Homestay Đà Lạt cực kỳ xinh xắn, sạch sẽ. Chủ nhà thân thiện, view núi tuyệt đẹp. Nhất định sẽ quay lại!", stars: 5 },
            { name: "Trần Quốc Bảo", loc: "Đà Nẵng", text: "Giá cả hợp lý, đặt tour dễ dàng trên app. Nhận voucher ưu đãi ngay lần đầu đăng ký. Rất recommend!", stars: 5 },
          ].map((t, i) => (
            <div key={i} ref={el => cardRefs.current[`testi-${i}`] = el} data-id={`testi-${i}`} className={`card-reveal ${visibleCards[`testi-${i}`] ? "visible" : ""}`} style={{ ...glassCard, padding: "32px", transitionDelay: `${i * 0.1}s`, boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
              <div style={{ marginBottom: "16px", color: "rgba(13,148,136,0.15)" }}>
                <Quote size={32} fill="currentColor" stroke="none" />
              </div>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, marginBottom: "24px", fontWeight: 500 }}>"{t.text}"</p>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(13,148,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={20} color="#0d9488" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{t.loc}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={12} fill="#f59e0b" color="#f59e0b" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
