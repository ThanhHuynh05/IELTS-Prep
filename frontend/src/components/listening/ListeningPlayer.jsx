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
    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <Volume2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Listening Audio Track</h3>
            <p className="text-slate-400 text-sm">Control your playback below</p>
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

      {audioUrl ? (
        <div className="space-y-4 bg-slate-800 rounded-lg p-5 border border-slate-700">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => { setIsPlaying(false); if(onComplete) onComplete(); }}
          />

          {/* Custom Timeline */}
          <div className="flex items-center space-x-3 text-sm font-mono text-slate-300">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 pt-2">
            <button 
              onClick={() => skip(-5)} 
              className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center"
              title="Rewind 5 seconds"
            >
              <RotateCcw size={20} />
              <span className="text-[10px] mt-1 font-bold">-5s</span>
            </button>

            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              onClick={() => skip(5)} 
              className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center"
              title="Forward 5 seconds"
            >
              <RotateCw size={20} />
              <span className="text-[10px] mt-1 font-bold">+5s</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-center border border-slate-700">
          <button
            onClick={togglePlayPause}
            disabled={hasPlayedSynth || isPlaying}
            className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all ${
              hasPlayedSynth 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
            }`}
          >
            {hasPlayedSynth ? (
              <span>Playback Complete</span>
            ) : (
              <>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                <span>{isPlaying ? 'Playing Synthesis' : 'Start Audio (Synthesis)'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
