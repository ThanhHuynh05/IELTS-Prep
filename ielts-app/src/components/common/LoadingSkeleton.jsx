import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton({ text = "Grading..." }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{text}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Our AI examiner is reviewing your submission against official IELTS criteria. This usually takes about 5-10 seconds.
        </p>

        {/* Skeleton Bars */}
        <div className="w-full max-w-md mt-8 space-y-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 animate-pulse delay-75"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
