# 🎨 Gợi Ý Thiết Kế Tiếp Theo cho MoodTravel

Sau khi phân tích toàn bộ codebase (frontend + backend), dưới đây là **10 đề xuất thiết kế** được sắp xếp theo **độ ưu tiên** và **tác động UX**.

---

## Tổng Quan Hiện Trạng

| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| Landing Page | ✅ Hoàn thiện | Hero, Destinations, Homestays, Testimonials, CTA, Footer |
| Auth (Login/Register) | ✅ Hoàn thiện | Email verification, Google OAuth, Forgot/Reset Password |
| Tours listing + detail | ✅ Hoàn thiện | Filter, search, detail page |
| Homestays listing + detail | ✅ Hoàn thiện | Filter, search, detail page |
| Checkout + Payment | ✅ Hoàn thiện | SePay bank transfer, payment flow |
| Dashboard (User) | ✅ Hoàn thiện | Overview, bookings, wishlist, reviews, profile, security |
| Admin Panel | ✅ Hoàn thiện | Full CRUD: tours, hotels, users, bookings, coupons, reviews |
| Owner Center | ✅ Hoàn thiện | Hotels, rooms, tours, bookings management |
| Chat (Real-time) | ✅ Hoàn thiện | Socket.io, multi-language translate, reactions, file upload |
| Blog | ✅ Có sẵn | Listing + detail |
| Contact | ✅ Có sẵn | Contact page |

---

## 🏆 Top 10 Gợi Ý Thiết Kế

### 1. 🔔 Hệ Thống Thông Báo Real-time (Notification Center)

> **Ưu tiên: ⭐⭐⭐⭐⭐ | Effort: Trung bình | Impact: Rất cao**

**Vấn đề:** Hiện tại chưa có hệ thống notification. User không biết khi booking được xác nhận, owner không biết có booking mới, admin không biết có hồ sơ owner chờ duyệt.

**Đề xuất:**
- **Notification Bell** trên Navbar với badge đếm số unread
- **Dropdown Panel** hiển thị danh sách thông báo (booking confirmed, new message, review received...)
- **Toast Notifications** real-time qua Socket.io (đã có sẵn infrastructure)
- Notification types: `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `NEW_MESSAGE`, `NEW_REVIEW`, `OWNER_APPROVED`, `PAYMENT_RECEIVED`

**Schema mới cần thêm:**
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // BOOKING_CONFIRMED, NEW_MESSAGE, etc.
  title     String
  content   String
  link      String?  // Deep link to relevant page
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Files cần tạo/sửa:**
- `frontend/src/components/NotificationBell.jsx` [NEW]
- `backend/src/notifications/` module [NEW]
- `Navbar.jsx` — thêm notification icon
- Socket gateway — emit notification events

---

### 2. 🗺️ Trang Bản Đồ Khám Phá (Interactive Map Explorer)

> **Ưu tiên: ⭐⭐⭐⭐⭐ | Effort: Trung bình | Impact: Rất cao**

**Vấn đề:** Dự án đã có `MapComponent.jsx` nhưng chưa có trang khám phá bản đồ tổng hợp. Đối với nền tảng du lịch, đây là tính năng cốt lõi.

**Đề xuất:**
- Trang `/explore` với bản đồ full-screen (Leaflet/Mapbox)
- **Markers** hiển thị vị trí tất cả homestays + tours (đã có `lat`, `lng` trong schema)
- **Cluster markers** khi zoom out
- **Sidebar** trượt hiện thông tin khi click marker
- **Filter layer:** lọc theo loại (Homestay/Tour), giá, rating
- **Search by map area**: kéo bản đồ → auto-load kết quả trong viewport

**Mockup Layout:**
```
┌─────────────────────────────────────────────┐
│  Navbar                                      │
├──────────┬──────────────────────────────────┤
│          │                                    │
│  Filter  │         MAP (Leaflet)              │
│  Panel   │     📍 📍    📍                    │
│          │        📍  📍                      │
│  ──────  │   📍        📍                     │
│  Results │              📍                    │
│  Cards   │                                    │
│  (scroll)│                                    │
├──────────┴──────────────────────────────────┤
```

---

### 3. 📱 Responsive Overhaul cho Dashboard, Admin, Owner

> **Ưu tiên: ⭐⭐⭐⭐⭐ | Effort: Cao | Impact: Rất cao**

**Vấn đề:** Dashboard (800 dòng), Admin (934 dòng), Owner (857 dòng) đều sử dụng inline styles với layout `grid 280px + 1fr`, **hoàn toàn không responsive trên mobile**.

**Đề xuất:**
- **Mobile Sidebar → Bottom Tab Navigation** hoặc hamburger drawer
- **Tables → Cards** trên mobile (booking cards, user cards thay vì bảng)
- **Sticky header** với breadcrumb trên mobile
- **Collapsible filter sections**

**Files cần sửa:**
- `dashboard/page.js` — refactor layout + responsive
- `admin/page.js` + `admin.module.css` — responsive tables
- `owner/page.js` + `owner.module.css` — responsive tables

---

### 4. 🌙 Dark Mode Toggle

> **Ưu tiên: ⭐⭐⭐⭐ | Effort: Trung bình | Impact: Cao**

**Vấn đề:** Toàn bộ UI hiện tại là light mode. Dark mode là expectation chuẩn của modern web app năm 2026.

**Đề xuất:**
- **CSS Variables** cho toàn bộ color palette (refactor từ hard-coded colors)
- **Toggle switch** trên Navbar (lưu preference vào `localStorage`)
- **Dark palette:** `#0f172a` → `#f8fafc`, cards `#1e293b`, borders `#334155`
- **Smooth transition** khi toggle (`transition: background 0.3s, color 0.3s`)

