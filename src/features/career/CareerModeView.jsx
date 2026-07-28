import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, AlertTriangle, ArrowRight, BookOpen, Compass, Award, Target, TrendingUp 
} from 'lucide-react';
import { aiOrchestrator } from '../../services/aiOrchestrator';
import { CareerSchema } from '../../schemas';

export function CareerModeView({ activeSession, studentProfile }) {
  const [careerData, setCareerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleLoadReport();
  }, [activeSession]);

  const handleLoadReport = async () => {
    if (!activeSession) return;
    setIsLoading(true);

    try {
      const result = await aiOrchestrator.request({
        mode: 'career',
        notes: activeSession.notes,
        context: {
          subject: activeSession.title,
          goal: studentProfile?.goal || 'Learn From Scratch'
        },
        schema: CareerSchema
      });

      setCareerData(result.data);

      // Trigger event
      aiOrchestrator.emit('CAREER_ANALYZED', { career: result.data.recommendedCareer });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeSession) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <h3>No Study Session Loaded</h3>
        <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
          Please go to the Study Hub and generate or load a study set first to view the Career Readiness analysis.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={22} style={{ color: 'var(--accent-emerald)' }} /> Career Readiness Hub
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
          Real-world skill mapping and career alignment for <strong>{activeSession.title}</strong>.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton Loader */
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
              <h4 style={{ fontWeight: '600' }}>Mapping Career Pathways...</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>AI is extracting relevant skills and evaluating readiness matrices.</p>
            </div>
          </motion.div>
        ) : careerData ? (
          /* Main Career Dashboard Content */
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Top row: Readiness & Career name */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Recommended Role */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Recommended Career Path
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--accent-emerald)' }}>
                  {careerData.recommendedCareer}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} /> Confidence Score: <strong>{careerData.confidenceScore}</strong>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: '5px solid var(--border-color)',
                  borderTopColor: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {careerData.careerReadiness}%
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Career Readiness Score</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Calculated by matching notes content against industry requirements for this role.
                  </p>
                </div>
              </div>

            </div>

            {/* Skills matrices */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Skills Covered */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
                  <CheckCircle size={15} /> Skills Covered
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {careerData.skillsCovered.map((s, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        backgroundColor: 'var(--accent-emerald-light)', 
                        color: 'var(--accent-emerald)', 
                        border: '1px solid var(--accent-emerald-border)',
                        padding: '4px 8px', 
                        borderRadius: 'var(--radius-sm)' 
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {careerData.skillsCovered.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None logged.</span>}
                </div>
              </div>

              {/* Skills Missing */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
                  <AlertTriangle size={15} /> Skills Missing (Gaps)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {careerData.skillsMissing.map((s, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        backgroundColor: 'var(--accent-amber-light)', 
                        color: 'var(--accent-amber)', 
                        border: '1px solid var(--accent-amber-border)',
                        padding: '4px 8px', 
                        borderRadius: 'var(--radius-sm)' 
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {careerData.skillsMissing.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All covered!</span>}
                </div>
              </div>

            </div>

            {/* Learning Roadmap / Pathway */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} /> Recommended Learning Roadmap
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {careerData.learningRoadmap.map((step, idx) => (
                  <div 
                    key={idx} 
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
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-emerald)',
                      color: 'var(--bg-base)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '8px', padding: '12px 16px', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Career Action:</strong> Study <strong>{careerData.nextTopics?.join(', ') || 'related concepts'}</strong> to bridge remaining readiness gaps and prepare for employment tests.
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="card text-center" style={{ padding: '40px' }}>
            <p>Failed to generate Career Roadmap.</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default CareerModeView;
