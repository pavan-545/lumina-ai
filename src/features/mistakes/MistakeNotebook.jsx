import React, { useState } from 'react';

import { 
  BookOpen, Trash2, CheckCircle2, ChevronRight, HelpCircle, RefreshCw, Check, X
} from 'lucide-react';
import { motion as framerMotion } from 'framer-motion';

export function MistakeNotebook({ mistakes = [], onRemoveMistake, onClearAll }) {
  const [retryingIndex, setRetryingIndex] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleStartRetry = (index) => {
    setRetryingIndex(index);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleSelectAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleCheckRetry = (correctAnswer) => {
    setIsAnswered(true);
  };

  const handleResolveRetry = (index, isCorrect) => {
    if (isCorrect) {
      // Remove from mistakes if resolved correctly!
      onRemoveMistake(index);
    }
    setRetryingIndex(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Mistake Notebook</h2>
          <p>Review and test yourself on questions you previously answered incorrectly.</p>
        </div>
        {mistakes.length > 0 && (
          <button 
            onClick={onClearAll}
            className="btn btn-danger"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Trash2 size={14} /> Clear Notebook
          </button>
        )}
      </div>

      {mistakes.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '16px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--accent-emerald-light)', 
            color: 'var(--accent-emerald)',
            marginBottom: '16px' 
          }}>
            <CheckCircle2 size={36} />
          </div>
          <h3>Your notebook is empty!</h3>
          <p style={{ marginTop: '8px' }}>Any questions you answer incorrectly during quizzes will automatically appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mistakes.map((item, index) => {
            const isRetrying = retryingIndex === index;

            return (
              <framerMotion.div 
                key={index}
                className="card"
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderColor: isRetrying ? 'var(--accent-emerald)' : 'var(--border-color)',
                  backgroundColor: isRetrying ? 'rgba(16, 185, 129, 0.01)' : 'var(--bg-surface)'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'var(--accent-red-light)', 
                    color: 'var(--accent-red)',
                    fontWeight: '600',
                    border: '1px solid var(--accent-red-border)'
                  }}>
                    Logged Mistake ({item.difficulty.toUpperCase()})
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isRetrying && (
                      <button 
                        onClick={() => handleStartRetry(index)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <RefreshCw size={12} /> Retry Question
                      </button>
                    )}
                    <button 
                      onClick={() => onRemoveMistake(index)}
                      className="btn btn-ghost"
                      style={{ padding: '6px' }}
                      title="Remove from notebook"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline Quiz Question Retry Interface */}
                {isRetrying ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '500' }}>{item.question}</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.options.map((option, oIdx) => {
                        let border = 'var(--border-color)';
                        let bg = 'var(--bg-surface-hover)';
                        let icon = null;

                        if (isAnswered) {
                          if (option === item.correctAnswer) {
                            border = 'var(--accent-emerald)';
                            bg = 'var(--accent-emerald-light)';
                            icon = <Check size={14} style={{ color: 'var(--accent-emerald)' }} />;
                          } else if (option === selectedAnswer) {
                            border = 'var(--accent-red)';
                            bg = 'var(--accent-red-light)';
                            icon = <X size={14} style={{ color: 'var(--accent-red)' }} />;
                          }
                        } else if (option === selectedAnswer) {
                          border = 'var(--accent-emerald)';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={isAnswered}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              backgroundColor: bg,
                              border: `1px solid ${border}`,
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--text-primary)',
                              textAlign: 'left',
                              fontSize: '13px',
                              cursor: isAnswered ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <span>{option}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      {!isAnswered ? (
                        <>
                          <button 
                            onClick={() => setRetryingIndex(null)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleCheckRetry(item.correctAnswer)}
                            disabled={!selectedAnswer}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Submit
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleResolveRetry(index, selectedAnswer === item.correctAnswer)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {selectedAnswer === item.correctAnswer ? 'Resolve & Remove' : 'Close'}
                        </button>
                      )}
                    </div>

                    {isAnswered && (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: 'var(--bg-surface-hover)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div>
                          <strong>Explanation:</strong> {item.explanation}
                        </div>
                        {item.commonMistake && (
                          <div style={{ marginTop: '4px' }}>
                            <strong style={{ color: 'var(--accent-amber)' }}>Common Pitfall:</strong> {item.commonMistake}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Display Mode */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '500', lineHeight: '1.4' }}>{item.question}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Correct Answer: </span>
                        <span>{item.correctAnswer}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <strong>Explanation:</strong> {item.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </framerMotion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default MistakeNotebook;
