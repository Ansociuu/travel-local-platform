"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Map, Home, TrendingUp, DollarSign, UserPlus, Plus, Pencil, Trash2, ArrowLeft, ClipboardCheck, MessageSquare, Star, Tag } from "lucide-react";
import s from "./admin.module.css";
import { adminApi } from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";

const TABS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "bookings", label: "Đặt chỗ", icon: ShoppingCart },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "owner-applications", label: "Hồ sơ owner", icon: ClipboardCheck },
  { id: "tours", label: "Tour", icon: Map },
  { id: "hotels", label: "Homestay", icon: Home },
  { id: "coupons", label: "Khuyến mãi", icon: Tag },
  { id: "reviews", label: "Đánh giá", icon: MessageSquare },
];
const STATUS_MAP = { PENDING: ["Chờ xử lý", s.badgePending], CONFIRMED: ["Đã xác nhận", s.badgeConfirmed], CANCELLED: ["Đã huỷ", s.badgeCancelled], COMPLETED: ["Hoàn thành", s.badgeCompleted] };
const ROLE_MAP = { ADMIN: s.badgeAdmin, USER: s.badgeUser, OWNER: s.badgeOwner };
const APPROVAL_MAP = { DRAFT: ["Nháp", s.badgeUser], PENDING_REVIEW: ["Chờ duyệt", s.badgePending], APPROVED: ["Đã duyệt", s.badgeConfirmed], REJECTED: ["Từ chối", s.badgeCancelled], ARCHIVED: ["Lưu trữ", s.badgeUser] };
const APPLICATION_MAP = { PENDING: ["Chờ duyệt", s.badgePending], APPROVED: ["Đã duyệt", s.badgeConfirmed], REJECTED: ["Từ chối", s.badgeCancelled] };
const fmt = (n) => n == null ? "0" : Number(n).toLocaleString("vi-VN");
const fmtD = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [ownerApplications, setOwnerApplications] = useState([]);
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bkFilter, setBkFilter] = useState("ALL");
  const [modal, setModal] = useState(null); // {type:'tour'|'hotel', mode:'create'|'edit', data:{}}
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null); // {type, id, name}
  const [preview, setPreview] = useState(null); // {type:'tour'|'hotel', data}

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/login"); return; }
    if (JSON.parse(u).role !== "ADMIN") { router.push("/"); }
  }, [router]);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") setStats(await adminApi.getStats());
      else if (tab === "bookings") setBookings(await adminApi.getAllBookings());
      else if (tab === "users") setUsers(await adminApi.getUsers());
      else if (tab === "owner-applications") setOwnerApplications(await adminApi.getOwnerApplications());
      else if (tab === "tours") setTours(await adminApi.getAllTours());
      else if (tab === "hotels") setHotels(await adminApi.getAllHotels());
      else if (tab === "coupons") {
        const { couponsApi } = await import("@/lib/api");
        setCoupons(await couponsApi.getAll());
      }
      else if (tab === "reviews") setReviews(await adminApi.getAllReviews());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateBkStatus = async (id, status) => {
    try { await adminApi.updateBookingStatus(id, status); setBookings(p => p.map(b => b.id === id ? { ...b, status } : b)); showToast("Cập nhật thành công"); } catch (e) { showToast(e.message, false); }
  };

  const updateRole = async (id, role) => {
    try { await adminApi.updateUserRole(id, role); setUsers(p => p.map(u => u.id === id ? { ...u, role } : u)); showToast("Cập nhật vai trò thành công"); } catch (e) { showToast(e.message, false); }
  };

  const updateOwnerApplication = async (id, status) => {
    const rejectionReason = status === "REJECTED" ? window.prompt("Lý do từ chối hồ sơ") || "" : "";
    try {
      const updated = await adminApi.updateOwnerApplicationStatus(id, status, rejectionReason);
      setOwnerApplications(p => p.map(app => app.id === id ? updated : app));
      showToast(status === "APPROVED" ? "Đã duyệt hồ sơ owner" : "Đã từ chối hồ sơ");
    } catch (e) { showToast(e.message, false); }
  };

  const updateHotelApproval = async (id, status) => {
    const note = status === "REJECTED" ? window.prompt("Lý do từ chối homestay") || "" : "";
    try {
      const updated = await adminApi.updateHotelApproval(id, status, note);
      setHotels(p => p.map(h => h.id === id ? updated : h));
      if (preview?.data?.id === id) setPreview({ type: "hotel", data: updated });
      showToast(status === "APPROVED" ? "Đã duyệt homestay" : "Đã từ chối homestay");
    } catch (e) { showToast(e.message, false); }
  };

  const updateTourApproval = async (id, status) => {
    const note = status === "REJECTED" ? window.prompt("Lý do từ chối tour") || "" : "";
    try {
      const updated = await adminApi.updateTourApproval(id, status, note);
      setTours(p => p.map(t => t.id === id ? updated : t));
      if (preview?.data?.id === id) setPreview({ type: "tour", data: updated });
      showToast(status === "APPROVED" ? "Đã duyệt tour" : "Đã từ chối tour");
    } catch (e) { showToast(e.message, false); }
  };

  // CRUD handlers
  const openCreate = (type) => { setForm({}); setModal({ type, mode: "create" }); };
  const openEdit = (type, item) => {
    if (type === "tour") {
      const startD = item.availability?.[0] ? new Date(item.availability[0].startDate).toISOString().split("T")[0] : "";
      setForm({ ...item, basePrice: item.basePrice?.toString(), startDate: startD });
    } else if (type === "hotel") {
      const price = item.rooms?.[0] ? item.rooms[0].basePrice?.toString() : "";
      setForm({ ...item, basePrice: price });
    } else {
      setForm({ ...item });
    }
    setModal({ type, mode: "edit" });
  };

  const handleSave = async () => {
    if (modal.type === "user") {
      if (!form.email) { showToast("Email là bắt buộc", false); return; }
      if (modal.mode === "create" && !form.password) { showToast("Mật khẩu là bắt buộc", false); return; }
    }
    
    try {
      if (modal.type === "tour") {
        if (modal.mode === "create") { await adminApi.createTour(form); showToast("Tạo tour thành công"); }
        else { await adminApi.updateTour(form.id, form); showToast("Cập nhật tour thành công"); }
        setTours(await adminApi.getAllTours());
      } else if (modal.type === "hotel") {
        if (modal.mode === "create") { await adminApi.createHotel(form); showToast("Tạo homestay thành công"); }
        else { await adminApi.updateHotel(form.id, form); showToast("Cập nhật homestay thành công"); }
        setHotels(await adminApi.getAllHotels());
      } else if (modal.type === "coupon") {
        const { couponsApi } = await import("@/lib/api");
        if (modal.mode === "create") { await couponsApi.create(form); showToast("Tạo mã giảm giá thành công"); }
        else { await couponsApi.update(form.id, form); showToast("Cập nhật mã thành công"); }
        setCoupons(await couponsApi.getAll());
      } else if (modal.type === "user") {
        if (modal.mode === "create") { await adminApi.createUser(form); showToast("Tạo người dùng thành công"); }
        else { await adminApi.updateUser(form.id, form); showToast("Cập nhật người dùng thành công"); }
        setUsers(await adminApi.getUsers());
      }
      setModal(null);
    } catch (e) { showToast(e.message, false); }
  };

  const askDelete = (type, id, name) => setConfirmDel({ type, id, name });
  const handleDelete = async () => {
    if (!confirmDel) return;
    const { type, id } = confirmDel;
    try {
      if (type === "tour") { await adminApi.deleteTour(id); setTours(p => p.filter(t => t.id !== id)); }
      else if (type === "hotel") { await adminApi.deleteHotel(id); setHotels(p => p.filter(h => h.id !== id)); }
      else if (type === "user") { await adminApi.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)); }
      else if (type === "coupon") {
        const { couponsApi } = await import("@/lib/api");
        await couponsApi.remove(id);
        setCoupons(p => p.filter(c => c.id !== id));
      }
      else if (type === "review") { await adminApi.deleteReview(id); setReviews(p => p.filter(r => r.id !== id)); }
      showToast("Xoá thành công");
    } catch (e) { showToast(e.message, false); }
    setConfirmDel(null);
  };

  const filtered = bkFilter === "ALL" ? bookings : bookings.filter(b => b.status === bkFilter);
  const maxRev = stats?.monthlyRevenue?.length ? Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1) : 1;

  const donutData = stats ? [
    { label: "Chờ xử lý", value: stats.pendingBookings, color: "#eab308" },
    { label: "Đã xác nhận", value: stats.confirmedBookings, color: "#059669" },
    { label: "Hoàn thành", value: stats.completedBookings, color: "#2563eb" },
    { label: "Đã huỷ", value: stats.cancelledBookings, color: "#dc2626" },
  ] : [];
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0) || 1;

  const buildArcs = () => {
    const r = 56, cx = 75, cy = 75, C = 2 * Math.PI * r;
    let off = 0;
    return donutData.map((d, i) => {
      const dash = (d.value / donutTotal) * C;
      const arc = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-off} style={{ transition: "all 0.6s ease" }} />;
      off += dash;
      return arc;
    });
  };

  const F = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className={s.adminLayout}>
      <aside className={s.sidebar}>
        <Link href="/" className={s.backBtn}><ArrowLeft size={16} /> Về trang chính</Link>
        <div className={s.sidebarTitle}>Quản trị hệ thống</div>
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? s.sidebarItemActive : s.sidebarItem} onClick={() => setTab(t.id)}>
            <t.icon size={18} />{t.label}
          </button>
        ))}
      </aside>

      <main className={s.mainContent}>
        <div className={s.adminTopActions}>
          <NotificationBell iconColor="#0f172a" />
        </div>
        {loading ? (
          <div className={s.loading}><div className={s.spinner} /> Đang tải dữ liệu...</div>
        ) : (<>
          {/* OVERVIEW */}
          {tab === "overview" && stats && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Dashboard</h1><p className={s.pageSubtitle}>Tổng quan hoạt động VietJourney</p></div>
            <div className={s.statsGrid}>
              {[
                { icon: DollarSign, color: "#0d9488", bg: "rgba(20,184,166,0.1)", val: fmt(stats.totalRevenue) + "₫", label: "Tổng doanh thu", sub: `Tháng này: ${fmt(stats.revenueThisMonth)}₫` },
                { icon: ShoppingCart, color: "#6366f1", bg: "rgba(99,102,241,0.1)", val: fmt(stats.totalBookings), label: "Tổng đặt chỗ", sub: `${stats.pendingBookings} chờ xử lý` },
                { icon: Users, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", val: fmt(stats.totalUsers), label: "Người dùng", sub: `+${stats.newUsersThisMonth} tháng này` },
                { icon: Map, color: "#ec4899", bg: "rgba(236,72,153,0.1)", val: stats.totalTours + stats.totalHotels, label: "Sản phẩm", sub: `${stats.pendingHotels || 0} homestay, ${stats.pendingTours || 0} tour chờ duyệt` },
              ].map((c, i) => (
                <div className={s.statCard} key={i}>
                  <div className={s.statIcon} style={{ background: c.bg }}><c.icon size={20} color={c.color} /></div>
                  <p className={s.statValue}>{c.val}</p>
                  <p className={s.statLabel}>{c.label}</p>
                  <span className={`${s.statChange} ${s.statUp}`}><TrendingUp size={12} /> {c.sub}</span>
                </div>
              ))}
            </div>
            <div className={s.chartSection}>
              <div className={s.chartCard}>
                <h3 className={s.chartTitle}>Doanh thu 6 tháng gần nhất</h3>
                <div className={s.barChart}>
                  {stats.monthlyRevenue?.map((m, i) => (
                    <div className={s.barGroup} key={i}>
                      <span className={s.barValue}>{fmt(m.revenue)}₫</span>
                      <div className={s.bar} style={{ height: `${(m.revenue / maxRev) * 150}px` }} />
                      <span className={s.barLabel}>{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.chartCard}>
                <h3 className={s.chartTitle}>Trạng thái đặt chỗ</h3>
                <div className={s.donutContainer}>
                  <svg className={s.donutSvg} viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="56" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    {buildArcs()}
                    <text x="75" y="72" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">{stats.totalBookings}</text>
                    <text x="75" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">Đặt chỗ</text>
                  </svg>
                  <div className={s.donutLegend}>
                    {donutData.map((d, i) => (
                      <div className={s.legendItem} key={i}>
                        <span className={s.legendLabel}><span className={s.legendDot} style={{ background: d.color }} />{d.label}</span>
                        <span className={s.legendValue}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking breakdown & Quick Stats */}
            <div className={s.chartSection}>
              <div className={s.chartCard}>
                <h3 className={s.chartTitle}>Phân tích đặt chỗ theo tháng</h3>
                <div className={s.barChart}>
                  {stats.monthlyRevenue?.map((m, i) => (
                    <div className={s.barGroup} key={`bk-${i}`}>
                      <span className={s.barValue}>{m.bookings}</span>
                      <div className={s.bar} style={{ height: `${(m.bookings / Math.max(...stats.monthlyRevenue.map(x => x.bookings), 1)) * 150}px`, background: "linear-gradient(180deg, #6366f1, #818cf8)" }} />
                      <span className={s.barLabel}>{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.chartCard}>
                <h3 className={s.chartTitle}>Thống kê nhanh</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { label: "Tỷ lệ xác nhận", value: stats.totalBookings ? Math.round(((stats.confirmedBookings + stats.completedBookings) / stats.totalBookings) * 100) + "%" : "0%", color: "#059669", bg: "#ecfdf5" },
                    { label: "Tỷ lệ huỷ", value: stats.totalBookings ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100) + "%" : "0%", color: "#dc2626", bg: "#fef2f2" },
                    { label: "Doanh thu TB / booking", value: stats.totalBookings ? fmt(Math.round(stats.totalRevenue / (stats.confirmedBookings + stats.completedBookings || 1))) + "₫" : "0₫", color: "#0d9488", bg: "#f0fdfa" },
                    { label: "Tour", value: stats.totalTours, color: "#6366f1", bg: "#eef2ff" },
                    { label: "Homestay", value: stats.totalHotels, color: "#ec4899", bg: "#fdf2f8" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", background: item.bg }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{item.label}</span>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "28px" }}>
              {[
                { label: "Thêm Tour", icon: Map, action: () => { setTab("tours"); setTimeout(() => openCreate("tour"), 100); } },
                { label: "Thêm Homestay", icon: Home, action: () => { setTab("hotels"); setTimeout(() => openCreate("hotel"), 100); } },
                { label: "Duyệt Owner", icon: ClipboardCheck, action: () => setTab("owner-applications") },
                { label: "Xem Đặt chỗ", icon: ShoppingCart, action: () => setTab("bookings") },
                { label: "Quản lý Users", icon: Users, action: () => setTab("users") },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700, color: "#334155", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <a.icon size={18} color="#6366f1" />{a.label}
                </button>
              ))}
            </div>
          </>)}

          {/* BOOKINGS */}
          {tab === "bookings" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý đặt chỗ</h1><p className={s.pageSubtitle}>Xem và cập nhật trạng thái booking</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách ({filtered.length})</h3>
                <div className={s.tableFilter}>
                  {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED"].map(f => (
                    <button key={f} className={bkFilter === f ? s.filterBtnActive : s.filterBtn} onClick={() => setBkFilter(f)}>{f === "ALL" ? "Tất cả" : STATUS_MAP[f]?.[0]}</button>
                  ))}
                </div>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Mã</th><th>Khách hàng</th><th>Dịch vụ</th><th>Check-in</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {filtered.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Không có booking nào</td></tr>}
                    {filtered.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: "#6366f1" }}>{b.shortId}</td>
                        <td><div className={s.userCell}><img className={s.userAvatar} src={b.user?.avatar || "https://ui-avatars.com/api/?name=" + (b.guestName || "U")} alt="" /><div><div className={s.userName}>{b.guestName}</div><div className={s.userEmail}>{b.guestEmail}</div></div></div></td>
                        <td>{b.hotel?.name || b.tour?.name || "—"}</td>
                        <td>{fmtD(b.checkIn)}</td>
                        <td style={{ fontWeight: 700, color: "#0d9488" }}>{fmt(b.totalAmount)}₫</td>
                        <td><span className={STATUS_MAP[b.status]?.[1]}>{STATUS_MAP[b.status]?.[0]}</span></td>
                        <td>
                          {b.status === "PENDING" && <><button className={s.confirmBtn} onClick={() => updateBkStatus(b.id, "CONFIRMED")}>Xác nhận</button><button className={s.cancelBtn} onClick={() => updateBkStatus(b.id, "CANCELLED")}>Huỷ</button></>}
                          {b.status === "CONFIRMED" && <button className={s.completeBtn} onClick={() => updateBkStatus(b.id, "COMPLETED")}>Hoàn thành</button>}
                          {(b.status === "COMPLETED" || b.status === "CANCELLED") && <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* USERS */}
          {tab === "users" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý người dùng</h1><p className={s.pageSubtitle}>Danh sách tài khoản và vai trò hệ thống</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách người dùng ({users.length})</h3>
                <button className={s.addBtn} onClick={() => openCreate("user")}><UserPlus size={16} /> Thêm người dùng</button>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Người dùng</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Ngày tạo</th><th>Bookings</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {users.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Không có người dùng nào</td></tr>}
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><div className={s.userCell}><img className={s.userAvatar} src={u.avatar || "https://ui-avatars.com/api/?name=" + (u.name || "U")} alt="" /><span className={s.userName}>{u.name || "Chưa đặt tên"}</span></div></td>
                        <td>{u.email}</td>
                        <td>{u.phone || "—"}</td>
                        <td><span className={ROLE_MAP[u.role] || s.badgeUser}>{u.role}</span></td>
                        <td>{fmtD(u.createdAt)}</td>
                        <td style={{ fontWeight: 600 }}>{u._count?.bookings ?? 0}</td>
                        <td style={{ display: "flex", gap: "8px" }}>
                          <button className={s.editBtn} onClick={() => openEdit("user", u)}><Pencil size={12} /></button>
                          <button className={s.deleteBtn} onClick={() => askDelete("user", u.id, u.name)}><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* OWNER APPLICATIONS */}
          {tab === "owner-applications" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Duyệt hồ sơ owner</h1><p className={s.pageSubtitle}>Xem xét hồ sơ đăng ký làm chủ homestay và cấp quyền OWNER</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Hồ sơ đối tác ({ownerApplications.length})</h3>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Thương hiệu</th><th>Người liên hệ</th><th>Tài khoản</th><th>Địa chỉ</th><th>Trạng thái</th><th>Ngày gửi</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {ownerApplications.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Chưa có hồ sơ owner</td></tr>}
                    {ownerApplications.map(app => (
                      <tr key={app.id}>
                        <td><div className={s.userName}>{app.businessName}</div><div className={s.userEmail}>{app.note || "Không có ghi chú"}</div></td>
                        <td><div className={s.userName}>{app.contactName}</div><div className={s.userEmail}>{app.phone}</div></td>
                        <td><div>{app.user?.email}</div><span className={ROLE_MAP[app.user?.role] || s.badgeUser}>{app.user?.role}</span></td>
                        <td>{app.address}, {app.city}</td>
                        <td><span className={APPLICATION_MAP[app.status]?.[1]}>{APPLICATION_MAP[app.status]?.[0] || app.status}</span></td>
                        <td>{fmtD(app.createdAt)}</td>
                        <td>
                          {app.status === "PENDING" ? (
                            <>
                              <button className={s.confirmBtn} onClick={() => updateOwnerApplication(app.id, "APPROVED")}>Duyệt</button>
                              <button className={s.cancelBtn} onClick={() => updateOwnerApplication(app.id, "REJECTED")}>Từ chối</button>
                            </>
                          ) : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* TOURS */}
          {tab === "tours" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý Tour</h1><p className={s.pageSubtitle}>Tạo, sửa, xoá tour du lịch</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách tour ({tours.length})</h3>
                <button className={s.addBtn} onClick={() => openCreate("tour")}><Plus size={16} /> Thêm tour</button>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Tên</th><th>Địa điểm</th><th>Thời gian</th><th>Ngày khởi hành</th><th>Giá</th><th>Duyệt</th><th>Bookings</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {tours.length === 0 && <tr><td colSpan={8} className={s.emptyState}>Chưa có tour</td></tr>}
                    {tours.map(t => (
                      <tr key={t.id}>
                        <td className={s.userName}>{t.name}</td>
                        <td>{t.location}</td>
                        <td>{t.durationDays}N{t.durationNights}Đ</td>
                        <td>{t.availability?.[0] ? fmtD(t.availability[0].startDate) : "Hàng ngày"}</td>
                        <td style={{ fontWeight: 700, color: "#0d9488" }}>{fmt(t.basePrice)}₫</td>
                        <td><span className={APPROVAL_MAP[t.approvalStatus]?.[1]}>{APPROVAL_MAP[t.approvalStatus]?.[0] || t.approvalStatus}</span></td>
                        <td>{t._count?.bookings ?? 0}</td>
                        <td>
                          <button className={s.editBtn} onClick={() => setPreview({ type: "tour", data: t })}>Xem</button>
                          <button className={s.editBtn} onClick={() => openEdit("tour", t)}><Pencil size={12} /></button>
                          {t.approvalStatus === "PENDING_REVIEW" && <button className={s.confirmBtn} onClick={() => updateTourApproval(t.id, "APPROVED")}>Duyệt</button>}
                          {t.approvalStatus === "PENDING_REVIEW" && <button className={s.cancelBtn} onClick={() => updateTourApproval(t.id, "REJECTED")}>Từ chối</button>}
                          <button className={s.deleteBtn} onClick={() => askDelete("tour", t.id, t.name)}><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* HOMESTAYS */}
          {tab === "hotels" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý Homestay</h1><p className={s.pageSubtitle}>Tạo, sửa, xoá homestay & lưu trú</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách homestay ({hotels.length})</h3>
                <button className={s.addBtn} onClick={() => openCreate("hotel")}><Plus size={16} /> Thêm homestay</button>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Tên</th><th>Thành phố</th><th>Loại</th><th>Giá/đêm</th><th>Duyệt</th><th>Bookings</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {hotels.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Chưa có homestay</td></tr>}
                    {hotels.map(h => (
                      <tr key={h.id}>
                        <td className={s.userName}>{h.name}</td>
                        <td>{h.city}</td>
                        <td><span className={s.badge} style={{ background: "#ede9fe", color: "#6d28d9" }}>{h.type}</span></td>
                        <td style={{ fontWeight: 700, color: "#0d9488" }}>{h.rooms?.[0] ? fmt(h.rooms[0].basePrice) + "₫" : "—"}</td>
                        <td><span className={APPROVAL_MAP[h.approvalStatus]?.[1]}>{APPROVAL_MAP[h.approvalStatus]?.[0] || h.approvalStatus}</span></td>
                        <td>{h._count?.bookings ?? 0}</td>
                        <td>
                          <button className={s.editBtn} onClick={() => setPreview({ type: "hotel", data: h })}>Xem</button>
                          <button className={s.editBtn} onClick={() => openEdit("hotel", h)}><Pencil size={12} /></button>
                          {h.approvalStatus === "PENDING_REVIEW" && <button className={s.confirmBtn} onClick={() => updateHotelApproval(h.id, "APPROVED")}>Duyệt</button>}
                          {h.approvalStatus === "PENDING_REVIEW" && <button className={s.cancelBtn} onClick={() => updateHotelApproval(h.id, "REJECTED")}>Từ chối</button>}
                          <button className={s.deleteBtn} onClick={() => askDelete("hotel", h.id, h.name)}><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* COUPONS */}
          {tab === "coupons" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý Khuyến mãi</h1><p className={s.pageSubtitle}>Tạo và quản lý các mã giảm giá hệ thống</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách mã ({coupons.length})</h3>
                <button className={s.addBtn} onClick={() => openCreate("coupon")}><Plus size={16} /> Thêm mã mới</button>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Mã giảm giá</th><th>Loại</th><th>Mức giảm</th><th>Đơn tối thiểu</th><th>Hiệu lực</th><th>Đã dùng</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {coupons.length === 0 && <tr><td colSpan={8} className={s.emptyState}>Chưa có mã giảm giá nào</td></tr>}
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: "#6366f1" }}>{c.code}</td>
                        <td>{c.discountType === "PERCENTAGE" ? "Phần trăm" : "Tiền mặt"}</td>
                        <td style={{ fontWeight: 700, color: "#0d9488" }}>{c.discountType === "PERCENTAGE" ? c.value + "%" : fmt(c.value) + "₫"}</td>
                        <td>{c.minOrder ? fmt(c.minOrder) + "₫" : "—"}</td>
                        <td><div style={{ fontSize: 12 }}>Từ: {fmtD(c.startDate)}</div><div style={{ fontSize: 12 }}>Đến: {fmtD(c.endDate)}</div></td>
                        <td>{c.usedCount} / {c.usageLimit || "∞"}</td>
                        <td>{c.isActive ? <span className={s.badgeConfirmed}>Hoạt động</span> : <span className={s.badgeCancelled}>Tắt</span>}</td>
                        <td style={{ display: "flex", gap: "8px" }}>
                          <button className={s.editBtn} onClick={() => openEdit("coupon", c)}><Pencil size={12} /></button>
                          <button className={s.deleteBtn} onClick={() => askDelete("coupon", c.id, c.code)}><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* REVIEWS */}
          {tab === "reviews" && (<>
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý Đánh giá</h1><p className={s.pageSubtitle}>Theo dõi và kiểm duyệt đánh giá từ người dùng</p></div>
            <div className={s.tableCard}>
              <div className={s.tableHeader}>
                <h3 className={s.tableTitle}>Danh sách đánh giá ({reviews.length})</h3>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Người đánh giá</th><th>Dịch vụ</th><th>Sao</th><th>Nội dung</th><th>Ngày tạo</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {reviews.length === 0 && <tr><td colSpan={6} className={s.emptyState}>Chưa có đánh giá nào</td></tr>}
                    {reviews.map(r => (
                      <tr key={r.id}>
                        <td><div className={s.userCell}><img className={s.userAvatar} src={r.user?.avatar || "https://ui-avatars.com/api/?name=" + (r.user?.name || "U")} alt="" /><div><div className={s.userName}>{r.user?.name || "Khách"}</div><div className={s.userEmail}>{r.user?.email}</div></div></div></td>
                        <td>{r.hotel ? <span className={s.badge} style={{ background: "#fdf2f8", color: "#db2777" }}>Homestay: {r.hotel.name}</span> : r.tour ? <span className={s.badge} style={{ background: "#eef2ff", color: "#4f46e5" }}>Tour: {r.tour.name}</span> : "—"}</td>
                        <td><div style={{ display: "flex", gap: 2 }}>{Array.from({length: 5}).map((_,i) => <Star key={i} size={14} color={i < r.rating ? "#eab308" : "#cbd5e1"} fill={i < r.rating ? "#eab308" : "transparent"} />)}</div></td>
                        <td style={{ maxWidth: 300, whiteSpace: "normal" }}>{r.content || "—"}</td>
                        <td>{fmtD(r.createdAt)}</td>
                        <td><button className={s.deleteBtn} onClick={() => askDelete("review", r.id, `Đánh giá của ${r.user?.name}`)}><Trash2 size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}
        </>)}
      </main>

      {/* MODAL */}
      {modal && (
        <div className={s.modalOverlay} onClick={() => setModal(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ width: 640, maxWidth: "94vw" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 className={s.modalTitle} style={{ margin: 0 }}>
                {modal.mode === "create" ? "Thêm" : "Chỉnh sửa"} {modal.type === "tour" ? "Tour" : modal.type === "hotel" ? "Homestay" : "Người dùng"}
              </h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 20, color: "#94a3b8", cursor: "pointer", padding: 4 }}>✕</button>
            </div>

            {modal.type === "user" ? (<>
              {/* ===== USER FORM ===== */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Thông tin cá nhân</div>
                <div className={s.formGroup}><label className={s.formLabel}>Họ và tên</label><input className={s.formInput} value={form.name || ""} onChange={F("name")} placeholder="VD: Nguyễn Văn A" /></div>
                <div className={s.formRow}>
                  <div className={s.formGroup}><label className={s.formLabel}>Email <span style={{ color: "#dc2626" }}>*</span></label><input className={s.formInput} value={form.email || ""} onChange={F("email")} placeholder="example@gmail.com" type="email" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Số điện thoại</label><input className={s.formInput} value={form.phone || ""} onChange={F("phone")} placeholder="0901234567" /></div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Quyền & Bảo mật</div>
                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Vai trò</label>
                    <select className={s.formInput} value={form.role || "USER"} onChange={F("role")} style={{ cursor: "pointer" }}>
                      <option value="USER">USER — Người dùng thường</option>
                      <option value="OWNER">OWNER — Chủ dịch vụ</option>
                      <option value="ADMIN">ADMIN — Quản trị viên</option>
                    </select>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>{modal.mode === "create" ? "Mật khẩu *" : "Đổi mật khẩu"}</label>
                    <input className={s.formInput} type="password" value={form.password || ""} onChange={F("password")} placeholder={modal.mode === "create" ? "Tối thiểu 6 ký tự" : "Bỏ trống nếu không đổi"} />
                    {modal.mode === "edit" && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Để trống để giữ mật khẩu hiện tại</div>}
                  </div>
                </div>
              </div>
            </>) : modal.type === "coupon" ? (<>
              {/* ===== COUPON FORM ===== */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Thông tin mã giảm giá</div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Mã code <span style={{ color: "#dc2626" }}>*</span></label>
                  <input className={s.formInput} value={form.code || ""} onChange={F("code")} placeholder="VD: SUMMER2024" style={{ textTransform: "uppercase" }} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Mô tả</label>
                  <input className={s.formInput} value={form.description || ""} onChange={F("description")} placeholder="VD: Giảm giá mùa hè 2024" />
                </div>
                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Loại giảm giá</label>
                    <select className={s.formInput} value={form.discountType || "PERCENTAGE"} onChange={F("discountType")} style={{ cursor: "pointer" }}>
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Tiền mặt (VNĐ)</option>
                    </select>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Mức giảm <span style={{ color: "#dc2626" }}>*</span></label>
                    <input className={s.formInput} type="number" value={form.value || ""} onChange={F("value")} placeholder="VD: 10 hoặc 100000" />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Đơn hàng tối thiểu (VNĐ)</label>
                    <input className={s.formInput} type="number" value={form.minOrder || ""} onChange={F("minOrder")} placeholder="Bỏ trống nếu không có" />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Giảm tối đa (VNĐ)</label>
                    <input className={s.formInput} type="number" value={form.maxDiscount || ""} onChange={F("maxDiscount")} placeholder="Chỉ áp dụng cho Phần trăm" />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Ngày bắt đầu <span style={{ color: "#dc2626" }}>*</span></label>
                    <input className={s.formInput} type="date" value={form.startDate ? new Date(form.startDate).toISOString().split("T")[0] : ""} onChange={F("startDate")} />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Ngày kết thúc <span style={{ color: "#dc2626" }}>*</span></label>
                    <input className={s.formInput} type="date" value={form.endDate ? new Date(form.endDate).toISOString().split("T")[0] : ""} onChange={F("endDate")} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Số lần sử dụng tối đa</label>
                    <input className={s.formInput} type="number" value={form.usageLimit || ""} onChange={F("usageLimit")} placeholder="Bỏ trống = Không giới hạn" />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Trạng thái</label>
                    <select className={s.formInput} value={form.isActive === false ? "false" : "true"} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === "true" }))} style={{ cursor: "pointer" }}>
                      <option value="true">Hoạt động</option>
                      <option value="false">Tắt</option>
                    </select>
                  </div>
                </div>
              </div>
            </>) : (<>
              {/* ===== TOUR / HOTEL FORM ===== */}
              {/* Section 1: Thông tin cơ bản */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
                  {modal.type === "tour" ? "Thông tin tour" : "Thông tin lưu trú"}
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Tên {modal.type === "tour" ? "tour" : "homestay"} <span style={{ color: "#dc2626" }}>*</span></label>
                  <input className={s.formInput} value={form.name || ""} onChange={F("name")} placeholder={modal.type === "tour" ? "VD: Khám phá Hà Giang Loop" : "VD: Sapa Highland Eco-Lodge"} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Mô tả chi tiết</label>
                  <textarea className={s.formInput} rows={4} value={form.description || ""} onChange={F("description")} placeholder="Mô tả hấp dẫn, chi tiết về dịch vụ..." style={{ resize: "vertical", lineHeight: 1.6 }} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: (form.description?.length || 0) > 500 ? "#059669" : "#94a3b8" }}>{form.description?.length || 0} ký tự</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Chi tiết */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
                  {modal.type === "tour" ? "Lịch trình & Giá" : "Vị trí & Phân loại"}
                </div>
                {modal.type === "tour" ? (<>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Địa điểm <span style={{ color: "#dc2626" }}>*</span></label>
                      <input className={s.formInput} value={form.location || ""} onChange={F("location")} placeholder="VD: Hà Giang, Sapa, Đà Nẵng" />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Giá cơ bản (VNĐ) <span style={{ color: "#dc2626" }}>*</span></label>
                      <input className={s.formInput} type="number" value={form.basePrice || ""} onChange={F("basePrice")} placeholder="VD: 2500000" />
                      {form.basePrice && <div style={{ fontSize: 11, color: "#0d9488", marginTop: 4, fontWeight: 600 }}>= {fmt(form.basePrice)}₫</div>}
                    </div>
                  </div>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Số ngày</label>
                      <input className={s.formInput} type="number" min="1" value={form.durationDays || ""} onChange={F("durationDays")} placeholder="VD: 3" />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Số đêm</label>
                      <input className={s.formInput} type="number" min="0" value={form.durationNights || ""} onChange={F("durationNights")} placeholder="VD: 2" />
                    </div>
                  </div>
                  <div className={s.formGroup} style={{ marginTop: 8 }}>
                    <label className={s.formLabel}>Ngày khởi hành</label>
                    <input className={s.formInput} type="date" value={form.startDate || ""} onChange={F("startDate")} />
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Để trống nếu tour khởi hành hàng ngày</div>
                  </div>
                  {/* Includes / Excludes */}
                  <div className={s.formRow} style={{ marginTop: 8 }}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Bao gồm (mỗi dòng 1 mục)</label>
                      <textarea className={s.formInput} rows={3} value={Array.isArray(form.includes) ? form.includes.join("\n") : (form.includesText || "")} onChange={e => setForm(p => ({ ...p, includesText: e.target.value, includes: e.target.value.split("\n").filter(Boolean) }))} placeholder={"Xe di chuyển\nKhách sạn\nBữa ăn"} style={{ resize: "vertical", fontSize: 13 }} />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Không bao gồm</label>
                      <textarea className={s.formInput} rows={3} value={Array.isArray(form.excludes) ? form.excludes.join("\n") : (form.excludesText || "")} onChange={e => setForm(p => ({ ...p, excludesText: e.target.value, excludes: e.target.value.split("\n").filter(Boolean) }))} placeholder={"Chi phí cá nhân\nĐồ uống"} style={{ resize: "vertical", fontSize: 13 }} />
                    </div>
                  </div>
                </>) : (<>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Địa chỉ <span style={{ color: "#dc2626" }}>*</span></label>
                      <input className={s.formInput} value={form.address || ""} onChange={F("address")} placeholder="VD: 122 Nguyễn Thái Học" />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Thành phố <span style={{ color: "#dc2626" }}>*</span></label>
                      <input className={s.formInput} value={form.city || ""} onChange={F("city")} placeholder="VD: Đà Lạt, Sapa, Hội An" />
                    </div>
                  </div>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Loại hình</label>
                      <select className={s.formInput} value={form.type || "HOMESTAY"} onChange={F("type")} style={{ cursor: "pointer" }}>
                        <option value="HOMESTAY">Homestay</option>
                        <option value="HOTEL">Hotel</option>
                        <option value="VILLA">Villa</option>
                        <option value="RESORT">Resort</option>
                      </select>
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Quốc gia</label>
                      <input className={s.formInput} value={form.country || "Việt Nam"} onChange={F("country")} />
                    </div>
                  </div>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Giá cơ bản / đêm (VNĐ) <span style={{ color: "#dc2626" }}>*</span></label>
                      <input className={s.formInput} type="number" value={form.basePrice || ""} onChange={F("basePrice")} placeholder="VD: 850000" />
                      {form.basePrice && <div style={{ fontSize: 11, color: "#0d9488", marginTop: 4, fontWeight: 600 }}>= {fmt(form.basePrice)}₫</div>}
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Quốc gia</label>
                      <input className={s.formInput} value={form.country || "Việt Nam"} onChange={F("country")} />
                    </div>
                  </div>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Vĩ độ (lat)</label>
                      <input className={s.formInput} type="number" step="0.0001" value={form.lat || ""} onChange={F("lat")} placeholder="VD: 11.9404" />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Kinh độ (lng)</label>
                      <input className={s.formInput} type="number" step="0.0001" value={form.lng || ""} onChange={F("lng")} placeholder="VD: 108.4583" />
                    </div>
                  </div>
                </>)}
              </div>

              {/* Section 3: Hình ảnh */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Hình ảnh</div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>URL hình ảnh (mỗi dòng 1 URL)</label>
                  <textarea className={s.formInput} rows={3} value={Array.isArray(form.images) ? form.images.join("\n") : (form.imagesText || "")} onChange={e => setForm(p => ({ ...p, imagesText: e.target.value, images: e.target.value.split("\n").filter(Boolean) }))} placeholder={"https://images.unsplash.com/photo-xxx\nhttps://images.unsplash.com/photo-yyy"} style={{ resize: "vertical", fontSize: 12, fontFamily: "monospace" }} />
                </div>
                {/* Image Preview */}
                {Array.isArray(form.images) && form.images.filter(Boolean).length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {form.images.filter(Boolean).slice(0, 4).map((url, i) => (
                      <div key={i} style={{ width: 80, height: 56, borderRadius: 8, overflow: "hidden", border: "2px solid #e2e8f0", position: "relative" }}>
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      </div>
                    ))}
                    {form.images.filter(Boolean).length > 4 && (
                      <div style={{ width: 80, height: 56, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#64748b" }}>+{form.images.filter(Boolean).length - 4}</div>
                    )}
                  </div>
                )}
              </div>
            </>)}

            {/* Actions */}
            <div className={s.modalActions} style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button className={s.modalCancelBtn} onClick={() => setModal(null)}>Huỷ bỏ</button>
              <button className={s.modalSubmitBtn} onClick={handleSave} style={{ minWidth: 120 }}>
                {modal.mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div className={s.modalOverlay} onClick={() => setConfirmDel(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ width: 420, textAlign: "center", padding: "36px 32px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={28} color="#dc2626" /></div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Xác nhận xoá</h3>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              Bạn có chắc muốn xoá <strong style={{ color: "#dc2626" }}>{confirmDel.name || "mục này"}</strong>?
              <br />Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className={s.modalCancelBtn} onClick={() => setConfirmDel(null)} style={{ minWidth: 100 }}>Huỷ bỏ</button>
              <button onClick={handleDelete} style={{ minWidth: 100, padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", background: "linear-gradient(135deg, #dc2626, #ef4444)", color: "#fff", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}>Xoá ngay</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className={s.modalOverlay} onClick={() => setPreview(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ width: 920, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", padding: 0 }}>
            <PreviewListing
              type={preview.type}
              item={preview.data}
              onClose={() => setPreview(null)}
              onApprove={() => preview.type === "hotel" ? updateHotelApproval(preview.data.id, "APPROVED") : updateTourApproval(preview.data.id, "APPROVED")}
              onReject={() => preview.type === "hotel" ? updateHotelApproval(preview.data.id, "REJECTED") : updateTourApproval(preview.data.id, "REJECTED")}
            />
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={toast.ok ? s.toastSuccess : s.toastError}>{toast.msg}</div>}
    </div>
  );
}

function PreviewListing({ type, item, onClose, onApprove, onReject }) {
  const isTour = type === "tour";
  const images = Array.isArray(item.images) && item.images.length
    ? item.images
    : [isTour ? "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80" : "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80"];
  const approval = APPROVAL_MAP[item.approvalStatus] || [item.approvalStatus, s.badgeUser];

  return (
    <div style={{ background: "#fff", color: "#0f172a" }}>
      <div style={{ position: "relative", height: 360, overflow: "hidden", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <img src={images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.2), rgba(15,23,42,0.82))" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontWeight: 800 }}>Đóng</button>
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 28 }}>
          <span className={approval[1]}>{approval[0]}</span>
          <h2 style={{ margin: "14px 0 8px", color: "#fff", fontSize: 34, fontWeight: 900, lineHeight: 1.15 }}>{item.name}</h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>
            {isTour ? `${item.location} • ${item.durationDays} ngày ${item.durationNights || 0} đêm` : `${item.address}, ${item.city}, ${item.country}`}
          </div>
        </div>
      </div>

      <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1.5fr 0.9fr", gap: 28 }}>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 900 }}>Nội dung hiển thị công khai</h3>
          <p style={{ color: "#475569", lineHeight: 1.75, fontSize: 15, whiteSpace: "pre-line" }}>{item.description || "Chưa có mô tả."}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "22px 0" }}>
            {images.slice(0, 4).map((img, index) => (
              <img key={index} src={img} alt="" style={{ width: "100%", height: 86, objectFit: "cover", borderRadius: 10 }} />
            ))}
          </div>

          {isTour ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <PreviewList title="Bao gồm" items={item.includes} />
              <PreviewList title="Không bao gồm" items={item.excludes} />
            </div>
          ) : (
            <div>
              <h3 style={{ margin: "24px 0 12px", fontSize: 18, fontWeight: 900 }}>Phòng</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {(item.rooms || []).length === 0 && <div style={{ color: "#64748b" }}>Chưa có phòng.</div>}
                {(item.rooms || []).map(room => (
                  <div key={room.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                    <strong>{room.name}</strong>
                    <span style={{ color: "#0d9488", fontWeight: 900 }}>{fmt(room.basePrice)}₫/đêm</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, height: "fit-content", background: "#f8fafc" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>Thông tin duyệt</div>
          <div style={{ fontSize: 28, color: "#0d9488", fontWeight: 900, marginBottom: 8 }}>{fmt(item.basePrice || item.rooms?.[0]?.basePrice)}₫</div>
          <div style={{ color: "#475569", fontWeight: 700, marginBottom: 16 }}>{isTour ? "Giá mỗi khách" : "Giá tham khảo mỗi đêm"}</div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Owner</div>
            <div style={{ color: "#475569" }}>{item.owner?.name || "Admin"}</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{item.owner?.email}</div>
          </div>
          {item.approvalStatus === "REJECTED" && item.approvalNote && (
            <div style={{ marginTop: 16, color: "#b91c1c", background: "#fef2f2", borderRadius: 10, padding: 12, fontWeight: 700 }}>{item.approvalNote}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button className={s.confirmBtn} onClick={onApprove} disabled={item.approvalStatus === "APPROVED"}>Duyệt</button>
            <button className={s.cancelBtn} onClick={onReject}>Từ chối</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewList({ title, items }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 900 }}>{title}</h3>
      {list.length === 0 ? <div style={{ color: "#94a3b8" }}>Chưa cập nhật</div> : list.map((item, index) => (
        <div key={index} style={{ color: "#475569", marginBottom: 8, fontWeight: 600 }}>• {item}</div>
      ))}
    </div>
  );
}
