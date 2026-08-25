import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

export default function ListeningPlayer({ transcript, audioUrl, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Fallback to speech synthesis if no audioUrl
  const [hasPlayedSynth, setHasPlayedSynth] = useState(false);

  useEffect(() => {
    // Cleanup synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioUrl) {
      handleSynthPlay();
      return;
    }

    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (amount) => {
    if (!audioRef.current) return;
    let newTime = audioRef.current.currentTime + amount;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fallback logic for when there is no audioUrl (uses SpeechSynthesis)
  const handleSynthPlay = () => {
    if (hasPlayedSynth) return;
    setIsPlaying(true);
    setHasPlayedSynth(true);
    const utterance = new SpeechSynthesisUtterance(transcript);
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('en-GB'));
    const usVoice = voices.find(v => v.lang.includes('en-US'));
    if (ukVoice) utterance.voice = ukVoice;
    else if (usVoice) utterance.voice = usVoice;
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 flex flex-col md:flex-row items-center gap-4 shadow-sm w-full mb-6">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={togglePlayPause}
          disabled={hasPlayedSynth && !audioUrl}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            hasPlayedSynth && !audioUrl 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
          }`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">{audioUrl ? 'Listening Track' : 'Start Synthesis'}</span>
          {isPlaying && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Playing</span>
            </div>
          )}
        </div>
      </div>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => { setIsPlaying(false); if(onComplete) onComplete(); }}
          />

          <div className="flex-1 flex items-center gap-3 w-full">
            <span className="text-xs font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs font-mono text-slate-400 w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 border-l border-slate-700 pl-3">
            <button 
              onClick={() => skip(-5)} 
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Rewind 5s"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={() => skip(5)} 
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Forward 5s"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
