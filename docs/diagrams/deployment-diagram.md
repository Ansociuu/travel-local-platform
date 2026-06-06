# 🚀 Sơ đồ Triển khai (Deployment Diagram) - VietJourney / MoodTravel

> **Mô tả:** Sơ đồ triển khai hệ thống VietJourney trên các nền tảng đám mây, thể hiện cách các thành phần được deploy và kết nối với nhau trong môi trường production.

---

## Sơ đồ triển khai tổng thể

```mermaid
graph TB
    %% ===== NGƯỜI DÙNG =====
    subgraph USERS["👥 NGƯỜI DÙNG"]
        direction LR
        U_WEB["🖥️ Trình duyệt Desktop"]
        U_MOBILE["📱 Trình duyệt Mobile"]
    end

    %% ===== CDN & DNS =====
    subgraph EDGE["🌍 CDN & DNS LAYER"]
        DNS["🔗 DNS<br/>(Domain: vietjourney.vn)"]
        VERCEL_CDN["⚡ Vercel Edge Network<br/>(CDN toàn cầu)"]
    end

    %% ===== FRONTEND SERVER =====
    subgraph VERCEL_FE["🟢 VERCEL - Frontend Hosting"]
        direction TB
        FE_BUILD["📦 Next.js Build<br/>(Static + SSR)"]
        FE_FUNC["⚡ Serverless Functions<br/>(API Routes / SSR)"]
        FE_STATIC["📂 Static Assets<br/>(JS, CSS, Images)"]
        FE_ENV["🔒 Environment Variables"]
    end

    %% ===== BACKEND SERVER =====
    subgraph RENDER_BE["🟣 VERCEL / RENDER - Backend Hosting"]
        direction TB
        BE_APP["⚙️ NestJS Application<br/>(Node.js Runtime)"]
        BE_WS["🔌 WebSocket Server<br/>(Socket.io)"]
        BE_CRON["⏰ Scheduled Jobs<br/>(Cron Tasks)"]
        BE_ENV["🔒 Environment Variables<br/>(Secrets)"]
    end

    %% ===== DATABASE =====
    subgraph DB_CLOUD["🗄️ DATABASE CLOUD"]
        direction TB
        MYSQL_PRIMARY[("🐬 MySQL Primary<br/>(PlanetScale / TiDB /<br/>Railway MySQL)")]
        MYSQL_READ[("📖 MySQL Read Replica<br/>(Optional)")]
    end

    %% ===== DỊCH VỤ BÊN NGOÀI =====
    subgraph EXT_SERVICES["☁️ DỊCH VỤ BÊN NGOÀI"]
        direction TB
        subgraph MEDIA_CDN["📸 Media Storage"]
            CLOUDINARY["☁️ Cloudinary<br/>CDN & Image Processing<br/>(Auto-optimize, Resize,<br/>WebP conversion)"]
        end

        subgraph PAY_GW["💰 Payment Gateway"]
            SEPAY["💳 SePay<br/>(VietQR / MBBank)<br/>Webhook → Backend"]
        end

        subgraph AUTH_PROVIDERS["🔐 OAuth Providers"]
            GOOGLE["🔑 Google OAuth 2.0<br/>(accounts.google.com)"]
            FACEBOOK["🔑 Facebook OAuth<br/>(facebook.com)"]
        end

        subgraph EMAIL_SVC["📧 Email Service"]
            SENDGRID["📧 SendGrid / Resend<br/>(Transactional Email)"]
        end

        subgraph TRANSLATE_SVC["🌐 Translation"]
            GG_TRANS["🌐 Google Cloud<br/>Translate API"]
        end
    end

    %% ===== CONNECTIONS =====
    USERS -->|"HTTPS"| DNS
    DNS -->|"Route"| VERCEL_CDN
    VERCEL_CDN -->|"Static"| FE_STATIC
    VERCEL_CDN -->|"Dynamic"| FE_FUNC

    FE_FUNC -->|"REST API<br/>(HTTPS)"| BE_APP
    FE_BUILD -->|"WebSocket<br/>(WSS)"| BE_WS

    BE_APP -->|"Prisma<br/>(TCP/TLS)"| MYSQL_PRIMARY
    MYSQL_PRIMARY -.->|"Replication"| MYSQL_READ

    BE_APP -->|"Upload API"| CLOUDINARY
    BE_APP -->|"Webhook"| SEPAY
    SEPAY -->|"Callback<br/>(POST)"| BE_APP
    BE_APP -->|"OAuth"| GOOGLE
    BE_APP -->|"OAuth"| FACEBOOK
    BE_APP -->|"SMTP API"| SENDGRID
    BE_APP -->|"REST API"| GG_TRANS

    FE_BUILD -->|"Image URL"| CLOUDINARY

    %% ===== STYLING =====
    style USERS fill:#E3F2FD,stroke:#1565C0,stroke-width:2px
    style EDGE fill:#ECEFF1,stroke:#546E7A,stroke-width:2px
    style VERCEL_FE fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px
    style RENDER_BE fill:#EDE7F6,stroke:#4527A0,stroke-width:2px
    style DB_CLOUD fill:#FCE4EC,stroke:#C62828,stroke-width:2px
    style EXT_SERVICES fill:#FFF3E0,stroke:#E65100,stroke-width:2px
    style MEDIA_CDN fill:#E0F7FA,stroke:#00695C
    style PAY_GW fill:#FFF8E1,stroke:#F57F17
    style AUTH_PROVIDERS fill:#E8EAF6,stroke:#283593
    style EMAIL_SVC fill:#EFEBE9,stroke:#4E342E
    style TRANSLATE_SVC fill:#E8F5E9,stroke:#1B5E20
```

