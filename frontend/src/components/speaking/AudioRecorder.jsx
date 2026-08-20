import { useState, useEffect } from 'react';
import { Mic, Square, Loader2, RotateCcw } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

export default function AudioRecorder({ isGrading, onSubmit, onContentChange }) {
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useAudioRecorder();
  
  useEffect(() => {
    if (onContentChange) onContentChange(transcript);
  }, [transcript, onContentChange]);
  
  const handleStopAndSubmit = () => {
    stopRecording();
  };

  const handleManualSubmit = () => {
    if (transcript.trim().length > 0) {
      onSubmit(transcript);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col items-center py-6">
        {/* Record Button */}
        <button
          onClick={isRecording ? handleStopAndSubmit : startRecording}
          disabled={isGrading}
          className={`relative flex items-center justify-center w-24 h-24 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
            isRecording 
              ? 'bg-red-50 text-red-500 animate-pulse border-4 border-red-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
          {isRecording && (
            <span className="absolute -bottom-8 text-sm font-semibold text-red-500 uppercase tracking-widest whitespace-nowrap">
              Recording
            </span>
          )}
        </button>
      </div>

      {/* Transcript Display */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Live Transcript</h3>
          <button 
            onClick={resetTranscript}
            disabled={isRecording || isGrading || !transcript}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex items-center text-sm"
          >
            <RotateCcw size={14} className="mr-1" /> Clear
          </button>
        </div>
        <div className="w-full min-h-[160px] max-h-[300px] overflow-y-auto p-4 border rounded-md bg-gray-50 text-gray-700 leading-relaxed">
          {transcript ? transcript : <span className="text-gray-400 italic">Your speech will appear here...</span>}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleManualSubmit}
          disabled={!transcript.trim() || isRecording || isGrading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {isGrading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Analyzing Speech...
            </>
          ) : (
            'Submit for Grading'
          )}
        </button>
      </div>
    </div>
  );
}
