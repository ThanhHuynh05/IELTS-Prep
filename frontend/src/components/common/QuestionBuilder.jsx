import { PlusCircle, Trash2, Settings, Plus } from 'lucide-react';

export default function QuestionBuilder({ sections, onChange }) {
  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
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
      id: `q-${Date.now()}`,
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
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question Sections</label>
        <button 
          onClick={handleAddSection}
          className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={16} className="mr-1" /> Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No question sections added yet.</p>
        </div>
      )}

      {sections.map((section, sIdx) => (
        <div key={section.id || sIdx} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings size={18} className="mr-2 text-gray-500" />
              Section {sIdx + 1}
            </h3>
            <button 
              onClick={() => handleRemoveSection(sIdx)}
              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Remove Section"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Section Title</label>
              <input 
                type="text" 
                value={section.title || ''} 
                onChange={(e) => handleSectionChange(sIdx, 'title', e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Questions 1-5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Question Type</label>
              <select
                value={section.type || 'multiple-choice'}
                onChange={(e) => handleSectionChange(sIdx, 'type', e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false-ng">True/False/Not Given</option>
                <option value="yes-no-ng">Yes/No/Not Given</option>
                <option value="fill-in-the-blanks">Fill in the Blanks</option>
                <option value="matching">Matching</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Instructions</label>
            <textarea 
              value={section.instructions || ''} 
              onChange={(e) => handleSectionChange(sIdx, 'instructions', e.target.value)}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="e.g. Choose the correct letter, A, B, C or D."
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL (Optional - For Charts/Tables)</label>
            <input 
              type="url" 
              value={section.imageUrl || ''} 
              onChange={(e) => handleSectionChange(sIdx, 'imageUrl', e.target.value)}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/flowchart.png"
            />
          </div>

          {['multiple-choice', 'matching'].includes(section.type) && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Options (Comma separated)</label>
              <input 
                type="text" 
                value={(section.options || []).join(', ')} 
                onChange={(e) => handleOptionsChange(sIdx, e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. A, B, C, D"
              />
            </div>
          )}

          {/* Questions within Section */}
          <div className="mt-6 border-t dark:border-gray-700 pt-4">
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
                    {qIdx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={q.question || ''} 
                      onChange={(e) => handleQuestionChange(sIdx, qIdx, 'question', e.target.value)}
                      className="w-full p-1.5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Question text..."
                    />
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
