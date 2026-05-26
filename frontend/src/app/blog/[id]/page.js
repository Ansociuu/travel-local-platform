"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogApi } from "@/lib/api";
import { ChevronLeft, Clock } from "lucide-react";

const fmtDate = (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "";

export default function BlogPostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([blogApi.getById(id), blogApi.getAll()])
      .then(([detail, all]) => {
        setPost(detail);
        setRelatedPosts(all.filter((item) => item.id !== detail.id).slice(0, 3));
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ height: "72px" }} />
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b", fontWeight: 700 }}>Đang tải bài viết...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Navbar theme="light" />
        <div style={{ height: "72px" }} />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2>Không tìm thấy bài viết</h2>
          <Link href="/blog" style={{ color: "#0d9488", fontWeight: 800 }}>Quay lại blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff" }}>
      <Navbar />
      <div style={{ height: "72px" }} />

      <main style={{ paddingBottom: "90px" }}>
        <div style={{ position: "relative", width: "100%", height: "58vh", minHeight: "400px", marginBottom: "56px" }}>
          <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.18))" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "64px 20px" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", textAlign: "center" }}>
              <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "14px", fontWeight: 700, padding: "8px 16px", borderRadius: "100px", cursor: "pointer", marginBottom: "28px" }}>
                <ChevronLeft size={16} /> Quay lại
              </button>
              <div style={{ marginBottom: "18px" }}>
                <span style={{ background: "#0d9488", color: "#fff", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 800 }}>
                  {post.category}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "46px", fontWeight: 900, color: "#fff", marginBottom: "24px", lineHeight: 1.15 }}>
                {post.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "18px", color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>
                {post.author?.id ? (
                  <Link href={`/profile/${post.author.id}`} style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || "User")}&background=0d9488&color=fff`} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.55)" }} />
                    <span>{post.author?.name}</span>
                  </Link>
                ) : (
                  <span>{post.author?.name}</span>
                )}
                <span>•</span>
                <span>{fmtDate(post.date)}</span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> {post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        <article style={{ maxWidth: "820px", margin: "0 auto", padding: "0 20px" }}>
          <p style={{ fontSize: "19px", color: "#475569", fontWeight: 600, lineHeight: 1.8, borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "32px", marginBottom: "36px" }}>
            {post.excerpt}
          </p>
          <div
            className="blog-content"
            style={{ fontSize: "18px", color: "#334155", lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {post.href && (
            <Link href={post.href} style={{ display: "inline-flex", marginTop: "36px", background: "#0d9488", color: "#fff", padding: "12px 20px", borderRadius: "12px", textDecoration: "none", fontWeight: 800 }}>
              Xem dịch vụ gốc
            </Link>
          )}
        </article>

        {relatedPosts.length > 0 && (
          <section style={{ maxWidth: "1180px", margin: "90px auto 0", padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "30px", fontWeight: 900, color: "#0f172a" }}>Khám phá thêm</h2>
              <Link href="/blog" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 800 }}>Tất cả bài viết</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "28px" }}>
              {relatedPosts.map((item) => (
                <Link key={item.id} href={`/blog/${item.id}`} className="glass-hover" style={{ textDecoration: "none" }}>
                  <div style={{ borderRadius: "18px", overflow: "hidden", height: "210px", marginBottom: "18px" }}>
                    <img src={item.coverImage} alt={item.title} className="card-img" />
                  </div>
                  <span style={{ color: "#0d9488", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>{item.category}</span>
                  <h3 style={{ color: "#0f172a", fontSize: 20, lineHeight: 1.35, marginTop: 8 }}>{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
