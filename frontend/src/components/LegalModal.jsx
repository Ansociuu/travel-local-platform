"use client";
import { X } from "lucide-react";

export default function LegalModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "80vh",
          borderRadius: "24px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          animation: "modalFadeIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: "24px", 
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: 700 }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: "#f1f5f9", 
              border: "none", 
              borderRadius: "50%", 
              width: "36px", 
              height: "36px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              transition: "all 0.2s"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          padding: "24px", 
          overflowY: "auto", 
          flex: 1,
          color: "#475569",
          fontSize: "15px",
          lineHeight: "1.7"
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: "10px 24px", 
              background: "#0d9488", 
              color: "#ffffff", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: 600, 
              cursor: "pointer" 
            }}
          >
            Tôi đã hiểu
          </button>
        </div>

        <style jsx>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
