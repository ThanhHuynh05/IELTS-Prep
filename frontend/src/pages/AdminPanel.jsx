import { useState, useEffect } from 'react';
import { Shield, PlusCircle, Save, BookOpen, Headphones, PenTool, Mic, Trash2, List } from 'lucide-react';

const DEFAULT_READING_JSON = `[
  {
    "id": "sec-1",
    "title": "Questions 1-3",
    "instructions": "Do the following statements agree with the information given?\\nSelect TRUE, FALSE, or NOT GIVEN.",
    "type": "true-false-ng",
    "options": ["TRUE", "FALSE", "NOT GIVEN"],
    "questions": [
      {
        "id": "q1",
        "question": "Example question 1?",
        "answer": "TRUE"
      }
    ]
  }
]`;

const DEFAULT_LISTENING_JSON = `[
  {
    "id": "sec-1",
    "title": "Questions 1-3",
    "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS.",
    "type": "fill-in-blank",
    "questions": [
      {
        "id": "q1",
        "question": "The meeting is at ________",
        "answer": "10 am"
      }
    ]
  }
]`;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('reading');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Manage Content State
  const [manageType, setManageType] = useState('reading');
  const [contentList, setContentList] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Reading State
  const [rTitle, setRTitle] = useState('');
  const [rText, setRText] = useState('');
  const [rSectionsJson, setRSectionsJson] = useState(DEFAULT_READING_JSON);

  // Listening State
  const [lTitle, setLTitle] = useState('');
  const [lAudio, setLAudio] = useState('');
  const [lTranscript, setLTranscript] = useState('');
  const [lSectionsJson, setLSectionsJson] = useState(DEFAULT_LISTENING_JSON);

  // Writing State
  const [wTitle, setWTitle] = useState('');
  const [wTask1, setWTask1] = useState('');
  const [wTask2, setWTask2] = useState('');

  // Speaking State
  const [sTitle, setSTitle] = useState('');
  const [sPart1, setSPart1] = useState('');
  const [sPart2, setSPart2] = useState('');
  const [sPart3, setSPart3] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const handleSaveReading = async () => {
    setError(''); setSuccess('');
    try {
      if (!rTitle || !rText) throw new Error("Title and text are required.");
      const sections = JSON.parse(rSectionsJson);
      const newPassage = { id: `custom-read-${Date.now()}`, title: rTitle, text: rText, sections };
      
      const res = await fetch(`${API_URL}/content/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPassage)
      });
      if (!res.ok) throw new Error('Failed to save to database');
      
      setSuccess(`Reading Passage "${rTitle}" added!`);
      setRTitle(''); setRText(''); setRSectionsJson(DEFAULT_READING_JSON);
    } catch (err) { setError(err.message); }
  };

  const handleSaveListening = async () => {
    setError(''); setSuccess('');
    try {
      if (!lTitle || !lAudio) throw new Error("Title and Audio URL are required.");
      const sections = JSON.parse(lSectionsJson);
      const newTest = { id: `custom-list-${Date.now()}`, title: lTitle, audioUrl: lAudio, transcript: lTranscript, sections };
      
      const res = await fetch(`${API_URL}/content/listening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');
      
      setSuccess(`Listening Test "${lTitle}" added!`);
      setLTitle(''); setLAudio(''); setLTranscript(''); setLSectionsJson(DEFAULT_LISTENING_JSON);
    } catch (err) { setError(err.message); }
  };

  const handleSaveWriting = async () => {
    setError(''); setSuccess('');
    try {
      if (!wTitle || !wTask1 || !wTask2) throw new Error("All fields are required.");
      const newTest = { id: `custom-writ-${Date.now()}`, title: wTitle, task1: wTask1, task2: wTask2 };
      
      const res = await fetch(`${API_URL}/content/writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');

      setSuccess(`Writing Test "${wTitle}" added!`);
      setWTitle(''); setWTask1(''); setWTask2('');
    } catch (err) { setError(err.message); }
  };

  const handleSaveSpeaking = async () => {
    setError(''); setSuccess('');
    try {
      if (!sTitle || !sPart1 || !sPart2 || !sPart3) throw new Error("All fields are required.");
      const newTest = { 
        id: `custom-speak-${Date.now()}`, 
        title: sTitle, 
        part1: sPart1.split('\\n').filter(q => q.trim()), 
        part2: sPart2, 
        part3: sPart3.split('\\n').filter(q => q.trim()) 
      };
      
      const res = await fetch(`${API_URL}/content/speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');

      setSuccess(`Speaking Topic "${sTitle}" added!`);
      setSTitle(''); setSPart1(''); setSPart2(''); setSPart3('');
    } catch (err) { setError(err.message); }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchContent(manageType);
    }
  }, [activeTab, manageType]);

  const fetchContent = async (type) => {
    setIsLoadingContent(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/content/${type}`);
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      setContentList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      const res = await fetch(`${API_URL}/content/${manageType}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete content');
      setSuccess("Content deleted successfully!");
      fetchContent(manageType);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in pb-12">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg text-fuchsia-600 dark:text-fuchsia-400">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage content and add new practice tests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => {setActiveTab('reading'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'reading' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><BookOpen size={16} className="mr-2" /> Reading</button>
        <button onClick={() => {setActiveTab('listening'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'listening' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Headphones size={16} className="mr-2" /> Listening</button>
        <button onClick={() => {setActiveTab('writing'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'writing' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><PenTool size={16} className="mr-2" /> Writing</button>
        <button onClick={() => {setActiveTab('speaking'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'speaking' ? 'bg-pink-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Mic size={16} className="mr-2" /> Speaking</button>
        <button onClick={() => {setActiveTab('manage'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-gray-800 text-white dark:bg-gray-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><List size={16} className="mr-2" /> Manage Content</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center capitalize">
            {activeTab === 'manage' ? (
              <><List size={20} className="mr-2 text-gray-600 dark:text-gray-400" /> Manage Existing Content</>
            ) : (
              <><PlusCircle size={20} className="mr-2 text-blue-500" /> Add New {activeTab} Content</>
            )}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {success && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-md border border-green-200 dark:border-green-800">{success}</div>}
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md border border-red-200 dark:border-red-800">{error}</div>}

          {activeTab === 'reading' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passage Title</label><input type="text" value={rTitle} onChange={(e) => setRTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g. The Discovery of Penicillin" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passage Text</label><textarea value={rText} onChange={(e) => setRText(e.target.value)} rows={8} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Paste the full reading text here..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Questions (JSON)</label><textarea value={rSectionsJson} onChange={(e) => setRSectionsJson(e.target.value)} rows={10} className="w-full font-mono text-sm p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500" /></div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveReading} className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Passage</button></div>
            </>
          )}

          {activeTab === 'listening' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label><input type="text" value={lTitle} onChange={(e) => setLTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="e.g. Campus Library Orientation" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio URL (.mp3)</label><input type="url" value={lAudio} onChange={(e) => setLAudio(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/audio.mp3" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Transcript (Optional)</label><textarea value={lTranscript} onChange={(e) => setLTranscript(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="Paste the transcript..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Questions (JSON)</label><textarea value={lSectionsJson} onChange={(e) => setLSectionsJson(e.target.value)} rows={10} className="w-full font-mono text-sm p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-purple-500" /></div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveListening} className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Listening Test</button></div>
            </>
          )}

          {activeTab === 'writing' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label><input type="text" value={wTitle} onChange={(e) => setWTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="e.g. Academic Practice 1" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task 1 Prompt</label><textarea value={wTask1} onChange={(e) => setWTask1(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="The chart below shows..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task 2 Prompt</label><textarea value={wTask2} onChange={(e) => setWTask2(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="Some people believe..." /></div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveWriting} className="flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Writing Test</button></div>
            </>
          )}

          {activeTab === 'speaking' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic Title</label><input type="text" value={sTitle} onChange={(e) => setSTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="e.g. Technology & Internet" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part 1 Questions (One per line)</label><textarea value={sPart1} onChange={(e) => setSPart1(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Do you use the internet often?\nWhat is your favorite website?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part 2 Prompt (Cue Card)</label><textarea value={sPart2} onChange={(e) => setSPart2(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Describe a useful website you have visited..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part 3 Questions (One per line)</label><textarea value={sPart3} onChange={(e) => setSPart3(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="How has the internet changed the way we learn?\nWhat are the dangers of spending too much time online?" /></div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveSpeaking} className="flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Speaking Topic</button></div>
            </>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => setManageType('reading')} className={`pb-2 border-b-2 font-medium ${manageType === 'reading' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Reading</button>
                <button onClick={() => setManageType('listening')} className={`pb-2 border-b-2 font-medium ${manageType === 'listening' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Listening</button>
                <button onClick={() => setManageType('writing')} className={`pb-2 border-b-2 font-medium ${manageType === 'writing' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Writing</button>
                <button onClick={() => setManageType('speaking')} className={`pb-2 border-b-2 font-medium ${manageType === 'speaking' ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Speaking</button>
              </div>

              {isLoadingContent ? (
                <div className="text-center py-8 text-gray-500">Loading content...</div>
              ) : contentList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No custom {manageType} content found.</div>
              ) : (
                <div className="space-y-4">
                  {contentList.map(item => (
                    <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-500">ID: {item._id}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        title="Delete"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
