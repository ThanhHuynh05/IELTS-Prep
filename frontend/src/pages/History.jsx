import { useState, useEffect } from 'react';
import { getResults, deleteResult } from '../utils/storage';
import { BookOpen, Headphones, PenTool, Mic, History as HistoryIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/common/ConfirmModal';

export default function History() {
  const [activeTab, setActiveTab] = useState('reading');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const location = useLocation();

  const [results, setResults] = useState({
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (location.state?.deleted) {
      showToast('History item successfully deleted.');
      // Clean up the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { id, section } = itemToDelete;
    const success = await deleteResult(id);
    if (success) {
      setResults(prev => ({
        ...prev,
        [section]: prev[section].filter(r => r._id !== id)
      }));
      showToast('History item successfully deleted.');
    } else {
      alert("Failed to delete history item. Please try again.");
    }
    setItemToDelete(null);
  };

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
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)] relative">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg shadow-lg border border-emerald-200 dark:border-emerald-800/30 flex items-center space-x-3">
            <CheckCircle2 size={20} />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <HistoryIcon size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review your past attempts and feedback.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 pb-2">
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
              
              const band = Number(result.estimatedBand) || 0;
              const radius = 24;
              const circumference = 2 * Math.PI * radius;
              const dashoffset = circumference - (circumference * (band / 9));
              
              let strokeColor = '#3B82F6';
              if (activeTab === 'reading') strokeColor = '#10B981';
              if (activeTab === 'listening') strokeColor = '#A855F7';
              if (activeTab === 'writing') strokeColor = '#F97316';
              if (activeTab === 'speaking') strokeColor = '#EC4899';

              return (
                <div key={result._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setItemToDelete({ id: result._id, section: activeTab })}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Delete result"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4 pr-12">
                    <div className="flex gap-4">
                      {activeTab === 'writing' && result.chartImg && (
                        <div className="hidden sm:block shrink-0 w-24 h-24 bg-gray-50 border rounded flex items-center justify-center p-1">
                          <img src={result.chartImg} alt="Task Chart" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {result.title || `${activeTabInfo.label} Practice`}
                          </h4>
                          {(activeTab === 'writing' || activeTab === 'speaking') && result.taskType && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border capitalize">
                              {result.taskType.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{date}</div>
                        {activeTab === 'speaking' && result.taskType && (
                           <div className="text-xs text-gray-500 mt-1 capitalize">Task: {result.taskType.replace('-', ' ')}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start shrink-0">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0" title={`Band ${band.toFixed(1)} out of 9.0`}>
                        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r={radius} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="4" fill="none" />
                          <circle 
                            cx="32" cy="32" r={radius} 
                            stroke={strokeColor} 
                            strokeWidth="4" 
                            fill="none" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="flex flex-col items-center justify-center z-10">
                          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                            {band.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(activeTab === 'reading' || activeTab === 'listening') && result.rawScore !== undefined && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Score: <strong>{result.rawScore}</strong> / {result.maxScore}
                    </div>
                  )}

                  {(activeTab === 'reading' || activeTab === 'listening') && result.detailedResults && (
                    <Link
                      to={`/history/${activeTab}/${new Date(result.date).getTime()}`}
                      state={{ result, activeTabLabel: activeTabInfo.label }}
                      className="inline-block mt-3 font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                      View detailed answers &rarr;
                    </Link>
                  )}

                  {(activeTab === 'writing' || activeTab === 'speaking') && result.criteria && (
                    <Link
                      to={`/history/${activeTab}/${new Date(result.date).getTime()}`}
                      state={{ result, activeTabLabel: activeTabInfo.label }}
                      className="inline-block mt-2 font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                      View detailed criteria &rarr;
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete History Item"
        message="Are you sure you want to delete this practice result? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
