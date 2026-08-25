import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { saveResult } from '../../utils/storage';
import { checkAnswer } from '../../utils/answerChecker';

export default function ListeningFeedback({ sections, userAnswers, transcript, onReset }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!sections || !userAnswers) return null;

  const allQuestions = sections.flatMap(sec => sec.questions);
  let correctCount = 0;
  
  const results = allQuestions.map((q) => {
    const isCorrect = checkAnswer(userAnswers[q.id], q.answer);
    if (isCorrect) correctCount++;
    
    return { ...q, isCorrect, userAnswer: userAnswers[q.id] };
  });

  const percentage = correctCount / allQuestions.length;
  let estimatedBand = 0;
  if (percentage === 1) estimatedBand = 9.0;
  else if (percentage >= 0.85) estimatedBand = 8.0;
  else if (percentage >= 0.75) estimatedBand = 7.0;
  else if (percentage >= 0.6) estimatedBand = 6.0;
  else if (percentage >= 0.5) estimatedBand = 5.0;
  else if (percentage >= 0.35) estimatedBand = 4.0;
  else estimatedBand = 3.0;

  const hasSaved = useRef(false);
  useEffect(() => {
    if (!hasSaved.current) {
      saveResult('listening', {
        rawScore: correctCount,
        maxScore: allQuestions.length,
        estimatedBand: estimatedBand,
        title: "Listening Practice",
        detailedResults: results
      });
      hasSaved.current = true;
    }
  }, [correctCount, allQuestions.length, estimatedBand]);

  return (
    <div className="h-full overflow-y-auto pr-2 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 text-center flex justify-around items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Raw Score</h2>
          <div className="text-4xl font-bold text-gray-800">
            {correctCount} <span className="text-2xl text-gray-400">/ {allQuestions.length}</span>
          </div>
        </div>
        <div className="w-px h-16 bg-gray-200"></div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Band</h2>
          <div className="text-4xl font-bold text-blue-600">{estimatedBand.toFixed(1)}</div>
        </div>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <FileText size={20} />
          <span>{showTranscript ? "Hide Audio Transcript" : "View Audio Transcript"}</span>
        </button>

        {showTranscript && (
          <div className="mt-4 p-5 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 leading-relaxed text-sm">
            {transcript}
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Answers</h3>
      <div className="space-y-8 pb-12">
        {sections.map((section, idx) => (
          <div key={section.id} className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 pb-2 border-b">Section {idx + 1}</h4>
            <div className="space-y-4">
              {section.questions.map((q) => {
                const res = results.find(r => r.id === q.id);
                const globalNumber = allQuestions.findIndex(gq => gq.id === q.id) + 1;

                return (
                  <div 
                    key={res.id} 
                    className={`p-4 rounded-lg border ${res.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="font-medium text-gray-800 mb-2 flex items-start">
                      <span className="shrink-0 mr-3 mt-0.5">
                        {res.isCorrect ? (
                          <CheckCircle2 className="text-green-600" size={18} />
                        ) : (
                          <XCircle className="text-red-500" size={18} />
                        )}
                      </span>
                      <span>
                        <span className="font-bold mr-2">{globalNumber}.</span>
                        {res.question}
                      </span>
                    </div>
                    
                    <div className="ml-8 space-y-1 text-sm">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24 shrink-0">Your Answer:</span>
                        <span className={`font-semibold ${res.isCorrect ? 'text-green-700' : 'text-red-600 line-through'}`}>
                          {res.userAnswer || "No answer provided"}
                        </span>
                      </div>
                      
                      {!res.isCorrect && (
                        <div className="flex items-start mt-1">
                          <span className="text-gray-500 w-24 shrink-0">Correct:</span>
                          <span className="font-semibold text-green-700">{res.answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200 flex justify-end mt-4">
        <button
          onClick={onReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full border transition-all"
        >
          Try Another Test
        </button>
      </div>
    </div>
  );
}
