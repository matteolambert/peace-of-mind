const REACTION = {
  GOOD: 280,
  MODERATE: 380,
};

const EYE = {
  GOOD: 70,
  MODERATE: 45,
};

const SYMPTOM_SEVERE = 6;
const SYMPTOM_MODERATE = 3;

export function calculateRisk(results) {
  const flags = [];
  let riskPoints = 0;
  const details = {};

  // Reaction Time
  if (results.avgReaction != null) {
    if (results.avgReaction > REACTION.MODERATE) {
      riskPoints += 3;
      flags.push("significantly slowed reaction time");
      details.reaction = "poor";
    } else if (results.avgReaction > REACTION.GOOD) {
      riskPoints += 1.5;
      flags.push("mildly slowed reaction time");
      details.reaction = "moderate";
    } else {
      details.reaction = "good";
    }
  }

  // Eye Tracking
  if (results.eyeTracking && !results.eyeSkipped) {
    const s = results.eyeTracking.smoothness;
    if (s < EYE.MODERATE) {
      riskPoints += 3;
      flags.push("significant eye tracking irregularity");
      details.eyes = "poor";
    } else if (s < EYE.GOOD) {
      riskPoints += 1.5;
      flags.push("mild eye tracking irregularity");
      details.eyes = "moderate";
    } else {
      details.eyes = "good";
    }
  } else if (results.eyeSkipped) {
    details.eyes = "skipped";
  }
  // Memory check
  if (results.memory?.delayedWordScore != null) {
    const score = results.memory.delayedWordScore;
    if (score <= 3) {
      flags.push("poor delayed memory recall");
      riskPoints += 2;
      details.memory = "poor";
    }
    else if (score === 4) {
      flags.push("mild memory recall difficulty");
      riskPoints += 1;
      details.memory = "moderate";
    }
    else {
      details.memory = "good";
    }
  }
  // Concussion Symptoms
  if (results.symptoms) {
    const concussionKeys = ["headache", "nausea", "confusion", "lightSensitivity", "memory", "balance"];
    const severeSymptoms = [];
    const moderateSymptoms = [];

    concussionKeys.forEach((key) => {
      const val = results.symptoms[key] || 0;
      if (val >= SYMPTOM_SEVERE) {
        riskPoints += 2;
        severeSymptoms.push(formatSymptomName(key));
      } else if (val >= SYMPTOM_MODERATE) {
        riskPoints += 1;
        moderateSymptoms.push(formatSymptomName(key));
      }
    });

    if (severeSymptoms.length) flags.push(`severe ${severeSymptoms.join(", ")}`);
    if (moderateSymptoms.length) flags.push(`mild ${moderateSymptoms.join(", ")}`);
    details.symptoms = { severe: severeSymptoms, moderate: moderateSymptoms };

    // Whiplash-specific symptoms
    const whiplashKeys = ["neckPain", "neckMobility", "shoulderPain", "jawPain", "tingling"];
    const whiplashScore = whiplashKeys.reduce((sum, k) => sum + (results.symptoms[k] || 0), 0);

    if (whiplashScore >= 15) {
      flags.push("significant whiplash indicators — cervical injury possible");
      riskPoints += 1;
      details.whiplash = "high";
    } else if (whiplashScore >= 7) {
      flags.push("mild whiplash indicators — monitor neck symptoms");
      details.whiplash = "moderate";
    } else {
      details.whiplash = "low";
    }
  }

  // Risk Level
  let level;
  if (riskPoints >= 5) {
    level = "red";
  } else if (riskPoints >= 2) {
    level = "yellow";
  } else {
    level = "green";
  }

  const { summary, actions } = buildOutput(level, flags, details);
  return { level, riskPoints, summary, actions, flags, details };
}

function buildOutput(level, flags, details) {
  const hasWhiplash = details.whiplash === "high" || details.whiplash === "moderate";

  if (level === "red") {
    return {
      summary:
        "Your results suggest possible concussion-related impairment. You should not return to play today.",
      actions: [
        "Do not return to play or practice today",
        "Show this result to your coach or athletic trainer immediately",
        "Contact a doctor or visit urgent care within 24 hours",
        "Do not drive until evaluated by a medical professional",
        "Rest in a quiet, low-light environment",
        ...(hasWhiplash ? ["Your neck symptoms suggest possible whiplash — mention this to your doctor"] : []),
      ],
    };
  }

  if (level === "yellow") {
    return {
      summary:
        "Some of your results were outside normal range. You should sit out and be monitored.",
      actions: [
        "Sit out for the remainder of this session",
        "Inform your coach or athletic trainer of your symptoms",
        "Monitor symptoms over the next few hours",
        "If symptoms worsen, seek medical attention immediately",
        "Re-test tomorrow before returning to play",
        ...(hasWhiplash ? ["Your neck symptoms may indicate whiplash — consider a cervical evaluation"] : []),
      ],
    };
  }

  return {
    summary: "Your results look normal. No signs of significant impairment detected.",
    actions: [
      "You may return to play",
      "Continue to monitor how you feel",
      "If symptoms develop later, stop activity and re-test",
      "Stay hydrated and avoid overexertion",
      ...(hasWhiplash ? ["Mild neck symptoms detected — stretch and monitor, see a physio if they persist"] : []),
    ],
  };
}

function formatSymptomName(key) {
  const map = {
    headache: "headache",
    nausea: "nausea",
    confusion: "confusion",
    lightSensitivity: "light sensitivity",
    memory: "memory issues",
    balance: "balance problems",
    noise: "noise sensitivity",
    sleep: "sleep issues",
    neckPain: "neck pain",
    neckMobility: "limited neck mobility",
    shoulderPain: "shoulder pain",
    jawPain: "jaw pain",
    tingling: "tingling in arms",
  };
  return map[key] || key;
}

export function levelColor(level) {
  return { green: "#00e676", yellow: "#ffeb3b", red: "#ff5252" }[level] || "#aaa";
}

export function levelEmoji(level) {
  return { green: "✓", yellow: "⚠", red: "✕" }[level] || "?";
}