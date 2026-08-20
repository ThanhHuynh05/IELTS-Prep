export default function ListeningQuestions({ sections, userAnswers, onAnswerChange, onSubmit }) {
  if (!sections) return null;

  const handleInputChange = (questionId, value) => {
    onAnswerChange(questionId, value);
  };

  const allQuestions = sections.flatMap(sec => sec.questions);
  const allAnswered = allQuestions.every(q => userAnswers[q.id] && userAnswers[q.id].trim() !== "");

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="mb-6 flex justify-between items-end border-b dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {Object.keys(userAnswers).filter(k => userAnswers[k].trim() !== "").length} / {allQuestions.length} Answered
        </span>
      </div>

      <div className="space-y-10 pb-12">
        {sections.map((section) => (
          <div key={section.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{section.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{section.instructions}</p>
            </div>

            <div className="space-y-6">
              {section.questions.map((q) => {
                const globalNumber = allQuestions.findIndex(gq => gq.id === q.id) + 1;

                return (
                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    <div className="font-bold text-gray-800 dark:text-gray-200 shrink-0 w-6">
                      {globalNumber}.
                    </div>

                    <div className="flex-1">
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
