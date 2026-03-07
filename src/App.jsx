import { useState } from "react";
import SymptomQuiz from "./components/SymptomQuiz";
import ReactionTest from "./components/ReactionTest";
import EyeTrackingTest from "./components/EyeTrackingTest";
import ResultsPage from "./components/ResultsPage";
import MythBusting from "./components/MythBusting";

export default function App() {
  const [page, setPage] = useState("home");
  const [results, setResults] = useState({});

  const updateResults = (newData) => setResults(prev => ({ ...prev, ...newData }));

  return (
    <div>
      {page === "home" && (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h1>Peace of Mind</h1>
          <p>Concussion assessment for young athletes</p>
          <button onClick={() => setPage("symptoms")}>Start Assessment</button>
          <br /><br />
          <button onClick={() => setPage("myths")}>Myth Busting</button>
        </div>
      )}
      {page === "symptoms" && (
        <SymptomQuiz onDone={(data) => { updateResults(data); setPage("reaction"); }} />
      )}
      {page === "reaction" && (
        <ReactionTest onDone={(data) => { updateResults(data); setPage("eyes"); }} />
      )}
      {page === "eyes" && (
        <EyeTrackingTest onDone={(data) => { updateResults(data); setPage("results"); }} />
      )}
      {page === "results" && <ResultsPage results={results} />}
      {page === "myths" && <MythBusting onBack={() => setPage("home")} />}
    </div>
  );
}