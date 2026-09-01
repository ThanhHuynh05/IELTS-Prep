import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import WritingQuestion from '../components/writing/WritingQuestion';
import WritingEditor from '../components/writing/WritingEditor';
import WritingFeedback from '../components/writing/WritingFeedback';
import { gradeWriting } from '../services/groqApi';
import TipsModal from '../components/common/TipsModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Loader2 } from 'lucide-react';


const WRITING_TIPS = [
  "Task 1 (Academic): Spend about 20 minutes on this task. Ensure you write at least 150 words.",
  "Task 1 (Academic): Always include a clear overview paragraph highlighting the main trends.",
  "Task 2: Spend about 40 minutes on this task. Ensure you write at least 250 words.",
  "Task 2: Spend 5 minutes planning your essay structure before you start writing.",
  "Use a variety of complex sentence structures to score higher in Grammatical Range."
];

const Writing = forwardRef(({ isMockMode, onMockSubmit }, ref) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(() => {
    const saved = sessionStorage.getItem('writing_selectedTest');
    return saved ? JSON.parse(saved) : null;
  });
  const [taskType, setTaskType] = useState(() => {
    return sessionStorage.getItem('writing_taskType') || 'task2';
  });
  const [task2Question, setTask2Question] = useState(() => {
    return sessionStorage.getItem('writing_task2Question') || '';
  });
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [submittedEssay, setSubmittedEssay] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [currentEssay, setCurrentEssay] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useImperativeHandle(ref, () => ({
    forceSubmit: () => {
      if (currentEssay.trim()) {
        handleSubmit(currentEssay);
      } else {
        if (onMockSubmit) onMockSubmit({ estimatedBand: 0, rawScore: 0, maxScore: 40 });
      }
    }
  }));

  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/content/writing');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTests(custom);
          }
        }
      } catch (err) {
        console.error('Failed to load custom writing tests', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomTests();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedTest) {
        setSelectedTest(null);
        setFeedback(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedTest]);

  useEffect(() => {
    if (selectedTest) {
      sessionStorage.setItem('writing_selectedTest', JSON.stringify(selectedTest));
    } else {
      sessionStorage.removeItem('writing_selectedTest');
    }
    sessionStorage.setItem('writing_taskType', taskType);
    sessionStorage.setItem('writing_task2Question', task2Question);
  }, [selectedTest, taskType, task2Question]);

  useEffect(() => {
    // Cleanup on component unmount (e.g. user navigates to another tab)
    // This will NOT run on F5 refresh, which perfectly preserves state for refresh!
    return () => {
      sessionStorage.removeItem('writing_selectedTest');
      sessionStorage.removeItem('writing_taskType');
      sessionStorage.removeItem('writing_task2Question');
    };
  }, []);

  const handleTestSelect = (e) => {
    const test = tests.find(t => t.id === e.target.value);
    setSelectedTest(test);
    setTask2Question(test.task2 || '');
    setTaskType(test.type === 'task2' ? 'task2' : 'task1');
    setFeedback(null);
    setError(null);
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
      <div className="w-full max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Writing Practice</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Select a test to begin your practice.</p>
        
        {/* Filter Radio Buttons */}
        <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilterType('task1')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'task1' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Task 1
          </button>
          <button
            onClick={() => setFilterType('task2')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'task2' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Task 2
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filterType === 'all' || filterType === 'task2') && (
            <div 
            onClick={() => {
              setSelectedTest({ id: 'custom-test', title: 'Custom Practice', task1: '', task2: '' });
              setTask2Question('');
              setTaskType('task2');
              window.history.pushState({ practiceActive: true }, '', window.location.pathname);
            }}
            className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-orange-500 hover:ring-1 hover:ring-orange-500 group flex flex-col h-full"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 group-hover:text-orange-600 transition-colors mb-2 flex items-center gap-2">
                ✍️ Custom Practice
              </h3>
              <p className="text-sm text-orange-700/80 dark:text-orange-200/80 mb-4 line-clamp-3">
                Have your own essay question? Paste it here and get instant AI feedback on your writing without saving it to the database.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/50 flex justify-between items-center text-sm font-medium text-orange-600 dark:text-orange-400">
              <span>Write now</span>
              <span>→</span>
            </div>
          </div>
          )}
          
          {tests.filter(test => filterType === 'all' || test.type === filterType || test.type === 'both').map((test, index) => (
            <div 
              key={test.id || index}
              onClick={() => {
                setSelectedTest(test);
                setTask2Question(test.task2 || '');
                setTaskType(test.type === 'task2' ? 'task2' : 'task1');
                window.history.pushState({ practiceActive: true }, '', window.location.pathname);
              }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-orange-500 hover:ring-1 hover:ring-orange-500 group flex flex-col h-full"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 transition-colors mb-2">
                  {test.title || `Test ${index + 1}`}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                  {test.type === 'task1' ? 'Task 1 prompt included.' : test.type === 'task2' ? 'Task 2 prompt included.' : 'Task 1 and Task 2 prompts included.'} Get AI feedback on your writing.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-medium text-orange-600 dark:text-orange-400">
                <span>Start Test</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = taskType === 'task1' ? selectedTest.task1 : (task2Question || selectedTest.task2);

  const handleSubmit = async (essay) => {
    if (taskType === 'task2' && !currentQuestion.trim()) {
      setError("Please enter a question/prompt for Task 2.");
      return;
    }
    
    setIsGrading(true);
    setError(null);
    setSubmittedEssay(essay);
    try {
      const result = await gradeWriting(taskType, currentQuestion, essay);
      if (isMockMode && onMockSubmit) {
        onMockSubmit({ estimatedBand: result.overallBand, criteria: result.criteria });
      } else {
        setFeedback(result);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to grade the essay. Please check your API key and try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleReset = () => {
    setFeedback(null);
  };


  return (
    <div className="max-w-4xl mx-auto pb-12 p-4">
      <TipsModal 
        isOpen={showTips} 
        onClose={() => setShowTips(false)} 
        title="IELTS Writing Tips"
        tips={WRITING_TIPS}
      />
      
      {!isMockMode && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Writing Practice</h1>
            <button 
              onClick={() => setShowTips(true)}
              className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              💡 Tips
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (window.history.state?.practiceActive) {
                  window.history.back();
                } else {
                  setSelectedTest(null);
                  setFeedback(null);
                  sessionStorage.removeItem('writing_selectedTest');
                }
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ← Back to Tests
            </button>
            
            {!feedback && !isGrading && (
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
                {selectedTest?.id !== 'custom-test' && selectedTest?.type !== 'task2' && (
                  <button 
                    onClick={() => setTaskType('task1')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskType === 'task1' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Task 1
                  </button>
                )}
                {selectedTest?.type !== 'task1' && (
                  <button 
                    onClick={() => setTaskType('task2')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskType === 'task2' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Task 2
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 border border-red-200 dark:border-red-800 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => handleSubmit(submittedEssay)}
            className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded hover:bg-red-200 transition-colors font-medium text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {isGrading ? (
        <div className="mt-8">
          <LoadingSkeleton text="Grading your essay..." />
        </div>
      ) : !feedback ? (
        <>
          {taskType === 'task1' ? (
            <WritingQuestion taskType={taskType} question={currentQuestion} task1Image={selectedTest.task1Image} />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 transition-colors">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Task 2</h2>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type or paste the essay question:
              </label>
              <textarea
                value={task2Question}
                onChange={(e) => setTask2Question(e.target.value)}
                placeholder="e.g. Some people believe that unpaid community service should be a compulsory part of high school programs..."
                className="w-full h-24 p-3 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>
          )}
          
          <WritingEditor 
            taskType={taskType} 
            onSubmit={handleSubmit} 
            isGrading={isGrading} 
            onContentChange={setCurrentEssay}
          />
        </>
      ) : (
        <WritingFeedback feedback={feedback} onReset={handleReset} originalEssay={submittedEssay} />
      )}
    </div>
  );
});

export default Writing;
