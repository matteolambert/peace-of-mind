import { useState, useRef, useEffect, useCallback } from "react";
import { colors, MAX_W } from "../utils/theme";
const PHASES = {
  INTRO: "intro",
  COUNTDOWN: "countdown",
  WAITING: "waiting",
  READY: "ready",
  CLICKED: "clicked",
  DONE: "done",
};

const NUM_ROUNDS = 6;       // collect 6, drop worst outlier → report 5
const MIN_VALID_MS = 100;   // faster = anticipation cheat
const MAX_VALID_MS = 1500;  // slower = distraction/ignore
const TOUCH_ADJUST = 50;    // mobile tap hardware latency offset
const STORAGE_KEY = "pom_baseline_v1";

//Audio Beep
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) { }
}

//Stats
function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}
function dropWorstOutlier(arr) {
  if (arr.length <= 4) return arr;
  const m = mean(arr);
  let worstIdx = 0;
  let worstDiff = 0;
  arr.forEach((v, i) => {
    const d = Math.abs(v - m);
    if (d > worstDiff) { worstDiff = d; worstIdx = i; }
  });
  return arr.filter((_, i) => i !== worstIdx);
}

//Baseline Helperss
function loadBaseline() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveBaselineFn(avg, sd) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ avg, sd, date: Date.now() }));
  } catch (_) { }
}

