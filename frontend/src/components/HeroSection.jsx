"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AnimatedCounter from "./AnimatedCounter";
import { stats } from "../data/mockData";
import { Map, MapPin, Calendar, Clock, Users, Compass, Smile, Home, Star, ChevronDown, Plus, Minus, Search } from "lucide-react";

const bgImages = [
  "https://a.cdn-hotels.com/gdcs/production77/d1902/21336448-81d8-4643-a1b9-1545d08172de.jpg",
  "https://khoinguonsangtao.vn/wp-content/uploads/2022/11/hinh-anh-sapa.jpg",
  "https://www.agoda.com/wp-content/uploads/2024/01/Featured-image-Hoi-An-ancient-town.jpg",
  "https://static.vinwonders.com/production/kinh-nghiem-du-lich-phu-quoc-banner.jpg",
];
const textOptions = ["Hạ Long", "Sapa", "Hội An", "Phú Quốc"];
const suggestions = [
  { text: "Vịnh Hạ Long", icon: <Compass size={16} color="#0d9488" /> },
  { text: "Sapa mờ sương", icon: <Compass size={16} color="#0d9488" /> },
  { text: "Phố cổ Hội An", icon: <Compass size={16} color="#0d9488" /> }
];

const StatIcon = ({ name }) => {
  const props = { size: 28, color: "#0d9488", strokeWidth: 2 };
  if (name === "Map") return <Map {...props} />;
  if (name === "Smile") return <Smile {...props} />;
  if (name === "Home") return <Home {...props} />;
  if (name === "Star") return <Star {...props} />;
  return null;
};

