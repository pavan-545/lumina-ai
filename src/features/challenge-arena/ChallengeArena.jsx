import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Play, CheckCircle, XCircle, Award, Clock, ArrowLeft, Send, Sparkles, Zap 
} from 'lucide-react';
import { aiOrchestrator } from '../../services/aiOrchestrator';
import { ChallengeSchema, ChallengeEvaluationSchema } from '../../schemas';

const LEVELS = [
  { id: 1, name: 'Level 1: Beginner', desc: 'Core conceptual identification & basics', xp: 100 },
  { id: 2, name: 'Level 2: Intermediate', desc: 'Simple case analysis & bug fixes', xp: 200 },
  { id: 3, name: 'Level 3: Advanced', desc: 'Deep multi-factor problem solving', xp: 300 },
  { id: 4, name: 'Level 4: Expert', desc: 'Complex system diagnosis & designs', xp: 400 },
  { id: 5, name: 'Level 5: Boss Challenge', desc: 'Ultimate comprehensive examination', xp: 500 },
];

export function ChallengeArena({ activeSession, studentProfile, onUpdateProfile }) {
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  // Gameplay states
  const [challengeData, setChallengeData] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Load unlocked level from local storage
  useEffect(() => {
    if (activeSession) {
      try {
        const key = `unlocked_level_${activeSession.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          setUnlockedLevel(parseInt(stored));
        } else {
          setUnlockedLevel(1);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeSession]);

  const handleStartChallenge = async (levelObj) => {
    if (!activeSession) return;
    setSelectedLevel(levelObj);
    setIsLoadingChallenge(true);
    setEvaluation(null);
    setStudentAnswer('');

    try {
      const result = await aiOrchestrator.request({
        mode: 'challenge',
        notes: activeSession.notes,
        context: {
          subject: activeSession.title,
          goal: studentProfile?.goal || 'Master This Topic',
          currentLevel: studentProfile?.level || 1,
          xp: studentProfile?.xp || 0
        },
        schema: ChallengeSchema,
        level: levelObj.id,
        type: levelObj.id === 5 ? 'Boss' : 'Progression'
      });

      setChallengeData(result.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate challenge. Using cache fallback if available.');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim() || isSubmitting || !challengeData) return;

    setIsSubmitting(true);
    try {
      const result = await aiOrchestrator.request({
        mode: 'evaluate_challenge',
        notes: activeSession.notes,
        context: {
          subject: activeSession.title,
          goal: studentProfile?.goal || 'Master This Topic',
          currentLevel: studentProfile?.level || 1,
          xp: studentProfile?.xp || 0
        },
        schema: ChallengeEvaluationSchema,
        studentAnswer,
        challengeData
      });

      const evalData = result.data;
      setEvaluation(evalData);

      // Trigger Orchestrator Event
      aiOrchestrator.emit('CHALLENGE_COMPLETED', {
        level: selectedLevel.id,
        score: evalData.score,
        passed: evalData.passed
      });

      if (evalData.passed) {
        // Gain XP
        const earnedXP = selectedLevel.xp * (evalData.score / 100);
        const finalXP = Math.round(earnedXP);

        let isLevelUp = false;
        let newUnlocked = unlockedLevel;

        // Unlock next level
        if (selectedLevel.id === unlockedLevel && unlockedLevel < 5) {
          newUnlocked = unlockedLevel + 1;
          setUnlockedLevel(newUnlocked);
          localStorage.setItem(`unlocked_level_${activeSession.id}`, newUnlocked.toString());
        }

        // Call parent to update state
        onUpdateProfile(finalXP, selectedLevel.id === 5 && evalData.passed, `level_${selectedLevel.id}`);
      }

    } catch (err) {
      console.error(err);
      alert('Failed to evaluate solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setChallengeData(null);
    setEvaluation(null);
    setStudentAnswer('');
  };

  if (!activeSession) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <h3>No Study Session Selected</h3>
        <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
          Please go to the Study Hub and generate or load a study set first to start progression challenges.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} style={{ color: 'var(--accent-amber)' }} /> AI Challenge Arena
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Subject: <strong>{activeSession.title}</strong> &bull; Complete challenges to unlock higher levels and earn XP.
          </p>
        </div>
        
        {selectedLevel && (
          <button onClick={handleBackToLevels} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={13} /> Back to Map
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedLevel ? (
          /* Progression Map View */
          <motion.div
            key="levels-map"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Arena Progression Status</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                  {unlockedLevel === 5 ? '🔓 Boss Level Unlocked!' : `Level ${unlockedLevel} / 5 In Progress`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div 
                    key={lvl}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: lvl < unlockedLevel ? 'var(--accent-emerald)' : lvl === unlockedLevel ? 'var(--accent-amber)' : 'var(--border-color)',
                      border: lvl === unlockedLevel ? '2px solid rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= unlockedLevel;
                
                return (
                  <div
                    key={lvl.id}
                    onClick={() => isUnlocked && handleStartChallenge(lvl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      backgroundColor: isUnlocked ? 'var(--bg-surface)' : 'rgba(24, 24, 28, 0.4)',
                      border: '1px solid var(--border-color)',
                      borderColor: lvl.id === unlockedLevel ? 'var(--accent-amber-border)' : 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      opacity: isUnlocked ? 1 : 0.6,
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      transition: 'all var(--transition-fast)'
                    }}
                    className={isUnlocked ? 'hover-card' : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: lvl.id === 5 ? 'rgba(239, 68, 68, 0.08)' : isUnlocked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        color: lvl.id === 5 ? 'var(--accent-red)' : isUnlocked ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {lvl.id === 5 ? '💀' : lvl.id}
                      </div>

                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: lvl.id === unlockedLevel ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                          {lvl.name} {lvl.id < unlockedLevel && '✓'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {lvl.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Reward:</span> <strong style={{ color: 'var(--accent-emerald)' }}>+{lvl.xp} XP</strong>
                      </div>
                      
                      {isUnlocked ? (
                        <div style={{ color: 'var(--accent-emerald)' }}>
                          <Play size={16} fill="currentColor" />
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)' }}>
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Active Challenge Play View */
          <motion.div
            key="active-challenge"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {isLoadingChallenge ? (
              /* Loading Challenge State */
              <div className="card text-center" style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div>
                  <h4 style={{ fontWeight: '600' }}>Formulating Level {selectedLevel.id} Scenario...</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>AI is checking concepts and designing a practical test.</p>
                </div>
              </div>
            ) : challengeData ? (
              /* Play Board */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Scenario details card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: `4px solid ${selectedLevel.id === 5 ? 'var(--accent-red)' : 'var(--accent-emerald)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Challenge Scenario
                    </span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {challengeData.timeLimit}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> {challengeData.points} XP</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', margin: 0 }}>{challengeData.title}</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {challengeData.description}
                  </p>

                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <strong>Instructions:</strong> {challengeData.instructions}
                  </div>
                </div>

                {/* Response Entry Form */}
                {!evaluation ? (
                  <form onSubmit={handleSubmitSolution} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="input-label" htmlFor="solution-input">Your Solution</label>
                      <textarea
                        id="solution-input"
                        className="input-field"
                        rows={6}
                        placeholder={challengeData.placeholder || "Write your explanation or answer in detail here..."}
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        disabled={isSubmitting}
                        style={{ resize: 'vertical', fontSize: '14px', lineHeight: '1.5' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!studentAnswer.trim() || isSubmitting}
                      style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          AI Evaluator Scoring Response...
                        </>
                      ) : (
                        <><Send size={14} /> Submit Solution</>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Evaluation Card Results */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      borderColor: evaluation.passed ? 'var(--accent-emerald-border)' : 'var(--accent-red-border)',
                      backgroundColor: evaluation.passed ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {evaluation.passed ? (
                          <CheckCircle size={22} style={{ color: 'var(--accent-emerald)' }} />
                        ) : (
                          <XCircle size={22} style={{ color: 'var(--accent-red)' }} />
                        )}
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {evaluation.passed ? 'Challenge Passed!' : 'Challenge Failed'}
                        </h4>
                      </div>

                      <div style={{ fontSize: '24px', fontWeight: '800', color: evaluation.passed ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                        {evaluation.score} / 100
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {evaluation.feedback}
                    </p>

                    {evaluation.keyCorrections?.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Key Recommended Corrections:</strong>
                        <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {evaluation.keyCorrections.map((corr, idx) => (
                            <li key={idx}>{corr}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      {evaluation.passed ? (
                        <button onClick={handleBackToLevels} className="btn btn-primary" style={{ flex: 1 }}>
                          Continue Progression
                        </button>
                      ) : (
                        <button onClick={() => setEvaluation(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                          Try Again
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="card text-center" style={{ padding: '40px' }}>
                <p>Failed to load challenge description. Please try again.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .hover-card:hover {
          border-color: var(--accent-emerald) !important;
          background-color: var(--border-color) !important;
        }
      `}</style>
    </div>
  );
}

export default ChallengeArena;
