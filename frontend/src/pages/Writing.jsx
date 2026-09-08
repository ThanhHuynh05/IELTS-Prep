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
  const [filterType, setFilterType] = useState('task1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChartTypes, setSelectedChartTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEssayTypes, setSelectedEssayTypes] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedChartTypes, selectedEssayTypes, selectedTopics, filterType]);

  const CHART_TYPES = ['Bar chart', 'Line', 'Table', 'Map', 'Pie Chart', 'Process', 'Mixed'];
  
  const ESSAY_TYPES = [
    'Agree & disagree',
    'Discuss both views',
    'Advantages & Disadvantages',
    'Two-part questions',
    'Problems-causes-solutions'
  ];

  const TOPICS = [
    'Education', 'Lifestyle', 'Work', 'Entertainment', 'Environment',
    'Technology', 'Social issues', 'Crime', 'Government', 'Advertisement',
    'Sport', 'Transport', 'Food & Drinks', 'Business', 'Health',
    'Science & Energy', 'Tourism', 'Family', 'Architecture', 'History',
    'Art', 'Economics', 'Plant & Animals'
  ];

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

    
    const filteredTests = tests.filter(test => {
      if (searchQuery && !test.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedChartTypes.length > 0) {
        const titleMatch = selectedChartTypes.some(type => {
          let keyword = type.split(' ')[0];
          if (keyword.includes('/')) {
            keyword = keyword.split('/')[0]; // Use just "Mixed" or first word for multiple
          }
          const safeType = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${safeType}\\b`, 'i');
          return regex.test(test.title);
        });
        if (!titleMatch) return false;
      }
      if (selectedEssayTypes.length > 0) {
        const typeMatch = selectedEssayTypes.some(type => {
          const questionText = (test.task2 || '').toLowerCase();
          
          if (type === 'Agree & disagree') {
            return questionText.includes('agree') || questionText.includes('disagree') || questionText.includes('opinion');
          }
          if (type === 'Discuss both views') {
            return questionText.includes('discuss both') || questionText.includes('both views');
          }
          if (type === 'Advantages & Disadvantages') {
            return questionText.includes('advantage') || questionText.includes('disadvantage') || questionText.includes('positive') || questionText.includes('negative') || questionText.includes('outweigh');
          }
          if (type === 'Problems-causes-solutions') {
            return questionText.includes('problem') || questionText.includes('cause') || questionText.includes('solution') || questionText.includes('reason') || questionText.includes('measure');
          }
          if (type === 'Two-part questions') {
            // Check if there are multiple question marks
            const questionMarks = (questionText.match(/\?/g) || []).length;
            return questionMarks >= 2;
          }
          
          return questionText.includes(type.toLowerCase());
        });
        if (!typeMatch) return false;
      }
      if (selectedTopics.length > 0) {
        const titleMatch = selectedTopics.some(topic => test.title?.toLowerCase().includes(topic.toLowerCase()));
        if (!titleMatch) return false;
      }
      if (filterType === 'custom') return false;
      if (filterType !== 'all' && test.type !== filterType && test.type !== 'both') return false;
      return true;
    });

    const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Writing Topics</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
            </div>
            
            {/* Filter */}
            {filterType !== 'custom' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filter</h3>
                
                {filterType === 'task1' && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Chart Type</p>
                    <div className="space-y-3">
                      {CHART_TYPES.map(type => (
                        <label key={type} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">{type}</span>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            checked={selectedChartTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedChartTypes([...selectedChartTypes, type]);
                              } else {
                                setSelectedChartTypes(selectedChartTypes.filter(t => t !== type));
                              }
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterType === 'task2' && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Essay Type</p>
                      <div className="space-y-3">
                        {ESSAY_TYPES.map(type => (
                          <label key={type} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">{type}</span>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              checked={selectedEssayTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEssayTypes([...selectedEssayTypes, type]);
                                } else {
                                  setSelectedEssayTypes(selectedEssayTypes.filter(t => t !== type));
                                }
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Topic ({TOPICS.length})</p>
                      <div className="space-y-3">
                        {(showAllTopics ? TOPICS : TOPICS.slice(0, 5)).map(topic => (
                          <label key={topic} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">{topic}</span>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              checked={selectedTopics.includes(topic)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTopics([...selectedTopics, topic]);
                                } else {
                                  setSelectedTopics(selectedTopics.filter(t => t !== topic));
                                }
                              }}
                            />
                          </label>
                        ))}
                      </div>
                      {TOPICS.length > 5 && (
                        <button 
                          className="mt-3 text-sm text-blue-600 font-medium hover:underline block"
                          onClick={() => setShowAllTopics(!showAllTopics)}
                        >
                          {showAllTopics ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                  </>
                )}

                <button 
                  className="mt-6 text-sm text-blue-600 font-medium hover:underline w-full text-center block pt-4 border-t border-gray-100 dark:border-gray-700"
                  onClick={() => {
                    setSelectedChartTypes([]);
                    setSelectedEssayTypes([]);
                    setSelectedTopics([]);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Main List */}
          <div className="flex-1 space-y-4">
            {/* Filter Radio Buttons */}
            <div className="flex space-x-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit shadow-sm">
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
              <button
                onClick={() => setFilterType('custom')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'custom' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Custom
              </button>
            </div>

            {filterType === 'custom' && (
              <div 
                onClick={() => {
                  setSelectedTest({ id: 'custom-test', title: 'Custom Practice', task1: '', task2: '' });
                  setTask2Question('');
                  setTaskType('task2');
                  window.history.pushState({ practiceActive: true }, '', window.location.pathname);
                }}
                className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-orange-500 hover:ring-1 hover:ring-orange-500 flex flex-col sm:flex-row overflow-hidden"
              >
                <div className="sm:w-64 bg-orange-100/50 dark:bg-orange-800/30 flex items-center justify-center p-4">
                  <span className="text-4xl">✍️</span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-orange-500 dark:text-orange-400 mb-2">Custom</div>
                  <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-2">
                    Custom Practice
                  </h3>
                  <p className="text-sm text-orange-700/80 dark:text-orange-200/80 line-clamp-2">
                    Have your own essay question? Paste it here and get instant AI feedback on your writing without saving it to the database.
                  </p>
                </div>
              </div>
            )}
            
            {currentTests.map((test, index) => (
              <div 
                key={test.id || index}
                onClick={() => {
                  setSelectedTest(test);
                  setTask2Question(test.task2 || '');
                  setTaskType(test.type === 'task2' ? 'task2' : 'task1');
                  window.history.pushState({ practiceActive: true }, '', window.location.pathname);
                }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-orange-500 hover:ring-1 hover:ring-orange-500 flex flex-col sm:flex-row overflow-hidden"
              >
                {test.type !== 'task2' && (
                  <div className="sm:w-64 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center p-4 min-h-[160px]">
                    {test.task1Image ? (
                      <img src={test.task1Image} alt={test.title} className="max-h-32 object-contain" />
                    ) : (
                      <div className="text-blue-400 dark:text-blue-600 font-medium">No Image</div>
                    )}
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {test.type === 'task1' ? 'Task 1' : test.type === 'task2' ? 'Task 2' : 'Task 1 & 2'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {test.title || `Test ${startIndex + index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {test.task1 ? test.task1 : (test.type === 'task1' ? 'Task 1 question included.' : test.type === 'task2' ? 'Task 2 question included.' : 'Task 1 and Task 2 questions included.')}
                  </p>
                </div>
              </div>
            ))}
            
            {filteredTests.length === 0 && filterType !== 'custom' && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No tests found matching your criteria.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8 pb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium px-4">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = taskType === 'task1' ? selectedTest.task1 : (task2Question || selectedTest.task2);

  const handleSubmit = async (essay) => {
    if (taskType === 'task2' && !currentQuestion.trim()) {
      setError("Please enter a question for Task 2.");
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
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 md:space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Writing Practice</h1>
            <button 
              onClick={() => setShowTips(true)}
              className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              💡 Tips
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:space-x-4">
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
