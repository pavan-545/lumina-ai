import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Send, ChevronRight, HelpCircle, AlertCircle, Award, Sparkles, CheckSquare
} from 'lucide-react';

export function InterviewPractice({ 
  questions = [],
  onAnswerSubmitted // callback for analytics
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selfGrade, setSelfGrade] = useState(null);

  const activeQuestion = questions[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    setShowEvaluation(true);
  };

  const handleGrade = (grade) => {
    setSelfGrade(grade);
    if (onAnswerSubmitted) {
      onAnswerSubmitted(grade);
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowEvaluation(false);
    setSelfGrade(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  if (questions.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <p>No interview practice questions generated for this set.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header index info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Interview Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>
        </span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600',
          padding: '3px 8px', 
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeQuestion.difficulty === 'hard' ? 'var(--accent-red-light)' : activeQuestion.difficulty === 'medium' ? 'var(--accent-amber-light)' : 'var(--accent-emerald-light)',
          color: activeQuestion.difficulty === 'hard' ? 'var(--accent-red)' : activeQuestion.difficulty === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
          border: `1px solid ${activeQuestion.difficulty === 'hard' ? 'var(--accent-red-border)' : activeQuestion.difficulty === 'medium' ? 'var(--accent-amber-border)' : 'var(--accent-emerald-border)'}`
        }}>
          {activeQuestion.difficulty.toUpperCase()}
        </span>
      </div>

      {/* Primary Interview Question Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
            <Briefcase size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Interviewer Prompt
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '500', lineHeight: '1.4', marginTop: '4px' }}>
              {activeQuestion.question}
            </h3>
          </div>
        </div>

        {/* User response form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            className="input-field"
            rows="5"
            placeholder="Type your detailed professional response here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showEvaluation}
            style={{ resize: 'vertical', fontSize: '14px', lineHeight: '1.5' }}
          />

          {!showEvaluation && (
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!userAnswer.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              Submit Response <Send size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Interviewer Feedback Card */}
      <AnimatePresence>
        {showEvaluation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-surface-hover)' }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '600', textTransform: 'uppercase' }}>
                Ideal Response
              </span>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.6' }}>
                {activeQuestion.idealAnswer}
              </p>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Interviewer Rubric & Explanation
              </span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                {activeQuestion.explanation}
              </p>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

            {/* Self-Assessment Panel */}
            {!selfGrade ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Rate your answer match:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleGrade('Matches')} 
                    className="btn btn-secondary"
                    style={{ flex: 1, border: '1px solid var(--accent-emerald-border)', color: 'var(--accent-emerald)' }}
                  >
                    Matches Ideal
                  </button>
                  <button 
                    onClick={() => handleGrade('Partial')} 
                    className="btn btn-secondary"
                    style={{ flex: 1, border: '1px solid var(--accent-amber-border)', color: 'var(--accent-amber)' }}
                  >
                    Partial Match
                  </button>
                  <button 
                    onClick={() => handleGrade('Weak')} 
                    className="btn btn-secondary"
                    style={{ flex: 1, border: '1px solid var(--accent-red-border)', color: 'var(--accent-red)' }}
                  >
                    Needs Review
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Self-assessment score logged: <strong>{selfGrade}</strong>
                </span>
                <button onClick={handleNext} className="btn btn-primary">
                  Next Question <ChevronRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default InterviewPractice;
