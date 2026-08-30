import { useState, useEffect } from 'react';
import { Shield, PlusCircle, Save, BookOpen, Headphones, PenTool, Mic, Trash2, List, FileText, Wand2, Edit2, XCircle, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import QuestionBuilder from '../components/common/QuestionBuilder';

const DEFAULT_READING_JSON = `[]`;

const DEFAULT_LISTENING_JSON = JSON.stringify([
  { id: 'sec-1', title: 'Section 1', instructions: '', type: 'mixed', options: [], questions: [] },
  { id: 'sec-2', title: 'Section 2', instructions: '', type: 'mixed', options: [], questions: [] },
  { id: 'sec-3', title: 'Section 3', instructions: '', type: 'mixed', options: [], questions: [] },
  { id: 'sec-4', title: 'Section 4', instructions: '', type: 'mixed', options: [], questions: [] }
]);

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
  const [isSectionMedia, setIsSectionMedia] = useState(false);

  // Writing State
  const [wTitle, setWTitle] = useState('');
  const [wTask1, setWTask1] = useState('');
  const [wTask1Image, setWTask1Image] = useState('');
  const [wTask2, setWTask2] = useState('');

  // Speaking State
  const [sPartType, setSPartType] = useState(1);
  const [sTitle, setSTitle] = useState('');
  const [sPart1, setSPart1] = useState(['', '', '', '']);
  const [sPart2, setSPart2] = useState(['']);
  const [sPart3, setSPart3] = useState([{ subTopic: '', questions: ['', '', ''] }]);
  const [part2Topics, setPart2Topics] = useState([]);

  useEffect(() => {
    if (activeTab === 'speaking' && sPartType === 3) {
      fetch(`${API_URL}/content/speaking`)
        .then(res => res.json())
        .then(data => setPart2Topics(data.filter(t => t.part === 2 || t.part2)))
        .catch(err => console.error('Failed to fetch Part 2 topics', err));
    }
  }, [activeTab, sPartType]);

  const handleAutoPopulatePart3 = (topicId) => {
    if (!topicId) return;
    const topic = part2Topics.find(t => t._id === topicId);
    if (!topic) return;
    
    setSTitle(topic.title || ''); // Sync title
    
    // Extract Part 2 prompts
    const p2Prompts = topic.questions?.length ? topic.questions : (topic.prompt ? [topic.prompt] : (topic.part2 ? (Array.isArray(topic.part2) ? topic.part2 : [topic.part2]) : []));
    
    if (p2Prompts.length > 0) {
        const newSPart3 = p2Prompts.map(prompt => ({
            subTopic: typeof prompt === 'string' ? prompt : '',
            questions: ['', '', '']
        }));
        setSPart3(newSPart3);
    }
  };

  const API_URL = '/api';

  const handleSaveReading = async () => {
    setError(''); setSuccess('');
    try {
      if (!rTestTitle) throw new Error("Test Title is required.");
      if (!rTestPdfUrl) throw new Error("A Test PDF must be selected.");
      if (passages.some(p => p.sections.length === 0)) {
        throw new Error("You must add at least one question section to all 3 passages.");
      }

      let finalPdfUrl = rTestPdfUrl;
      if (rTestPdfUrl instanceof File) {
        setSuccess('Uploading PDF to storage... Please wait.');
        const newBlob = await upload(rTestPdfUrl.name, rTestPdfUrl, {
          access: 'public',
          handleUploadUrl: `${API_URL}/upload-file/token`,
        });
        finalPdfUrl = newBlob.url;
      }

      const newTest = { 
        id: editingId || `custom-readtest-${Date.now()}`, 
        title: rTestTitle, 
        pdfUrl: finalPdfUrl,
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

  const handleFileUpload = (e, setFileOrUrl, fileTypeLabel = 'File') => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Store the file object directly in the state. 
    // It will be uploaded when the user clicks 'Save Test'.
    setFileOrUrl(file);
    setSuccess(`${fileTypeLabel} selected! It will be uploaded when you save the test.`);
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
        
        // Match numbers at start of line: "1 ", "14. ", "40)", "1.London", "1London"
        const match = line.match(/^0?(\d+)[.)\s\-\:]*(.*)$/i);
        
        if (match && match[2].trim() !== '') {
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
        const match = line.match(/^0?(\d+)[.)\s\-\:]*(.*)$/i);
        
        if (match && match[2].trim() !== '') {
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

      // Ensure we have at least 4 sections
      const newSections = [...lSections];
      while (newSections.length < 4) {
        newSections.push({
          id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: `Section ${newSections.length + 1}`,
          instructions: '',
          type: 'mixed',
          options: [],
          questions: []
        });
      }

      // If they paste 40 questions, distribute 10 per section. Otherwise just dump them into Section 1.
      if (newQuestions.length > 20) {
        newSections.forEach(s => s.questions = []);
        newQuestions.forEach((q, index) => {
          const sectionIndex = Math.min(Math.floor(index / 10), 3);
          newSections[sectionIndex].questions.push(q);
        });
      } else {
        newSections[0].questions = [...(newSections[0].questions || []), ...newQuestions];
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
      if (!lTitle) throw new Error("Title is required.");
      if (!isSectionMedia && !lAudio) throw new Error("Audio must be selected for full test mode.");
      
      let finalPdfUrl = lPdfUrl;
      if (lPdfUrl instanceof File) {
        setSuccess('Uploading global PDF to storage... Please wait.');
        const newBlob = await upload(lPdfUrl.name, lPdfUrl, { access: 'public', handleUploadUrl: `${API_URL}/upload-file/token` });
        finalPdfUrl = newBlob.url;
      }

      let finalAudioUrl = isSectionMedia ? '' : lAudio;
      if (!isSectionMedia && lAudio instanceof File) {
        setSuccess('Uploading global Audio to storage... Please wait.');
        const newBlob = await upload(lAudio.name, lAudio, { access: 'public', handleUploadUrl: `${API_URL}/upload-file/token` });
        finalAudioUrl = newBlob.url;
      }

      const sections = [...lSections];
      for (let i = 0; i < sections.length; i++) {
        if (isSectionMedia && sections[i].audioUrl instanceof File) {
          setSuccess(`Uploading Audio for Section ${i + 1}... Please wait.`);
          const file = sections[i].audioUrl;
          const newBlob = await upload(file.name, file, { access: 'public', handleUploadUrl: `${API_URL}/upload-file/token` });
          sections[i].audioUrl = newBlob.url;
        }
      }

      const newTest = { 
        id: editingId || `custom-list-${Date.now()}`, 
        title: lTitle, 
        audioUrl: finalAudioUrl, 
        pdfUrl: finalPdfUrl,
        isSectionMedia,
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
      if (!sTitle) throw new Error("Title is required.");
      
      const newTest = { 
        id: `custom-speak-${Date.now()}`, 
        title: sTitle,
        part: sPartType
      };

      if (sPartType === 1) {
        if (!sPart1.some(q => q.trim())) throw new Error("At least one question is required for Part 1.");
        newTest.questions = sPart1.filter(q => q.trim());
      } else if (sPartType === 2) {
        if (!sPart2.some(q => q.trim())) throw new Error("At least one prompt is required for Part 2.");
        newTest.questions = sPart2.filter(q => q.trim());
      } else if (sPartType === 3) {
        const validPart3 = sPart3.filter(item => item.subTopic?.trim() && item.questions?.some(q => q.trim()));
        if (validPart3.length === 0) throw new Error("At least one sub-topic with one question is required for Part 3.");
        newTest.questions = validPart3.map(item => ({
          subTopic: item.subTopic.trim(),
          questions: item.questions.filter(q => q.trim())
        }));
      }
      
      const res = await fetch(`${API_URL}/content/speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (!res.ok) throw new Error('Failed to save to database');

      setSuccess(`Speaking Part ${sPartType} Topic "${sTitle}" added!`);
      setSTitle(''); setSPart1(['', '', '', '']); setSPart2(['']); setSPart3([{ subTopic: '', questions: ['', '', ''] }]);
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
      setIsSectionMedia(item.isSectionMedia || false);
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
      const pType = item.part || 1;
      setSPartType(pType);
      setSTitle(item.title || '');
      setSPart1(pType === 1 ? (item.questions?.length ? item.questions : (item.part1?.length ? item.part1 : ['', '', '', ''])) : ['', '', '', '']);
      setSPart2(pType === 2 ? (item.questions?.length ? item.questions : (item.prompt ? [item.prompt] : (item.part2 ? [item.part2] : ['']))) : ['']);
      let loadedPart3 = [{ subTopic: '', questions: ['', '', ''] }];
      if (pType === 3) {
        const sourcePart3 = item.questions?.length ? item.questions : (item.part3?.length ? item.part3 : []);
        if (sourcePart3.length > 0) {
          if (typeof sourcePart3[0] === 'string') {
            loadedPart3 = [{ subTopic: item.title, questions: sourcePart3 }];
          } else {
            loadedPart3 = sourcePart3;
          }
        }
      }
      setSPart3(loadedPart3);
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${success.includes('Uploading') ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
                    {success.includes('Uploading') ? (
                      <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={24} />
                    ) : (
                      <Shield className="text-green-600 dark:text-green-400" size={24} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {success.includes('Uploading') ? 'Working on it...' : 'Success!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{success}</p>
                  {!success.includes('Uploading') && (
                    <button 
                      onClick={() => setSuccess('')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20"
                    >
                      Awesome
                    </button>
                  )}
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
                    key={rTestPdfUrl ? 'has-file' : 'no-file'}
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, setRTestPdfUrl, 'PDF')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {rTestPdfUrl && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                        ✅ {rTestPdfUrl instanceof File ? rTestPdfUrl.name : 'PDF Selected'}
                      </span>
                      <button onClick={() => setRTestPdfUrl('')} className="text-red-500 hover:text-red-700" title="Remove PDF">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                    Paste your copied answers for this specific passage below. Supported formats include: <code>1 population</code>, <code>1.population</code>, <code>1. population</code>, <code>1) population</code>. We will instantly parse them and add them as new sections!
                  </p>
                  
                  <div className="flex flex-col space-y-3">
                    <textarea
                      value={pastedAnswers}
                      onChange={(e) => setPastedAnswers(e.target.value)}
                      placeholder="1 population&#10;2. suburbs&#10;3.FALSE..."
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
              
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <input 
                  type="checkbox" 
                  id="isSectionMedia" 
                  checked={isSectionMedia} 
                  onChange={(e) => setIsSectionMedia(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="isSectionMedia" className="ml-3 font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Split Media by Section (Upload Audio & PDF for each section individually)
                </label>
              </div>

              {!isSectionMedia && (
                <div>
                  <label htmlFor="lAudio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Test Audio URL (.mp3)</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex relative">
                      <input 
                        id="lAudio" 
                        type="text" 
                        value={lAudio instanceof File ? lAudio.name : lAudio || ''} 
                        onChange={(e) => setLAudio(e.target.value)} 
                        className="w-full p-3 pr-10 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
                        placeholder="https://example.com/audio.mp3" 
                      />
                      {lAudio && (
                        <button onClick={() => setLAudio('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500" title="Clear Audio">
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center shrink-0 border border-gray-300 dark:border-gray-600 rounded-lg px-2 overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 shrink-0">OR Upload:</span>
                      <input 
                        key={lAudio ? 'has-file' : 'no-file'}
                        type="file" 
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, setLAudio, 'Audio')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 max-w-[220px]"
                      />
                    </div>
                  </div>
                </div>
              )}
                  
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Test PDF Upload (Optional)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    key={lPdfUrl ? 'has-file' : 'no-file'}
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, setLPdfUrl, 'PDF')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {lPdfUrl && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                        ✅ {lPdfUrl instanceof File ? lPdfUrl.name : 'PDF Selected'}
                      </span>
                      <button onClick={() => setLPdfUrl('')} className="text-red-500 hover:text-red-700" title="Remove PDF">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload a single PDF containing all the questions.</p>
              </div>

              {isSectionMedia && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Section Media Uploads</h3>
                  {lSections.map((section, idx) => (
                    <div key={section.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400">Section {idx + 1} Media</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audio URL</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1 flex relative">
                            <input 
                              type="text" 
                              value={section.audioUrl instanceof File ? section.audioUrl.name : section.audioUrl || ''} 
                              onChange={(e) => {
                                const newSecs = [...lSections];
                                newSecs[idx].audioUrl = e.target.value;
                                setLSections(newSecs);
                              }}
                              className="w-full p-2 pr-8 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" 
                            />
                            {section.audioUrl && (
                              <button 
                                onClick={() => {
                                  const newSecs = [...lSections];
                                  newSecs[idx].audioUrl = '';
                                  setLSections(newSecs);
                                }} 
                                className="absolute right-2 top-2 text-gray-400 hover:text-red-500" 
                                title="Clear Audio"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center shrink-0 border border-gray-300 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-900">
                            <span className="text-xs text-gray-500 mr-2">Upload:</span>
                            <input 
                              key={section.audioUrl ? 'has-file' : 'no-file'}
                              type="file" 
                              accept="audio/*"
                              onChange={(e) => handleFileUpload(e, (url) => {
                                const newSecs = [...lSections];
                                newSecs[idx].audioUrl = url;
                                setLSections(newSecs);
                              }, 'Audio')}
                              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {lSections.length === 0 && <p className="text-sm text-gray-500">Add a section below to upload its media.</p>}
                </div>
              )}

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
                  Paste your copied answers below. Supported formats include: <code>1 London</code>, <code>1.London</code>, <code>1. London</code>, <code>1) London</code>. We will instantly parse them and add them to this passage!
                </p>
                
                <div className="flex flex-col space-y-3">
                  <textarea
                    value={pastedListeningAnswers}
                    onChange={(e) => setPastedListeningAnswers(e.target.value)}
                    placeholder="1 London&#10;2. 10 am&#10;3.TRUE..."
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part Type</label>
                <select value={sPartType} onChange={e => setSPartType(Number(e.target.value))} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500">
                  <option value={1}>Part 1 (Introduction & Interview)</option>
                  <option value={2}>Part 2 (Long Turn / Cue Card)</option>
                  <option value={3}>Part 3 (Discussion)</option>
                </select>
              </div>

              {sPartType !== 3 && (
                <div><label htmlFor="sTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic Title</label><input id="sTitle" type="text" value={sTitle} onChange={(e) => setSTitle(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder={sPartType === 2 ? "e.g. Describe a person..." : "e.g. Hometown"} /></div>
              )}
              
              {sPartType === 1 && (
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
              )}

              {sPartType === 2 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part 2 Prompts (Cue Cards)</label>
                    <button type="button" onClick={() => setSPart2([...sPart2, ''])} className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 font-medium">+ Add Prompt</button>
                  </div>
                  <div className="space-y-4">
                    {sPart2.map((q, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <textarea value={q} onChange={(e) => { const newP = [...sPart2]; newP[i] = e.target.value; setSPart2(newP); }} rows={3} className="w-full p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500" placeholder="Describe a useful website you have visited..." />
                        <button type="button" onClick={() => setSPart2(sPart2.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 px-2 mt-2"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sPartType === 3 && (
                <div>
                  <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-xl">
                    <label className="block text-sm font-medium text-pink-800 dark:text-pink-300 mb-2">Topic</label>
                    <select
                      onChange={(e) => handleAutoPopulatePart3(e.target.value)}
                      className="w-full p-2 border border-pink-200 dark:border-pink-800 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">-- Select a Part 2 Category (e.g. Person, Object) --</option>
                      {part2Topics.map(t => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part 3 Sub-topics</label>
                    <button type="button" onClick={() => setSPart3([...sPart3, { subTopic: '', questions: ['', '', ''] }])} className="text-sm px-3 py-1 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 font-medium">+ Add Sub-topic</button>
                  </div>
                  <div className="space-y-6">
                    {sPart3.map((sub, sIdx) => (
                      <div key={sIdx} className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-3">
                          <input type="text" value={sub.subTopic} onChange={(e) => { const newP = [...sPart3]; newP[sIdx].subTopic = e.target.value; setSPart3(newP); }} className="w-full font-semibold p-2 border-b dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-pink-500" placeholder="Sub-topic (e.g. A person who helps...)" />
                          <button type="button" onClick={() => setSPart3(sPart3.filter((_, idx) => idx !== sIdx))} className="text-gray-400 hover:text-red-500 ml-4"><Trash2 size={18}/></button>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 mt-4">
                          {sub.questions.map((q, qIdx) => (
                            <div key={qIdx} className="flex gap-2">
                              <input type="text" value={q} onChange={(e) => { const newP = [...sPart3]; newP[sIdx].questions[qIdx] = e.target.value; setSPart3(newP); }} className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-pink-500" placeholder="Question text..." />
                              <button type="button" onClick={() => { const newP = [...sPart3]; newP[sIdx].questions = sub.questions.filter((_, idx) => idx !== qIdx); setSPart3(newP); }} className="text-gray-400 hover:text-red-500 px-2"><Trash2 size={16}/></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => { const newP = [...sPart3]; newP[sIdx].questions.push(''); setSPart3(newP); }} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium mt-2 block">+ Add Question to this Sub-topic</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4"><button onClick={handleSaveSpeaking} className="flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-sm"><Save size={20} className="mr-2" />Save Speaking Part {sPartType}</button></div>
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
