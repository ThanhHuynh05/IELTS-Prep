import { useState, useEffect, useRef } from 'react';
import { saveResult } from '../../utils/storage';

export default function SpeakingFeedback({ feedback, onReset, originalTranscript }) {
  const [activeError, setActiveError] = useState(null);

  if (!feedback) return null;

  const renderHighlightedTranscript = (transcript, errors) => {
    if (!errors || errors.length === 0) return <p className="whitespace-pre-wrap">{transcript}</p>;

    let elements = [transcript];
    
    errors.forEach((err, index) => {
      if (!err.originalText) return;
      
      let newElements = [];
      elements.forEach(el => {
        if (typeof el === 'string') {
          const parts = el.split(err.originalText);
          for (let i = 0; i < parts.length; i++) {
            newElements.push(parts[i]);
            if (i < parts.length - 1) {
              newElements.push(
                <span 
                  key={`${index}-${i}`} 
                  onClick={() => setActiveError(err)}
                  className={`cursor-pointer rounded px-1 font-medium border-b-2 transition-colors ${
                    err.type === 'grammar' 
                      ? 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200' 
                      : 'bg-orange-100 border-orange-400 text-orange-900 hover:bg-orange-200'
                  }`}
                >
                  {err.originalText}
                </span>
              );
            }
          }
        } else {
          newElements.push(el);
        }
      });
      elements = newElements;
    });

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
        {elements.map((el, i) => typeof el === 'string' ? <span key={`text-${i}`}>{el}</span> : el)}
      </div>
    );
  };

  const hasSaved = useRef(false);
  useEffect(() => {
    if (feedback && !hasSaved.current) {
      saveResult('speaking', {
        estimatedBand: Number(feedback.overallBand),
        title: "Speaking Practice",
        criteria: feedback.criteria
      });
      hasSaved.current = true;
    }
  }, [feedback]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Score */}
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
        <h2 className="text-lg text-gray-600 font-medium mb-2">Overall Speaking Band</h2>
        <div className="text-6xl font-bold text-blue-600">{Number(feedback.overallBand).toFixed(1)}</div>
      </div>

      {/* Transcript Review */}
      {originalTranscript && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Your Transcript Analysis</h3>
          <p className="text-sm text-gray-500 mb-4">
            Click on the <span className="bg-red-100 border-b-2 border-red-400 text-red-900 px-1 rounded">red</span> (grammar) or <span className="bg-orange-100 border-b-2 border-orange-400 text-orange-900 px-1 rounded">orange</span> (pronunciation) highlights to see corrections.
          </p>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-100 relative">
            {renderHighlightedTranscript(originalTranscript, feedback.errors || [])}
            
            {/* Error Tooltip */}
            {activeError && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg relative">
                <button 
                  onClick={() => setActiveError(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <div className="mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {activeError.type} Error
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-red-600 line-through mb-1">{activeError.originalText}</p>
                  <p className="text-green-600 font-medium">{activeError.correction}</p>
                </div>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{activeError.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Criteria Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(feedback.criteria).map(([key, data]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return (
            <div key={key} className="bg-white p-5 rounded-lg shadow-sm border transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
                  {Number(data.band).toFixed(1)}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{data.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center">
            <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">✓</span>
            Strengths
          </h3>
          <ul className="space-y-2 text-green-800 text-sm">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center">
            <span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">!</span>
            Areas to Improve
          </h3>
          <ul className="space-y-2 text-amber-800 text-sm">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Better Phrase Suggestion */}
      {feedback.betterPhrase && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="bg-blue-200 text-blue-800 p-1 rounded mr-2">💡</span>
            Vocabulary Upgrade
          </h3>
          <div className="bg-white p-4 rounded border border-blue-200 text-blue-900 font-medium italic shadow-sm">
            "{feedback.betterPhrase}"
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onReset}
          className="bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-8 rounded-lg transition-all shadow-sm"
        >
          Try Another Question
        </button>
      </div>
    </div>
  );
}
