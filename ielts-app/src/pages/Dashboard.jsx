import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getResults, getRecentActivity, getSettings } from '../utils/storage';
import { Activity, BookOpen, Headphones, PenTool, Mic, Target, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [readingData, setReadingData] = useState([]);
  const [listeningData, setListeningData] = useState([]);
  const [writingData, setWritingData] = useState([]);
  const [speakingData, setSpeakingData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [read, listen, write, speak, activity, userSettings] = await Promise.all([
          getResults('reading'),
          getResults('listening'),
          getResults('writing'),
          getResults('speaking'),
          getRecentActivity(),
          getSettings()
        ]);
        
        setReadingData(read);
        setListeningData(listen);
        setWritingData(write);
        setSpeakingData(speak);
        setRecentActivity(activity.slice(0, 5));
        setSettings(userSettings);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchData();
  }, []);

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

  const SectionCard = ({ title, icon: Icon, colorClass, data }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-colors">
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
    </div>
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

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your IELTS band scores and identify areas for improvement.</p>
        </div>
        {settings && (
          <div className="mt-4 md:mt-0 flex space-x-4">
            {settings.targetBand && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <Target size={20} className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Target Band</div>
                  <div className="font-bold text-gray-900 dark:text-white">{settings.targetBand}</div>
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
        
        <SectionCard title="Reading" icon={BookOpen} colorClass="bg-emerald-100 text-emerald-600" data={readingData} />
        <SectionCard title="Listening" icon={Headphones} colorClass="bg-purple-100 text-purple-600" data={listeningData} />
        <SectionCard title="Writing" icon={PenTool} colorClass="bg-orange-100 text-orange-600" data={writingData} />
        <SectionCard title="Speaking" icon={Mic} colorClass="bg-pink-100 text-pink-600" data={speakingData} />
      </div>

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
    </div>
  );
}
