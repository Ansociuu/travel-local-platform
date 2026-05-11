"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to home or intended page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Chào mừng trở lại!
        </h1>
        <p style={{ color: "#64748b", fontSize: "15px", fontWeight: 500 }}>
          Đăng nhập để quản lý đặt phòng và nhận các ưu đãi dành riêng cho bạn.
        </p>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }} onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#ef4444", fontSize: "14px", fontWeight: 600, border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

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
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Mật khẩu
            <Link href="/forgot-password" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>Quên mật khẩu?</Link>
          </label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={20} /></div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Nhập mật khẩu" 
              className="auth-input" 
              style={{ paddingLeft: "48px", paddingRight: "48px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <button 
          type="submit" 
          disabled={isLoading}
          className="shimmer-btn" 
          style={{ 
            width: "100%", 
            padding: "16px", 
            borderRadius: "12px", 
            border: "none", 
            fontSize: "16px", 
            fontWeight: 700, 
            cursor: isLoading ? "not-allowed" : "pointer", 
            marginTop: "8px", 
            boxShadow: "0 4px 20px rgba(13,148,136,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            opacity: isLoading ? 0.8 : 1
          }}
        >
          {isLoading && <Loader2 size={20} className="animate-spin" />}
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div style={{ position: "relative", textAlign: "center", marginBottom: "24px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid rgba(0,0,0,0.1)" }}></div>
        <span style={{ position: "relative", background: "#ffffff", padding: "0 16px", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>Hoặc tiếp tục với</span>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/google`}
          className="auth-social-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
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
        Chưa có tài khoản? <Link href="/register" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }}>Đăng ký ngay</Link>
      </div>
    </>
  );
}
