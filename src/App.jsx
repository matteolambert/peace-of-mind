// Import React's useState hook and all main app components
import { useState } from "react";
import ReactionTest from "./components/ReactionTest";
import EyeTrackingTest from "./components/EyeTrackingTest";
import ResultsPage from "./components/ResultsPage";
import MythBusting from "./components/MythBusting";

// List of symptoms for the quiz, each with a key, label, and icon
const SYMPTOMS = [
  { key: "headache", label: "Headache", icon: "🤕" },
  { key: "nausea", label: "Nausea / Dizziness", icon: "😵" },
  { key: "confusion", label: "Confusion / Fogginess", icon: "🌫️" },
  { key: "lightSensitivity", label: "Light Sensitivity", icon: "💡" },
  { key: "memory", label: "Memory Problems", icon: "🧠" },
  { key: "balance", label: "Balance Issues", icon: "⚖️" },
];

// SymptomQuiz component: lets user rate each symptom
function SymptomQuiz({ onDone }) {
  // State: answers for each symptom, initialized to 0
  const [answers, setAnswers] = useState(
    Object.fromEntries(SYMPTOMS.map((s) => [s.key, 0]))
  );

  // Helper to update a specific symptom's value
  const set = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  // Render the quiz UI
  return (
    <div style={styles.wrapper}>
      {/* Header with logo and myth buster button */}
      <div style={styles.header}>
        <span style={styles.logo}>PEACE OF MIND</span>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("goto-myths"))}
          style={styles.mythLink}
        >
          Myth Buster
        </button>
      </div>

      {/* Quiz title and instructions */}
      <h1 style={styles.h1}>How are you feeling?</h1>
      <p style={styles.sub}>
        Rate each symptom honestly. This data stays on your device.
      </p>

      {/* List of symptoms with sliders */}
      <div style={styles.symptomList}>
        {SYMPTOMS.map((s) => (
          <div key={s.key} style={styles.symptomRow}>
            <div style={styles.symptomLeft}>
              <span style={styles.symptomIcon}>{s.icon}</span>
              <span style={styles.symptomLabel}>{s.label}</span>
            </div>
            <div style={styles.sliderBox}>
              <input
                type="range"
                min={0}
                max={10}
                value={answers[s.key]}
                onChange={(e) => set(s.key, Number(e.target.value))}
                style={styles.slider}
              />
              {/* Color-coded value for severity */}
              <span
                style={{
                  ...styles.sliderVal,
                  color:
                    answers[s.key] >= 7
                      ? "#ff5252"
                      : answers[s.key] >= 4
                      ? "#ffeb3b"
                      : "#00e676",
                }}
              >
                {answers[s.key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Button to continue to next test */}
      <button
        onClick={() => onDone({ symptoms: answers })}
        style={styles.primaryBtn}
      >
        Continue to Cognitive Tests →
      </button>
    </div>
  );
}

// Home screen component: landing page with logo, tagline, and navigation
function Home({ onStart, onMyths }) {
  return (
    <div style={{ ...styles.wrapper, justifyContent: "center" }}>
      <div style={styles.homeInner}>
        {/* App logo */}
        <div style={styles.homeLogo}>
          <span style={styles.homeLogoText}>PEACE</span>
          <span style={{ ...styles.homeLogoText, color: "#fff" }}>OF MIND</span>
        </div>
        {/* Tagline and description */}
        <p style={styles.homeTagline}>
          Concussion screening for athletes.
          <br />
          Honest. Fast. Harder to fake.
        </p>
        {/* Start and myths navigation buttons */}
        <button onClick={onStart} style={styles.primaryBtn}>
          Start Assessment
        </button>
        <button onClick={onMyths} style={styles.ghostBtn}>
          Concussion Myths →
        </button>
        {/* Disclaimer about medical advice */}
        <p style={styles.homeDisclaimer}>
          Not a substitute for medical evaluation
        </p>
      </div>
    </div>
  );
}

// Main App component: controls navigation and state for the whole app
export default function App() {
  // State: which page is currently shown
  const [page, setPage] = useState("home");
  // State: stores all results from the assessment
  const [results, setResults] = useState({});

  // Helper to merge new data into results
  const merge = (data) => setResults((r) => ({ ...r, ...data }));

  // Listen for custom event to go to myths page (from quiz header)
  useState(() => {
    const handler = () => setPage("myths");
    window.addEventListener("goto-myths", handler);
    return () => window.removeEventListener("goto-myths", handler);
  });

  // Render the current page based on state
  return (
    <>
      {/* Global styles for the app */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f1a; }
        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #2a2a3e;
          outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00e676;
          cursor: pointer;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Conditional rendering for each page */}
      {page === "home" && (
        <Home onStart={() => setPage("symptoms")} onMyths={() => setPage("myths")} />
      )}
      {page === "symptoms" && (
        <SymptomQuiz
          onDone={(r) => {
            merge(r);
            setPage("reaction");
          }}
        />
      )}
      {page === "reaction" && (
        <ReactionTest
          onDone={(r) => {
            merge(r);
            setPage("eyes");
          }}
        />
      )}
      {page === "eyes" && (
        <EyeTrackingTest
          onDone={(r) => {
            merge(r);
            setPage("results");
          }}
        />
      )}
      {page === "results" && (
        <ResultsPage
          results={results}
          onRestart={() => {
            setResults({});
            setPage("home");
          }}
        />
      )}
      {page === "myths" && <MythBusting onBack={() => setPage("home")} />}
    </>
  );
}

// Shared styles for all components
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#fff",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px 48px",
  },
  header: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#00e676" },
  mythLink: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: 13,
    cursor: "pointer",
  },
  h1: { fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" },
  sub: { fontSize: 14, color: "#666", marginBottom: 32, textAlign: "center" },
  symptomList: { width: "100%", maxWidth: 480, marginBottom: 32 },
  symptomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #1a1a2e",
  },
  symptomLeft: { display: "flex", alignItems: "center", gap: 10 },
  symptomIcon: { fontSize: 22 },
  symptomLabel: { fontSize: 14, color: "#ccc" },
  sliderBox: { display: "flex", alignItems: "center", gap: 10 },
  slider: { width: 120 },
  sliderVal: { fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: "right" },
  primaryBtn: {
    width: "100%",
    maxWidth: 480,
    padding: "16px",
    background: "#00e676",
    color: "#0f0f1a",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
  },
  ghostBtn: {
    width: "100%",
    maxWidth: 480,
    padding: "14px",
    background: "transparent",
    color: "#555",
    border: "1px solid #2a2a3e",
    borderRadius: 12,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 12,
  },
  homeInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    maxWidth: 380,
    width: "100%",
  },
  homeLogo: { textAlign: "center", lineHeight: 1.1 },
  homeLogoText: {
    display: "block",
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: -2,
    color: "#00e676",
  },
  homeTagline: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 1.6,
  },
  homeDisclaimer: { fontSize: 11, color: "#333", textAlign: "center" },
};
