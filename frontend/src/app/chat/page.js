"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Search, ArrowLeft, MessageCircle } from "lucide-react";
import s from "./chat.module.css";
import { chatApi } from "@/lib/api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

const fmtTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "Vừa xong";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p trước`;
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const fmtMsgTime = (d) => new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const getDateLabel = (d) => {
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Hôm nay";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [typing, setTyping] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Auth check
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/login"); return; }
    setUser(JSON.parse(u));
  }, [router]);

  // Connect socket
  useEffect(() => {
    if (!user) return;
    const sock = connectSocket();
    if (!sock) return;

    sock.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;

        // Find if there's an optimistic message from me with same content
        const optIdx = prev.findIndex(m => 
          m.id && m.id.toString().startsWith("temp-") && 
          m.senderId === msg.senderId && 
          m.content === msg.content
        );

        if (optIdx !== -1) {
          const updated = [...prev];
          updated[optIdx] = msg;
          return updated;
        }

        return [...prev, msg];
      });
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { 
                ...c, 
                lastMessage: msg.content, 
                lastAt: msg.createdAt, 
                unreadCount: msg.senderId === user.id ? c.unreadCount : (c.unreadCount + 1) 
              }
            : c
        ).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
      );
    });

    sock.on("conversationUpdated", (data) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.lastMessage, lastAt: data.lastAt }
            : c
        ).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
      );
    });

    sock.on("userTyping", (data) => {
      setTyping(data);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(null), 3000);
    });

    sock.on("userStopTyping", () => setTyping(null));

    return () => {
      disconnectSocket();
    };
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    chatApi.getConversations().then(setConversations).catch(console.error);
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    chatApi.getMessages(activeConv.id).then(setMessages).catch(console.error);

    const sock = getSocket();
    if (sock) {
      sock.emit("joinConversation", { conversationId: activeConv.id });
    }

    // Mark as read
    setConversations((prev) =>
      prev.map((c) => c.id === activeConv.id ? { ...c, unreadCount: 0 } : c)
    );

    return () => {
      if (sock) sock.emit("leaveConversation", { conversationId: activeConv.id });
    };
  }, [activeConv]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      chatApi.searchUsers(search).then(setSearchResults).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeConv) return;
    const sock = getSocket();
    if (!sock) return;

    const content = input.trim();
    setInput("");

    sock.emit("sendMessage", { conversationId: activeConv.id, content });

    // Optimistic update
    const optimistic = {
      id: "temp-" + Date.now(),
      conversationId: activeConv.id,
      senderId: user.id,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    // Emit stop typing
    sock.emit("stopTyping", { conversationId: activeConv.id });
  }, [input, activeConv, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const sock = getSocket();
    if (sock && activeConv) {
      sock.emit("typing", { conversationId: activeConv.id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        sock.emit("stopTyping", { conversationId: activeConv.id });
      }, 2000);
    }
  };

  const startChat = async (targetUser) => {
    try {
      const conv = await chatApi.createConversation(targetUser.id);
      setSearch("");
      setSearchResults([]);
      setSearching(false);
      // Reload conversations
      const convs = await chatApi.getConversations();
      setConversations(convs);
      const found = convs.find((c) => c.id === conv.id);
      setActiveConv(found || { ...conv, otherUsers: [targetUser] });
      setMobileShowChat(true);
    } catch (e) {
      console.error(e);
    }
  };

  const selectConv = (conv) => {
    setActiveConv(conv);
    setMobileShowChat(true);
  };

  if (!user) return null;

  const otherUser = activeConv?.otherUsers?.[0];

  // Group messages by date
  const groupedMessages = [];
  let lastDate = "";
  messages.forEach((msg) => {
    const dateLabel = getDateLabel(msg.createdAt);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: "date", label: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: "msg", data: msg });
  });

  return (
    <div className={s.chatLayout}>
      {/* Sidebar */}
      <aside className={`${s.sidebar} ${mobileShowChat ? s.sidebarHidden : ""}`}>
        <div className={s.sidebarHeader}>
          <div className={s.sidebarTop}>
            <h2 className={s.sidebarTitle}>
              <MessageCircle size={22} color="#14b8a6" /> Tin nhắn
            </h2>
            <Link href="/" className={s.backLink}><ArrowLeft size={14} /> Trang chủ</Link>
          </div>
          <div className={s.searchBox}>
            <Search size={16} className={s.searchIcon} />
            <input
              className={s.searchInput}
              placeholder="Tìm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {searching && searchResults.length > 0 ? (
          <div className={s.searchResults}>
            {searchResults.map((u) => (
              <button key={u.id} className={s.searchItem} onClick={() => startChat(u)}>
                <img className={s.convAvatar} src={u.avatar || `https://ui-avatars.com/api/?name=${u.name || "U"}&background=0d9488&color=fff`} alt="" />
                <div>
                  <div className={s.searchName}>{u.name || "Chưa đặt tên"}</div>
                  <div className={s.searchEmail}>{u.email}</div>
                </div>
                <span className={s.roleBadge} style={{ background: u.role === "ADMIN" ? "#ede9fe" : u.role === "OWNER" ? "#fce7f3" : "#f1f5f9", color: u.role === "ADMIN" ? "#6d28d9" : u.role === "OWNER" ? "#be185d" : "#64748b", marginLeft: "auto" }}>
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        ) : searching && search.trim() ? (
          <div className={s.emptyConv}>Không tìm thấy người dùng</div>
        ) : (
          <div className={s.convList}>
            {conversations.length === 0 ? (
              <div className={s.emptyConv}>
                <span style={{ fontSize: "40px" }}>💬</span>
                <span>Chưa có cuộc trò chuyện nào</span>
                <span style={{ fontSize: "12px" }}>Tìm kiếm người dùng để bắt đầu chat</span>
              </div>
            ) : conversations.map((conv) => {
              const other = conv.otherUsers?.[0];
              return (
                <button
                  key={conv.id}
                  className={activeConv?.id === conv.id ? s.convItemActive : s.convItem}
                  onClick={() => selectConv(conv)}
                >
                  <img className={s.convAvatar} src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name || "U"}&background=0d9488&color=fff`} alt="" />
                  <div className={s.convInfo}>
                    <p className={s.convName}>{other?.name || "Người dùng"}</p>
                    <p className={s.convLastMsg}>{conv.lastMessage || "Bắt đầu trò chuyện..."}</p>
                  </div>
                  <div className={s.convMeta}>
                    <span className={s.convTime}>{fmtTime(conv.lastAt)}</span>
                    {conv.unreadCount > 0 && <span className={s.unreadBadge}>{conv.unreadCount}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Chat Area */}
      {activeConv ? (
        <div className={s.chatArea}>
          <div className={s.chatHeader}>
            <button className={s.mobileBackBtn} onClick={() => setMobileShowChat(false)}>
              <ArrowLeft size={16} /> Quay lại
            </button>
            <img className={s.chatHeaderAvatar} src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name || "U"}&background=0d9488&color=fff`} alt="" />
            <div>
              <p className={s.chatHeaderName}>{otherUser?.name || "Người dùng"}</p>
              <p className={s.chatHeaderStatus}>
                {typing?.conversationId === activeConv.id ? (
                  <em>Đang nhập...</em>
                ) : (
                  <><span className={s.onlineDot} /> Trực tuyến</>
                )}
              </p>
            </div>
          </div>

          <div className={s.messagesArea}>
            {groupedMessages.map((item, i) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${i}`} className={s.dateSeparator}>
                    <span className={s.dateLabel}>{item.label}</span>
                  </div>
                );
              }
              const msg = item.data;
              const isMe = msg.senderId === user.id;
              return (
                <div key={msg.id}>
                  <div className={isMe ? s.msgRowMe : s.msgRowOther}>
                    <div className={isMe ? s.msgBubbleMe : s.msgBubbleOther}>
                      {msg.content}
                    </div>
                  </div>
                  <div className={isMe ? s.msgTimeMe : s.msgTimeOther}>
                    {fmtMsgTime(msg.createdAt)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className={s.inputArea}>
            <textarea
              className={s.msgInput}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className={s.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className={s.emptyChat}>
          <span className={s.emptyIcon}>💬</span>
          <p className={s.emptyTitle}>Chào mừng đến VietJourney Chat</p>
          <p className={s.emptySub}>Chọn cuộc trò chuyện hoặc tìm người dùng để bắt đầu</p>
        </div>
      )}
    </div>
  );
}
