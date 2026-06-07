"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { exploreApi } from "@/lib/api";
import { Filter, ListFilter, MapPin, Star } from "lucide-react";

const ExploreMap = dynamic(() => import("./ExploreMap"), { ssr: false });

const fmt = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function ExplorePage() {
  const [filters, setFilters] = useState({ type: "all", minPrice: "", maxPrice: "", rating: "" });
  const [data, setData] = useState({ items: [], markers: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileList, setMobileList] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await exploreApi.getAll(filters);
        if (!cancelled) {
          setData(res);
          setSelected(res.items?.[0] || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const markers = useMemo(() => data.markers || [], [data]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar theme="light" />
      <div style={{ height: 72 }} />
      <main style={{ height: "calc(100vh - 72px)", display: "grid", gridTemplateColumns: "380px 1fr", overflow: "hidden" }} className="app-two-col">
        <aside style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)", overflowY: "auto", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>Khám phá bản đồ</h1>
            <Filter size={20} color="var(--accent)" />
          </div>

          <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
            <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)} style={fieldStyle}>
              <option value="all">Tất cả</option>
              <option value="hotel">Homestay</option>
              <option value="tour">Tour</option>
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} placeholder="Giá từ" type="number" style={fieldStyle} />
              <input value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} placeholder="Đến" type="number" style={fieldStyle} />
            </div>
            <select value={filters.rating} onChange={(e) => updateFilter("rating", e.target.value)} style={fieldStyle}>
              <option value="">Mọi rating</option>
              <option value="4.5">Từ 4.5 sao</option>
              <option value="4">Từ 4 sao</option>
              <option value="3">Từ 3 sao</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ color: "var(--text-secondary)", fontWeight: 800 }}>{loading ? "Đang tải..." : `${data.items.length} kết quả`}</div>
            <ListFilter size={17} color="var(--text-secondary)" />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {data.items.map((item) => (
              <button key={`${item.type}-${item.id}`} onClick={() => setSelected(item)} style={{ textAlign: "left", display: "grid", gridTemplateColumns: "96px 1fr", gap: 12, borderRadius: 14, border: selected?.id === item.id && selected?.type === item.type ? "2px solid var(--accent)" : "1px solid var(--border)", background: "var(--bg-card)", padding: 10, cursor: "pointer" }}>
                <img src={item.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=240&q=80"} alt="" style={{ width: 96, height: 82, borderRadius: 10, objectFit: "cover" }} />
                <span>
                  <span style={{ display: "inline-flex", marginBottom: 5, color: "var(--accent)", fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>{item.type === "tour" ? "Tour" : "Homestay"}</span>
                  <span style={{ display: "block", color: "var(--text-primary)", fontWeight: 900, fontSize: 14, lineHeight: 1.3 }}>{item.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, marginTop: 5 }}><MapPin size={12} /> {item.city}</span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ color: "var(--warning)", fontWeight: 900 }}>{fmt(item.price)}đ</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800 }}><Star size={12} fill="#f59e0b" color="#f59e0b" /> {item.rating || 0}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section style={{ position: "relative", minHeight: 420 }}>
          <ExploreMap markers={markers} onSelect={setSelected} />
          {selected && (
            <div style={{ position: "absolute", left: 20, bottom: 20, width: "min(360px, calc(100vw - 40px))", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 18px 50px rgba(15,23,42,0.22)", overflow: "hidden", zIndex: 600 }}>
              <img src={selected.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=720&q=80"} alt="" style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>{selected.type === "tour" ? "Tour" : "Homestay"}</div>
                <h2 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: 18, fontWeight: 900 }}>{selected.name}</h2>
                <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.45 }}>{selected.description?.slice(0, 130)}...</p>
                <Link href={selected.href} style={{ display: "inline-flex", justifyContent: "center", width: "100%", padding: "12px", borderRadius: 12, background: "var(--accent)", color: "#fff", textDecoration: "none", fontWeight: 900 }}>Xem chi tiết</Link>
              </div>
            </div>
          )}
          <button onClick={() => setMobileList((value) => !value)} style={{ display: "none", position: "absolute", right: 16, top: 16, zIndex: 700, border: "none", background: "var(--accent)", color: "#fff", borderRadius: 12, padding: "11px 14px", fontWeight: 900 }} className="mobile-filter-btn">
            {mobileList ? "Ẩn danh sách" : "Danh sách"}
          </button>
        </section>
      </main>
    </div>
  );
}

const fieldStyle = {
  height: 42,
  borderRadius: 11,
  border: "1px solid var(--border)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  padding: "0 12px",
  fontWeight: 750,
};
