import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import SpeakingPrompt from '../components/speaking/SpeakingPrompt';
import AudioRecorder from '../components/speaking/AudioRecorder';
import SpeakingFeedback from '../components/speaking/SpeakingFeedback';
import { gradeSpeaking } from '../services/groqApi';
import { CheckCircle2, Clock, SkipForward, Loader2 } from 'lucide-react';
import TipsModal from '../components/common/TipsModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const SPEAKING_TIPS = [
  "Part 1: Give short but complete answers (2-3 sentences).",
  "Part 2: Use the full 1 minute prep time. Speak until the examiner stops you (aim for 2 minutes).",
  "Part 3: Give detailed, extended answers with examples. Avoid simple yes/no answers.",
  "Fluency is more important than using 'big words' incorrectly.",
  "If you make a mistake, quickly correct yourself and keep going."
];

const Speaking = forwardRef(({ isMockMode, onMockSubmit }, ref) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedFilterPart, setSelectedFilterPart] = useState(1);
  const [taskPart, setTaskPart] = useState('part1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState(isMockMode || false);
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [submittedTranscript, setSubmittedTranscript] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [prepPhase, setPrepPhase] = useState('prep');
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    forceSubmit: () => {
      if (currentTranscript.trim()) {
        handleSubmit(currentTranscript);
      } else {
        if (onMockSubmit) onMockSubmit({ estimatedBand: 0, rawScore: 0, maxScore: 40 });
      }
    }
  }));

  useEffect(() => {
    if (taskPart === 'part2') {
      setPrepPhase('prep');
      setPrepSeconds(60);
    } else {
      setPrepPhase('recording');
    }
  }, [taskPart, currentQuestionIndex, practiceMode]);

  useEffect(() => {
    let interval = null;
    if (practiceMode && !feedback && taskPart === 'part2' && prepPhase === 'prep') {
      interval = setInterval(() => {
        setPrepSeconds(prev => {
          if (prev <= 1) {
            setPrepPhase('recording');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceMode, feedback, taskPart, prepPhase]);

  useEffect(() => {
    const fetchCustomTopics = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/content/speaking');
        if (res.ok) {
          const custom = await res.json();
          if (custom.length > 0) {
            setTopics(custom);
          }
        }
      } catch (err) {
        console.error('Failed to load custom speaking topics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomTopics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!selectedTopic) {
    if (!topics || topics.length === 0) {
      return (
        <div className="max-w-[1400px] mx-auto p-8 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Speaking Topics Available</h2>
            <p className="text-gray-600">Please add some speaking topics in the Admin Panel.</p>
          </div>
        </div>
      );
    }
    
    const filteredTopics = topics.filter(t => t.part === selectedFilterPart || (!t.part && (
      (selectedFilterPart === 1 && t.part1?.length > 0) ||
      (selectedFilterPart === 2 && t.part2) ||
      (selectedFilterPart === 3 && t.part3?.length > 0)
    )));

    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 animate-in fade-in">
        {/* Top Header Filter */}
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
          {[1, 2, 3].map(p => (
            <button
              key={p}
              onClick={() => setSelectedFilterPart(p)}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                selectedFilterPart === p 
                  ? 'border-purple-600 text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Luyện Part {p}
            </button>
          ))}
          <div className="ml-auto flex gap-4">
             <button
               onClick={() => {
                 const part1s = topics.filter(t => t.part === 1 || t.part1?.length > 0);
                 const part2s = topics.filter(t => t.part === 2 || t.part2);
                 const part3s = topics.filter(t => t.part === 3 || t.part3?.length > 0);

                 if (part1s.length === 0 || part2s.length === 0 || part3s.length === 0) {
                   alert("Not enough topics to generate a full exam! Please add at least one Part 1, 2, and 3.");
                   return;
                 }

                 const randomPart1 = part1s[Math.floor(Math.random() * part1s.length)];
                 const randomPart2 = part2s[Math.floor(Math.random() * part2s.length)];
                 const randomPart3 = part3s[Math.floor(Math.random() * part3s.length)];

                 const generatedExam = {
                   id: `random-exam-${Date.now()}`,
                   title: "Random Full Exam",
                   part1: randomPart1.questions || randomPart1.part1,
                   part2: randomPart2.prompt || randomPart2.part2,
                   part3: randomPart3.questions || randomPart3.part3
                 };

                 setSelectedTopic(generatedExam);
                 setTaskPart('part1');
               }}
               className="px-6 py-2 rounded-full border border-pink-500 bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
             >
               🎲 Random Full Exam
             </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 shrink-0 hidden md:block">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Forecast</h3>
            <div className="space-y-2">
              {filteredTopics.map((t, index) => (
                <a 
                  key={t.id || index}
                  href={`#topic-${t.id}`}
                  className="block px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 transition-colors truncate"
                >
                  {t.title || `Test ${index + 1}`}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
            {filteredTopics.map((t, index) => {
              const questions = selectedFilterPart === 1 
                ? (t.questions || t.part1 || []) 
                : selectedFilterPart === 3 
                  ? (t.questions || t.part3 || [])
                  : (t.prompt || t.part2 ? [t.prompt || t.part2] : []);
              
              return (
                <div id={`topic-${t.id}`} key={t.id || index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden scroll-mt-6">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.title || `Test ${index + 1}`}</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {questions.map((q, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col min-h-[80px]">
                          <p className="text-gray-800 dark:text-gray-200">{q}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button 
                        onClick={() => {
                          const mockTopic = {
                            id: t.id,
                            title: `Part ${selectedFilterPart}: ${t.title}`,
                            part1: selectedFilterPart === 1 ? questions : [],
                            part2: selectedFilterPart === 2 ? questions[0] : '',
                            part3: selectedFilterPart === 3 ? questions : []
                          };
                          setSelectedTopic(mockTopic);
                          setTaskPart(`part${selectedFilterPart}`);
                        }}
                        className="px-6 py-2 rounded-full border border-pink-500 text-pink-500 font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center gap-2"
                      >
                        <span className="text-lg">▶</span> Luyện topic này
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredTopics.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No topics found for Part {selectedFilterPart}.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentPrompt = taskPart === 'part2' ? selectedTopic.part2 : selectedTopic[taskPart][currentQuestionIndex];

  const handleSubmit = async (transcript) => {
    setIsGrading(true);
    setError(null);
    setSubmittedTranscript(transcript);
    try {
      const result = await gradeSpeaking(taskPart, currentPrompt, transcript);
      if (isMockMode && onMockSubmit) {
        onMockSubmit({ estimatedBand: result.overallBand, criteria: result.criteria });
      } else {
        setFeedback(result);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to grade the speech. Please check your API key and try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleReset = () => {
    setFeedback(null);
    setSubmittedTranscript('');
    setPracticeMode(false);
  };


  return (
    <div className="max-w-7xl mx-auto pb-12 p-8 flex h-[calc(100vh-80px)]">
      {/* Sidebar - Topic Selector */}
      {!isMockMode && (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 pr-6 overflow-y-auto">
          <button
            onClick={() => {
              setSelectedTopic(null);
              setFeedback(null);
            }}
            className="w-full mb-6 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Tests
          </button>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Forecast Topics</h2>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => {
                    setSelectedTopic(topic);
                    setPracticeMode(false);
                    setFeedback(null);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTopic.id === topic.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                  }`}
                >
                  {topic.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 pl-8 overflow-y-auto">
        <TipsModal 
          isOpen={showTips} 
          onClose={() => setShowTips(false)} 
          title="IELTS Speaking Tips"
          tips={SPEAKING_TIPS}
        />
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {practiceMode ? 'Speaking Practice' : `Topic: ${selectedTopic.title}`}
            </h1>
            {!isMockMode && (
              <button 
                onClick={() => setShowTips(true)}
                className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                💡 Tips
              </button>
            )}
          </div>
          {(!feedback && practiceMode && !isMockMode && !isGrading) && (
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
              {selectedTopic.part1 && selectedTopic.part1.length > 0 && (
                <button 
                  onClick={() => { setTaskPart('part1'); setCurrentQuestionIndex(0); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskPart === 'part1' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Part 1
                </button>
              )}
              {selectedTopic.part2 && (
                <button 
                  onClick={() => { setTaskPart('part2'); setCurrentQuestionIndex(0); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskPart === 'part2' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Part 2
                </button>
              )}
              {selectedTopic.part3 && selectedTopic.part3.length > 0 && (
                <button 
                  onClick={() => { setTaskPart('part3'); setCurrentQuestionIndex(0); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${taskPart === 'part3' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Part 3
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 border border-red-200 dark:border-red-800 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => handleSubmit(submittedTranscript)}
              className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded hover:bg-red-200 transition-colors font-medium text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {isGrading ? (
          <div className="mt-8 max-w-3xl">
            <LoadingSkeleton text="Grading your speech..." />
          </div>
        ) : !practiceMode ? (
          /* Topic Preview View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8 border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Part 1</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTopic.part1.map((q, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700">{q}</div>
                ))}
              </div>
            </div>
            
            <div className="mb-8 border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Part 2</h2>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-blue-900 font-medium">
                {selectedTopic.part2}
              </div>
            </div>

            <div className="mb-8 pb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Part 3</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTopic.part3.map((q, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700">{q}</div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button 
                onClick={() => {
                  setPracticeMode(true);
                  setCurrentQuestionIndex(0);
                }}
                className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-transform transform hover:scale-105 flex items-center border border-fuchsia-600"
              >
                <CheckCircle2 className="mr-2" size={20} />
                Practice this topic
              </button>
            </div>
          </div>
        ) : !feedback ? (
          /* Practice View */
          <div className="max-w-3xl">
            <button 
              onClick={() => setPracticeMode(false)}
              className="mb-6 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
            >
              ← Back to Topic Preview
            </button>
            
            {taskPart !== 'part2' && (
              <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded border">
                 <button 
                   onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                   disabled={currentQuestionIndex === 0}
                   aria-label="Previous question"
                   className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1 rounded disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
                 >
                   &larr; Previous
                 </button>
                 <span className="text-sm font-medium text-gray-600">
                   Question {currentQuestionIndex + 1} of {selectedTopic[taskPart].length}
                 </span>
                 <button 
                   onClick={() => setCurrentQuestionIndex(p => Math.min(selectedTopic[taskPart].length - 1, p + 1))}
                   disabled={currentQuestionIndex === selectedTopic[taskPart].length - 1}
                   aria-label="Next question"
                   className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1 rounded disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
                 >
                   Next &rarr;
                 </button>
              </div>
            )}

            <SpeakingPrompt taskPart={taskPart} prompt={currentPrompt} />
            
            {taskPart === 'part2' && prepPhase === 'prep' ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border mb-6 flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Preparation Time</h3>
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                  <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle 
                      cx="64" cy="64" r="60" 
                      stroke="#3B82F6" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="377" 
                      strokeDashoffset={377 - (377 * prepSeconds) / 60}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center z-10">
                    <Clock size={24} className="text-blue-600 mb-1" />
                    <span className="text-2xl font-bold text-gray-900">{prepSeconds}s</span>
                  </div>
                </div>
                <button 
                  onClick={() => setPrepPhase('recording')}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Skip Prep Time <SkipForward size={16} className="ml-1" />
                </button>
              </div>
            ) : (
              <AudioRecorder 
                isGrading={isGrading}
                onSubmit={handleSubmit}
                onContentChange={setCurrentTranscript}
              />
            )}
          </div>
        ) : (
          /* Feedback View */
          <div className="max-w-3xl">
             <button 
              onClick={() => {
                setFeedback(null);
                setSubmittedTranscript('');
              }}
              className="mb-6 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
            >
              ← Back to Current Question
            </button>
            <SpeakingFeedback 
              feedback={feedback} 
              onReset={handleReset} 
              originalTranscript={submittedTranscript}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default Speaking;
