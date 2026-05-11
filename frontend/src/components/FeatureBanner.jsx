import { ShieldCheck, CreditCard, HeadphonesIcon, Award } from "lucide-react";

export default function FeatureBanner() {
  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
  };

  return (
    <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0 40px 80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="feat-grid" style={{ ...glassCard, background: "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(255,255,255,0.9) 50%, rgba(217,119,6,0.1) 100%)", padding: "56px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", right: "-80px", top: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div>
            <div style={{ fontSize: "12px", color: "#d97706", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>✦ ƯU ĐÃI ĐẶC BIỆT</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "38px", fontWeight: 800, lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-0.5px", color: "#0f172a" }}>
              Đẳng cấp nghỉ dưỡng —<br />
              <span style={{ color: "#0d9488" }}>Tiết kiệm đến 35%</span>
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "32px", fontSize: "16px", fontWeight: 500 }}>Đặt trước 30 ngày để nhận ưu đãi tốt nhất. Áp dụng cho tất cả tour và homestay cao cấp trên toàn quốc.</p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button className="shimmer-btn" style={{ color: "#fff", padding: "14px 32px", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontWeight: 700, border: "none", boxShadow: "0 4px 20px rgba(13,148,136,0.3)" }}>Khám phá ưu đãi</button>
              <button style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", color: "#0f172a", padding: "14px 32px", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontFamily: "'Inter', sans-serif", fontWeight: 700, transition: "all 0.2s", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }} onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }} onMouseLeave={e => { e.target.style.background = "#f8fafc"; e.target.style.borderColor = "rgba(0,0,0,0.05)"; }}>Tìm hiểu thêm</button>
            </div>
          </div>
          <div className="feat-feat-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              [<ShieldCheck size={28} color="#0d9488" strokeWidth={1.5} />, "Hoàn tiền 100%", "Hủy trước 48h"], 
              [<CreditCard size={28} color="#0d9488" strokeWidth={1.5} />, "Thanh toán linh hoạt", "Trả góp 0%"], 
              [<HeadphonesIcon size={28} color="#0d9488" strokeWidth={1.5} />, "Hỗ trợ 24/7", "Tư vấn cá nhân"], 
              [<Award size={28} color="#0d9488" strokeWidth={1.5} />, "Đảm bảo giá tốt", "Uy tín hàng đầu"]
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(0,0,0,0.03)", transition: "all 0.3s", cursor: "default", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ marginBottom: "12px", background: "rgba(13,148,136,0.1)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
