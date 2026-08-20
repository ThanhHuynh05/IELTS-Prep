import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { Settings as SettingsIcon, Save, Calendar, Target } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({ targetBand: '7.0', testDate: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)]">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <SettingsIcon size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your IELTS preparation goals.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
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
    </div>
  );
}
