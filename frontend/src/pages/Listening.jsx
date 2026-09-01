import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ListeningPlayer from '../components/listening/ListeningPlayer';
import ListeningQuestions from '../components/listening/ListeningQuestions';
import ListeningFeedback from '../components/listening/ListeningFeedback';
import TipsModal from '../components/common/TipsModal';
import { Loader2 } from 'lucide-react';
import { checkAnswer } from '../utils/answerChecker';

const LISTENING_TIPS = [
  "Read the questions during the short pauses BEFORE the recording begins.",
  "Underline keywords in the questions to know what to listen for.",
  "Be careful with spelling and grammar. If the answer requires a plural, a singular noun will be marked wrong.",
  "Do not leave any blank answers. There is no negative marking, so guess if you have to.",
  "Pay attention to synonyms and paraphrasing—the recording rarely uses the exact words from the question."
];

const Listening = forwardRef(({ isMockMode, onMockSubmit }, ref) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/content/listening');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTests(custom);
          }
        }
      } catch (err) {
        console.error('Failed to load custom listening tests', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomTests();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  useImperativeHandle(ref, () => ({
    forceSubmit: () => {
      handleSubmit();
    }
  }));

  const handleSubmit = () => {
    if (isMockMode) {
      window.speechSynthesis.cancel();
      const allQuestions = selectedTest.sections.flatMap(sec => sec.questions || []);
      let correctCount = 0;
      allQuestions.forEach(q => {
        if (checkAnswer(userAnswers[q.id], q.answer)) {
          correctCount++;
        }
      });
      const percentage = correctCount / allQuestions.length;
      let estimatedBand = 3.0;
      if (percentage === 1) estimatedBand = 9.0;
      else if (percentage >= 0.85) estimatedBand = 8.0;
      else if (percentage >= 0.75) estimatedBand = 7.0;
      else if (percentage >= 0.6) estimatedBand = 6.0;
      else if (percentage >= 0.5) estimatedBand = 5.0;
      else if (percentage >= 0.35) estimatedBand = 4.0;
      
      onMockSubmit({ estimatedBand, rawScore: correctCount, maxScore: allQuestions.length });
    } else {
      setIsSubmitted(true);
    }
  };

  if (isMockMode) {
    const hasLeftPanel = !selectedTest.isSectionMedia || selectedTest.pdfUrl;
    const currentAudioUrl = selectedTest.isSectionMedia 
      ? selectedTest.sections[activeSectionIndex]?.audioUrl 
      : selectedTest.audioUrl;

    return (
      <div className={`flex-1 ${hasLeftPanel ? `grid grid-cols-1 ${selectedTest.pdfUrl ? 'lg:grid-cols-12' : 'lg:grid-cols-[1fr_2fr]'}` : 'flex flex-col'} gap-6 overflow-hidden bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full`}>
        {hasLeftPanel && (
          <div className={`flex flex-col h-full overflow-hidden border-r border-gray-200 pr-4 sm:pr-6 ${selectedTest.pdfUrl ? 'lg:col-span-9' : ''}`}>
            <div className="mb-4 shrink-0">
              <ListeningPlayer 
                key={selectedTest.isSectionMedia ? `section-${activeSectionIndex}` : selectedTest.id} 
                transcript={selectedTest.transcript} 
                audioUrl={currentAudioUrl} 
              />
            </div>
            
            {selectedTest.pdfUrl && (
              <div className="flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden relative">
                <iframe 
                  src={selectedTest.pdfUrl} 
                  className="absolute inset-0 w-full h-full"
                  title="Listening Test PDF"
                />
              </div>
            )}
          </div>
        )}
        <div className={`flex flex-col h-full overflow-hidden ${hasLeftPanel && selectedTest.pdfUrl ? 'lg:col-span-3' : ''}`}>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg shadow-sm mb-4 shrink-0">
             {selectedTest.sections.map((sec, idx) => (
               <button
                 key={idx}
                 onClick={() => setActiveSectionIndex(idx)}
                 className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                   activeSectionIndex === idx 
                     ? 'bg-white dark:bg-gray-800 text-blue-600 shadow' 
                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 Section {idx + 1}
               </button>
             ))}
          </div>
          <ListeningQuestions 
            sections={selectedTest.sections} 
            activeSectionIndex={activeSectionIndex}
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setActiveSectionIndex(0);
  };

  const handleTestSelect = (test) => {
    window.speechSynthesis.cancel();
    const safeTest = {
      ...test,
      sections: test.sections?.length > 0 ? test.sections : [
        { title: 'Section 1 (Empty)', instructions: '', type: 'mixed', options: [], questions: [] }
      ]
    };
    setSelectedTest(safeTest);
    handleReset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!selectedTest) {
    if (!tests || tests.length === 0) {
      return (
        <div className="max-w-[1400px] mx-auto p-8 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Listening Tests Available</h2>
            <p className="text-gray-600">Please add some tests in the Admin Panel.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Listening Practice</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Select a test to begin your practice.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test, index) => (
            <div 
              key={test.id || index}
              onClick={() => handleTestSelect(test)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-blue-500 hover:ring-1 hover:ring-blue-500 group flex flex-col h-full"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors mb-2">
                  {test.title || `Test ${index + 1}`}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                  Audio tracks and questions included. Prepare for the IELTS Listening section.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                <span>Start Test</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasLeftPanel = selectedTest && (!selectedTest.isSectionMedia || selectedTest.pdfUrl);
  const currentAudioUrl = selectedTest && selectedTest.isSectionMedia 
    ? selectedTest.sections[activeSectionIndex]?.audioUrl 
    : selectedTest?.audioUrl;

  return (
    <div className="w-full px-4 md:px-8 pb-6 pt-4 h-auto lg:h-[calc(100vh-80px)] flex flex-col">
      <TipsModal 
        isOpen={showTips} 
        onClose={() => setShowTips(false)} 
        title="IELTS Listening Tips"
        tips={LISTENING_TIPS}
      />
      
      <TipsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        title="Test Instructions"
        tips={[
          "You will only hear the audio once.",
          "Read the questions carefully before starting the audio.",
          "Answer the questions as you listen.",
          "When you have answered all questions, click Submit."
        ]}
      />
      
      {/* Header and Test Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Listening Practice</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowTips(true)}
              className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              💡 Tips
            </button>
            <button 
              onClick={() => setShowInstructions(true)}
              className="text-sm font-medium text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full hover:bg-yellow-100 transition-colors"
            >
              📋 Instructions
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedTest(null);
              handleReset();
            }}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            ← Back to Tests
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className={`flex-1 ${hasLeftPanel ? `grid grid-cols-1 ${selectedTest.pdfUrl ? 'lg:grid-cols-12' : 'lg:grid-cols-[1fr_2fr]'}` : 'flex flex-col'} gap-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto lg:overflow-hidden`}>
        
        {/* Left Side: Audio Player & PDF */}
        {hasLeftPanel && (
          <div className={`flex flex-col h-full overflow-hidden border-r border-gray-200 pr-4 sm:pr-6 ${selectedTest.pdfUrl ? 'lg:col-span-9' : ''}`}>
            <div className="mb-4 shrink-0">
              <ListeningPlayer 
                key={selectedTest.isSectionMedia ? `section-${activeSectionIndex}` : selectedTest.id} 
                transcript={selectedTest.transcript} 
                audioUrl={currentAudioUrl} 
              />
            </div>

            {selectedTest.pdfUrl && (
              <div className="flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden relative">
                <iframe 
                  src={selectedTest.pdfUrl} 
                  className="absolute inset-0 w-full h-full"
                  title="Listening Test PDF"
                />
              </div>
            )}
          </div>
        )}
        
        <div className={`flex flex-col h-full overflow-hidden ${hasLeftPanel && selectedTest.pdfUrl ? 'lg:col-span-3' : ''}`}>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg shadow-sm mb-4 shrink-0">
             {selectedTest.sections.map((sec, idx) => (
               <button
                 key={idx}
                 onClick={() => setActiveSectionIndex(idx)}
                 className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                   activeSectionIndex === idx 
                     ? 'bg-white dark:bg-gray-800 text-blue-600 shadow' 
                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 Section {idx + 1}
               </button>
             ))}
          </div>
          {isSubmitted ? (
            <ListeningFeedback 
              sections={selectedTest.sections}
              userAnswers={userAnswers}
              transcript={selectedTest.transcript}
              onReset={handleReset}
            />
          ) : (
            <ListeningQuestions 
              sections={selectedTest.sections} 
              activeSectionIndex={activeSectionIndex}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default Listening;