export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tour");
  const [bgIndex, setBgIndex] = useState(0);
  const [destQuery, setDestQuery] = useState("");
  
  // Custom Popover States
  const [activePicker, setActivePicker] = useState(null); // 'destination' | 'dates' | 'guests' | null
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [dateFlexibility, setDateFlexibility] = useState(0);
  const [dateTab, setDateTab] = useState("calendar"); // 'calendar' | 'flexible'
  const [flexibleOption, setFlexibleOption] = useState(null); // 'weekend' | 'weekday' | 'this-month' | 'next-month' | null
  
  // Guest States
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Calendar display state
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // Start at June 2026
  const [isMobile, setIsMobile] = useState(false);

  const searchContainerRef = useRef(null);

  // Check screen size for calendar responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Background image loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(p => (p + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Outside click handler to close popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setActivePicker(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Calendar Helper Functions
  const handleDayMouseEnter = (day) => {
    setHoveredDate(day);
  };

  const selectNextMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    setStartDate(start);
    setEndDate(end);
    setFlexibleOption("next-month");
  };

  const selectThisMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (today.getDate() === end.getDate()) {
      selectNextMonth();
      return;
    }
    
    start.setDate(today.getDate() + 1);
    
    setStartDate(start);
    setEndDate(end);
    setFlexibleOption("this-month");
  };

  const selectWeekend = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    let start = new Date(today);
    let end = new Date(today);
    
    if (dayOfWeek === 5) {
      start = today;
      end.setDate(today.getDate() + 2);
    } else if (dayOfWeek === 6) {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() + 1);
    } else {
      const daysToFriday = dayOfWeek === 0 ? 5 : (5 - dayOfWeek);
      start.setDate(today.getDate() + daysToFriday);
      end.setDate(start.getDate() + 2);
    }
    
    setStartDate(start);
    setEndDate(end);
    setFlexibleOption("weekend");
  };

  const selectWeekday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const end = new Date(today);
    
    if (dayOfWeek >= 1 && dayOfWeek <= 3) {
      start.setDate(today.getDate() - (dayOfWeek - 1));
      end.setDate(start.getDate() + 4);
    } else {
      const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
      start.setDate(today.getDate() + daysToMonday);
      end.setDate(start.getDate() + 4);
    }
    
    setStartDate(start);
    setEndDate(end);
    setFlexibleOption("weekday");
  };

  const handleFlexibleOptionClick = (option) => {
    if (option === "weekend") selectWeekend();
    else if (option === "weekday") selectWeekday();
    else if (option === "this-month") selectThisMonth();
    else if (option === "next-month") selectNextMonth();
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday start
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= numDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (day < today) return;

    setFlexibleOption(null);

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setStartDate(day);
      } else {
        setEndDate(day);
        setActivePicker(null); // auto close
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isPrevDisabled = () => {
    const today = new Date();
    return currentMonth.getFullYear() <= today.getFullYear() && currentMonth.getMonth() <= today.getMonth();
  };

  const isDaySelected = (day) => {
    if (!day) return false;
    return (startDate && day.toDateString() === startDate.toDateString()) || 
           (endDate && day.toDateString() === endDate.toDateString());
  };

  const isDayInRange = (day) => {
    if (!day) return false;
    if (startDate && endDate) {
      return day > startDate && day < endDate;
    }
    if (startDate && hoveredDate) {
      return (day > startDate && day < hoveredDate) || (day < startDate && day > hoveredDate);
    }
    return false;
  };

  const formatDateShort = (date) => {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, '0')} thg ${date.getMonth() + 1}`;
  };

  // Search button action
  const handleSearchSubmit = () => {
    const formattedStart = startDate ? startDate.toISOString().split("T")[0] : "";
    const formattedEnd = endDate ? endDate.toISOString().split("T")[0] : "";
    const totalGuests = adults + childrenCount;
    
    if (activeTab === "tour") {
      router.push(`/tours?location=${encodeURIComponent(destQuery)}&date=${formattedStart}&guests=${totalGuests}`);
    } else {
      router.push(`/homestays?location=${encodeURIComponent(destQuery)}&startDate=${formattedStart}&endDate=${formattedEnd}&guests=${totalGuests}&adults=${adults}&children=${childrenCount}&rooms=${rooms}`);
    }
  };

  const glassCard = {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
  };

  // Generate Calendars
  const month1 = currentMonth;
  const month2 = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const daysMonth1 = getDaysInMonth(month1.getFullYear(), month1.getMonth());
  const daysMonth2 = getDaysInMonth(month2.getFullYear(), month2.getMonth());
  return (
    <section id="hero" className="hero-section" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", textAlign: "center", overflow: "visible" }}>
      {/* BACKGROUND SLIDESHOW */}
      <div style={{ position: "absolute", inset: 0, zIndex: -2, overflow: "hidden" }}>
        {bgImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: bgIndex === i ? 1 : 0, transition: "opacity 1.5s ease-in-out", transform: bgIndex === i ? "scale(1.05)" : "scale(1)", transitionProperty: "opacity, transform", transitionDuration: "1.5s, 6s" }}
          />
        ))}
      </div>

      {/* DARK OVERLAY */}
      <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 60%, #f8fafc 100%)" }} />

      <div className="hero-text" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "28px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#14b8a6", display: "inline-block", boxShadow: "0 0 10px #14b8a6", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        Nền tảng du lịch cao cấp
      </div>

      <h1 className="hero-text-2 hero-h1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "24px", maxWidth: "900px" }}>
        <span style={{ color: "#fff" }}>Khám phá </span>
        <span key={bgIndex} style={{ display: "inline-block", color: "#fbbf24", animation: "slideDown 0.5s ease", textShadow: "0 4px 20px rgba(251,191,36,0.3)" }}>
          {textOptions[bgIndex]}
        </span>
        <br />
        <span style={{ color: "#fff" }}>theo cách riêng của bạn</span>
      </h1>

      <p className="hero-text-3" style={{ fontSize: "17px", color: "rgba(255,255,255,0.9)", maxWidth: "560px", lineHeight: 1.7, marginBottom: "48px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
        Trải nghiệm những điểm đến tuyệt vời nhất với dịch vụ chuẩn 5 sao, mức giá minh bạch và hỗ trợ tận tâm 24/7.
      </p>

      {/* SEARCH BOX */}
      <div className="hero-search" ref={searchContainerRef} style={{ width: "100%", maxWidth: "920px", marginBottom: "60px", position: "relative", zIndex: 10 }}>
        
        {/* TOUR / HOMESTAY TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", justifyContent: "center" }}>
          {[["tour", "Tour du lịch", <Map size={16} />], ["homestay", "Homestay", <Home size={16} />]].map(([key, label, icon]) => (
            <button key={key} className="tab-btn" onClick={() => { setActiveTab(key); setActivePicker(null); }} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, background: activeTab === key ? "#fff" : "rgba(255,255,255,0.2)", backdropFilter: activeTab === key ? "none" : "blur(10px)", border: activeTab === key ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.3)", color: activeTab === key ? "#0f172a" : "#fff", display: "flex", alignItems: "center", gap: "8px", boxShadow: activeTab === key ? "0 4px 15px rgba(0,0,0,0.1)" : "none" }}>
              <span style={{ color: activeTab === key ? "#0d9488" : "inherit" }}>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* CONTAINER WITH YELLLOW BORDER */}
        <div style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "24px",
          boxShadow: activePicker !== null ? "0 20px 60px rgba(0,0,0,0.12)" : "0 10px 40px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
          transition: "all 0.3s ease"
        }}>
          <div className="search-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr auto", gap: "10px", alignItems: "stretch" }}>

            {/* DESTINATION INPUT */}
            <div 
              onClick={() => setActivePicker("destination")}
              style={{ position: "relative", background: "#f8fafc", borderRadius: "16px", padding: "14px 18px", border: "1px solid transparent", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                <MapPin size={12} color="#0d9488" /> Điểm đến
              </div>
              <input
                placeholder="VD: Hội An..."
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }}
              />

              {activePicker === "destination" && (
                <div style={{ position: "absolute", top: "105%", left: 0, right: 0, marginTop: "8px", background: "#ffffff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", padding: "12px", zIndex: 110, textAlign: "left", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "slideDown 0.2s ease" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", fontWeight: 700, paddingLeft: "8px" }}>GỢI Ý PHỔ BIẾN</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        style={{ padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}
                        onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                        onMouseDown={(e) => { e.preventDefault(); setDestQuery(item.text); setActivePicker(null); }}
                      >
                        {item.icon} {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DATE RANGE SELECTOR */}
            <div 
              onClick={(e) => { if (activePicker !== "dates") setActivePicker("dates"); }}
              style={{ position: "relative", background: "#f8fafc", borderRadius: "16px", padding: "14px 18px", border: "1px solid transparent", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                  <Calendar size={12} color="#0d9488" /> {activeTab === "tour" ? "Ngày đi" : "Nhận phòng — Trả phòng"}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: (startDate || endDate) ? "#0f172a" : "#64748b" }}>
                  {startDate ? (
                    endDate ? `${formatDateShort(startDate)} — ${formatDateShort(endDate)}` : `${formatDateShort(startDate)} — ...`
                  ) : (
                    "nn/mm/yyyy"
                  )}
                </div>
              </div>
              <Calendar size={16} color="#64748b" style={{ flexShrink: 0, marginLeft: "12px" }} />

              {/* CUSTOM CALENDAR POPULAR PICKER */}
              {activePicker === "dates" && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{ position: "absolute", top: "105%", left: isMobile ? "0" : "-100px", marginTop: "8px", background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: "24px", zIndex: 120, width: isMobile ? "320px" : "680px", maxWidth: "calc(100vw - 32px)", display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  {/* TABS LỊCH / NGÀY LINH HOẠT */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", gap: "24px" }}>
                    <button 
                      onClick={() => setDateTab("calendar")} 
                      style={{ background: "none", border: "none", paddingBottom: "8px", borderBottom: dateTab === "calendar" ? "2px solid #0068ff" : "2px solid transparent", color: dateTab === "calendar" ? "#0068ff" : "#475569", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}
                    >
                      Lịch
                    </button>
                    <button 
                      onClick={() => setDateTab("flexible")} 
                      style={{ background: "none", border: "none", paddingBottom: "8px", borderBottom: dateTab === "flexible" ? "2px solid #0068ff" : "2px solid transparent", color: dateTab === "flexible" ? "#0068ff" : "#475569", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}
                    >
                      Ngày linh hoạt
                    </button>
                  </div>

                  {dateTab === "calendar" ? (
                    <>
                      {/* DUAL CALENDAR MONTHS */}
                      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "32px", position: "relative" }}>
                        
                        {/* MONTH 1 */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <button 
                              disabled={isPrevDisabled()} 
                              onClick={handlePrevMonth}
                              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "50%", color: isPrevDisabled() ? "#cbd5e1" : "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onMouseEnter={(e) => { if (!isPrevDisabled()) e.currentTarget.style.background = "#f1f5f9" }}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              &lt;
                            </button>
                            <span style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>
                              tháng {month1.getMonth() + 1} {month1.getFullYear()}
                            </span>
                            <div style={{ width: "28px" }} /> {/* spacer */}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "8px" }}>
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
                              <div key={idx} style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>{w}</div>
                            ))}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                            {daysMonth1.map((day, idx) => {
                              if (!day) return <div key={`empty-${idx}`} />;
                              const isSel = isDaySelected(day);
                              const isRng = isDayInRange(day);
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const isPast = day < today;

                              return (
                                <button
                                  key={`d1-${idx}`}
                                  disabled={isPast}
                                  onClick={() => handleDayClick(day)}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    border: "none",
                                    borderRadius: "50%",
                                    background: isSel ? "#0068ff" : (isRng ? "#f0f6ff" : "transparent"),
                                    color: isPast ? "#cbd5e1" : (isSel ? "#fff" : (isRng ? "#0068ff" : "#0f172a")),
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    cursor: isPast ? "default" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    handleDayMouseEnter(day);
                                    if (!isPast && !isSel && !isRng) e.currentTarget.style.background = "#f1f5f9";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isPast && !isSel && !isRng) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  {day.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* MONTH 2 */}
                        {!isMobile && (
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                              <div style={{ width: "28px" }} /> {/* spacer */}
                              <span style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>
                                tháng {month2.getMonth() + 1} {month2.getFullYear()}
                              </span>
                              <button 
                                onClick={handleNextMonth}
                                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "50%", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                &gt;
                              </button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "8px" }}>
                              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
                                <div key={idx} style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>{w}</div>
                              ))}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                              {daysMonth2.map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} />;
                                const isSel = isDaySelected(day);
                                const isRng = isDayInRange(day);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const isPast = day < today;

                                return (
                                  <button
                                    key={`d2-${idx}`}
                                    disabled={isPast}
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      border: "none",
                                      borderRadius: "50%",
                                      background: isSel ? "#0068ff" : (isRng ? "#f0f6ff" : "transparent"),
                                      color: isPast ? "#cbd5e1" : (isSel ? "#fff" : (isRng ? "#0068ff" : "#0f172a")),
                                      fontWeight: 700,
                                      fontSize: "14px",
                                      cursor: isPast ? "default" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.15s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      handleDayMouseEnter(day);
                                      if (!isPast && !isSel && !isRng) e.currentTarget.style.background = "#f1f5f9";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isPast && !isSel && !isRng) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {day.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* BOTTOM ACCURATE / FLEXIBLE DATES SELECTION */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                        {[
                          { val: 0, label: "Ngày chính xác" },
                          { val: 1, label: "+ 1 ngày" },
                          { val: 2, label: "+ 2 ngày" },
                          { val: 3, label: "+ 3 ngày" },
                          { val: 7, label: "+ 7 ngày" }
                        ].map((pill) => (
                          <button
                            key={pill.val}
                            onClick={() => setDateFlexibility(pill.val)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "100px",
                              border: dateFlexibility === pill.val ? "1px solid #0068ff" : "1px solid #cbd5e1",
                              background: dateFlexibility === pill.val ? "#f0f6ff" : "#ffffff",
                              color: dateFlexibility === pill.val ? "#0068ff" : "#475569",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {pill.val > 0 && <Plus size={12} />} {pill.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                      <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "8px" }}>Chọn thời điểm bạn muốn đi du lịch</p>
                      <p style={{ fontSize: "13px" }}>Chúng tôi sẽ tìm các gợi ý tuyệt vời trong khoảng thời gian của bạn.</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
                        {[
                          { key: "weekend", label: "Cuối tuần" },
                          { key: "weekday", label: "Trong tuần" },
                          { key: "this-month", label: "Tháng này" },
                          { key: "next-month", label: "Tháng sau" }
                        ].map((opt) => {
                          const active = flexibleOption === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleFlexibleOptionClick(opt.key)}
                              style={{
                                padding: "10px 18px",
                                borderRadius: "10px",
                                border: active ? "1px solid #0068ff" : "1px solid #cbd5e1",
                                background: active ? "rgba(0, 104, 255, 0.1)" : "#fff",
                                color: active ? "#0068ff" : "#0f172a",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* THIRD COLUMN: DURATION (TOUR) OR GUESTS (HOMESTAY) */}
            {activeTab === "tour" ? (
              <div style={{ position: "relative", background: "#f8fafc", borderRadius: "16px", padding: "14px 18px", border: "1px solid transparent", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    <Clock size={12} color="#0d9488" /> Thời gian
                  </div>
                  <select 
                    style={{ 
                      fontSize: "15px", 
                      fontWeight: 700, 
                      color: "#0f172a", 
                      border: "none", 
                      outline: "none", 
                      background: "transparent", 
                      width: "100%", 
                      appearance: "none", 
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    <option value="2-3">2 - 3 ngày</option>
                    <option value="4-5">4 - 5 ngày</option>
                    <option value="7">1 tuần</option>
                    <option value="14">2 tuần+</option>
                  </select>
                </div>
                <ChevronDown size={16} color="#64748b" style={{ pointerEvents: "none", flexShrink: 0, marginLeft: "12px" }} />
              </div>
            ) : (
              <div 
                onClick={(e) => { if (activePicker !== "guests") setActivePicker("guests"); }}
                style={{ position: "relative", background: "#f8fafc", borderRadius: "16px", padding: "14px 18px", border: "1px solid transparent", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0d9488", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    <Users size={12} color="#0d9488" /> Số khách & Phòng
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {adults} người lớn · {childrenCount} trẻ em · {rooms} phòng
                  </div>
                </div>
                <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0, marginLeft: "12px" }} />

                {/* CUSTOM GUEST COUNT POPUP */}
                {activePicker === "guests" && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{ position: "absolute", top: "105%", right: 0, marginTop: "8px", background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: "20px", zIndex: 120, width: "290px", display: "flex", flexDirection: "column", gap: "16px" }}
                  >
                    {/* ADULTS */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>Người lớn</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Từ 18 tuổi trở lên</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button 
                          disabled={adults <= 1}
                          onClick={() => setAdults(adults - 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: adults <= 1 ? "default" : "pointer", opacity: adults <= 1 ? 0.5 : 1 }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ width: "20px", textAlign: "center", fontWeight: 700, fontSize: "15px" }}>{adults}</span>
                        <button 
                          onClick={() => setAdults(adults + 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* CHILDREN */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>Trẻ em</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Từ 0 đến 17 tuổi</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button 
                          disabled={childrenCount <= 0}
                          onClick={() => setChildrenCount(childrenCount - 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: childrenCount <= 0 ? "default" : "pointer", opacity: childrenCount <= 0 ? 0.5 : 1 }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ width: "20px", textAlign: "center", fontWeight: 700, fontSize: "15px" }}>{childrenCount}</span>
                        <button 
                          onClick={() => setChildrenCount(childrenCount + 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* ROOMS */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>Phòng</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Số lượng phòng cần đặt</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button 
                          disabled={rooms <= 1}
                          onClick={() => setRooms(rooms - 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: rooms <= 1 ? "default" : "pointer", opacity: rooms <= 1 ? 0.5 : 1 }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ width: "20px", textAlign: "center", fontWeight: 700, fontSize: "15px" }}>{rooms}</span>
                        <button 
                          onClick={() => setRooms(rooms + 1)}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* DONE BUTTON */}
                    <button 
                      onClick={() => setActivePicker(null)}
                      style={{ background: "#0068ff", color: "#fff", border: "none", borderRadius: "10px", padding: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#0056d6"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#0068ff"}
                    >
                      Xong
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SEARCH BUTTON */}
            <button 
              onClick={handleSearchSubmit}
              style={{
                borderRadius: "16px",
                padding: "0 32px",
                color: "#fff",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
                border: "1.5px solid #000000",
                background: "#0d9488",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "#0b7a70";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(13, 148, 136, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.background = "#0d9488";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 148, 136, 0.2)";
              }}
            >
              Khám phá
            </button>

          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="hero-stats stats-row" style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", padding: "16px 28px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <StatIcon name={s.icon} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

