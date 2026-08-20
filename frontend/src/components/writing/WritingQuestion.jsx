export default function WritingQuestion({ taskType, question, task1Image }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 transition-colors">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        {taskType === 'task1' ? 'Task 1' : 'Task 2'}
      </h2>
      {taskType === 'task1' && task1Image && (
        <img src={task1Image} alt="IELTS Task 1 chart" className="w-full max-w-2xl mx-auto rounded-lg border dark:border-gray-700 mb-6" />
      )}
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question}</p>
    </div>
  );
}
