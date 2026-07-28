import { useState, useEffect, useRef } from 'react';

// Web Audio API Sound Synthesizer for premium notification sounds
const playChime = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    if (type === 'study_end') {
      // Ascending chime for completion
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      
      osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3);
    } else {
      // Descending chime for break start / end
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc1.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.15); // C5
      osc1.frequency.exponentialRampToValueAtTime(392.00, ctx.currentTime + 0.3); // G4
      
      osc2.frequency.setValueAtTime(392.00, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.3);
    }
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.warn('Audio Context sound play blocked by browser policy:', error);
  }
};

export function usePomodoro(onSessionComplete) {
  const STUDY_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60;  // 5 minutes
  
  const [timeLeft, setTimeLeft] = useState(STUDY_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('study'); // 'study' or 'break'
  const [completedCount, setCompletedCount] = useState(0);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Interval completed
            clearInterval(timerRef.current);
            setIsActive(false);
            
            if (mode === 'study') {
              playChime('study_end');
              setCompletedCount(c => c + 1);
              setMode('break');
              setTimeLeft(BREAK_TIME);
              if (onSessionComplete) {
                // report 25 mins studied
                onSessionComplete(25);
              }
            } else {
              playChime('break_end');
              setMode('study');
              setTimeLeft(STUDY_TIME);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setMode('study');
    setTimeLeft(STUDY_TIME);
  };

  const skipInterval = () => {
    setIsActive(false);
    if (mode === 'study') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
      setCompletedCount(c => c + 1);
      if (onSessionComplete) onSessionComplete(25);
    } else {
      setMode('study');
      setTimeLeft(STUDY_TIME);
    }
  };

  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'study' 
    ? ((STUDY_TIME - timeLeft) / STUDY_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return {
    timeLeft,
    isActive,
    mode,
    completedCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipInterval,
    formatTime,
    progress,
  };
}
export default usePomodoro;
