# Kiến trúc Dự án (Project Architecture)

Dự án VietJourney sử dụng **Next.js (App Router)** - một framework Full-stack. Do đó, toàn bộ code Frontend và Backend đều nằm chung trong cùng một kho lưu trữ (repository) mà không cần phải tách ra thành hai thư mục `frontend` và `backend` riêng biệt. Điều này giúp dễ dàng chia sẻ các kiểu dữ liệu (Types/Interfaces) và giảm thiểu độ trễ giao tiếp (latency).

## Cấu trúc Thư mục Hệ thống

Toàn bộ mã nguồn cốt lõi nằm trong thư mục `src/`:

### 1. Khu vực Frontend (Giao diện & UI)
- **`app/`**: Chứa các trang (Pages) và Layout. Dựa trên tính năng App Router của Next.js.
- **`components/`**: Chứa các thành phần giao diện tái sử dụng (Navbar, Footer, Button, Card,...).
- **`data/`**: (Tạm thời) Chứa dữ liệu tĩnh `mockData.js` phục vụ cho quá trình dựng giao diện. Sẽ được thay thế khi có Database.

### 2. Khu vực Backend (Xử lý Logic & Database)
- **`app/api/`**: Chứa các RESTful API endpoints (Routes Handler). Ví dụ: `/api/users`, `/api/orders`. Dùng để giao tiếp với các ứng dụng bên thứ 3 hoặc App Mobile sau này.
- **`actions/`**: Chứa các **Server Actions**. Đây là nơi viết các hàm chạy hoàn toàn trên Server (Node.js) để xử lý Form, ghi vào Database, giúp thay thế phần lớn việc phải viết API thủ công.
- **`lib/`**: Chứa các cấu hình thư viện lõi, đặc biệt là cấu hình kết nối Cơ sở dữ liệu (Database Connection như `db.js`) và các tiện ích (utilities) chung.
- **`models/`**: Chứa định nghĩa cấu trúc dữ liệu (Schemas). Nếu sử dụng MongoDB, đây là nơi đặt các file Mongoose Schema (như `User.js`, `Tour.js`).

## Luồng hoạt động (Data Flow)
1. **Frontend** (Component) gọi một hàm từ **`actions/`**.
2. Hàm trong **`actions/`** sử dụng **`models/`** để tương tác với Database thông qua kết nối cấu hình ở **`lib/`**.
3. Kết quả được trả về trực tiếp cho Frontend để cập nhật giao diện mà không cần thông qua bước Fetch API trung gian.
