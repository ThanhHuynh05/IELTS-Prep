import { useState, useEffect } from 'react';
import { listeningTests as staticTests } from '../data/listeningTests';
import ListeningPlayer from '../components/listening/ListeningPlayer';
import ListeningQuestions from '../components/listening/ListeningQuestions';
import ListeningFeedback from '../components/listening/ListeningFeedback';
import TipsModal from '../components/common/TipsModal';

const LISTENING_TIPS = [
  "Read the questions during the short pauses BEFORE the recording begins.",
  "Underline keywords in the questions to know what to listen for.",
  "Be careful with spelling and grammar. If the answer requires a plural, a singular noun will be marked wrong.",
  "Do not leave any blank answers. There is no negative marking, so guess if you have to.",
  "Pay attention to synonyms and paraphrasing—the recording rarely uses the exact words from the question."
];

export default function Listening({ isMockMode, onMockSubmit }) {
  const [tests, setTests] = useState(staticTests);
  const [selectedTest, setSelectedTest] = useState(staticTests[0]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/content/listening');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTests([...staticTests, ...custom]);
          }
        }
      } catch (err) {
        console.error('Failed to load custom listening tests', err);
      }
    };
    fetchCustomTests();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (isMockMode) {
      window.speechSynthesis.cancel();
      const allQuestions = selectedTest.sections.flatMap(sec => sec.questions);
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

  if (isMockMode) {
    return (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
        <div className="flex flex-col border-r border-gray-200 pr-6">
          <ListeningPlayer key={selectedTest.id} transcript={selectedTest.transcript} />
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
              <li>You will only hear the audio <strong>once</strong>.</li>
              <li>Read the questions carefully before starting the audio.</li>
              <li>Answer the questions as you listen.</li>
            </ul>
          </div>
        </div>
        <div className="overflow-hidden">
          <ListeningQuestions 
            sections={selectedTest.sections} 
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
  };

  const handleTestSelect = (test) => {
    window.speechSynthesis.cancel();
    setSelectedTest(test);
    handleReset();
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-6 p-4 h-[calc(100vh-80px)] flex flex-col">
      <TipsModal 
        isOpen={showTips} 
        onClose={() => setShowTips(false)} 
        title="IELTS Listening Tips"
        tips={LISTENING_TIPS}
      />
      
      {/* Header and Test Selector */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Listening Practice</h1>
          <button 
            onClick={() => setShowTips(true)}
            className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            💡 Tips
          </button>
        </div>
        <div className="flex space-x-2">
          {tests.map((test, index) => (
            <button
              key={test.id}
              onClick={() => handleTestSelect(test)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTest.id === test.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {test.title.startsWith('Test') ? `Test ${index + 1}` : test.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* Left Side: Audio Player */}
        <div className="flex flex-col border-r border-gray-200 pr-6">
          <ListeningPlayer 
            key={selectedTest.id} // Re-mount when test changes to reset state
            transcript={selectedTest.transcript} 
          />
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
              <li>You will only hear the audio <strong>once</strong>.</li>
              <li>Read the questions carefully before starting the audio.</li>
              <li>Answer the questions as you listen.</li>
              <li>When you have answered all questions, click Submit.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Questions or Feedback */}
        <div className="overflow-hidden">
          {!isSubmitted ? (
            <ListeningQuestions 
              sections={selectedTest.sections} 
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <ListeningFeedback 
              sections={selectedTest.sections}
              userAnswers={userAnswers}
              transcript={selectedTest.transcript}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
