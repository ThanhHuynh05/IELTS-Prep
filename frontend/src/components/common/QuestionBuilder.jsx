import { PlusCircle, Trash2, Settings, Plus } from 'lucide-react';

export default function QuestionBuilder({ sections = [], onChange, startIndex = 1, passageNumber }) {
  const getQuestionNumber = (sIdx, qIdx) => {
    let num = startIndex;
    for (let i = 0; i < sIdx; i++) {
      num += (sections[i].questions || []).length;
    }
    num += qIdx;
    return num;
  };

  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: 'New Section',
      instructions: '',
      type: 'multiple-choice',
      options: [],
      questions: []
    };
    onChange([...sections, newSection]);
  };

  const handleRemoveSection = (sectionIndex) => {
    const newSections = [...sections];
    newSections.splice(sectionIndex, 1);
    onChange(newSections);
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
    
    // Auto-populate options based on type if needed
    if (field === 'type') {
      if (value === 'true-false-ng') {
        newSections[sectionIndex].options = ['TRUE', 'FALSE', 'NOT GIVEN'];
      } else if (value === 'yes-no-ng') {
        newSections[sectionIndex].options = ['YES', 'NO', 'NOT GIVEN'];
      } else if (value === 'multiple-choice' && (!newSections[sectionIndex].options || newSections[sectionIndex].options.length === 0)) {
        newSections[sectionIndex].options = ['A', 'B', 'C', 'D'];
      }
    }
    
    onChange(newSections);
  };

  const handleAddQuestion = (sectionIndex) => {
    const newSections = [...sections];
    const newQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      question: 'New Question',
      answer: ''
    };
    newSections[sectionIndex].questions.push(newQuestion);
    onChange(newSections);
  };

  const handleRemoveQuestion = (sectionIndex, questionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    onChange(newSections);
  };

  const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      [field]: value
    };
    onChange(newSections);
  };

  const handleOptionsChange = (sectionIndex, optionsString) => {
    const newSections = [...sections];
    newSections[sectionIndex].options = optionsString.split(',').map(s => s.trim()).filter(Boolean);
    onChange(newSections);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {passageNumber ? `Passage ${passageNumber} Answer Overview` : 'Answer Overview'}
        </h2>
        <button 
          onClick={handleAddSection} 
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <PlusCircle size={16} className="mr-1" /> Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No question sections added yet.</p>
        </div>
      )}

      {sections.map((section, sIdx) => (
        <div key={section.id || sIdx} className="transition-all">
          {/* Questions within Section */}
          <div className="mt-2 pt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Questions</h4>
              <button 
                onClick={() => handleAddQuestion(sIdx)}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <PlusCircle size={14} className="mr-1" /> Add Question
              </button>
            </div>
            
            <div className="space-y-3">
              {(section.questions || []).map((q, qIdx) => (
                <div key={q.id || qIdx} className="flex gap-3 items-start bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-700">
                  <div className="font-mono text-xs text-gray-400 pt-2 w-8 text-center bg-gray-100 dark:bg-gray-800 rounded">
                    {getQuestionNumber(sIdx, qIdx)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium text-gray-500 mb-1">Answer:</div>
                    <input 
                      type="text" 
                      value={q.answer || ''} 
                      onChange={(e) => handleQuestionChange(sIdx, qIdx, 'answer', e.target.value)}
                      className="w-full p-1.5 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 rounded text-sm text-green-800 dark:text-green-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Correct answer(s)..."
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveQuestion(sIdx, qIdx)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Remove Question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!section.questions || section.questions.length === 0) && (
                <p className="text-xs text-gray-500 italic">No questions added yet.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
