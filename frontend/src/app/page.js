"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Destinations from "@/components/Destinations";
import FeatureBanner from "@/components/FeatureBanner";
import Homestays from "@/components/Homestays";
import Testimonials from "@/components/Testimonials";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* === AURORA BACKGROUND === */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", top: "-200px", left: "-150px", background: "radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)", animation: "aurora1 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", top: "100px", right: "-100px", background: "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)", animation: "aurora2 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", bottom: "10%", left: "30%", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", animation: "aurora1 18s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <Navbar />
      <HeroSection />
      <Destinations />
      <FeatureBanner />
      <Homestays />
      <Testimonials />
      <CtaSection />
      <Footer />



      {/* === BACK TO TOP === */}
      {showBackTop && (
        <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 200, width: "48px", height: "48px", borderRadius: "14px", background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.35)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 8px 24px rgba(6,182,212,0.2)", animation: "popIn 0.3s ease" }}>
          ↑
        </button>
      )}
    </>
  );
}
