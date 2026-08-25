import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReadingPassage from '../components/reading/ReadingPassage';
import ReadingQuestions from '../components/reading/ReadingQuestions';
import ReadingFeedback from '../components/reading/ReadingFeedback';
import TipsModal from '../components/common/TipsModal';

const READING_TIPS = [
  "Skim the text quickly (2-3 minutes) before looking at the questions to get the main idea.",
  "Underline keywords in the questions and scan the text for synonyms.",
  "For True/False/Not Given: 'Not Given' means the information is impossible to verify from the text alone.",
  "Don't spend more than 1.5 minutes on a single question. Move on and come back later if needed.",
  "Be careful with spelling in short-answer questions. Exact matches are required."
];

const Reading = forwardRef(({ isMockMode, onMockSubmit }, ref) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activePassageIndex, setActivePassageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const res = await fetch('/api/content/reading');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTests(custom);
            setSelectedTest(custom[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load custom reading tests', err);
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
    // Get all questions from all passages
    const allQuestions = selectedTest.passages.flatMap(p => p.sections.flatMap(sec => sec.questions));
    
    if (isMockMode) {
      let correctCount = 0;
      allQuestions.forEach(q => {
        if ((userAnswers[q.id] || "").trim().toLowerCase() === q.answer.trim().toLowerCase()) {
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

  if (!selectedTest || !selectedTest.passages || selectedTest.passages.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reading Tests Available</h2>
          <p className="text-gray-600">Please add some reading tests in the Admin Panel.</p>
        </div>
      </div>
    );
  }

  const activePassage = selectedTest.passages[activePassageIndex];

  if (isMockMode) {
    return (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full relative">
        <ReadingPassage passage={activePassage} />
        <div className="flex flex-col h-full overflow-hidden">
          {/* Passage Navigation for Mock Mode */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg shadow-sm mb-4 shrink-0">
             {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePassageIndex(idx)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${
                    activePassageIndex === idx 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Passage {idx + 1}
                </button>
              ))}
          </div>
          
          <ReadingQuestions 
            sections={activePassage.sections} 
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
    setActivePassageIndex(0);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    handleReset();
  };

  return (
    <div className="w-full px-4 md:px-8 pb-6 h-[calc(100vh-80px)] flex flex-col">
      <TipsModal 
        isOpen={showTips} 
        onClose={() => setShowTips(false)} 
        title="IELTS Reading Tips"
        tips={READING_TIPS}
      />
      {/* Header and Topic Selector */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reading Practice</h1>
          <button 
            onClick={() => setShowTips(true)}
            className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            💡 Tips
          </button>
        </div>
        <div className="flex space-x-2">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => handleTestSelect(test)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTest.id === test.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {test.title}
            </button>
          ))}
        </div>
      </div>
      {/* Split Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200" style={{ minHeight: '82vh' }}>
        
        {/* Left Side: Passage text */}
        <div className="lg:col-span-9 h-full overflow-hidden flex flex-col">
          <ReadingPassage passage={activePassage} testPdfUrl={selectedTest?.pdfUrl} />
        </div>

        {/* Right Side: Questions */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col border-l border-gray-100 pl-4 lg:pl-6">
          {/* Passage Navigation for normal mode */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg shadow-sm mb-4 shrink-0">
             {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePassageIndex(idx)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${
                    activePassageIndex === idx 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Passage {idx + 1}
                </button>
              ))}
          </div>

          {!isSubmitted ? (
            <ReadingQuestions 
              sections={activePassage.sections} 
              allTestQuestions={selectedTest.passages.flatMap(p => p.sections.flatMap(s => s.questions))}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
              <h2 className="text-xl font-bold mb-4">Test Feedback</h2>
              <ReadingFeedback 
                sections={selectedTest.passages.flatMap(p => p.sections)}
                userAnswers={userAnswers}
                onReset={handleReset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Reading;
