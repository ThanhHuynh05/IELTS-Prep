export default function ReadingQuestions({ sections, userAnswers, onAnswerChange, onSubmit }) {
  if (!sections) return null;

  const handleInputChange = (questionId, value) => {
    onAnswerChange(questionId, value);
  };

  // Check if all questions across all sections have an answer
  const allQuestions = sections.flatMap(sec => sec.questions);
  const allAnswered = allQuestions.every(q => userAnswers[q.id] && userAnswers[q.id].trim() !== "");

  return (
    <div className="h-full overflow-y-auto pl-6 border-l border-gray-200">
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-xl font-bold text-gray-900">Questions</h2>
        <span className="text-sm font-medium text-gray-500">
          {Object.keys(userAnswers).filter(k => userAnswers[k].trim() !== "").length} / {allQuestions.length} Answered
        </span>
      </div>

      <div className="space-y-10 pb-12">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-line">{section.instructions}</p>
            </div>

            <div className="space-y-6">
              {section.questions.map((q, index) => {
                // Find global index for display if needed, but usually sections say "1-4", so we should ideally use the actual question number. 
                // For simplicity, we just use the index within the section + some offset, or just map the ID.
                // Since the user screenshots show a number, let's extract the number from the ID or just use a global counter.
                const globalNumber = allQuestions.findIndex(gq => gq.id === q.id) + 1;

                return (
                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    <div className="font-bold text-gray-800 shrink-0 w-6">
                      {globalNumber}.
                    </div>

                    <div className="flex-1">
                      {/* For True/False/NG and Yes/No/NG, show text then dropdown */}
                      {(section.type === 'true-false-ng' || section.type === 'yes-no-ng') && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <span className="text-gray-700">{q.question}</span>
                          <select 
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            className="form-select border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-40 text-sm bg-gray-50 border p-1.5"
                          >
                            <option value="" disabled></option>
                            {section.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* For Matching Headings, show text then small input */}
                      {section.type === 'matching-headings' && (
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-700">{q.question}</span>
                          <input 
                            type="text"
                            maxLength={2}
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value.toUpperCase())}
                            className="w-12 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-b-2 border-t-0 border-l-0 border-r-0 bg-transparent focus:bg-gray-50 font-bold uppercase"
                          />
                        </div>
                      )}

                      {/* For Multiple Choice, show text then radio list */}
                      {section.type === 'multiple-choice' && (
                        <div>
                          <span className="text-gray-700 font-medium block mb-3">{q.question}</span>
                          <div className="space-y-2">
                            {q.options.map((opt, i) => (
                              <label key={i} className="flex items-center space-x-3 cursor-pointer group bg-gray-50 p-2 rounded hover:bg-blue-50 transition-colors">
                                <input 
                                  type="radio" 
                                  name={`question-${q.id}`}
                                  value={opt}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 group-hover:text-blue-700 text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* For Fill in Blank, show text with an input box replacing the blank, or just an input below */}
                      {section.type === 'fill-in-blank' && (
                        <div className="space-y-2">
                          <span className="text-gray-700 block">{q.question}</span>
                          <input 
                            type="text" 
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full sm:w-64 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200 flex justify-end mt-4">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center"
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
}
