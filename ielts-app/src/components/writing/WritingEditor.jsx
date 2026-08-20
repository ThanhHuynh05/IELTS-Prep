import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function WritingEditor({ taskType, onSubmit, isGrading }) {
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const minWords = taskType === 'task1' ? 150 : 250;

  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essay]);

  const handleSubmit = () => {
    onSubmit(essay);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Your Response</h3>
        <span className={`text-sm font-medium ${wordCount < minWords ? 'text-red-500' : 'text-green-600'}`}>
          {wordCount} / {minWords} words minimum
        </span>
      </div>
      
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="Start typing your essay here..."
        className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        disabled={isGrading}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={wordCount < minWords || isGrading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {isGrading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Grading...
            </>
          ) : (
            'Submit for Grading'
          )}
        </button>
      </div>
    </div>
  );
}
