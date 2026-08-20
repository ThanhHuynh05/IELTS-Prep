import { useState, useEffect } from 'react';
import { passages as staticPassages } from '../data/readingPassages';
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

export default function Reading({ isMockMode, onMockSubmit }) {
  const [passages, setPassages] = useState(staticPassages);
  const [selectedPassage, setSelectedPassage] = useState(staticPassages[0]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchCustomPassages = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/content/reading');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setPassages([...staticPassages, ...custom]);
          }
        }
      } catch (err) {
        console.error('Failed to load custom reading passages', err);
      }
    };
    fetchCustomPassages();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (isMockMode) {
      // Calculate score and pass it up immediately
      const allQuestions = selectedPassage.sections.flatMap(sec => sec.questions);
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

  // If in mock mode, we want a unified height if possible, or just the same layout without the header
  if (isMockMode) {
    return (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
        <ReadingPassage passage={selectedPassage} />
        <ReadingQuestions 
          sections={selectedPassage.sections} 
          userAnswers={userAnswers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handlePassageSelect = (passage) => {
    setSelectedPassage(passage);
    handleReset();
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-6 p-4 h-[calc(100vh-80px)] flex flex-col">
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
          {passages.map((passage, index) => (
            <button
              key={passage.id}
              onClick={() => handlePassageSelect(passage)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPassage.id === passage.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Passage {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* Left Side: Passage text */}
        <ReadingPassage passage={selectedPassage} />

        {/* Right Side: Questions or Feedback */}
        {!isSubmitted ? (
          <ReadingQuestions 
            sections={selectedPassage.sections} 
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
          />
        ) : (
          <ReadingFeedback 
            sections={selectedPassage.sections}
            userAnswers={userAnswers}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
