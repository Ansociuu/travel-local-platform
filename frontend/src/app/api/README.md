# Thư mục API (Route Handlers)

Nơi định nghĩa các RESTful API endpoints.

**Mục đích:**
Mặc dù Next.js App Router khuyến khích sử dụng Server Actions cho các thao tác nội bộ của web, nhưng thư mục `/api` vẫn cực kỳ quan trọng nếu bạn muốn:
- Xây dựng API cho một ứng dụng Mobile App kết nối vào.
- Tạo Webhook cho các dịch vụ thanh toán (VNPAY, Momo, Stripe).
- Xây dựng API công khai (Public API) cho đối tác.

Cách tạo: Tạo file `route.js` bên trong các thư mục con (VD: `/app/api/users/route.js`).
