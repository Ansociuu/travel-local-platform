# MoodTravel

Dự án MoodTravel là một hệ thống bao gồm Frontend (Next.js) và Backend (NestJS).

## Kiến trúc

Dự án được cấu trúc theo dạng Monorepo với 2 thư mục chính:
- `/frontend`: Chứa mã nguồn của Next.js, xây dựng giao diện người dùng.
- `/backend`: Chứa mã nguồn của NestJS, cung cấp API và tương tác với cơ sở dữ liệu MySQL thông qua Prisma.

## Yêu cầu hệ thống

- Node.js (phiên bản khuyến nghị: >= 18)
- MySQL Server đang chạy ở local.

## Hướng dẫn cài đặt và chạy

### 1. Frontend

Di chuyển vào thư mục frontend và cài đặt dependencies:
```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy trên `http://localhost:3000`.

### 2. Backend

Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd backend
npm install
```

Cập nhật thông tin kết nối MySQL trong file `backend/.env`:
```env
DATABASE_URL="mysql://<username>:<password>@localhost:3306/moodtravel"
```

Khởi tạo database và chạy Prisma (nếu có schema mới):
```bash
npx prisma db push
# hoặc
npx prisma migrate dev
```

Chạy server backend:
```bash
npm run start:dev
```

Backend sẽ chạy trên `http://localhost:3000` (mặc định của NestJS, có thể đổi port trong `main.ts` để tránh trùng lặp với frontend).
*Lưu ý:* Nên đổi port frontend hoặc backend để tránh xung đột port 3000. Mặc định bạn có thể chạy frontend ở 3000 và backend ở 3001.
