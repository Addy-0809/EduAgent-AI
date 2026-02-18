import { gradeColor, pctColor, formatPct } from "../lib/utils";
import ProgressBar from "../components/ProgressBar";
import MetricCard from "../components/MetricCard";

export default function Results({ gradeResult, onNav }) {
  if (!gradeResult) {
    return (
      <div style={{ textAlign:"center", padding:"80px 0" }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>◈</div>
        <h2 style={{ fontFamily:"var(--font-display)", marginBottom:8 }}>No results yet</h2>
        <p style={{ color:"var(--text-dim)", marginBottom:24 }}>Submit your handwritten answers first.</p>
        <button className="btn btn-primary" onClick={() => onNav("grade")}>Submit Answers →</button>
      </div>
    );
  }

  const { grading_results={}, total_score=0, grade_letter="", grade_report="", feedback_text="", metrics={} } = gradeResult;
  const gc = gradeColor(grade_letter);

  const passed = Object.values(grading_results).filter(r => r?.percentage >= 50).length;
  const total  = Object.keys(grading_results).length;

  return (
    <div>
      <h2 className="fade-up" style={{ fontFamily:"var(--font-display)", fontSize:"2rem", marginBottom:28 }}>Your Results</h2>

      {/* Grade hero */}
      <div className="card fade-up-1" style={{
        background: `linear-gradient(135deg, ${gc.bg}, var(--surface))`,
        border: `1px solid ${gc.accent}40`,
        marginBottom: 24,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"32px 36px",
      }}>
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", color:gc.text, opacity:0.7, marginBottom:8 }}>FINAL GRADE</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"5rem", fontWeight:700, color:gc.accent, lineHeight:1 }}>
            {grade_letter}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"3rem", fontWeight:600, color:gc.text }}>
            {total_score.toFixed(1)}%
          </div>
          <div style={{ fontSize:"0.9rem", color:gc.text, opacity:0.7, marginTop:4 }}>
            {passed}/{total} questions passed
          </div>
        </div>
      </div>

      {/* Metrics vs baseline */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          <MetricCard label="Accuracy"   value={formatPct(metrics.accuracy)}   sub={`baseline ${metrics.baseline}%`}  />
          <MetricCard label="Precision"  value={formatPct(metrics.precision)}  sub="vs 65.45% baseline" accent="var(--indigo)" />
          <MetricCard label="Recall"     value={formatPct(metrics.recall)}     sub="vs 63.78% baseline" accent="var(--green)"  />
          <MetricCard label="F1-Score"   value={formatPct(metrics.f1_score)}   sub={`${metrics.dataset_size} real records`} accent="var(--amber)" />
        </div>
      )}

      {/* Per-question breakdown */}
      <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", letterSpacing:"0.12em", color:"var(--text-faint)", marginBottom:16 }}>
        QUESTION BREAKDOWN
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
        {Object.entries(grading_results).map(([qn, r]) => {
          if (!r) return null;
          const pc = r.percentage || 0;
          const ic = pc >= 70 ? "✅" : pc >= 50 ? "⚠️" : "❌";
          return (
            <details key={qn} className="card">
              <summary style={{ listStyle:"none", display:"flex", alignItems:"center", gap:16, cursor:"pointer", userSelect:"none" }}>
                <span style={{ fontSize:"1.1rem" }}>{ic}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                    <span style={{ fontFamily:"var(--font-mono)", fontWeight:700, color:"var(--gold)" }}>{qn}</span>
                    <span className="badge" style={{ background:`${pctColor(pc)}20`, color:pctColor(pc) }}>{r.grade}</span>
                  </div>
                  <ProgressBar value={pc} color={pctColor(pc)} />
                </div>
                <div style={{ textAlign:"right", minWidth:80 }}>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", fontWeight:700, color:pctColor(pc) }}>
                    {r.marks_awarded}/{r.marks_total}
                  </span>
                  <div style={{ fontSize:"0.72rem", color:"var(--text-faint)" }}>marks</div>
                </div>
              </summary>

              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                {r.correct_points?.length > 0 && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:"0.75rem", color:"var(--green)", fontFamily:"var(--font-mono)", marginBottom:6 }}>CORRECT</div>
                    {r.correct_points.map((p,i) => (
                      <div key={i} style={{ display:"flex", gap:8, fontSize:"0.875rem", marginBottom:4, color:"var(--text-dim)" }}>
                        <span style={{ color:"var(--green)" }}>✔</span>{p}
                      </div>
                    ))}
                  </div>
                )}
                {r.missing_points?.length > 0 && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:"0.75rem", color:"var(--red)", fontFamily:"var(--font-mono)", marginBottom:6 }}>MISSING</div>
                    {r.missing_points.map((p,i) => (
                      <div key={i} style={{ display:"flex", gap:8, fontSize:"0.875rem", marginBottom:4, color:"var(--text-dim)" }}>
                        <span style={{ color:"var(--red)" }}>✘</span>{p}
                      </div>
                    ))}
                  </div>
                )}
                {r.feedback && (
                  <div style={{ padding:"10px 14px", background:"var(--surface2)", borderRadius:"var(--radius)", fontSize:"0.875rem", color:"var(--text-dim)", borderLeft:"3px solid var(--gold-dim)" }}>
                    💬 {r.feedback}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback_text && (
        <div className="card fade-up" style={{ marginBottom:24, borderLeft:"3px solid var(--gold-dim)" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", color:"var(--gold-dim)", marginBottom:12 }}>
            PERSONALISED STUDY PLAN
          </div>
          <p style={{ fontSize:"0.9rem", color:"var(--text-dim)", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
            {feedback_text}
          </p>
        </div>
      )}

      {/* Download report */}
      {grade_report && (
        <div style={{ display:"flex", gap:12 }}>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(grade_report)}`}
            download="grade_report.txt"
            className="btn btn-outline"
          >
            ⬇ Download Report
          </a>
          <button className="btn btn-ghost" onClick={() => onNav("paper")}>
            Upload Another Paper
          </button>
        </div>
      )}
    </div>
  );
}
