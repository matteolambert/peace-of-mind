export default function MythBusting({ onDone }) {
  return (
    <div>
      <h2>Myth Busting</h2>
      <button onClick={() => onDone({ symptoms: [] })}>Next (placeholder)</button>
    </div>
  );
}