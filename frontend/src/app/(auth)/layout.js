import Link from "next/link";
import { Plane } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-container" style={{ display: "flex", minHeight: "100vh", background: "#ffffff" }}>
      {/* Nửa trái: Visual */}
      <div className="auth-visual" style={{ flex: 1.2, position: "relative", display: "none", overflow: "hidden" }}>
        <img 
          src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1920&q=80" 
          alt="Travel visual" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }} />
        
        {/* Logo */}
        <div style={{ position: "absolute", top: "40px", left: "40px", display: "flex", alignItems: "center", gap: "12px", zIndex: 10 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0d9488, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(20,184,166,0.3)" }}>
            <Plane size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "20px", color: "#fff", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#14b8a6" }}>Viet</span>Journey
          </span>
        </div>

        {/* Message */}
        <div style={{ position: "absolute", bottom: "80px", left: "40px", right: "40px", zIndex: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", padding: "32px", color: "#fff" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              "Hành trình vạn dặm<br />bắt đầu từ một bước chân"
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.6 }}>
              Khám phá hàng ngàn điểm đến tuyệt đẹp, trải nghiệm dịch vụ nghỉ dưỡng cao cấp cùng VietJourney.
            </p>
          </div>
        </div>
      </div>

      {/* Nửa phải: Form */}
      <div className="auth-form-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px", background: "#ffffff", position: "relative" }}>
        {/* Nút quay lại dành cho màn hình nhỏ và lớn */}
        <Link href="/" className="auth-back-link">
          ← Quay lại trang chủ
        </Link>
        
        {/* Khu vực form hiển thị ở giữa */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "440px", width: "100%", margin: "0 auto", padding: "40px 0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
