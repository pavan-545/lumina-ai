import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, ShieldAlert, Award, Clock, BookOpen, Sparkles, HelpCircle, GraduationCap, ChevronRight 
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.4 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export function SubjectAnalysisCard({ analysis, onConfirm, onReset, selectedGoal, onGoalChange }) {
  const [agreedPrereqs, setAgreedPrereqs] = useState(false);

  const {
    subject = 'Universal Subject',
    topics = [],
    prerequisites = [],
    difficulty = 'Intermediate',
    estimatedTime = '35 minutes',
    learningOrder = [],
    recommendedModes = [],
    confidence = '90%',
    learningObjectives = [],
    studyStrategy = []
  } = analysis;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="card"
      style={{
        maxWidth: '850px',
        margin: '0 auto',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, rgba(24, 24, 28, 0) 100%)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Subject Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            color: 'var(--accent-emerald)',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '6px'
          }}>
            <Sparkles size={12} /> AI Content Profiler
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0 }}>{subject}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-emerald-light)',
            color: 'var(--accent-emerald)',
            border: '1px solid var(--accent-emerald-border)'
          }}>
            AI Confidence: {confidence}
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-amber-light)',
            color: 'var(--accent-amber)',
            border: '1px solid var(--accent-amber-border)'
          }}>
            {difficulty}
          </div>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

      {/* Preferences & Goal Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="input-label" htmlFor="goal-select" style={{ fontSize: '13px', fontWeight: '600' }}>Active Study Goal</label>
          <select 
            id="goal-select"
            className="input-field"
            value={selectedGoal}
            onChange={(e) => onGoalChange(e.target.value)}
            style={{ fontSize: '13px' }}
          >
            <option value="Learn From Scratch">🌱 Learn From Scratch (Comprehensive Foundations)</option>
            <option value="Quick Revision">⚡ Quick Revision (High-impact Summaries)</option>
            <option value="Exam Preparation">📝 Exam Preparation (Focussed Quizzes)</option>
            <option value="Interview Preparation">💼 Interview Prep (Technical Q&A)</option>
            <option value="Master This Topic">👑 Master This Topic (Complex Challenges)</option>
            <option value="30-Minute Revision">⏱️ 30-Minute Speed study</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-surface-hover)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Clock size={20} style={{ color: 'var(--accent-emerald)' }} />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Estimated Strategy Duration</div>
            <strong style={{ fontSize: '15px' }}>{estimatedTime}</strong>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginTop: '8px' }}>
        
        {/* Left Column: Topics & Objectives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key Topics */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> Covered Topics
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {topics.map((t, idx) => (
                <span key={idx} style={{
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.03)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 'bold' }}>
                <ShieldAlert size={16} /> Prerequisite Knowledge Recommended
              </div>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                {prerequisites.map((p, idx) => <li key={idx}>{p}</li>)}
              </ul>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginTop: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={agreedPrereqs} 
                  onChange={(e) => setAgreedPrereqs(e.target.checked)} 
                  style={{ accentColor: 'var(--accent-emerald)' }} 
                />
                I understand these concepts, or proceed anyway
              </label>
            </div>
          )}

          {/* Objectives */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} /> Learning Objectives
            </h4>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {learningObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column: Study Strategy Progression */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} /> Dynamic Study Pathway
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {studyStrategy.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {step.step}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{step.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.time}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {step.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button 
          onClick={onReset} 
          className="btn btn-secondary" 
          style={{ padding: '12px 24px', flex: 1 }}
        >
          Modify Notes Text
        </button>
        <button 
          onClick={onConfirm} 
          className="btn btn-primary" 
          style={{ padding: '12px 32px', flex: 2 }}
          disabled={prerequisites.length > 0 && !agreedPrereqs}
        >
          Initialize Interactive Study Vault <ChevronRight size={16} />
        </button>
      </div>

    </motion.div>
  );
}

export default SubjectAnalysisCard;
