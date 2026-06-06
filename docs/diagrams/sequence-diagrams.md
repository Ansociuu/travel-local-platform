# 🔄 Sơ đồ Tuần tự (Sequence Diagrams) - VietJourney / MoodTravel

> **Mô tả:** Tập hợp các sơ đồ tuần tự mô tả luồng hoạt động chính của hệ thống đặt phòng homestay và tour du lịch VietJourney.

---

## 1. Đăng ký tài khoản (Registration with Email Verification)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant EMAIL as 📧 SendGrid/Resend

    KH->>FE: Nhập thông tin đăng ký<br/>(name, email, password, phone)
    FE->>FE: Validate form phía client
    FE->>BE: POST /api/auth/register
    BE->>BE: Validate dữ liệu<br/>& hash password (bcrypt)
    BE->>DB: Kiểm tra email đã tồn tại?

    alt Email đã tồn tại
        DB-->>BE: Email trùng lặp
        BE-->>FE: 409 Conflict
        FE-->>KH: Hiển thị lỗi "Email đã được sử dụng"
    else Email hợp lệ
        BE->>DB: INSERT User (emailVerified = false)
        DB-->>BE: User đã tạo
        BE->>BE: Tạo VerificationToken
        BE->>DB: INSERT VerificationToken
        BE->>EMAIL: Gửi email xác thực<br/>(link + token)
        EMAIL-->>KH: 📩 Email xác thực
        BE-->>FE: 201 Created
        FE-->>KH: "Vui lòng kiểm tra email"
        KH->>FE: Click link xác thực
        FE->>BE: GET /api/auth/verify?token=xxx
        BE->>DB: Tìm & xác thực token
        BE->>DB: UPDATE User (emailVerified = true)
        BE-->>FE: Redirect tới trang đăng nhập
        FE-->>KH: "Xác thực thành công!"
    end
```

---

## 2. Đăng nhập (Login with JWT)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant OAUTH as 🔐 Google/Facebook

    alt Đăng nhập bằng Email
        KH->>FE: Nhập email & mật khẩu
        FE->>BE: POST /api/auth/login
        BE->>DB: Tìm User theo email
        alt User không tồn tại
            DB-->>BE: Không tìm thấy
            BE-->>FE: 401 Unauthorized
            FE-->>KH: "Email hoặc mật khẩu sai"
        else User tồn tại
            DB-->>BE: User data
            BE->>BE: So sánh password (bcrypt)
            alt Mật khẩu sai
                BE-->>FE: 401 Unauthorized
                FE-->>KH: "Email hoặc mật khẩu sai"
            else Mật khẩu đúng
                BE->>BE: Tạo JWT Access Token<br/>& Refresh Token
                BE->>DB: INSERT Session
                BE-->>FE: 200 OK + tokens + user info
                FE->>FE: Lưu token vào cookie/localStorage
                FE-->>KH: Redirect tới trang chủ
            end
        end
    else Đăng nhập bằng OAuth
        KH->>FE: Click "Đăng nhập Google/Facebook"
        FE->>OAUTH: Redirect tới OAuth provider
        KH->>OAUTH: Cấp quyền truy cập
        OAUTH-->>FE: Redirect callback + auth code
        FE->>BE: GET /api/auth/callback?code=xxx
        BE->>OAUTH: Đổi code lấy access token
        OAUTH-->>BE: User profile (email, name, avatar)
        BE->>DB: Tìm hoặc tạo User
        BE->>BE: Tạo JWT tokens
        BE-->>FE: 200 OK + tokens
        FE-->>KH: Redirect tới trang chủ
    end
```

---

