# Travel Local Platform 

Ứng dụng web + mobile cho phép người dùng đặt homestay và trải nghiệm du lịch bản địa. 

## 🚀 Features 

* Đặt homestay theo địa điểm 
* Khám phá trải nghiệm bản địa (ẩm thực, văn hóa, tour) 
* Đánh giá & review * Quản lý booking 

## 🧱 Tech Stack 
* Web: React / Next.js 
* Mobile: Flutter / React Native 
* Backend: 
* Database: 

## 📂 Project Structure

Dự án được tổ chức theo mô hình **monorepo**, cho phép quản lý đồng thời web, mobile và backend trong cùng một repository.

```
travel-local-platform/
│
├── apps/                # Các ứng dụng phía client
│   ├── web/             # Ứng dụng web (React / Next.js)
│   └── mobile/          # Ứng dụng mobile (Flutter / React Native)
│ 
├── services/            # Các service backend
│   ├── api/             # REST API / GraphQL server
│   └── auth/            # (Optional) Service xác thực (JWT, OAuth...)
│
├── packages/            # Shared packages dùng chung
│   ├── ui/              # UI components (buttons, inputs...)
│   └── utils/           # Helper functions, constants
│
├── docs/                # Tài liệu đồ án (ERD, API docs, design...)
├── .env.example         # Biến môi trường mẫu
├── README.md            # Tổng quan dự án
└── package.json         # Cấu hình workspace / dependencies
```

### 🔎 Giải thích

* **apps/**: Chứa các ứng dụng phía người dùng (frontend)

  * `web`: Giao diện web cho người dùng và quản trị
  * `mobile`: Ứng dụng di động

* **services/**: Xử lý logic backend, cung cấp API cho frontend

  * `api`: Xử lý business logic, database
  * `auth`: Quản lý xác thực và phân quyền (có thể tách riêng hoặc gộp vào api)

* **packages/**: Chứa code dùng chung giữa các ứng dụng

  * `ui`: Component tái sử dụng
  * `utils`: Hàm tiện ích, config chung

* **docs/**: Lưu tài liệu phục vụ phát triển và trình bày đồ án

### 🎯 Lợi ích của cấu trúc này

* Dễ mở rộng và bảo trì
* Tái sử dụng code giữa web và mobile
* Đồng bộ frontend và backend trong cùng hệ thống
* Phù hợp với các dự án fullstack quy mô nhỏ đến trung bình

## 👥 Team 

* Nguyễn Văn An - 23010163
* Lê Phạm Thành Đạt - 23010541

