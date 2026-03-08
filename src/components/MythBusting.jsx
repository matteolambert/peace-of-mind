import { useState } from "react";

const MYTHS = [
  {
    myth: "There's a magic number of concussions that ends your career",
    fact: "There is no universal number. Every concussion is different, and the decision to retire from sport is made individually by a doctor based on symptoms, recovery time, and overall health history. The \"3 strikes\" rule has no medical basis.",
    source: "CDC Heads Up Program",
  },
  {
    myth: "If you didn't black out, it's not a concussion",
    fact: "Loss of consciousness occurs in fewer than 10% of concussions. Most concussions do not involve blacking out at all. Symptoms like headache, confusion, and feeling \"foggy\" are far more common indicators.",
    source: "NHS / British Journal of Sports Medicine",
  },
  {
    myth: "You should stay awake all night after a concussion",
    fact: "Sleep is actually essential for brain recovery. The old advice to keep someone awake was based on fear of missing a rare brain bleed — which would show other serious warning signs. Normal sleep after a concussion is safe and helpful.",
    source: "CDC Concussion Guidelines",
  },
  {
    myth: "You need a hit to the head to get a concussion",
    fact: "A concussion can result from any jolt or force that causes the brain to move rapidly inside the skull — including a hit to the body that whips the head. You don't need to hit your head directly.",
    source: "American Academy of Neurology",
  },
  {
    myth: "Once symptoms are gone, you're fully recovered",
    fact: "Symptom resolution does not mean the brain has fully healed. Return-to-play must follow a gradual, stepwise protocol supervised by a medical professional — even after you feel normal.",
    source: "Concussion in Sport Group (CISG)",
  },
  {
    myth: "Helmets prevent concussions",
    fact: "Helmets are critical for preventing skull fractures and severe head injuries, but they do not prevent concussions. Concussion results from brain movement inside the skull, which helmets cannot stop.",
    source: "CDC / NATA",
  },
];

const COMPARISON = [
  { symptom: "Headache",              concussion: true,  whiplash: true  },
  { symptom: "Dizziness",             concussion: true,  whiplash: true  },
  { symptom: "Confusion / Fogginess", concussion: true,  whiplash: false },
  { symptom: "Light Sensitivity",     concussion: true,  whiplash: false },
  { symptom: "Noise Sensitivity",     concussion: true,  whiplash: false },
  { symptom: "Memory Problems",       concussion: true,  whiplash: false },
  { symptom: "Neck Pain / Stiffness", concussion: false, whiplash: true  },
  { symptom: "Neck Muscle Tension",   concussion: false, whiplash: true  },
  { symptom: "Visual Disturbances",   concussion: true,  whiplash: true  },
  { symptom: "Balance Issues",        concussion: true,  whiplash: true  },
];

