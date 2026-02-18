import { useState, useRef } from "react";
import { api } from "../lib/api";
import { diffBadge } from "../lib/utils";
import ProgressBar from "../components/ProgressBar";

const DEMO_PAPER = `UNIVERSITY EXAMINATION — DATA STRUCTURES AND ALGORITHMS
Time: 3 Hours    Max Marks: 100

PART A — Short Answer (40 marks)
Q1. Define a binary search tree. State its properties.              [8 marks]
Q2. Compare BFS and DFS. Give time and space complexities.          [8 marks]
Q3. What is dynamic programming? List its key properties.           [8 marks]
Q4. Explain hashing and two collision resolution methods.           [8 marks]
Q5. What is a minimum spanning tree? Name two algorithms.           [8 marks]

PART B — Long Answer (60 marks)
Q6. Implement insertion and deletion in a BST. Trace an example.   [15 marks]
Q7. Write Dijkstra's shortest-path algorithm. Trace on a graph.    [20 marks]
Q8. Solve 0/1 Knapsack using DP. weights=[2,3,4,5], values=[3,4,5,6], W=5. [25 marks]`;

export default function Paper({ onResult, onNav }) {
  const [file,     setFile]     = useState(null);
  const [useDemo,  setUseDemo]  = useState(false);
  const [step,     setStep]     = useState("idle");   // idle|extracting|analysing|done|error
  const [extracted,setExtracted]= useState("");
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  async function handleAnalyse() {
    setStep("extracting"); setError("");
    try {
      let text = "";
      if (useDemo || !file) {
        text = DEMO_PAPER;
        setExtracted(text);
      } else {
        const r = await api.uploadPaper(file);
        text = r.text;
        setExtracted(text);
      }
      setStep("analysing");
      const r = await api.analysePaper(text);
      setResult(r);
      onResult(r);
      setStep("done");
    } catch (e) {
      setError(e.message);
      setStep("error");
    }
  }

  const loading = step === "extracting" || step === "analysing";
  const an = result?.analysis;

  return (
    <div>
      <h2 className="fade-up" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: 8 }}>Upload Question Paper</h2>
      <p className="fade-up-1" style={{ color: "var(--text-dim)", marginBottom: 32 }}>
        PDF or image — Llama 3.3 extracts topics, questions, and difficulty distribution.
      </p>

      {step !== "done" && (
        <div className="fade-up-1">
          {/* Drop zone */}
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setUseDemo(false); } }}
            style={{ marginBottom: 20 }}
          >
            <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setUseDemo(false); } }} />
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>◈</div>
            {file ? (
              <>
                <div style={{ fontWeight: 600, color: "var(--gold)" }}>{file.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: 4 }}>{(file.size/1024).toFixed(0)} KB · click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop PDF or image here</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>or click to browse · PDF, PNG, JPG</div>
              </>
            )}
          </div>

          {/* Demo option */}
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom: 24, padding: "12px 16px", background: "var(--surface2)", borderRadius: "var(--radius)", border: `1px solid ${useDemo ? "var(--gold-dim)" : "var(--border)"}` }}>
            <input type="checkbox" checked={useDemo} onChange={e => { setUseDemo(e.target.checked); if (e.target.checked) setFile(null); }} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>Use built-in demo paper</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Data Structures & Algorithms · 100 marks · 8 questions</div>
            </div>
          </label>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

          <button className="btn btn-primary btn-lg" disabled={loading || (!file && !useDemo)} onClick={handleAnalyse} style={{ width: "100%" }}>
            {loading ? (
              <><span className="spinner" /> {step === "extracting" ? "Extracting text…" : "Analysing with Llama 3.3…"}</>
            ) : "Analyse Paper →"}
          </button>
        </div>
      )}

      {/* Results */}
      {step === "done" && an && (
        <div>
          <div className="alert alert-success fade-up" style={{ marginBottom: 24 }}>✓ Analysis complete — mock paper generated</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              ["Subject",   an.subject],
              ["Total Marks", an.total_marks],
              ["Duration",  an.estimated_duration],
              ["Questions", an.questions?.length ?? 0],
            ].map(([l,v]) => (
              <div key={l} className="card fade-up" style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1.4rem", fontWeight:700, color:"var(--gold)", fontFamily:"var(--font-display)" }}>{v}</div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-dim)", marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
            <div className="card fade-up-1">
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", color:"var(--text-faint)", marginBottom:16 }}>DIFFICULTY DISTRIBUTION</div>
              {Object.entries(an.difficulty_distribution || {}).map(([k,v]) => {
                const b = diffBadge(k);
                return <ProgressBar key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} value={v} color={b.color} style={{ marginBottom:12 }} />;
              })}
            </div>
            <div className="card fade-up-2">
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", color:"var(--text-faint)", marginBottom:16 }}>QUESTION TYPES</div>
              {Object.entries(an.type_distribution || {}).map(([k,v]) => (
                <ProgressBar key={k} label={k} value={v} color="var(--indigo)" style={{ marginBottom:12 }} />
              ))}
            </div>
          </div>

          {an.key_concepts?.length > 0 && (
            <div className="card fade-up-3" style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", color:"var(--text-faint)", marginBottom:12 }}>KEY CONCEPTS DETECTED</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {an.key_concepts.map(c => (
                  <span key={c} className="badge" style={{ background:"var(--indigo-dim)", color:"var(--indigo)", borderColor:"rgba(99,102,241,0.3)", border:"1px solid" }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:12 }}>
            <button className="btn btn-primary" onClick={() => onNav("mock")}>View Mock Paper →</button>
            <button className="btn btn-ghost"   onClick={() => { setStep("idle"); setResult(null); setFile(null); }}>Upload Another</button>
          </div>
        </div>
      )}
    </div>
  );
}
