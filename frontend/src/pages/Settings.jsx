import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { Settings as SettingsIcon, Save, Calendar, Target, Moon } from 'lucide-react';
import ThemeToggle from '../components/layout/ThemeToggle';

export default function Settings() {
  const [settings, setSettings] = useState({ targetBand: '7.0', testDate: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const loadSettings = async () => {
      const userSettings = await getSettings();
      if (userSettings) {
        setSettings({
          targetBand: userSettings.targetBand || '7.0',
          testDate: userSettings.testDate ? new Date(userSettings.testDate).toISOString().split('T')[0] : ''
        });
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const newSettings = {
        ...settings,
        testDate: settings.testDate ? new Date(settings.testDate).toISOString() : null
      };
      await saveSettings(newSettings);
      setSaveMessage('✓ Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('❌ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)]">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <SettingsIcon size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your IELTS preparation goals.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'general'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
            }`}
          >
            <SettingsIcon size={18} className="mr-3" /> General
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'appearance'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
            }`}
          >
            <Moon size={18} className="mr-3" /> Appearance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label htmlFor="targetBand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Target size={16} className="mr-2 text-blue-600 dark:text-blue-400" /> Target Band Score
                  </label>
                  <select
                    id="targetBand"
                    name="targetBand"
                    value={settings.targetBand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0].map(band => (
                      <option key={band} value={band.toFixed(1)}>{band.toFixed(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-blue-600 dark:text-blue-400" /> Official Test Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="testDate"
                    name="testDate"
                    value={settings.testDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${saveMessage.includes('❌') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {saveMessage}
                  </span>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : (
                      <>
                        <Save size={18} className="mr-2" /> Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Moon size={16} className="mr-2 text-blue-600 dark:text-blue-400" /> Theme Preference
                  </label>
                  <div className="flex items-center justify-between px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adjust the appearance of the application.</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
