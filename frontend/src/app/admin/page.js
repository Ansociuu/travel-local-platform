"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Map, Home, TrendingUp, DollarSign, UserPlus, CalendarCheck, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import s from "./admin.module.css";
import { adminApi } from "@/lib/api";

const TABS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "bookings", label: "Đặt chỗ", icon: ShoppingCart },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "tours", label: "Tour", icon: Map },
  { id: "hotels", label: "Homestay", icon: Home },
];
const STATUS_MAP = { PENDING: ["Chờ xử lý", s.badgePending], CONFIRMED: ["Đã xác nhận", s.badgeConfirmed], CANCELLED: ["Đã huỷ", s.badgeCancelled], COMPLETED: ["Hoàn thành", s.badgeCompleted] };
const ROLE_MAP = { ADMIN: s.badgeAdmin, USER: s.badgeUser, OWNER: s.badgeOwner };
const fmt = (n) => n == null ? "0" : Number(n).toLocaleString("vi-VN");
const fmtD = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bkFilter, setBkFilter] = useState("ALL");
  const [modal, setModal] = useState(null); // {type:'tour'|'hotel', mode:'create'|'edit', data:{}}
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/login"); return; }
    const role = JSON.parse(u).role;
    if (role !== "ADMIN" && role !== "OWNER") { router.push("/"); }
  }, [router]);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") setStats(await adminApi.getStats());
      else if (tab === "bookings") setBookings(await adminApi.getAllBookings());
      else if (tab === "users") setUsers(await adminApi.getAllUsers());
      else if (tab === "tours") setTours(await adminApi.getAllTours());
      else if (tab === "hotels") setHotels(await adminApi.getAllHotels());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const updateBkStatus = async (id, status) => {
    try { await adminApi.updateBookingStatus(id, status); setBookings(p => p.map(b => b.id === id ? { ...b, status } : b)); showToast("Cập nhật thành công"); } catch (e) { showToast(e.message, false); }
  };

  const updateRole = async (id, role) => {
    try { await adminApi.updateUserRole(id, role); setUsers(p => p.map(u => u.id === id ? { ...u, role } : u)); showToast("Cập nhật vai trò thành công"); } catch (e) { showToast(e.message, false); }
  };

  // CRUD handlers
  const openCreate = (type) => { setForm({}); setModal({ type, mode: "create" }); };
  const openEdit = (type, item) => { setForm({ ...item, basePrice: item.basePrice?.toString() }); setModal({ type, mode: "edit" }); };

  const handleSave = async () => {
    try {
      if (modal.type === "tour") {
        if (modal.mode === "create") { await adminApi.createTour(form); showToast("Tạo tour thành công"); }
        else { await adminApi.updateTour(form.id, form); showToast("Cập nhật tour thành công"); }
        setTours(await adminApi.getAllTours());
      } else {
        if (modal.mode === "create") { await adminApi.createHotel(form); showToast("Tạo homestay thành công"); }
        else { await adminApi.updateHotel(form.id, form); showToast("Cập nhật homestay thành công"); }
        setHotels(await adminApi.getAllHotels());
      }
      setModal(null);
    } catch (e) { showToast(e.message, false); }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Bạn có chắc muốn xoá?")) return;
    try {
      if (type === "tour") { await adminApi.deleteTour(id); setTours(p => p.filter(t => t.id !== id)); }
      else { await adminApi.deleteHotel(id); setHotels(p => p.filter(h => h.id !== id)); }
      showToast("Xoá thành công");
    } catch (e) { showToast(e.message, false); }
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
                { icon: Map, color: "#ec4899", bg: "rgba(236,72,153,0.1)", val: stats.totalTours + stats.totalHotels, label: "Sản phẩm", sub: `${stats.totalTours} tour · ${stats.totalHotels} homestay` },
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
              {[
                { label: "Thêm Tour", icon: "🗺️", action: () => { setTab("tours"); setTimeout(() => openCreate("tour"), 100); } },
                { label: "Thêm Homestay", icon: "🏡", action: () => { setTab("hotels"); setTimeout(() => openCreate("hotel"), 100); } },
                { label: "Xem Đặt chỗ", icon: "📋", action: () => setTab("bookings") },
                { label: "Quản lý Users", icon: "👥", action: () => setTab("users") },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700, color: "#334155", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: "22px" }}>{a.icon}</span>{a.label}
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
            <div className={s.pageHeader}><h1 className={s.pageTitle}>Quản lý người dùng</h1><p className={s.pageSubtitle}>Danh sách tài khoản đã đăng ký</p></div>
            <div className={s.tableCard}>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Người dùng</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Ngày tạo</th><th>Bookings</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><div className={s.userCell}><img className={s.userAvatar} src={u.avatar || "https://ui-avatars.com/api/?name=" + (u.name || "U")} alt="" /><span className={s.userName}>{u.name || "Chưa đặt tên"}</span></div></td>
                        <td>{u.email}</td>
                        <td>{u.phone || "—"}</td>
                        <td><span className={ROLE_MAP[u.role] || s.badgeUser}>{u.role}</span></td>
                        <td>{fmtD(u.createdAt)}</td>
                        <td style={{ fontWeight: 600 }}>{u._count?.bookings ?? 0}</td>
                        <td>
                          <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#334155", background: "#f8fafc", cursor: "pointer" }}>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="OWNER">OWNER</option>
                          </select>
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
                  <thead><tr><th>Tên</th><th>Địa điểm</th><th>Thời gian</th><th>Giá</th><th>Bookings</th><th>Ngày tạo</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {tours.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Chưa có tour</td></tr>}
                    {tours.map(t => (
                      <tr key={t.id}>
                        <td className={s.userName}>{t.name}</td>
                        <td>{t.location}</td>
                        <td>{t.durationDays}N{t.durationNights}Đ</td>
                        <td style={{ fontWeight: 700, color: "#0d9488" }}>{fmt(t.basePrice)}₫</td>
                        <td>{t._count?.bookings ?? 0}</td>
                        <td>{fmtD(t.createdAt)}</td>
                        <td>
                          <button className={s.editBtn} onClick={() => openEdit("tour", t)}><Pencil size={12} /></button>
                          <button className={s.deleteBtn} onClick={() => handleDelete("tour", t.id)}><Trash2 size={12} /></button>
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
                  <thead><tr><th>Tên</th><th>Thành phố</th><th>Loại</th><th>Đánh giá</th><th>Phòng</th><th>Bookings</th><th>Hành động</th></tr></thead>
                  <tbody>
                    {hotels.length === 0 && <tr><td colSpan={7} className={s.emptyState}>Chưa có homestay</td></tr>}
                    {hotels.map(h => (
                      <tr key={h.id}>
                        <td className={s.userName}>{h.name}</td>
                        <td>{h.city}</td>
                        <td><span className={s.badge} style={{ background: "#ede9fe", color: "#6d28d9" }}>{h.type}</span></td>
                        <td>⭐ {h.rating}</td>
                        <td>{h.rooms?.length || 0}</td>
                        <td>{h._count?.bookings ?? 0}</td>
                        <td>
                          <button className={s.editBtn} onClick={() => openEdit("hotel", h)}><Pencil size={12} /></button>
                          <button className={s.deleteBtn} onClick={() => handleDelete("hotel", h.id)}><Trash2 size={12} /></button>
                        </td>
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
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{modal.mode === "create" ? "Thêm" : "Sửa"} {modal.type === "tour" ? "Tour" : "Homestay"}</h2>
            <div className={s.formGroup}><label className={s.formLabel}>Tên</label><input className={s.formInput} value={form.name || ""} onChange={F("name")} placeholder="Nhập tên..." /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Mô tả</label><textarea className={s.formInput} rows={3} value={form.description || ""} onChange={F("description")} placeholder="Mô tả..." style={{ resize: "vertical" }} /></div>
            {modal.type === "tour" ? (<>
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Địa điểm</label><input className={s.formInput} value={form.location || ""} onChange={F("location")} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Giá (VNĐ)</label><input className={s.formInput} type="number" value={form.basePrice || ""} onChange={F("basePrice")} /></div>
              </div>
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Số ngày</label><input className={s.formInput} type="number" value={form.durationDays || ""} onChange={F("durationDays")} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Số đêm</label><input className={s.formInput} type="number" value={form.durationNights || ""} onChange={F("durationNights")} /></div>
              </div>
            </>) : (<>
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Địa chỉ</label><input className={s.formInput} value={form.address || ""} onChange={F("address")} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Thành phố</label><input className={s.formInput} value={form.city || ""} onChange={F("city")} /></div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Loại</label>
                <select className={s.formInput} value={form.type || "HOMESTAY"} onChange={F("type")}>
                  <option value="HOMESTAY">Homestay</option><option value="HOTEL">Hotel</option><option value="VILLA">Villa</option><option value="RESORT">Resort</option>
                </select>
              </div>
            </>)}
            <div className={s.modalActions}>
              <button className={s.modalCancelBtn} onClick={() => setModal(null)}>Huỷ</button>
              <button className={s.modalSubmitBtn} onClick={handleSave}>{modal.mode === "create" ? "Tạo mới" : "Lưu"}</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={toast.ok ? s.toastSuccess : s.toastError}>{toast.msg}</div>}
    </div>
  );
}
