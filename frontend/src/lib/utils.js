// Grade utilities
export const GRADE_COLORS = {
  "A+": { bg: "#0d3b2e", accent: "#22c55e", text: "#86efac" },
  "A":  { bg: "#0c2d4a", accent: "#3b82f6", text: "#93c5fd" },
  "B":  { bg: "#1e293b", accent: "#6366f1", text: "#a5b4fc" },
  "C":  { bg: "#2d2007", accent: "#f59e0b", text: "#fcd34d" },
  "D":  { bg: "#2a1a0e", accent: "#f97316", text: "#fdba74" },
  "F":  { bg: "#2d0e0e", accent: "#ef4444", text: "#fca5a5" },
};

export function gradeColor(letter) {
  return GRADE_COLORS[letter] || GRADE_COLORS["C"];
}

export function diffBadge(d) {
  return d === "easy"   ? { label: "Easy",   color: "#22c55e" }
       : d === "hard"   ? { label: "Hard",   color: "#ef4444" }
       :                  { label: "Medium", color: "#f59e0b" };
}

export function pctColor(pct) {
  return pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
}

export function formatPct(n) {
  return typeof n === "number" ? n.toFixed(1) + "%" : "—";
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
