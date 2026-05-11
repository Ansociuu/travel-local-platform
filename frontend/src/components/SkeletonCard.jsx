import React from 'react';

export default function SkeletonCard() {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.05)",
      borderRadius: "24px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Image Placeholder */}
      <div className="skeleton" style={{ height: "300px", width: "100%" }}></div>
      
      {/* Content Placeholder */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div className="skeleton" style={{ height: "24px", width: "60%", borderRadius: "4px" }}></div>
          <div className="skeleton" style={{ height: "20px", width: "20%", borderRadius: "4px" }}></div>
        </div>
        <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "20px", borderRadius: "4px" }}></div>
        
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div className="skeleton" style={{ height: "16px", width: "40px", borderRadius: "4px" }}></div>
          <div className="skeleton" style={{ height: "16px", width: "40px", borderRadius: "4px" }}></div>
          <div className="skeleton" style={{ height: "16px", width: "40px", borderRadius: "4px" }}></div>
        </div>
        
        <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="skeleton" style={{ height: "24px", width: "40%", borderRadius: "4px" }}></div>
        </div>
      </div>
    </div>
  );
}
