import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, AlertCircle, HelpCircle, Award, RefreshCw, Clock, Sparkles
} from 'lucide-react';

export function QuizView({ 
  quizQuestions = [], 
  onQuizFinished, // callback to update global stats
  onAddMistake // callback to save to mistake notebook
}) {
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Timer state
  const [timeTaken, setTimeTaken] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);

  // Weak areas tracking
  const [failedDifficulties, setFailedDifficulties] = useState([]);
  const [history, setHistory] = useState([]); // tracks { questionId, difficulty, correct }

  // 1. Initialize Adaptive Quiz session
  // We want to create an adaptive path of 6 questions.
  // We separate the 12 questions by difficulty: easy, medium, hard.
  useEffect(() => {
    if (quizQuestions.length === 0) return;
    
    const easy = quizQuestions.filter(q => q.difficulty === 'easy');
    const medium = quizQuestions.filter(q => q.difficulty === 'medium');
    const hard = quizQuestions.filter(q => q.difficulty === 'hard');

    // Start with a medium question
    const startQ = medium[0] || easy[0] || hard[0];
    if (startQ) {
      setSessionQuestions([startQ]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizComplete(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTotalTime(0);
      setQuestionStartTime(Date.now());
      setHistory([]);
      setFailedDifficulties([]);
    }
  }, [quizQuestions]);

  const activeQuestion = sessionQuestions[currentQuestionIndex];

  const handleSelectAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswered) return;

    const correct = selectedAnswer === activeQuestion.correctAnswer;
    const elapsedSeconds = Math.round((Date.now() - questionStartTime) / 1000);
    setTotalTime(prev => prev + elapsedSeconds);
    setIsAnswered(true);

    if (correct) {
      setScore(s => s + 1);
    } else {
      // Log to Mistake Notebook
      if (onAddMistake) {
        onAddMistake({
          ...activeQuestion,
          userAnswer: selectedAnswer,
          loggedAt: new Date().toISOString()
        });
      }
      setFailedDifficulties(prev => [...prev, activeQuestion.difficulty]);
    }

    // Save to history
    setHistory(prev => [...prev, { 
      questionId: activeQuestion.id, 
      difficulty: activeQuestion.difficulty, 
      correct 
    }]);
  };

  const handleNextQuestion = () => {
    // Check if session has reached target limit (6 questions)
    const MAX_QUESTIONS = 6;
    
    if (sessionQuestions.length >= MAX_QUESTIONS || sessionQuestions.length >= quizQuestions.length) {
      // Quiz Finished!
      setQuizComplete(true);
      if (onQuizFinished) {
        const finalPercent = Math.round((score / sessionQuestions.length) * 100);
        onQuizFinished(finalPercent, sessionQuestions.length);
      }
      return;
    }

    // ADAPTIVE DIFFICULTY LOGIC:
    // Check if the current answer was correct
    const lastResult = history[history.length - 1];
    const currentDiff = activeQuestion.difficulty;
    
    let nextDiff = 'medium';
    if (lastResult.correct) {
      // Step up difficulty: easy -> medium -> hard
      nextDiff = currentDiff === 'easy' ? 'medium' : 'hard';
    } else {
      // Step down difficulty: hard -> medium -> easy
      nextDiff = currentDiff === 'hard' ? 'medium' : 'easy';
    }

    // Find questions matching the target difficulty that haven't been asked yet
    const askedIds = new Set(sessionQuestions.map(q => q.id));
    let candidates = quizQuestions.filter(q => q.difficulty === nextDiff && !askedIds.has(q.id));

    // Fallbacks if no questions of target difficulty remain
    if (candidates.length === 0) {
      candidates = quizQuestions.filter(q => q.difficulty === 'medium' && !askedIds.has(q.id));
    }
    if (candidates.length === 0) {
      candidates = quizQuestions.filter(q => !askedIds.has(q.id));
    }

    if (candidates.length > 0) {
      // Pick the first candidate and append to session questions
      const nextQ = candidates[0];
      setSessionQuestions(prev => [...prev, nextQ]);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      // No more questions available, end quiz
      setQuizComplete(true);
      if (onQuizFinished) {
        const finalPercent = Math.round((score / sessionQuestions.length) * 100);
        onQuizFinished(finalPercent, sessionQuestions.length);
      }
    }
  };

  const handleReset = () => {
    // Restart quiz
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTotalTime(0);
    setQuestionStartTime(Date.now());
    setHistory([]);
    setFailedDifficulties([]);
    
    // Pick first question again
    const easy = quizQuestions.filter(q => q.difficulty === 'easy');
    const medium = quizQuestions.filter(q => q.difficulty === 'medium');
    const hard = quizQuestions.filter(q => q.difficulty === 'hard');
    const startQ = medium[0] || easy[0] || hard[0];
    if (startQ) {
      setSessionQuestions([startQ]);
    }
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <p>No quiz questions available. Please input some notes first.</p>
      </div>
    );
  }

  // End of Quiz Screen
  if (quizComplete) {
    const accuracy = Math.round((score / sessionQuestions.length) * 100);
    const uniqueFailedDiffs = [...new Set(failedDifficulties)];
    
    let summaryText = 'Excellent work! You demonstrated outstanding conceptual mastery.';
    if (accuracy < 50) {
      summaryText = 'Targeted revision is recommended. Review the concepts and re-test mistakes.';
    } else if (accuracy < 80) {
      summaryText = 'Solid understanding. Focus on reviewing the weak topics to reach full mastery.';
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
            <Award size={48} />
          </div>
          <h2 style={{ fontSize: '24px' }}>Assessment Report</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Adaptive cognitive path complete.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px',
          padding: '20px 0',
          borderBlock: '1px solid var(--border-color)' 
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Score</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{score}/{sessionQuestions.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Accuracy</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: accuracy >= 70 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
              {accuracy}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Time Taken</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{totalTime}s</div>
          </div>
        </div>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>Summary Evaluation</div>
          <p style={{ fontSize: '13px' }}>{summaryText}</p>
          
          {uniqueFailedDiffs.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent-red)', marginBottom: '6px' }}>
                Weak Areas (Difficulty Mismatch)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {uniqueFailedDiffs.map((diff, i) => (
                  <span key={i} style={{ 
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'var(--accent-red-light)', 
                    color: 'var(--accent-red)',
                    border: '1px solid var(--accent-red-border)'
                  }}>
                    Failed {diff.toUpperCase()} Questions
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleReset} className="btn btn-primary" style={{ flex: 1 }}>
            <RefreshCw size={16} /> Retest Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Quiz Progress header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Question <strong>{currentQuestionIndex + 1}</strong> of <strong>6</strong> (Adaptive Track)
        </span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600',
          padding: '3px 8px', 
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeQuestion.difficulty === 'hard' ? 'var(--accent-red-light)' : activeQuestion.difficulty === 'medium' ? 'var(--accent-amber-light)' : 'var(--accent-emerald-light)',
          color: activeQuestion.difficulty === 'hard' ? 'var(--accent-red)' : activeQuestion.difficulty === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
        }}>
          {activeQuestion.difficulty.toUpperCase()}
        </span>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', lineHeight: '1.4' }}>
          {activeQuestion.question}
        </h3>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeQuestion.options.map((option, idx) => {
            let borderStyle = 'var(--border-color)';
            let bgStyle = 'var(--bg-surface-hover)';
            let icon = null;

            if (isAnswered) {
              if (option === activeQuestion.correctAnswer) {
                borderStyle = 'var(--accent-emerald)';
                bgStyle = 'var(--accent-emerald-light)';
                icon = <Check size={16} style={{ color: 'var(--accent-emerald)' }} />;
              } else if (option === selectedAnswer) {
                borderStyle = 'var(--accent-red)';
                bgStyle = 'var(--accent-red-light)';
                icon = <X size={16} style={{ color: 'var(--accent-red)' }} />;
              }
            } else if (option === selectedAnswer) {
              borderStyle = 'var(--accent-emerald)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: bgStyle,
                  border: `1px solid ${borderStyle}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: isAnswered ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        {!isAnswered ? (
          <button 
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
          >
            Submit Answer <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
          >
            Next Question <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Answer Feedback Detail drawer */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              backgroundColor: 'var(--bg-surface-hover)', 
              borderColor: selectedAnswer === activeQuestion.correctAnswer ? 'var(--accent-emerald-border)' : 'var(--accent-red-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
              {selectedAnswer === activeQuestion.correctAnswer ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Correct!
                </span>
              ) : (
                <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} /> Incorrect
                </span>
              )}
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{activeQuestion.explanation}</p>
            
            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div>
                <strong style={{ color: 'var(--accent-amber)' }}>Common Pitfall:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeQuestion.commonMistake}</p>
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong>Real World Example:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeQuestion.realExample}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default QuizView;
