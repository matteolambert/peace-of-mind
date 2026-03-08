
// React and utility imports
import { useEffect, useState } from "react";
import { calculateRisk, levelColor, levelEmoji } from "../utils/scoring";
import { colors, radius, MAX_W } from "../utils/theme";


// ResultsPage component: displays the user's assessment results and recommendations
export default function ResultsPage({ results, onRestart }) {
  // State for risk assessment and reveal animation
  const [risk, setRisk] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Calculate risk and trigger reveal animation on mount
  useEffect(() => {
    const r = calculateRisk(results);
    setRisk(r);
    setTimeout(() => setRevealed(true), 300);
  }, []);

  // Wait for risk calculation before rendering
  if (!risk) return null;

  // Get color and emoji for risk level
  const color = levelColor(risk.level);
  const emoji = levelEmoji(risk.level);

  // Memory recall score and color
  const memoryScore = results.memory?.delayedWordScore;
  const memoryColor =
    memoryScore == null
      ? colors.textMuted
      : memoryScore <= 2
        ? colors.danger
        : memoryScore <= 4
          ? colors.warning
          : colors.success;

  // Render the results page UI
  return (
    <div style={st.page}>
      {/* Top bar with logo and restart button */}
      <div style={st.topBar}>
        <span style={st.logo}>peace of mind</span>
        <button onClick={onRestart} style={st.restartBtn}>
          Start New Assessment
        </button>
      </div>

      <div style={st.layout}>
        {/* Left column: badge, summary, flags, disclaimer */}
        <div style={st.leftCol}>
          {/* Animated risk badge */}
          <div
            style={{
              ...st.badge,
              borderColor: color,
              opacity: revealed ? 1 : 0,
              transform: revealed ? "scale(1)" : "scale(0.85)",
              transition:
                "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <span style={{ ...st.badgeEmoji, color }}>
              {emoji}
            </span>
            <span style={{ ...st.badgeLevel, color }}>
              {risk.level.toUpperCase()}
            </span>
          </div>

          {/* Risk summary text */}
          <p style={st.summary}>{risk.summary}</p>

          {/* List of detected risk factors */}
          {risk.flags.length > 0 && (
            <div style={st.flagsCard}>
              <p style={st.cardLabel}>FACTORS DETECTED</p>
              {risk.flags.map((f, i) => (
                <div key={i} style={st.flagRow}>
                  <span
                    style={{
                      ...st.flagDot,
                      background: colors.danger,
                    }}
                  />
                  <span style={st.flagText}>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Medical disclaimer */}
          <p style={st.disclaimer}>
            This tool is a screening aid only and does not
            replace professional medical evaluation. When in
            doubt, sit out.
          </p>
        </div>

        {/* Right column: recommended actions and stats */}
        <div style={st.rightCol}>
          {/* Recommended actions card */}
          <div style={st.card}>
            <p style={st.cardLabel}>RECOMMENDED ACTIONS</p>
            {risk.actions.map((a, i) => (
              <div key={i} style={st.actionRow}>
                <span style={{ ...st.actionNum, color }}>
                  {i + 1}
                </span>
                <span style={st.actionText}>{a}</span>
              </div>
            ))}
          </div>

          {/* Stats row: reaction, eye tracking, symptoms, memory */}
          <div style={st.statsRow}>
            {[
              {
                label: "Reaction Time",
                value: results.avgReaction ? `${results.avgReaction}ms` : "—",
                sub: risk.details?.reaction || "not tested",
                color:
                  risk.details?.reaction === "good"
                    ? colors.success
                    : risk.details?.reaction === "moderate"
                      ? colors.warning
                      : colors.danger,
              },
              {
                label: "Eye Tracking",
                value: results.eyeTracking
                  ? `${results.eyeTracking.smoothness}/100`
                  : results.eyeSkipped
                    ? "Skipped"
                    : "—",
                sub: results.eyeTracking?.label || "not tested",
                color:
                  risk.details?.eyes === "good"
                    ? colors.success
                    : risk.details?.eyes === "moderate"
                      ? colors.warning
                      : colors.danger,
              },
              {
                label: "Symptom Load",
                value: results.symptoms
                  ? Object.values(results.symptoms).reduce((a, b) => a + b, 0)
                  : "—",
                sub: "total score / 110",
                color: colors.textMuted,
              },
              {
                label: "Memory",
                value:
                  results.memory?.delayedWordScore != null
                    ? `${results.memory.delayedWordScore}/6`
                    : "—",
                sub: "delayed recall",
                color:
                  results.memory?.delayedWordScore <= 3
                    ? colors.danger
                    : colors.success,
              },
            ].map((s, i) => (
              <div key={i} style={st.statCard}>
                <p style={st.statLabel}>{s.label}</p>
                <p style={{ ...st.statValue, color: s.color }}>{s.value}</p>
                <p style={st.statSub}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline style object for ResultsPage component
const st = {
  // Page container
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  // Top bar with logo and restart button
  topBar: {
    maxWidth: MAX_W,
    margin: "0 auto",
    padding: "28px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Logo text
  logo: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.primary,
  },
  // Restart assessment button
  restartBtn: {
    padding: "10px 22px",
    background: "transparent",
    color: colors.textFaint,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: 14,
    cursor: "pointer",
  },
  // Main layout grid
  layout: {
    maxWidth: MAX_W,
    margin: "0 auto",
    padding: "20px 40px 80px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
  },
  // Left column container
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  // Risk badge style
  badge: {
    width: 240,
    height: 240,
    borderRadius: "50%",
    border: "5px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  // Emoji in badge
  badgeEmoji: {
    fontSize: 64,
    lineHeight: 1,
  },
  // Risk level text in badge
  badgeLevel: {
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: 4,
    marginTop: 10,
  },
  // Risk summary text
  summary: {
    fontSize: 20,
    color: colors.textMuted,
    lineHeight: 1.8,
  },
  // Card for detected risk factors
  flagsCard: {
    width: "100%",
    background: colors.card,
    borderRadius: radius.lg,
    padding: "28px 32px",
    border: `1px solid ${colors.border}`,
  },
  // Label for cards
  cardLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.textFaint,
    marginBottom: 20,
    textTransform: "uppercase",
  },
  // Row for each risk flag
  flagRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  // Dot for risk flag
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  // Text for risk flag
  flagText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  // Disclaimer text
  disclaimer: {
    fontSize: 13,
    color: colors.textFaint,
    lineHeight: 1.7,
  },
  // Right column container
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  // Card for recommended actions
  card: {
    background: colors.card,
    borderRadius: radius.lg,
    padding: "32px 40px",
    border: `1px solid ${colors.border}`,
  },
  // Row for each action
  actionRow: {
    display: "flex",
    gap: 18,
    marginBottom: 20,
  },
  // Number for action
  actionNum: {
    fontSize: 18,
    fontWeight: 800,
    minWidth: 26,
  },
  // Text for action
  actionText: {
    fontSize: 17,
    color: colors.textMuted,
    lineHeight: 1.7,
  },
  // Stats row grid
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridAutoRows: "120px",
    gap: 16,
  },
  // Card for each stat
  statCard: {
    background: colors.card,
    borderRadius: radius.md,
    padding: "24px 20px",
    border: `1px solid ${colors.border}`,
    textAlign: "center",
  },
  // Stat label
  statLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  // Stat value
  statValue: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 8,
  },
  // Stat sub-label
  statSub: {
    fontSize: 12,
    color: colors.textFaint,
  },
};