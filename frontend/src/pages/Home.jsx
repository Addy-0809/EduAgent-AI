import { useEffect, useState } from "react";
import { api } from "../lib/api";
import MetricCard from "../components/MetricCard";

const STEPS = [
  { n: "01", icon: "◈", title: "Upload Paper",    desc: "PDF or scanned image of any exam paper. Llama 3.3 extracts topics, question types, difficulty patterns." },
  { n: "02", icon: "◉", title: "Mock Paper",       desc: "AI generates a brand-new practice paper matching the original's structure. Download as professional PDF." },
  { n: "03", icon: "◎", title: "Submit Answers",   desc: "Write on paper, photograph it. EasyOCR reads your handwriting — no typing needed." },
  { n: "04", icon: "◆", title: "Graded Results",   desc: "Llama grades each answer with partial credit, highlights exactly what's missing, suggests 48-hour study plan." },
];

export default function Home({ onNav }) {
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    api.baseline().then(setBaseline).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 48 }}>
        <div style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          color: "var(--gold-dim)",
          marginBottom: 16,
          padding: "4px 12px",
          border: "1px solid var(--gold-dim)",
          borderRadius: 99,
        }}>
          B.TECH FINAL YEAR PROJECT  ·  2026
        </div>
        <h1 style={{ fontSize: "3.5rem", lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Intelligent<br />
          <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Adaptive</span> Learning
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-dim)", maxWidth: 560, lineHeight: 1.7 }}>
          Upload any exam paper. Get a personalised mock paper. Submit handwritten answers.
          Receive AI-graded results with partial credit and study feedback — all free.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav("paper")}>
            Upload Paper →
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav("learn")}>
            Learn Mode
          </button>
        </div>
      </div>

      {/* Metrics */}
      {baseline && (
        <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 48 }}>
          <MetricCard label="Accuracy"   value={`${baseline.system_accuracy}%`}  sub={`+${(baseline.system_accuracy - baseline.baseline_accuracy).toFixed(1)}% vs baseline`} />
          <MetricCard label="Precision"  value={`${baseline.system_precision}%`} sub="vs 65.45% baseline" accent="var(--indigo)" />
          <MetricCard label="Recall"     value={`${baseline.system_recall}%`}    sub="vs 63.78% baseline" accent="#22c55e" />
          <MetricCard label="F1-Score"   value={`${baseline.system_f1}%`}        sub={`${baseline.dataset_size} real student records`} accent="var(--amber)" />
        </div>
      )}

      {/* Workflow steps */}
      <div className="fade-up-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--text-faint)", marginBottom: 20 }}>
          HOW IT WORKS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className="card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-faint)", letterSpacing: "0.1em" }}>{s.n}</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                {s.title}
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="fade-up-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--text-faint)", marginBottom: 20 }}>
          TECHNOLOGY STACK
        </div>
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
          {[
            ["LLM",          "Llama 3.3 70B",   "via Groq — free"],
            ["Orchestration","LangGraph",        "agent workflows"],
            ["OCR",          "EasyOCR",          "handwriting recognition"],
            ["Backend",      "FastAPI",          "Python — async"],
            ["Frontend",     "React + Vite",     "fast, modern SPA"],
            ["Data",         "xAPI-Edu-Data",    "480 real students"],
          ].map(([cat, name, note], i) => (
            <div key={cat} style={{
              padding: "20px 24px",
              borderRight: i % 3 !== 2 ? "1px solid var(--border)" : "none",
              borderBottom: i < 3 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", marginBottom: 6 }}>{cat}</div>
              <div style={{ fontWeight: 600, color: "var(--gold)", fontSize: "0.95rem" }}>{name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 2 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
