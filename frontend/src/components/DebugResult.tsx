import React from 'react';
import { DebugResponse } from '../services/api';

interface DebugResultProps {
  result: DebugResponse | null;
}

export const DebugResult: React.FC<DebugResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="debug-result-panel">
      <section className="result-section">
        <label>Summary</label>
        <p>{result.summary}</p>
      </section>

      <section className="result-section">
        <label>Root Cause</label>
        <p>{result.rootCause}</p>
      </section>

      <section className="result-section">
        <label>Guided Hints</label>
        <ul>
          {result.hints.map((hint, index) => (
            <li key={index}>{hint}</li>
          ))}
        </ul>
      </section>

      <section className="result-section">
        <label>Reflection</label>
        <ul>
          {result.reflection.map((q, index) => (
            <li key={index}>{q}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
