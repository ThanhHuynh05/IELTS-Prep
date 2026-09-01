import { useState, useEffect, useRef } from 'react';
import { saveResult } from '../../utils/storage';

export default function WritingFeedback({ feedback, onReset, originalEssay }) {
  const [activeError, setActiveError] = useState(null);

  if (!feedback) return null;

  const renderHighlightedEssay = (essay, errors) => {
    if (!errors || errors.length === 0) return <p className="whitespace-pre-wrap">{essay}</p>;

    let elements = [essay];
    
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
                  onClick={(e) => { e.stopPropagation(); setActiveError(activeError === err ? null : err); }}
                  className={`group relative cursor-pointer rounded px-1 font-medium border-b-2 transition-colors ${
                    err.type === 'grammar' 
                      ? 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200' 
                      : 'bg-orange-100 border-orange-400 text-orange-900 hover:bg-orange-200'
                  }`}
                >
                  {err.originalText}
                  
                  {/* Inline Tooltip (Hover & Click) */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-2xl z-[100] text-left font-normal text-sm transform transition-all origin-bottom ${activeError === err ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible'} pointer-events-none group-hover:pointer-events-auto`}>
                    <div className="mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${err.type === 'grammar' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {err.type} Error
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-red-500 line-through mb-1">"{err.originalText}"</p>
                      <p className="text-green-600 font-bold">→ "{err.correction}"</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-100 dark:border-gray-600">{err.explanation}</p>
                    {/* Downward triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-[6px] border-transparent border-t-white"></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] w-0 h-0 border-[7px] border-transparent border-t-gray-200 -z-10"></div>
                  </div>
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
      <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-300">
        {elements.map((el, i) => typeof el === 'string' ? <span key={`text-${i}`}>{el}</span> : el)}
      </div>
    );
  };

  const hasSaved = useRef(false);
  useEffect(() => {
    if (feedback && !hasSaved.current) {
      saveResult('writing', {
        estimatedBand: Number(feedback.overallBand),
        title: "Writing Practice",
        criteria: feedback.criteria
      });
      hasSaved.current = true;
    }
  }, [feedback]);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 text-center">
        <h2 className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-2">Overall Band Score</h2>
        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{Number(feedback.overallBand).toFixed(1)}</div>
      </div>

      {/* Highlighted Essay Section */}
      {originalEssay && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">Your Essay Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Click on the <span className="bg-red-100 border-b-2 border-red-400 text-red-900 px-1 rounded">red</span> (grammar) or <span className="bg-orange-100 border-b-2 border-orange-400 text-orange-900 px-1 rounded">orange</span> (vocabulary) highlights to see corrections.
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-700 relative">
            {renderHighlightedEssay(originalEssay, feedback.errors || [])}
            
          </div>
        </div>
      )}

      {/* Criteria Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(feedback.criteria).map(([key, data]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-sm">
                  {Number(data.band).toFixed(1)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{data.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800/50">
          <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3">Strengths</h3>
          <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300 text-sm">
            {feedback.strengths.map((str, i) => <li key={i}>{str}</li>)}
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-100 dark:border-amber-800/50">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3">Areas to Improve</h3>
          <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-300 text-sm">
            {feedback.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
          </ul>
        </div>
      </div>

      {/* Band 7.0 Sample Answer */}
      {feedback.sampleAnswer && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800/50 mt-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 text-lg">Band 7.0 Sample Answer</h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded border border-blue-200 dark:border-blue-800/50 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
            {feedback.sampleAnswer}
          </div>
        </div>
      )}

      {/* Corrected Sentence (Fallback) */}
      {feedback.correctedSentence && (!feedback.errors || feedback.errors.length === 0) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Example Correction</h3>
          <p className="text-blue-700 dark:text-blue-300 italic">"{feedback.correctedSentence}"</p>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={onReset}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
        >
          Try Another Question
        </button>
      </div>
    </div>
  );
}
