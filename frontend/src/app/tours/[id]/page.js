"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { toursApi } from "@/lib/api";
import { MapPin, Heart, Share, Star, CheckCircle2, XCircle, Calendar, Users, ChevronDown, ChevronRight, Grid, Map as MapIcon, ChevronUp, MessageSquare } from "lucide-react";

export default function TourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); 

  // Booking states
  const [selectedAvailId, setSelectedAvailId] = useState("");
  const [bookingGuests, setBookingGuests] = useState(1);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const data = await toursApi.getById(id);
        setTour(data);
        if (data.availability && data.availability.length > 0) {
          setSelectedAvailId(data.availability[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch tour details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleBooking = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Vui lòng đăng nhập để tiến hành đặt chỗ!");
      router.push("/login?redirect=/tours/" + id);
      return;
    }

    if (!selectedAvailId) {
      alert("Vui lòng chọn Ngày khởi hành trước khi đặt!");
      return;
    }

    const bookingData = {
      type: 'tour',
      tourId: tour.id,
      tourName: tour.name,
      checkIn: selectedAvail.startDate,
      quantity: bookingGuests,
      priceAtBooking: Number(displayPrice),
      totalAmount: Number(displayPrice) * bookingGuests,
      image: mainImg
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    router.push("/checkout");
  };

  if (loading) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#64748b" }}>
          Đang tải thông tin tour...
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#ef4444" }}>
          Không tìm thấy Tour này.
        </div>
      </div>
    );
  }

  const mainImg = tour.images?.[0] || "https://images.unsplash.com/photo-1542322304-4b53bb8968f9?w=1200&q=80";
  const subImgs = tour.images?.slice(1, 5) || [];
  
  const selectedAvail = tour.availability?.find(a => a.id === selectedAvailId) || tour.availability?.[0];
  const displayPrice = selectedAvail ? selectedAvail.price : tour.basePrice;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* BREADCRUMBS */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", marginBottom: "24px", fontWeight: 500 }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/tours" style={{ color: "#64748b", textDecoration: "none" }}>Tours</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{tour.name}</span>
        </div>

        {/* HEADER INFO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              {tour.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "#475569", fontWeight: 600 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span style={{ color: "#0f172a" }}>{tour.rating || 0}</span>
                <span style={{ textDecoration: "underline" }}>({tour.reviewCount || 0} đánh giá)</span>
              </div>
              <span>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={16} color="#0d9488" /> {tour.location}
              </div>
              <span>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={16} color="#0d9488" /> {tour.durationDays} Ngày {tour.durationNights > 0 ? `${tour.durationNights} Đêm` : ''}
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
          
          <button style={{ position: "absolute", bottom: "24px", right: "24px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#0f172a", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
            <Grid size={16} /> Hiển thị tất cả ảnh
          </button>
        </div>

        {/* MAIN CONTENT 2 COLS */}
        <div style={{ display: "grid", gridTemplateColumns: "65% 30%", gap: "5%" }}>
          
          {/* LEFT COL */}
          <div>
            {/* HOST PROFILE */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Đơn vị tổ chức: {tour.owner?.name}</h2>
                <div style={{ fontSize: "15px", color: "#64748b", fontWeight: 500 }}>Liên hệ: {tour.owner?.email}</div>
              </div>
              <img src={tour.owner?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"} alt="Host" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
            </div>

            {/* DESCRIPTION */}
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, fontWeight: 500 }}>{tour.description}</p>
            </div>

            {/* INCLUDES & EXCLUDES */}
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ background: "#f0fdfa", padding: "24px", borderRadius: "20px", border: "1px solid rgba(13,148,136,0.2)" }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Bao gồm</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {tour.includes?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "#0f172a", fontSize: "15px", fontWeight: 600, lineHeight: 1.5 }}>
                      <CheckCircle2 size={20} color="#0d9488" style={{ flexShrink: 0 }} /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#fef2f2", padding: "24px", borderRadius: "20px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Không bao gồm</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {tour.excludes?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "#0f172a", fontSize: "15px", fontWeight: 600, lineHeight: 1.5 }}>
                      <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ITINERARY TIMELINE */}
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>Lịch trình chi tiết</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative" }}>
                {/* Timeline Line */}
                <div style={{ position: "absolute", left: "31px", top: "16px", bottom: "16px", width: "2px", background: "#e2e8f0", zIndex: 0 }}></div>
                
                {tour.itineraries?.map((day, idx) => {
                  // MOCK: Generate a thumbnail for each day based on index
                  const thumbnail = tour.images && tour.images[idx % tour.images.length];
                  return (
                    <div key={idx} style={{ display: "flex", gap: "24px", position: "relative", zIndex: 1, paddingBottom: idx === tour.itineraries.length - 1 ? "0" : "40px" }}>
                      <div style={{ width: "64px", height: "64px", background: "#f0fdfa", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid #0d9488", flexShrink: 0, boxShadow: "0 0 0 4px #f8fafc" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#0d9488", textTransform: "uppercase" }}>Ngày</span>
                        <span style={{ fontSize: "18px", fontWeight: 800, color: "#0d9488", lineHeight: 1 }}>{day.dayNumber}</span>
                      </div>
                      <div style={{ paddingTop: "8px", flex: 1 }}>
                        <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>{day.title}</h4>
                        <div style={{ display: "flex", gap: "20px" }}>
                          <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, fontWeight: 500, flex: 1 }}>{day.description}</p>
                          {thumbnail && (
                            <div style={{ width: "160px", height: "120px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                              <img src={thumbnail} alt={`Day ${day.dayNumber}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REVIEWS */}
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>Đánh giá từ khách hàng</h2>
              
              {/* REVIEW BREAKDOWN */}
              <div style={{ display: "flex", gap: "40px", marginBottom: "40px", background: "#f8fafc", padding: "32px", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "150px" }}>
                  <div style={{ fontSize: "64px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{tour.rating || "5.0"}</div>
                  <div style={{ display: "flex", gap: "4px", margin: "12px 0" }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>Dựa trên {tour.reviewCount || 0} đánh giá</div>
                </div>
                
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                  {[ 
                    { label: "Hướng dẫn viên", p: 95 }, 
                    { label: "Lịch trình", p: 90 }, 
                    { label: "Vận chuyển", p: 85 }, 
                    { label: "Ăn uống", p: 88 } 
                  ].map(crit => (
                    <div key={crit.label} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "130px", fontSize: "14px", fontWeight: 700, color: "#475569" }}>{crit.label}</div>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${crit.p}%`, height: "100%", background: "#0d9488", borderRadius: "4px" }}></div>
                      </div>
                      <div style={{ width: "30px", fontSize: "14px", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>{(crit.p / 20).toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                {tour.reviews?.map((rev, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <img src={rev.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{rev.user?.name}</div>
                        <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "#f59e0b" : "#cbd5e1"} color={i < rev.rating ? "#f59e0b" : "#cbd5e1"} />)}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>"{rev.comment || 'Tuyệt vời!'}"</p>
                  </div>
                ))}
                {tour.reviews?.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: "15px" }}>Chưa có đánh giá nào.</div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COL: STICKY BOOKING CARD */}
          <div>
            <div style={{ position: "sticky", top: "100px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "24px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#0d9488" }}>₫{Number(displayPrice).toLocaleString('en-US')}</span>
                <span style={{ fontSize: "15px", color: "#64748b", fontWeight: 500 }}>/ người</span>
              </div>

              {/* Form Input */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "16px", overflow: "hidden", marginBottom: "20px", background: "#f8fafc", padding: "16px" }}>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", marginBottom: "12px" }}>Chọn lịch khởi hành</div>
                  {tour.availability && tour.availability.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {tour.availability.map((av) => (
                        <div 
                          key={av.id} 
                          onClick={() => setSelectedAvailId(av.id)} 
                          style={{ 
                            padding: "10px 8px", 
                            border: selectedAvailId === av.id ? "2px solid #0d9488" : "1px solid #cbd5e1", 
                            borderRadius: "12px", 
                            cursor: "pointer", 
                            textAlign: "center", 
                            background: selectedAvailId === av.id ? "#f0fdfa" : "#fff",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                            {new Date(av.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: selectedAvailId === av.id ? "#0d9488" : "#64748b" }}>
                            Còn {av.available} chỗ
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "14px", color: "#64748b", fontStyle: "italic" }}>Đang cập nhật lịch</div>
                  )}
                </div>
                
                <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", marginBottom: "4px" }}>Số lượng hành khách</div>
                    <select value={bookingGuests} onChange={(e) => setBookingGuests(parseInt(e.target.value))} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: "16px", fontWeight: 700, color: "#0d9488", width: "100%", cursor: "pointer" }}>
                      {[...Array(selectedAvail ? selectedAvail.available : 10)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} khách</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ pointerEvents: "none" }}>
                    <ChevronDown size={20} color="#0d9488" />
                  </div>
                </div>
              </div>

              <button onClick={handleBooking} className="shimmer-btn" style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 700, cursor: "pointer", marginBottom: "16px", boxShadow: "0 4px 20px rgba(13,148,136,0.3)" }}>
                Đặt tour ngay
              </button>
              
              <div style={{ textAlign: "center", fontSize: "14px", color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <MessageSquare size={14} /> Xác nhận tức thời
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px", color: "#475569", fontWeight: 500 }}>
                  <span style={{ textDecoration: "underline" }}>₫{Number(displayPrice).toLocaleString('en-US')} x {bookingGuests} người</span>
                  <span>₫{(Number(displayPrice) * bookingGuests).toLocaleString('en-US')}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: "16px", color: "#0f172a", fontWeight: 800 }}>
                  <span>Tổng tiền</span>
                  <span>₫{(Number(displayPrice) * bookingGuests).toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
