"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Mail, RefreshCw, X } from "lucide-react";
import { authApi } from "@/lib/api";

const AUTH_SESSION_CHANGED = "auth-session-changed";
const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/callback",
];

export default function EmailVerificationNotice() {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATH_PREFIXES.some((path) => pathname?.startsWith(path));
  const [user, setUser] = useState(null);
  const [dismissedEmail, setDismissedEmail] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadUser = useCallback(async () => {
    if (isAuthPage) {
      setUser(null);
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (typeof parsedUser.isVerified === "undefined") {
        const freshUser = await authApi.getMe();
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
        return;
      }

      setUser(parsedUser);
    } catch {
      setUser(null);
    }
  }, [isAuthPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUser]);

  useEffect(() => {
    const handleSessionChange = () => loadUser();

    window.addEventListener("storage", handleSessionChange);
    window.addEventListener("focus", handleSessionChange);
    window.addEventListener(AUTH_SESSION_CHANGED, handleSessionChange);

    return () => {
      window.removeEventListener("storage", handleSessionChange);
      window.removeEventListener("focus", handleSessionChange);
      window.removeEventListener(AUTH_SESSION_CHANGED, handleSessionChange);
    };
  }, [loadUser]);

  const handleResendOtp = async () => {
    if (!user?.email) return;
    setIsSending(true);
    setExpanded(true);
    setError("");
    setMessage("");

    try {
      await authApi.resendOtp(user.email);
      setMessage("Mã xác thực mới đã được gửi tới email của bạn.");
    } catch (err) {
      setError(err.message || "Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!user?.email || otp.length < 6) return;

    setIsVerifying(true);
    setError("");
    setMessage("");

    try {
      const data = await authApi.verifyOtp(user.email, otp);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
      setUser(data.user);
      setOtp("");
      setExpanded(false);
    } catch (err) {
      setError(err.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user || user.isVerified !== false || dismissedEmail === user.email) {
    return null;
  }

  return (
    <div className="email-verify-notice" role="alert">
      <div className="email-verify-icon">
        <Mail size={20} />
      </div>

      <div className="email-verify-content">
        <div className="email-verify-title">Vui lòng xác thực email</div>
        <div className="email-verify-text">
          Tài khoản {user.email} vẫn đăng nhập được bình thường, nhưng bạn cần xác thực email để hoàn tất bảo mật tài khoản.
        </div>

        {expanded && (
          <form className="email-verify-form" onSubmit={handleVerifyOtp}>
            <input
              className="email-verify-input"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Nhập mã OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button type="submit" className="email-verify-primary" disabled={isVerifying || otp.length < 6}>
              {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Xác thực
            </button>
          </form>
        )}

        {message && <div className="email-verify-success">{message}</div>}
        {error && <div className="email-verify-error">{error}</div>}
      </div>

      <div className="email-verify-actions">
        <button type="button" className="email-verify-secondary" onClick={handleResendOtp} disabled={isSending}>
          {isSending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Gửi mã
        </button>
        <button
          type="button"
          className="email-verify-close"
          onClick={() => setDismissedEmail(user.email)}
          aria-label="Đóng thông báo xác thực email"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
