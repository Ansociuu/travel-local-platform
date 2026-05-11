import "./globals.css";
import HydrationHandler from "@/components/HydrationHandler";

export const metadata = {
  title: "VietJourney - Đặt Tour & Homestay Cao Cấp",
  description: "Nền tảng đặt tour và homestay hàng đầu Việt Nam. Trải nghiệm thực, giá tốt nhất, hỗ trợ 24/7.",
  verification: {
    google: "hPxwfelF99ea2j2tA0RoR_qntB2XvEYXHZQzRfjEpSg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <HydrationHandler>{children}</HydrationHandler>
      </body>
    </html>
  );
}
