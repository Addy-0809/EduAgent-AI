export default function MetricCard({ label, value, sub, accent = "var(--gold)" }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "2.2rem",
        fontWeight: 700,
        color: accent,
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 500 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
