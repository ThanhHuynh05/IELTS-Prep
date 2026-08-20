export default function WritingQuestion({ taskType, question }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-xl font-semibold mb-2">
        {taskType === 'task1' ? 'Task 1' : 'Task 2'}
      </h2>
      <p className="text-gray-700 whitespace-pre-wrap">{question}</p>
    </div>
  );
}
