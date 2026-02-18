import { useState } from "react";
import { api } from "../lib/api";
import ProgressBar from "../components/ProgressBar";

const QUICK = ["Data Structures & Algorithms", "Machine Learning", "Databases & SQL", "Operating Systems", "Computer Networks", "Web Development"];

export default function Learn() {
  const [goal,   setGoal]   = useState("");
  const [step,   setStep]   = useState("idle");
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");

  async function handleLearn() {
    if (!goal.trim()) return;
    setStep("loading"); setError(""); setResult(null);
    try {
      const r = await api.learn(goal.trim());
      setResult(r);
      setStep("done");
    } catch(e) {
      setError(e.message); setStep("error");
    }
  }

  return (
    <div>
      <h2 className="fade-up" style={{ fontFamily:"var(--font-display)", fontSize:"2rem", marginBottom:8 }}>Adaptive Learn Mode</h2>
      <p className="fade-up-1" style={{ color:"var(--text-dim)", marginBottom:28 }}>
        Enter any CS topic. Get a personalised learning path with content, assessment questions, and feedback.
      </p>

      {/* Input */}
      <div className="fade-up-1" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", gap:12, marginBottom:14 }}>
          <input
            className="input"
            placeholder="e.g. Master dynamic programming, Learn machine learning, Understand databases…"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLearn()}
          />
          <button className="btn btn-primary" disabled={step==="loading" || !goal.trim()} onClick={handleLearn} style={{ whiteSpace:"nowrap" }}>
            {step === "loading" ? <><span className="spinner" /> Learning…</> : "Start →"}
          </button>
        </div>

        {/* Quick picks */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {QUICK.map(q => (
            <button key={q} className="btn btn-ghost btn-sm" onClick={() => { setGoal(q); }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠ {error}</div>}

      {/* Loading state */}
      {step === "loading" && (
        <div className="card fade-up" style={{ textAlign:"center", padding:"48px" }}>
          <div className="spinner" style={{ width:32, height:32, borderWidth:3, margin:"0 auto 16px" }} />
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", marginBottom:8 }}>Building your learning path…</div>
          <div style={{ fontSize:"0.85rem", color:"var(--text-dim)" }}>Llama 3.3 is generating content and questions for each topic.</div>
        </div>
      )}

      {/* Results */}
      {result && step === "done" && (
        <div>
          {/* Path overview */}
          <div className="card fade-up" style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", color:"var(--text-faint)", marginBottom:12 }}>LEARNING PATH</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {result.learning_path?.map((t, i) => (
                <span key={t} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ padding:"6px 14px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:99, fontSize:"0.85rem", color:"var(--text)" }}>{t}</span>
                  {i < result.learning_path.length - 1 && <span style={{ color:"var(--text-faint)" }}>→</span>}
                </span>
              ))}
            </div>
            <div style={{ marginTop:16 }}>
              <ProgressBar value={result.avg_mastery * 100} label="Average Mastery" color="var(--gold)" />
            </div>
          </div>

          {/* Topic cards */}
          {result.topics?.map((t, i) => (
            <details key={t.topic} className="card fade-up" style={{ marginBottom:12, animationDelay:`${i*0.05}s` }}>
              <summary style={{ listStyle:"none", display:"flex", alignItems:"center", gap:16, cursor:"pointer", userSelect:"none" }}>
                <div style={{
                  width:36, height:36, borderRadius:8,
                  background: t.mastery >= 0.8 ? "rgba(34,197,94,0.15)" : t.mastery >= 0.7 ? "rgba(201,168,76,0.15)" : "rgba(239,68,68,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem",
                }}>
                  {t.mastery >= 0.8 ? "🌟" : t.mastery >= 0.7 ? "✅" : "⚠️"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, marginBottom:4 }}>{t.topic}</div>
                  <ProgressBar value={t.mastery * 100} color={t.mastery >= 0.7 ? "var(--green)" : "var(--amber)"} />
                </div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", color:t.mastery >= 0.7 ? "var(--green)" : "var(--amber)", minWidth:60, textAlign:"right" }}>
                  {(t.mastery * 100).toFixed(0)}%
                </div>
              </summary>

              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                {/* Content */}
                {t.content && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", color:"var(--text-faint)", marginBottom:10 }}>CONTENT</div>
                    <div style={{ fontSize:"0.875rem", color:"var(--text-dim)", lineHeight:1.8, maxHeight:300, overflowY:"auto", whiteSpace:"pre-wrap" }}>
                      {t.content}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {t.questions?.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", color:"var(--text-faint)", marginBottom:10 }}>ASSESSMENT QUESTIONS</div>
                    {t.questions.map((q, j) => {
                      const dColor = q.difficulty === "easy" ? "var(--green)" : q.difficulty === "hard" ? "var(--red)" : q.difficulty === "advanced" ? "#f472b6" : "var(--amber)";
                      return (
                        <div key={j} style={{ padding:"12px 14px", background:"var(--surface2)", borderRadius:"var(--radius)", marginBottom:8, borderLeft:`3px solid ${dColor}` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                            <span className="badge" style={{ background:`${dColor}20`, color:dColor }}>{q.difficulty}</span>
                            <span style={{ fontSize:"0.72rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>{q.marks} marks</span>
                          </div>
                          <div style={{ fontSize:"0.875rem", marginBottom:6 }}>{q.question}</div>
                          <details>
                            <summary style={{ fontSize:"0.75rem", color:"var(--text-faint)", cursor:"pointer" }}>Show answer ▾</summary>
                            <div style={{ marginTop:8, padding:"8px 12px", background:"var(--surface3)", borderRadius:6, fontSize:"0.8rem", color:"var(--text-dim)", lineHeight:1.6 }}>
                              {q.correct_answer}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Feedback */}
                {t.feedback && (
                  <div style={{ padding:"12px 16px", background:"var(--surface2)", borderRadius:"var(--radius)", borderLeft:"3px solid var(--gold-dim)", fontSize:"0.875rem", color:"var(--text-dim)", lineHeight:1.7 }}>
                    💬 {t.feedback}
                  </div>
                )}
              </div>
            </details>
          ))}

          {/* Overall feedback */}
          {result.feedback_text && (
            <div className="card fade-up" style={{ marginTop:8, borderLeft:"3px solid var(--gold-dim)" }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", color:"var(--gold-dim)", marginBottom:10 }}>WHAT'S NEXT</div>
              <p style={{ fontSize:"0.9rem", color:"var(--text-dim)", lineHeight:1.8 }}>{result.feedback_text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
