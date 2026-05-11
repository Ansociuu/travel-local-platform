"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setIsSubmitted(false);
      e.target.reset(); // Reset form
    }, 3000);
  };

  const inputStyle = {
    width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "#ffffff", outline: "none", fontSize: "15px", color: "#0f172a", fontFamily: "'Inter', sans-serif", transition: "border 0.2s"
  };

  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" };

  return (
    <div style={{ background: "#ffffff" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 20px 80px" }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ fontSize: "14px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>HỖ TRỢ KHÁCH HÀNG 24/7</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "48px", fontWeight: 800, color: "#0f172a", marginBottom: "24px", letterSpacing: "-1.5px" }}>
            Kết nối với VietJourney
          </h1>
          <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Bạn có câu hỏi hoặc cần hỗ trợ đặt tour? Hãy gửi tin nhắn cho chúng tôi. Đội ngũ chuyên gia du lịch luôn sẵn sàng đồng hành cùng bạn.
          </p>
        </div>

        {/* 2-COL LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }} className="tours-layout-grid">
          
          {/* LEFT: FORM */}
          <div style={{ background: "#f8fafc", padding: "40px", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Gửi lời nhắn</h2>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "32px" }}>Chúng tôi sẽ phản hồi bạn trong vòng 2 giờ làm việc.</p>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Họ và tên</label>
                  <input type="text" placeholder="Nguyễn Văn A" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input type="tel" placeholder="0912 345 678" style={inputStyle} required />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Email liên hệ</label>
                <input type="email" placeholder="example@email.com" style={inputStyle} required />
              </div>

              <div>
                <label style={labelStyle}>Chủ đề</label>
                <select style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none" }} required defaultValue="">
                  <option value="" disabled>Chọn một chủ đề...</option>
                  <option value="tour">Tư vấn đặt Tour</option>
                  <option value="homestay">Hỗ trợ đặt Homestay</option>
                  <option value="feedback">Góp ý dịch vụ</option>
                  <option value="other">Vấn đề khác</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Nội dung lời nhắn</label>
                <textarea rows={5} placeholder="Bạn cần chúng tôi hỗ trợ gì?" style={{ ...inputStyle, resize: "vertical" }} required></textarea>
              </div>

              <button type="submit" className="shimmer-btn" style={{ width: "100%", padding: "18px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", boxShadow: "0 10px 30px rgba(13,148,136,0.3)", marginTop: "8px" }}>
                <Send size={18} /> Gửi tin nhắn
              </button>
            </form>

            {/* ALERT SUCCESS */}
            {isSubmitted && (
              <div style={{ marginTop: "24px", padding: "16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", color: "#059669", animation: "fadeIn 0.3s ease-out" }}>
                <CheckCircle2 size={24} />
                <span style={{ fontSize: "15px", fontWeight: 600 }}>Cảm ơn bạn! Lời nhắn đã được gửi thành công.</span>
              </div>
            )}
          </div>

          {/* RIGHT: INFO & MAP */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* INFO BLOCKS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(13,148,136,0.1)", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Trụ sở chính</h3>
                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>Tầng 15, Tòa nhà Landmark 81<br />Bình Thạnh, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(13,148,136,0.1)", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Giờ làm việc</h3>
                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>Thứ 2 - Thứ 6: 08:00 - 18:00<br />Thứ 7: 08:00 - 12:00</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(13,148,136,0.1)", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Hotline (24/7)</h3>
                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, fontWeight: 600 }}>1900 1000<br />0912 345 678</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(13,148,136,0.1)", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Email hỗ trợ</h3>
                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>support@vietjourney.com<br />booking@vietjourney.com</p>
                </div>
              </div>
            </div>

            {/* MAP IFRAME */}
            <div style={{ width: "100%", height: "350px", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.167265538965!2d106.71937401533423!3d10.79848529230588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c2f8f30911%3A0x36ac5073f8c91acd!2sLandmark%2081!5e0!3m2!1svi!2s!4v1655866184920!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
