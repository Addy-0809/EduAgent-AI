import { diffBadge } from "../lib/utils";

export default function MockPaper({ paperResult, onNav }) {
  if (!paperResult?.mock_paper) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>◉</div>
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>No mock paper yet</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>Upload and analyse a question paper first.</p>
        <button className="btn btn-primary" onClick={() => onNav("paper")}>Go to Upload →</button>
      </div>
    );
  }

  const mock    = paperResult.mock_paper;
  const pdfUrl  = paperResult.pdf_url;
  const diffIcon = { easy: "🟢", medium: "🟡", hard: "🔴" };
  const typeColor = { theory: "var(--indigo)", coding: "var(--green)", MCQ: "var(--amber)", numerical: "#f472b6", diagram: "#22d3ee" };

  return (
    <div>
      <h2 className="fade-up" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: 8 }}>Generated Mock Paper</h2>
      <p className="fade-up-1" style={{ color: "var(--text-dim)", marginBottom: 28 }}>
        Fresh questions matching your paper's topics, difficulty split, and question types.
      </p>

      {/* Header bar */}
      <div className="card fade-up-1" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", gap:32 }}>
          {[
            ["Subject",      mock.subject],
            ["Total Marks",  mock.total_marks],
            ["Duration",     mock.duration],
            ["Questions",    mock.questions?.length ?? 0],
          ].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontSize:"0.72rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", letterSpacing:"0.1em" }}>{l}</div>
              <div style={{ fontWeight:600, fontSize:"1rem", color:"var(--gold)" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {pdfUrl && (
            <a href={pdfUrl} download className="btn btn-primary btn-sm">
              ⬇ Download PDF
            </a>
          )}
          <button className="btn btn-outline btn-sm" onClick={() => onNav("grade")}>
            Submit Answers →
          </button>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {(mock.questions || []).map((q, i) => {
          const db = diffBadge(q.difficulty);
          const tc = typeColor[q.type] || "var(--text-dim)";
          return (
            <details key={q.number || i} className="card" style={{ cursor:"pointer" }}>
              <summary style={{ listStyle:"none", display:"flex", alignItems:"flex-start", gap:16, userSelect:"none" }}>
                {/* Q number */}
                <div style={{
                  minWidth: 44, height: 44,
                  background: "var(--surface3)",
                  borderRadius: 8,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-mono)", fontWeight:700, fontSize:"0.8rem", color:"var(--gold)",
                  flexShrink:0,
                }}>
                  {q.number || `Q${i+1}`}
                </div>
                {/* Content */}
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>{q.topic}</span>
                    <span className="badge" style={{ background:`${db.color}20`, color:db.color }}>{db.label}</span>
                    <span className="badge" style={{ background:`${tc}20`, color:tc }}>{q.type}</span>
                  </div>
                  <div style={{ fontSize:"0.95rem", lineHeight:1.6, paddingRight:40 }}>{q.text}</div>
                </div>
                {/* Marks */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700, color:"var(--gold)" }}>{q.marks}</div>
                  <div style={{ fontSize:"0.7rem", color:"var(--text-faint)" }}>marks</div>
                </div>
              </summary>

              {/* Sub-parts */}
              {q.sub_parts?.length > 0 && (
                <div style={{ marginTop:16, paddingLeft:60, borderTop:"1px solid var(--border)", paddingTop:16 }}>
                  {q.sub_parts.map((sp,j) => (
                    <div key={j} style={{ display:"flex", gap:12, marginBottom:8 }}>
                      <span style={{ fontFamily:"var(--font-mono)", color:"var(--gold-dim)", minWidth:24 }}>({sp.label})</span>
                      <span style={{ flex:1, fontSize:"0.9rem", color:"var(--text-dim)" }}>{sp.text}</span>
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.8rem", color:"var(--text-faint)" }}>[{sp.marks}m]</span>
                    </div>
                  ))}
                </div>
              )}
            </details>
          );
        })}
      </div>

      <div style={{ marginTop:24, padding:"16px", background:"var(--surface2)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
        <span style={{ fontSize:"0.85rem", color:"var(--text-dim)" }}>
          ✍ Write your answers on paper, photograph each page, then go to <strong style={{ color:"var(--text)" }}>Submit & Grade</strong>.
        </span>
      </div>
    </div>
  );
}
