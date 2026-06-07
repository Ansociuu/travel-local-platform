"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Search, X } from "lucide-react";
import { searchApi } from "@/lib/api";

const groups = [
  ["tours", "Tour"],
  ["homestays", "Homestay"],
  ["blog", "Blog"],
];

export default function UnifiedSearch({ compact = false }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [recent, setRecent] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("vj-recent-searches") || "[]");
    } catch {
      return [];
    }
  });
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (query.trim().length < 2) {
      const resetTimer = window.setTimeout(() => {
        if (!cancelled) setResults(null);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(resetTimer);
      };
    }
    const timer = window.setTimeout(async () => {
      try {
        const data = await searchApi.search(query.trim());
        if (!cancelled) {
          setResults(data);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults(null);
      }
    }, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const saveRecent = (term = query) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    const next = [cleaned, ...recent.filter((item) => item !== cleaned)].slice(0, 6);
    setRecent(next);
    localStorage.setItem("vj-recent-searches", JSON.stringify(next));
  };

  const renderItem = (item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => {
        saveRecent();
        setOpen(false);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        gap: 10,
        textDecoration: "none",
        color: "inherit",
        padding: "9px 10px",
        borderRadius: 10,
      }}
    >
      <img
        src={item.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=120&q=80"}
        alt=""
        style={{ width: 42, height: 42, borderRadius: 9, objectFit: "cover" }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--text-primary)", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
        <span style={{ display: "block", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.subtitle}</span>
      </span>
    </Link>
  );

  return (
    <div ref={ref} style={{ position: "relative", width: compact ? "100%" : 280 }}>
      <div style={{
        height: 38,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 12,
        padding: "0 12px",
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}>
        <Search size={16} color="var(--text-secondary)" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm tour, homestay, blog..."
          style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && (query.trim().length >= 2 || recent.length > 0) && (
        <div style={{
          position: "absolute",
          top: 46,
          right: 0,
          width: "min(460px, calc(100vw - 32px))",
          maxHeight: "72vh",
          overflowY: "auto",
          zIndex: 1200,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 22px 60px rgba(15,23,42,0.2)",
          padding: 10,
        }}>
          {query.trim().length < 2 && (
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", padding: "8px 10px" }}>Tìm gần đây</div>
              {recent.map((term) => (
                <button key={term} onClick={() => setQuery(term)} style={{ width: "100%", border: "none", background: "transparent", display: "flex", alignItems: "center", gap: 10, padding: "10px", color: "var(--text-primary)", fontWeight: 800, cursor: "pointer" }}>
                  <Clock size={15} /> {term}
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && results && (
            <>
              {groups.map(([key, label]) => results[key]?.length > 0 && (
                <section key={key} style={{ marginBottom: 6 }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", padding: "8px 10px" }}>{label}</div>
                  {results[key].map(renderItem)}
                </section>
              ))}
              {groups.every(([key]) => !results[key]?.length) && (
                <div style={{ padding: 22, textAlign: "center", color: "var(--text-secondary)", fontWeight: 700 }}>Không tìm thấy kết quả phù hợp</div>
              )}
              {results.recommendations?.length > 0 && (
                <section>
                  <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", padding: "8px 10px" }}>Có thể bạn thích</div>
                  {results.recommendations.slice(0, 4).map(renderItem)}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
