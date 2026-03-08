import { useState, useEffect, useRef } from "react";
import { colors, radius, MAX_W } from "../utils/theme";

const DOT_DURATION = 4000;
const POSITIONS = [
  { x: 15, y: 50 },
  { x: 85, y: 50 },
  { x: 50, y: 15 },
  { x: 50, y: 85 },
  { x: 50, y: 50 },
];

const PHASES = {
  INTRO: "intro", LOADING: "loading",
  TRACKING: "tracking", DONE: "done", ERROR: "error",
};

export default function EyeTrackingTest({ onDone }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const trackingDataRef = useRef([]);

  const [phase, setPhase] = useState(PHASES.INTRO);
  const [dotIndex, setDotIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(null);

  const LEFT_IRIS = [468, 469, 470, 471, 472];
  const RIGHT_IRIS = [473, 474, 475, 476, 477];

  const getIrisCenter = (landmarks, indices) => {
    const pts = indices.map((i) => landmarks[i]).filter(Boolean);
    if (!pts.length) return null;
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  };

  const getIrisCenterNormalized = (landmarks, irisIndices, innerCorner, outerCorner, topLid, bottomLid) => {
    const raw = getIrisCenter(landmarks, irisIndices);
    if (!raw) return null;
    const inner = landmarks[innerCorner];
    const outer = landmarks[outerCorner];
    const top = landmarks[topLid];
    const bot = landmarks[bottomLid];
    if (!inner || !outer || !top || !bot) return raw;
    const eyeWidth = Math.abs(outer.x - inner.x);
    const eyeHeight = Math.abs(bot.y - top.y);
    if (eyeWidth < 0.001 || eyeHeight < 0.001) return raw;
    return {
      x: (raw.x - inner.x) / eyeWidth,
      y: (raw.y - top.y) / eyeHeight,
    };
  };

  const startTracking = async () => {
    setPhase(PHASES.LOADING);
    try {
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const { Camera } = await import("@mediapipe/camera_utils");

      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1, refineLandmarks: true,
        minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
      });
      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks?.[0]) {
          const lm = results.multiFaceLandmarks[0];
          const left = getIrisCenterNormalized(lm, LEFT_IRIS, 133, 33, 159, 145);
          const right = getIrisCenterNormalized(lm, RIGHT_IRIS, 362, 263, 386, 374);
          if (left && right) {
            trackingDataRef.current.push({
              t: Date.now(),
              leftX: left.x, leftY: left.y,
              rightX: right.x, rightY: right.y,
            });
          }
        }
      });

      if (!videoRef.current) throw new Error("Video element not ready");

      const camera = new Camera(videoRef.current, {
        onFrame: async () => { if (videoRef.current) await faceMesh.send({ image: videoRef.current }); },
        width: 320, height: 240,
      });
      cameraRef.current = camera;
      await camera.start();
      setPhase(PHASES.TRACKING);
      runDotSequence();
    } catch (err) {
      setErrorMsg("Could not load camera or face tracking. " + err.message);
      setPhase(PHASES.ERROR);
    }
  };

  const runDotSequence = () => {
    let currentDot = 0;
    setDotIndex(0);
    for (let i = 1; i < POSITIONS.length; i++) {
      setTimeout(() => { currentDot++; setDotIndex(currentDot); }, i * DOT_DURATION);
    }
    setTimeout(finishTracking, POSITIONS.length * DOT_DURATION);
  };

  const finishTracking = () => {
    if (cameraRef.current) cameraRef.current.stop();
    setScore(analyzeTracking(trackingDataRef.current));
    setPhase(PHASES.DONE);
  };

  const analyzeTracking = (data) => {
    if (data.length < 10) return { smoothness: 0, label: "insufficient data", sampleCount: data.length };
    const leftXValues = data.map((d) => d.leftX);
    const leftYValues = data.map((d) => d.leftY);
    const totalRange = (Math.max(...leftXValues) - Math.min(...leftXValues))
      + (Math.max(...leftYValues) - Math.min(...leftYValues));
    if (totalRange < 0.3) return { smoothness: 5, rawJitter: 0, sampleCount: data.length, label: "significant irregularity" };
    const diffs = leftXValues.slice(1).map((v, i) => Math.abs(v - leftXValues[i]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const jitterScore = Math.max(0, Math.min(100, 100 - avgDiff * 5000));
    const rangeScore = Math.min(100, (totalRange / 2.0) * 100);
    const smoothness = Math.round(jitterScore * 0.7 + rangeScore * 0.3);
    return {
      smoothness, rawJitter: avgDiff, sampleCount: data.length,
      label: smoothness > 70 ? "smooth" : smoothness > 45 ? "mild irregularity" : "significant irregularity",
    };
  };

  useEffect(() => {
    if (phase !== PHASES.TRACKING) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 100 / (DOT_DURATION / 100)));
    }, 100);
    return () => clearInterval(interval);
  }, [dotIndex, phase]);

  const handleSkip = () => { if (cameraRef.current) cameraRef.current.stop(); onDone({ eyeTracking: null, eyeSkipped: true }); };
  const handleFinish = () => onDone({ eyeTracking: score });
  const dot = POSITIONS[dotIndex];

  const scoreColor = score
    ? score.smoothness > 70 ? colors.success
      : score.smoothness > 45 ? colors.warning
        : colors.danger
    : colors.textMuted;

  return (
    <div style={st.page}>
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={st.header}>
        <span style={st.logo}>peace of mind</span>
        <span style={st.step}>Test 2 of 2</span>
      </div>

      {phase === PHASES.INTRO && (
        <div style={st.card}>
          <span style={st.cardIcon}>👁️</span>
          <h2 style={st.cardTitle}>Eye Tracking Test</h2>
          <p style={st.cardBody}>
            Follow the moving dot with your eyes as it moves around the screen.
            Keep your head still. This tests smooth pursuit — a key indicator of neurological function.
          </p>
          <p style={st.cardNote}>Requires camera access</p>
          <button onClick={startTracking} style={st.primaryBtn}>Start Eye Test</button>
          <button onClick={handleSkip} style={st.ghostBtn}>Skip this test</button>
        </div>
      )}

      {phase === PHASES.LOADING && (
        <div style={st.card}>
          <div style={st.spinner} />
          <p style={st.cardBody}>Loading face tracking model...</p>
        </div>
      )}

      {phase === PHASES.TRACKING && (
        <div style={st.trackingArea}>
          <p style={st.instruction}>Follow the dot with your eyes — keep your head still</p>
          <div style={st.arena}>
            <div style={{
              ...st.dot,
              left: `${dot.x}%`, top: `${dot.y}%`,
              transform: "translate(-50%, -50%)",
            }} />
          </div>
          <div style={st.progressTrack}>
            <div style={{ ...st.progressFill, width: `${progress}%` }} />
          </div>
          <p style={st.dotCounter}>Position {dotIndex + 1} of {POSITIONS.length}</p>
        </div>
      )}

      {phase === PHASES.ERROR && (
        <div style={st.card}>
          <span style={st.cardIcon}>⚠️</span>
          <h2 style={st.cardTitle}>Camera Unavailable</h2>
          <p style={st.cardBody}>{errorMsg}</p>
          <button onClick={handleSkip} style={st.primaryBtn}>Continue Without Eye Test</button>
        </div>
      )}

      {phase === PHASES.DONE && score && (
        <div style={st.card}>
          <div style={{ ...st.scoreRing, borderColor: scoreColor }}>
            <span style={{ ...st.scoreNum, color: scoreColor }}>{score.smoothness}</span>
            <span style={st.scoreUnit}>/ 100</span>
          </div>
          <h2 style={st.cardTitle}>Eye Tracking Complete</h2>
          <p style={st.cardBody}>
            Your tracking was classified as:{" "}
            <strong style={{ color: scoreColor }}>{score.label}</strong>
          </p>
          <p style={st.cardNote}>{score.sampleCount} frames analyzed</p>
          <button onClick={handleFinish} style={st.primaryBtn}>Continue→</button>
        </div>
      )}
    </div>
  );
}

