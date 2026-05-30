"use client";
import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Search, ArrowLeft, MessageCircle, Paperclip, Heart, Reply, CheckCheck, Globe } from "lucide-react";
import s from "./chat.module.css";
import { authApi, chatApi, uploadApi } from "@/lib/api";
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

const LANG_NAMES = { "en": "English", "vi": "Tiếng Việt", "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "fr": "French", "es": "Spanish" };

function MessageBubble({ msg, isMe, autoTranslate, userLang, onReply, replyToMsg, isLastRead, otherUserAvatar }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const hasTranslation = msg.translatedContent && msg.translatedContent[userLang];
  const isDiffLang = msg.originalLanguage && msg.originalLanguage !== userLang;
  
  const displayContent = (autoTranslate && isDiffLang && hasTranslation && !showOriginal) 
    ? msg.translatedContent[userLang] 
    : msg.content;

  const langName = LANG_NAMES[msg.originalLanguage] || msg.originalLanguage;

  const handleReact = (e) => {
    e.stopPropagation();
    const sock = getSocket();
    if (sock) sock.emit('reactMessage', { messageId: msg.id, reaction: '❤️' });
  };

  const renderReactions = () => {
    if (!msg.reactions) return null;
    const reactionsList = Object.entries(msg.reactions);
    if (reactionsList.length === 0) return null;
    return (
      <div className={s.reactionsContainer}>
        {reactionsList.map(([uid, r]) => <span key={uid} className={s.reactionBadge}>{r}</span>)}
      </div>
    );
  };

  if (msg.type === 'SYSTEM') {
    return (
      <div className={s.systemMessage}>
        <div className={s.systemContent} dangerouslySetInnerHTML={{ __html: msg.content }} />
      </div>
    );
  }

  return (
    <div 
      className={s.messageWrapper}
      onMouseEnter={() => setShowActions(true)} 
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={isMe ? s.msgRowMe : s.msgRowOther}>
        <div className={isMe ? s.msgBubbleMe : s.msgBubbleOther} style={{ position: 'relative' }}>
          <div className={s.msgActions}>
            <button className={s.actionBtn} onClick={handleReact} title="Thả tim"><Heart size={14}/></button>
            <button className={s.actionBtn} onClick={() => onReply(msg)} title="Trả lời"><Reply size={14}/></button>
          </div>
          {replyToMsg && (
            <div className={s.replyQuote}>
              <Reply size={12} style={{marginRight: 4}}/>
              {replyToMsg.type === 'IMAGE' ? (
                <img src={replyToMsg.fileUrl} style={{maxHeight: '40px', borderRadius: '4px', marginLeft: '4px'}} alt="reply-thumb" />
              ) : replyToMsg.content}
            </div>
          )}
          {msg.type === 'IMAGE' && msg.fileUrl && (
            <img src={msg.fileUrl} alt="attachment" className={s.msgImage} />
          )}
          {msg.content && <div>{displayContent}</div>}
          {(autoTranslate && isDiffLang && hasTranslation) && (
            <div className={s.translateMeta}>
              <span className={s.translatedFrom}>Translated from {langName}</span>
              <button className={s.seeOriginalBtn} onClick={() => setShowOriginal(!showOriginal)}>
                {showOriginal ? "[Hide original]" : "[See original]"}
              </button>
            </div>
          )}
          {renderReactions()}
        </div>
      </div>
      <div className={isMe ? s.msgTimeMe : s.msgTimeOther}>
        {fmtMsgTime(msg.createdAt)}
      </div>
      {isMe && isLastRead && (
        <div style={{textAlign: 'right', marginTop: '2px'}}>
           <img src={otherUserAvatar} style={{width: 14, height: 14, borderRadius: '50%', objectFit: 'cover'}} alt="seen" title="Đã xem" />
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className={s.chatLayout}></div>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [messagesError, setMessagesError] = useState("");
  const [userLang, setUserLang] = useState("vi");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);
  const appliedQueryConversationId = useRef("");
  const activeConvRef = useRef(null); // Always up-to-date, avoids stale closure in socket handlers
  const queryConversationId = searchParams?.get("conversationId") || "";
  const activeConversationId = activeConv?.id || "";

  const lastReadMsgId = useMemo(() => {
    if (!user) return null;
    const myReadMsgs = messages.filter(m => m.senderId === user.id && m.read);
    return myReadMsgs.length > 0 ? myReadMsgs[myReadMsgs.length - 1].id : null;
  }, [messages, user]);

  // Keep ref in sync with state
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Auth check
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/login"); return; }
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
    setUserLang(parsedUser.preferredLanguage || "vi");
  }, [router]);

  const handleLangChange = async (e) => {
    const lang = e.target.value;
    setUserLang(lang);
    if (user) {
      const updated = { ...user, preferredLanguage: lang };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      authApi.updateMe({ preferredLanguage: lang }).catch(console.error);
    }
  };

  // Connect socket
  useEffect(() => {
    if (!user) return;
    const sock = connectSocket();
    if (!sock) return;

    // Re-join active conversation room on reconnect
    sock.on("connect", () => {
      const conv = activeConvRef.current;
      if (conv) {
        sock.emit("joinConversation", { conversationId: conv.id });
      }
    });

    sock.onAny((eventName, ...args) => {
      console.log(`[Socket.io] Received event: ${eventName}`, args);
    });

    sock.on("newMessage", (msg) => {
      console.log("[newMessage] received:", msg.id, "convId:", msg.conversationId, "activeConv:", activeConvRef.current?.id);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) {
          console.log("[newMessage] DEDUPED:", msg.id);
          return prev;
        }

        // Only update messages list if it belongs to the active conversation
        if (activeConvRef.current && msg.conversationId !== activeConvRef.current.id) {
          console.log("[newMessage] FILTERED - wrong conv:", msg.conversationId, "vs active:", activeConvRef.current.id);
          return prev;
        }

        // Find if there's an optimistic message from me with same content
        const optIdx = prev.findIndex(m => 
          m.id && m.id.toString().startsWith("temp-") && 
          m.senderId === msg.senderId && 
          m.content === msg.content
        );

        if (optIdx !== -1) {
          console.log("[newMessage] replaced optimistic:", msg.id);
          const updated = [...prev];
          updated[optIdx] = msg;
          return updated;
        }

        console.log("[newMessage] ADDED to state:", msg.id);
        
        // Emitting markRead if we are in this conversation
        if (activeConvRef.current && msg.conversationId === activeConvRef.current.id && msg.senderId !== user?.id) {
           setTimeout(() => sock.emit('markRead', { conversationId: msg.conversationId }), 500);
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

    sock.on("messagesRead", (data) => {
      setMessages((prev) => prev.map(m => (m.senderId === user.id && m.conversationId === data.conversationId) ? { ...m, read: true } : m));
    });

    sock.on("messageUpdated", (updatedMsg) => {
      // Only update if this message belongs to the active conversation
      if (activeConvRef.current && updatedMsg.conversationId !== activeConvRef.current.id) return;
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
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

  useEffect(() => {
    if (!queryConversationId) {
      appliedQueryConversationId.current = "";
      return;
    }
    if (appliedQueryConversationId.current === queryConversationId || conversations.length === 0) return;

    const found = conversations.find((conv) => conv.id === queryConversationId);
    if (found) {
      appliedQueryConversationId.current = queryConversationId;
      if (activeConversationId !== queryConversationId) setActiveConv(found);
      setMobileShowChat(true);
    }
  }, [queryConversationId, activeConversationId, conversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    let cancelled = false;
    setMessagesError("");
    chatApi.getMessages(activeConversationId)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setMessages([]);
          setMessagesError(error.message || "Không tải được tin nhắn. Vui lòng thử lại.");
        }
      });

    const sock = getSocket();
    if (sock) {
      sock.emit("joinConversation", { conversationId: activeConversationId });
    }

    // Mark as read
    setConversations((prev) => {
      let changed = false;
      const next = prev.map((c) => {
        if (c.id === activeConversationId && c.unreadCount > 0) {
          changed = true;
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      return changed ? next : prev;
    });

    return () => {
      cancelled = true;
      if (sock) sock.emit("leaveConversation", { conversationId: activeConversationId });
    };
  }, [activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    if ((!input.trim() && !uploading) || !activeConv) return;
    const sock = getSocket();
    if (!sock) return;

    const content = input.trim();
    setInput("");

    const payload = { 
      conversationId: activeConv.id, 
      content,
      type: 'TEXT',
      replyToId: replyingTo?.id || null 
    };

    setReplyingTo(null);
    sock.emit("sendMessage", payload);

    // Optimistic update
    const optimistic = {
      id: "temp-" + Date.now(),
      ...payload,
      senderId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    // Emit stop typing
    sock.emit("stopTyping", { conversationId: activeConv.id });
  }, [input, activeConv, user, replyingTo, uploading]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeConv) return;
    
    try {
      setUploading(true);
      const res = await uploadApi.uploadImages(files); // array of {url, public_id}
      const sock = getSocket();
      
      res.forEach(uploaded => {
        const payload = {
          conversationId: activeConv.id,
          content: "",
          type: 'IMAGE',
          fileUrl: uploaded.url,
          replyToId: replyingTo?.id || null,
        };
        
        sock.emit("sendMessage", payload);
        
        const optimistic = {
          id: "temp-" + Date.now() + Math.random(),
          ...payload,
          senderId: user.id,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
      });
      
      setReplyingTo(null);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

            <div className={s.translateControls}>
              <Globe size={16} />
              <select value={userLang} onChange={handleLangChange} className={s.langSelect}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
              <label className={s.autoTranslateToggle}>
                <input type="checkbox" checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} />
                Auto-translate
              </label>
            </div>
          </div>

          <div className={s.messagesArea}>
            {messagesError && <div className={s.messageError}>{messagesError}</div>}
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
                <MessageBubble 
                  key={msg.id || i} 
                  msg={msg} 
                  isMe={isMe} 
                  autoTranslate={autoTranslate} 
                  userLang={userLang} 
                  onReply={setReplyingTo}
                  replyToMsg={msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null}
                  isLastRead={msg.id === lastReadMsgId}
                  otherUserAvatar={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name || "U"}&background=0d9488&color=fff`}
                />
              );
            })}
            
            {typing?.conversationId === activeConv.id && (
              <div className={s.msgRowOther}>
                <div className={s.typingBubble}>
                   <span className={s.typingDot}></span>
                   <span className={s.typingDot}></span>
                   <span className={s.typingDot}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={s.inputContainerWrapper}>
            {replyingTo && (
              <div className={s.replyingToBanner}>
                <span>Đang trả lời: {replyingTo.type === 'IMAGE' ? '[Hình ảnh]' : replyingTo.content}</span>
                <button className={s.cancelReplyBtn} onClick={() => setReplyingTo(null)}>x</button>
              </div>
            )}
            <div className={s.inputArea}>
              <button className={s.attachBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Paperclip size={20} />
              </button>
              <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
              <textarea
                className={s.msgInput}
                placeholder={uploading ? "Đang tải ảnh lên..." : "Nhập tin nhắn..."}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={uploading}
              />
              <button className={s.sendBtn} onClick={sendMessage} disabled={(!input.trim() && !uploading) || uploading}>
                <Send size={20} />
              </button>
            </div>
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
