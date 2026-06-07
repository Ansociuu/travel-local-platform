"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

const ZALO_LINK  = "https://zalo.me/your_zalo_oa_id"; // ← thay link Zalo OA thực tế
const HOTLINE    = "0364 603 462";
const ZALO_PHONE = "0364 603 462";

const BOT_GREETING =
  "Xin chào! 👋 Tôi là Trợ lý AI của VietJourney. Bạn cần hỗ trợ thông tin gì về việc đặt tour hay homestay hôm nay?";

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [tab, setTab]             = useState("chat"); // "chat" | "contact"
  const [pulse, setPulse]         = useState(false);
  const [messages, setMessages]   = useState([
    { from: "bot", text: BOT_GREETING },
  ]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const router    = useRouter();
  const wrapperRef  = useRef(null);
  const messagesEnd = useRef(null);

  // Pulse ring after 3s
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Click outside → close
  useEffect(() => {
    const h = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen]);

  // Auto scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((p) => [...p, { from: "user", text }]);
    setTyping(true);

    try {
      const data = await apiRequest("/ai/quick-chat", {
        method: "POST",
        body: { message: text },
      });
      setMessages((p) => [...p, { from: "bot", text: data.reply || "Xin lỗi, tôi chưa hiểu câu hỏi này 🙏" }]);
    } catch {
      setMessages((p) => [
        ...p,
        { from: "bot", text: "Hệ thống đang bận, vui lòng thử lại hoặc liên hệ qua tab **Liên hệ** nhé! 🙏" },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @keyframes fcw-popIn {
          from { opacity:0; transform:translateY(20px) scale(0.92); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes fcw-pulse-ring {
          0%   { transform:scale(1);   opacity:.7; }
          70%  { transform:scale(1.6); opacity:0;  }
          100% { transform:scale(1.6); opacity:0;  }
        }
        @keyframes fcw-dot-bounce {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-3px); }
        }
        @keyframes fcw-typing {
          0%,60%,100% { transform:translateY(0); opacity:.4; }
          30%         { transform:translateY(-5px); opacity:1; }
        }

        .fcw-popup   { animation: fcw-popIn .35s cubic-bezier(.175,.885,.32,1.275) forwards; }
        .fcw-pulse   { animation: fcw-pulse-ring 2s ease-out infinite; }
        .fcw-badge   { animation: fcw-dot-bounce 1.6s ease-in-out infinite; }

        .fcw-tab {
          flex:1; padding:10px 0; font-size:13px; font-weight:600;
          background:transparent; border:none; cursor:pointer;
          color:rgba(255,255,255,.45); position:relative;
          transition:color .2s;
        }
        .fcw-tab.active { color:#fff; }
        .fcw-tab.active::after {
          content:''; position:absolute; bottom:0; left:20%; right:20%;
          height:2px; border-radius:2px;
          background:linear-gradient(90deg,#0d9488,#14b8a6);
        }

        .fcw-contact-btn {
          display:flex; align-items:center; gap:14px;
          padding:14px 16px; border-radius:16px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.08);
          cursor:pointer; transition:background .2s,transform .15s;
          color:inherit; text-align:left; text-decoration:none;
        }
        .fcw-contact-btn:hover { background:rgba(255,255,255,.13); transform:translateX(3px); }

        .fcw-send {
          width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
          background:linear-gradient(135deg,#0d9488,#0f766e);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:transform .2s, box-shadow .2s;
          box-shadow:0 4px 12px rgba(13,148,136,.4);
        }
        .fcw-send:hover  { transform:scale(1.1); box-shadow:0 6px 18px rgba(13,148,136,.6); }
        .fcw-send:active { transform:scale(.96); }

        .fcw-fab {
          width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:transform .35s cubic-bezier(.4,0,.2,1), box-shadow .25s;
          position:relative; z-index:1;
        }
        .fcw-fab:hover { transform:scale(1.1) !important; }
        .fcw-fab:active { transform:scale(.96) !important; }

        .fcw-msg-bubble-user {
          background:linear-gradient(135deg,#0d9488,#0f766e);
          color:#fff; border-radius:18px 18px 4px 18px;
          padding:10px 14px; font-size:13.5px; line-height:1.5; max-width:78%;
          box-shadow:0 4px 12px rgba(13,148,136,.3);
        }
        .fcw-msg-bubble-bot {
          background:rgba(255,255,255,.1); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.1);
          color:rgba(255,255,255,.9); border-radius:18px 18px 18px 4px;
          padding:10px 14px; font-size:13.5px; line-height:1.5; max-width:82%;
        }
        .fcw-typing-dot {
          width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.6);
          display:inline-block;
        }
        .fcw-typing-dot:nth-child(1) { animation:fcw-typing 1.2s .0s infinite; }
        .fcw-typing-dot:nth-child(2) { animation:fcw-typing 1.2s .2s infinite; }
        .fcw-typing-dot:nth-child(3) { animation:fcw-typing 1.2s .4s infinite; }

        .fcw-input {
          flex:1; background:transparent; border:none; outline:none;
          color:#fff; font-size:13.5px; font-family:inherit;
          placeholder-color:rgba(255,255,255,.35);
        }
        .fcw-input::placeholder { color:rgba(255,255,255,.35); }
      `}</style>

      <div ref={wrapperRef} style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:9999 }}>

        {/* ═══ POPUP ═══ */}
        {isOpen && (
          <div
            className="fcw-popup"
            style={{
              position:"absolute", bottom:"76px", right:"0",
              width:"340px",
              background:"linear-gradient(160deg,#1a1f35 0%,#0d1224 100%)",
              borderRadius:"24px",
              boxShadow:"0 32px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.07)",
              overflow:"hidden",
              fontFamily:"'Inter','Segoe UI',sans-serif",
              display:"flex", flexDirection:"column",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding:"18px 20px 16px",
              background:"rgba(255,255,255,.04)",
              borderBottom:"1px solid rgba(255,255,255,.07)",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{
                  width:"38px", height:"38px", borderRadius:"12px",
                  background:"linear-gradient(135deg,#0d9488,#0a7c72)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 12px rgba(13,148,136,.4)",
                }}>
                  <MessageCircle size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ color:"#fff", fontWeight:700, fontSize:"15px", display:"flex", alignItems:"center", gap:"7px" }}>
                    VietJourney Care
                    <span style={{
                      width:"8px", height:"8px", borderRadius:"50%",
                      background:"#22c55e", display:"inline-block",
                      boxShadow:"0 0 0 2px rgba(34,197,94,.25)",
                    }} />
                  </div>
                  <div style={{ color:"#0d9488", fontSize:"12px", fontWeight:500, marginTop:"1px" }}>
                    Luôn sẵn sàng hỗ trợ bạn
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width:"30px", height:"30px", borderRadius:"50%", border:"none",
                  background:"rgba(255,255,255,.08)", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"rgba(255,255,255,.7)", transition:"background .2s",
                }}
                onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.15)"}
                onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Tabs ── */}
            <div style={{
              display:"flex", borderBottom:"1px solid rgba(255,255,255,.07)",
              background:"rgba(0,0,0,.15)",
            }}>
              <button className={`fcw-tab${tab==="chat"?" active":""}`} onClick={()=>setTab("chat")}>
                Chat AI
              </button>
              <button className={`fcw-tab${tab==="contact"?" active":""}`} onClick={()=>setTab("contact")}>
                Liên hệ
              </button>
            </div>

            {/* ══ TAB: CHAT AI ══ */}
            {tab === "chat" && (
              <>
                <div style={{
                  flex:1, overflowY:"auto", padding:"16px 16px 8px",
                  display:"flex", flexDirection:"column", gap:"12px",
                  maxHeight:"300px", minHeight:"220px",
                  scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,.1) transparent",
                }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      display:"flex",
                      justifyContent: m.from==="user" ? "flex-end" : "flex-start",
                      alignItems:"flex-end", gap:"8px",
                    }}>
                      {m.from === "bot" && (
                        <div style={{
                          width:"28px", height:"28px", borderRadius:"50%", flexShrink:0,
                          background:"linear-gradient(135deg,#0d9488,#0a7c72)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <Bot size={14} color="#fff" />
                        </div>
                      )}
                      <div className={m.from==="user" ? "fcw-msg-bubble-user" : "fcw-msg-bubble-bot"}>
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div style={{ display:"flex", alignItems:"flex-end", gap:"8px" }}>
                      <div style={{
                        width:"28px", height:"28px", borderRadius:"50%",
                        background:"linear-gradient(135deg,#0d9488,#0a7c72)",
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <Bot size={14} color="#fff" />
                      </div>
                      <div className="fcw-msg-bubble-bot" style={{ padding:"12px 16px", display:"flex", gap:"5px" }}>
                        <span className="fcw-typing-dot" />
                        <span className="fcw-typing-dot" />
                        <span className="fcw-typing-dot" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <div style={{
                  padding:"12px 14px",
                  borderTop:"1px solid rgba(255,255,255,.07)",
                  display:"flex", alignItems:"center", gap:"10px",
                  background:"rgba(0,0,0,.2)",
                }}>
                  <div style={{
                    flex:1, display:"flex", alignItems:"center",
                    background:"rgba(255,255,255,.08)", borderRadius:"50px",
                    padding:"9px 16px",
                    border:"1px solid rgba(255,255,255,.1)",
                    transition:"border-color .2s",
                  }}>
                    <input
                      className="fcw-input"
                      placeholder="Bạn cần hỗ trợ gì?"
                      value={input}
                      onChange={e=>setInput(e.target.value)}
                      onKeyDown={handleKey}
                      disabled={typing}
                    />
                  </div>
                  <button className="fcw-send" onClick={sendMessage} disabled={typing || !input.trim()}>
                    <Send size={16} color="#fff" strokeWidth={2.5} />
                  </button>
                </div>
              </>
            )}

            {/* ══ TAB: CONTACT ══ */}
            {tab === "contact" && (
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
                <p style={{
                  color:"rgba(255,255,255,.5)", fontSize:"13px", textAlign:"center",
                  margin:"0 0 4px", lineHeight:1.6,
                }}>
                  Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn<br/>
                  từ <strong style={{color:"rgba(255,255,255,.75)"}}>8:00</strong> đến <strong style={{color:"rgba(255,255,255,.75)"}}>22:00</strong> hàng ngày.
                </p>

                {/* Zalo */}
                <a
                  href={ZALO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fcw-contact-btn"
                >
                  <div style={{
                    width:"46px", height:"46px", borderRadius:"14px", flexShrink:0,
                    background:"linear-gradient(135deg,#1a8cff,#0047B2)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 6px 16px rgba(0,104,255,.35)",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="24" fill="#0068FF"/>
                      <path d="M24 10C16.268 10 10 15.82 10 23c0 4.27 2.15 8.07 5.5 10.57L14 38l5.2-2.6C20.4 35.76 22.15 36 24 36c7.732 0 14-5.82 14-13S31.732 10 24 10z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:"14px" }}>Chat qua Zalo</div>
                    <div style={{ color:"#0d9488", fontWeight:600, fontSize:"13px", marginTop:"2px" }}>{ZALO_PHONE}</div>
                  </div>
                </a>

                {/* Hotline */}
                <a
                  href={`tel:${HOTLINE.replace(/\s/g,"")}`}
                  className="fcw-contact-btn"
                >
                  <div style={{
                    width:"46px", height:"46px", borderRadius:"14px", flexShrink:0,
                    background:"linear-gradient(135deg,#f59e0b,#d97706)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 6px 16px rgba(245,158,11,.35)",
                  }}>
                    <Phone size={20} color="#fff" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:"14px" }}>Gọi Hotline</div>
                    <div style={{ color:"#f59e0b", fontWeight:600, fontSize:"13px", marginTop:"2px" }}>{HOTLINE}</div>
                  </div>
                </a>

                {/* Footer */}
                <div style={{
                  textAlign:"center", marginTop:"4px",
                  color:"rgba(255,255,255,.25)", fontSize:"11px",
                  fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase",
                }}>
                  Cam kết phản hồi trong 5 phút
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ FAB ═══ */}
        <div style={{ position:"relative" }}>
          {!isOpen && pulse && (
            <div className="fcw-pulse" style={{
              position:"absolute", inset:"-6px", borderRadius:"50%",
              border:"2px solid rgba(13,148,136,.55)",
              pointerEvents:"none",
            }} />
          )}
          {!isOpen && (
            <div className="fcw-badge" style={{
              position:"absolute", top:"-2px", right:"-2px",
              width:"14px", height:"14px", borderRadius:"50%",
              background:"#ef4444", border:"2px solid #fff", zIndex:2,
            }} />
          )}
          <button
            className="fcw-fab"
            onClick={() => { setIsOpen(v=>!v); setPulse(false); }}
            style={{
              background: isOpen
                ? "linear-gradient(135deg,#334155,#1e293b)"
                : "linear-gradient(135deg,#0d9488 0%,#0f172a 100%)",
              boxShadow: isOpen
                ? "0 8px 24px rgba(15,23,42,.4)"
                : "0 12px 32px rgba(13,148,136,.45)",
              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
            aria-label="Liên hệ hỗ trợ"
          >
            {isOpen
              ? <X color="#fff" size={24} strokeWidth={2.5} />
              : <MessageCircle color="#fff" size={25} strokeWidth={2} />
            }
          </button>
        </div>
      </div>
    </>
  );
}
