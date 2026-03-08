import { useState, useEffect } from "react";
import { colors, radius } from "../utils/theme";

const STUDY_SECONDS = 6;

const WORD_POOL = [
  "APPLE","PENNY","CARPET","ORANGE","PILLOW","RIVER",
  "MIRROR","BREAD","FOREST","BOTTLE","CANDLE","GARDEN",
  "BUTTON","SHADOW","FLOWER"
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryStudy({ onDone }) {

  const [phase,setPhase] = useState("intro");
  const [count,setCount] = useState(STUDY_SECONDS);

  const [data] = useState(()=>{
    const targets = shuffle(WORD_POOL).slice(0,6);
    const distractors = shuffle(
      WORD_POOL.filter(w => !targets.includes(w))
    ).slice(0,4);

    return {
      targets,
      options: shuffle([...targets,...distractors])
    };
  });

  useEffect(()=>{

    if(phase !== "study") return;

    const timer = setInterval(()=>{

      setCount(c=>{

        if(c<=1){
          clearInterval(timer);
          onDone({
            memory:{
              wordTargets:data.targets,
              wordOptions:data.options
            }
          });
          return 0;
        }

        return c-1;

      });

    },1000);

    return ()=>clearInterval(timer);

  },[phase]);

  return (
    <div style={st.page}>

      <div style={st.topBar}>
        <span style={st.logo}>peace of mind</span>
        <span style={st.step}>Memory Study</span>
      </div>

      {phase === "intro" && (

        <div style={st.card}>

          <span style={st.icon}>🧠</span>

          <h2 style={st.title}>Memory Test</h2>

          <p style={st.body}>
            You will see <strong>6 words</strong> for a few seconds.
          </p>

          <p style={st.body}>
            Try to remember as many as possible.
            You will be asked about them later.
          </p>

          <button
            onClick={()=>setPhase("study")}
            style={st.primaryBtn}
          >
            Begin
          </button>

        </div>

      )}

      {phase === "study" && (

        <div style={st.studyArea}>

          <p style={st.studyLabel}>Memorize these words</p>

          <div style={st.countdown}>{count}</div>

          <div style={st.wordGrid}>

            {data.targets.map((w,i)=>(
              <div key={i} style={st.wordCard}>
                {w}
              </div>
            ))}

          </div>

          <p style={st.studyHint}>
            They will disappear automatically
          </p>

        </div>

      )}

    </div>
  );
}

const st = {

  page:{
    minHeight:"100vh",
    background:colors.bg,
    color:colors.textPrimary,
    fontFamily:"'DM Sans','Segoe UI',sans-serif",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    padding:"32px 24px 64px"
  },

  topBar:{
    width:"100%",
    maxWidth:640,
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:40
  },

  logo:{
    fontSize:15,
    fontWeight:600,
    letterSpacing:1,
    color:colors.primary
  },

  step:{
    fontSize:13,
    color:colors.textFaint
  },

  card:{
    width:"100%",
    maxWidth:640,
    background:colors.card,
    border:`1px solid ${colors.border}`,
    borderRadius:radius.md,
    padding:48,
    textAlign:"center",
    display:"flex",
    flexDirection:"column",
    gap:18
  },

  icon:{fontSize:48},

  title:{
    fontSize:30,
    fontWeight:800
  },

  body:{
    fontSize:16,
    color:colors.textMuted,
    lineHeight:1.7
  },

  primaryBtn:{
    marginTop:12,
    padding:"16px",
    background:colors.primary,
    color:"#fff",
    border:"none",
    borderRadius:radius.md,
    fontSize:16,
    fontWeight:700,
    cursor:"pointer"
  },

  studyArea:{
    width:"100%",
    maxWidth:640,
    textAlign:"center",
    display:"flex",
    flexDirection:"column",
    gap:24
  },

  studyLabel:{
    fontSize:18,
    fontWeight:700,
    color:colors.textMuted
  },

  countdown:{
    fontSize:72,
    fontWeight:900,
    color:colors.primary
  },

  wordGrid:{
    display:"grid",
    gridTemplateColumns:"repeat(3,1fr)",
    gap:14
  },

  wordCard:{
    background:colors.card,
    border:`1px solid ${colors.border}`,
    borderRadius:radius.sm,
    padding:"18px",
    fontSize:18,
    fontWeight:700,
    letterSpacing:1
  },

  studyHint:{
    fontSize:13,
    color:colors.textFaint
  }

};