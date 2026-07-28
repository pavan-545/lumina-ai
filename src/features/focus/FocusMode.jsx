import React from 'react';
import { motion } from 'framer-motion';
import { X, EyeOff, Clock, Coffee } from 'lucide-react';

export function FocusMode({ 
  title = 'Study Session', 
  timer, 
  onExit, 
  children 
}) {
  const { formatTime, mode, isActive } = timer;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0c', // even darker graphite for absolute concentration
        color: 'var(--text-primary)',
        zIndex: 999,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
        
        {/* Distraction Free Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px' 
        }}>
          {/* Logo / Session Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              padding: '6px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)',
              color: 'var(--accent-emerald)'
            }}>
              <EyeOff size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Focusing: {title}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Distraction-free environment active</p>
            </div>
          </div>

          {/* Inline Timer */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)'
          }}>
            {mode === 'study' ? (
              <Clock size={14} className={isActive ? "loading-pulse" : ""} style={{ color: 'var(--accent-emerald)' }} />
            ) : (
              <Coffee size={14} style={{ color: 'var(--accent-amber)' }} />
            )}
            <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              {mode === 'study' ? 'STUDY: ' : 'BREAK: '} {formatTime()}
            </span>
          </div>

          {/* Close / Exit Button */}
          <button 
            onClick={onExit}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            Exit Focus <X size={14} />
          </button>
        </div>

        {/* Study Content Player Wrapper */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px 0' 
        }}>
          <div style={{ width: '100%', maxWidth: '640px' }}>
            {children}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
export default FocusMode;
