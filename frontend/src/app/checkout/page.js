"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, Wallet, Landmark, ChevronLeft, Lock } from "lucide-react";
import { authApi, bookingsApi, paymentsApi } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequest: ''
  });

  useEffect(() => {
    const fetchUserAndOrder = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setFormData({
          guestName: userData.name || '',
          guestEmail: userData.email || '',
          guestPhone: userData.phone || '',
          specialRequest: ''
        });

        const pending = sessionStorage.getItem('pendingBooking');
        if (!pending) {
          router.push('/');
          return;
        }
        setOrder(JSON.parse(pending));
      } catch (err) {
        console.error("Not logged in or error:", err);
        router.push('/login?redirect=/checkout');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndOrder();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // 1. Create booking
      const payload = {
        checkIn: new Date(order.checkIn).toISOString(),
        totalAmount: order.totalAmount,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        specialRequest: formData.specialRequest,
      };

      if (order.type === 'tour') {
        payload.tourId = order.tourId;
        payload.bookingTours = [{
          tourId: order.tourId,
          quantity: order.quantity,
          priceAtBooking: order.priceAtBooking
        }];
      } else if (order.type === 'hotel') {
        payload.hotelId = order.hotelId;
        payload.checkOut = new Date(order.checkOut).toISOString();
        payload.bookingRooms = [{
          roomId: order.roomId,
          quantity: order.quantity, // usually 1 room
          priceAtBooking: order.priceAtBooking
        }];
      }

      const newBooking = await bookingsApi.create(payload);

      // 2. Create VNPay URL if paymentMethod is vnpay
      if (paymentMethod === 'vnpay') {
        const vnpayResponse = await paymentsApi.createVNPayUrl(newBooking.id);
        if (vnpayResponse && vnpayResponse.paymentUrl) {
          // Clear pending order
          sessionStorage.removeItem('pendingBooking');
          window.location.href = vnpayResponse.paymentUrl;
        } else {
          alert('Không thể tạo link thanh toán VNPay');
          setProcessing(false);
        }
      } else {
        // If other methods are added later
        sessionStorage.removeItem('pendingBooking');
        router.push('/success?bookingId=' + newBooking.id);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo đơn hàng: ' + (error.message || ''));
      setProcessing(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputStyle = {
    width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "#ffffff", outline: "none", fontSize: "15px", color: "#0f172a", fontFamily: "'Inter', sans-serif"
  };

  const methodStyle = (active) => ({
    display: "flex", alignItems: "center", gap: "12px", padding: "20px", borderRadius: "16px", border: `2px solid ${active ? "#0d9488" : "rgba(0,0,0,0.05)"}`, background: active ? "rgba(13,148,136,0.02)" : "#ffffff", cursor: "pointer", transition: "all 0.2s"
  });

  if (loading || !order) return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>Đang tải...</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
        
        {/* BREADCRUMB / BACK */}
        <div style={{ marginBottom: "32px" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748b", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
            <ChevronLeft size={18} /> Quay lại
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "64px" }}>
          
          {/* LEFT COL: FORM */}
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "40px" }}>
              Xác nhận và Thanh toán
            </h1>

            <form onSubmit={handleSubmit}>
              {/* CONTACT INFO */}
              <div style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Thông tin liên hệ</h2>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Họ và tên</label>
                  <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Số điện thoại</label>
                    <input type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Email</label>
                    <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} style={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Ghi chú đặc biệt (Tùy chọn)</label>
                  <textarea name="specialRequest" value={formData.specialRequest} onChange={handleChange} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Bạn có yêu cầu gì thêm không?"></textarea>
                </div>
              </div>

              {/* PAYMENT METHODS */}
              <div style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Phương thức thanh toán</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={methodStyle(paymentMethod === "vnpay")} onClick={() => setPaymentMethod("vnpay")}>
                    <Landmark size={24} color={paymentMethod === "vnpay" ? "#0d9488" : "#64748b"} />
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Thanh toán qua VNPay</span>
                  </div>

                  <div style={methodStyle(paymentMethod === "card")} onClick={() => alert("Phương thức này đang phát triển")}>
                    <CreditCard size={24} color="#64748b" />
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#64748b" }}>Thẻ Tín dụng (Sắp có)</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "24px", background: "rgba(13,148,136,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", color: "#0f172a" }}>
                <Lock size={24} color="#0d9488" />
                <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  Thông tin thanh toán của bạn được mã hóa và bảo mật an toàn tuyệt đối. Chúng tôi không lưu trữ dữ liệu thẻ của bạn.
                </p>
              </div>

              <button type="submit" disabled={processing} className="shimmer-btn" style={{ width: "100%", padding: "20px", borderRadius: "16px", border: "none", fontSize: "18px", fontWeight: 800, cursor: processing ? "not-allowed" : "pointer", boxShadow: "0 10px 30px rgba(13,148,136,0.3)", opacity: processing ? 0.7 : 1 }}>
                {processing ? "Đang xử lý..." : "Xác nhận và Thanh toán"}
              </button>
            </form>
          </div>

          {/* RIGHT COL: SUMMARY */}
          <div>
            <div style={{ position: "sticky", top: "100px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
              {/* Item Overview */}
              <div style={{ display: "flex", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "24px" }}>
                <img src={order.image} alt="Order" style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                    {order.type === 'hotel' ? 'Homestay' : 'Tour du lịch'}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.4 }}>
                    {order.hotelName || order.tourName}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#475569", fontWeight: 500 }}>
                    {new Date(order.checkIn).toLocaleDateString('vi-VN')} {order.checkOut ? ` - ${new Date(order.checkOut).toLocaleDateString('vi-VN')}` : ''}
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Chi tiết giá</h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                <span>₫{Number(order.priceAtBooking).toLocaleString()} x {order.quantity} {order.type === 'hotel' ? 'đêm' : 'khách'}</span>
                <span>₫{Number(order.totalAmount).toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.1)", fontSize: "20px", color: "#0f172a", fontWeight: 800 }}>
                <span>Tổng cộng</span>
                <span style={{ color: "#0d9488" }}>₫{Number(order.totalAmount).toLocaleString()}</span>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, textAlign: "center", marginTop: "24px", lineHeight: 1.5 }}>
                Bằng việc bấm Xác nhận và Thanh toán, bạn đồng ý với <Link href="#" style={{ color: "#0d9488" }}>Điều khoản Dịch vụ</Link> của chúng tôi.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
