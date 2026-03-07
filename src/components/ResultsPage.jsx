export default function ReactionPage({ onDone }) {
  return (
    <div>
      <h2>Reaction Page</h2>
      <button onClick={() => onDone({ symptoms: [] })}>Next (placeholder)</button>
    </div>
  );
}