**Implementation:**
```css
:root {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border: rgba(0,0,0,0.05);
  --accent: #0d9488;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: rgba(255,255,255,0.08);
  --accent: #14b8a6;
}
```

---

### 5. 📊 Trang Phân Tích & Báo Cáo cho Owner (Analytics Dashboard)

> **Ưu tiên: ⭐⭐⭐⭐ | Effort: Trung bình | Impact: Cao**

**Vấn đề:** Owner Center hiện chỉ có 5 stat cards cơ bản. Thiếu insights chi tiết giúp owner ra quyết định kinh doanh.

**Đề xuất:**
- **Revenue Chart** theo ngày/tuần/tháng (line chart SVG)
- **Occupancy Rate** theo phòng (heatmap calendar)
- **Top Performing** homestays/tours (bảng xếp hạng)
- **Review Sentiment** overview (positive/negative ratio)
- **Booking Funnel:** views → bookings → completed (conversion rate)
- **Export PDF/CSV** cho báo cáo

---

### 6. 🖼️ Image Gallery Premium cho Tour/Homestay Detail

> **Ưu tiên: ⭐⭐⭐⭐ | Effort: Thấp | Impact: Cao**

**Vấn đề:** Trang detail tour/homestay hiển thị ảnh cơ bản. Cần gallery trải nghiệm premium hơn.

**Đề xuất:**
- **Hero Gallery** kiểu Airbnb: 1 ảnh lớn + 4 ảnh nhỏ grid
- **Lightbox** fullscreen khi click ảnh (swipe gesture trên mobile)
- **Virtual Tour** link (360° view integration placeholder)
- **Lazy loading** + blur placeholder effect
- **Image counter** badge: "Xem tất cả 12 ảnh"

**Layout:**
```
┌──────────────────┬─────────┐
│                  │  img 2  │
│    Main Image    ├─────────┤
│     (hero)       │  img 3  │
│                  ├─────────┤
│                  │  img 4  │
│                  ├─────────┤
│                  │+8 more ▸│
└──────────────────┴─────────┘
```

---

### 7. ⭐ Review System Enhancement (Photos + Reply)

> **Ưu tiên: ⭐⭐⭐ | Effort: Trung bình | Impact: Trung bình-Cao**

**Vấn đề:** Review hiện chỉ có rating + text. Schema đã có `images Json?` nhưng chưa được sử dụng trên UI.

