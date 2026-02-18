// frontend/src/lib/api.js — typed API client for EduAgent AI backend

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(method, path, body, isForm = false) {
  const opts = {
    method,
    headers: isForm ? {} : { "Content-Type": "application/json" },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health:         ()              => req("GET",  "/api/health"),
  stats:          ()              => req("GET",  "/api/stats"),
  uploadPaper:    (file)          => { const f = new FormData(); f.append("file", file); return req("POST", "/api/paper/upload", f, true); },
  analysePaper:   (text)          => req("POST", "/api/paper/analyse", { text }),
  uploadAnswers:  (files)         => { const f = new FormData(); files.forEach(fl => f.append("files", fl)); return req("POST", "/api/answers/upload", f, true); },
  grade:          (mock, ocr, id) => req("POST", "/api/grade", { mock_paper: mock, ocr_text: ocr, session_id: id || "" }),
  learn:          (goal, id)      => req("POST", "/api/learn",  { goal, session_id: id || "" }),
  baseline:       ()              => req("GET",  "/api/evaluate/baseline"),
  pdfUrl:         (filename)      => `${BASE}/api/paper/pdf/${filename}`,
};
