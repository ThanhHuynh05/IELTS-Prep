import { useState, useEffect } from 'react';
import { Shield, PlusCircle, Save, BookOpen, Headphones, PenTool, Mic, Trash2, List, FileText } from 'lucide-react';
import QuestionBuilder from '../components/common/QuestionBuilder';
import PdfExtractorModal from '../components/common/PdfExtractorModal';

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
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Manage Content State
  const [manageType, setManageType] = useState('reading');
  const [contentList, setContentList] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Reading State
  const [rTestTitle, setRTestTitle] = useState('');
  const [activePassageTab, setActivePassageTab] = useState(1);
  
  const initialPassageState = () => ({
    title: '',
    text: '',
    sections: JSON.parse(DEFAULT_READING_JSON)
  });

  const [passages, setPassages] = useState([
    initialPassageState(),
    initialPassageState(),
    initialPassageState()
  ]);

  // Listening State
  const [lTitle, setLTitle] = useState('');
  const [lAudio, setLAudio] = useState('');
  const [lTranscript, setLTranscript] = useState('');
  const [lSections, setLSections] = useState(() => JSON.parse(DEFAULT_LISTENING_JSON));

  // Writing State
  const [wTitle, setWTitle] = useState('');
  const [wTask1, setWTask1] = useState('');
  const [wTask1Image, setWTask1Image] = useState('');
  const [wTask2, setWTask2] = useState('');

  // Speaking State
  const [sTitle, setSTitle] = useState('');
  const [sPart1, setSPart1] = useState(['']);
  const [sPart2, setSPart2] = useState('');
  const [sPart3, setSPart3] = useState(['']);

  const API_URL = 'http://localhost:5000/api';

  const handleSaveReading = async () => {
    setError(''); setSuccess('');
    try {
      if (!rTestTitle) throw new Error("Test Title is required.");
      if (passages.some(p => !p.title || !p.text)) {
        throw new Error("Title and text are required for all 3 passages.");
      }

      const newTest = { 
        id: `custom-readtest-${Date.now()}`, 
        title: rTestTitle, 
        passages: passages 
      };
      
      const res = await fetch(`${API_URL}/content/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');
      
      setSuccess(`Reading Test "${rTestTitle}" added!`);
      setRTestTitle('');
      setPassages([initialPassageState(), initialPassageState(), initialPassageState()]);
      setActivePassageTab(1);
    } catch (err) { setError(err.message); }
  };

  const handleSaveListening = async () => {
    setError(''); setSuccess('');
    try {
      if (!lTitle || !lAudio) throw new Error("Title and Audio URL are required.");
      const sections = lSections;
      const newTest = { id: `custom-list-${Date.now()}`, title: lTitle, audioUrl: lAudio, transcript: lTranscript, sections };
      
      const res = await fetch(`${API_URL}/content/listening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');
      
      setSuccess(`Listening Test "${lTitle}" added!`);
      setLTitle(''); setLAudio(''); setLTranscript(''); setLSections(JSON.parse(DEFAULT_LISTENING_JSON));
    } catch (err) { setError(err.message); }
  };

  const handleSaveWriting = async () => {
    setError(''); setSuccess('');
    try {
      if (!wTitle || !wTask1 || !wTask2) throw new Error("All fields are required.");
      const newTest = { id: `custom-writ-${Date.now()}`, title: wTitle, task1: wTask1, task1Image: wTask1Image, task2: wTask2 };
      
      const res = await fetch(`${API_URL}/content/writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');

      setSuccess(`Writing Test "${wTitle}" added!`);
      setWTitle(''); setWTask1(''); setWTask1Image(''); setWTask2('');
    } catch (err) { setError(err.message); }
  };

  const handleSaveSpeaking = async () => {
    setError(''); setSuccess('');
    try {
      if (!sTitle || !sPart1.some(q => q.trim()) || !sPart2 || !sPart3.some(q => q.trim())) throw new Error("All fields are required.");
      const newTest = { 
        id: `custom-speak-${Date.now()}`, 
        title: sTitle, 
        part1: sPart1.filter(q => q.trim()), 
        part2: sPart2, 
        part3: sPart3.filter(q => q.trim()) 
      };
      
      const res = await fetch(`${API_URL}/content/speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');

      setSuccess(`Speaking Topic "${sTitle}" added!`);
      setSTitle(''); setSPart1(['']); setSPart2(''); setSPart3(['']);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <button onClick={() => {setActiveTab('reading'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'reading' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><BookOpen size={16} className="mr-2" /> Reading</button>
          <button onClick={() => {setActiveTab('listening'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'listening' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Headphones size={16} className="mr-2" /> Listening</button>
          <button onClick={() => {setActiveTab('writing'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'writing' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><PenTool size={16} className="mr-2" /> Writing</button>
          <button onClick={() => {setActiveTab('speaking'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'speaking' ? 'bg-pink-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Mic size={16} className="mr-2" /> Speaking</button>
          <button onClick={() => {setActiveTab('manage'); setError(''); setSuccess('');}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-gray-800 text-white dark:bg-gray-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><List size={16} className="mr-2" /> Manage Content</button>
        </div>

        <button 
          onClick={() => setShowPdfModal(true)}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm border border-slate-200 dark:border-slate-700 w-fit"
        >
          <FileText size={16} className="mr-2 text-blue-500" />
          Extract PDF Text
        </button>
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
            <div className="space-y-6">
              <div>
                <label htmlFor="rTestTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label>
                <input 
                  id="rTestTitle" 
                  type="text" 
                  value={rTestTitle} 
                  onChange={(e) => setRTestTitle(e.target.value)} 
                  className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. IELTS Academic Test 1" 
                />
              </div>

              {/* Passage Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActivePassageTab(num)}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                      activePassageTab === num 
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Passage {num}
                  </button>
                ))}
              </div>

              {/* Passage Content (using the active tab) */}
              <div className="space-y-4 animate-in fade-in duration-200" key={activePassageTab}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passage {activePassageTab} Title</label>
                  <input 
                    type="text" 
                    value={passages[activePassageTab - 1].title} 
                    onChange={(e) => {
                      const newPassages = [...passages];
                      newPassages[activePassageTab - 1].title = e.target.value;
                      setPassages(newPassages);
                    }} 
                    className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. The Discovery of Penicillin" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passage {activePassageTab} Text</label>
                  <textarea 
                    value={passages[activePassageTab - 1].text} 
                    onChange={(e) => {
                      const newPassages = [...passages];
                      newPassages[activePassageTab - 1].text = e.target.value;
                      setPassages(newPassages);
                    }} 
                    rows={8} 
                    className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                    placeholder="Paste the full reading text here..." 
                  />
                </div>
                <div className="mt-8 border-t dark:border-gray-700 pt-6">
                  <QuestionBuilder 
                    sections={passages[activePassageTab - 1].sections} 
                    onChange={(newSections) => {
                      const newPassages = [...passages];
                      newPassages[activePassageTab - 1].sections = newSections;
                      setPassages(newPassages);
                    }} 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t dark:border-gray-700">
                <button onClick={handleSaveReading} className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm">
                  <Save size={20} className="mr-2" />
                  Save Full Test
                </button>
              </div>
            </div>
          )}

          {activeTab === 'listening' && (
            <>
              <div><label htmlFor="lTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label><input id="lTitle" type="text" value={lTitle} onChange={(e) => setLTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="e.g. Campus Library Orientation" /></div>
              <div><label htmlFor="lAudio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio URL (.mp3)</label><input id="lAudio" type="url" value={lAudio} onChange={(e) => setLAudio(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/audio.mp3" /></div>
              <div><label htmlFor="lTranscript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Transcript (Optional)</label><textarea id="lTranscript" value={lTranscript} onChange={(e) => setLTranscript(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="Paste the transcript..." /></div>
              <div className="mt-8 border-t dark:border-gray-700 pt-6">
                <QuestionBuilder sections={lSections} onChange={setLSections} />
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveListening} className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Listening Test</button></div>
            </>
          )}

          {activeTab === 'writing' && (
            <>
              <div><label htmlFor="wTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label><input id="wTitle" type="text" value={wTitle} onChange={(e) => setWTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="e.g. Academic Practice 1" /></div>
              <div><label htmlFor="wTask1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task 1 Prompt</label><textarea id="wTask1" value={wTask1} onChange={(e) => setWTask1(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="The chart below shows..." /></div>
              <div><label htmlFor="wTask1Image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task 1 Chart Image URL</label><input id="wTask1Image" type="url" value={wTask1Image} onChange={(e) => setWTask1Image(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="https://example.com/chart.png" /></div>
              <div><label htmlFor="wTask2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task 2 Prompt</label><textarea id="wTask2" value={wTask2} onChange={(e) => setWTask2(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" placeholder="Some people believe..." /></div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveWriting} className="flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Writing Test</button></div>
            </>
          )}

          {activeTab === 'speaking' && (
            <>
              <div><label htmlFor="sTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic Title</label><input id="sTitle" type="text" value={sTitle} onChange={(e) => setSTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="e.g. Technology & Internet" /></div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part 1 Questions</label>
                  <button type="button" onClick={() => setSPart1([...sPart1, ''])} className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 font-medium">+ Add Question</button>
                </div>
                <div className="space-y-2">
                  {sPart1.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={q} onChange={(e) => { const newP = [...sPart1]; newP[i] = e.target.value; setSPart1(newP); }} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Question text..." />
                      <button type="button" onClick={() => setSPart1(sPart1.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 px-2"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div><label htmlFor="sPart2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part 2 Prompt (Cue Card)</label><textarea id="sPart2" value={sPart2} onChange={(e) => setSPart2(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Describe a useful website you have visited..." /></div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part 3 Questions</label>
                  <button type="button" onClick={() => setSPart3([...sPart3, ''])} className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 font-medium">+ Add Question</button>
                </div>
                <div className="space-y-2">
                  {sPart3.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={q} onChange={(e) => { const newP = [...sPart3]; newP[i] = e.target.value; setSPart3(newP); }} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Question text..." />
                      <button type="button" onClick={() => setSPart3(sPart3.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 px-2"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
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
      
      <PdfExtractorModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
      />
    </div>
  );
}
