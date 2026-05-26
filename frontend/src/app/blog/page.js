"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogApi } from "@/lib/api";
import { Clock } from "lucide-react";

const fmtDate = (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getAll()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))];
  const featuredPost = posts[0];
  const filteredPosts = activeCategory === "Tất cả"
    ? posts.slice(1)
    : posts.slice(1).filter((post) => post.category === activeCategory);

  return (
    <div style={{ background: "#ffffff" }}>
      <Navbar />
      <div style={{ height: "72px", background: "#0f172a" }} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ fontSize: "14px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>VIETJOURNEY EDITORIAL</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "48px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>
            Cảm hứng xê dịch
          </h1>
          <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "640px", margin: "0 auto", lineHeight: 1.6 }}>
            Bài viết được tạo từ tour và homestay đã duyệt, giúp nội dung luôn khớp dữ liệu thật trên hệ thống.
          </p>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontWeight: 700 }}>Đang tải bài viết...</div>}
        {!loading && posts.length === 0 && <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontWeight: 700 }}>Chưa có bài viết từ dữ liệu đã duyệt.</div>}

        {featuredPost && (
          <div style={{ marginBottom: "72px" }}>
            <Link href={`/blog/${featuredPost.id}`} style={{ textDecoration: "none" }}>
              <div className="glass-hover" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderRadius: "24px", overflow: "hidden", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ minHeight: "420px", overflow: "hidden" }}>
                  <img src={featuredPost.coverImage} alt={featuredPost.title} className="card-img" />
                </div>
                <div style={{ padding: "56px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ background: "rgba(13,148,136,0.1)", color: "#0d9488", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 800, marginBottom: "22px", width: "fit-content" }}>
                    {featuredPost.category}
                  </span>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "34px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", lineHeight: 1.2 }}>
                    {featuredPost.title}
                  </h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.7, marginBottom: "28px" }}>{featuredPost.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <img src={featuredPost.author?.avatar} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{featuredPost.author?.name}</div>
                      <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                        {fmtDate(featuredPost.date)} • <Clock size={12} /> {featuredPost.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {posts.length > 0 && (
          <div className="region-scroll" style={{ display: "flex", gap: "12px", marginBottom: "40px", overflowX: "auto", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: "12px 22px",
                  borderRadius: "100px",
                  border: "none",
                  background: activeCategory === category ? "#0f172a" : "transparent",
                  color: activeCategory === category ? "#fff" : "#64748b",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="glass-hover" style={{ textDecoration: "none", display: "flex", flexDirection: "column", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ height: "220px", overflow: "hidden" }}>
                <img src={post.coverImage} alt={post.title} className="card-img" />
              </div>
              <div style={{ padding: "22px", display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: 900, textTransform: "uppercase", marginBottom: "10px" }}>{post.category}</span>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "21px", fontWeight: 800, color: "#0f172a", marginBottom: "14px", lineHeight: 1.35 }}>{post.title}</h3>
                <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "22px" }}>{post.excerpt}</p>
                <div style={{ marginTop: "auto", paddingTop: "18px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 13, fontWeight: 700 }}>
                  <span>{post.author?.name}</span>
                  <span>{fmtDate(post.date)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