**Đề xuất:**
- **Upload ảnh** khi viết review (sử dụng `uploadApi` đã có)
- **Owner Reply** — owner có thể trả lời review (cần thêm `replyContent`, `repliedAt` vào Review model)
- **Review Summary** trên trang detail: biểu đồ phân phối sao (5⭐: 45%, 4⭐: 30%...)
- **Sort reviews:** mới nhất, rating cao nhất, có ảnh
- **Helpful votes:** "Đánh giá này có hữu ích?" button

---

### 8. 🎁 Trang Khuyến Mãi & Voucher cho User

> **Ưu tiên: ⭐⭐⭐ | Effort: Thấp | Impact: Trung bình**

**Vấn đề:** Coupon system đã có đầy đủ backend (CRUD trong admin), nhưng chưa có trang frontend cho user duyệt và thu thập voucher.

**Đề xuất:**
- Trang `/promotions` — danh sách voucher đang active
- **Voucher Card** design: mã code, % giảm, điều kiện, ngày hết hạn
- **"Lưu mã"** button → hiện mã tại checkout
- **Countdown timer** cho flash sale vouchers
- **Banner carousel** trên trang chủ cho promotions đang chạy

---

### 9. 🧑‍💼 Trang Profile Công Khai (Public Profile Enhancement)

> **Ưu tiên: ⭐⭐⭐ | Effort: Thấp | Impact: Trung bình**

**Vấn đề:** Route `/profile/[id]` đã tồn tại nhưng chưa được kiểm tra chất lượng. User posts đã có backend support (`UserPost` model).

**Đề xuất:**
- **Cover Photo** + Avatar hero section
- **Activity Feed:** bài đăng gần đây (đã có `UserPost`)
- **Travel Stats:** số chuyến đi, quốc gia đã đến, reviews đã viết
- **Badge System:** "Explorer", "Reviewer", "VIP Traveler" dựa trên activity
- **Follow System** (future): follow user để xem bài đăng

---

### 10. 🔍 Smart Search & AI Recommendations

> **Ưu tiên: ⭐⭐ | Effort: Cao | Impact: Cao**

**Vấn đề:** Search hiện tại là keyword-based. Chưa có recommendation engine.

**Đề xuất:**
- **Unified Search Bar** trên Navbar: tìm tour + homestay + blog cùng lúc
- **Recent Searches** lưu local
- **"Có thể bạn thích"** section dựa trên wishlist + booking history
- **Seasonal Recommendations:** gợi ý theo mùa du lịch
- **AI Chatbot Enhancement:** chat hiện có (`?with=vietjourney-ai-bot`) → cải tiến thành travel advisor thực sự

---

## 📋 Ma Trận Ưu Tiên

| # | Tính năng | Impact | Effort | Priority Score |
|---|---|---|---|---|
| 1 | Notification System | 🔴 Rất cao | 🟡 TB | ⭐⭐⭐⭐⭐ |
| 2 | Map Explorer | 🔴 Rất cao | 🟡 TB | ⭐⭐⭐⭐⭐ |
| 3 | Responsive Overhaul | 🔴 Rất cao | 🔴 Cao | ⭐⭐⭐⭐⭐ |
| 4 | Dark Mode | 🟠 Cao | 🟡 TB | ⭐⭐⭐⭐ |
| 5 | Owner Analytics | 🟠 Cao | 🟡 TB | ⭐⭐⭐⭐ |
| 6 | Image Gallery Premium | 🟠 Cao | 🟢 Thấp | ⭐⭐⭐⭐ |
| 7 | Review Enhancement | 🟡 TB-Cao | 🟡 TB | ⭐⭐⭐ |
| 8 | Promotions Page | 🟡 TB | 🟢 Thấp | ⭐⭐⭐ |
| 9 | Public Profile | 🟡 TB | 🟢 Thấp | ⭐⭐⭐ |
| 10 | Smart Search & AI | 🟠 Cao | 🔴 Cao | ⭐⭐ |

---
