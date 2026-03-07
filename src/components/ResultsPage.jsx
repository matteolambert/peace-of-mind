// Import React hooks and scoring utilities
import { useEffect, useState } from "react";
import { calculateRisk, levelColor, levelEmoji } from "../utils/scoring";

// ResultsPage component displays the user's risk level and recommendations
export default function ResultsPage({ results, onRestart }) {
  // State for risk assessment result
  const [risk, setRisk] = useState(null);
  // State for reveal animation
  const [revealed, setRevealed] = useState(false);

  // Calculate risk and trigger reveal animation on mount
  useEffect(() => {
    const r = calculateRisk(results); // Compute risk from results
    setRisk(r);
    setTimeout(() => setRevealed(true), 300); // Reveal after short delay
  }, []);

  // If risk is not yet calculated, render nothing
  if (!risk) return null;

  // Get color and emoji for risk level
  const color = levelColor(risk.level);
  const emoji = levelEmoji(risk.level);

  // Render the results page UI
  return (
    <div style={styles.wrapper}>
      {/* Header with app title */}
      <div style={styles.header}>
        <span style={styles.title}>PEACE OF MIND</span>
      </div>

      {/* Risk Badge with animation and color */}
      <div
        style={{
          ...styles.badge,
          borderColor: color,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "scale(1)" : "scale(0.8)",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Emoji for risk level */}
        <span style={{ ...styles.badgeEmoji, color }}>{emoji}</span>
        {/* Text for risk level */}
        <span style={{ ...styles.badgeLevel, color }}>
          {risk.level.toUpperCase()}
        </span>
      </div>

      {/* Risk summary text */}
      <p style={styles.summary}>{risk.summary}</p>

      {/* Recommended actions section */}
      <div style={styles.actionsBox}>
        <p style={styles.actionsTitle}>RECOMMENDED ACTIONS</p>
        {risk.actions.map((a, i) => (
          // Each action in the list
          <div key={i} style={styles.actionRow}>
            <span style={{ ...styles.actionNum, color }}>{i + 1}</span>
            <span style={styles.actionText}>{a}</span>
          </div>
        ))}
      </div>

      {/* Factors detected (flags) section, if any */}
      {risk.flags.length > 0 && (
        <div style={styles.flagsBox}>
          <p style={styles.flagsTitle}>FACTORS DETECTED</p>
          {risk.flags.map((f, i) => (
            <div key={i} style={styles.flagRow}>
              <span style={styles.flagDot} />
              <span style={styles.flagText}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer about tool limitations */}
      <p style={styles.disclaimer}>
        This tool is a screening aid only and does not replace professional
        medical evaluation. When in doubt, sit out.
      </p>

      {/* Button to restart assessment */}
      <button onClick={onRestart} style={styles.restartBtn}>
        Start New Assessment
      </button>
    </div>
  );
}

// Inline styles for ResultsPage component
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
    boxSizing: "border-box",
  },
  header: {
    width: "100%",
    maxWidth: 480,
    marginBottom: 40,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 3,
    color: "#00e676",
  },
  badge: {
    width: 160,
    height: 160,
    borderRadius: "50%",
    border: "4px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  badgeEmoji: { fontSize: 40, lineHeight: 1 },
  badgeLevel: { fontSize: 18, fontWeight: 800, letterSpacing: 3, marginTop: 4 },
  summary: {
    maxWidth: 380,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 1.6,
    color: "#ccc",
    marginBottom: 32,
  },
  actionsBox: {
    width: "100%",
    maxWidth: 480,
    background: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#555",
    marginBottom: 16,
    marginTop: 0,
  },
  actionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  actionNum: {
    fontSize: 14,
    fontWeight: 800,
    minWidth: 20,
    paddingTop: 1,
  },
  actionText: { fontSize: 14, color: "#ccc", lineHeight: 1.5 },
  flagsBox: {
    width: "100%",
    maxWidth: 480,
    background: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  flagsTitle: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#555",
    marginBottom: 16,
    marginTop: 0,
  },
  flagRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff5252",
    flexShrink: 0,
  },
  flagText: { fontSize: 14, color: "#aaa" },
  disclaimer: {
    maxWidth: 380,
    textAlign: "center",
    fontSize: 12,
    color: "#444",
    lineHeight: 1.6,
    margin: "16px 0 24px",
  },
  restartBtn: {
    padding: "14px 32px",
    background: "transparent",
    color: "#666",
    border: "1px solid #2a2a3e",
    borderRadius: 12,
    fontSize: 14,
    cursor: "pointer",
  },
};
