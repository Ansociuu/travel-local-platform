"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import SkeletonCard from "@/components/SkeletonCard";
import SingleDatePicker from "@/components/SingleDatePicker";
import { toursApi, wishlistApi } from "@/lib/api";
import { Search, Filter, SlidersHorizontal, ArrowDownAZ, MapPin, Calendar, Users, Tent } from "lucide-react";

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [regionFilters, setRegionFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [durationFilters, setDurationFilters] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [wishlist, setWishlist] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [guests, setGuests] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredLocations = Array.from(new Set(tours.map(t => t.location))).filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery);
  const filteredTourNames = tours.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery);

  const tagColorMap = { Bestseller: "#0d9488", Hot: "#d97706", New: "#059669", Luxury: "#b45309" };
  const tags = ["Bestseller", "Hot", "New", "Luxury"];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await toursApi.getAll();
        const toursWithTags = data.map((tour, idx) => {
          const tag = tags[idx % tags.length];
          return { ...tour, tag, tagColor: tagColorMap[tag] };
        });
        setTours(toursWithTags);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (localStorage.getItem("token")) {
        try {
          const data = await wishlistApi.getMyWishlist();
          const wishMap = {};
          data.forEach(item => {
            if (item.tourId) wishMap[item.tourId] = true;
          });
          setWishlist(wishMap);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchTours();
    fetchWishlist();
  }, []);

  const toggleWishlist = async (id) => {
    if (!localStorage.getItem("token")) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }
    try {
      const res = await wishlistApi.toggle({ tourId: id });
      setWishlist(p => ({ ...p, [id]: res.status === 'liked' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegionChange = (val) => {
    setRegionFilters(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  };

  const handleDurationChange = (val) => {
    setDurationFilters(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  };

  const filteredTours = tours.filter((tour) => {
    // Search by Name or Location
    if (searchQuery && !tour.name.toLowerCase().includes(searchQuery.toLowerCase()) && !tour.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Region
    if (regionFilters.length > 0) {
      const isBac = ['Hà Giang', 'Sapa', 'Hạ Long', 'Cát Bà'].some(k => tour.location.includes(k));
      const isTrung = ['Đà Nẵng', 'Hội An', 'Huế', 'Đà Lạt'].some(k => tour.location.includes(k));
      const isNam = ['Cần Thơ', 'Sài Gòn', 'Phú Quốc'].some(k => tour.location.includes(k));
      let matchRegion = false;
      if (regionFilters.includes("bac") && isBac) matchRegion = true;
      if (regionFilters.includes("trung") && isTrung) matchRegion = true;
      if (regionFilters.includes("nam") && isNam) matchRegion = true;
      if (!matchRegion) return false;
    }

    // Price
    if (parseFloat(tour.basePrice) > maxPrice) return false;

    // Duration
    if (durationFilters.length > 0) {
      let match = false;
      if (durationFilters.includes("short") && tour.durationDays <= 2) match = true;
      if (durationFilters.includes("medium") && (tour.durationDays === 3 || tour.durationDays === 4)) match = true;
      if (durationFilters.includes("long") && tour.durationDays > 4) match = true;
      if (!match) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return parseFloat(a.basePrice) - parseFloat(b.basePrice);
    if (sortBy === "price_desc") return parseFloat(b.basePrice) - parseFloat(a.basePrice);
    if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
    return 0; // default
  });

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar theme="dark" />

      {/* SPACING CHO TOP NAV */}
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 80px" }}>

        {/* HEADER TITLE */}
        <div style={{ padding: "40px 0 30px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-1px" }}>Khám phá Hành trình</h1>
          <p style={{ fontSize: "16px", color: "#64748b" }}>Trải nghiệm văn hóa, chinh phục thiên nhiên cùng những tour du lịch tuyệt vời</p>
        </div>

        {/* TOP SEARCH BAR (Sticky like Homestays) */}
        <div style={{ position: "sticky", top: "82px", zIndex: 90, background: "#ffffff", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>

            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "14px 20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", zIndex: searchFocus ? 101 : 1, position: "relative", height: "52px" }}>
                <MapPin size={18} color="#64748b" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
                  placeholder="Tìm kiếm điểm đến, tên tour..."
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: "15px", fontWeight: 600, color: "#0f172a", width: "100%" }}
                />
              </div>

              {searchFocus && searchQuery && (filteredLocations.length > 0 || filteredTourNames.length > 0) && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", background: "#fff", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)", padding: "12px 0", zIndex: 100, maxHeight: "300px", overflowY: "auto" }}>
                  {filteredLocations.length > 0 && (
                    <div style={{ padding: "0 16px 8px" }}>
                      <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, marginBottom: "8px", letterSpacing: "1px" }}>Địa điểm</h4>
                      {filteredLocations.map(loc => (
                        <div key={loc} onClick={() => { setSearchQuery(loc); setSearchFocus(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <MapPin size={16} color="#0d9488" />
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredTourNames.length > 0 && (
                    <div style={{ padding: "8px 16px 0", borderTop: filteredLocations.length > 0 ? "1px solid #f1f5f9" : "none" }}>
                      <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, marginBottom: "8px", letterSpacing: "1px" }}>Tour</h4>
                      {filteredTourNames.map(t => (
                        <div key={t.id} onClick={() => { setSearchQuery(t.name); setSearchFocus(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Tent size={16} color="#d97706" />
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePicker(!showDatePicker)} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "14px 20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.2s", height: "52px" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                <Calendar size={18} color="#64748b" />
                <span style={{ fontSize: "15px", fontWeight: 600, color: hasSelectedDate ? "#0f172a" : "#64748b", whiteSpace: "nowrap" }}>
                  {hasSelectedDate ? selectedDate.toLocaleDateString('vi-VN') : "Chọn ngày"}
                </span>
              </div>
              {showDatePicker && (
                <div style={{ position: "absolute", top: "60px", left: "0", background: "#fff", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "16px", zIndex: 100, border: "1px solid rgba(0,0,0,0.05)" }}>
                  <SingleDatePicker date={selectedDate} onChange={item => { setSelectedDate(item); setHasSelectedDate(true); }} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button onClick={() => setShowDatePicker(false)} style={{ background: "#0d9488", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Xong</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} style={{ appearance: "none", display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "14px 40px 14px 44px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", fontSize: "15px", fontWeight: 600, color: "#0f172a", outline: "none", height: "52px", whiteSpace: "nowrap" }}>
                <option value={0}>Mọi số khách</option>
                <option value={1}>1 khách</option>
                <option value={2}>2 khách</option>
                <option value={4}>4 khách</option>
                <option value={6}>6+ khách</option>
              </select>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <Users size={18} color="#64748b" />
              </div>
            </div>

            <button className="shimmer-btn" style={{ background: "#0d9488", border: "none", color: "#ffffff", padding: "0 24px", borderRadius: "16px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(13,148,136,0.3)", height: "52px" }}>
              <Search size={18} /> Tìm
            </button>
          </div>
        </div>
        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-btn" style={{ display: "none", marginBottom: "20px" }}>
          <button onClick={() => setShowMobileFilters(!showMobileFilters)} style={{ width: "100%", padding: "14px", background: "#fff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
            <SlidersHorizontal size={18} color="#0d9488" /> Bộ lọc tìm kiếm
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "32px", alignItems: "start" }} className="tours-layout-grid">

          {/* LEFT SIDEBAR: FILTERS */}
          <aside className={`filters-sidebar ${showMobileFilters ? "show" : ""}`} style={{ display: "flex", flexDirection: "column", gap: "32px", position: "sticky", top: "100px", height: "max-content" }}>
            <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "18px", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                <Filter size={20} color="#0d9488" /> Bộ lọc
              </div>

              {/* Loại hình */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Loại hình</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { val: "trekking", label: "Trekking & Khám phá" },
                    { val: "resort", label: "Nghỉ dưỡng" },
                    { val: "culture", label: "Văn hóa bản địa" },
                    { val: "cruise", label: "Du thuyền" }
                  ].map(opt => (
                    <label key={opt.val} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                      <input type="checkbox" checked={typeFilters.includes(opt.val)} onChange={() => setTypeFilters(prev => prev.includes(opt.val) ? prev.filter(v => v !== opt.val) : [...prev, opt.val])} style={{ width: "16px", height: "16px", accentColor: "#0d9488", cursor: "pointer" }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Khu vực */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Khu vực</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { val: "bac", label: "Miền Bắc" },
                    { val: "trung", label: "Miền Trung" },
                    { val: "nam", label: "Miền Nam" }
                  ].map(opt => (
                    <label key={opt.val} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                      <input type="checkbox" checked={regionFilters.includes(opt.val)} onChange={() => handleRegionChange(opt.val)} style={{ width: "16px", height: "16px", accentColor: "#0d9488", cursor: "pointer" }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Mức giá */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Mức giá tối đa</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="range" min="500000" max="10000000" step="500000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: "#0d9488", cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b", fontWeight: 600 }}>
                    <span>0₫</span>
                    <span style={{ color: "#0d9488" }}>{maxPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              {/* Thời gian */}
              <div style={{ marginBottom: "0" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Thời gian</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { val: "short", label: "1 - 2 ngày" },
                    { val: "medium", label: "3 - 4 ngày" },
                    { val: "long", label: "Trên 4 ngày" }
                  ].map(opt => (
                    <label key={opt.val} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                      <input type="checkbox" checked={durationFilters.includes(opt.val)} onChange={() => handleDurationChange(opt.val)} style={{ width: "16px", height: "16px", accentColor: "#0d9488", cursor: "pointer" }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: RESULTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Top Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Tìm thấy <span style={{ color: "#0d9488" }}>{loading ? 0 : filteredTours.length}</span> kết quả
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ArrowDownAZ size={18} color="#64748b" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", fontSize: "14px", fontWeight: 600, color: "#0f172a", outline: "none", cursor: "pointer" }}>
                  <option value="default">Đề xuất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating_desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Tours Grid */}
            <div className="results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                filteredTours.map(tour => (
                  <TourCard key={tour.id} tour={tour} isWishlist={wishlist[tour.id]} toggleWishlist={toggleWishlist} />
                ))
              )}
            </div>

            {!loading && filteredTours.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Search size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Không tìm thấy kết quả</h3>
                <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Thử điều chỉnh bộ lọc để xem nhiều tour hơn nhé.</p>
                <button onClick={() => { setRegionFilters([]); setMaxPrice(10000000); setDurationFilters([]); setSearchQuery(""); }} style={{ marginTop: "20px", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.1)", color: "#0f172a", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                  Xóa bộ lọc
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