const st = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 40px 64px",
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
    marginBottom: 40,
  },
  logo: { fontSize: 15, fontWeight: 600, letterSpacing: 1, color: colors.primary },
  step: { fontSize: 13, color: colors.textFaint, letterSpacing: 1 },

  card: {
    width: "100%",
    maxWidth: "100%",
    background: colors.card,
    borderRadius: 24,
    padding: "56px 80px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 22,
    border: `1px solid ${colors.border}`,
  },
  cardIcon: { fontSize: 56 },
  cardTitle: { fontSize: 32, fontWeight: 800, margin: 0, color: colors.textPrimary },
  cardBody: { fontSize: 17, color: colors.textMuted, lineHeight: 1.75, margin: 0, maxWidth: 560 },
  cardNote: { fontSize: 13, color: colors.textFaint, margin: 0 },

  primaryBtn: {
    width: "100%",
    maxWidth: 480,
    padding: "18px",
    background: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
  },
  ghostBtn: {
    width: "100%",
    maxWidth: 480,
    padding: "14px",
    background: "transparent",
    color: colors.textFaint,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    fontSize: 15,
    cursor: "pointer",
  },
  spinner: {
    width: 56,
    height: 56,
    border: `4px solid ${colors.trackBg}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  trackingArea: {
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
  },
  trackingInstruction: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
  arena: {
    width: "100%",
    maxWidth: "100%",
    height: 480,
    background: colors.card,
    borderRadius: 24,
    position: "relative",
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
  },
  dot: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: colors.primary,
    boxShadow: `0 0 28px ${colors.primary}88`,
    transition: "left 0.4s ease, top 0.4s ease",
  },
  progressTrack: {
    width: "100%",
    maxWidth: "100%",
    height: 6,
    background: colors.trackBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: colors.primary,
    borderRadius: 3,
    transition: "width 0.1s linear",
  },
  dotCounter: { fontSize: 14, color: colors.textFaint },

  scoreRing: {
    width: 160,
    height: 160,
    borderRadius: "50%",
    border: "5px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 52, fontWeight: 900, lineHeight: 1 },
  scoreUnit: { fontSize: 14, color: colors.textFaint },
};