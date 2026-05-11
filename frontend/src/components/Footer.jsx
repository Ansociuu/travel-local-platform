import Link from "next/link";
import { Plane } from "lucide-react";

const Facebook = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const Twitter = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>);
const Instagram = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Youtube = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>);

export default function Footer() {
  return (
    <footer style={{ background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.05)", padding: "64px 40px 32px", color: "#475569" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #0d9488, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(20,184,166,0.2)" }}>
                <Plane size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "18px" }}>
                <span style={{ color: "#14b8a6" }}>Viet</span><span style={{ color: "#0f172a" }}>Journey</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, maxWidth: "280px", marginBottom: "20px" }}>Nền tảng đặt tour và homestay cao cấp hàng đầu Việt Nam. Trải nghiệm chân thực, dịch vụ tận tâm.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Tiếng Việt", "English"].map((l, i) => (
                <button key={i} style={{ background: i === 0 ? "rgba(20,184,166,0.1)" : "#f8fafc", border: `1px solid ${i === 0 ? "rgba(20,184,166,0.2)" : "rgba(0,0,0,0.05)"}`, color: i === 0 ? "#0d9488" : "#64748b", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
                  onMouseEnter={e => { if (i !== 0) { e.target.style.background = "#f1f5f9"; } }}
                  onMouseLeave={e => { if (i !== 0) { e.target.style.background = "#f8fafc"; } }}
                >{l}</button>
              ))}
            </div>
          </div>
          <div key="Khám phá">
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Khám phá</div>
            {["Tour miền Bắc", "Tour miền Trung", "Tour miền Nam", "Tour quốc tế"].map(link => (
              <a key={link} href="#" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#0d9488"}
                onMouseLeave={e => e.target.style.color = "#64748b"}
              >{link}</a>
            ))}
          </div>
          <div key="Dịch vụ">
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Dịch vụ</div>
            {["Homestay", "Khách sạn", "Vé máy bay", "Bảo hiểm du lịch"].map(link => (
              <a key={link} href="#" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#0d9488"}
                onMouseLeave={e => e.target.style.color = "#64748b"}
              >{link}</a>
            ))}
          </div>
          <div key="Hỗ trợ">
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hỗ trợ</div>
            <Link href="/" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px" }}>Trung tâm trợ giúp</Link>
            <Link href="/privacy" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px" }}>Chính sách hoàn tiền</Link>
            <Link href="/terms" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px" }}>Điều khoản dịch vụ</Link>
            <Link href="/privacy" style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: 500, textDecoration: "none", marginBottom: "12px" }}>Chính sách bảo mật</Link>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>© 2026 VietJourney. All rights reserved.</span>
          <div style={{ display: "flex", gap: "10px" }}>
            {[<Twitter size={16} key={1} />, <Facebook size={16} key={2} />, <Instagram size={16} key={3} />, <Youtube size={16} key={4} />].map((icon, i) => (
              <button key={i} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(20,184,166,0.1)"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.2)"; e.currentTarget.style.color = "#0d9488"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "#64748b"; }}
              >{icon}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
