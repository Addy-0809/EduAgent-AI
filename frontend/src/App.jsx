import { useState } from "react";
import "./index.css";
import Layout    from "./components/Layout";
import Home      from "./pages/Home";
import Paper     from "./pages/Paper";
import MockPaper from "./pages/MockPaper";
import Grade     from "./pages/Grade";
import Results   from "./pages/Results";
import Learn     from "./pages/Learn";

export default function App() {
  const [page,        setPage]        = useState("home");
  const [paperResult, setPaperResult] = useState(null);
  const [gradeResult, setGradeResult] = useState(null);

  function handlePaperResult(r) {
    setPaperResult(r);
  }

  function handleGradeResult(r) {
    setGradeResult(r);
  }

  function renderPage() {
    switch (page) {
      case "home":    return <Home onNav={setPage} />;
      case "paper":   return <Paper onResult={handlePaperResult} onNav={setPage} />;
      case "mock":    return <MockPaper paperResult={paperResult} onNav={setPage} />;
      case "grade":   return <Grade paperResult={paperResult} onGradeResult={handleGradeResult} onNav={setPage} />;
      case "results": return <Results gradeResult={gradeResult} onNav={setPage} />;
      case "learn":   return <Learn />;
      default:        return <Home onNav={setPage} />;
    }
  }

  return (
    <Layout page={page} onNav={setPage}>
      {renderPage()}
    </Layout>
  );
}
