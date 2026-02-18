import { pctColor } from "../lib/utils";

export default function ProgressBar({ value, max = 100, color, label, showPct = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c   = color || pctColor(pct);
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{label}</span>
          {showPct && <span style={{ fontSize: "0.8rem", color: c, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}
