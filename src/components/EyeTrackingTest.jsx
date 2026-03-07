export default function EyeTrackingTest({ onDone }) {
  return (
    <div>
      <h2>Eye Tracking Test</h2>
      <button onClick={() => onDone({ symptoms: [] })}>Next (placeholder)</button>
    </div>
  );
}