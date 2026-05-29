"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Landmark, Copy, Check, Clock, ChevronLeft, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { paymentsApi } from "@/lib/api";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [pollingActive, setPollingActive] = useState(true);

  // 1. Fetch payment info
  useEffect(() => {
    if (!bookingId) {
      setError("Không tìm thấy mã đơn đặt chỗ.");
      setLoading(false);
      return;
    }

    const fetchPaymentInfo = async () => {
      try {
        const info = await paymentsApi.getSepayPaymentInfo(bookingId);
        setPaymentInfo(info);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không thể tải thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [bookingId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || error || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPollingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error, timeLeft]);

  // 3. Polling for payment status
  useEffect(() => {
    if (!bookingId || !pollingActive || loading || error) return;

    const pollInterval = setInterval(async () => {
      try {
        const statusData = await paymentsApi.getBookingStatus(bookingId);
        if (statusData.paymentStatus === "PAID" || statusData.status === "CONFIRMED") {
          clearInterval(pollInterval);
          setPollingActive(false);
          // Redirect to success page
          router.push(`/success?bookingId=${bookingId}`);
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ trạng thái đơn hàng:", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [bookingId, pollingActive, loading, error, router]);

  // Manual Check Button
  const handleManualCheck = async () => {
    if (!bookingId) return;
    try {
      const statusData = await paymentsApi.getBookingStatus(bookingId);
      if (statusData.paymentStatus === "PAID" || statusData.status === "CONFIRMED") {
        router.push(`/success?bookingId=${bookingId}`);
      } else {
        alert("Hệ thống chưa ghi nhận được chuyển khoản của bạn. Vui lòng đợi trong giây lát hoặc kiểm tra lại nội dung chuyển khoản.");
      }
    } catch (err) {
      alert("Đã xảy ra lỗi khi kiểm tra. Vui lòng thử lại sau.");
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Styled helper for detail lines
  const detailRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#64748b",
  };

  const valueStyle = {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const copyButtonStyle = (active) => ({
    background: active ? "rgba(16,185,129,0.1)" : "rgba(13,148,136,0.05)",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    color: active ? "#10b981" : "#0d9488",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s",
  });

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
        <RefreshCw size={40} className="animate-spin" color="#0d9488" style={{ animation: "spin 2s linear infinite" }} />
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 600 }}>Đang khởi tạo thông tin thanh toán VietQR...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", background: "#f8fafc" }}>
        <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "24px", borderRadius: "24px", textAlign: "center", maxWidth: "480px" }}>
          <AlertCircle size={48} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Không thể thanh toán</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.5, marginBottom: "20px" }}>{error}</p>
          <button onClick={() => router.push("/checkout")} style={{ background: "#ef4444", border: "none", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>
            Quay lại trang Đặt chỗ
          </button>
        </div>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* BACK NAVIGATION */}
      <div style={{ marginBottom: "32px" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748b", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
          <ChevronLeft size={18} /> Quay lại
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: QR CODE DISPLAY */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Main QR Card */}
          <div style={{ 
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "32px",
            padding: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            width: "100%",
            maxWidth: "420px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Visual Header Decoration */}
            <div style={{ height: "6px", background: "linear-gradient(to right, #0d9488, #0ea5e9)", position: "absolute", top: 0, left: 0, right: 0 }}></div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
              <Landmark size={22} color="#0d9488" />
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quét Mã VietQR</span>
            </div>

            {/* QR Wrapper with Premium Hover/Border */}
            <div style={{ 
              background: "#f8fafc",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "24px",
              padding: "16px",
              marginBottom: "24px",
              display: "inline-block",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
            }}>
              {paymentInfo?.qrUrl ? (
                <img 
                  src={paymentInfo.qrUrl} 
                  alt="Mã QR chuyển tiền MBBank" 
                  style={{ width: "280px", height: "280px", borderRadius: "12px", display: "block" }} 
                />
              ) : (
                <div style={{ width: "280px", height: "280px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  Đang khởi tạo mã QR...
                </div>
              )}
            </div>

            {/* Scanning Status with Micro-animation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#0d9488", fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>
              <RefreshCw size={18} style={{ animation: "spin 2s linear infinite" }} />
              <span>Đang chờ chuyển khoản tự động...</span>
            </div>

            {/* Timer Counter */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#f8fafc", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.02)" }}>
              <Clock size={16} color="#64748b" />
              <span style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>Mã QR hết hạn sau:</span>
              <span style={{ fontSize: "15px", color: timeLeft < 120 ? "#ef4444" : "#0f172a", fontWeight: 800, fontFamily: "monospace" }}>
                {timeLeft > 0 ? formatTime(timeLeft) : "Hết hạn"}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, textAlign: "center", marginTop: "20px", maxWidth: "340px", lineHeight: 1.5 }}>
            Sử dụng ứng dụng Mobile Banking bất kỳ quét mã QR ở trên để tự động điền đầy đủ thông tin giao dịch.
          </p>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}} />
        </div>

        {/* RIGHT COLUMN: MANUAL DETAILS AND INSTRUCTIONS */}
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.5px" }}>
            Thông tin chuyển khoản
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", fontWeight: 500, lineHeight: 1.6, marginBottom: "32px" }}>
            Nếu bạn không quét được mã QR, hãy thực hiện chuyển khoản thủ công theo đúng thông tin dưới đây. Nhớ nhập <strong style={{ color: "#0f172a" }}>chính xác</strong> nội dung chuyển khoản.
          </p>

          {/* Details Card */}
          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "24px", padding: "24px 32px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", marginBottom: "32px" }}>
            
            <div style={detailRowStyle}>
              <span style={labelStyle}>Ngân hàng</span>
              <span style={valueStyle}>
                MBBank (Quân đội)
              </span>
            </div>

            <div style={detailRowStyle}>
              <span style={labelStyle}>Số tài khoản</span>
              <span style={valueStyle}>
                {paymentInfo?.accountNumber}
                <button 
                  onClick={() => handleCopy(paymentInfo?.accountNumber, "accountNumber")} 
                  style={copyButtonStyle(copiedField === "accountNumber")}
                >
                  {copiedField === "accountNumber" ? <Check size={13} /> : <Copy size={13} />}
                  {copiedField === "accountNumber" ? "Đã chép" : "Sao chép"}
                </button>
              </span>
            </div>

            <div style={detailRowStyle}>
              <span style={labelStyle}>Tên người nhận</span>
              <span style={{ ...valueStyle, textTransform: "uppercase" }}>
                {paymentInfo?.accountName}
              </span>
            </div>

            <div style={detailRowStyle}>
              <span style={labelStyle}>Số tiền chuyển khoản</span>
              <span style={{ ...valueStyle, color: "#0d9488", fontSize: "16px", fontWeight: 800 }}>
                ₫{Number(paymentInfo?.totalAmount).toLocaleString("vi-VN")}
                <button 
                  onClick={() => handleCopy(String(Math.round(Number(paymentInfo?.totalAmount))), "amount")} 
                  style={copyButtonStyle(copiedField === "amount")}
                >
                  {copiedField === "amount" ? <Check size={13} /> : <Copy size={13} />}
                  {copiedField === "amount" ? "Đã chép" : "Sao chép"}
                </button>
              </span>
            </div>

            <div style={{ ...detailRowStyle, borderBottom: "none" }}>
              <span style={labelStyle}>Nội dung chuyển khoản</span>
              <span style={{ ...valueStyle, color: "#ea580c", background: "rgba(234,88,12,0.05)", padding: "4px 8px", borderRadius: "8px", border: "1px dashed rgba(234,88,12,0.2)" }}>
                {paymentInfo?.memo}
                <button 
                  onClick={() => handleCopy(paymentInfo?.memo, "memo")} 
                  style={copyButtonStyle(copiedField === "memo")}
                >
                  {copiedField === "memo" ? <Check size={13} /> : <Copy size={13} />}
                  {copiedField === "memo" ? "Đã chép" : "Sao chép"}
                </button>
              </span>
            </div>

          </div>

          {/* Secure details info */}
          <div style={{ padding: "20px", background: "rgba(13,148,136,0.03)", borderRadius: "16px", border: "1px solid rgba(13,148,136,0.1)", display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "32px" }}>
            <ShieldCheck size={20} color="#0d9488" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Bảo mật & Tự động hoàn toàn</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5, fontWeight: 500 }}>
                Hệ thống sử dụng cổng SePay tự động đối soát thông tin qua MBBank. Chỉ cần nội dung chuyển khoản trùng khớp với mã <strong style={{ color: "#ea580c" }}>{paymentInfo?.memo}</strong>, đặt chỗ của bạn sẽ được duyệt tức thì.
              </p>
            </div>
          </div>

          {/* Manual check CTA for emergency */}
          <div style={{ display: "flex", gap: "16px" }}>
            <button 
              onClick={handleManualCheck}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #0d9488, #0ea5e9)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 20px -5px rgba(13,148,136,0.3)",
                transition: "transform 0.2s, opacity 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Tôi đã chuyển khoản thành công
            </button>
            
            <Link 
              href="/"
              style={{
                padding: "16px 24px",
                borderRadius: "14px",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#ffffff",
                color: "#475569",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
                cursor: "pointer"
              }}
            >
              Về Trang chủ
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>
      <Suspense fallback={
        <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
          Đang tải trang thanh toán...
        </div>
      }>
        <PaymentContent />
      </Suspense>
      <Footer />
    </div>
  );
}
