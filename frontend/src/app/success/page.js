"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { paymentsApi } from "@/lib/api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const vnp_Amount = searchParams.get('vnp_Amount');
      if (vnp_Amount) {
        // Returned from VNPay
        try {
          const queryString = searchParams.toString();
          const result = await paymentsApi.verifyVNPayReturn(queryString);
          if (result.code === '00') {
            setStatus("success");
            setBookingId(result.bookingId || searchParams.get('vnp_TxnRef'));
          } else {
            setStatus("failed");
            setMessage("Giao dịch không thành công hoặc đã bị hủy.");
          }
        } catch (error) {
          setStatus("failed");
          setMessage("Lỗi xác minh thanh toán. Vui lòng liên hệ hỗ trợ.");
        }
      } else {
        // Direct success without VNPay
        const id = searchParams.get('bookingId');
        if (id) {
          setStatus("success");
          setBookingId(id);
        } else {
          setStatus("failed");
          setMessage("Không tìm thấy thông tin thanh toán.");
        }
      }
    };
    verifyPayment();
  }, [searchParams]);

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "32px", padding: "64px 40px", maxWidth: "600px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.05)" }}>
        
        {status === "loading" && (
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>Đang xử lý thanh toán...</h1>
            <p style={{ color: "#64748b" }}>Vui lòng không đóng trình duyệt</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", color: "#10b981", marginBottom: "32px" }}>
              <CheckCircle size={48} strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "36px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", letterSpacing: "-0.5px" }}>
              Thanh toán thành công!
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 500, lineHeight: 1.6, marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
              Cảm ơn bạn đã tin tưởng lựa chọn MoodTravel. Thông tin đặt chỗ đã được ghi nhận.
            </p>
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px dashed #cbd5e1", display: "inline-block", marginBottom: "40px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Mã đơn hàng</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>#{bookingId?.slice(-6).toUpperCase() || 'SUCCESS'}</div>
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <Link href="/" className="shimmer-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "12px", padding: "16px 32px", fontSize: "15px", fontWeight: 700 }}>
                Quay về Trang chủ <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", color: "#ef4444", marginBottom: "32px" }}>
              <XCircle size={48} strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
              Thanh toán thất bại
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 500, lineHeight: 1.6, marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
              {message}
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={() => window.history.back()} style={{ border: "1px solid #cbd5e1", background: "white", padding: "16px 32px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>
                Thử lại
              </button>
              <Link href="/" style={{ background: "#f8fafc", color: "#0f172a", textDecoration: "none", padding: "16px 32px", borderRadius: "12px", fontWeight: 700 }}>
                Về Trang chủ
              </Link>
            </div>
          </>
        )}

      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>
      <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Đang tải...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
