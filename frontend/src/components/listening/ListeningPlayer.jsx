import { useState, useEffect } from 'react';
import { Volume2, Play, Square } from 'lucide-react';

export default function ListeningPlayer({ transcript, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Stop audio if component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (hasPlayed) return;
    
    setIsPlaying(true);
    setHasPlayed(true);

    const utterance = new SpeechSynthesisUtterance(transcript);
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('en-GB'));
    const usVoice = voices.find(v => v.lang.includes('en-US'));
    if (ukVoice) utterance.voice = ukVoice;
    else if (usVoice) utterance.voice = usVoice;

    utterance.rate = 0.95; // Slightly slower for listening test

    utterance.onend = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <Volume2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">IELTS Audio Track</h3>
            <p className="text-slate-400 text-sm">You can only play this recording once.</p>
          </div>
        </div>
        
        {isPlaying && (
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 text-sm font-semibold tracking-wider uppercase">Playing</span>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-center border border-slate-700">
        <button
          onClick={handlePlay}
          disabled={hasPlayed || isPlaying}
          className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all ${
            hasPlayed 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
          }`}
        >
          {hasPlayed ? (
            <>
              <Square size={20} fill="currentColor" />
              <span>Playback Complete</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Start Audio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
