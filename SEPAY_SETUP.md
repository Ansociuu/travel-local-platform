# Hướng Dẫn Tích Hợp Và Cấu Hình Cổng Thanh Toán SePay (MBBank)

Tài liệu này hướng dẫn cách cấu hình, chạy thử nghiệm (local qua ngrok) và triển khai chính thức cổng thanh toán tự động **SePay** kết hợp ngân hàng **MBBank** cho dự án **MoodTravel**.

---

## 📌 1. Cấu Hìn Biến Môi Trường (`backend/.env`)

Để cổng thanh toán hoạt động, bạn cần cấu hình các tham số sau trong file `.env` của backend:

```env
# --- CẤU HÌNH SEPAY (MBBANK) ---
SEPAY_BANK_BIN="970422"                  # BIN của MBBank (mặc định: 970422)
SEPAY_ACCOUNT_NUMBER="0365820731"        # Số tài khoản MBBank nhận tiền
SEPAY_WEBHOOK_TOKEN="MoodTravelSecretToken2026"  # Mã bảo mật webhook tự đặt (trùng khớp với SePay)
```

> 💡 **Lưu ý quan trọng**:
> - **SEPAY_BANK_BIN**: `970422` là mã BIN chuẩn của Ngân hàng TMCP Quân đội (MBBank) dùng để tạo mã VietQR theo chuẩn Napas.
> - **SEPAY_WEBHOOK_TOKEN**: Đây là token bảo mật dùng để xác thực các request gửi từ SePay tới Webhook của bạn nhằm tránh giả mạo thanh toán. Bạn có thể thay đổi giá trị này nhưng phải cấu hình khớp với API Key / Webhook Token trên trang quản trị SePay.

---

## ⚙️ 2. Quy Trình Chạy Thử Nghiệm Ở Local (Local Development)

Vì SePay cần gửi tín hiệu Webhook (HTTP POST) trực tiếp đến máy chủ của bạn khi có biến động số dư, bạn cần sử dụng một đường ống tunnel (như **ngrok**) để public cổng backend nội bộ ra internet.

### Bước 1: Khởi tạo tunnel ngrok
Mở một terminal mới và chạy lệnh sau (mặc định backend chạy port `3002`):
```bash
ngrok http 3002
```

Sau khi chạy, ngrok sẽ cung cấp cho bạn một tên miền public dạng:
`https://<your-subdomain>.ngrok-free.dev`

### Bước 2: Cấu hình Webhook trên SePay
1. Đăng nhập vào trang quản trị của [SePay.vn](https://sepay.vn).
2. Đi tới phần **Tích hợp hệ thống** -> **Webhooks**.
3. Tạo một Webhook mới với các thông tin sau:
   - **URL nhận Webhook**: `https://<your-subdomain>.ngrok-free.dev/payments/sepay/webhook`
   - **Phương thức**: `POST`
   - **Kiểu dữ liệu**: `JSON`
   - **Webhook Token / API Key**: Nhập chính xác token bạn cấu hình trong `.env` (ví dụ: `MoodTravelSecretToken2026`).

---

## 🛡️ 3. Cơ Chế Hoạt Động & Xử Lý Đặt Chỗ tự động

1. **Khởi tạo Đơn Đặt chỗ (Booking)**: Khi khách hàng nhấn "Thanh toán", đơn hàng được lưu dưới dạng `PENDING` (Chờ thanh toán).
2. **VietQR hiển thị**: Khách hàng quét mã VietQR tự động được sinh ra với nội dung chuyển khoản có cấu trúc duy nhất (Ví dụ: `MT-N3SFWT`).
3. **Quản lý Hết Hạn**:
   - Nếu khách hàng không thanh toán trong vòng **30 phút**, hệ thống có cả cơ chế quét nền chủ động (Active Background Job) chạy mỗi 5 phút lẫn kiểm tra lười (Passive Lazy Clean) khi người dùng truy cập, sẽ tự động đổi trạng thái đơn hàng sang `CANCELLED` (Đã hủy).
   - Nếu đơn hàng chưa bị hủy, nút **"Thanh toán"** vẫn hiển thị trong **Lịch sử đặt chỗ** tại Dashboard để khách hàng thanh toán lại.
4. **Nhận Webhook**: Khi tiền chuyển khoản thành công vào tài khoản MBBank, SePay gửi request POST tới `/payments/sepay/webhook`.
5. **Khớp mã & Kích hoạt**: Backend tiến hành xác thực `SEPAY_WEBHOOK_TOKEN`, phân tích nội dung chuyển khoản để lấy mã giao dịch (ví dụ: `MT-N3SFWT`), cập nhật `status = CONFIRMED` và `paymentStatus = PAID` lập tức. Khách hàng trên giao diện Web được chuyển hướng sang trang `/success`.

---

## 🚀 4. Triển Khai Sản Xuất (Production Deployment)

Khi đưa dự án lên máy chủ chính thức (Vercel, Render, AWS, Heroku...):

1. **Cập nhật Biến Môi Trường**: Thêm các cấu hình `SEPAY_BANK_BIN`, `SEPAY_ACCOUNT_NUMBER`, và `SEPAY_WEBHOOK_TOKEN` vào phần cài đặt Environment Variables (Secrets) của nền tảng host.
2. **Cập nhật URL Webhook trên SePay**: Đổi URL từ tên miền ngrok tạm thời thành tên miền production chính thức của bạn:
   `https://api.yourdomain.com/payments/sepay/webhook`
3. Đảm bảo cổng HTTPS (SSL) được kích hoạt trên tên miền của bạn để mã hóa token webhook một cách an toàn nhất.