## 3. Tìm kiếm và đặt phòng Homestay (Search & Book)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant MAP as 🗺️ Leaflet Map
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database

    KH->>FE: Nhập điều kiện tìm kiếm<br/>(vị trí, ngày, số khách, loại)
    FE->>BE: GET /api/hotels?city=...&checkIn=...&checkOut=...
    BE->>DB: Query Hotels + Rooms<br/>+ RoomAvailability
    DB-->>BE: Danh sách homestay phù hợp
    BE-->>FE: 200 OK + danh sách homestay

    FE->>MAP: Hiển thị markers trên bản đồ
    FE-->>KH: Hiển thị kết quả (list + map)

    KH->>FE: Click vào một homestay
    FE->>BE: GET /api/hotels/:id
    BE->>DB: Query Hotel + Rooms<br/>+ Amenities + Reviews
    DB-->>BE: Chi tiết homestay
    BE-->>FE: 200 OK + chi tiết
    FE-->>KH: Hiển thị trang chi tiết<br/>(ảnh, tiện nghi, phòng, đánh giá, bản đồ)

    KH->>FE: Chọn phòng, số lượng,<br/>ngày check-in/check-out
    FE->>FE: Tính tổng tiền
    KH->>FE: Nhập thông tin khách<br/>& yêu cầu đặc biệt

    opt Áp dụng mã giảm giá
        KH->>FE: Nhập mã coupon
        FE->>BE: POST /api/coupons/validate
        BE->>DB: Kiểm tra coupon hợp lệ
        DB-->>BE: Thông tin coupon
        BE-->>FE: Số tiền giảm
        FE->>FE: Cập nhật tổng tiền
    end

    KH->>FE: Nhấn "Đặt phòng"
    FE->>BE: POST /api/bookings
    BE->>DB: Kiểm tra phòng còn trống
    alt Phòng đã hết
        DB-->>BE: Không còn phòng
        BE-->>FE: 400 Bad Request
        FE-->>KH: "Phòng đã được đặt, vui lòng chọn ngày khác"
    else Phòng còn trống
        BE->>DB: INSERT Booking + BookingRooms
        BE->>DB: UPDATE RoomAvailability
        DB-->>BE: Booking đã tạo
        BE-->>FE: 201 Created + booking info
        FE-->>KH: Redirect tới trang thanh toán
    end
```

---

## 4. Thanh toán qua SePay/VietQR (Payment with Webhook)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant SEPAY as 💳 SePay Gateway
    participant BANK as 🏦 MBBank

    KH->>FE: Xác nhận thanh toán
    FE->>BE: POST /api/payments/create
    BE->>BE: Tạo mã giao dịch<br/>(chứa shortId booking)
    BE->>DB: INSERT Payment<br/>(status = PENDING)
    BE-->>FE: Payment info + QR data

    FE->>FE: Tạo mã VietQR<br/>(số TK, số tiền, nội dung CK)
    FE-->>KH: Hiển thị mã QR thanh toán

    KH->>BANK: Quét QR & chuyển khoản
    BANK-->>KH: Xác nhận chuyển tiền thành công
    BANK->>SEPAY: Thông báo giao dịch mới

    SEPAY->>BE: POST /api/webhook/sepay<br/>(transaction data)
    BE->>BE: Xác thực webhook signature
    BE->>BE: Parse nội dung CK<br/>→ tìm shortId booking
    BE->>DB: Tìm Booking theo shortId
    BE->>DB: UPDATE Payment<br/>(status = SUCCESS)
    BE->>DB: UPDATE Booking<br/>(paymentStatus = PAID,<br/>status = CONFIRMED)

    BE->>FE: WebSocket emit<br/>"payment_confirmed"
    FE-->>KH: 🎉 "Thanh toán thành công!"
    FE-->>KH: Redirect tới trang xác nhận

    Note over BE,DB: Nếu không nhận webhook<br/>trong 30 phút → auto cancel
```

---

## 5. Đăng ký làm chủ Homestay (Owner Application & Approval)

```mermaid
sequenceDiagram
    autonumber
    actor OW as 🏠 Người dùng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant EMAIL as 📧 SendGrid/Resend
    actor AD as 🔧 Quản trị viên

    OW->>FE: Truy cập trang đăng ký Owner
    FE-->>OW: Form đăng ký Owner

    OW->>FE: Điền thông tin kinh doanh<br/>(businessName, phone, address, city, note)
    FE->>BE: POST /api/owner-applications
    BE->>DB: Kiểm tra đã nộp đơn chưa?
    alt Đã nộp đơn trước đó
        DB-->>BE: Đơn đã tồn tại
        BE-->>FE: 400 "Bạn đã nộp đơn trước đó"
        FE-->>OW: Hiển thị trạng thái đơn hiện tại
    else Chưa nộp đơn
        BE->>DB: INSERT OwnerApplication<br/>(status = PENDING)
        DB-->>BE: Đơn đã tạo
        BE->>EMAIL: Thông báo Admin có đơn mới
        BE-->>FE: 201 Created
        FE-->>OW: "Đơn đã gửi, vui lòng chờ duyệt"
    end

    Note over AD: Admin nhận thông báo

    AD->>FE: Truy cập trang quản lý đơn Owner
    FE->>BE: GET /api/admin/owner-applications
    BE->>DB: Query danh sách đơn PENDING
    DB-->>BE: Danh sách đơn
    BE-->>FE: 200 OK
    FE-->>AD: Hiển thị danh sách đơn

    AD->>FE: Xem chi tiết & quyết định

    alt Phê duyệt
        AD->>FE: Click "Phê duyệt"
        FE->>BE: PATCH /api/admin/owner-applications/:id<br/>(status = APPROVED)
        BE->>DB: UPDATE OwnerApplication
        BE->>DB: UPDATE User (role = OWNER)
        BE->>EMAIL: Gửi email chúc mừng
        EMAIL-->>OW: 📩 "Đơn đã được duyệt!"
        BE-->>FE: 200 OK
        FE-->>AD: "Đã phê duyệt thành công"
    else Từ chối
        AD->>FE: Nhập lý do & Click "Từ chối"
        FE->>BE: PATCH /api/admin/owner-applications/:id<br/>(status = REJECTED, rejectionReason)
        BE->>DB: UPDATE OwnerApplication
        BE->>EMAIL: Gửi email thông báo từ chối
        EMAIL-->>OW: 📩 "Đơn bị từ chối, lý do: ..."
        BE-->>FE: 200 OK
    end
```

