import { useState, useRef } from "react";
import { api } from "../lib/api";

export default function Grade({ paperResult, onGradeResult, onNav }) {
  const [files,   setFiles]   = useState([]);
  const [ocr,     setOcr]     = useState("");
  const [step,    setStep]    = useState("idle");  // idle|ocr|grading|done|error
  const [error,   setError]   = useState("");
  const [dragging,setDragging]= useState(false);
  const inputRef = useRef();

  if (!paperResult?.mock_paper) {
    return (
      <div style={{ textAlign:"center", padding:"80px 0" }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>◎</div>
        <h2 style={{ fontFamily:"var(--font-display)", marginBottom:8 }}>Generate a mock paper first</h2>
        <button className="btn btn-primary" onClick={() => onNav("paper")}>Go to Upload →</button>
      </div>
    );
  }

  function addFiles(newFiles) {
    const arr = Array.from(newFiles).filter(f => /image|pdf/.test(f.type));
    setFiles(prev => [...prev, ...arr]);
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_,j) => j !== i));
  }

  async function handleGrade() {
    setStep("ocr"); setError("");
    try {
      let ocrText = ocr;
      if (files.length > 0) {
        const r = await api.uploadAnswers(files);
        ocrText = r.ocr_text;
        setOcr(ocrText);
      }
      if (!ocrText.trim()) throw new Error("No text extracted — try clearer photos");
      setStep("grading");
      const r = await api.grade(paperResult.mock_paper, ocrText, paperResult.session_id);
      onGradeResult(r);
      setStep("done");
    } catch (e) {
      setError(e.message);
      setStep("error");
    }
  }

  const loading = step === "ocr" || step === "grading";

  return (
    <div>
      <h2 className="fade-up" style={{ fontFamily:"var(--font-display)", fontSize:"2rem", marginBottom:8 }}>Submit Handwritten Answers</h2>
      <p className="fade-up-1" style={{ color:"var(--text-dim)", marginBottom:32 }}>
        Upload photos of your answer sheets. EasyOCR reads the handwriting, then Llama 3.3 grades each answer.
      </p>

      {step !== "done" && (
        <>
          {/* Drop zone */}
          <div
            className={`drop-zone ${dragging?"dragging":""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ marginBottom:20 }}
          >
            <input ref={inputRef} type="file" accept="image/*,.pdf" multiple style={{ display:"none" }}
              onChange={e => addFiles(e.target.files)} />
            <div style={{ fontSize:"2.5rem", marginBottom:12 }}>◎</div>
            <div style={{ fontWeight:500, marginBottom:4 }}>Drop answer sheet photos here</div>
            <div style={{ fontSize:"0.8rem", color:"var(--text-dim)" }}>Multiple pages supported · JPG, PNG, PDF</div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {files.map((f,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--surface2)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
                  <span style={{ fontSize:"1.2rem" }}>📷</span>
                  <span style={{ flex:1, fontSize:"0.875rem" }}>{f.name}</span>
                  <span style={{ fontSize:"0.75rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>{(f.size/1024).toFixed(0)}KB</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFile(i)} style={{ padding:"4px 10px" }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Manual OCR fallback */}
          <details style={{ marginBottom:20 }}>
            <summary style={{ cursor:"pointer", fontSize:"0.875rem", color:"var(--text-dim)", padding:"8px 0" }}>
              Or paste OCR / typed text manually ▾
            </summary>
            <textarea
              className="input"
              style={{ marginTop:10, minHeight:140, resize:"vertical", fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}
              placeholder="Paste student's answer text here…"
              value={ocr}
              onChange={e => setOcr(e.target.value)}
            />
          </details>

          {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠ {error}</div>}

          <button
            className="btn btn-primary btn-lg"
            disabled={loading || (files.length === 0 && !ocr.trim())}
            onClick={handleGrade}
            style={{ width:"100%" }}
          >
            {loading ? (
              <><span className="spinner" /> {step === "ocr" ? "Reading handwriting…" : "Grading with Llama 3.3…"}</>
            ) : "Grade My Answers →"}
          </button>
        </>
      )}

      {step === "done" && (
        <div className="fade-up">
          <div className="alert alert-success" style={{ marginBottom:24 }}>✓ Grading complete!</div>
          <button className="btn btn-primary btn-lg" onClick={() => onNav("results")} style={{ width:"100%" }}>
            View Results →
          </button>
        </div>
      )}
    </div>
  );
}
