import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, BookOpen, Flame, Award, ArrowRight, Play, AlertCircle, RefreshCw, Clock, Sparkles, Target, Zap, ShieldAlert 
} from 'lucide-react';
import FEATURES from '../../config/features';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export function DashboardHome({ 
  stats = {}, 
  recentSessions = [], 
  onResumeSession,
  onNavigateToStudy,
  studentProfile = {},
  activeSession = null,
  onStartDailyChallenge
}) {
  const {
    streak = 3,
    avgQuizScore = 84,
    flashcardsMastered = 18,
    totalFlashcards = 25,
    studyMinutes = 125,
    weakTopics = [],
    strongTopics = []
  } = stats;

  const {
    level = 1,
    xp = 120,
    goal = 'Learn From Scratch',
    achievements = [],
    timeline = []
  } = studentProfile;

  // XP progress calculation: next level needs level * 500 XP
  const xpNeeded = level * 500;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  // Safe percentage values
  const masterRate = totalFlashcards > 0 ? Math.round((flashcardsMastered / totalFlashcards) * 100) : 0;
  const timeProgress = Math.min(100, Math.round((studyMinutes / 180) * 100)); // target 180 mins weekly

  // Custom circular progress renderer
  const CircularProgress = ({ value, label, subtext, color = 'var(--accent-emerald)' }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4 card align-middle" style={{ minWidth: '140px', flex: 1 }}>
        <div className="circular-progress" style={{ width: '100px', height: '100px' }}>
          <svg width="100" height="100">
            <circle className="bg-circle" cx="50" cy="50" r={radius} />
            <circle 
              className="progress-circle" 
              cx="50" 
              cy="50" 
              r={radius} 
              style={{ 
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                stroke: color
              }}
            />
          </svg>
          <div className="progress-value" style={{ fontSize: '16px' }}>{value}%</div>
        </div>
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{label}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtext}</div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      
      {/* 1. Profile Level Header Card */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(24, 24, 28, 0) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            color: 'var(--accent-emerald)',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} /> Personalized Student Hub
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 10px 0' }}>Welcome back, Student</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Target size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Active Goal: <strong>{goal}</strong></span>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span>Level <strong>{level}</strong> Scholar</span>
            <span style={{ color: 'var(--text-muted)' }}>{xp} / {xpNeeded} XP</span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${xpPercent}%`, height: '100%', backgroundColor: 'var(--accent-emerald)', transition: 'width 0.4s ease' }} />
          </div>

          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Complete quizzes and progression challenges to unlock Level {level + 1}.
          </span>
        </div>
      </div>

      {/* 2. Overview stats cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Streak */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-amber-light)', color: 'var(--accent-amber)' }}>
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Study Streak</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{streak} Days</div>
          </div>
        </motion.div>

        {/* Avg quiz score */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
            <Trophy size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avg Quiz Score</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{avgQuizScore}%</div>
          </div>
        </motion.div>

        {/* Mastered Flashcards */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cards Mastered</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{flashcardsMastered}/{totalFlashcards}</div>
          </div>
        </motion.div>

        {/* Study Time */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Weekly Study Time</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{studyMinutes}m</div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        
        {/* Left Side Content (8 cols on desktop) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Circular Progress Gauges */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Progress Indicators</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
              <CircularProgress 
                value={timeProgress} 
                label="Weekly Target" 
                subtext={`${studyMinutes}/180 mins`} 
                color="var(--accent-emerald)" 
              />
              <CircularProgress 
                value={avgQuizScore} 
                label="Average Accuracy" 
                subtext="All quizzes" 
                color="var(--accent-amber)" 
              />
              <CircularProgress 
                value={masterRate} 
                label="Concept Mastery" 
                subtext={`${flashcardsMastered} mastered`} 
                color="#3b82f6" 
              />
            </div>
          </div>

          {/* 3. Daily AI Challenge Widget */}
          {FEATURES.DAILY_CHALLENGE && (
            <motion.div 
              variants={cardVariants}
              className="card"
              style={{
                border: '1px solid rgba(245, 158, 11, 0.2)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(24, 24, 28, 0) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Daily AI Challenge
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', marginBottom: '2px' }}>
                  Scenario Diagnostics Case
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Solve today's dynamic problem scenario matching your active session.
                </p>
              </div>

              <button 
                onClick={onStartDailyChallenge}
                className="btn btn-primary"
                style={{
                  backgroundColor: 'var(--accent-amber)',
                  borderColor: 'var(--accent-amber)',
                  color: 'var(--bg-base)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} fill="currentColor" /> Enter Arena
              </button>
            </motion.div>
          )}

          {/* Recent Sessions list */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Recent Sessions</h3>
              <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            
            {recentSessions.length === 0 ? (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                border: '1px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)' 
              }}>
                No study sessions saved yet. Paste some notes in the Study Hub to begin!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentSessions.slice(0, 3).map((session, index) => (
                  <div 
                    key={session.id || index}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{session.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Created on {new Date(session.createdAt).toLocaleDateString()} &middot; {session.analysisProfile?.subject || 'Detected Subject'}
                      </div>
                    </div>
                    <button 
                      onClick={() => onResumeSession(session)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Play size={12} fill="currentColor" /> Quick Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Sidebar Content (4 cols on desktop) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 4. Achievements panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Unlocked Badges</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: ach.unlocked ? 'var(--bg-surface-hover)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    opacity: ach.unlocked ? 1 : 0.4
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{ach.icon}</span>
                  <div>
                    <strong style={{ fontSize: '12px', color: ach.unlocked ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                      {ach.title} {ach.unlocked && '✓'}
                    </strong>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px' }}>{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Chronological Learning Journey Feed */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Learning Journey Timeline</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingLeft: '10px',
              borderLeft: '1px solid var(--border-color)'
            }}>
              {timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative', fontSize: '12px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-emerald)'
                  }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{event.date}</div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{event.action}</div>
                  {event.xpEarned > 0 && (
                    <span style={{ color: 'var(--accent-emerald)', fontSize: '10px', fontWeight: 'bold' }}>
                      +{event.xpEarned} XP
                    </span>
                  )}
                </div>
              ))}
              {timeline.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No activities logged yet.</p>
              )}
            </div>
          </div>

          {/* Recommended Revision Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Revision Recommended
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {weakTopics.length > 0 ? (
                weakTopics.map((topic, i) => (
                  <div key={i} style={{ 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{topic}</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-red)' }}>Accuracy is low &bull; Practice recommended</span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Excellent! No weak topics detected yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
export default DashboardHome;
