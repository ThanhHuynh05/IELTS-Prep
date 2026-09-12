import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResults, getRecentActivity, getSettings, saveSettings } from '../utils/storage';
import { Activity, BookOpen, Headphones, PenTool, Mic, Target, Calendar, Edit2, Loader2, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
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
  const [activityFilter, setActivityFilter] = useState('all');
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
        
        // Data is ascending (oldest first, newest last) due to reverse
        setReadingData(read.reverse());
        setListeningData(listen.reverse());
        setWritingData(write.reverse());
        setSpeakingData(speak.reverse());
        setRecentActivity(activity);
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

  const getPercentageChange = (data) => {
    if (!data || data.length < 2) return null;
    const current = Number(data[data.length - 1].estimatedBand);
    const previous = Number(data[data.length - 2].estimatedBand);
    
    if (previous === 0) return null;
    
    const change = ((current - previous) / previous) * 100;
    return change;
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
    
    const average = sum / count;
    const whole = Math.floor(average);
    const fraction = average - whole;
    
    if (fraction < 0.25) {
      return whole.toFixed(1);
    } else if (fraction >= 0.25 && fraction < 0.75) {
      return (whole + 0.5).toFixed(1);
    } else {
      return (whole + 1.0).toFixed(1);
    }
  };

  const SectionCard = ({ title, icon: Icon, colorClass, bgClass, data, link }) => {
    const change = getPercentageChange(data);
    
    return (
      <Link to={link} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
              <Icon size={24} />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-5xl font-extrabold text-gray-900 dark:text-white leading-none">{getLatestBand(data)}</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Band Score</span>
          </div>
          
          {change !== null ? (
            <div className={`flex items-center mt-3 text-sm font-medium ${change > 0 ? 'text-emerald-600 dark:text-emerald-400' : change < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500'}`}>
              {change > 0 ? <TrendingUp size={16} className="mr-1.5" /> : change < 0 ? <TrendingDown size={16} className="mr-1.5" /> : <Minus size={16} className="mr-1.5" />}
              <span>{Math.abs(change).toFixed(1)}% {change >= 0 ? 'increase' : 'decrease'}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 font-normal text-xs">vs last</span>
            </div>
          ) : (
            <div className="flex items-center mt-3 text-sm text-gray-400 dark:text-gray-500">
              <Minus size={16} className="mr-1.5" />
              <span>Do 1 more practice to see score changes</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

    const getPreviousAverageBand = () => {
      let sum = 0;
      let count = 0;
      
      const getPrev = (data) => data && data.length >= 2 ? Number(data[data.length - 2].estimatedBand) : null;
      
      const p1 = getPrev(readingData);
      if (p1 !== null) { sum += p1; count++; }
      const p2 = getPrev(listeningData);
      if (p2 !== null) { sum += p2; count++; }
      const p3 = getPrev(writingData);
      if (p3 !== null) { sum += p3; count++; }
      const p4 = getPrev(speakingData);
      if (p4 !== null) { sum += p4; count++; }
      
      if (count === 0) return null;
      
      const average = sum / count;
      const whole = Math.floor(average);
      const fraction = average - whole;
      
      if (fraction < 0.25) return whole;
      else if (fraction >= 0.25 && fraction < 0.75) return whole + 0.5;
      else return whole + 1.0;
    };

    const getOverallPercentageChange = () => {
      const currentStr = getAverageBand();
      if (currentStr === '-') return null;
      
      const current = parseFloat(currentStr);
      const previous = getPreviousAverageBand();
      
      if (previous === null || previous === 0) return null;
      
      return ((current - previous) / previous) * 100;
    };

    const overallChange = getOverallPercentageChange();

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

  const maxLength = Math.max(readingData.length, listeningData.length, writingData.length, speakingData.length);
  const isDataEmpty = maxLength === 0;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your Progress</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Track your IELTS scores and boost your performance.</p>
        </div>
        {settings && (
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-3 shrink-0">
            {settings.targetBand !== undefined && (
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Target size={20} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Target</div>
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
                      <Edit2 size={12} className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>
            )}
            {daysLeft !== null && (
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg">
                  <Calendar size={20} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Test Date</div>
                  <div className="font-bold text-gray-900 dark:text-white">{daysLeft} days left</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isDataEmpty ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <div className="bg-blue-50 dark:bg-blue-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="text-blue-500 dark:text-blue-400" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No practice sessions yet!</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 font-medium">
            Start your first practice session to generate your estimated band score, track your progress, and get AI-powered feedback.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/reading" className="px-6 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center">
              <BookOpen size={18} className="mr-2" /> Reading
            </Link>
            <Link to="/listening" className="px-6 py-2.5 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center">
              <Headphones size={18} className="mr-2" /> Listening
            </Link>
            <Link to="/writing" className="px-6 py-2.5 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center">
              <PenTool size={18} className="mr-2" /> Writing
            </Link>
            <Link to="/speaking" className="px-6 py-2.5 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400 font-bold rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors flex items-center">
              <Mic size={18} className="mr-2" /> Speaking
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Main 1:4 Layout for Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Big Grid on the Left (Overall) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Activity size={120} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                  <Activity size={20} className="text-blue-100" />
                  <span className="text-sm font-bold text-blue-50 uppercase tracking-widest">Overall Band</span>
                </div>
                <div className="mt-auto">
                  <div className="text-[6rem] font-black leading-none tracking-tight mb-2">
                    {getAverageBand()}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-blue-200 font-medium text-lg">Estimated Average Score</p>
                    {overallChange !== null && (
                      <div className={`flex items-center text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md ${overallChange > 0 ? 'text-emerald-300' : overallChange < 0 ? 'text-red-300' : 'text-blue-200'}`}>
                        {overallChange > 0 ? <TrendingUp size={16} className="mr-1.5" /> : overallChange < 0 ? <TrendingDown size={16} className="mr-1.5" /> : <Minus size={16} className="mr-1.5" />}
                        <span>{Math.abs(overallChange).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Small Grids on the Right (Skills) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SectionCard title="Reading" icon={BookOpen} colorClass="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-50 dark:bg-emerald-900/20" data={readingData} link="/reading" />
              <SectionCard title="Listening" icon={Headphones} colorClass="text-purple-600 dark:text-purple-400" bgClass="bg-purple-50 dark:bg-purple-900/20" data={listeningData} link="/listening" />
              <SectionCard title="Writing" icon={PenTool} colorClass="text-orange-600 dark:text-orange-400" bgClass="bg-orange-50 dark:bg-orange-900/20" data={writingData} link="/writing" />
              <SectionCard title="Speaking" icon={Mic} colorClass="text-pink-600 dark:text-pink-400" bgClass="bg-pink-50 dark:bg-pink-900/20" data={speakingData} link="/speaking" />
            </div>
          </div>

          {/* Recent Activity moved to bottom */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center shrink-0">
                <Clock size={24} className="mr-3 text-blue-500" />
                Recent Activity
              </h2>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <select 
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Skills</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
                <Link to="/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap">
                  Full History &rarr;
                </Link>
              </div>
            </div>
            {recentActivity.filter(a => activityFilter === 'all' || a.section === activityFilter).length > 0 ? (
              <div className="flex flex-col space-y-3">
                {recentActivity.filter(a => activityFilter === 'all' || a.section === activityFilter).slice(0, 5).map((activity, index) => {
                  const date = new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  let accentColor = 'bg-gray-100';
                  let textColor = 'text-gray-700';
                  
                  const band = Number(activity.estimatedBand) || 0;
                  const radius = 18;
                  const circumference = 2 * Math.PI * radius;
                  const dashoffset = circumference - (circumference * (band / 9));
                  
                  let strokeColor = '#3B82F6';
                  if (activity.section === 'reading') { accentColor = 'bg-emerald-100 dark:bg-emerald-900/30'; textColor = 'text-emerald-700 dark:text-emerald-300'; strokeColor = '#10B981'; }
                  if (activity.section === 'listening') { accentColor = 'bg-purple-100 dark:bg-purple-900/30'; textColor = 'text-purple-700 dark:text-purple-300'; strokeColor = '#A855F7'; }
                  if (activity.section === 'writing') { accentColor = 'bg-orange-100 dark:bg-orange-900/30'; textColor = 'text-orange-700 dark:text-orange-300'; strokeColor = '#F97316'; }
                  if (activity.section === 'speaking') { accentColor = 'bg-pink-100 dark:bg-pink-900/30'; textColor = 'text-pink-700 dark:text-pink-300'; strokeColor = '#EC4899'; }

                  return (
                    <Link to={`/history`} key={index} className="flex flex-col sm:flex-row sm:items-center p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <span className={`inline-block w-24 text-center text-xs font-bold px-2.5 py-1 rounded-full capitalize sm:mr-4 shrink-0 ${accentColor} ${textColor}`}>
                          {activity.section}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0 sm:pr-4">
                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors truncate">
                          {activity.title || "Practice Test"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium sm:hidden mt-1">{date}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                           <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{date}</p>
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0" title={`Band ${band.toFixed(1)} out of 9.0`}>
                          <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r={radius} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="4" fill="none" />
                            <circle 
                              cx="24" cy="24" r={radius} 
                              stroke={strokeColor} 
                              strokeWidth="4" 
                              fill="none" 
                              strokeDasharray={circumference} 
                              strokeDashoffset={dashoffset}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="text-xs font-bold text-gray-900 dark:text-white z-10">
                            {band.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 font-medium p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">No recent activity. Start practicing to see your history!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
