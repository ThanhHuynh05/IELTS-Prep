import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ListeningPlayer from '../components/listening/ListeningPlayer';
import ListeningQuestions from '../components/listening/ListeningQuestions';
import ListeningFeedback from '../components/listening/ListeningFeedback';
import TipsModal from '../components/common/TipsModal';
import { Loader2 } from 'lucide-react';

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);
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
            setSelectedTest(custom[0]);
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
      <div className={`flex-1 grid grid-cols-1 ${selectedTest.pdfUrl ? 'lg:grid-cols-12' : 'lg:grid-cols-[1fr_2fr]'} gap-6 overflow-hidden bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 h-full`}>
        <div className={`flex flex-col border-r border-gray-200 pr-4 sm:pr-6 ${selectedTest.pdfUrl ? 'lg:col-span-9 h-full' : ''}`}>
          <ListeningPlayer key={selectedTest.id} transcript={selectedTest.transcript} />
          <div className="mt-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shrink-0">
            <h4 className="font-bold text-yellow-800 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
              <li>You will only hear the audio <strong>once</strong>.</li>
              <li>Read the questions carefully before starting the audio.</li>
              <li>Answer the questions as you listen.</li>
            </ul>
          </div>
          {selectedTest.pdfUrl && (
            <div className="flex-1 min-h-[400px] border border-gray-200 rounded-lg overflow-hidden relative">
              <iframe 
                src={`${selectedTest.pdfUrl}#toolbar=0`} 
                className="absolute inset-0 w-full h-full"
                title="Listening Test PDF"
              />
            </div>
          )}
        </div>
        <div className={`overflow-hidden flex flex-col ${selectedTest.pdfUrl ? 'lg:col-span-3 h-full custom-scrollbar overflow-y-auto' : ''}`}>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Listening Tests Available</h2>
          <p className="text-gray-600">Please add some tests in the Admin Panel.</p>
        </div>
      </div>
    );
  }

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
      <div className={`flex-1 grid grid-cols-1 ${selectedTest.pdfUrl ? 'lg:grid-cols-12' : 'lg:grid-cols-[1fr_2fr]'} gap-6 overflow-hidden bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200`}>
        
        {/* Left Side: Audio Player & PDF */}
        <div className={`flex flex-col border-r border-gray-200 pr-4 sm:pr-6 ${selectedTest.pdfUrl ? 'lg:col-span-9 h-full' : ''}`}>
          <ListeningPlayer 
            key={selectedTest.id}
            transcript={selectedTest.transcript} 
            audioUrl={selectedTest.audioUrl}
          />
          
          <div className="mt-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shrink-0">
            <h4 className="font-bold text-yellow-800 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
              <li>You will only hear the audio <strong>once</strong>.</li>
              <li>Read the questions carefully before starting the audio.</li>
              <li>Answer the questions as you listen.</li>
              <li>When you have answered all questions, click Submit.</li>
            </ul>
          </div>

          {selectedTest.pdfUrl && (
            <div className="flex-1 min-h-[400px] border border-gray-200 rounded-lg overflow-hidden relative">
              <iframe 
                src={`${selectedTest.pdfUrl}#toolbar=0`} 
                className="absolute inset-0 w-full h-full"
                title="Listening Test PDF"
              />
            </div>
          )}
        </div>

        {/* Right Side: Questions or Feedback */}
        <div className={`overflow-hidden flex flex-col ${selectedTest.pdfUrl ? 'lg:col-span-3 h-full custom-scrollbar overflow-y-auto' : ''}`}>
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
});

export default Listening;
