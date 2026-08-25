import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getResults, getRecentActivity, getSettings, saveSettings } from '../utils/storage';
import { Activity, BookOpen, Headphones, PenTool, Mic, Target, Calendar, Edit2, Loader2 } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Dashboard() {
  const [readingData, setReadingData] = useState([]);
  const [listeningData, setListeningData] = useState([]);
  const [writingData, setWritingData] = useState([]);
  const [speakingData, setSpeakingData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isEditingBand, setIsEditingBand] = useState(false);
  const [tempTargetBand, setTempTargetBand] = useState('7.0');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [read, listen, write, speak, activity, userSettings] = await Promise.all([
          getResults('reading'),
          getResults('listening'),
          getResults('writing'),
          getResults('speaking'),
          getRecentActivity(),
          getSettings()
        ]);
        
        setReadingData(read.reverse());
        setListeningData(listen.reverse());
        setWritingData(write.reverse());
        setSpeakingData(speak.reverse());
        setRecentActivity(activity.slice(0, 5));
        setSettings(userSettings);
        setTempTargetBand(userSettings?.targetBand || '7.0');
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBandSave = async () => {
    setIsEditingBand(false);
    const newBand = parseFloat(tempTargetBand);
    if (!isNaN(newBand) && newBand >= 1 && newBand <= 9) {
      const formattedBand = newBand.toFixed(1);
      const newSettings = { ...settings, targetBand: formattedBand };
      setSettings(newSettings);
      await saveSettings(newSettings);
    } else {
      setTempTargetBand(settings?.targetBand || '7.0');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBandSave();
    if (e.key === 'Escape') {
      setIsEditingBand(false);
      setTempTargetBand(settings?.targetBand || '7.0');
    }
  };

  const getLatestBand = (data) => {
    if (!data || data.length === 0) return '-';
    return Number(data[data.length - 1].estimatedBand).toFixed(1);
  };

  const getAverageBand = () => {
    let sum = 0;
    let count = 0;
    const l1 = getLatestBand(readingData);
    if (l1 !== '-') { sum += parseFloat(l1); count++; }
    const l2 = getLatestBand(listeningData);
    if (l2 !== '-') { sum += parseFloat(l2); count++; }
    const l3 = getLatestBand(writingData);
    if (l3 !== '-') { sum += parseFloat(l3); count++; }
    const l4 = getLatestBand(speakingData);
    if (l4 !== '-') { sum += parseFloat(l4); count++; }
    
    if (count === 0) return '-';
    return (sum / count).toFixed(1);
  };

  const maxLength = Math.max(readingData.length, listeningData.length, writingData.length, speakingData.length);
  const chartData = Array.from({ length: maxLength }).map((_, i) => ({
    name: `Attempt ${i + 1}`,
    Reading: readingData[i] ? readingData[i].estimatedBand : null,
    Listening: listeningData[i] ? listeningData[i].estimatedBand : null,
    Writing: writingData[i] ? writingData[i].estimatedBand : null,
    Speaking: speakingData[i] ? speakingData[i].estimatedBand : null,
  }));

  const SectionCard = ({ title, icon: Icon, colorClass, data, link }) => (
    <Link to={link} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-colors hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer block hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white">{getLatestBand(data)}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest Band Score</div>
      </div>
    </Link>
  );

  const calculateDaysLeft = () => {
    if (!settings?.testDate) return null;
    const today = new Date();
    const test = new Date(settings.testDate);
    const diff = test - today;
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isDataEmpty = maxLength === 0;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your IELTS band scores and identify areas for improvement.</p>
        </div>
        {settings && (
          <div className="mt-4 md:mt-0 flex space-x-4">
            {settings.targetBand !== undefined && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <Target size={20} className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Target Band</div>
                  {isEditingBand ? (
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={tempTargetBand}
                      onChange={(e) => setTempTargetBand(e.target.value)}
                      onBlur={handleBandSave}
                      onKeyDown={handleKeyDown}
                      className="w-16 font-bold text-gray-900 dark:text-white bg-transparent border-b border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <button 
                      className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 transition-colors flex items-center group"
                      onClick={() => setIsEditingBand(true)}
                      aria-label="Edit target band score"
                      title="Click to edit"
                    >
                      {settings.targetBand}
                      <Edit2 size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>
            )}
            {daysLeft !== null && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <Calendar size={20} className="text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Days to Test</div>
                  <div className="font-bold text-gray-900 dark:text-white">{daysLeft} days</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md text-white flex flex-col justify-between lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Activity size={24} />
            </div>
            <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Overall</span>
          </div>
          <div>
            <div className="text-5xl font-bold">{getAverageBand()}</div>
            <div className="text-sm text-blue-100 mt-1">Estimated Average</div>
          </div>
        </div>
        
        <SectionCard title="Reading" icon={BookOpen} colorClass="bg-emerald-100 text-emerald-600" data={readingData} link="/reading" />
        <SectionCard title="Listening" icon={Headphones} colorClass="bg-purple-100 text-purple-600" data={listeningData} link="/listening" />
        <SectionCard title="Writing" icon={PenTool} colorClass="bg-orange-100 text-orange-600" data={writingData} link="/writing" />
        <SectionCard title="Speaking" icon={Mic} colorClass="bg-pink-100 text-pink-600" data={speakingData} link="/speaking" />
      </div>

      {isDataEmpty ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <div className="bg-blue-100 dark:bg-blue-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No practice sessions yet!</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
            Start your first practice session to generate your estimated band score, track your progress, and get AI-powered feedback.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/reading" className="px-6 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center">
              <BookOpen size={18} className="mr-2" /> Reading
            </Link>
            <Link to="/listening" className="px-6 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center">
              <Headphones size={18} className="mr-2" /> Listening
            </Link>
            <Link to="/writing" className="px-6 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center">
              <PenTool size={18} className="mr-2" /> Writing
            </Link>
            <Link to="/speaking" className="px-6 py-2 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 font-medium rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors flex items-center">
              <Mic size={18} className="mr-2" /> Speaking
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Band Score Progression</h2>
          {chartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280' }} />
                  <YAxis domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} stroke="#6B7280" tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--bg-tooltip, #fff)', color: 'var(--text-tooltip, #000)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Reading" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                  <Line type="monotone" dataKey="Listening" stroke="#9333EA" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                  <Line type="monotone" dataKey="Writing" stroke="#EA580C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                  <Line type="monotone" dataKey="Speaking" stroke="#DB2777" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 font-medium">Complete some practice tests to see your progress chart!</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-6">
              {recentActivity.map((activity, index) => {
                const date = new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{activity.section} Practice</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.title || "Practice Test"}</p>
                      <div className="mt-1 inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded">
                        Band {Number(activity.estimatedBand).toFixed(1)}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity. Start practicing to see your history!</p>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
