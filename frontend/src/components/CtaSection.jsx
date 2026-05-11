"use client";
import { useState } from "react";
import { PlaneTakeoff, Mail, Gift, CheckCircle } from "lucide-react";

export default function CtaSection() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0 40px 100px" }}>
      <div className="cta-pad" style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", ...glassCard, padding: "64px", background: "linear-gradient(135deg, rgba(20,184,166,0.08) 0%, #ffffff 50%, rgba(217,119,6,0.08) 100%)", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", animation: "float 3s ease-in-out infinite" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(13,148,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlaneTakeoff size={32} color="#0d9488" />
          </div>
        </div>

        <h2 className="cta-h2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "38px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.5px", color: "#0f172a" }}>
          Sẵn sàng cho<br />
          <span style={{ color: "#d97706" }}>chuyến đi tiếp theo?</span>
        </h2>
        <p style={{ color: "#475569", fontSize: "16px", marginBottom: "36px", lineHeight: 1.7, fontWeight: 500 }}>
          Đăng ký ngay hôm nay và nhận ngay voucher <strong style={{ color: "#0d9488" }}>200.000₫</strong> cho chuyến đầu tiên.
        </p>

        {/* Newsletter input */}
        {!emailSent ? (
          <div style={{ display: "flex", gap: "8px", maxWidth: "480px", margin: "0 auto 32px", position: "relative" }}>
            <div style={{ flex: 1, background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
              <Mail size={18} color="#94a3b8" />
              <input placeholder="Nhập email của bạn..." value={email} onChange={e => setEmail(e.target.value)} style={{ fontSize: "15px", color: "#0f172a", fontWeight: 500 }} onKeyDown={e => e.key === "Enter" && email && setEmailSent(true)} />
            </div>
            <button onClick={() => email && setEmailSent(true)} className="shimmer-btn" style={{ color: "#fff", padding: "14px 24px", borderRadius: "14px", cursor: "pointer", fontSize: "15px", fontWeight: 700, border: "none", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(13,148,136,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Gift size={16} /> Nhận ưu đãi
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: "480px", margin: "0 auto 32px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "16px", animation: "popIn 0.4s ease", justifyContent: "center" }}>
            <CheckCircle size={28} color="#059669" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#059669" }}>Đăng ký thành công!</div>
              <div style={{ fontSize: "13px", color: "#475569", fontWeight: 500 }}>Voucher đã được gửi đến {email}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", color: "#0f172a", padding: "14px 36px", borderRadius: "14px", cursor: "pointer", fontSize: "15px", fontFamily: "'Inter', sans-serif", fontWeight: 700, transition: "all 0.2s" }} onClick={() => scrollTo("tours")} onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }} onMouseLeave={e => { e.target.style.background = "#f8fafc"; e.target.style.borderColor = "rgba(0,0,0,0.05)"; }}>
            Xem tất cả tour →
          </button>
        </div>
      </div>
    </section>
  );
}
