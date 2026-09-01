import { useState, useEffect } from 'react';
import { getResults } from '../utils/storage';
import { BookOpen, Headphones, PenTool, Mic, History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const [activeTab, setActiveTab] = useState('reading');
  const [results, setResults] = useState({
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const [read, listen, write, speak] = await Promise.all([
        getResults('reading'),
        getResults('listening'),
        getResults('writing'),
        getResults('speaking')
      ]);
      setResults({
        reading: read,
        listening: listen,
        writing: write,
        speaking: speak
      });
    };
    fetchHistory();
  }, []);

  const tabs = [
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/reading' },
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-100', link: '/listening' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', link: '/writing' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-pink-600', bg: 'bg-pink-100', link: '/speaking' }
  ];

  const currentResults = results[activeTab];
  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)]">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <HistoryIcon size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review your past attempts and feedback.</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
        {currentResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className={`p-4 rounded-full ${activeTabInfo.bg} dark:bg-opacity-20 mb-4`}>
              <activeTabInfo.icon size={32} className={`${activeTabInfo.color} dark:brightness-150`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTabInfo.label} attempts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't completed any practice tests for this section.</p>
            <Link 
              to={activeTabInfo.link}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start Practicing &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentResults.map((result, index) => {
              const date = new Date(result.date).toLocaleDateString(undefined, { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
              });
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{result.title || `${activeTabInfo.label} Practice`}</h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{date}</div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{Number(result.estimatedBand).toFixed(1)}</span>
                        <span className="text-sm font-medium text-gray-500">Band</span>
                      </div>
                    </div>
                  </div>
                  
                  {(activeTab === 'reading' || activeTab === 'listening') && result.rawScore !== undefined && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Score: <strong>{result.rawScore}</strong> / {result.maxScore}
                    </div>
                  )}

                  {(activeTab === 'reading' || activeTab === 'listening') && result.detailedResults && (
                    <details className="text-sm text-gray-600 dark:text-gray-300 group mt-3">
                      <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400 select-none flex items-center">
                        <span className="group-open:hidden">View detailed answers &darr;</span>
                        <span className="hidden group-open:inline">Hide detailed answers &uarr;</span>
                      </summary>
                      <div className="mt-3 space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto">
                        {result.detailedResults.map((q, qIndex) => (
                          <div key={q.id || qIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                            <div className="flex flex-col sm:w-1/2 pr-2">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Q{qIndex + 1}</span>
                              <span className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2" title={q.question}>{q.question}</span>
                            </div>
                            <div className="flex flex-col mt-2 sm:mt-0 sm:items-end">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 w-16 sm:w-auto text-left sm:text-right">You:</span>
                                <span className={`text-sm font-semibold truncate max-w-[120px] ${q.isCorrect ? 'text-green-600' : 'text-red-600 line-through'}`} title={q.userAnswer || '-'}>{q.userAnswer || '-'}</span>
                              </div>
                              {!q.isCorrect && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500 w-16 sm:w-auto text-left sm:text-right">Correct:</span>
                                  <span className="text-sm font-semibold text-green-600 truncate max-w-[120px]" title={q.answer}>{q.answer}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {(activeTab === 'writing' || activeTab === 'speaking') && result.criteria && (
                    <details className="text-sm text-gray-600 dark:text-gray-300 group mt-2">
                      <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400 select-none flex items-center">
                        <span className="group-open:hidden">View detailed criteria &darr;</span>
                        <span className="hidden group-open:inline">Hide detailed criteria &uarr;</span>
                      </summary>
                      <div className="mt-3 grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                        {Object.entries(result.criteria).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="font-semibold text-gray-900 dark:text-white">Band: {typeof value === 'object' ? Number(value.band).toFixed(1) : value}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