---

## 6. Quản trị viên duyệt Homestay (Admin Approve Hotel)

```mermaid
sequenceDiagram
    autonumber
    actor OW as 🏠 Owner
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant CDN as ☁️ Cloudinary
    participant EMAIL as 📧 SendGrid/Resend
    actor AD as 🔧 Quản trị viên

    OW->>FE: Tạo homestay mới<br/>(tên, mô tả, địa chỉ, loại, tiện nghi)
    OW->>FE: Upload hình ảnh
    FE->>CDN: Upload ảnh lên Cloudinary
    CDN-->>FE: URLs ảnh đã upload
    FE->>BE: POST /api/hotels
    BE->>DB: INSERT Hotel<br/>(approvalStatus = PENDING_REVIEW)
    DB-->>BE: Hotel đã tạo
    BE-->>FE: 201 Created
    FE-->>OW: "Homestay đã gửi, chờ Admin duyệt"

    Note over AD: Admin kiểm tra homestay mới

    AD->>FE: Truy cập danh sách<br/>homestay chờ duyệt
    FE->>BE: GET /api/admin/hotels?status=PENDING_REVIEW
    BE->>DB: Query Hotels PENDING_REVIEW
    DB-->>BE: Danh sách homestay
    BE-->>FE: 200 OK
    FE-->>AD: Hiển thị danh sách

    AD->>FE: Xem chi tiết homestay
    FE->>BE: GET /api/admin/hotels/:id
    BE-->>FE: Chi tiết đầy đủ
    FE-->>AD: Hiển thị thông tin,<br/>ảnh, vị trí, tiện nghi

    alt Phê duyệt
        AD->>FE: Click "Duyệt homestay"
        FE->>BE: PATCH /api/admin/hotels/:id<br/>(approvalStatus = APPROVED)
        BE->>DB: UPDATE Hotel
        BE->>EMAIL: Thông báo Owner
        EMAIL-->>OW: 📩 "Homestay đã được duyệt!"
        BE-->>FE: 200 OK
        FE-->>AD: "Đã duyệt thành công"
    else Từ chối
        AD->>FE: Nhập lý do từ chối
        FE->>BE: PATCH /api/admin/hotels/:id<br/>(approvalStatus = REJECTED, reason)
        BE->>DB: UPDATE Hotel
        BE->>EMAIL: Thông báo Owner
        EMAIL-->>OW: 📩 "Homestay bị từ chối, lý do: ..."
        BE-->>FE: 200 OK
    end
```

---

## 7. Đánh giá sau khi Checkout (Post-stay Review)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant CDN as ☁️ Cloudinary

    Note over KH,DB: Sau khi booking COMPLETED

    KH->>FE: Truy cập lịch sử đặt phòng
    FE->>BE: GET /api/bookings?status=COMPLETED
    BE->>DB: Query Bookings COMPLETED<br/>chưa có review
    DB-->>BE: Danh sách booking
    BE-->>FE: 200 OK
    FE-->>KH: Hiển thị booking<br/>có nút "Viết đánh giá"

    KH->>FE: Click "Viết đánh giá"
    FE-->>KH: Form đánh giá<br/>(rating 1-5, comment, upload ảnh)

    KH->>FE: Chấm điểm, viết nhận xét<br/>& upload ảnh trải nghiệm
    FE->>CDN: Upload ảnh review
    CDN-->>FE: URLs ảnh

    FE->>BE: POST /api/reviews
    BE->>BE: Kiểm tra user đã checkout<br/>& chưa đánh giá booking này
    alt Không hợp lệ
        BE-->>FE: 400 "Không thể đánh giá"
        FE-->>KH: Hiển thị lỗi
    else Hợp lệ
        BE->>DB: INSERT Review
        BE->>DB: Tính lại rating trung bình Hotel
        BE->>DB: UPDATE Hotel.rating
        DB-->>BE: Đánh giá đã lưu
        BE-->>FE: 201 Created
        FE-->>KH: 🌟 "Cảm ơn bạn đã đánh giá!"
    end
