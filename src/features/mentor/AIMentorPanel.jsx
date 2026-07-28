import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, MessageSquare, HelpCircle, Lightbulb, Compass, Award, ShieldAlert, ArrowRight, BookOpen 
} from 'lucide-react';
import { aiOrchestrator } from '../../services/aiOrchestrator';
import { MentorResponseSchema } from '../../schemas';

export function AIMentorPanel({ activeSession, studentProfile, mistakes = [] }) {
  const [requestType, setRequestType] = useState('general');
  const [mentorData, setMentorData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  // Trigger loading mentor advice when component loads or session changes
  useEffect(() => {
    handleLoadAdvice('general');
  }, [activeSession]);

  const handleLoadAdvice = async (type) => {
    setIsLoading(true);
    setRequestType(type);
    setRevealedAnswers(new Set());

    try {
      const notesContext = activeSession ? activeSession.notes : '';
      const weakTopics = studentProfile?.weakTopics || [];
      
      const result = await aiOrchestrator.request({
        mode: 'mentor',
        notes: notesContext,
        context: {
          subject: activeSession?.title || 'General Studies',
          goal: studentProfile?.goal || 'Learn From Scratch',
          weakTopics,
          recentMistakes: mistakes
        },
        schema: MentorResponseSchema,
        requestType: type
      });

      setMentorData(result.data);

      // Trigger event
      aiOrchestrator.emit('MENTOR_REQUESTED', { requestType: type });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAnswer = (idx) => {
    const next = new Set(revealedAnswers);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.push ? next.push(idx) : next.add(idx); // Standard Set.add()
    }
    setRevealedAnswers(next);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Left Column: Mentor Status & Control */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Mentor Avatar Header */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(24, 24, 28, 0) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'var(--bg-base)'
          }}>
            🧙‍♂️
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Lumina AI Study Mentor</h3>
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Sparkles size={11} /> Personal Coach Active
            </span>
          </div>
        </div>

        {/* Action Selector Menu */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>Request Coaching Action:</h4>
          
          {[
            { id: 'general', label: 'Overall Strategy & Guidance', icon: <Compass size={14} /> },
            { id: 'analogy', label: 'Explain with visual analogy', icon: <Lightbulb size={14} /> },
            { id: 'simpler_explanation', label: 'Explain like I\'m 10 (ELI5)', icon: <BookOpen size={14} /> },
            { id: 'test_me', label: 'Generate 3 simple self-tests', icon: <HelpCircle size={14} /> }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleLoadAdvice(btn.id)}
              disabled={isLoading}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                textAlign: 'left',
                backgroundColor: requestType === btn.id ? 'var(--accent-emerald-light)' : 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                borderColor: requestType === btn.id ? 'var(--accent-emerald)' : 'var(--border-color)',
                color: requestType === btn.id ? 'var(--accent-emerald)' : 'var(--text-secondary)'
              }}
            >
              {btn.icon}
              <span style={{ flex: 1 }}>{btn.label}</span>
              <ArrowRight size={12} style={{ opacity: 0.6 }} />
            </button>
          ))}
        </div>

        {/* Mistakes Status */}
        {mistakes.length > 0 && (
          <div className="card" style={{ borderColor: 'var(--accent-amber-border)', display: 'flex', gap: '12px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--accent-amber)' }}>Notebook Alert</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                You have {mistakes.length} mistakes saved in your Mistake Notebook. The mentor references these to build analogies.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Mentor Response Area */}
      <div style={{ gridColumn: 'span 2' }}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Skeleton Loading State */
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card text-center"
              style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
            >
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div>
                <h4 style={{ fontWeight: '600' }}>AI Mentor Consulting Notes...</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Formulating customized feedback based on student profile history.</p>
              </div>
            </motion.div>
          ) : mentorData ? (
            /* Mentor Dialogue Content */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Main Mentor Chat Bubble */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} /> Mentor Feedback
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {mentorData.message}
                </p>
                {mentorData.weakTopicAdvice && (
                  <div style={{
                    fontSize: '13px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-amber-light)',
                    color: 'var(--accent-amber)',
                    border: '1px solid var(--accent-amber-border)',
                    fontWeight: '500'
                  }}>
                    💡 {mentorData.weakTopicAdvice}
                  </div>
                )}
              </div>

              {/* Analogy / ELI5 Display Section */}
              {mentorData.analogyOrExplanation && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: 'var(--accent-emerald)' }}>
                    {requestType === 'analogy' ? 'Visual Concept Analogy' : 'Simplified Explanation (ELI5)'}
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {mentorData.analogyOrExplanation}
                  </p>
                </div>
              )}

              {/* Practice Questions self-test Section */}
              {requestType === 'test_me' && mentorData.practiceQuestions?.length > 0 && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HelpCircle size={15} /> Diagnostic Questions
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mentorData.practiceQuestions.map((q, idx) => {
                      const isRevealed = revealedAnswers.has(idx);
                      
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            padding: '14px', 
                            backgroundColor: 'var(--bg-surface-hover)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>
                            {idx + 1}. {q.question}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Hint: {q.hint}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button 
                              onClick={() => handleToggleAnswer(idx)} 
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                            </button>
                          </div>

                          {isRevealed && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ 
                                marginTop: '10px', 
                                padding: '10px 14px', 
                                borderLeft: '3px solid var(--accent-emerald)', 
                                backgroundColor: 'var(--bg-surface)', 
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.5'
                              }}
                            >
                              <strong>Answer explanation:</strong> {q.answer}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Motivation Footer */}
              {mentorData.motivation && (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Award size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span>"{mentorData.motivation}"</span>
                </div>
              )}

            </motion.div>
          ) : (
            <div className="card text-center" style={{ padding: '40px' }}>
              <p>Failed to generate mentor recommendations.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default AIMentorPanel;