export default function ReactionTest({ onDone }) {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [countdown, setCountdown] = useState(3);
  const [allTimes, setAllTimes] = useState([]);   // every valid tap
  const [falseStarts, setFalseStarts] = useState(0);
  const [lastTime, setLastTime] = useState(null);
  const [lastInvalid, setLastInvalid] = useState(false);
  const [tooEarlyMs, setTooEarlyMs] = useState(null);
  const [useAudio, setUseAudio] = useState(true);
  const [isTouch, setIsTouch] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [compareBaseline, setCompareBaseline] = useState(false);
  const [willSaveBaseline, setWillSaveBaseline] = useState(false);

  const timeoutRef = useRef(null);
  const startRef = useRef(null);
  const waitStartRef = useRef(null);
  const phaseRef = useRef(phase);
  const allTimesRef = useRef(allTimes);
  const falseRef = useRef(falseStarts);
  const useAudioRef = useRef(useAudio);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { allTimesRef.current = allTimes; }, [allTimes]);
  useEffect(() => { falseRef.current = falseStarts; }, [falseStarts]);
  useEffect(() => { useAudioRef.current = useAudio; }, [useAudio]);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    const b = loadBaseline();
    if (b) setBaseline(b);
  }, []);

  //Round lifecycle
  const startRound = useCallback(() => {
    setTooEarlyMs(null);
    setLastInvalid(false);
    const delay = 2000 + Math.random() * 3000;
    waitStartRef.current = Date.now();
    setPhase(PHASES.WAITING);
    timeoutRef.current = setTimeout(() => {
      setPhase(PHASES.READY);
      startRef.current = Date.now();
      if (useAudioRef.current) playBeep();
    }, delay);
  }, []);

  const runCountdown = useCallback(() => {
    setPhase(PHASES.COUNTDOWN);
    let n = 3;
    setCountdown(n);
    const tick = setInterval(() => {
      n--;
      setCountdown(n);
      if (n <= 0) { clearInterval(tick); startRound(); }
    }, 800);
  }, [startRound]);

  //Pointer handler (works for mouse + touch)
  const handlePointer = useCallback((e) => {
    e.preventDefault();
    const p = phaseRef.current;

    if (p === PHASES.WAITING) {
      clearTimeout(timeoutRef.current);
      const earlyBy = Date.now() - (waitStartRef.current || Date.now());
      setTooEarlyMs(earlyBy);
      setFalseStarts((f) => { falseRef.current = f + 1; return f + 1; });
      setPhase(PHASES.CLICKED);
      setTimeout(() => startRound(), 2200);
      return;
    }

    if (p === PHASES.READY) {
      const raw = Date.now() - startRef.current;
      const adjusted = isTouch ? Math.max(0, raw - TOUCH_ADJUST) : raw;
      const invalid = adjusted < MIN_VALID_MS || adjusted > MAX_VALID_MS;

      setLastTime(adjusted);
      setLastInvalid(invalid);
      setPhase(PHASES.CLICKED);

      const newAll = invalid ? allTimesRef.current : [...allTimesRef.current, adjusted];
      setAllTimes(newAll);

      const validCount = newAll.length;
      const totalAttempts = validCount + (invalid ? 1 : 0) + falseRef.current;

      if (validCount >= NUM_ROUNDS || totalAttempts >= NUM_ROUNDS + 4) {
        setTimeout(() => setPhase(PHASES.DONE), 900);
      } else {
        setTimeout(() => startRound(), 1300);
      }
    }
  }, [isTouch, startRound]);

  //Derived results
  const finalTimes = dropWorstOutlier(allTimes);
  const avg = finalTimes.length ? Math.round(mean(finalTimes)) : null;
  const sd = finalTimes.length ? Math.round(stdDev(finalTimes)) : 0;
  const spread = finalTimes.length
    ? Math.max(...finalTimes) - Math.min(...finalTimes) : 0;
  const consistency = avg ? Math.max(0, Math.min(100, Math.round(100 - (sd / avg) * 100))) : null;

  const baselineDelta = (compareBaseline && baseline && avg)
    ? Math.round(((avg - baseline.avg) / baseline.avg) * 100)
    : null;

  const reactionRating = !avg ? null
    : avg < 220 ? { label: "Excellent", color: colors.primary }
      : avg < 300 ? { label: "Normal", color: colors.primary }
        : avg < 380 ? { label: "Slightly slow", color: colors.warning }
          : { label: "Significantly slow", color: colors.danger };

  const consistencyRating = consistency === null ? null
    : consistency >= 80 ? { label: "Very consistent", color: colors.primary }
      : consistency >= 60 ? { label: "Moderately consistent", color: colors.warning }
        : { label: "Inconsistent", color: colors.danger };

  const finish = () => {
    if (willSaveBaseline && avg) saveBaselineFn(avg, sd);
    onDone({
      reactionTimes: finalTimes,
      avgReaction: avg,
      stdDevReaction: sd,
      consistencyScore: consistency,
      falseStarts,
      isTouch,
      baselineDelta,
    });
  };

  //Arena Appearance
  const arenaBg = () => {
    if (phase === PHASES.READY) return colors.primary;
    if (phase === PHASES.WAITING) return "#1a1a2e";
    if (phase === PHASES.CLICKED && tooEarlyMs !== null) return "#2a0a0a";
    if (phase === PHASES.CLICKED && lastInvalid) return "#1c1a0a";
    if (phase === PHASES.CLICKED) return "#0a1228";
    if (phase === PHASES.COUNTDOWN) return "#1a1a2e";
    return colors.bg;
  };

  const arenaText = () => {
    if (phase === PHASES.COUNTDOWN)
      return { big: String(countdown), small: "Get ready…", bigColor: colors.primary };
    if (phase === PHASES.WAITING)
      return { big: "Wait…", small: "Don't tap yet", bigColor: colors.textPrimary };
    if (phase === PHASES.READY)
      return { big: "TAP!", small: "", bigColor: colors.bg };
    if (phase === PHASES.CLICKED && tooEarlyMs !== null)
      return {
        big: "Too early",
        small: `You tapped ${(tooEarlyMs / 1000).toFixed(1)}s before the signal`,
        bigColor: colors.danger,
      };
    if (phase === PHASES.CLICKED && lastInvalid)
      return {
        big: lastTime < MIN_VALID_MS ? "Too fast!" : "Timed out",
        small: lastTime < MIN_VALID_MS
          ? "Looks like anticipation — round not counted"
          : "Tap wasn't registered in time — round skipped",
        bigColor: colors.warning,
      };
    if (phase === PHASES.CLICKED)
      return { big: `${lastTime} ms`, small: "✓", bigColor: colors.textPrimary };
    return null;
  };

  const clickable = phase === PHASES.WAITING || phase === PHASES.READY;

  // Introduction
  if (phase === PHASES.INTRO) {
    return (
      <div style={st.page}>
        <Header step="Test 1 of 2" />
        <div style={st.card}>
          <p style={st.cardIcon}>⚡</p>
          <h2 style={st.cardH2}>Reaction Test</h2>
          <p style={st.cardBody}>
            Tap the moment the screen turns blue{useAudio ? " and you hear a beep" : ""}.
            Wait for the signal — tapping early flags as a false start and{" "}
            <em>does</em> get recorded. You'll do {NUM_ROUNDS} valid rounds.
          </p>
          <p style={st.cardBody}>
            Taps under 100ms are flagged as anticipation and won't count toward
            your score. Consistency matters as much as speed.
          </p>

          <div style={st.divider} />

          <Toggle
            label="Audio cue (beep on signal)"
            on={useAudio}
            onToggle={() => setUseAudio((v) => !v)}
          />

          {baseline && (
            <Toggle
              label="Compare to my baseline"
              sub={`Last recorded: ${baseline.avg}ms avg · ${new Date(baseline.date).toLocaleDateString()}`}
              on={compareBaseline}
              onToggle={() => setCompareBaseline((v) => !v)}
            />
          )}

          {isTouch && (
            <p style={st.note}>
              📱 Touch device detected — times auto-adjusted by {TOUCH_ADJUST}ms to
              account for hardware tap latency
            </p>
          )}

          <button onClick={runCountdown} style={st.btn}>Begin Test</button>
        </div>
      </div>
    );
  }

  //done
  if (phase === PHASES.DONE) {
    const minT = finalTimes.length ? Math.min(...finalTimes) : 0;
    const maxT = finalTimes.length ? Math.max(...finalTimes) : 0;

    return (
      <div style={st.page}>
        <Header step="Test 1 of 2" />
        <h2 style={st.resultsH2}>Reaction Results</h2>

        {/*Stat cards*/}
        <div style={st.statRow}>
          <StatCard
            value={avg ?? "—"}
            unit="ms avg"
            sub={reactionRating?.label}
            subColor={reactionRating?.color}
          />
          <StatCard
            value={sd}
            unit="ms σ"
            sub={consistencyRating?.label}
            subColor={consistencyRating?.color}
            tooltip="Standard deviation — how much your times varied"
          />
          <StatCard
            value={falseStarts}
            unit={falseStarts === 1 ? "false start" : "false starts"}
            sub={
              falseStarts === 0 ? "None" :
                falseStarts <= 1 ? "Mild impulsivity" :
                  falseStarts <= 2 ? "Worth monitoring" : "Notable impulsivity"
            }
            subColor={falseStarts === 0 ? colors.primary : falseStarts >= 3 ? colors.danger : colors.warning}
          />
        </div>

        {/*Baseline comparison */}
        {baselineDelta !== null && (
          <div style={{
            ...st.baselineBox,
            borderColor: Math.abs(baselineDelta) <= 5 ? colors.primary
              : Math.abs(baselineDelta) <= 15 ? colors.warning : colors.danger,
          }}>
            <span style={st.baselineArrow}>
              {baselineDelta > 0 ? "▲" : "▼"}
            </span>
            <div>
              <p style={st.baselineMain}>
                {Math.abs(baselineDelta)}%{" "}
                {baselineDelta > 0 ? "slower" : "faster"} than your baseline
              </p>
              <p style={st.baselineSub}>
                Baseline: {baseline.avg}ms · Today: {avg}ms
              </p>
              {baselineDelta > 15 && (
                <p style={{ ...st.baselineSub, color: colors.danger, marginTop: 4 }}>
                  A &gt;15% personal slowdown is a clinically meaningful change.
                </p>
              )}
            </div>
          </div>
        )}

        {/*Per-round chips*/}
        <div style={st.chipRow}>
          {allTimes.map((t, i) => {
            const dropped = !finalTimes.includes(t) ||
              (allTimes.filter(x => x === t).length > finalTimes.filter(x => x === t).length && i === allTimes.lastIndexOf(t));
            return (
              <div key={i} style={{ ...st.chip, opacity: dropped ? 0.4 : 1 }}>
                <span style={st.chipRound}>{dropped ? "dropped" : `R${finalTimes.indexOf(t) + 1}`}</span>
                <span style={{
                  ...st.chipTime,
                  color: t < 250 ? colors.primary : t < 350 ? colors.textPrimary : colors.warning,
                }}>
                  {t}
                </span>
                <span style={st.chipUnit}>ms</span>
              </div>
            );
          })}
        </div>

        {/*Variability visualizer*/}
        {finalTimes.length > 1 && (
          <div style={st.varBox}>
            <p style={st.varTitle}>RESPONSE VARIABILITY</p>
            <div style={st.varTrack}>
              {finalTimes.map((t, i) => {
                const pct = spread > 0 ? ((t - minT) / spread) * 90 + 5 : 50;
                return (
                  <div key={i} style={{
                    ...st.varDot,
                    left: `${pct}%`,
                    background: t < 250 ? colors.primary : t < 350 ? colors.textPrimary : colors.warning,
                  }} />
                );
              })}
              {/* avg marker */}
              {avg && (
                <div style={{
                  ...st.varAvgLine,
                  left: `${spread > 0 ? ((avg - minT) / spread) * 90 + 5 : 50}%`,
                }} />
              )}
            </div>
            <div style={st.varLabels}>
              <span>{minT}ms</span>
              <span style={{ color: colors.textFaint }}>spread: {spread}ms</span>
              <span>{maxT}ms</span>
            </div>
            <p style={st.varNote}>
              {sd < 30
                ? "Low variability — consistent, healthy response pattern"
                : sd < 60
                  ? "Moderate variability — within normal range"
                  : "High variability — inconsistency can be an indicator of concussion"}
            </p>
          </div>
        )}

        {/* Save baseline (only if no existing one) */}
        {!baseline && avg && (
          <div style={st.card}>
            <Toggle
              label="Save today as my personal baseline"
              sub={`Future tests will compare your ${avg}ms average against today`}
              on={willSaveBaseline}
              onToggle={() => setWillSaveBaseline((v) => !v)}
            />
          </div>
        )}

        <button onClick={finish} style={st.btn}>Next Test →</button>
      </div>
    );
  }

  // Active Test
  const txt = arenaText();
  return (
    <div style={st.page}>
      <Header step="Test 1 of 2" />

      {/* Progress pips */}
      <div style={st.pips}>
        {Array.from({ length: NUM_ROUNDS }).map((_, i) => (
          <div key={i} style={{
            ...st.pip,
            background: i < allTimes.length ? colors.primary : colors.trackBg,
          }} />
        ))}
      </div>

      <p style={st.roundInfo}>
        {allTimes.length}/{NUM_ROUNDS} valid
        {falseStarts > 0 && (
          <span style={{ color: colors.danger, marginLeft: 10 }}>
            {falseStarts} false start{falseStarts !== 1 ? "s" : ""}
          </span>
        )}
      </p>

      {/* Arena */}
      <div
        onPointerDown={clickable ? handlePointer : undefined}
        style={{
          ...st.arena,
          background: arenaBg(),
          cursor: clickable ? "pointer" : "default",
          touchAction: "none",
        }}
      >
        {txt && (
          <div style={st.arenaInner}>
            <p style={{ ...st.arenaTop, color: txt.bigColor }}>{txt.big}</p>
            {txt.small && <p style={st.arenaSub}>{txt.small}</p>}
          </div>
        )}
      </div>

      {phase === PHASES.WAITING && (
        <p style={st.hint}>
          Tap the instant it turns blue
          {useAudio ? " — listen for the beep" : ""}
        </p>
      )}
    </div>
  );
}

