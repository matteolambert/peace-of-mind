export default function SymptomQuiz({ onDone }) {
  return (
    <div>
      <h2>Symptom Quiz</h2>
      <button onClick={() => onDone({ symptoms: [] })}>Next (placeholder)</button>
    </div>
  );
}