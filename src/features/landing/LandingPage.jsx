import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Zap, Briefcase, BookOpen, ChevronRight, HelpCircle, GraduationCap 
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const FAQ_ITEMS = [
  { q: "Is Lumina AI limited to computer science?", a: "No! Lumina AI is completely subject-agnostic. It detects and adapts its summaries, guides, formulas, flashcards, quizzes, and career advice dynamically based on whatever educational text or notes you upload." },
  { q: "How does the Challenge Arena work?", a: "Instead of standard quizzes, the Challenge Arena generates level-based scenario challenges (Levels 1 to 5). You write open-ended text answers, which are evaluated by the AI Mentor, unlocking subsequent difficulty steps as you pass." },
  { q: "Where is my learning memory stored?", a: "Lumina AI operates fully client-side for user state. Your streaks, XP points, profile level, mistakes notebook, achievements, and session cache are stored securely in your browser's local storage." },
  { q: "How do I get API access?", a: "You need a Google Gemini API Key. Simply paste it in the settings dashboard or configure it in the local `.env` file of the server." }
];

export function LandingPage({ onEnterApp }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Landing Navbar */}
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container" style={{ height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--bg-base)' }}>L</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Lumina AI</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Universal AI Learning Agent</span>
            </div>
          </div>
          <button onClick={onEnterApp} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Open App <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '80px 0 60px 0', 
        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(24, 24, 28, 0) 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              fontSize: '11px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              color: 'var(--accent-emerald)', 
              backgroundColor: 'var(--accent-emerald-light)', 
              padding: '4px 12px', 
              borderRadius: 'var(--radius-full)', 
              letterSpacing: '0.1em' 
            }}
          >
            🚀 Version 2.0: Dynamic Multi-Subject Agent
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', margin: 0 }}
          >
            Learn Smarter. Revise Faster.<br />
            <span style={{ color: 'var(--accent-emerald)' }}>Master Anything.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}
          >
            Transform raw notes, syllabus outlines, or lecture transcripts into structured, personalized interactive study aids. Unified with local memory, progression challenges, and real-time mentoring.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '14px', marginTop: '10px' }}
          >
            <button onClick={onEnterApp} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px' }}>
              Get Started Free <ChevronRight size={16} />
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub repository
            </a>
          </motion.div>
        </div>
      </section>

      {/* Core AI Capabilities Grid */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Platform Capabilities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              An interlocking suite of study modules coordinated by a central AI orchestrator.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Universal Subject Profiler', desc: 'Identify prerequisites, objectives, and dynamic steps from notes of any educational discipline.', icon: <GraduationCap size={20} /> },
              { title: 'Progression Arena', desc: 'Unlock Levels 1 to 5 containing complex, open-ended scenarios that measure actual comprehension.', icon: <Zap size={20} /> },
              { title: 'Active AI Mentor', desc: 'An interactive tutor providing visual analogies, simpler ELI5 outlines, and test questions.', icon: <Sparkles size={20} /> },
              { title: 'Career Alignment', desc: 'Evaluate job readiness matrices, find skill gaps, and explore roadmap steps based on your notes.', icon: <Briefcase size={20} /> },
              { title: 'Adaptive Quizzing', desc: 'Review flashcards and adaptive multi-choice question arrays checking critical revision paths.', icon: <BookOpen size={20} /> },
              { title: 'Personalized Profile', desc: 'Earn XP, level up, unlock badges, and track your chronological timeline journey locally.', icon: <Award size={20} /> }
            ].map((cap, i) => (
              <motion.div 
                key={i} 
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'var(--accent-emerald-light)', 
                  color: 'var(--accent-emerald)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {cap.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{cap.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ padding: '60px 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Have questions? Here are the basics.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              
              return (
                <div 
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: isOpen ? '10px' : '0px', transition: 'all var(--transition-fast)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HelpCircle size={14} style={{ color: 'var(--accent-emerald)' }} /> {faq.q}
                    </h4>
                    <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  
                  {isOpen && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', backgroundColor: 'var(--bg-surface)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Lumina AI &ndash; Universal AI Learning Platform &bull; Made with Antigravity
      </footer>

    </div>
  );
}

export default LandingPage;
