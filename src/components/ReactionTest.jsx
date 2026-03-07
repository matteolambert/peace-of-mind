export default function ReactionTest({ onDone }) {
  return (
    <div>
      <h2>Reaction Test</h2>
      <button onClick={() => onDone({ symptoms: [] })}>Next (placeholder)</button>
    </div>
  );
}