"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, ThumbsUp, Star } from "lucide-react";
import { reviewsApi } from "@/lib/api";

export default function ReviewEnhancements({ reviews = [], title = "Đánh giá" }) {
  const [sort, setSort] = useState("newest");
  const [items, setItems] = useState(reviews);

  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: items.filter((review) => review.rating === rating).length,
  })), [items]);

  const avg = items.length ? (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1) : "0.0";

  const sorted = useMemo(() => {
    const next = [...items];
    if (sort === "highest") next.sort((a, b) => b.rating - a.rating);
    else if (sort === "photos") next.sort((a, b) => Number((b.images || []).length > 0) - Number((a.images || []).length > 0));
    else next.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return next;
  }, [items, sort]);

  const helpful = async (review) => {
    try {
      const res = await reviewsApi.helpful(review.id);
      setItems((prev) => prev.map((item) => item.id === review.id ? { ...item, helpfulCount: res.helpfulCount } : item));
    } catch {}
  };

  return (
    <section style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: 24, fontWeight: 900 }}>{title}</h2>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 180, height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", padding: "0 10px", fontWeight: 800 }}>
          <option value="newest">Mới nhất</option>
          <option value="highest">Rating cao nhất</option>
          <option value="photos">Có ảnh</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 26, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22, marginBottom: 22 }} className="app-two-col">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, color: "var(--text-primary)", fontWeight: 950 }}>{avg}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 3, margin: "8px 0" }}>
            {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="#f59e0b" color="#f59e0b" />)}
          </div>
          <div style={{ color: "var(--text-secondary)", fontWeight: 750, fontSize: 13 }}>{items.length} đánh giá</div>
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          {distribution.map((row) => {
            const pct = items.length ? (row.count / items.length) * 100 : 0;
            return (
              <div key={row.rating} style={{ display: "grid", gridTemplateColumns: "44px 1fr 38px", gap: 10, alignItems: "center", color: "var(--text-secondary)", fontSize: 13, fontWeight: 800 }}>
                <span>{row.rating} sao</span>
                <span style={{ height: 8, borderRadius: 999, background: "var(--bg-muted)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--accent)" }} />
                </span>
                <span>{row.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ color: "var(--text-secondary)", fontWeight: 700 }}>Chưa có đánh giá nào.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="app-two-col">
          {sorted.map((review) => {
            const images = Array.isArray(review.images) ? review.images : [];
            return (
              <article key={review.id || `${review.user?.name}-${review.createdAt}`} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <img src={review.user?.avatar || review.avatar || "https://ui-avatars.com/api/?name=Guest&background=0d9488&color=fff"} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 900 }}>{review.user?.name || review.name || "Khách hàng"}</div>
                    <div style={{ display: "flex", gap: 2, marginTop: 4 }}>{[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < review.rating ? "#f59e0b" : "none"} color={idx < review.rating ? "#f59e0b" : "#cbd5e1"} />)}</div>
                  </div>
                </div>
                <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 600 }}>{review.comment || "Trải nghiệm tốt."}</p>
                {images.length > 0 && (
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
                    {images.map((src) => <img key={src} src={src} alt="" style={{ width: 86, height: 70, objectFit: "cover", borderRadius: 10 }} />)}
                  </div>
                )}
                {review.replyContent && (
                  <div style={{ background: "var(--bg-muted)", borderRadius: 12, padding: 12, color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>
                    <strong style={{ color: "var(--text-primary)" }}>Phản hồi từ owner:</strong> {review.replyContent}
                  </div>
                )}
                <button onClick={() => helpful(review)} style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", borderRadius: 10, padding: "8px 10px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <ThumbsUp size={15} /> Hữu ích ({review.helpfulCount || 0})
                </button>
                {images.length > 0 && <span style={{ marginLeft: 10, color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}><ImageIcon size={13} /> Có ảnh</span>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
