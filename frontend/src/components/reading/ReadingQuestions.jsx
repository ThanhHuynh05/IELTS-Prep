export default function ReadingQuestions({ sections, allTestQuestions, userAnswers, onAnswerChange, onSubmit }) {
  if (!sections) return null;

  const handleInputChange = (questionId, value) => {
    onAnswerChange(questionId, value);
  };

  // Check if all questions across all sections have an answer
  const currentPassageQuestions = sections.flatMap(sec => sec.questions);
  const totalQuestionsInTest = allTestQuestions ? allTestQuestions.length : currentPassageQuestions.length;
  
  // Calculate answered count out of the entire test
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k].trim() !== "").length;

  return (
    <div className="h-full overflow-y-auto pl-6 border-l border-gray-200 dark:border-gray-700">
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {answeredCount} / {totalQuestionsInTest} Answered
        </span>
      </div>

      <div className="space-y-10 pb-12">
        {sections.map((section) => (
          <div key={section.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{section.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{section.instructions}</p>
              {section.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={section.imageUrl} 
                    alt="Section Chart or Table" 
                    className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {section.questions.map((q, index) => {
                // Calculate the global number across the entire test
                const globalNumber = allTestQuestions 
                  ? allTestQuestions.findIndex(gq => gq.id === q.id) + 1
                  : currentPassageQuestions.findIndex(gq => gq.id === q.id) + 1;

                return (
                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    <div className="font-bold text-gray-800 dark:text-gray-200 shrink-0 w-6">
                      {globalNumber}.
                    </div>

                    <div className="flex-1">
                      {/* For True/False/NG and Yes/No/NG, show text then dropdown */}
                      {(section.type === 'true-false-ng' || section.type === 'yes-no-ng') && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <span className="text-gray-700 dark:text-gray-300">{q.question}</span>
                          <select 
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            className="form-select border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-40 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border p-1.5 transition-colors"
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
                          <span className="text-gray-700 dark:text-gray-300">{q.question}</span>
                          <input 
                            type="text"
                            maxLength={2}
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value.toUpperCase())}
                            className="w-12 text-center border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-b-2 border-t-0 border-l-0 border-r-0 bg-transparent dark:text-white focus:bg-gray-50 dark:focus:bg-gray-700 font-bold uppercase transition-colors"
                          />
                        </div>
                      )}

                      {/* For Multiple Choice, show text then radio list */}
                      {section.type === 'multiple-choice' && (
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium block mb-3">{q.question}</span>
                          <div className="space-y-2">
                            {q.options.map((opt, i) => (
                              <label key={i} className="flex items-center space-x-3 cursor-pointer group bg-gray-50 dark:bg-gray-700/50 p-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                <input 
                                  type="radio" 
                                  name={`question-${q.id}`}
                                  value={opt}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-800"
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-sm transition-colors">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* For Fill in Blank, show text with an input box replacing the blank, or just an input below */}
                      {section.type === 'fill-in-blank' && (
                        <div className="space-y-2">
                          <span className="text-gray-700 dark:text-gray-300 block">{q.question}</span>
                          <input 
                            type="text" 
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full sm:w-64 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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

      <div className="sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end mt-4 transition-colors">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center"
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
}
