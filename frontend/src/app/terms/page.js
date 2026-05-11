import Link from "next/link";

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", lineHeight: "1.6", color: "#334155" }}>
      <Link href="/" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>← Quay lại trang chủ</Link>
      
      <h1 style={{ color: "#0d9488", marginTop: "20px" }}>Điều khoản dịch vụ - VietJourney</h1>
      <p>Chào mừng bạn đến với VietJourney. Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
      
      <h2>1. Tài khoản người dùng</h2>
      <p>Khi đăng ký tài khoản (qua Email, Google hoặc Facebook), bạn chịu trách nhiệm bảo mật thông tin tài khoản và mọi hoạt động diễn ra dưới tên tài khoản của mình.</p>

      <h2>2. Dịch vụ đặt phòng và Tour</h2>
      <p>VietJourney cung cấp nền tảng kết nối giữa khách hàng và nhà cung cấp dịch vụ lưu trú. Chúng tôi cam kết cung cấp thông tin chính xác nhưng không chịu trách nhiệm về các thay đổi đột xuất từ phía nhà cung cấp mà không được báo trước.</p>

      <h2>3. Chính sách hủy và hoàn tiền</h2>
      <p>Mỗi Homestay và Tour sẽ có chính sách hủy riêng được hiển thị rõ trong quá trình đặt. Vui lòng đọc kỹ trước khi thanh toán.</p>

      <h2>4. Quyền sở hữu trí tuệ</h2>
      <p>Toàn bộ nội dung, hình ảnh và thương hiệu trên trang web này thuộc sở hữu của VietJourney.</p>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
      <p>Xem thêm: <Link href="/privacy" style={{ color: "#0d9488", textDecoration: "underline" }}>Chính sách bảo mật & Quyền riêng tư</Link></p>
    </div>
  );
}
