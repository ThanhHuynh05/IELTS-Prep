export default function ReadingPassage({ passage }) {
  if (!passage) return null;

  return (
    <div className="h-full overflow-y-auto pr-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        {passage.title}
      </h2>
      <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
        {passage.text.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-justify indent-8">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
