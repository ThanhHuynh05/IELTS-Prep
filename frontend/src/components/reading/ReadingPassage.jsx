import PdfViewer from '../common/PdfViewer';

export default function ReadingPassage({ passage, testPdfUrl }) {
  if (!passage && !testPdfUrl) return null;

  return (
    <div className="h-full md:pr-6 flex flex-col">
      {!testPdfUrl && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 shrink-0">
          {passage.title}
        </h2>
      )}
      
      {testPdfUrl ? (
        <PdfViewer fileUrl={testPdfUrl} />
      ) : (
        <div className="overflow-y-auto pr-2">
          <div className="prose prose-lg text-gray-700 dark:text-gray-300 dark:prose-invert leading-relaxed space-y-4">
            {passage.text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-justify indent-8">
                {paragraph}
              </p>
            ))}
          </div>
          {passage.imageUrl && (
            <div className="mt-8 mb-4 border-t border-gray-200 pt-6">
              <img 
                src={passage.imageUrl} 
                alt="Passage Illustration" 
                className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
