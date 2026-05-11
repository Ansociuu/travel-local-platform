"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      // Redirect to reset password after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "450px",
        background: "#ffffff",
        padding: "48px",
        borderRadius: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)"
      }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#64748b",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "32px"
          }}
        >
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>

        {isSuccess ? (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <CheckCircle2 size={40} color="#10b981" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>Kiểm tra Email</h1>
            <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "0" }}>
              Mã xác nhận đã được gửi tới <b>{email}</b>. Chúng tôi sẽ chuyển hướng bạn tới trang đặt lại mật khẩu trong giây lát...
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-1px" }}>Quên mật khẩu?</h1>
            <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: 1.6 }}>Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi mã khôi phục cho bạn.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Địa chỉ Email</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Mail size={20} /></div>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="auth-input"
                    style={{ paddingLeft: "48px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fee2e2",
                  color: "#ef4444",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 500
                }}>
                  {error}
                </div>
              )}

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
                  gap: "8px"
                }}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Gửi mã khôi phục"}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .auth-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 15px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .auth-input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