```

---

## 8. Nhắn tin Realtime (Real-time Chat with Translation)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE_KH as 🖥️ FE Khách hàng
    participant WS as 🔌 Socket.io Server
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant GG as 🌐 Google Translate
    participant FE_OW as 🖥️ FE Owner
    actor OW as 🏠 Owner

    KH->>FE_KH: Mở trang chat
    FE_KH->>WS: connect + JWT token
    WS->>WS: Xác thực JWT
    WS-->>FE_KH: connected

    OW->>FE_OW: Mở trang chat
    FE_OW->>WS: connect + JWT token
    WS-->>FE_OW: connected

    KH->>FE_KH: Chọn Owner để nhắn tin
    FE_KH->>BE: GET /api/conversations?with=ownerId
    BE->>DB: Tìm hoặc tạo Conversation
    DB-->>BE: Conversation + messages
    BE-->>FE_KH: 200 OK + lịch sử chat

    KH->>FE_KH: Nhập và gửi tin nhắn
    FE_KH->>WS: emit "sendMessage"<br/>(conversationId, content)

    WS->>BE: Xử lý tin nhắn
    BE->>DB: INSERT Message<br/>(originalLanguage detected)

    BE->>DB: Kiểm tra preferredLanguage<br/>của người nhận
    alt Cần dịch ngôn ngữ
        BE->>GG: Translate content
        GG-->>BE: Nội dung đã dịch
        BE->>DB: UPDATE Message<br/>(translatedContent)
    end

    BE->>DB: UPDATE Conversation<br/>(lastMessage, lastAt)
    WS->>FE_OW: emit "newMessage"<br/>(message + translation)
    FE_OW-->>OW: 🔔 Thông báo tin nhắn mới<br/>(hiển thị bản dịch nếu có)

    OW->>FE_OW: Đọc & phản hồi tin nhắn
    FE_OW->>WS: emit "sendMessage"
    WS->>BE: Xử lý tin nhắn
    BE->>DB: INSERT Message
    WS->>FE_KH: emit "newMessage"
    FE_KH-->>KH: 💬 Hiển thị tin nhắn mới

    Note over FE_KH,FE_OW: Typing indicator &<br/>read receipts qua WebSocket
```

---

## 9. Đặt Tour trải nghiệm (Book Experience Tour)

```mermaid
sequenceDiagram
    autonumber
    actor KH as 👤 Khách hàng
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🗄️ MySQL Database
    participant SEPAY as 💳 SePay Gateway

    KH->>FE: Truy cập trang Tours
    FE->>BE: GET /api/tours?region=...&type=...
    BE->>DB: Query Tours APPROVED<br/>+ TourAvailability
    DB-->>BE: Danh sách tour
    BE-->>FE: 200 OK
    FE-->>KH: Hiển thị tour theo vùng miền<br/>(Bắc / Trung / Nam)

    KH->>FE: Click vào một tour
    FE->>BE: GET /api/tours/:id
    BE->>DB: Query Tour + Itinerary<br/>+ Availability + Reviews
    DB-->>BE: Chi tiết tour
    BE-->>FE: 200 OK
    FE-->>KH: Hiển thị chi tiết tour<br/>(lịch trình, giá, đánh giá, ảnh)

    KH->>FE: Chọn ngày khởi hành<br/>& số lượng người
    FE->>BE: GET /api/tours/:id/availability?date=...
    BE->>DB: Kiểm tra chỗ còn trống
    DB-->>BE: Thông tin khả dụng
    BE-->>FE: Số chỗ còn lại & giá

    KH->>FE: Nhập thông tin khách<br/>& nhấn "Đặt tour"
    FE->>BE: POST /api/bookings
    BE->>DB: Kiểm tra còn chỗ
    alt Hết chỗ
        BE-->>FE: 400 "Tour đã hết chỗ"
        FE-->>KH: Thông báo hết chỗ
    else Còn chỗ
        BE->>DB: INSERT Booking + BookingTour
        BE->>DB: UPDATE TourAvailability<br/>(booked += quantity)
        DB-->>BE: Booking đã tạo
        BE-->>FE: 201 Created + booking info
        FE-->>KH: Redirect tới thanh toán

        KH->>FE: Quét QR thanh toán
        FE->>SEPAY: Tạo mã VietQR
        Note over KH,SEPAY: Luồng thanh toán<br/>(xem Sequence #4)
        SEPAY-->>BE: Webhook xác nhận
        BE->>DB: UPDATE Booking CONFIRMED
        BE-->>FE: WebSocket "payment_confirmed"
        FE-->>KH: 🎉 "Đặt tour thành công!"
    end
```
