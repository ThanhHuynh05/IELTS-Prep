import { useEffect, useRef } from 'react';
import { saveResult } from '../../utils/storage';

export default function MockTestResults({ results, onRestart }) {
  const hasSaved = useRef(false);

  const calculateOverall = () => {
    // If a section is missing (e.g. timed out), assume 0
    const l = results.listening ? parseFloat(results.listening.estimatedBand) : 0;
    const r = results.reading ? parseFloat(results.reading.estimatedBand) : 0;
    const w = results.writing ? parseFloat(results.writing.estimatedBand) : 0;
    const s = results.speaking ? parseFloat(results.speaking.estimatedBand) : 0;

    const avg = (l + r + w + s) / 4;
    // IELTS rounds to nearest 0.5
    const remainder = avg % 1;
    let rounded = Math.floor(avg);
    if (remainder >= 0.75) rounded += 1;
    else if (remainder >= 0.25) rounded += 0.5;

    return { l, r, w, s, overall: rounded };
  };

  const scores = calculateOverall();

  useEffect(() => {
    if (!hasSaved.current) {
      // Save each section result
      if (results.listening) saveResult('listening', { ...results.listening, title: "Mock Test" });
      if (results.reading) saveResult('reading', { ...results.reading, title: "Mock Test" });
      if (results.writing) saveResult('writing', { ...results.writing, title: "Mock Test" });
      if (results.speaking) saveResult('speaking', { ...results.speaking, title: "Mock Test" });
      
      hasSaved.current = true;
    }
  }, [results]);

  const ScoreCard = ({ title, score }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
      <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-2 text-sm">{title}</h3>
      <div className="text-4xl font-bold text-gray-800">{score.toFixed(1)}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Test Complete!</h1>
        <p className="text-gray-600">Here is your official IELTS estimated score report.</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg mb-8">
        <h2 className="text-xl font-medium text-blue-100 mb-2">Overall Band Score</h2>
        <div className="text-7xl font-bold">{scores.overall.toFixed(1)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <ScoreCard title="Listening" score={scores.l} />
        <ScoreCard title="Reading" score={scores.r} />
        <ScoreCard title="Writing" score={scores.w} />
        <ScoreCard title="Speaking" score={scores.s} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full border transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
