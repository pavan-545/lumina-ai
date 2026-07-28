import React, { useState } from 'react';
import { 
  Play, Pause, RotateCw, SkipForward, Clock, Coffee, Sparkles, X, ChevronRight, ChevronLeft
} from 'lucide-react';

export function PomodoroWidget({ timer }) {
  const {
    timeLeft,
    isActive,
    mode,
    completedCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipInterval,
    formatTime,
    progress
  } = timer;

  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="pomodoro-widget"
        style={{ 
          cursor: 'pointer',
          padding: '12px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <Clock size={16} className={isActive ? "loading-pulse" : ""} style={{ color: mode === 'study' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
        <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{formatTime()}</span>
      </button>
    );
  }

  return (
    <div className="pomodoro-widget" style={{ flexDirection: 'column', alignItems: 'stretch', width: '220px' }}>
      
      {/* Widget Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
          {mode === 'study' ? (
            <>
              <Clock size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ color: 'var(--accent-emerald)' }}>Study Interval</span>
            </>
          ) : (
            <>
              <Coffee size={14} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ color: 'var(--accent-amber)' }}>Break Interval</span>
            </>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="btn-ghost"
          style={{ padding: '2px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Timer Text */}
      <div style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        fontFamily: 'var(--font-mono)', 
        textAlign: 'center',
        margin: '10px 0',
        letterSpacing: '-0.02em',
        color: mode === 'study' ? 'var(--accent-emerald)' : 'var(--accent-amber)'
      }}>
        {formatTime()}
      </div>

      {/* Progress Bar */}
      <div style={{ 
        width: '100%', 
        height: '4px', 
        backgroundColor: 'var(--border-color)', 
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        <div style={{ 
          width: `${progress}%`, 
          height: '100%', 
          backgroundColor: mode === 'study' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
          transition: 'width 1s linear'
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
        {isActive ? (
          <button onClick={pauseTimer} className="btn btn-secondary" style={{ padding: '6px 12px', flex: 1 }}>
            <Pause size={12} /> Pause
          </button>
        ) : (
          <button onClick={startTimer} className="btn btn-primary" style={{ padding: '6px 12px', flex: 1 }}>
            <Play size={12} fill="currentColor" /> Study
          </button>
        )}
        <button onClick={skipInterval} className="btn btn-secondary" style={{ padding: '6px' }} title="Skip">
          <SkipForward size={12} />
        </button>
        <button onClick={resetTimer} className="btn btn-secondary" style={{ padding: '6px' }} title="Reset">
          <RotateCw size={12} />
        </button>
      </div>

      {/* Footer statistics counter */}
      <div style={{ 
        fontSize: '10px', 
        color: 'var(--text-muted)', 
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '6px',
        marginTop: '4px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Sparkles size={10} style={{ color: 'var(--accent-emerald)' }} />
        <span>Completed pomodoros: <strong>{completedCount}</strong></span>
      </div>

    </div>
  );
}
export default PomodoroWidget;
