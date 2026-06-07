"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";

const typeTone = {
  BOOKING_CONFIRMED: "#0d9488",
  BOOKING_CANCELLED: "#dc2626",
  BOOKING_COMPLETED: "#2563eb",
  PAYMENT_RECEIVED: "#0d9488",
  NEW_MESSAGE: "#7c3aed",
  NEW_REVIEW: "#d97706",
  OWNER_APPROVED: "#0d9488",
  OWNER_REJECTED: "#dc2626",
  OWNER_APPLICATION_REQUESTED: "#d97706",
  OWNER_APPLICATION_SUBMITTED: "#2563eb",
  LISTING_APPROVED: "#0d9488",
  LISTING_REJECTED: "#dc2626",
  LISTING_REVIEW_REQUESTED: "#d97706",
  LISTING_REVIEW_SUBMITTED: "#2563eb",
  REVIEW_REPLY: "#2563eb",
};

export default function NotificationBell({ iconColor = "#0f172a", compact = false }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const hasToken = useMemo(() => typeof window !== "undefined" && localStorage.getItem("token"), []);

  const loadNotifications = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const [list, count] = await Promise.all([
        notificationsApi.getAll(20),
        notificationsApi.getUnreadCount(),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setUnreadCount(count?.unreadCount || 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!hasToken) return;
    const loadTimer = window.setTimeout(() => {
      loadNotifications();
    }, 0);
    const socket = connectSocket();
    const activeSocket = socket || getSocket();
    if (!activeSocket) {
      return () => window.clearTimeout(loadTimer);
    }

    const onNew = (notification) => {
      setItems((prev) => [notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
      setToast(notification);
      window.setTimeout(() => setToast(null), 3800);
    };
    const onCount = ({ unreadCount: nextCount }) => setUnreadCount(nextCount || 0);

    activeSocket.on("notification:new", onNew);
    activeSocket.on("notification:unread-count", onCount);

    return () => {
      window.clearTimeout(loadTimer);
      activeSocket.off("notification:new", onNew);
      activeSocket.off("notification:unread-count", onCount);
    };
  }, [hasToken]);

  const markAll = async () => {
    await notificationsApi.markAllRead();
    setUnreadCount(0);
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markOne = async (item) => {
    if (!item.read) {
      await notificationsApi.markRead(item.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    }
    setOpen(false);
  };

  if (!hasToken) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        title="Thông báo"
        style={{
          width: compact ? 34 : 36,
          height: compact ? 34 : 36,
          borderRadius: 10,
          border: "none",
          background: "rgba(255,255,255,0.14)",
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 999,
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: 46,
          width: "min(360px, calc(100vw - 32px))",
          maxHeight: "70vh",
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
          zIndex: 1000,
        }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--text-primary)", fontWeight: 900 }}>Thông báo</div>
            <button onClick={markAll} title="Đánh dấu đã đọc" style={{ border: "none", background: "transparent", color: "var(--accent)", cursor: "pointer", display: "flex" }}>
              <CheckCheck size={18} />
            </button>
          </div>
          <div style={{ maxHeight: "56vh", overflowY: "auto" }}>
            {items.length === 0 ? (
              <div style={{ padding: 28, textAlign: "center", color: "var(--text-secondary)", fontWeight: 700 }}>Chưa có thông báo</div>
            ) : items.map((item) => {
              const content = (
                <div onClick={() => markOne(item)} style={{
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "10px 1fr",
                  gap: 10,
                  borderBottom: "1px solid var(--border)",
                  background: item.read ? "transparent" : "rgba(20,184,166,0.08)",
                  cursor: "pointer",
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", marginTop: 5, background: typeTone[item.type] || "var(--accent)" }} />
                  <span>
                    <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 900, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.45 }}>{item.content}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginTop: 8 }}>{new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                  </span>
                </div>
              );
              return item.link ? <Link key={item.id} href={item.link} style={{ textDecoration: "none" }}>{content}</Link> : <div key={item.id}>{content}</div>;
            })}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: "min(360px, calc(100vw - 32px))",
          zIndex: 1400,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 18px 50px rgba(15,23,42,0.2)",
          padding: 16,
          color: "var(--text-primary)",
        }}>
          <button onClick={() => setToast(null)} title="Đóng" style={{ position: "absolute", right: 10, top: 10, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
            <X size={15} />
          </button>
          <div style={{ fontWeight: 900, marginBottom: 5 }}>{toast.title}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, paddingRight: 16 }}>{toast.content}</div>
        </div>
      )}
    </div>
  );
}