---

## Sơ đồ luồng CI/CD

```mermaid
flowchart LR
    subgraph DEV["👨‍💻 Development"]
        CODE["📝 Source Code"]
        GIT["🔀 Git Repository<br/>(GitHub)"]
    end

    subgraph CI["🔄 CI/CD Pipeline"]
        PUSH["Push / PR"]
        LINT["ESLint + Prettier"]
        TEST["Unit & E2E Tests"]
        BUILD["Build & Bundle"]
    end

    subgraph DEPLOY["🚀 Deployment"]
        direction TB
        STAGING["🟡 Staging<br/>(Preview)"]
        PROD["🟢 Production"]
    end

    CODE --> GIT
    GIT --> PUSH
    PUSH --> LINT
    LINT --> TEST
    TEST --> BUILD

    BUILD -->|"PR Preview"| STAGING
    BUILD -->|"Merge main"| PROD

    STAGING -.->|"Review & Test"| PROD

    style DEV fill:#E3F2FD,stroke:#1565C0
    style CI fill:#FFF3E0,stroke:#E65100
    style DEPLOY fill:#E8F5E9,stroke:#2E7D32
```

---

## Chi tiết hạ tầng triển khai

### 🟢 Frontend (Vercel)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Platform** | Vercel |
| **Framework** | Next.js (React 19) |
| **Build** | `next build` → Static + SSR |
| **CDN** | Vercel Edge Network (toàn cầu) |
| **Domain** | vietjourney.vn |
| **SSL** | Tự động (Let's Encrypt) |
| **Preview** | Tự động cho mỗi PR |

### 🟣 Backend (Vercel / Render)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Platform** | Vercel Serverless / Render |
| **Framework** | NestJS (Node.js) |
| **WebSocket** | Socket.io (Render Web Service) |
| **Cron Jobs** | Scheduled tasks (auto-cancel booking) |
| **Auto-scale** | Dựa trên traffic |
| **Health Check** | `/api/health` endpoint |

### 🗄️ Database (MySQL Cloud)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Provider** | PlanetScale / TiDB / Railway |
| **Engine** | MySQL 8.0+ |
| **ORM** | Prisma (migrations, seeding) |
| **Backup** | Tự động hàng ngày |
| **Connection** | TLS encrypted |

### ☁️ Cloudinary (Media CDN)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Loại file** | Ảnh homestay, phòng, tour, avatar, review |
| **Xử lý** | Auto-resize, WebP, lazy-load |
| **CDN** | Phân phối toàn cầu |
| **Giới hạn** | Tùy plan (Free: 25GB) |

### 💳 SePay (Payment)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Phương thức** | VietQR (Chuyển khoản ngân hàng) |
| **Ngân hàng** | MBBank |
| **Webhook** | POST callback khi nhận tiền |
| **Bảo mật** | Signature verification |

---

## Biến môi trường chính

```mermaid
mindmap
    root["🔒 Environment Variables"]
        Frontend
            NEXT_PUBLIC_API_URL
            NEXT_PUBLIC_SOCKET_URL
            NEXT_PUBLIC_CLOUDINARY_CLOUD
            NEXT_PUBLIC_GOOGLE_MAPS_KEY
        Backend
            DATABASE_URL
            JWT_SECRET
            JWT_REFRESH_SECRET
        OAuth
            GOOGLE_CLIENT_ID
            GOOGLE_CLIENT_SECRET
            FACEBOOK_APP_ID
            FACEBOOK_APP_SECRET
        Services
            CLOUDINARY_API_KEY
            CLOUDINARY_API_SECRET
            SEPAY_API_KEY
            SENDGRID_API_KEY
            GOOGLE_TRANSLATE_KEY
```
