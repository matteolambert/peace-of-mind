import { useState } from "react";
import ReactionTest from "./components/ReactionTest";
import EyeTrackingTest from "./components/EyeTrackingTest";
import ResultsPage from "./components/ResultsPage";
import MythBusting from "./components/MythBusting";
import MemoryStudy from "./components/MemoryStudy";
import MemoryRecall from "./components/MemoryRecall";
import { colors, radius } from "./utils/theme";

const SYMPTOMS = [
  { key: "headache", label: "Headache", icon: "🤕", type: "both" },
  { key: "nausea", label: "Nausea / Dizziness", icon: "😵", type: "both" },
  { key: "balance", label: "Balance Issues", icon: "⚖️", type: "both" },
  { key: "confusion", label: "Confusion / Fogginess", icon: "🌫️", type: "concussion" },
  { key: "lightSensitivity", label: "Light Sensitivity", icon: "💡", type: "concussion" },
  { key: "memory", label: "Memory Problems", icon: "🧠", type: "concussion" },
  { key: "neckPain", label: "Neck Pain / Stiffness", icon: "🦴", type: "whiplash" },
  { key: "neckMobility", label: "Difficulty Turning Head", icon: "↔️", type: "whiplash" },
  { key: "shoulderPain", label: "Shoulder / Upper Back Pain", icon: "💪", type: "whiplash" },
  { key: "jawPain", label: "Jaw Pain or Tightness", icon: "😬", type: "whiplash" },
  { key: "tingling", label: "Tingling in Arms / Hands", icon: "⚡", type: "whiplash" },
];

function SymptomRow({ s, value, onChange }) {
  return (
    <div style={styles.symptomRow}>
      <div style={styles.symptomLeft}>
        <span style={styles.symptomIcon}>{s.icon}</span>
        <span style={styles.symptomLabel}>{s.label}</span>
      </div>

      <div style={styles.sliderBox}>
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.slider}
        />

        <span
          style={{
            ...styles.sliderVal,
            color:
              value >= 7
                ? colors.danger
                : value >= 4
                ? colors.warning
                : colors.success,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function SymptomQuiz({ onDone }) {
  const [answers, setAnswers] = useState(
    Object.fromEntries(SYMPTOMS.map((s) => [s.key, 0]))
  );

  const set = (key, val) =>
    setAnswers((a) => ({
      ...a,
      [key]: val,
    }));

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.logo}>peace of mind</span>

        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("goto-myths"))
          }
          style={styles.mythLink}
        >
          Myth Buster
        </button>
      </div>

      <h1 style={styles.h1}>How are you feeling?</h1>

      <p style={styles.sub}>
        Rate each symptom honestly. This data stays on your device.
      </p>

      <div style={styles.symptomList}>
        <p style={styles.symptomSectionLabel}>General Symptoms</p>

        {SYMPTOMS.filter((s) => s.type === "both").map((s) => (
          <SymptomRow
            key={s.key}
            s={s}
            value={answers[s.key]}
            onChange={(v) => set(s.key, v)}
          />
        ))}

        <p style={styles.symptomSectionLabel}>Concussion Indicators</p>

        {SYMPTOMS.filter((s) => s.type === "concussion").map((s) => (
          <SymptomRow
            key={s.key}
            s={s}
            value={answers[s.key]}
            onChange={(v) => set(s.key, v)}
          />
        ))}

        <p style={styles.symptomSectionLabel}>Whiplash Indicators</p>

        {SYMPTOMS.filter((s) => s.type === "whiplash").map((s) => (
          <SymptomRow
            key={s.key}
            s={s}
            value={answers[s.key]}
            onChange={(v) => set(s.key, v)}
          />
        ))}
      </div>

      <button
        onClick={() => onDone({ symptoms: answers })}
        style={styles.primaryBtn}
      >
        Continue →
      </button>
    </div>
  );
}

function Home({ onStart, onMyths }) {
  return (
    <div style={{ ...styles.wrapper, justifyContent: "center" }}>
      <div style={styles.homeInner}>
        <div style={styles.homeLogoWrap}>
          <span style={styles.homeIcon}>🧠</span>
          <p style={styles.homeLogoTop}>peace of mind</p>
        </div>

        <p style={styles.homeTagline}>
          Concussion screening for athletes.
          <br />
          Honest. Fast. Harder to fake.
        </p>

        <button onClick={onStart} style={styles.primaryBtn}>
          Start Assessment
        </button>

        <button onClick={onMyths} style={styles.ghostBtn}>
          Concussion Myths & Facts →
        </button>

        <p style={styles.homeDisclaimer}>
          Not a substitute for medical evaluation
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [results, setResults] = useState({});

  const merge = (data) =>
    setResults((r) => ({
      ...r,
      ...data,
    }));

  useState(() => {
    const handler = () => setPage("myths");
    window.addEventListener("goto-myths", handler);
    return () => window.removeEventListener("goto-myths", handler);
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.bg}; }

        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: ${colors.trackBg};
          outline: none;
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {page === "home" && (
        <Home
          onStart={() => setPage("symptoms")}
          onMyths={() => setPage("myths")}
        />
      )}

      {page === "symptoms" && (
        <SymptomQuiz
          onDone={(r) => {
            merge(r);
            setPage("memoryStudy");
          }}
        />
      )}

      {page === "memoryStudy" && (
        <MemoryStudy
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
            setPage("memoryRecall");
          }}
        />
      )}

      {page === "memoryRecall" && (
        <MemoryRecall
          memory={results.memory}
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

      {page === "myths" && (
        <MythBusting onBack={() => setPage("home")} />
      )}
    </>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 24px 64px",
  },

  header: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.primary,
  },

  mythLink: {
    background: "none",
    border: "none",
    color: colors.textFaint,
    fontSize: 14,
    cursor: "pointer",
  },

  h1: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 10,
    textAlign: "center",
    color: colors.textPrimary,
  },

  sub: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 32,
    textAlign: "center",
  },

  symptomList: {
    width: "100%",
    maxWidth: 640,
    marginBottom: 40,
  },

  symptomSectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 3,
    color: colors.textFaint,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
  },

  symptomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: `1px solid ${colors.border}`,
  },

  symptomLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  symptomIcon: {
    fontSize: 22,
  },

  symptomLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },

  sliderBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  slider: {
    width: 130,
  },

  sliderVal: {
    fontSize: 17,
    fontWeight: 800,
    minWidth: 24,
    textAlign: "right",
  },

  primaryBtn: {
    width: "100%",
    maxWidth: 640,
    padding: "18px",
    background: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: radius.md,
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
  },

  ghostBtn: {
    width: "100%",
    maxWidth: 640,
    padding: "16px",
    background: "transparent",
    color: colors.textMuted,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 12,
  },

  homeInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    maxWidth: 480,
    width: "100%",
  },

  homeLogoWrap: {
    textAlign: "center",
  },

  homeIcon: {
    fontSize: 52,
    display: "block",
    marginBottom: 12,
  },

  homeLogoTop: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: -1,
    color: colors.textPrimary,
  },

  homeTagline: {
    textAlign: "center",
    fontSize: 17,
    color: colors.textMuted,
    lineHeight: 1.7,
  },

  homeDisclaimer: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: "center",
  },
};