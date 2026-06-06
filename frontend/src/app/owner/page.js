"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Home,
  LayoutDashboard,
  Map,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";
import { authApi, ownerApi } from "@/lib/api";
import PricingCalendar from "@/components/PricingCalendar";
import s from "./owner.module.css";

const TABS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "hotels", label: "Homestay", icon: Home },
  { id: "tours", label: "Tour", icon: Map },
  { id: "bookings", label: "Booking", icon: ClipboardList },
];

const APPROVAL_LABELS = {
  DRAFT: ["Nháp", s.archived],
  PENDING_REVIEW: ["Chờ duyệt", s.pending],
  APPROVED: ["Đã duyệt", s.approved],
  REJECTED: ["Từ chối", s.rejected],
  ARCHIVED: ["Đã lưu trữ", s.archived],
};

const STATUS_LABELS = {
  PENDING: ["Chờ xử lý", s.pending],
  CONFIRMED: ["Đã xác nhận", s.confirmed],
  COMPLETED: ["Hoàn thành", s.completed],
  CANCELLED: ["Đã hủy", s.cancelled],
};

const emptyHotelForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "Việt Nam",
  type: "HOMESTAY",
  lat: "",
  lng: "",
  imagesText: "",
  policiesText: "",
};

const emptyRoomForm = {
  hotelId: "",
  name: "",
  description: "",
  type: "",
  basePrice: "",
  capacity: 2,
  totalRooms: 1,
  imagesText: "",
};

const emptyTourForm = {
  name: "",
  description: "",
  location: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: "",
  imagesText: "",
  includesText: "",
  excludesText: "",
};

