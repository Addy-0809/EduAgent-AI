import { useState, useEffect } from "react";
import { api } from "../lib/api";

const NAV = [
  { id: "home",    icon: "⬡",  label: "Overview"  },
  { id: "paper",   icon: "◈",  label: "Upload Paper" },
  { id: "mock",    icon: "◉",  label: "Mock Paper" },
  { id: "grade",   icon: "◎",  label: "Submit & Grade" },
  { id: "learn",   icon: "◆",  label: "Learn Mode" },
  { id: "results", icon: "◈",  label: "Results" },
];

export default function Layout({ page, onNav, children }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ status: "offline" }));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0",
        position: "fixed",
        top: 0, bottom: 0, left: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: "0 24px 28px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1.2 }}>
            EduAgent
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-faint)", marginTop: 4, letterSpacing: "0.1em" }}>
            AI  ·  v2.0
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                marginBottom: 2,
                background: page === n.id ? "var(--gold-glow)" : "transparent",
                color: page === n.id ? "var(--gold)" : "var(--text-dim)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: page === n.id ? 600 : 400,
                transition: "all 0.15s",
                textAlign: "left",
                borderLeft: page === n.id ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Status footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: health?.status === "ok" ? "var(--green)" : "#ef4444",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              {health?.status === "ok" ? "API online" : "API offline"}
            </span>
          </div>
          {health?.llm && (
            <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontFamily: "var(--font-mono)", lineHeight: 1.4 }}>
              {health.llm.split("/")[0]}<br />
              <span style={{ color: "var(--gold-dim)" }}>{health.llm.split("/")[1]}</span>
            </div>
          )}
          {health?.dataset && (
            <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              {health.dataset} student records
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: "40px 48px", maxWidth: "100%" }}>
        {children}
      </main>
    </div>
  );
}
