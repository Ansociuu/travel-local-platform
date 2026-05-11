"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelCard from "@/components/HotelCard";
import SkeletonCard from "@/components/SkeletonCard";
import DatePicker from "@/components/DatePicker";
import { hotelsApi, wishlistApi } from "@/lib/api";
import dynamic from "next/dynamic";
import { Search, MapPin, Bed, Bath, Users, Star, Heart, Calendar, Filter, Map, List, Home, Tent, Building2, Trees } from "lucide-react";

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: "100%", width: "100%", background: "#f8fafc", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Đang tải bản đồ...</div>
});

export default function HomestaysPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [guests, setGuests] = useState(0);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [category, setCategory] = useState("ALL");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: 'selection'
    }
  ]);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);

  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        const data = await hotelsApi.getAll();
        const formatted = data.map(h => ({
          id: h.id,
          name: h.name,
          location: h.city,
          type: h.type,
          price: h.rooms?.[0]?.basePrice?.toString() || "0",
          per: "đêm",
          rating: h.rating,
          beds: h.rooms?.[0]?.capacity || 2,
          baths: 1,
          guests: h.rooms?.[0]?.capacity || 2,
          lat: h.lat,
          lng: h.lng,
          amenities: h.amenities?.map(a => a.amenity.name) || [],
          images: h.images?.length > 0 ? h.images : ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500&q=80"]
        }));
        setHomestays(formatted);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
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
            if (item.hotelId) wishMap[item.hotelId] = true;
          });
          setWishlist(wishMap);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchHomestays();
    fetchWishlist();
  }, []);

  // Advanced Filter Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [searchFocus, setSearchFocus] = useState(false);

  const filteredLocations = Array.from(new Set(homestays.map(h => h.location))).filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery);
  const filteredHotelNames = homestays.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery);

  const toggleWishlist = async (id) => {
    if (!localStorage.getItem("token")) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }
    try {
      const res = await wishlistApi.toggle({ hotelId: id });
      setWishlist(p => ({ ...p, [id]: res.status === 'liked' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const parsePrice = (priceStr) => parseInt(priceStr.replace(/,/g, ''));

  const filteredHomestays = homestays.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGuests = guests === 0 || h.guests >= guests;
    const matchBedrooms = minBedrooms === 0 || h.beds >= minBedrooms;
    const matchCategory = category === "ALL" || h.type === category;
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(h.type);
    const matchRating = h.rating >= minRating;
    const matchAmenities = selectedAmenities.length === 0 || selectedAmenities.every(am => h.amenities.includes(am));

    let matchPrice = true;
    const numPrice = parsePrice(h.price);
    if (priceRange === "under1m") matchPrice = numPrice < 1000000;
    else if (priceRange === "1m-3m") matchPrice = numPrice >= 1000000 && numPrice <= 3000000;
    else if (priceRange === "over3m") matchPrice = numPrice > 3000000;

    return matchSearch && matchGuests && matchBedrooms && matchPrice && matchCategory && matchType && matchRating && matchAmenities;
  });

  const categories = [
    { id: "ALL", name: "Tất cả", icon: <Map size={24} /> },
    { id: "RESORT", name: "Resort cao cấp", icon: <Trees size={24} /> },
    { id: "VILLA", name: "Biệt thự", icon: <Home size={24} /> },
    { id: "HOTEL", name: "Khách sạn", icon: <Building2 size={24} /> },
    { id: "HOMESTAY", name: "Homestay", icon: <Tent size={24} /> },
  ];

  const glassCard = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s"
  };

  return (
    <>
      <Navbar theme="dark" />

      {/* SPACING CHO TOP NAV */}
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 80px" }}>

        {/* HEADER TITLE */}
        <div style={{ padding: "40px 0 30px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-1px" }}>Tìm kiếm chỗ ở lý tưởng</h1>
          <p style={{ fontSize: "16px", color: "#64748b" }}>Khám phá hàng ngàn khách sạn, resort và homestay tuyệt đẹp trên khắp Việt Nam</p>
        </div>

        {/* TOP FILTER BAR */}
        <div style={{ position: "sticky", top: "82px", zIndex: 90, background: "#ffffff", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>

            <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "12px 20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", zIndex: searchFocus ? 101 : 1, position: "relative" }}>
                <MapPin size={18} color="#64748b" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
                  placeholder="Tìm kiếm địa điểm, tên khách sạn..."
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: "15px", fontWeight: 600, color: "#0f172a", width: "100%" }}
                />
              </div>

              {searchFocus && searchQuery && (filteredLocations.length > 0 || filteredHotelNames.length > 0) && (
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
                  {filteredHotelNames.length > 0 && (
                    <div style={{ padding: "8px 16px 0", borderTop: filteredLocations.length > 0 ? "1px solid #f1f5f9" : "none" }}>
                      <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, marginBottom: "8px", letterSpacing: "1px" }}>Chỗ ở</h4>
                      {filteredHotelNames.map(h => (
                        <div key={h.id} onClick={() => { setSearchQuery(h.name); setSearchFocus(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Home size={16} color="#d97706" />
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{h.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePicker(!showDatePicker)} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "14px 20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                <Calendar size={18} color="#64748b" />
                <div style={{ fontSize: "15px", fontWeight: 600, color: hasSelectedDate ? "#0f172a" : "#64748b" }}>
                  {hasSelectedDate ? `${dateRange[0].startDate.toLocaleDateString('vi-VN')} - ${dateRange[0].endDate.toLocaleDateString('vi-VN')}` : "Chọn ngày"}
                </div>
              </div>
              {showDatePicker && (
                <div style={{ position: "absolute", top: "60px", left: "0", background: "#fff", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "16px", zIndex: 100, border: "1px solid rgba(0,0,0,0.05)" }}>
                  <DatePicker ranges={dateRange} onChange={item => { setDateRange([item.selection]); setHasSelectedDate(true); }} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button onClick={() => setShowDatePicker(false)} style={{ background: "#0d9488", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Xong</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} style={{ appearance: "none", display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "14px 40px 14px 44px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", fontSize: "15px", fontWeight: 600, color: "#0f172a", outline: "none" }}>
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

            <button style={{ background: "#0d9488", color: "#fff", border: "none", padding: "14px 24px", borderRadius: "16px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(13,148,136,0.3)" }}>
              <Search size={18} /> Tìm
            </button>

            <button onClick={() => setShowFilterModal(true)} style={{ background: "#ffffff", color: "#0f172a", border: "1px solid rgba(0,0,0,0.1)", padding: "14px", borderRadius: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}>
              <Filter size={18} />
            </button>

            <button onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")} style={{ background: viewMode === "map" ? "#0f172a" : "#ffffff", color: viewMode === "map" ? "#ffffff" : "#0f172a", border: "1px solid rgba(0,0,0,0.1)", padding: "14px 20px", borderRadius: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", fontWeight: 600 }}>
              {viewMode === "grid" ? <><Map size={18} /> Bản đồ</> : <><List size={18} /> Dạng lưới</>}
            </button>
          </div>
        </div>

        {/* CATEGORY BAR */}
        <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "24px", marginBottom: "24px", scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", color: category === cat.id ? "#0f172a" : "#64748b", borderBottom: category === cat.id ? "2px solid #0f172a" : "2px solid transparent", paddingBottom: "12px", transition: "all 0.2s", minWidth: "80px" }}
              onMouseEnter={e => { if (category !== cat.id) e.currentTarget.style.color = "#0f172a"; }}
              onMouseLeave={e => { if (category !== cat.id) e.currentTarget.style.color = "#64748b"; }}
            >
              {cat.icon}
              <span style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        {viewMode === "map" ? (
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 50%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px", paddingRight: "8px" }}>
              {loading ? (
                [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
              ) : filteredHomestays.length > 0 ? (
                filteredHomestays.map((h) => (
                  <HotelCard key={h.id} hotel={h} isWishlist={wishlist[h.id] || false} toggleWishlist={toggleWishlist} />
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b" }}>Không tìm thấy kết quả phù hợp.</p>
                </div>
              )}
            </div>
            <div style={{ flex: "1", position: "sticky", top: "180px", height: "calc(100vh - 200px)", borderRadius: "24px", overflow: "hidden", zIndex: 1, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
              <MapComponent homestays={filteredHomestays} />
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredHomestays.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
            {filteredHomestays.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                isWishlist={wishlist[h.id]}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <Search size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Không tìm thấy homestay nào phù hợp</h3>
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.</p>
            <button onClick={() => { setSearchQuery(""); setGuests(0); setPriceRange("all"); setMinBedrooms(0); setSelectedAmenities([]); setSelectedTypes([]); setMinRating(0); }} style={{ marginTop: "20px", background: "#f8fafc", border: "1px solid rgba(0,0,0,0.1)", color: "#0f172a", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

      </main>

      {/* FILTER MODAL */}
      {showFilterModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Backdrop */}
          <div onClick={() => setShowFilterModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}></div>

          {/* Modal Content */}
          <div style={{ position: "relative", background: "#ffffff", width: "100%", maxWidth: "500px", borderRadius: "24px", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", zIndex: 1001 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Bộ lọc nâng cao</h2>
              <button onClick={() => setShowFilterModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748b" }}>&times;</button>
            </div>

            {/* Modal Scroll Content */}
            <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "8px" }}>
              {/* Price Range */}
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Khoảng giá (1 đêm)</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                    <input type="radio" name="price" checked={priceRange === "all"} onChange={() => setPriceRange("all")} style={{ width: "auto", transform: "scale(1.2)", margin: 0 }} /> <span>Mọi mức giá</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                    <input type="radio" name="price" checked={priceRange === "under1m"} onChange={() => setPriceRange("under1m")} style={{ width: "auto", transform: "scale(1.2)", margin: 0 }} /> <span>Dưới 1,000,000 ₫</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                    <input type="radio" name="price" checked={priceRange === "1m-3m"} onChange={() => setPriceRange("1m-3m")} style={{ width: "auto", transform: "scale(1.2)", margin: 0 }} /> <span>1,000,000 ₫ - 3,000,000 ₫</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                    <input type="radio" name="price" checked={priceRange === "over3m"} onChange={() => setPriceRange("over3m")} style={{ width: "auto", transform: "scale(1.2)", margin: 0 }} /> <span>Trên 3,000,000 ₫</span>
                  </label>
                </div>
              </div>

              {/* Property Types */}
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Loại hình chỗ ở</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {["HOTEL", "RESORT", "VILLA", "HOMESTAY"].map(type => (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                      <input type="checkbox" checked={selectedTypes.includes(type)} onChange={(e) => {
                        if (e.target.checked) setSelectedTypes([...selectedTypes, type]);
                        else setSelectedTypes(selectedTypes.filter(t => t !== type));
                      }} style={{ width: "20px", height: "20px", accentColor: "#0d9488" }} />
                      <span>{type === "HOTEL" ? "Khách sạn" : type === "RESORT" ? "Resort" : type === "VILLA" ? "Biệt thự" : "Homestay"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Tiện nghi</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {["Wifi tốc độ cao", "Hồ bơi vô cực", "Bếp tiện nghi", "Bãi đậu xe miễn phí", "Điều hòa nhiệt độ", "Smart TV"].map(am => (
                    <label key={am} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                      <input type="checkbox" checked={selectedAmenities.includes(am)} onChange={(e) => {
                        if (e.target.checked) setSelectedAmenities([...selectedAmenities, am]);
                        else setSelectedAmenities(selectedAmenities.filter(a => a !== am));
                      }} style={{ width: "20px", height: "20px", accentColor: "#0d9488" }} />
                      <span>{am}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Đánh giá tối thiểu</h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[0, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setMinRating(star)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid", borderColor: minRating === star ? "#0d9488" : "#cbd5e1", background: minRating === star ? "#f0fdfa" : "#fff", color: minRating === star ? "#0d9488" : "#475569", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {star === 0 ? "Tất cả" : `${star}+ Sao`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Phòng ngủ</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "15px", color: "#475569", fontWeight: 500 }}>Số lượng tối thiểu</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => setMinBedrooms(Math.max(0, minBedrooms - 1))} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0f172a", fontSize: "18px" }}>-</button>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", width: "20px", textAlign: "center" }}>{minBedrooms === 0 ? "Bất kỳ" : minBedrooms}</span>
                    <button onClick={() => setMinBedrooms(minBedrooms + 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0f172a", fontSize: "18px" }}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <button onClick={() => { setPriceRange("all"); setMinBedrooms(0); setSelectedAmenities([]); setSelectedTypes([]); setMinRating(0); }} style={{ background: "none", border: "none", fontSize: "15px", fontWeight: 600, color: "#0f172a", cursor: "pointer", textDecoration: "underline" }}>Xóa tất cả</button>
              <button className="shimmer-btn" onClick={() => setShowFilterModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                Hiển thị kết quả
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
