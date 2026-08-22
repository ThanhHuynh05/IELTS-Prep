import { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Loader2, Copy, CheckCircle2 } from 'lucide-react';

export default function PdfExtractorModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    
    setIsExtracting(true);
    setError('');
    setExtractedText('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('http://localhost:5000/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Extraction failed');
      }

      const data = await res.json();
      setExtractedText(data.text);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while extracting the PDF.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <FileText className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">PDF Text Extractor</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Upload a PDF file to extract all of its text. This makes it easy to copy and paste reading passages, transcripts, and questions directly into the Admin Panel.
          </p>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800/30 transition-colors hover:border-blue-500 dark:hover:border-blue-500">
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
                <UploadCloud size={32} />
              </div>
              
              {file ? (
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                  <span className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-sm text-red-500 hover:text-red-600 mt-2 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                  >
                    Select PDF File
                  </button>
                  <p className="text-sm text-gray-500 mt-2">or drag and drop it here</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Extracted Text Area */}
          {extractedText && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Extracted Text</h3>
                <button 
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>
              <textarea 
                readOnly
                value={extractedText}
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 resize-y font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
          <button 
            onClick={handleExtract}
            disabled={!file || isExtracting}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-sm transition-all ${
              !file || isExtracting
                ? 'bg-blue-400 cursor-not-allowed opacity-70'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <FileText size={18} />
                <span>Extract Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
