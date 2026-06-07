"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { couponsApi } from "@/lib/api";
import { CalendarClock, Check, Copy, Gift, Tag } from "lucide-react";

const fmt = (value) => Number(value || 0).toLocaleString("vi-VN");

function label(coupon) {
  if (coupon.discountType === "PERCENTAGE") return `Giảm ${Number(coupon.value)}%`;
  return `Giảm ${fmt(coupon.value)}đ`;
}

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState([]);
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("vj-saved-coupon") || "";
  });

  useEffect(() => {
    couponsApi.getPublic().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const saveCode = async (code) => {
    await navigator.clipboard?.writeText(code).catch(() => {});
    localStorage.setItem("vj-saved-coupon", code);
    setSaved(code);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar theme="light" />
      <div style={{ height: 72 }} />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px 90px" }}>
        <section style={{ marginBottom: 30 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 900, marginBottom: 12 }}>
            <Gift size={18} /> VietJourney Deals
          </div>
          <h1 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: 36, fontWeight: 950 }}>Ưu đãi & voucher</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 650, maxWidth: 680, lineHeight: 1.6 }}>
            Lưu mã đang hoạt động để áp dụng nhanh tại checkout. Mã đã lưu sẽ được gợi ý tự động trong bước thanh toán.
          </p>
        </section>

        {coupons.length === 0 ? (
          <div style={{ padding: 50, borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-secondary)", fontWeight: 800 }}>
            Hiện chưa có voucher công khai.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
            {coupons.map((coupon) => (
              <article key={coupon.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
                <div style={{ padding: 18, background: "linear-gradient(135deg, #0d9488, #14b8a6)", color: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <Tag size={22} />
                    <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2 }}>{coupon.code}</span>
                  </div>
                  <h2 style={{ margin: "24px 0 4px", fontSize: 28, fontWeight: 950 }}>{label(coupon)}</h2>
                  <div style={{ fontSize: 13, fontWeight: 750, opacity: 0.9 }}>{coupon.description || "Ưu đãi đặt tour và homestay"}</div>
                </div>
                <div style={{ padding: 18, display: "grid", gap: 12 }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 750 }}>
                    Đơn tối thiểu: {coupon.minOrder ? `${fmt(coupon.minOrder)}đ` : "Không yêu cầu"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13, fontWeight: 750 }}>
                    <CalendarClock size={15} /> Hết hạn {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                  </div>
                  <button onClick={() => saveCode(coupon.code)} style={{ marginTop: 6, border: "none", borderRadius: 12, background: saved === coupon.code ? "#dcfce7" : "var(--text-primary)", color: saved === coupon.code ? "#047857" : "var(--bg-card)", padding: "12px 14px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {saved === coupon.code ? <Check size={17} /> : <Copy size={17} />} {saved === coupon.code ? "Đã lưu mã" : "Lưu mã"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div style={{ marginTop: 30, textAlign: "center" }}>
          <Link href="/tours" style={{ color: "var(--accent)", fontWeight: 900, textDecoration: "none" }}>Khám phá tour để dùng voucher</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
