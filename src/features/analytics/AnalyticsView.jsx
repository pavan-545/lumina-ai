import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid
} from 'recharts';
import { 
  BookOpen, CheckCircle, Clock, Sparkles, AlertTriangle, Check
} from 'lucide-react';

export function AnalyticsView({ stats = {}, recentQuizzes = [] }) {
  const {
    avgQuizScore = 84,
    studyMinutes = 125,
    flashcardsReviewed = 42,
    quizzesTaken = 6,
    weakTopics = ['Subnetting', 'ACID Transactions'],
    strongTopics = ['TCP Handshake', 'Database Indexing'],
    dailyStudyData = [
      { day: 'Mon', minutes: 20 },
      { day: 'Tue', minutes: 35 },
      { day: 'Wed', minutes: 15 },
      { day: 'Thu', minutes: 45 },
      { day: 'Fri', minutes: 10 },
      { day: 'Sat', minutes: 0 },
      { day: 'Sun', minutes: 0 }
    ],
    quizHistory = [
      { name: 'Quiz 1', score: 75, accuracy: 70 },
      { name: 'Quiz 2', score: 80, accuracy: 80 },
      { name: 'Quiz 3', score: 90, accuracy: 85 },
      { name: 'Quiz 4', score: 85, accuracy: 90 },
      { name: 'Quiz 5', score: 95, accuracy: 95 }
    ]
  } = stats;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Lumina Smart Analytics</h2>
        <p>Analyze your cognitive strengths and schedule targeted revisions.</p>
      </div>

      {/* Grid of quick summary stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Accuracy Rate</span>
          <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-emerald)' }}>{avgQuizScore}%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across {quizzesTaken} evaluations</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Review Time</span>
          <span style={{ fontSize: '28px', fontWeight: '700' }}>{studyMinutes}m</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus session hours</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Flashcards Checked</span>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{flashcardsReviewed}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active memory recalls</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Assessments Complete</span>
          <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-amber)' }}>{quizzesTaken}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adaptive quiz iterations</span>
        </div>
      </div>

      {/* Recharts Graphical Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* 1. Area Chart: Study Minutes */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px' }}>Study Consistency (Daily Activity)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Minutes spent studying over the past week</span>
          </div>
          
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="var(--accent-emerald)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Bar Chart: Quiz Progress */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px' }}>Evaluation Performance History</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scores compared to answer accuracy rate</span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Bar dataKey="score" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} name="Score" />
                <Bar dataKey="accuracy" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} name="Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Focus Topics Mapping (Strengths vs Weaknesses) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Strong Topics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
            <CheckCircle size={18} /> Mastered Concept Domains
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {strongTopics.map((topic, index) => (
              <span 
                key={index} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px',
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'var(--accent-emerald-light)', 
                  border: '1px solid var(--accent-emerald-border)',
                  color: 'var(--accent-emerald)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={12} /> {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
            <AlertTriangle size={18} /> Revision Required Domains
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {weakTopics.map((topic, index) => (
              <span 
                key={index} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px',
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'var(--accent-red-light)', 
                  border: '1px solid var(--accent-red-border)',
                  color: 'var(--accent-red)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={12} /> {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default AnalyticsView;
