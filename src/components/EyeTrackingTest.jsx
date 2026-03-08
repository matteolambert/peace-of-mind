import { useState, useEffect, useRef } from "react";

const DOT_DURATION = 4000; // ms to track each position
const POSITIONS = [
  { x: 15, y: 50 },
  { x: 85, y: 50 },
  { x: 50, y: 15 },
  { x: 50, y: 85 },
  { x: 50, y: 50 },
];

const PHASES = {
  INTRO: "intro",
  LOADING: "loading",
  TRACKING: "tracking",
  DONE: "done",
  ERROR: "error",
};

export default function EyeTrackingTest({ onDone }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const trackingDataRef = useRef([]);

  const [phase, setPhase] = useState(PHASES.INTRO);
  const [dotIndex, setDotIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(null);

  // LEFT EYE IRIS: landmarks 468-472, RIGHT: 473-477
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

  const startTracking = async () => {
    setPhase(PHASES.LOADING);

    try {
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const { Camera } = await import("@mediapipe/camera_utils");

      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // enables iris landmarks
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
          const lm = results.multiFaceLandmarks[0];
          const left = getIrisCenter(lm, LEFT_IRIS);
          const right = getIrisCenter(lm, RIGHT_IRIS);
          if (left && right) {
            trackingDataRef.current.push({
              t: Date.now(),
              dotIndex: dotIndex,
              leftX: left.x,
              leftY: left.y,
              rightX: right.x,
              rightY: right.y,
            });
          }
        }
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 320,
        height: 240,
      });

      faceMeshRef.current = faceMesh;
      cameraRef.current = camera;

      await camera.start();
      setPhase(PHASES.TRACKING);
      runDotSequence();
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load camera or face tracking. " + err.message);
      setPhase(PHASES.ERROR);
    }
  };

  const runDotSequence = () => {
    let currentDot = 0;
    setDotIndex(0);

    const advanceDot = () => {
      if (currentDot >= POSITIONS.length - 1) {
        finishTracking();
        return;
      }
      currentDot++;
      setDotIndex(currentDot);
    };

    // Advance dot every DOT_DURATION ms
    for (let i = 1; i < POSITIONS.length; i++) {
      setTimeout(advanceDot, i * DOT_DURATION);
    }
    // Finish after all dots
    setTimeout(finishTracking, POSITIONS.length * DOT_DURATION);
  };

  const finishTracking = () => {
    if (cameraRef.current) cameraRef.current.stop();
    const result = analyzeTracking(trackingDataRef.current);
    setScore(result);
    setPhase(PHASES.DONE);
  };

  const analyzeTracking = (data) => {
    if (data.length < 10) return { smoothness: 0, label: "insufficient data" };

    // Calculate variance in iris X movement (should be smooth, low jitter)
    const leftXValues = data.map((d) => d.leftX);
    const diffs = leftXValues
      .slice(1)
      .map((v, i) => Math.abs(v - leftXValues[i]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    // Lower avgDiff = smoother tracking
    // Typical smooth tracking < 0.008, impaired > 0.015
    const smoothness = Math.max(0, Math.min(100, 100 - avgDiff * 5000));

    return {
      smoothness: Math.round(smoothness),
      rawJitter: avgDiff,
      sampleCount: data.length,
      label:
        smoothness > 70
          ? "smooth"
          : smoothness > 45
          ? "mild irregularity"
          : "significant irregularity",
    };
  };

  // Progress bar tick
  useEffect(() => {
    if (phase !== PHASES.TRACKING) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + 100 / (DOT_DURATION / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [dotIndex, phase]);

  const handleSkip = () => {
    if (cameraRef.current) cameraRef.current.stop();
    onDone({ eyeTracking: null, eyeSkipped: true });
  };

  const handleFinish = () => {
    onDone({ eyeTracking: score });
  };

  const dot = POSITIONS[dotIndex];

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>PEACE OF MIND</span>
        <span style={styles.step}>Test 2 of 2</span>
      </div>

      {phase === PHASES.INTRO && (
        <div style={styles.card}>
          <div style={styles.iconRing}>👁</div>
          <h2 style={styles.cardTitle}>Eye Tracking Test</h2>
          <p style={styles.cardText}>
            Follow the green dot with your eyes as it moves around the screen.
            Keep your head still. This tests smooth pursuit — a key indicator of
            neurological function.
          </p>
          <p style={styles.cardNote}>Requires camera access</p>
          <button onClick={startTracking} style={styles.primaryBtn}>
            Start Eye Test
          </button>
          <button onClick={handleSkip} style={styles.ghostBtn}>
            Skip this test
          </button>
        </div>
      )}

      {phase === PHASES.LOADING && (
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.cardText}>Loading face tracking model...</p>
        </div>
      )}

      {phase === PHASES.TRACKING && (
        <div style={styles.trackingArea}>
          {/* Hidden video feed for MediaPipe */}
          <video
            ref={videoRef}
            style={{ display: "none" }}
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <p style={styles.trackingInstruction}>
            Follow the dot with your eyes — keep your head still
          </p>

          {/* Dot arena */}
          <div style={styles.dotArena}>
            <div
              style={{
                ...styles.dot,
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Progress for current dot */}
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            />
          </div>

          <p style={styles.dotCounter}>
            Position {dotIndex + 1} of {POSITIONS.length}
          </p>
        </div>
      )}

      {phase === PHASES.ERROR && (
        <div style={styles.card}>
          <div style={styles.iconRing}>⚠️</div>
          <h2 style={styles.cardTitle}>Camera Unavailable</h2>
          <p style={styles.cardText}>{errorMsg}</p>
          <button onClick={handleSkip} style={styles.primaryBtn}>
            Continue Without Eye Test
          </button>
        </div>
      )}

      {phase === PHASES.DONE && score && (
        <div style={styles.card}>
          <div style={styles.scoreRing}>
            <span style={styles.scoreNumber}>{score.smoothness}</span>
            <span style={styles.scoreLabel}>/ 100</span>
          </div>
          <h2 style={styles.cardTitle}>Eye Tracking Complete</h2>
          <p style={styles.cardText}>
            Your tracking was classified as:{" "}
            <strong style={{ color: score.smoothness > 70 ? "#00e676" : score.smoothness > 45 ? "#ffeb3b" : "#ff5252" }}>
              {score.label}
            </strong>
          </p>
          <p style={styles.cardNote}>{score.sampleCount} frames analyzed</p>
          <button onClick={handleFinish} style={styles.primaryBtn}>
            See Results →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#fff",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  header: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 3,
    color: "#00e676",
  },
  step: { fontSize: 12, color: "#666", letterSpacing: 1 },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#1a1a2e",
    borderRadius: 20,
    padding: 32,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  iconRing: {
    fontSize: 40,
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#0f0f1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 24, fontWeight: 800, margin: 0 },
  cardText: { fontSize: 15, color: "#aaa", lineHeight: 1.6, margin: 0 },
  cardNote: { fontSize: 12, color: "#555", margin: 0 },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    background: "#00e676",
    color: "#0f0f1a",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
  },
  ghostBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#555",
    border: "1px solid #2a2a3e",
    borderRadius: 12,
    fontSize: 14,
    cursor: "pointer",
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid #2a2a3e",
    borderTop: "4px solid #00e676",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  trackingArea: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  trackingInstruction: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
  },
  dotArena: {
    width: "100%",
    maxWidth: 480,
    height: 320,
    background: "#1a1a2e",
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  dot: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#00e676",
    boxShadow: "0 0 20px #00e676",
    transition: "left 0.4s ease, top 0.4s ease",
  },
  progressTrack: {
    width: "100%",
    maxWidth: 480,
    height: 6,
    background: "#2a2a3e",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#00e676",
    borderRadius: 3,
    transition: "width 0.1s linear",
  },
  dotCounter: { fontSize: 13, color: "#555" },
  scoreRing: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    border: "4px solid #00e676",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  scoreLabel: { fontSize: 12, color: "#666" },
};
