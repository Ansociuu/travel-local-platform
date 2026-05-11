"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/mockData";
import { ArrowRight, Clock, User } from "lucide-react";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const categories = ["Tất cả", "Tips Du Lịch", "Văn Hóa", "Trải Nghiệm", "Kinh Nghiệm"];

  const featuredPost = blogPosts[0];
  
  const filteredPosts = activeCategory === "Tất cả" 
    ? blogPosts.slice(1) 
    : blogPosts.slice(1).filter(post => post.category === activeCategory);

  return (
    <div style={{ background: "#ffffff" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px 80px" }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ fontSize: "14px", color: "#0d9488", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>VIETJOURNEY EDITORIAL</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "48px", fontWeight: 800, color: "#0f172a", marginBottom: "24px", letterSpacing: "-1.5px" }}>
            Cảm hứng xê dịch
          </h1>
          <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Khám phá những câu chuyện, kinh nghiệm và vẻ đẹp văn hóa qua lăng kính của những người đam mê du lịch.
          </p>
        </div>

        {/* FEATURED POST */}
        <div style={{ marginBottom: "80px" }}>
          <Link href={`/blog/${featuredPost.id}`} style={{ textDecoration: "none" }}>
            <div className="glass-hover" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0", borderRadius: "32px", overflow: "hidden", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ height: "100%", minHeight: "450px", overflow: "hidden" }}>
                <img src={featuredPost.coverImage} alt={featuredPost.title} className="card-img" />
              </div>
              <div style={{ padding: "64px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ display: "inline-block", background: "rgba(13,148,136,0.1)", color: "#0d9488", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "24px", width: "fit-content" }}>
                  {featuredPost.category}
                </span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "36px", fontWeight: 800, color: "#0f172a", marginBottom: "24px", lineHeight: 1.2, letterSpacing: "-1px" }}>
                  {featuredPost.title}
                </h2>
                <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.7, marginBottom: "32px" }}>
                  {featuredPost.excerpt}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img src={featuredPost.author.avatar} alt="Author" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{featuredPost.author.name}</div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                      {featuredPost.date} • <Clock size={12} /> {featuredPost.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* CATEGORIES */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", overflowX: "auto", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.05)" }} className="region-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "12px 24px",
                borderRadius: "100px",
                border: "none",
                background: activeCategory === cat ? "#0f172a" : "transparent",
                color: activeCategory === cat ? "#fff" : "#64748b",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* POSTS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "40px" }}>
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", borderRadius: "24px", overflow: "hidden" }} className="glass-hover">
              <div style={{ height: "240px", overflow: "hidden" }}>
                <img src={post.coverImage} alt={post.title} className="card-img" />
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: "13px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", display: "block" }}>
                  {post.category}
                </span>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", lineHeight: 1.4 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {post.excerpt}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={post.author.avatar} style={{ width: "24px", height: "24px", borderRadius: "50%" }} /> {post.author.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>{post.date}</div>
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