const fmt = (value) => Number(value || 0).toLocaleString("vi-VN");
const fmtDate = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "-";
const toLines = (value) => Array.isArray(value) ? value.join("\n") : "";
const fromLines = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const isUnauthorizedError = (error) => error?.status === 401;

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export default function OwnerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [application, setApplication] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });
  const [hotelModal, setHotelModal] = useState(null);
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [tourModal, setTourModal] = useState(null);
  const [tourForm, setTourForm] = useState(emptyTourForm);
  const [roomModal, setRoomModal] = useState(null);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [calendarModal, setCalendarModal] = useState(null);
  const [expandedHotelId, setExpandedHotelId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [ownerLoadError, setOwnerLoadError] = useState("");
  const [applicationLoadError, setApplicationLoadError] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const loadOwnerData = useCallback(async () => {
    const [statsData, hotelsData, toursData, bookingsData] = await Promise.all([
      ownerApi.getStats(),
      ownerApi.getHotels(),
      ownerApi.getTours(),
      ownerApi.getBookings(),
    ]);
    setStats(statsData);
    setHotels(hotelsData);
    setTours(toursData);
    setBookings(bookingsData);
  }, []);

  const prefillApplicationForm = useCallback((profile, app = null) => {
    setApplicationForm((prev) => ({
      ...prev,
      contactName: app?.contactName || profile?.name || prev.contactName,
      phone: app?.phone || profile?.phone || prev.phone,
      businessName: app?.businessName || prev.businessName,
      address: app?.address || prev.address,
      city: app?.city || prev.city,
      note: app?.note || prev.note,
    }));
  }, []);

  useEffect(() => {
    const init = async () => {
      setOwnerLoadError("");
      setApplicationLoadError("");
      let profile = null;

      try {
        profile = await authApi.getMe();
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push("/login?redirect=/owner");
          return;
        }

        profile = readStoredUser();
        if (!profile) {
          router.push("/login?redirect=/owner");
          return;
        }
        setOwnerLoadError(error.message || "Không tải được thông tin tài khoản mới nhất. Dữ liệu hiển thị có thể chưa được cập nhật.");
      }

      if (!profile) {
        router.push("/login?redirect=/owner");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);

      if (profile.role === "ADMIN") {
        router.push("/admin");
        setLoading(false);
        return;
      }

      try {
        if (profile.role === "OWNER") {
          await loadOwnerData();
        } else {
          prefillApplicationForm(profile);
          const app = await ownerApi.getMyApplication();
          setApplication(app);
          prefillApplicationForm(profile, app);
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push("/login?redirect=/owner");
          return;
        }
        if (profile.role === "OWNER") {
          setOwnerLoadError(error.message || "Không tải được dữ liệu Owner Center. Vui lòng thử lại sau.");
        } else {
          setApplication(null);
          prefillApplicationForm(profile);
          setApplicationLoadError(error.message || "Không tải được hồ sơ đối tác hiện tại. Bạn vẫn có thể điền và gửi hồ sơ mới.");
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadOwnerData, prefillApplicationForm, router]);

  const filteredBookings = bookings;

  const toggleHotelExpand = (hotelId) => {
    setExpandedHotelId((prev) => (prev === hotelId ? null : hotelId));
  };

  const openHotelCreate = () => {
    setHotelForm(emptyHotelForm);
    setHotelModal({ mode: "create" });
  };

  const openHotelEdit = (hotel) => {
    setHotelForm({
      ...emptyHotelForm,
      ...hotel,
      lat: hotel.lat ?? "",
      lng: hotel.lng ?? "",
      imagesText: toLines(hotel.images),
      policiesText: hotel.policies ? JSON.stringify(hotel.policies, null, 2) : "",
    });
    setHotelModal({ mode: "edit", id: hotel.id });
  };

  const openTourCreate = () => {
    setTourForm(emptyTourForm);
    setTourModal({ mode: "create" });
  };

  const openTourEdit = (tour) => {
    setTourForm({
      ...emptyTourForm,
      ...tour,
      basePrice: tour.basePrice?.toString() || "",
      imagesText: toLines(tour.images),
      includesText: toLines(tour.includes),
      excludesText: toLines(tour.excludes),
    });
    setTourModal({ mode: "edit", id: tour.id });
  };

  const openRoomCreate = (hotelId = selectedHotelId) => {
    setRoomForm({ ...emptyRoomForm, hotelId });
    setRoomModal({ mode: "create" });
  };

  const openRoomEdit = (room, hotelId) => {
    setRoomForm({
      ...emptyRoomForm,
      ...room,
      hotelId,
      basePrice: room.basePrice?.toString() || "",
      imagesText: toLines(room.images),
    });
    setRoomModal({ mode: "edit", id: room.id });
  };

  const saveHotel = async () => {
    setSaving(true);
    try {
      let policies;
      if (hotelForm.policiesText?.trim()) {
        try {
          policies = JSON.parse(hotelForm.policiesText);
        } catch {
          notify("Chính sách phải là JSON hợp lệ");
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: hotelForm.name,
        description: hotelForm.description,
        address: hotelForm.address,
        city: hotelForm.city,
        country: hotelForm.country || "Việt Nam",
        type: hotelForm.type || "HOMESTAY",
        lat: hotelForm.lat === "" ? undefined : Number(hotelForm.lat),
        lng: hotelForm.lng === "" ? undefined : Number(hotelForm.lng),
        images: fromLines(hotelForm.imagesText || ""),
        policies,
      };

      if (hotelModal.mode === "create") await ownerApi.createHotel(payload);
      else await ownerApi.updateHotel(hotelModal.id, payload);
      await loadOwnerData();
      setHotelModal(null);
      notify("Homestay đã được gửi chờ duyệt");
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveTour = async () => {
    setSaving(true);
    try {
      const payload = {
        name: tourForm.name,
        description: tourForm.description,
        location: tourForm.location,
        durationDays: Number(tourForm.durationDays || 1),
        durationNights: Number(tourForm.durationNights || 0),
        basePrice: Number(tourForm.basePrice),
        images: fromLines(tourForm.imagesText || ""),
        includes: fromLines(tourForm.includesText || ""),
        excludes: fromLines(tourForm.excludesText || ""),
      };

      if (tourModal.mode === "create") await ownerApi.createTour(payload);
      else await ownerApi.updateTour(tourModal.id, payload);
      await loadOwnerData();
      setTourModal(null);
      notify("Tour đã được gửi chờ duyệt");
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveRoom = async () => {
    setSaving(true);
    try {
      const payload = {
        name: roomForm.name,
        description: roomForm.description,
        type: roomForm.type,
        basePrice: Number(roomForm.basePrice),
        capacity: Number(roomForm.capacity || 2),
        totalRooms: Number(roomForm.totalRooms || 1),
        images: fromLines(roomForm.imagesText || ""),
      };

      if (roomModal.mode === "create") await ownerApi.createRoom(roomForm.hotelId, payload);
      else await ownerApi.updateRoom(roomForm.hotelId, roomModal.id, payload);
      await loadOwnerData();
      setRoomModal(null);
      notify("Phòng đã được lưu và homestay chuyển về chờ duyệt");
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  const archiveHotel = async (hotel) => {
    if (!window.confirm(`Lưu trữ homestay "${hotel.name}"?`)) return;
    try {
      await ownerApi.archiveHotel(hotel.id);
      await loadOwnerData();
      notify("Đã lưu trữ homestay");
    } catch (error) {
      notify(error.message);
    }
  };

  const archiveTour = async (tour) => {
    if (!window.confirm(`Lưu trữ tour "${tour.name}"?`)) return;
    try {
      await ownerApi.archiveTour(tour.id);
      await loadOwnerData();
      notify("Đã lưu trữ tour");
    } catch (error) {
      notify(error.message);
    }
  };

  const deleteRoom = async (hotelId, room) => {
    if (!window.confirm(`Xóa phòng "${room.name}"?`)) return;
    try {
      await ownerApi.deleteRoom(hotelId, room.id);
      await loadOwnerData();
      notify("Đã xóa phòng");
    } catch (error) {
      notify(error.message);
    }
  };

  const updateBooking = async (booking, status) => {
    try {
      await ownerApi.updateBookingStatus(booking.id, status);
      await loadOwnerData();
      notify("Đã cập nhật booking");
    } catch (error) {
      notify(error.message);
    }
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const app = await ownerApi.createApplication(applicationForm);
      setApplication(app);
      notify("Hồ sơ đối tác đã được gửi");
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  const statCards = useMemo(() => [
    { label: "Homestay", value: stats?.totalHotels || 0, icon: Building2, color: "#0d9488", bg: "#f0fdfa" },
    { label: "Phòng", value: stats?.totalRooms || 0, icon: BedDouble, color: "#6366f1", bg: "#eef2ff" },
    { label: "Tour", value: stats?.totalTours || 0, icon: Map, color: "#2563eb", bg: "#eff6ff" },
    { label: "Booking chờ", value: stats?.pendingBookings || 0, icon: ClipboardList, color: "#d97706", bg: "#fffbeb" },
    { label: "Doanh thu", value: `${fmt(stats?.revenue)}₫`, icon: Wallet, color: "#db2777", bg: "#fdf2f8" },
  ], [stats]);

  if (loading) {
    return <div className={s.ownerLayout}><div className={s.empty}>Đang tải dữ liệu...</div></div>;
  }

  if (user?.role !== "OWNER") {
    return (
      <div className={s.ownerLayout}>
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
          <Link href="/" className={s.backBtn} style={{ width: "fit-content" }}><ArrowLeft size={16} /> Về trang chính</Link>
          <div className={s.applicationCard}>
            <div className={s.pageHeader}>
              <div>
                <h1 className={s.title}>Đăng ký làm chủ homestay</h1>
                <p className={s.subtitle}>Gửi hồ sơ đối tác để VietJourney duyệt quyền quản lý homestay.</p>
              </div>
              {application && <span className={`${s.badge} ${application.status === "PENDING" ? s.pending : application.status === "APPROVED" ? s.approved : s.rejected}`}>{application.status}</span>}
            </div>

            {ownerLoadError && <div className={s.notice}>{ownerLoadError}</div>}
            {applicationLoadError && <div className={s.notice}>{applicationLoadError}</div>}
            {!user?.isVerified && <div className={s.notice}>Bạn cần xác thực email trước khi gửi hồ sơ đối tác.</div>}
            {application?.status === "PENDING" && <div className={s.notice}>Hồ sơ của bạn đang chờ admin duyệt. Bạn có thể cập nhật và gửi lại thông tin nếu cần.</div>}
            {application?.status === "REJECTED" && <div className={s.notice}>Hồ sơ bị từ chối{application.rejectionReason ? `: ${application.rejectionReason}` : "."}</div>}

            <form onSubmit={submitApplication} className={s.formGrid}>
              {[
                ["businessName", "Tên thương hiệu / cơ sở"],
                ["contactName", "Người liên hệ"],
                ["phone", "Số điện thoại"],
                ["city", "Thành phố"],
                ["address", "Địa chỉ"],
              ].map(([key, label]) => (
                <div key={key} className={key === "address" ? s.formFull : undefined}>
                  <label className={s.label}>{label}</label>
                  <input className={s.input} value={applicationForm[key] || ""} onChange={(event) => setApplicationForm((prev) => ({ ...prev, [key]: event.target.value }))} required />
                </div>
              ))}
              <div className={s.formFull}>
                <label className={s.label}>Ghi chú</label>
                <textarea className={s.textarea} value={applicationForm.note || ""} onChange={(event) => setApplicationForm((prev) => ({ ...prev, note: event.target.value }))} placeholder="Mô tả kinh nghiệm vận hành, số lượng phòng, nhu cầu hợp tác..." />
              </div>
              <div className={s.formFull}>
                <button className={s.button} disabled={saving || !user?.isVerified}>{saving ? "Đang gửi..." : "Gửi hồ sơ đối tác"}</button>
              </div>
            </form>
          </div>
        </main>
        {toast && <div className={s.toast}>{toast}</div>}
      </div>
    );
  }

  return (
    <div className={s.ownerLayout}>
      <div className={s.shell}>
        <aside className={s.sidebar}>
          <Link href="/" className={s.backBtn}><ArrowLeft size={16} /> Về trang chính</Link>
          <div className={s.sidebarTitle}>Owner Center</div>
          {TABS.map((item) => (
            <button key={item.id} className={tab === item.id ? s.navBtnActive : s.navBtn} onClick={() => setTab(item.id)}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </aside>

        <main className={s.main}>
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.title}>Quản lý homestay</h1>
              <p className={s.subtitle}>Tạo listing, quản lý phòng và xử lý booking của cơ sở thuộc quyền sở hữu của bạn.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className={s.button} onClick={openHotelCreate}><Plus size={16} /> Thêm homestay</button>
              <button className={s.secondaryButton} onClick={openTourCreate}><Plus size={16} /> Thêm tour</button>
            </div>
          </div>

          {ownerLoadError && <div className={s.notice}>{ownerLoadError}</div>}

          {tab === "overview" && (
            <>
              <div className={s.grid}>
                {statCards.map((card) => (
                  <div className={s.statCard} key={card.label}>
                    <div className={s.statIcon} style={{ background: card.bg, color: card.color }}><card.icon size={22} /></div>
                    <p className={s.statValue}>{card.value}</p>
                    <div className={s.statLabel}>{card.label}</div>
                  </div>
                ))}
              </div>
              <div className={s.notice}>Homestay, phòng hoặc tour sau khi tạo/sửa sẽ ở trạng thái chờ duyệt và chỉ hiển thị công khai khi admin duyệt.</div>
              <HotelTable
                hotels={hotels.slice(0, 5)}
                expandedHotelId={expandedHotelId}
                onToggleExpand={toggleHotelExpand}
                onEdit={openHotelEdit}
                onArchive={archiveHotel}
                onRoom={openRoomCreate}
                onRoomEdit={openRoomEdit}
                onRoomDelete={deleteRoom}
                onCalendar={(hotelId, room) => setCalendarModal({ hotelId, room })}
              />
              <TourTable tours={tours.slice(0, 5)} onEdit={openTourEdit} onArchive={archiveTour} />
            </>
          )}

          {tab === "hotels" && (
            <HotelTable
              hotels={hotels}
              expandedHotelId={expandedHotelId}
              onToggleExpand={toggleHotelExpand}
              onEdit={openHotelEdit}
              onArchive={archiveHotel}
              onRoom={openRoomCreate}
              onRoomEdit={openRoomEdit}
              onRoomDelete={deleteRoom}
              onCalendar={(hotelId, room) => setCalendarModal({ hotelId, room })}
            />
          )}

          {tab === "tours" && (
            <TourTable tours={tours} onEdit={openTourEdit} onArchive={archiveTour} />
          )}

          {tab === "bookings" && (
            <BookingTable bookings={filteredBookings} onUpdate={updateBooking} />
          )}
        </main>
      </div>

      {hotelModal && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <div className={s.panelHeader}>
              <h2 className={s.panelTitle}>{hotelModal.mode === "create" ? "Thêm homestay" : "Chỉnh sửa homestay"}</h2>
              <button className={s.secondaryButton} onClick={() => setHotelModal(null)}>Đóng</button>
            </div>
            <div className={s.formGrid}>
              <Field label="Tên homestay" value={hotelForm.name} onChange={(value) => setHotelForm((prev) => ({ ...prev, name: value }))} required />
              <Field label="Thành phố" value={hotelForm.city} onChange={(value) => setHotelForm((prev) => ({ ...prev, city: value }))} required />
              <Field label="Địa chỉ" className={s.formFull} value={hotelForm.address} onChange={(value) => setHotelForm((prev) => ({ ...prev, address: value }))} required />
              <div>
                <label className={s.label}>Loại hình</label>
                <select className={s.select} value={hotelForm.type} onChange={(event) => setHotelForm((prev) => ({ ...prev, type: event.target.value }))}>
                  <option value="HOMESTAY">Homestay</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="VILLA">Villa</option>
                  <option value="RESORT">Resort</option>
                </select>
              </div>
              <Field label="Quốc gia" value={hotelForm.country} onChange={(value) => setHotelForm((prev) => ({ ...prev, country: value }))} />
              <Field label="Vĩ độ" type="number" value={hotelForm.lat} onChange={(value) => setHotelForm((prev) => ({ ...prev, lat: value }))} />
              <Field label="Kinh độ" type="number" value={hotelForm.lng} onChange={(value) => setHotelForm((prev) => ({ ...prev, lng: value }))} />
              <TextField label="Mô tả" className={s.formFull} value={hotelForm.description} onChange={(value) => setHotelForm((prev) => ({ ...prev, description: value }))} />
              <TextField label="URL hình ảnh, mỗi dòng 1 URL" className={s.formFull} value={hotelForm.imagesText} onChange={(value) => setHotelForm((prev) => ({ ...prev, imagesText: value }))} />
              <TextField label="Chính sách dạng JSON" className={s.formFull} value={hotelForm.policiesText} onChange={(value) => setHotelForm((prev) => ({ ...prev, policiesText: value }))} />
            </div>
            <div className={s.modalActions}>
              <button className={s.secondaryButton} onClick={() => setHotelModal(null)}>Hủy</button>
              <button className={s.button} onClick={saveHotel} disabled={saving}>{saving ? "Đang lưu..." : "Lưu và gửi duyệt"}</button>
            </div>
          </div>
        </div>
      )}

      {tourModal && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <div className={s.panelHeader}>
              <h2 className={s.panelTitle}>{tourModal.mode === "create" ? "Thêm tour" : "Chỉnh sửa tour"}</h2>
              <button className={s.secondaryButton} onClick={() => setTourModal(null)}>Đóng</button>
            </div>
            <div className={s.formGrid}>
              <Field label="Tên tour" value={tourForm.name} onChange={(value) => setTourForm((prev) => ({ ...prev, name: value }))} required />
              <Field label="Địa điểm" value={tourForm.location} onChange={(value) => setTourForm((prev) => ({ ...prev, location: value }))} required />
              <Field label="Giá cơ bản" type="number" value={tourForm.basePrice} onChange={(value) => setTourForm((prev) => ({ ...prev, basePrice: value }))} required />
              <Field label="Số ngày" type="number" value={tourForm.durationDays} onChange={(value) => setTourForm((prev) => ({ ...prev, durationDays: value }))} />
              <Field label="Số đêm" type="number" value={tourForm.durationNights} onChange={(value) => setTourForm((prev) => ({ ...prev, durationNights: value }))} />
              <TextField label="Mô tả" className={s.formFull} value={tourForm.description} onChange={(value) => setTourForm((prev) => ({ ...prev, description: value }))} />
              <TextField label="URL hình ảnh, mỗi dòng 1 URL" className={s.formFull} value={tourForm.imagesText} onChange={(value) => setTourForm((prev) => ({ ...prev, imagesText: value }))} />
              <TextField label="Bao gồm, mỗi dòng 1 mục" className={s.formFull} value={tourForm.includesText} onChange={(value) => setTourForm((prev) => ({ ...prev, includesText: value }))} />
              <TextField label="Không bao gồm, mỗi dòng 1 mục" className={s.formFull} value={tourForm.excludesText} onChange={(value) => setTourForm((prev) => ({ ...prev, excludesText: value }))} />
            </div>
            <div className={s.modalActions}>
              <button className={s.secondaryButton} onClick={() => setTourModal(null)}>Hủy</button>
              <button className={s.button} onClick={saveTour} disabled={saving}>{saving ? "Đang lưu..." : "Lưu và gửi duyệt"}</button>
            </div>
          </div>
        </div>
      )}

      {roomModal && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <div className={s.panelHeader}>
              <h2 className={s.panelTitle}>{roomModal.mode === "create" ? "Thêm phòng" : "Chỉnh sửa phòng"}</h2>
              <button className={s.secondaryButton} onClick={() => setRoomModal(null)}>Đóng</button>
            </div>
            <div className={s.formGrid}>
              <div>
                <label className={s.label}>Homestay</label>
                <select className={s.select} value={roomForm.hotelId} onChange={(event) => setRoomForm((prev) => ({ ...prev, hotelId: event.target.value }))}>
                  {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
                </select>
              </div>
              <Field label="Tên phòng" value={roomForm.name} onChange={(value) => setRoomForm((prev) => ({ ...prev, name: value }))} required />
              <Field label="Loại phòng" value={roomForm.type} onChange={(value) => setRoomForm((prev) => ({ ...prev, type: value }))} />
              <Field label="Giá cơ bản" type="number" value={roomForm.basePrice} onChange={(value) => setRoomForm((prev) => ({ ...prev, basePrice: value }))} required />
              <Field label="Sức chứa" type="number" value={roomForm.capacity} onChange={(value) => setRoomForm((prev) => ({ ...prev, capacity: value }))} />
              <Field label="Số phòng" type="number" value={roomForm.totalRooms} onChange={(value) => setRoomForm((prev) => ({ ...prev, totalRooms: value }))} />
              <TextField label="Mô tả" className={s.formFull} value={roomForm.description} onChange={(value) => setRoomForm((prev) => ({ ...prev, description: value }))} />
              <TextField label="URL hình ảnh, mỗi dòng 1 URL" className={s.formFull} value={roomForm.imagesText} onChange={(value) => setRoomForm((prev) => ({ ...prev, imagesText: value }))} />
            </div>
            <div className={s.modalActions}>
              <button className={s.secondaryButton} onClick={() => setRoomModal(null)}>Hủy</button>
              <button className={s.button} onClick={saveRoom} disabled={saving}>{saving ? "Đang lưu..." : "Lưu phòng"}</button>
            </div>
          </div>
        </div>
      )}

      {calendarModal && (
        <PricingCalendar 
          hotelId={calendarModal.hotelId} 
          room={calendarModal.room} 
          onClose={() => setCalendarModal(null)} 
        />
      )}

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", className, required }) {
  return (
    <div className={className}>
      <label className={s.label}>{label}{required ? " *" : ""}</label>
      <input className={s.input} type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} required={required} />
    </div>
  );
}

function TextField({ label, value, onChange, className }) {
  return (
    <div className={className}>
      <label className={s.label}>{label}</label>
      <textarea className={s.textarea} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function StatusBadge({ value, type = "approval" }) {
  const [label, className] = type === "booking" ? STATUS_LABELS[value] || [value, s.archived] : APPROVAL_LABELS[value] || [value, s.archived];
  return <span className={`${s.badge} ${className}`}>{label}</span>;
}

function HotelTable({ hotels, expandedHotelId, onToggleExpand, onEdit, onArchive, onRoom, onRoomEdit, onRoomDelete, onCalendar }) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableHeader}>
        <h2 className={s.panelTitle}>Danh sách homestay ({hotels.length})</h2>
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th></th><th>Tên</th><th>Thành phố</th><th>Loại</th><th>Duyệt</th><th>Phòng</th><th>Booking</th><th>Hành động</th></tr></thead>
          <tbody>
            {hotels.length === 0 && <tr><td colSpan={8}><div className={s.empty}>Chưa có homestay</div></td></tr>}
            {hotels.map((hotel) => {
              const isExpanded = expandedHotelId === hotel.id;
              const rooms = hotel.rooms || [];
              return (
                <React.Fragment key={hotel.id}>
                  <tr style={{ background: isExpanded ? "#f0fdfa" : undefined }}>
                    <td style={{ width: 32, textAlign: "center", cursor: "pointer", color: "#0d9488", fontWeight: 700 }} onClick={() => onToggleExpand(hotel.id)}>
                      {isExpanded ? "▾" : "▸"}
                    </td>
                    <td style={{ fontWeight: 800, color: "#0f172a", cursor: "pointer" }} onClick={() => onToggleExpand(hotel.id)}>{hotel.name}</td>
                    <td>{hotel.city}</td>
                    <td>{hotel.type}</td>
                    <td><StatusBadge value={hotel.approvalStatus} /></td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#0d9488" }}>{rooms.length}</span>
                      {" "}<span style={{ color: "#94a3b8", fontSize: 12 }}>phòng</span>
                    </td>
                    <td>{hotel._count?.bookings || 0}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className={s.smallButton} onClick={() => onEdit(hotel)}><Pencil size={13} /> Sửa</button>
                      <button className={s.smallButton} onClick={() => onRoom(hotel.id)}><Plus size={13} /> Thêm phòng</button>
                      <button className={s.dangerButton} onClick={() => onArchive(hotel)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ padding: "0 0 0 40px", background: "#f8fffd" }}>
                        <div style={{ borderLeft: "3px solid #0d9488", margin: "8px 0 12px 0", paddingLeft: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontWeight: 700, color: "#0d9488", fontSize: 14 }}>Phòng của {hotel.name}</span>
                            <button className={s.smallButton} onClick={() => onRoom(hotel.id)}><Plus size={13} /> Thêm phòng</button>
                          </div>
                          <RoomTable hotelId={hotel.id} rooms={rooms} onEdit={onRoomEdit} onDelete={onRoomDelete} onCalendar={onCalendar} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TourTable({ tours, onEdit, onArchive }) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableHeader}>
        <h2 className={s.panelTitle}>Danh sách tour ({tours.length})</h2>
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Tên</th><th>Địa điểm</th><th>Thời gian</th><th>Giá</th><th>Duyệt</th><th>Booking</th><th>Hành động</th></tr></thead>
          <tbody>
            {tours.length === 0 && <tr><td colSpan={7}><div className={s.empty}>Chưa có tour</div></td></tr>}
            {tours.map((tour) => (
              <tr key={tour.id}>
                <td style={{ fontWeight: 800, color: "#0f172a" }}>{tour.name}</td>
                <td>{tour.location}</td>
                <td>{tour.durationDays}N{tour.durationNights}Đ</td>
                <td style={{ color: "#0d9488", fontWeight: 800 }}>{fmt(tour.basePrice)}₫</td>
                <td><StatusBadge value={tour.approvalStatus} /></td>
                <td>{tour._count?.bookings || 0}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className={s.smallButton} onClick={() => onEdit(tour)}><Pencil size={13} /> Sửa</button>
                  <button className={s.dangerButton} onClick={() => onArchive(tour)}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomTable({ hotelId, rooms, onEdit, onDelete, onCalendar }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead><tr><th>Tên phòng</th><th>Loại</th><th>Giá</th><th>Sức chứa</th><th>Số phòng</th><th>Hành động</th></tr></thead>
        <tbody>
          {rooms.length === 0 && <tr><td colSpan={6}><div className={s.empty}>Chưa có phòng</div></td></tr>}
          {rooms.map((room) => (
            <tr key={room.id}>
              <td style={{ fontWeight: 800 }}>{room.name}</td>
              <td>{room.type || "-"}</td>
              <td style={{ color: "#0d9488", fontWeight: 800 }}>{fmt(room.basePrice)}₫</td>
              <td>{room.capacity}</td>
              <td>{room.totalRooms}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button className={s.smallButton} onClick={() => onCalendar(hotelId, room)}><Calendar size={13} /> Lịch</button>
                <button className={s.smallButton} onClick={() => onEdit(room, hotelId)}><Pencil size={13} /> Sửa</button>
                <button className={s.dangerButton} onClick={() => onDelete(hotelId, room)}><Trash2 size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingTable({ bookings, onUpdate }) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableHeader}>
        <h2 className={s.panelTitle}>Booking dịch vụ ({bookings.length})</h2>
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Mã</th><th>Khách</th><th>Dịch vụ</th><th>Check-in</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan={7}><div className={s.empty}>Chưa có booking</div></td></tr>}
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ fontWeight: 800, color: "#6366f1" }}>{booking.shortId}</td>
                <td><div style={{ fontWeight: 800 }}>{booking.guestName}</div><div style={{ color: "#94a3b8", fontSize: 12 }}>{booking.guestEmail}</div></td>
                <td>{booking.hotel?.name || booking.tour?.name || "-"}</td>
                <td>{fmtDate(booking.checkIn)}</td>
                <td style={{ color: "#0d9488", fontWeight: 800 }}>{fmt(booking.totalAmount)}₫</td>
                <td><StatusBadge value={booking.status} type="booking" /></td>
                <td style={{ display: "flex", gap: 8 }}>
                  {booking.status === "PENDING" && (
                    <>
                      <button className={s.smallButton} onClick={() => onUpdate(booking, "CONFIRMED")}><CheckCircle2 size={13} /> Xác nhận</button>
                      <button className={s.dangerButton} onClick={() => onUpdate(booking, "CANCELLED")}><XCircle size={13} /> Hủy</button>
                    </>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <>
                      <button className={s.smallButton} onClick={() => onUpdate(booking, "COMPLETED")}><CheckCircle2 size={13} /> Hoàn thành</button>
                      <button className={s.dangerButton} onClick={() => onUpdate(booking, "CANCELLED")}><XCircle size={13} /> Hủy</button>
                    </>
                  )}
                  {(booking.status === "COMPLETED" || booking.status === "CANCELLED") && <span style={{ color: "#cbd5e1" }}>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
