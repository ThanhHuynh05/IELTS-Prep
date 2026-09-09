import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PdfViewer from '../components/common/PdfViewer';
import WritingFeedback from '../components/writing/WritingFeedback';
import SpeakingFeedback from '../components/speaking/SpeakingFeedback';
import ReadingFeedback from '../components/reading/ReadingFeedback';
import ListeningFeedback from '../components/listening/ListeningFeedback';

export default function HistoryDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { section, id } = useParams();
  
  if (!state || !state.result) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Result not found</h2>
        <button onClick={() => navigate('/history')} className="text-blue-600 hover:underline">
          Return to History
        </button>
      </div>
    );
  }

  const { result, activeTabLabel } = state;
  const dateStr = new Date(result.date).toLocaleString();

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/history')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.title || `${activeTabLabel} Practice`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{dateStr}</p>
        </div>
        <div className="ml-auto flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 mr-2">Score:</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {Number(result.estimatedBand).toFixed(1)} <span className="text-sm font-medium">Band</span>
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden flex flex-col">
        
        {section === 'reading' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-[500px]">
              {result.pdfUrl ? (
                <PdfViewer fileUrl={result.pdfUrl} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No PDF available for this past test</div>
              )}
            </div>
            <div className="overflow-y-auto">
              <ReadingFeedback 
                sections={[{ questions: result.detailedResults || [] }]} 
                userAnswers={(result.detailedResults || []).reduce((acc, q) => ({ ...acc, [q.id]: q.userAnswer }), {})}
                onReset={() => navigate('/reading')} 
              />
            </div>
          </div>
        )}

        {section === 'listening' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-[500px]">
              {result.pdfUrl ? (
                <PdfViewer fileUrl={result.pdfUrl} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No PDF available for this past test</div>
              )}
            </div>
            <div className="overflow-y-auto">
              <ListeningFeedback 
                sections={[{ questions: result.detailedResults || [] }]} 
                userAnswers={(result.detailedResults || []).reduce((acc, q) => ({ ...acc, [q.id]: q.userAnswer }), {})}
                transcript={result.transcript || "Transcript not available."}
                onReset={() => navigate('/listening')} 
              />
            </div>
          </div>
        )}

        {section === 'writing' && (
          <div className="overflow-y-auto w-full max-w-4xl mx-auto h-full pr-4 custom-scrollbar">
            {result.taskType && <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                {result.taskType}
              </span>
            </div>}
            
            {result.chartImg && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border flex justify-center">
                <img src={result.chartImg} alt="Task Chart" className="max-h-64 object-contain" />
              </div>
            )}
            
            {result.question && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2">Question:</h3>
                <p className="text-gray-700 dark:text-gray-300">{result.question}</p>
              </div>
            )}
            
            {result.feedback ? (
              <WritingFeedback 
                feedback={result.feedback} 
                onReset={() => navigate('/writing')} 
                originalEssay={result.originalEssay} 
              />
            ) : (
              <div className="p-4 text-gray-500 italic">Detailed feedback not available for this past attempt.</div>
            )}
          </div>
        )}

        {section === 'speaking' && (
          <div className="overflow-y-auto w-full max-w-4xl mx-auto h-full pr-4 custom-scrollbar">
            {result.taskType && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold capitalize">
                  {result.taskType.replace('-', ' ')}
                </span>
              </div>
            )}
            
            {result.question && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2">Prompt:</h3>
                <p className="text-gray-700 dark:text-gray-300">{result.question}</p>
              </div>
            )}
            
            {result.feedback ? (
              <SpeakingFeedback 
                feedback={result.feedback}
                transcript={result.transcript}
                audioUrl={result.audioUrl}
                onReset={() => navigate('/speaking')}
              />
            ) : (
              <div className="p-4 text-gray-500 italic">Detailed feedback not available for this past attempt.</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

