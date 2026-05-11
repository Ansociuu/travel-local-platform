"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Menu, X } from "lucide-react";

export default function Navbar({ theme = "default" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const glassNav = {
    background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
    backdropFilter: scrolled ? "blur(24px)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
    borderBottom: scrolled ? "1px solid rgba(0,0,0,0.05)" : "none",
    boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.03)" : "none",
    transition: "all 0.4s ease",
  };

  const isLightTheme = theme === "light";
  const textColor = scrolled ? "#0f172a" : (isLightTheme ? "#0f172a" : "#fff");

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 40px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", ...glassNav }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0d9488, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(20,184,166,0.3)" }}>
          <Plane size={20} color="#fff" />
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>
          <span style={{ color: "#14b8a6" }}>Viet</span><span style={{ color: textColor }}>Journey</span>
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="nav-desktop" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        <Link href="/" className={`${(scrolled || isLightTheme) ? "nav-link" : "nav-link-light"} ${pathname === "/" ? "active" : ""}`} style={{textDecoration: "none"}}>Khám phá</Link>
        <Link href="/tours" className={`${(scrolled || isLightTheme) ? "nav-link" : "nav-link-light"} ${pathname.startsWith("/tours") ? "active" : ""}`} style={{textDecoration: "none"}}>Tour</Link>
        <Link href="/homestays" className={`${(scrolled || isLightTheme) ? "nav-link" : "nav-link-light"} ${pathname.startsWith("/homestays") ? "active" : ""}`} style={{textDecoration: "none"}}>Homestay</Link>
        <Link href="/blog" className={`${(scrolled || isLightTheme) ? "nav-link" : "nav-link-light"} ${pathname.startsWith("/blog") ? "active" : ""}`} style={{textDecoration: "none"}}>Blog</Link>
        <Link href="/contact" className={`${(scrolled || isLightTheme) ? "nav-link" : "nav-link-light"} ${pathname.startsWith("/contact") ? "active" : ""}`} style={{textDecoration: "none"}}>Liên hệ</Link>
      </div>

      <div className="nav-auth" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <img src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${textColor}` }} />
              <span style={{ color: textColor, fontSize: "14px", fontWeight: 600 }}>{user.name}</span>
            </Link>
            <button 
              onClick={handleLogout}
              style={{ textDecoration: "none", background: "transparent", border: scrolled ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.3)", color: textColor, padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontFamily: "'Inter', sans-serif", fontWeight: 600, transition: "all 0.2s" }}
            >
              Thoát
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none", background: "transparent", border: (scrolled || isLightTheme) ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.3)", color: textColor, padding: "8px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontFamily: "'Inter', sans-serif", fontWeight: 600, transition: "all 0.2s" }}>Đăng nhập</Link>
            <Link href="/register" className="shimmer-btn" style={{ textDecoration: "none", display: "inline-block", padding: "8px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: "none", boxShadow: "0 4px 15px rgba(20,184,166,0.3)" }}>Đăng ký</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="mobile-hamburger" onClick={() => setMobileMenu(p => !p)} style={{ display: "none", background: scrolled ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", color: textColor }}>
        {mobileMenu ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu dropdown */}
      {mobileMenu && (
        <div className="mobile-menu" style={{ position: "absolute", top: "72px", left: 0, right: 0, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "20px 40px 24px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 200, boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
          <Link href="/" className="nav-link" style={{ textAlign: "left", padding: "10px 0", fontSize: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", color: "#0f172a", textDecoration: "none" }} onClick={() => setMobileMenu(false)}>Khám phá</Link>
          <Link href="/tours" className="nav-link" style={{ textAlign: "left", padding: "10px 0", fontSize: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", color: "#0f172a", textDecoration: "none" }} onClick={() => setMobileMenu(false)}>Tour</Link>
          <Link href="/homestays" className="nav-link" style={{ textAlign: "left", padding: "10px 0", fontSize: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", color: "#0f172a", textDecoration: "none" }} onClick={() => setMobileMenu(false)}>Homestay</Link>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <Link href="/login" style={{ textDecoration: "none", textAlign: "center", flex: 1, background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "#0f172a", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Đăng nhập</Link>
            <Link href="/register" className="shimmer-btn" style={{ textDecoration: "none", textAlign: "center", flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, border: "none" }}>Đăng ký</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
