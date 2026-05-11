"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Key, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.resetPassword(email, token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
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
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>Thành công!</h1>
            <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "0" }}>
              Mật khẩu của bạn đã được đặt lại thành công. Chúng tôi sẽ đưa bạn về trang đăng nhập ngay bây giờ...
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-1px" }}>Đặt lại mật khẩu</h1>
            <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: 1.6 }}>Vui lòng nhập mã OTP đã nhận qua email và mật khẩu mới của bạn.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Địa chỉ Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="auth-input"
                  style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Mã xác nhận (OTP)</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Key size={20} /></div>
                  <input
                    type="text"
                    placeholder="Nhập 6 chữ số"
                    className="auth-input"
                    style={{ paddingLeft: "48px", letterSpacing: "2px", fontWeight: 700 }}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Mật khẩu mới</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={20} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    className="auth-input"
                    style={{ paddingLeft: "48px", paddingRight: "48px" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Cập nhật mật khẩu"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
