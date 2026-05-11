"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/mockData";
import { ChevronLeft, Share2, Heart, Clock } from "lucide-react";

export default function BlogPostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const post = blogPosts.find((p) => p.id === parseInt(id)) || blogPosts[0];
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div style={{ background: "#ffffff" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>

      <main style={{ paddingBottom: "100px" }}>
        
        {/* HERO HEADER */}
        <div style={{ position: "relative", width: "100%", height: "60vh", minHeight: "400px", maxHeight: "600px", marginBottom: "64px" }}>
          <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)" }}></div>
          
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "64px 20px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", textAlign: "center" }}>
              <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "8px 16px", borderRadius: "100px", cursor: "pointer", marginBottom: "32px", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>
                <ChevronLeft size={16} /> Quay lại
              </button>
              
              <div style={{ marginBottom: "20px" }}>
                <span style={{ background: "#0d9488", color: "#fff", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {post.category}
                </span>
              </div>
              
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "48px", fontWeight: 800, color: "#ffffff", marginBottom: "32px", lineHeight: 1.2, letterSpacing: "-1px", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                {post.title}
              </h1>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", color: "rgba(255,255,255,0.9)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src={post.author.avatar} alt="Author" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{post.author.name}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>Tác giả</div>
                  </div>
                </div>
                <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.3)" }}></div>
                <div style={{ textAlign: "left", fontSize: "14px", fontWeight: 500 }}>
                  <div>{post.date}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <Clock size={14} /> {post.readTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.1)", marginBottom: "40px" }}>
            <div style={{ fontSize: "18px", color: "#475569", fontWeight: 500, lineHeight: 1.8, fontStyle: "italic" }}>
              "{post.excerpt}"
            </div>
            <div style={{ display: "flex", gap: "16px", marginLeft: "32px" }}>
              <button style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0f172a", transition: "all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#e2e8f0"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                <Share2 size={20} />
              </button>
              <button style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", transition: "all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div 
            className="blog-content"
            style={{ fontSize: "18px", color: "#334155", lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: post.content || "<p>Nội dung bài viết đang được cập nhật. Vui lòng quay lại sau.</p><p>Tại VietJourney, chúng tôi luôn mong muốn mang đến những trải nghiệm du lịch tuyệt vời nhất cho bạn. Hãy khám phá các tour du lịch và homestay hấp dẫn của chúng tôi trong thời gian chờ đợi nhé!</p>" }}
          />

          {/* AUTHOR TAGS */}
          <div style={{ marginTop: "64px", padding: "32px", background: "#f8fafc", borderRadius: "24px", display: "flex", alignItems: "center", gap: "24px" }}>
            <img src={post.author.avatar} alt="Author" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Viết bởi</div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>{post.author.name}</h3>
              <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6 }}>Một người đam mê xê dịch, luôn tìm kiếm những góc nhìn mới mẻ và những câu chuyện thú vị trên mỗi hành trình khám phá vẻ đẹp Việt Nam.</p>
            </div>
          </div>

        </div>

        {/* RELATED POSTS */}
        <div style={{ maxWidth: "1280px", margin: "100px auto 0", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>Khám phá thêm</h2>
            <Link href="/blog" style={{ fontSize: "15px", fontWeight: 700, color: "#0d9488", textDecoration: "none" }}>Xem tất cả bài viết</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "40px" }}>
            {relatedPosts.map((rPost) => (
              <Link key={rPost.id} href={`/blog/${rPost.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }} className="glass-hover">
                <div style={{ borderRadius: "24px", overflow: "hidden", height: "240px", marginBottom: "24px" }}>
                  <img src={rPost.coverImage} alt={rPost.title} className="card-img" />
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", display: "block" }}>
                    {rPost.category}
                  </span>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", lineHeight: 1.4 }}>
                    {rPost.title}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>{rPost.date}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
