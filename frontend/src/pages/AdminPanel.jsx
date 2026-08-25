import { useState, useEffect } from 'react';
import { Shield, PlusCircle, Save, BookOpen, Headphones, PenTool, Mic, Trash2, List, FileText, Wand2, Edit2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import QuestionBuilder from '../components/common/QuestionBuilder';

const DEFAULT_READING_JSON = `[
  {
    "id": "sec-1",
    "title": "Answer Overview",
    "instructions": "",
    "type": "mixed",
    "options": [],
    "questions": []
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
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Reading State
  const [rTestTitle, setRTestTitle] = useState('');
  const [rTestPdfUrl, setRTestPdfUrl] = useState('');
  const [activePassageTab, setActivePassageTab] = useState(1);
  const [pastedAnswers, setPastedAnswers] = useState('');
  
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
  const [lPdfUrl, setLPdfUrl] = useState('');
  const [lTranscript, setLTranscript] = useState('');
  const [pastedListeningAnswers, setPastedListeningAnswers] = useState('');
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

  const API_URL = '/api';

  const handleSaveReading = async () => {
    setError(''); setSuccess('');
    try {
      if (!rTestTitle) throw new Error("Test Title is required.");
      if (!rTestPdfUrl) throw new Error("A Test PDF must be uploaded.");
      if (passages.some(p => p.sections.length === 0)) {
        throw new Error("You must add at least one question section to all 3 passages.");
      }

      const newTest = { 
        id: editingId || `custom-readtest-${Date.now()}`, 
        title: rTestTitle, 
        pdfUrl: rTestPdfUrl,
        passages: passages 
      };
      
      const url = editingId ? `${API_URL}/content/reading/${editingId}` : `${API_URL}/content/reading`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save to database: ${res.statusText}`);
      }
      
      setSuccess(`Reading Test "${rTestTitle}" ${editingId ? 'updated' : 'added'}!`);
      setRTestTitle('');
      setRTestPdfUrl('');
      setPassages([initialPassageState(), initialPassageState(), initialPassageState()]);
      setActivePassageTab(1);
      setEditingId(null);
    } catch (err) { setError(err.message); }
  };

  const handlePdfUpload = async (e, setPdfUrl) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError('');
      setSuccess('Uploading... This might take a moment for large files.');
      
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: `${API_URL}/upload-pdf-file/token`,
      });
      
      setPdfUrl(newBlob.url);
      setSuccess(`Test PDF Uploaded Successfully!`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload PDF');
    }
  };

  const handleQuickPaste = () => {
    if (!pastedAnswers.trim()) return;

    try {
      const lines = pastedAnswers.split('\n').map(l => l.trim()).filter(l => l);
      let extracted = [];
      let currentNumber = null;
      let currentText = "";
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Match numbers at start of line: "1 ", "14. ", "40)"
        const match = line.match(/^0?(\d+)[.)\s]+(.*)$/i);
        
        if (match) {
          if (currentNumber !== null) {
            extracted.push({ num: currentNumber, text: currentText.trim() });
          }
          currentNumber = parseInt(match[1]);
          currentText = match[2];
        } else if (currentNumber !== null) {
          // Continuation of previous answer
          currentText += " " + line;
        }
      }
      
      if (currentNumber !== null) {
        extracted.push({ num: currentNumber, text: currentText.trim() });
      }

      if (extracted.length === 0) {
         throw new Error("No numbered answers found in the pasted text.");
      }

      extracted.sort((a,b) => a.num - b.num);
      
      const guessType = (text) => {
        const t = text.toUpperCase();
        if (t.includes('TRUE') || t.includes('FALSE') || t.includes('NOT GIVEN')) return 'true-false-ng';
        if (t.includes('YES') || t.includes('NO') || t.includes('NOT GIVEN')) return 'yes-no-ng';
        if (/^[A-Z]$/.test(t) || /^[A-Z]\s+AND\s+[A-Z]$/.test(t)) return 'multiple-choice';
        if (/^[IVX]+$/i.test(t)) return 'matching-headings';
        return 'fill-in-the-blanks';
      };

      const newQuestions = extracted.map(ans => ({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        question: '',
        answer: ans.text
      }));

      const newPassages = [...passages];
      const currentPassage = newPassages[activePassageTab - 1];
      
      if (!currentPassage.sections || currentPassage.sections.length === 0) {
        currentPassage.sections = [{
          id: `sec-${Date.now()}`,
          title: 'Answer Overview',
          instructions: '',
          type: 'mixed',
          options: [],
          questions: newQuestions
        }];
      } else {
        // Just append questions to the first section
        currentPassage.sections[0].questions = [
          ...(currentPassage.sections[0].questions || []),
          ...newQuestions
        ];
        // Remove any other sections if they somehow got added
        currentPassage.sections = [currentPassage.sections[0]];
      }
      
      setPassages(newPassages);
      setSuccess(`Successfully added ${extracted.length} answers to Passage ${activePassageTab}! Please verify the question types.`);
      setPastedAnswers('');
    } catch (err) {
      setError('Failed to parse answers. Please check the format.');
    }
  };

  const handleQuickPasteListening = () => {
    if (!pastedListeningAnswers.trim()) return;

    try {
      const lines = pastedListeningAnswers.split('\n').map(l => l.trim()).filter(l => l);
      let extracted = [];
      let currentNumber = null;
      let currentText = "";
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const match = line.match(/^0?(\d+)[.)\s]+(.*)$/i);
        
        if (match) {
          if (currentNumber !== null) {
            extracted.push({ num: currentNumber, text: currentText.trim() });
          }
          currentNumber = parseInt(match[1]);
          currentText = match[2];
        } else if (currentNumber !== null) {
          currentText += " " + line;
        }
      }
      
      if (currentNumber !== null) {
        extracted.push({ num: currentNumber, text: currentText.trim() });
      }

      if (extracted.length === 0) {
         throw new Error("No numbered answers found in the pasted text.");
      }

      extracted.sort((a,b) => a.num - b.num);

      const newQuestions = extracted.map(ans => ({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        question: '',
        answer: ans.text
      }));

      const newSections = [...lSections];
      
      if (newSections.length === 0) {
        newSections.push({
          id: `sec-${Date.now()}`,
          title: 'Answer Overview',
          instructions: '',
          type: 'mixed',
          questions: newQuestions
        });
      } else {
        newSections[0].questions = [
          ...(newSections[0].questions || []),
          ...newQuestions
        ];
      }
      
      setLSections(newSections);
      setSuccess(`Successfully added ${extracted.length} answers to Listening Test!`);
      setPastedListeningAnswers('');
    } catch (err) {
      setError('Failed to parse answers. Please check the format.');
    }
  };

  const handleSaveListening = async () => {
    setError(''); setSuccess('');
    try {
      if (!lTitle || !lAudio) throw new Error("Title and Audio URL are required.");
      const sections = lSections;
      const newTest = { 
        id: editingId || `custom-list-${Date.now()}`, 
        title: lTitle, 
        audioUrl: lAudio, 
        pdfUrl: lPdfUrl,
        transcript: lTranscript, 
        sections 
      };
      
      const url = editingId ? `${API_URL}/content/listening/${editingId}` : `${API_URL}/content/listening`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');
      
      setSuccess(`Listening Test "${lTitle}" ${editingId ? 'updated' : 'added'}!`);
      setLTitle(''); setLAudio(''); setLPdfUrl(''); setLTranscript(''); setLSections(JSON.parse(DEFAULT_LISTENING_JSON));
      setEditingId(null);
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

  const handleDeleteRequest = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`${API_URL}/content/${manageType}/${deleteConfirm._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete content');
      setSuccess("Content deleted successfully!");
      fetchContent(manageType);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (item) => {
    if (manageType === 'reading') {
      setRTestTitle(item.title || '');
      setRTestPdfUrl(item.pdfUrl || '');
      // Ensure passages array has 3 items
      const itemPassages = item.passages || [];
      const newPassages = [
        itemPassages[0] || initialPassageState(),
        itemPassages[1] || initialPassageState(),
        itemPassages[2] || initialPassageState()
      ];
      setPassages(newPassages);
      setEditingId(item._id);
      setActiveTab('reading');
    } else if (manageType === 'listening') {
      setLTitle(item.title || '');
      setLAudio(item.audioUrl || '');
      setLPdfUrl(item.pdfUrl || '');
      setLTranscript(item.transcript || '');
      setLSections(item.sections || JSON.parse(DEFAULT_LISTENING_JSON));
      setEditingId(item._id);
      setActiveTab('listening');
    } else if (manageType === 'writing') {
      setWTitle(item.title || '');
      setWTask1(item.task1 || '');
      setWTask1Image(item.task1Image || '');
      setWTask2(item.task2 || '');
      setEditingId(item._id);
      setActiveTab('writing');
    } else if (manageType === 'speaking') {
      setSTitle(item.title || '');
      setSPart1(item.part1 || ['']);
      setSPart2(item.part2 || '');
      setSPart3(item.part3 || ['']);
      setEditingId(item._id);
      setActiveTab('speaking');
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
          <button onClick={() => {setActiveTab('reading'); setError(''); setSuccess(''); if(manageType !== 'reading') setEditingId(null);}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'reading' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><BookOpen size={16} className="mr-2" /> Reading</button>
          <button onClick={() => {setActiveTab('listening'); setError(''); setSuccess(''); if(manageType !== 'listening') setEditingId(null);}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'listening' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Headphones size={16} className="mr-2" /> Listening</button>
          <button onClick={() => {setActiveTab('writing'); setError(''); setSuccess(''); if(manageType !== 'writing') setEditingId(null);}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'writing' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><PenTool size={16} className="mr-2" /> Writing</button>
          <button onClick={() => {setActiveTab('speaking'); setError(''); setSuccess(''); if(manageType !== 'speaking') setEditingId(null);}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'speaking' ? 'bg-pink-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><Mic size={16} className="mr-2" /> Speaking</button>
          <button onClick={() => {setActiveTab('manage'); setError(''); setSuccess(''); setEditingId(null);}} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-gray-800 text-white dark:bg-gray-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}><List size={16} className="mr-2" /> Manage Content</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center capitalize">
            {activeTab === 'manage' ? (
              <><List size={20} className="mr-2 text-gray-600 dark:text-gray-400" /> Manage Existing Content</>
            ) : (
              <><PlusCircle size={20} className="mr-2 text-blue-500" /> {editingId ? 'Edit' : 'Add New'} {activeTab} Content {editingId && <button onClick={() => {setEditingId(null); setRTestTitle(''); setRTestPdfUrl(''); setPassages([initialPassageState(), initialPassageState(), initialPassageState()]);}} className="ml-4 text-xs font-normal text-red-500 hover:underline">(Cancel Edit)</button>}</>
            )}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {success && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-green-100 dark:border-green-900/30 transform transition-all animate-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{success}</p>
                  <button 
                    onClick={() => setSuccess('')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20"
                  >
                    Awesome
                  </button>
                </div>
              </div>
            </div>
          )}
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md border border-red-200 dark:border-red-800">{error}</div>}

          {activeTab === 'reading' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label>
                <input 
                  id="rTestTitle" 
                  type="text" 
                  value={rTestTitle} 
                  onChange={(e) => setRTestTitle(e.target.value)} 
                  className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. IELTS Academic Test 1" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test PDF Upload (Optional)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handlePdfUpload(e, setRTestPdfUrl)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {rTestPdfUrl && (
                    <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                      ✅ Full Test PDF Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">If you upload a PDF here, it will be displayed on the left side for the entire test. You still need to add the questions for each passage below.</p>
              </div>

              {/* Passage Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 mt-4">
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
                    Passage {num} Questions
                  </button>
                ))}
              </div>

              {/* Passage Content (using the active tab) */}
              <div className="space-y-4 animate-in fade-in duration-200" key={activePassageTab}>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Wand2 size={64} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <Wand2 size={20} className="mr-2" />
                    Quick Paste Answers for Passage {activePassageTab}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-4 max-w-2xl">
                    Paste your copied answers for this specific passage below (e.g. <code>1 population</code>). We will instantly parse them and add them as new sections!
                  </p>
                  
                  <div className="flex flex-col space-y-3">
                    <textarea
                      value={pastedAnswers}
                      onChange={(e) => setPastedAnswers(e.target.value)}
                      placeholder="1 population&#10;2 suburbs&#10;3 FALSE..."
                      className="w-full p-3 h-24 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleQuickPaste}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors"
                      >
                        Parse & Add to Passage {activePassageTab}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <QuestionBuilder 
                    sections={passages[activePassageTab - 1].sections} 
                    passageNumber={activePassageTab}
                    startIndex={
                      1 + passages.slice(0, activePassageTab - 1).reduce((acc, passage) => {
                        return acc + (passage.sections || []).reduce((secAcc, sec) => secAcc + (sec.questions || []).length, 0);
                      }, 0)
                    }
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
                  {editingId ? 'Update Full Test' : 'Save Full Test'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'listening' && (
            <div className="space-y-6">
              <div><label htmlFor="lTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label><input id="lTitle" type="text" value={lTitle} onChange={(e) => setLTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="e.g. Campus Library Orientation" /></div>
              <div><label htmlFor="lAudio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio URL (.mp3)</label><input id="lAudio" type="url" value={lAudio} onChange={(e) => setLAudio(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/audio.mp3" /></div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Questions PDF Upload (Optional)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handlePdfUpload(e, setLPdfUrl)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {lPdfUrl && (
                    <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                      ✅ PDF Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload a PDF containing the questions to display alongside the audio.</p>
              </div>

              <div><label htmlFor="lTranscript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Transcript (Optional)</label><textarea id="lTranscript" value={lTranscript} onChange={(e) => setLTranscript(e.target.value)} rows={4} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="Paste the transcript..." /></div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5 mt-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Wand2 size={64} className="text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                  <Wand2 size={20} className="mr-2" />
                  Quick Paste Answers
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-4 max-w-2xl">
                  Paste your copied answers below (e.g. <code>1 London</code>). We will instantly parse them and add them as new sections!
                </p>
                
                <div className="flex flex-col space-y-3">
                  <textarea
                    value={pastedListeningAnswers}
                    onChange={(e) => setPastedListeningAnswers(e.target.value)}
                    placeholder="1 London&#10;2 10 am&#10;3 TRUE..."
                    className="w-full p-3 h-24 border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleQuickPasteListening}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors"
                    >
                      Parse & Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t dark:border-gray-700 pt-6">
                <QuestionBuilder sections={lSections} onChange={setLSections} />
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveListening} className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />{editingId ? 'Update Listening Test' : 'Save Listening Test'}</button></div>
            </div>
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
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Edit"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRequest(item)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-red-100 dark:border-red-900/30 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Content?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteConfirm.title}</strong>?
              </p>
              <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
              <div className="flex w-full space-x-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
