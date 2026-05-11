# Thư mục Actions

Nơi chứa các **Server Actions** của Next.js. 
Các file trong này nên bắt đầu bằng chỉ thị `"use server";`.

**Mục đích:**
Thay vì viết API endpoint và sử dụng `fetch` từ Frontend, bạn có thể gọi trực tiếp các hàm trong thư mục này từ Client Component để thao tác với Database (Ví dụ: Thêm vào giỏ hàng, Đặt tour, Đăng ký user).
