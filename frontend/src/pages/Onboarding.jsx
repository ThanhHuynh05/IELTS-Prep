import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { Target, Calendar, ArrowRight } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [targetBand, setTargetBand] = useState('7.0');
  const [testDate, setTestDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings({ targetBand, testDate });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl shadow-xl p-8 border dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to IELTS Prep</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Let's set your goals before you start practicing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="targetBand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Overall Band Score
            </label>
            <select
              id="targetBand"
              value={targetBand}
              onChange={(e) => setTargetBand(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(9)].map((_, i) => {
                const val = (5.0 + i * 0.5).toFixed(1);
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>

          <div>
            <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Calendar size={16} className="mr-2" /> Official Test Date (Optional)
            </label>
            <input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            Start Practicing
            <ArrowRight size={20} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
