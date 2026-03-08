import { useState } from "react";
import { colors, radius } from "../utils/theme";

export default function MemoryRecall({ memory, onDone }) {

  const [selected,setSelected] = useState(new Set());

  function toggle(word){

    setSelected(prev=>{

      const next = new Set(prev);

      next.has(word)
        ? next.delete(word)
        : next.add(word);

      return next;

    });

  }

  function submit(){

    const score =
      memory.wordTargets
        .filter(w => selected.has(w))
        .length;

    onDone({
      memory:{
        ...memory,
        delayedWordScore:score
      }
    });

  }

  return (

    <div style={st.page}>

      <div style={st.topBar}>
        <span style={st.logo}>peace of mind</span>
        <span style={st.step}>Memory Recall</span>
      </div>

      <div style={st.card}>

        <h2 style={st.title}>
          Which words did you see earlier?
        </h2>

        <p style={st.body}>
          Select all words you remember.
        </p>

        <div style={st.grid}>

          {memory.wordOptions.map((w,i)=>{

            const active = selected.has(w);

            return (

              <button
                key={i}
                onClick={()=>toggle(w)}
                style={{
                  ...st.wordBtn,
                  background: active
                    ? colors.primary
                    : colors.card,
                  color: active
                    ? "#fff"
                    : colors.textMuted,
                  border:`1px solid ${
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
    gap:20
  },

  title:{
    fontSize:28,
    fontWeight:800
  },

  body:{
    fontSize:16,
    color:colors.textMuted
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(3,1fr)",
    gap:12
  },

  wordBtn:{
    padding:"16px",
    borderRadius:radius.sm,
    fontSize:15,
    fontWeight:700,
    cursor:"pointer"
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
  }

};