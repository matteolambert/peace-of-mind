// List of common concussion myths and facts
const MYTHS = [
  {
    // Myth 1
    myth: "There's a magic number of concussions that ends your career",
    fact: "There is no universal number. Every concussion is different, and the decision to retire from sport is made individually by a doctor based on symptoms, recovery time, and overall health history. The \"3 strikes\" rule has no medical basis.",
    source: "CDC Heads Up Program",
  },
  {
    // Myth 2
    myth: "If you didn't black out, it's not a concussion",
    fact: "Loss of consciousness occurs in fewer than 10% of concussions. Most concussions do not involve blacking out at all. Symptoms like headache, confusion, and feeling \"foggy\" are far more common indicators.",
    source: "NHS / British Journal of Sports Medicine",
  },
  {
    // Myth 3
    myth: "You should stay awake all night after a concussion",
    fact: "Sleep is actually essential for brain recovery. The old advice to keep someone awake was based on fear of missing a rare brain bleed — which would show other serious warning signs. Normal sleep after a concussion is safe and helpful.",
    source: "CDC Concussion Guidelines",
  },
  {
    // Myth 4
    myth: "You need a hit to the head to get a concussion",
    fact: "A concussion can result from any jolt or force that causes the brain to move rapidly inside the skull — including a hit to the body that whips the head. You don't need to hit your head directly.",
    source: "American Academy of Neurology",
  },
  {
    // Myth 5
    myth: "Once symptoms are gone, you're fully recovered",
    fact: "Symptom resolution does not mean the brain has fully healed. Return-to-play must follow a gradual, stepwise protocol supervised by a medical professional — even after you feel normal.",
    source: "Concussion in Sport Group (CISG)",
  },
  {
    // Myth 6
    myth: "Helmets prevent concussions",
    fact: "Helmets are critical for preventing skull fractures and severe head injuries, but they do not prevent concussions. Concussion results from brain movement inside the skull, which helmets cannot stop.",
    source: "CDC / NATA",
  },
];

// MythBusting component displays a list of concussion myths and facts
export default function MythBusting({ onBack }) {
  // Render the main wrapper
  return (
    <div style={styles.wrapper}>
      {/* Header with back button and title */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <span style={styles.title}>PEACE OF MIND</span>
        <span style={{ width: 60 }} />
      </div>

      {/* Main heading and subtitle */}
      <h1 style={styles.h1}>Concussion Myths</h1>
      <p style={styles.sub}>
        Dangerous misinformation puts athletes at risk every day.
      </p>

      {/* List of myths and facts */}
      <div style={styles.list}>
        {MYTHS.map((m, i) => (
          // Card for each myth/fact pair
          <div key={i} style={styles.card}>
            {/* Myth row with X badge */}
            <div style={styles.mythRow}>
              <span style={styles.xBadge}>✕</span>
              <p style={styles.mythText}>{m.myth}</p>
            </div>
            <div style={styles.divider} />
            {/* Fact row with check badge */}
            <div style={styles.factRow}>
              <span style={styles.checkBadge}>✓</span>
              <p style={styles.factText}>{m.fact}</p>
            </div>
            {/* Source for the fact */}
            <p style={styles.source}>Source: {m.source}</p>
          </div>
        ))}
      </div>

      {/* Call to action at the bottom */}
      <div style={styles.cta}>
        <p style={styles.ctaText}>Think you may have a concussion?</p>
        <button onClick={onBack} style={styles.primaryBtn}>
          Take the Assessment
        </button>
      </div>
    </div>
  );
}


// Inline styles for the component
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
    background: "none",
    border: "none",
    color: "#555",
    fontSize: 14,
    cursor: "pointer",
    width: 60,
    textAlign: "left",
  },
  title: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#00e676" },
  h1: { fontSize: 32, fontWeight: 900, marginBottom: 8, textAlign: "center" },
  sub: {
    fontSize: 15,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
    maxWidth: 360,
  },
  list: { width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 },
  card: {
    background: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
  },
  mythRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 },
  xBadge: {
    color: "#ff5252",
    fontSize: 16,
    fontWeight: 900,
    minWidth: 20,
    paddingTop: 2,
  },
  mythText: {
    fontSize: 15,
    fontWeight: 700,
    color: "#ff5252",
    lineHeight: 1.5,
    margin: 0,
  },
  divider: { height: 1, background: "#2a2a3e", marginBottom: 16 },
  factRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  checkBadge: {
    color: "#00e676",
    fontSize: 16,
    fontWeight: 900,
    minWidth: 20,
    paddingTop: 2,
  },
  factText: { fontSize: 14, color: "#ccc", lineHeight: 1.6, margin: 0 },
  source: { fontSize: 11, color: "#444", marginTop: 4, marginLeft: 32 },
  cta: {
    marginTop: 48,
    textAlign: "center",
    width: "100%",
    maxWidth: 480,
  },
  ctaText: { fontSize: 16, color: "#666", marginBottom: 16 },
  primaryBtn: {
    width: "100%",
    padding: "16px",
    background: "#00e676",
    color: "#0f0f1a",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
};