//Sub-components
function Header({ step }) {
  return (
    <div style={st.header}>
      <span style={st.logo}>PEACE OF MIND</span>
      <span style={st.stepLabel}>{step}</span>
    </div>
  );
}

function StatCard({ value, unit, sub, subColor }) {
  return (
    <div style={st.statCard}>
      <span style={st.statVal}>{value}</span>
      <span style={st.statUnit}>{unit}</span>
      {sub && <span style={{ ...st.statSub, color: subColor || colors.textMuted }}>{sub}</span>}
    </div>
  );
}

function Toggle({ label, sub, on, onToggle }) {
  return (
    <div style={st.toggleRow}>
      <div>
        <span style={st.toggleLabel}>{label}</span>
        {sub && <span style={st.toggleSub}>{sub}</span>}
      </div>
      <button
        onClick={onToggle}
        style={{ ...st.toggleBtn, background: on ? colors.primary : colors.trackBg }}
        aria-pressed={on}
      >
        <div style={{
          ...st.toggleThumb,
          transform: on ? "translateX(22px)" : "translateX(2px)",
        }} />
      </button>
    </div>
  );
}

// Styles
const st = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 40px 56px",
    boxSizing: "border-box",
    maxWidth: MAX_W,
    margin: "0 auto",
    width: "100%",
  },
  header: {
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: { fontSize: 15, fontWeight: 600, letterSpacing: 1, color: colors.primary },
  stepLabel: { fontSize: 13, color: colors.textFaint, letterSpacing: 1 },

  card: {
    width: "100%",
    maxWidth: "100%",
    background: colors.card,
    borderRadius: 24,
    padding: "40px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 16,
    border: `1px solid ${colors.border}`,
  },
  cardIcon: { fontSize: 48, textAlign: "center", margin: 0 },
  cardH2: { fontSize: 32, fontWeight: 800, margin: 0, textAlign: "center" },
  cardBody: { fontSize: 16, color: colors.textMuted, lineHeight: 1.75, margin: 0 },
  note: {
    fontSize: 13, color: colors.textFaint,
    background: colors.bg, borderRadius: 8,
    padding: "10px 14px", margin: 0,
  },
  divider: { height: 1, background: colors.border },

  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
  toggleLabel: { fontSize: 15, color: colors.textPrimary, display: "block" },
  toggleSub: { fontSize: 12, color: colors.textFaint, display: "block", marginTop: 4 },
  toggleBtn: {
    width: 46, height: 26, borderRadius: 13,
    border: "none", cursor: "pointer",
    position: "relative", flexShrink: 0,
    transition: "background 0.2s", padding: 0,
  },
  toggleThumb: {
    position: "absolute", top: 3,
    width: 20, height: 20, borderRadius: "50%",
    background: "#fff", transition: "transform 0.2s",
  },

  pips: { display: "flex", gap: 10, marginBottom: 10 },
  pip: { width: 52, height: 7, borderRadius: 4, transition: "background 0.3s" },
  roundInfo: { fontSize: 14, color: colors.textFaint, marginBottom: 20 },

  arena: {
    width: "100%",
    maxWidth: "100%",
    height: 420,
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    transition: "background 0.12s ease",
  },
  arenaInner: { textAlign: "center", padding: "0 24px" },
  arenaTop: { fontSize: 80, fontWeight: 900, margin: 0, letterSpacing: -3 },
  arenaSub: { fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 14, lineHeight: 1.6 },
  hint: { fontSize: 14, color: colors.textFaint, marginTop: 16, textAlign: "center" },

  resultsH2: { fontSize: 32, fontWeight: 800, marginBottom: 24 },
  statRow: { display: "flex", gap: 16, width: "100%", maxWidth: "100%", marginBottom: 20 },
  statCard: {
    flex: 1,
    background: colors.card,
    borderRadius: 16,
    padding: "24px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    border: `1px solid ${colors.border}`,
  },
  statVal: { fontSize: 42, fontWeight: 900 },
  statUnit: { fontSize: 11, color: colors.textFaint },
  statSub: { fontSize: 11, fontWeight: 600, marginTop: 6 },

  baselineBox: {
    width: "100%",
    maxWidth: "100%",
    border: "1px solid",
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 16,
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  baselineArrow: { fontSize: 22, paddingTop: 2 },
  baselineMain: { fontSize: 16, fontWeight: 700, margin: "0 0 4px" },
  baselineSub: { fontSize: 13, color: colors.textFaint, margin: 0 },

  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: "100%",
    marginBottom: 20,
  },
  chip: {
    background: colors.card,
    borderRadius: 12,
    padding: "14px 20px",
    minWidth: 80,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: `1px solid ${colors.border}`,
  },
  chipRound: { fontSize: 11, color: colors.textFaint, marginBottom: 4 },
  chipTime: { fontSize: 28, fontWeight: 800 },
  chipUnit: { fontSize: 11, color: colors.textFaint },

  varBox: {
    width: "100%",
    maxWidth: "100%",
    background: colors.card,
    borderRadius: 16,
    padding: "24px 28px",
    marginBottom: 20,
    border: `1px solid ${colors.border}`,
  },
  varTitle: { fontSize: 10, letterSpacing: 3, color: colors.textFaint, margin: "0 0 20px", textTransform: "uppercase" },
  varTrack: {
    height: 4, background: colors.trackBg,
    borderRadius: 2, position: "relative", marginBottom: 12,
  },
  varDot: {
    position: "absolute", width: 16, height: 16,
    borderRadius: "50%", top: -6,
    transform: "translateX(-50%)",
    boxShadow: "0 0 8px currentColor",
  },
  varAvgLine: {
    position: "absolute", width: 2, height: 20,
    background: colors.textMuted, opacity: 0.3, top: -8,
    transform: "translateX(-50%)",
  },
  varLabels: {
    display: "flex", justifyContent: "space-between",
    fontSize: 12, color: colors.textFaint, marginBottom: 10,
  },
  varNote: { fontSize: 13, color: colors.textMuted, margin: 0 },

  btn: {
    width: "100%",
    maxWidth: "100%",
    padding: "18px",
    background: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 14,
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
    marginTop: 8,
  },
};
