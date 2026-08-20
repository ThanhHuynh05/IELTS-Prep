import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import useTimer from '../hooks/useTimer';
import Listening from './Listening';
import Reading from './Reading';
import Writing from './Writing';
import Speaking from './Speaking';
import MockTestResults from '../components/mock/MockTestResults';

const SECTIONS = [
  { id: 'listening', title: 'Listening', component: Listening, minutes: 30 },
  { id: 'reading', title: 'Reading', component: Reading, minutes: 60 },
  { id: 'writing', title: 'Writing', component: Writing, minutes: 60 },
  { id: 'speaking', title: 'Speaking', component: Speaking, minutes: 14 }
];

export default function MockTest() {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [results, setResults] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const currentSection = SECTIONS[currentSectionIndex];

  // Callback when timer hits 0
  const handleExpire = () => {
    // If they run out of time without submitting, they get whatever they had, or 0.
    // To cleanly advance, we simulate an empty submission.
    // The specific components don't auto-grade partial work currently if we just force next.
    // So we'll assign a 0 for that section if they timeout completely.
    handleSectionSubmit({ estimatedBand: 0, rawScore: 0, maxScore: 40 });
  };

  const timer = useTimer(currentSection?.minutes || 1, handleExpire);

  const startTest = () => {
    setHasStarted(true);
    timer.start();
  };

  const handleSectionSubmit = (sectionResult) => {
    timer.stop();
    setResults(prev => ({
      ...prev,
      [currentSection.id]: sectionResult
    }));
    
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      timer.reset(SECTIONS[currentSectionIndex + 1].minutes);
      timer.start();
    } else {
      setIsFinished(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center animate-in fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">IELTS Mock Test</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You are about to start a full, timed IELTS mock exam. The test will run in the following order:
          <br/><br/>
          <strong>Listening</strong> (30 minutes)<br/>
          <strong>Reading</strong> (60 minutes)<br/>
          <strong>Writing</strong> (60 minutes)<br/>
          <strong>Speaking</strong> (14 minutes)<br/><br/>
          Once started, the timer cannot be paused. If the timer expires, the section will automatically close.
        </p>
        <button
          onClick={startTest}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all text-lg"
        >
          Begin Mock Test
        </button>
      </div>
    );
  }

  if (isFinished) {
    return <MockTestResults results={results} onRestart={() => navigate('/dashboard')} />;
  }

  const CurrentComponent = currentSection.component;

  // Determine timer color based on time left
  let timerColor = "text-gray-700";
  if (timer.secondsRemaining < 300) timerColor = "text-orange-500"; // Under 5 mins
  if (timer.secondsRemaining < 60) timerColor = "text-red-600 animate-pulse"; // Under 1 min

  return (
    <div className="flex flex-col h-full relative">
      {/* Persistent Timer Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl text-gray-900">{currentSection.title}</div>
          <div className="flex space-x-1">
            {SECTIONS.map((sec, idx) => (
              <div 
                key={sec.id} 
                className={`w-2 h-2 rounded-full ${idx === currentSectionIndex ? 'bg-blue-600' : idx < currentSectionIndex ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to end the mock test early? You will be taken to the results screen.")) {
                timer.stop();
                setIsFinished(true);
              }
            }}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            End Test Early
          </button>
          <div className={`flex items-center space-x-2 font-mono text-2xl font-bold bg-gray-50 px-4 py-2 rounded-lg border ${timerColor}`}>
            <Clock size={24} />
            <span>{timer.formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Component Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        <CurrentComponent 
          isMockMode={true} 
          onMockSubmit={handleSectionSubmit} 
        />
      </div>
    </div>
  );
}
