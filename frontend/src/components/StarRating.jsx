export default function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i <= Math.floor(rating) ? "#f59e0b" : "rgba(245,158,11,0.3)"}>
          <path d="M6 1l1.2 3.6H11L8.1 6.9l1.2 3.6L6 8.2l-3.3 2.3 1.2-3.6L1 4.6h3.8L6 1z" />
        </svg>
      ))}
      <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "4px" }}>{rating}</span>
    </div>
  );
}
