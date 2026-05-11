"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import LegalModal from "@/components/LegalModal";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Modal states
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setIsLoading(true);
    setError("");

    try {
      await authApi.register({ name, email, password });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authApi.verifyOtp(email, otp);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setIsVerified(true);
      
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          background: "#dcfce7", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 24px",
          color: "#22c55e"
        }}>
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>Xác thực thành công!</h2>
        <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "24px" }}>Chào mừng bạn gia nhập <b>VietJourney</b>. Đang chuyển hướng bạn tới trang chủ...</p>
        <div className="shimmer-btn" style={{ display: "inline-block", padding: "12px 32px", borderRadius: "10px", fontSize: "14px", fontWeight: 700 }}>Vui lòng đợi giây lát</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          color: "#22c55e"
        }}>
          <Mail size={32} />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>Xác thực Email</h2>
        <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "24px" }}>
          Chúng tôi đã gửi mã OTP gồm 6 chữ số tới <br /><b style={{ color: "#0f172a" }}>{email}</b>
        </p>

        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#ef4444", fontSize: "14px", fontWeight: 600 }}>
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Nhập mã 6 chữ số"
            className="auth-input"
            style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: 800 }}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="shimmer-btn"
            style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
          >
            {isLoading ? "Đang xác thực..." : "Xác nhận & Đăng nhập"}
          </button>

          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Không nhận được mã? <button type="button" style={{ background: "none", border: "none", color: "#0d9488", fontWeight: 700, cursor: "pointer" }}>Gửi lại mã</button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Bắt đầu hành trình mới
        </h1>
        <p style={{ color: "#64748b", fontSize: "15px", fontWeight: 500 }}>
          Tạo tài khoản ngay hôm nay để nhận voucher giảm 200.000₫ cho chuyến đi đầu tiên.
        </p>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }} onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#ef4444", fontSize: "14px", fontWeight: 600, border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Họ và tên</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><User size={20} /></div>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="auth-input"
              style={{ paddingLeft: "48px" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Email</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Mail size={20} /></div>
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              className="auth-input"
              style={{ paddingLeft: "48px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Mật khẩu</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={20} /></div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
              className="auth-input"
              style={{ paddingLeft: "48px", paddingRight: "48px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <div
              style={{ position: "absolute", top: "50%", right: "16px", transform: "translateY(-50%)", color: "#94a3b8", cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={{ marginTop: "4px", width: "16px", height: "16px", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", cursor: "pointer" }}>
            Tôi đồng ý với{" "}
            <span 
              onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }}
              style={{ color: "#0d9488", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
            >
              Điều khoản dịch vụ
            </span>{" "}
            và{" "}
            <span 
              onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}
              style={{ color: "#0d9488", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
            >
              Chính sách bảo mật
            </span>{" "}
            của VietJourney.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !termsAccepted}
          className="shimmer-btn"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            fontSize: "16px",
            fontWeight: 700,
            cursor: (!termsAccepted || isLoading) ? "not-allowed" : "pointer",
            marginTop: "8px",
            boxShadow: "0 4px 20px rgba(13,148,136,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            opacity: (!termsAccepted || isLoading) ? 0.7 : 1
          }}
        >
          {isLoading && <Loader2 size={20} className="animate-spin" />}
          {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
        </button>
      </form>

      <div style={{ position: "relative", textAlign: "center", marginBottom: "24px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid rgba(0,0,0,0.1)" }}></div>
        <span style={{ position: "relative", background: "#ffffff", padding: "0 16px", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>Hoặc đăng ký bằng</span>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/google`}
          className="auth-social-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
          Google
        </button>
        <button 
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/facebook`}
          className="auth-social-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
        Đã có tài khoản? <Link href="/login" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }}>Đăng nhập</Link>
      </div>

      {/* Modals */}
      <LegalModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        title="Điều khoản dịch vụ"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p>Chào mừng bạn đến với VietJourney. Bằng việc đăng ký tài khoản, bạn đồng ý với các điều khoản sau:</p>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>1. Tài khoản</h4>
            <p>Bạn chịu trách nhiệm bảo mật mật khẩu và các thông tin đăng nhập cá nhân.</p>
          </section>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>2. Dịch vụ</h4>
            <p>VietJourney cung cấp nền tảng đặt phòng Homestay và Tour trải nghiệm văn hóa.</p>
          </section>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>3. Hủy phòng</h4>
            <p>Mỗi dịch vụ sẽ có chính sách hoàn tiền riêng, vui lòng kiểm tra kỹ trước khi thanh toán.</p>
          </section>
        </div>
      </LegalModal>

      <LegalModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
        title="Chính sách bảo mật"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p>Chúng tôi tôn trọng quyền riêng tư của bạn. Dữ liệu của bạn được bảo vệ như sau:</p>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>1. Dữ liệu thu thập</h4>
            <p>Tên, Email, và ảnh đại diện khi bạn đăng nhập qua Google/Facebook.</p>
          </section>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>2. Sử dụng dữ liệu</h4>
            <p>Chúng tôi chỉ sử dụng thông tin để quản lý đơn đặt phòng và liên hệ khi cần thiết.</p>
          </section>
          <section>
            <h4 style={{ color: "#1e293b", marginBottom: "8px" }}>3. Bảo mật</h4>
            <p>Dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống máy chủ hiện đại.</p>
          </section>
        </div>
      </LegalModal>
    </>
  );
}
