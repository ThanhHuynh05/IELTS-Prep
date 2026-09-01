import { useState, useEffect } from 'react';

export default function SpeakingPrompt({ taskPart, prompt }) {
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);

  useEffect(() => {
    // Reset prep timer when prompt or part changes
    setPrepTimeLeft(60);
    setIsPrepActive(false);
  }, [taskPart, prompt]);

  useEffect(() => {
    let interval = null;
    if (isPrepActive && prepTimeLeft > 0) {
      interval = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepTimeLeft === 0) {
      setIsPrepActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPrepActive, prepTimeLeft]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-xl font-semibold mb-2 capitalize text-blue-800">
        Speaking {taskPart.replace(/([0-9]+)/, ' $1')}
      </h2>
      
      {taskPart === 'part1' && (
        <p className="text-sm text-gray-500 mb-4">The examiner asks general questions about familiar topics, e.g. home, family, work, studies and interests.</p>
      )}
      {taskPart === 'part2' && (
        <p className="text-sm text-gray-500 mb-4">You will be asked to talk about a particular topic. You will have 1 minute to prepare before speaking for up to 2 minutes.</p>
      )}
      {taskPart === 'part3' && (
        <p className="text-sm text-gray-500 mb-4">You will be asked further questions connected to the topic in Part 2. These questions will give you the opportunity to discuss more abstract issues and ideas.</p>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border dark:border-gray-700 text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
        {prompt}
      </div>

      {taskPart === 'part2' && (
        <div className="mt-6 flex items-center justify-between bg-blue-50 p-4 rounded-md border border-blue-100">
          <div>
            <h4 className="font-medium text-blue-900">Preparation Time</h4>
            <p className="text-sm text-blue-700">Use this time to plan your 2-minute talk.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-2xl font-bold tabular-nums ${prepTimeLeft === 0 ? 'text-red-600' : 'text-blue-800'}`}>
              00:{prepTimeLeft.toString().padStart(2, '0')}
            </span>
            {!isPrepActive && prepTimeLeft > 0 && (
              <button 
                onClick={() => setIsPrepActive(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Start Prep
              </button>
            )}
            {prepTimeLeft === 0 && (
              <span className="text-red-600 font-semibold uppercase tracking-wide text-sm">Time's Up! Start Speaking</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
