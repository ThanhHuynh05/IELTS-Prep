import { useState, useEffect } from 'react';
import WritingQuestion from '../components/writing/WritingQuestion';
import WritingEditor from '../components/writing/WritingEditor';
import WritingFeedback from '../components/writing/WritingFeedback';
import { gradeWriting } from '../services/groqApi';
import TipsModal from '../components/common/TipsModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const STANDARD_TEST = {
  id: 'standard-writ',
  title: 'Standard Practice',
  task1: "The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.",
  task2: "Some people believe that unpaid community service should be a compulsory part of high school programs (for example working for a charity, improving the neighbourhood or teaching sports to younger children).\n\nTo what extent do you agree or disagree?"
};

const WRITING_TIPS = [
  "Task 1 (Academic): Spend about 20 minutes on this task. Ensure you write at least 150 words.",
  "Task 1 (Academic): Always include a clear overview paragraph highlighting the main trends.",
  "Task 2: Spend about 40 minutes on this task. Ensure you write at least 250 words.",
  "Task 2: Spend 5 minutes planning your essay structure before you start writing.",
  "Use a variety of complex sentence structures to score higher in Grammatical Range."
];

export default function Writing({ isMockMode, onMockSubmit }) {
  const [tests, setTests] = useState([STANDARD_TEST]);
  const [selectedTest, setSelectedTest] = useState(STANDARD_TEST);
  const [taskType, setTaskType] = useState('task2');
  const [task2Question, setTask2Question] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [submittedEssay, setSubmittedEssay] = useState('');
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/content/writing');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTests([STANDARD_TEST, ...custom]);
          }
        }
      } catch (err) {
        console.error('Failed to load custom writing tests', err);
      }
    };
    fetchCustomTests();
  }, []);

  const handleTestSelect = (e) => {
    const test = tests.find(t => t.id === e.target.value);
    setSelectedTest(test);
    setTask2Question(test.task2);
    setFeedback(null);
    setError(null);
  };

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
            <select 
              value={selectedTest.id}
              onChange={handleTestSelect}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tests.map(test => (
                <option key={test.id} value={test.id}>{test.title}</option>
              ))}
            </select>
            
            {!feedback && !isGrading && (
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
                <button 
                  onClick={() => setTaskType('task1')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskType === 'task1' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Task 1
                </button>
                <button 
                  onClick={() => setTaskType('task2')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskType === 'task2' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Task 2
                </button>
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
            <WritingQuestion taskType={taskType} question={currentQuestion} />
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
          />
        </>
      ) : (
        <WritingFeedback feedback={feedback} onReset={handleReset} originalEssay={submittedEssay} />
      )}
    </div>
  );
}
