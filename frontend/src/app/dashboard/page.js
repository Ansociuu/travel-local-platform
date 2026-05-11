"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, ShoppingBag, LogOut, Camera, MapPin, Calendar, 
  Clock, CreditCard, ChevronRight, XCircle, CheckCircle, 
  AlertCircle, Heart, Star, Shield, LayoutDashboard,
  TrendingUp, Wallet, Map, PieChart, MessageSquare
} from "lucide-react";
import { authApi, bookingsApi, uploadApi, wishlistApi, reviewsApi } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); 
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    reviewsCount: 0,
    wishlistCount: 0
  });

  // Profile state
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [avatar, setAvatar] = useState("");

  // Lists state
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setFormData({ name: userData.name || "", phone: userData.phone || "" });
        setAvatar(userData.avatar || "");
        
        const statsData = await authApi.getStats();
        setStats(statsData);
      } catch (err) {
        router.push("/login?redirect=/dashboard");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [router]);

  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "wishlist") fetchWishlist();
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  const fetchBookings = async () => {
    setListLoading(true);
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setListLoading(true);
    try {
      const data = await wishlistApi.getMyWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchReviews = async () => {
    setListLoading(true);
    try {
      const data = await reviewsApi.getMyReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await authApi.updateMe({ ...formData, avatar });
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setUpdating(true);
    try {
      await authApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      alert("Đổi mật khẩu thành công!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpdating(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setAvatar(res.url);
      const updated = await authApi.updateMe({ avatar: res.url });
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      alert("Lỗi upload ảnh: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleWishlist = async (type, id) => {
    try {
      await wishlistApi.toggle(type === 'tour' ? { tourId: id } : { hotelId: id });
      fetchWishlist();
      const statsData = await authApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await reviewsApi.create({
        bookingId: selectedBooking.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        hotelId: selectedBooking.hotelId,
        tourId: selectedBooking.tourId
      });
      alert("Cảm ơn bạn đã đánh giá!");
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: "" });
      fetchBookings();
      fetchReviews();
      const statsData = await authApi.getStats();
      setStats(statsData);
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>Đang tải...</div>;

  // Calculate chart data - Monthly Spending
  const monthlySpending = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  bookings.forEach(b => {
    if (b.status !== 'CANCELLED') {
      const month = new Date(b.createdAt).getMonth();
      monthlySpending[month] += Number(b.totalAmount);
    }
  });
  const maxSpending = Math.max(...monthlySpending, 1000000);

  const tourCount = bookings.filter(b => b.tourId).length;
  const hotelCount = bookings.filter(b => b.hotelId).length;
  const totalTrips = tourCount + hotelCount || 1;

  // Map of reviewed booking IDs to hide the button
  const reviewedBookingIds = new Set(reviews.map(r => r.bookingId));

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${color}10`, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={28} />
      </div>
      <div>
        <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <style>{`
        .bar-tooltip {
          pointer-events: none;
        }
        [group="chart-bar"]:hover .bar-tooltip {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translate(-50%, -4px) !important;
        }
      `}</style>
      <div style={{ height: "72px" }}></div>

      <main style={{ maxWidth: "1240px", margin: "40px auto", padding: "0 20px 80px" }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Chào mừng trở lại, {user?.name ? user.name.split(' ').pop() : 'bạn'}! 👋
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 500 }}>
              Đây là nơi quản lý các chuyến đi và trải nghiệm của bạn tại MoodTravel.
            </p>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "40px" }}>
          
          {/* SIDEBAR */}
          <aside>
            <div style={{ background: "#fff", borderRadius: "24px", padding: "24px", border: "1px solid rgba(0,0,0,0.05)", position: "sticky", top: "112px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px", padding: "16px", background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", borderRadius: "20px" }}>
                <div style={{ position: "relative", width: "90px", height: "90px", margin: "0 auto 16px" }}>
                  <img src={avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }} />
                  <label style={{ position: "absolute", bottom: "0", right: "0", background: "#0d9488", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                    <Camera size={14} />
                    <input type="file" hidden onChange={handleAvatarChange} disabled={updating} />
                  </label>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>{user?.name || 'Khách hàng'}</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(13,148,136,0.1)", color: "#0d9488", borderRadius: "100px", fontSize: "12px", fontWeight: 700 }}>
                  <Shield size={12} /> Thành viên Bạc
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
                  { id: "bookings", label: "Chuyến đi của tôi", icon: ShoppingBag },
                  { id: "wishlist", label: "Danh sách yêu thích", icon: Heart },
                  { id: "reviews", label: "Đánh giá của tôi", icon: Star },
                  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
                  { id: "security", label: "Bảo mật", icon: Shield },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    style={{ 
                      display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", 
                      background: activeTab === tab.id ? "#0d9488" : "transparent", 
                      color: activeTab === tab.id ? "#fff" : "#64748b", 
                      fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                      boxShadow: activeTab === tab.id ? "0 4px 12px rgba(13,148,136,0.2)" : "none"
                    }}
                  >
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div style={{ minHeight: "600px" }}>
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                  <StatCard icon={Map} label="Tổng chuyến đi" value={stats.totalBookings} color="#0d9488" />
                  <StatCard icon={Wallet} label="Tổng chi tiêu" value={`₫${Number(stats.totalSpent).toLocaleString()}`} color="#f59e0b" />
                  <StatCard icon={Heart} label="Yêu thích" value={stats.wishlistCount} color="#ef4444" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
                  {/* CHART BOX */}
                  <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Tần suất du lịch</h3>
                      <TrendingUp size={20} color="#0d9488" />
                    </div>
                    
                    {/* SVG Chart Placeholder */}
                    <div style={{ height: "200px", width: "100%", position: "relative", display: "flex", alignItems: "flex-end", gap: "12px", padding: "0 10px" }}>
                      {monthlySpending.map((amount, i) => (
                        <div key={i} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", group: "chart-bar" }}>
                          <div style={{ 
                            position: "absolute", 
                            bottom: "100%", 
                            left: "50%", 
                            transform: "translateX(-50%)", 
                            background: "#0f172a", 
                            color: "#fff", 
                            padding: "4px 8px", 
                            borderRadius: "6px", 
                            fontSize: "10px", 
                            fontWeight: 700, 
                            marginBottom: "8px",
                            opacity: 0,
                            visibility: "hidden",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                            zIndex: 10
                          }} className="bar-tooltip">
                            ₫{amount.toLocaleString()}
                          </div>
                          <div 
                            onMouseEnter={(e) => e.currentTarget.previousSibling.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.previousSibling.style.opacity = 0}
                            style={{ 
                              width: "100%", 
                              height: `${(amount / maxSpending) * 90 + 5}%`, 
                              background: i === new Date().getMonth() ? "linear-gradient(to top, #0d9488, #14b8a6)" : "rgba(13,148,136,0.15)", 
                              borderRadius: "6px 6px 2px 2px", 
                              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              minHeight: amount > 0 ? "16px" : "4px",
                              cursor: "pointer"
                            }}
                          ></div>
                          <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>T{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PIE CHART BOX (NEW) */}
                  <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Sở thích du lịch</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                      <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: `conic-gradient(#0d9488 ${(tourCount/totalTrips)*360}deg, #f59e0b 0deg)`, boxShadow: "inset 0 0 0 20px #fff" }}></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "#0d9488" }}></div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Tour ({Math.round((tourCount/totalTrips)*100)}%)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "#f59e0b" }}></div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Homestay ({Math.round((hotelCount/totalTrips)*100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Lịch sử đặt chỗ</h2>
                {listLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>Đang tải...</div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>Chưa có chuyến đi nào.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {bookings.map(b => (
                      <div key={b.id} style={{ padding: "20px", border: "1px solid #f1f5f9", borderRadius: "16px", display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "20px", alignItems: "center" }}>
                        <img src={b.tour?.images?.[0] || b.hotel?.images?.[0]} style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>{b.tour?.name || b.hotel?.name}</div>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Mã: #{b.shortId} • {new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "#0d9488", marginBottom: "4px" }}>₫{Number(b.totalAmount).toLocaleString()}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", background: b.status === 'CONFIRMED' ? "#f0fdf4" : b.status === 'COMPLETED' ? "#f0f9ff" : "#fffbeb", color: b.status === 'CONFIRMED' ? "#10b981" : b.status === 'COMPLETED' ? "#0ea5e9" : "#f59e0b" }}>
                              {b.status}
                            </span>
                            {b.status === 'COMPLETED' && !reviewedBookingIds.has(b.id) && (
                              <button 
                                onClick={() => handleOpenReview(b)}
                                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #0ea5e9", background: "#fff", color: "#0ea5e9", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                              >
                                <MessageSquare size={14} /> Viết đánh giá
                              </button>
                            )}
                            {reviewedBookingIds.has(b.id) && (
                              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Đã đánh giá</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Danh sách yêu thích</h2>
                {listLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>Đang tải...</div>
                ) : wishlist.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>Chưa có mục nào được lưu.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {wishlist.map(w => {
                      const item = w.tour || w.hotel;
                      return (
                        <div key={w.id} style={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
                          <img src={item.images?.[0]} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                          <button onClick={() => handleToggleWishlist(w.tourId ? 'tour' : 'hotel', item.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                            <Heart size={16} fill="#ef4444" />
                          </button>
                          <div style={{ padding: "16px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>{item.name}</h4>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0d9488" }}>₫{Number(item.basePrice || item.rooms?.[0]?.basePrice).toLocaleString()}</span>
                              <Link href={w.tourId ? `/tours/${w.tourId}` : `/homestays/${w.hotelId}`} style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", fontWeight: 700 }}>Xem chi tiết</Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>Thông tin cá nhân</h2>
                <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "500px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Họ và tên</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px", fontWeight: 500 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Số điện thoại</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px", fontWeight: 500 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Email</label>
                    <input type="email" value={user?.email} disabled style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
                  </div>
                  <button type="submit" disabled={updating} className="shimmer-btn" style={{ width: "fit-content", padding: "14px 32px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700 }}>
                    {updating ? "Đang xử lý..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>Bảo mật tài khoản</h2>
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "500px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Mật khẩu hiện tại</label>
                    <input type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Mật khẩu mới</label>
                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Xác nhận mật khẩu mới</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none" }} required />
                  </div>
                  <button type="submit" disabled={updating} className="shimmer-btn" style={{ width: "fit-content", padding: "14px 32px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700 }}>
                    {updating ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>Đánh giá của tôi</h2>
                {listLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>Đang tải...</div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>Bạn chưa viết đánh giá nào.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>{r.tour?.name || r.hotel?.name}</h4>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < r.rating ? "#f59e0b" : "none"} color={i < r.rating ? "#f59e0b" : "#cbd5e1"} />
                            ))}
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px", fontWeight: 600 }}>
                          Mã đặt chỗ: #{r.booking?.shortId} • Ngày đi: {new Date(r.booking?.createdAt).toLocaleDateString()}
                        </div>
                        <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: 0, padding: "12px", background: "#f8fafc", borderRadius: "12px", borderLeft: "4px solid #0d9488" }}>"{r.comment}"</p>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px", fontWeight: 700 }}>Đã viết vào {new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>Viết đánh giá</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><XCircle size={24} /></button>
            </div>
            <div style={{ marginBottom: "20px", padding: "16px", background: "#f8fafc", borderRadius: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
              <img src={selectedBooking?.tour?.images?.[0] || selectedBooking?.hotel?.images?.[0]} style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800 }}>{selectedBooking?.tour?.name || selectedBooking?.hotel?.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Mã đặt chỗ: #{selectedBooking?.shortId}</div>
              </div>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>Xếp hạng của bạn</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Star size={32} fill={star <= reviewForm.rating ? "#f59e0b" : "none"} color={star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1"} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>Chia sẻ trải nghiệm</label>
                <textarea 
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Bạn thấy chuyến đi thế nào?..."
                  style={{ width: "100%", height: "120px", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px", resize: "none" }}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <button type="button" onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Hủy</button>
                <button type="submit" disabled={updating} style={{ flex: 2, padding: "14px", borderRadius: "12px", border: "none", background: "#0d9488", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {updating ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
