"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockHomestayDetail } from "@/data/mockData";
import { hotelsApi } from "@/lib/api";
import { MapPin, Heart, Share, Star, CheckCircle2, ChevronRight, Grid, ChevronDown, ChevronUp, MessageSquare, Bed, Bath, Users, Wifi, Coffee, Tv, Car, Wind, Waves } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import DatePicker from "@/components/DatePicker";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function HomestayDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [homeBasic, setHomeBasic] = useState(null);
  const [homeDetail, setHomeDetail] = useState(null);

  const [wishlist, setWishlist] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingGuests, setBookingGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await hotelsApi.getById(id);
        setHomeBasic({
          id: data.id,
          name: data.name,
          location: data.city,
          price: data.rooms?.[0]?.basePrice?.toString() || "0",
          rating: data.rating,
          lat: data.lat,
          lng: data.lng,
        });
        
        setHomeDetail({
          type: data.type === 'HOTEL' ? 'Khách sạn' : data.type === 'HOMESTAY' ? 'Homestay' : data.type,
          description: data.description,
          gallery: data.images?.length > 0 ? data.images : mockHomestayDetail.gallery,
          capacity: {
            guests: data.rooms?.[0]?.capacity || 2,
            bedrooms: data.rooms?.length || 1,
            beds: data.rooms?.[0]?.capacity || 2,
            baths: 1
          },
          amenities: data.amenities?.length > 0 ? data.amenities.map(a => ({
            icon: "CheckCircle2", // Fallback if no exact match
            label: a.amenity.name
          })) : mockHomestayDetail.amenities,
          rules: data.policies?.length > 0 ? data.policies : mockHomestayDetail.rules,
          host: {
            name: data.owner?.name || "VietJourney Host",
            joined: "2024",
            reviews: data.reviews?.length || 0,
            avatar: data.owner?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
            description: "Chủ nhà siêu nhiệt tình"
          },
          reviews: data.reviews?.map(r => ({
            name: r.user?.name || "Khách",
            date: new Date(r.createdAt).toLocaleDateString(),
            rating: r.rating,
            comment: r.comment,
            avatar: r.user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
          })) || [],
          rooms: data.rooms || []
        });
        
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);


  const handleBooking = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Vui lòng đăng nhập để tiến hành đặt chỗ!");
      router.push("/login?redirect=/homestays/" + id);
      return;
    }

    // Save to local storage for checkout
    const diffTime = Math.abs(dateRange[0].endDate - dateRange[0].startDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const bookingData = {
      type: 'hotel',
      hotelId: homeBasic.id,
      hotelName: homeBasic.name,
      roomId: selectedRoom?.id,
      roomName: selectedRoom?.name,
      quantity: 1, // Number of rooms
      guests: bookingGuests,
      checkIn: dateRange[0].startDate,
      checkOut: dateRange[0].endDate,
      nights: nights,
      priceAtBooking: Number(selectedRoom?.basePrice || homeBasic.price),
      totalAmount: Number(selectedRoom?.basePrice || homeBasic.price) * nights,
      image: homeDetail.gallery[0]
    };
    sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    router.push("/checkout");
  };


  const getIcon = (iconName) => {
    switch (iconName) {
      case "Wifi": return <Wifi size={24} color="#0f172a" strokeWidth={1.5} />;
      case "Coffee": return <Coffee size={24} color="#0f172a" strokeWidth={1.5} />;
      case "Tv": return <Tv size={24} color="#0f172a" strokeWidth={1.5} />;
      case "Car": return <Car size={24} color="#0f172a" strokeWidth={1.5} />;
      case "Wind": return <Wind size={24} color="#0f172a" strokeWidth={1.5} />;
      case "Waves": return <Waves size={24} color="#0f172a" strokeWidth={1.5} />;
      default: return <CheckCircle2 size={24} color="#0f172a" strokeWidth={1.5} />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ height: "72px" }}></div>
        <div style={{ textAlign: "center", padding: "80px", minHeight: "60vh" }}>
          <div className="spinner"></div>
          <p>Đang tải thông tin chi tiết...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!homeBasic || !homeDetail) {
    return (
      <>
        <Navbar theme="light" />
        <div style={{ height: "72px" }}></div>
        <div style={{ textAlign: "center", padding: "80px" }}>
          <h2>Không tìm thấy dữ liệu</h2>
        </div>
        <Footer />
      </>
    );
  }

  const mainImg = homeDetail.gallery[0];
  const subImgs = homeDetail.gallery.slice(1, 5);

  return (
    <>
      <Navbar theme="light" />
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 80px" }}>
        
        {/* BREADCRUMBS */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", marginBottom: "24px", fontWeight: 500 }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/homestays" style={{ color: "#64748b", textDecoration: "none" }}>Homestays</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{homeBasic.name}</span>
        </div>

        {/* HEADER INFO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              {homeBasic.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "#475569", fontWeight: 600 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0f172a" }}>
                <Star size={16} fill="#0f172a" color="#0f172a" />
                <span style={{ fontWeight: 800 }}>{homeBasic.rating}</span>
                <span style={{ textDecoration: "underline" }}>({homeDetail.reviews.length} đánh giá)</span>
              </div>
              <span>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={16} color="#0f172a" /> <span style={{ textDecoration: "underline", color: "#0f172a" }}>{homeBasic.location}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#0f172a", fontSize: "14px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
              <Share size={16} /> Chia sẻ
            </button>
            <button onClick={() => setWishlist(!wishlist)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#0f172a", fontSize: "14px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
              <Heart size={16} fill={wishlist ? "#ef4444" : "transparent"} color={wishlist ? "#ef4444" : "#0f172a"} /> 
              {wishlist ? "Đã lưu" : "Lưu"}
            </button>
          </div>
        </div>

        {/* PHOTO GALLERY */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", height: "500px", borderRadius: "24px", overflow: "hidden", marginBottom: "48px", position: "relative" }}>
          <div style={{ width: "100%", height: "100%" }}>
            <img src={mainImg} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity = 0.9} onMouseLeave={e => e.target.style.opacity = 1} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "8px" }}>
            {subImgs.map((img, idx) => (
              <img key={idx} src={img} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity = 0.9} onMouseLeave={e => e.target.style.opacity = 1} />
            ))}
          </div>
          <button onClick={() => setOpenLightbox(true)} style={{ position: "absolute", bottom: "24px", right: "24px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#0f172a", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
            <Grid size={16} /> Hiển thị tất cả ảnh
          </button>
        </div>
        
        <Lightbox
          open={openLightbox}
          close={() => setOpenLightbox(false)}
          slides={homeDetail.gallery.map(src => ({ src }))}
        />

        {/* STICKY NAV */}
        <div style={{ position: "sticky", top: "72px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 50, padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px", display: "flex", gap: "24px" }}>
          <a href="#overview" style={{ textDecoration: "none", color: "#0f172a", fontWeight: 600, fontSize: "15px" }}>Tổng quan</a>
          <a href="#amenities" style={{ textDecoration: "none", color: "#64748b", fontWeight: 600, fontSize: "15px" }}>Tiện nghi</a>
          <a href="#rooms" style={{ textDecoration: "none", color: "#64748b", fontWeight: 600, fontSize: "15px" }}>Phòng</a>
          <a href="#rules" style={{ textDecoration: "none", color: "#64748b", fontWeight: 600, fontSize: "15px" }}>Nội quy</a>
          <a href="#reviews" style={{ textDecoration: "none", color: "#64748b", fontWeight: 600, fontSize: "15px" }}>Đánh giá</a>
        </div>

        {/* MAIN CONTENT 2 COLS */}
        <div style={{ display: "grid", gridTemplateColumns: "65% 30%", gap: "5%" }}>
          
          {/* LEFT COL */}
          <div>
            {/* OVERVIEW */}
            <div id="overview" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>{homeDetail.type} - Chủ nhà {homeDetail.host.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "#0f172a", fontWeight: 500 }}>
                  <span>{homeDetail.capacity.guests} khách</span>
                  <span>•</span>
                  <span>{homeDetail.capacity.bedrooms} phòng ngủ</span>
                  <span>•</span>
                  <span>{homeDetail.capacity.beds} giường</span>
                  <span>•</span>
                  <span>{homeDetail.capacity.baths} phòng tắm</span>
                </div>
              </div>
              <img src={homeDetail.host.avatar} alt="Host" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            </div>

            {/* DESCRIPTION */}
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, fontWeight: 500 }}>{homeDetail.description}</p>
            </div>

            {/* AMENITIES */}
            <div id="amenities" style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Nơi này có những gì cho bạn</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {homeDetail.amenities.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px", color: "#475569", fontSize: "16px", fontWeight: 500 }}>
                    {getIcon(item.icon)} {item.label}
                  </div>
                ))}
              </div>
              <button style={{ marginTop: "32px", background: "#ffffff", border: "1px solid #0f172a", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, color: "#0f172a", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => {e.target.style.background="#0f172a"; e.target.style.color="#fff";}} onMouseLeave={e => {e.target.style.background="#ffffff"; e.target.style.color="#0f172a";}}>
                Hiển thị tất cả tiện nghi
              </button>
            </div>

            {/* ROOM SELECTION */}
            {homeDetail.rooms && homeDetail.rooms.length > 0 && (
              <div id="rooms" style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Chọn loại phòng</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {homeDetail.rooms.map((room) => (
                    <div key={room.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: selectedRoom?.id === room.id ? "2px solid #0d9488" : "1px solid rgba(0,0,0,0.1)", borderRadius: "16px", padding: "20px", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setSelectedRoom(room)}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>{room.name}</h3>
                        <div style={{ display: "flex", gap: "12px", color: "#64748b", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={16} /> Tối đa {room.capacity} khách</span>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0d9488" }}>
                          ₫{Number(room.basePrice).toLocaleString('en-US')} <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>/ đêm</span>
                        </div>
                      </div>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: selectedRoom?.id === room.id ? "7px solid #0d9488" : "2px solid #cbd5e1", transition: "all 0.2s" }}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOCATION MAP */}
            {homeBasic.lat && homeBasic.lng && (
              <div id="location" style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Vị trí</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#475569", marginBottom: "24px", fontWeight: 500 }}>
                  <MapPin size={18} color="#0f172a" /> {homeBasic.location}
                </div>
                <div style={{ height: "400px", width: "100%", borderRadius: "24px", overflow: "hidden", position: "relative", zIndex: 1 }}>
                  <MapComponent homestays={[{...homeBasic, images: homeDetail.gallery}]} />
                </div>
              </div>
            )}

            {/* RULES */}
            <div id="rules" style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Nội quy nhà</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {homeDetail.rules.map((rule, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "16px", fontWeight: 500 }}>
                    <div style={{ width: "6px", height: "6px", background: "#0f172a", borderRadius: "50%" }}></div> {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* REVIEWS */}
            <div id="reviews" style={{ paddingBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <Star size={24} fill="#0f172a" color="#0f172a" />
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{homeBasic.rating} • {homeDetail.reviews.length} đánh giá</h2>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {homeDetail.reviews.map((rev, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                      <img src={rev.avatar} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>{rev.name}</div>
                        <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>{rev.date}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>"{rev.comment}"</p>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: "32px", background: "#ffffff", border: "1px solid #0f172a", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, color: "#0f172a", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => {e.target.style.background="#0f172a"; e.target.style.color="#fff";}} onMouseLeave={e => {e.target.style.background="#ffffff"; e.target.style.color="#0f172a";}}>
                Hiển thị tất cả đánh giá
              </button>
            </div>

          </div>

          {/* RIGHT COL: STICKY BOOKING CARD */}
          <div>
            <div style={{ position: "sticky", top: "100px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "24px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>₫{Number(selectedRoom?.basePrice || homeBasic.price).toLocaleString('en-US')}</span>
                <span style={{ fontSize: "16px", color: "#64748b", fontWeight: 500 }}>/ đêm {selectedRoom ? `(${selectedRoom.name})` : ''}</span>
              </div>

              {/* Form Input */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", marginBottom: "20px", position: "relative" }}>
                <div onClick={() => setShowDatePicker(!showDatePicker)} style={{ padding: "16px", background: "#fff", borderBottom: "1px solid #cbd5e1", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", display: "flex", justifyContent: "space-between", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Nhận phòng</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{dateRange[0].startDate.toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div style={{ width: "1px", background: "#cbd5e1" }}></div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Trả phòng</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{dateRange[0].endDate.toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
                
                {showDatePicker && (
                  <div style={{ position: "absolute", top: "70px", right: 0, background: "#fff", zIndex: 100, border: "1px solid #cbd5e1", borderRadius: "16px", padding: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                    <DatePicker ranges={dateRange} onChange={item => setDateRange([item.selection])} />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                      <button onClick={() => setShowDatePicker(false)} style={{ background: "#0f172a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Đóng</button>
                    </div>
                  </div>
                )}
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", transition: "background 0.2s", position: "relative" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", marginBottom: "2px" }}>Khách</div>
                    <select value={bookingGuests} onChange={(e) => setBookingGuests(parseInt(e.target.value))} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: "14px", fontWeight: 600, color: "#0f172a", width: "100%", cursor: "pointer" }}>
                      {[...Array(selectedRoom?.capacity || 2)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} khách</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <ChevronDown size={20} color="#0f172a" />
                  </div>
                </div>
              </div>

              <button onClick={handleBooking} className="shimmer-btn" style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 700, cursor: "pointer", marginBottom: "16px", boxShadow: "0 4px 20px rgba(13,148,136,0.3)" }}>
                Đặt phòng
              </button>
              
              <div style={{ textAlign: "center", fontSize: "14px", color: "#64748b", fontWeight: 500, marginBottom: "24px" }}>
                Bạn vẫn chưa bị trừ tiền
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "16px", color: "#475569", fontWeight: 500 }}>
                <span style={{ textDecoration: "underline" }}>₫{Number(selectedRoom?.basePrice || homeBasic.price).toLocaleString('en-US')} x {Math.ceil(Math.abs(dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)) || 1} đêm</span>
                <span>₫{Number((selectedRoom?.basePrice || homeBasic.price) * (Math.ceil(Math.abs(dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)) || 1)).toLocaleString('en-US')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "16px", color: "#475569", fontWeight: 500 }}>
                <span style={{ textDecoration: "underline" }}>Phí dịch vụ VietJourney</span>
                <span>₫0</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.1)", fontSize: "18px", color: "#0f172a", fontWeight: 800 }}>
                <span>Tổng trước thuế</span>
                <span>₫{Number((selectedRoom?.basePrice || homeBasic.price) * (Math.ceil(Math.abs(dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)) || 1)).toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