export default function MythBusting({ onBack }) {
  const [tab, setTab] = useState("myths");

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <span style={styles.title}>PEACE OF MIND</span>
        <span style={{ width: 60 }} />
      </div>

      <h1 style={styles.h1}>Know the Facts</h1>
      <p style={styles.sub}>
        Dangerous misinformation puts athletes at risk every day.
      </p>

      {/* Tab Toggle */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setTab("myths")}
          style={{ ...styles.tab, ...(tab === "myths" ? styles.tabActive : {}) }}
        >
          Myth Busting
        </button>
        <button
          onClick={() => setTab("whiplash")}
          style={{ ...styles.tab, ...(tab === "whiplash" ? styles.tabActive : {}) }}
        >
          Concussion vs. Whiplash
        </button>
      </div>

      {/* Myths Tab */}
      {tab === "myths" && (
        <div style={styles.list}>
          {MYTHS.map((m, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.mythRow}>
                <span style={styles.xBadge}>✕</span>
                <p style={styles.mythText}>{m.myth}</p>
              </div>
              <div style={styles.divider} />
              <div style={styles.factRow}>
                <span style={styles.checkBadge}>✓</span>
                <p style={styles.factText}>{m.fact}</p>
              </div>
              <p style={styles.source}>Source: {m.source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Whiplash Tab */}
      {tab === "whiplash" && (
        <div style={styles.list}>

          {/* What's the difference */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>What's the Difference?</h2>
            <div style={styles.mechRow}>
              <div style={styles.mechCard}>
                <span style={styles.mechEmoji}>🧠</span>
                <p style={styles.mechLabel}>Concussion</p>
                <p style={styles.mechDesc}>
                  The brain moves rapidly inside the skull due to direct or indirect force,
                  causing cellular disruption and metabolic changes.
                </p>
              </div>
              <div style={styles.mechDivider} />
              <div style={styles.mechCard}>
                <span style={styles.mechEmoji}>🦴</span>
                <p style={styles.mechLabel}>Whiplash</p>
                <p style={styles.mechDesc}>
                  Rapid back-and-forth motion strains the cervical spine muscles,
                  ligaments, and discs in the neck — no brain disruption required.
                </p>
              </div>
            </div>
          </div>

          {/* Symptom comparison table */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Symptom Comparison</h2>
            <p style={styles.cardSubtext}>
              Many symptoms overlap — this is what makes diagnosis tricky.
            </p>
            <div style={styles.tableHeader}>
              <span style={styles.tableCol}>Symptom</span>
              <span style={{ ...styles.tableColCenter, color: "#00e676" }}>Concussion</span>
              <span style={{ ...styles.tableColCenter, color: "#888" }}>Whiplash</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} style={{ ...styles.tableRow, background: i % 2 === 0 ? "#0f0f1a" : "transparent" }}>
                <span style={styles.tableCol}>{row.symptom}</span>
                <span style={styles.tableColCenter}>
                  {row.concussion ? <span style={{ color: "#00e676", fontWeight: 700 }}>✓</span> : <span style={{ color: "#333" }}>—</span>}
                </span>
                <span style={styles.tableColCenter}>
                  {row.whiplash ? <span style={{ color: "#888", fontWeight: 700 }}>✓</span> : <span style={{ color: "#333" }}>—</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Warning card */}
          <div style={{ ...styles.card, borderLeft: "4px solid #ffeb3b" }}>
            <div style={styles.warnRow}>
              <span style={styles.warnEmoji}>⚠️</span>
              <div>
                <p style={styles.warnTitle}>You can have both at the same time</p>
                <p style={styles.warnText}>
                  High-impact collisions often cause both a concussion and whiplash simultaneously.
                  Cervical spine involvement can extend recovery times and complicate diagnosis.
                  When in doubt, get evaluated for both.
                </p>
              </div>
            </div>
          </div>

          {/* Key differentiators */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>How Doctors Tell Them Apart</h2>
            <div style={styles.diffRow}>
              <div style={styles.diffCol}>
                <p style={{ ...styles.diffHeader, color: "#00e676" }}>🧠 Concussion Tests</p>
                <p style={styles.diffItem}>• Cognitive & memory exams</p>
                <p style={styles.diffItem}>• Eye tracking (oculomotor)</p>
                <p style={styles.diffItem}>• Balance & vestibular function</p>
                <p style={styles.diffItem}>• MRI / CT if symptoms persist</p>
              </div>
              <div style={styles.diffCol}>
                <p style={{ ...styles.diffHeader, color: "#888" }}>🦴 Whiplash Tests</p>
                <p style={styles.diffItem}>• Neck mobility exam</p>
                <p style={styles.diffItem}>• Muscle tenderness check</p>
                <p style={styles.diffItem}>• Cervical imaging (X-ray/MRI)</p>
                <p style={styles.diffItem}>• Head repositioning accuracy</p>
              </div>
            </div>
          </div>

          <p style={styles.sourceNote}>
            Sources: CDC, Amsterdam Consensus Statement on Concussion in Sport (2022),
            NHS, American Academy of Neurology, Concussion in Sport Group
          </p>
        </div>
      )}

      <div style={styles.cta}>
        <p style={styles.ctaText}>Think you may have a concussion?</p>
        <button onClick={onBack} style={styles.primaryBtn}>
          Take the Assessment
        </button>
      </div>
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
    padding: "24px 16px 64px",
    boxSizing: "border-box",
  },
  header: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backBtn: {
    background: "none", border: "none", color: "#555",
    fontSize: 14, cursor: "pointer", width: 60, textAlign: "left",
  },
  title: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#00e676" },
  h1: { fontSize: 32, fontWeight: 900, marginBottom: 8, textAlign: "center" },
  sub: {
    fontSize: 15, color: "#555", marginBottom: 24,
    textAlign: "center", maxWidth: 360,
  },
  tabRow: {
    display: "flex", gap: 8, marginBottom: 32,
    background: "#1a1a2e", borderRadius: 12, padding: 4,
  },
  tab: {
    padding: "10px 20px", borderRadius: 10, border: "none",
    background: "transparent", color: "#555", fontSize: 14,
    cursor: "pointer", fontWeight: 600, transition: "all 0.2s",
  },
  tabActive: {
    background: "#00e676", color: "#0f0f1a",
  },
  list: { width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 },
  card: { background: "#1a1a2e", borderRadius: 16, padding: 24 },
  mythRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 },
  xBadge: { color: "#ff5252", fontSize: 16, fontWeight: 900, minWidth: 20, paddingTop: 2 },
  mythText: { fontSize: 15, fontWeight: 700, color: "#ff5252", lineHeight: 1.5, margin: 0 },
  divider: { height: 1, background: "#2a2a3e", marginBottom: 16 },
  factRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  checkBadge: { color: "#00e676", fontSize: 16, fontWeight: 900, minWidth: 20, paddingTop: 2 },
  factText: { fontSize: 14, color: "#ccc", lineHeight: 1.6, margin: 0 },
  source: { fontSize: 11, color: "#444", marginTop: 4, marginLeft: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 16, marginTop: 0 },
  cardSubtext: { fontSize: 13, color: "#555", marginBottom: 16, marginTop: -8 },
  mechRow: { display: "flex", gap: 0, alignItems: "stretch" },
  mechCard: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center", gap: 8, padding: "0 12px",
  },
  mechEmoji: { fontSize: 32 },
  mechLabel: { fontSize: 15, fontWeight: 800, margin: 0 },
  mechDesc: { fontSize: 13, color: "#aaa", lineHeight: 1.6, margin: 0 },
  mechDivider: { width: 1, background: "#2a2a3e", margin: "0 8px" },
  tableHeader: {
    display: "flex", padding: "8px 0",
    borderBottom: "1px solid #2a2a3e", marginBottom: 4,
  },
  tableRow: {
    display: "flex", padding: "10px 8px", borderRadius: 8,
  },
  tableCol: { flex: 2, fontSize: 13, color: "#ccc" },
  tableColCenter: { flex: 1, fontSize: 14, textAlign: "center" },
  warnRow: { display: "flex", gap: 14, alignItems: "flex-start" },
  warnEmoji: { fontSize: 24, paddingTop: 2 },
  warnTitle: { fontSize: 15, fontWeight: 800, marginBottom: 6, color: "#ffeb3b" },
  warnText: { fontSize: 13, color: "#aaa", lineHeight: 1.6, margin: 0 },
  diffRow: { display: "flex", gap: 16 },
  diffCol: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  diffHeader: { fontSize: 14, fontWeight: 800, marginBottom: 4 },
  diffItem: { fontSize: 13, color: "#aaa", lineHeight: 1.5 },
  sourceNote: { fontSize: 11, color: "#333", textAlign: "center", padding: "0 16px" },
  cta: { marginTop: 48, textAlign: "center", width: "100%", maxWidth: 480 },
  ctaText: { fontSize: 16, color: "#666", marginBottom: 16 },
  primaryBtn: {
    width: "100%", padding: "16px", background: "#00e676",
    color: "#0f0f1a", border: "none", borderRadius: 12,
    fontSize: 16, fontWeight: 700, cursor: "pointer",
  },
};