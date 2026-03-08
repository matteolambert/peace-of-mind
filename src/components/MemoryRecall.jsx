
// React and theme imports
import { useState } from "react";
import { colors, radius } from "../utils/theme";


// MemoryRecall component: handles the memory recall test UI and logic
export default function MemoryRecall({ memory, onDone }) {
  // State to track selected words
  const [selected, setSelected] = useState(new Set());

  // Toggle selection of a word, max 6 allowed
  function toggle(word) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        if (next.size >= 6) return prev; // Prevent selecting more than 6
        next.add(word);
      }
      return next;
    });
  }

  // Submit selected words and calculate score
  function submit() {
    const score = memory.wordTargets.filter(w => selected.has(w)).length;
    onDone({
      memory: {
        ...memory,
        delayedWordScore: score
      }
    });
  }

  // Render the memory recall UI
  return (
    <div style={st.page}>
      {/* Top bar with logo and step name */}
      <div style={st.topBar}>
        <span style={st.logo}>peace of mind</span>
        <span style={st.step}>Memory Recall</span>
      </div>

      {/* Main card with instructions and word grid */}
      <div style={st.card}>
        <h2 style={st.title}>
          Which words did you see earlier?
        </h2>
        <p style={st.body}>
          Select all words you remember.
        </p>

        {/* Grid of selectable word buttons */}
        <div style={st.grid}>
          {memory.wordOptions.map((w, i) => {
            const active = selected.has(w);
            return (
              <button
                key={i}
                onClick={() => toggle(w)}
                style={{
                  ...st.wordBtn,
                  background: active
                    ? colors.primary
                    : colors.card,
                  color: active
                    ? "#fff"
                    : colors.textMuted,
                  border: `1px solid ${
                    active
                      ? colors.primary
                      : colors.border
                  }`
                }}
              >
                {w}
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          onClick={submit}
          style={st.primaryBtn}
        >
          See Results →
        </button>
      </div>
    </div>
  );
}

// Inline style object for component styling
const st = {
  // Page container
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 24px 64px"
  },
  // Top bar styles
  topBar: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 40
  },
  // Logo text
  logo: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.primary
  },
  // Step label
  step: {
    fontSize: 13,
    color: colors.textFaint
  },
  // Card container
  card: {
    width: "100%",
    maxWidth: 640,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: 48,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  // Title text
  title: {
    fontSize: 28,
    fontWeight: 800
  },
  // Body text
  body: {
    fontSize: 16,
    color: colors.textMuted
  },
  // Grid for word buttons
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 12
  },
  // Word button style
  wordBtn: {
    padding: "16px",
    borderRadius: radius.sm,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer"
  },
  // Primary action button
  primaryBtn: {
    marginTop: 12,
    padding: "16px",
    background: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: radius.md,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer"
  }
};