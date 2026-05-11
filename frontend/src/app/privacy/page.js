import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", lineHeight: "1.6", color: "#334155" }}>
      <Link href="/" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>← Quay lại trang chủ</Link>
      
      <h1 style={{ color: "#0d9488", marginTop: "20px" }}>Chính sách bảo mật & Quyền riêng tư - VietJourney</h1>
      <p>Cập nhật lần cuối: 09/05/2026</p>
      
      <h2>1. Thông tin chúng tôi thu thập</h2>
      <p>Khi bạn sử dụng các tính năng đăng nhập xã hội (Google, Facebook), chúng tôi thu thập:</p>
      <ul>
        <li>Tên của bạn</li>
        <li>Địa chỉ Email</li>
        <li>Ảnh đại diện công khai</li>
      </ul>

      <h2>2. Mục đích sử dụng thông tin</h2>
      <p>Thông tin của bạn được sử dụng để tạo tài khoản, cá nhân hóa trải nghiệm và hỗ trợ khách hàng trên hệ thống **VietJourney**.</p>

      <h2>3. Cách xóa dữ liệu người dùng</h2>
      <p>Bạn có quyền yêu cầu xóa dữ liệu cá nhân bất cứ lúc nào bằng cách:</p>
      <ul>
        <li>Gửi email yêu cầu tới: **nk.anbmtabc@gmail.com**</li>
        <li>Hoặc sử dụng tính năng "Xóa tài khoản" trong phần Cài đặt cá nhân.</li>
      </ul>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
      <p>Bằng việc sử dụng dịch vụ, bạn cũng đồng ý với <Link href="/terms" style={{ color: "#0d9488", textDecoration: "underline" }}>Điều khoản dịch vụ</Link> của chúng tôi.</p>
    </div>
  );
}
