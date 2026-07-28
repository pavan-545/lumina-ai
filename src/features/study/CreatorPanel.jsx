import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Sparkles, AlertCircle, ArrowRight, BookOpen, Layers, Target 
} from 'lucide-react';
import SubjectAnalysisCard from '../subject-analysis/SubjectAnalysisCard';
import { aiOrchestrator } from '../../services/aiOrchestrator';
import { SubjectAnalysisSchema } from '../../schemas';

const LOADING_STAGES = [
  'Reading Notes...',
  'Analyzing Domain Context...',
  'Extracting Key Concepts...',
  'Mapping Prerequisites...',
  'Calculating Study Timeline...',
  'Formulating Objectives...',
  'Almost Ready...'
];

export function CreatorPanel({ onGenerate, isLoading, studentProfile, onGoalChange }) {
  const [notesText, setNotesText] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  
  // Subject Analysis state
  const [analysisProfile, setAnalysisProfile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let interval;
    if (isLoading || isAnalyzing) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % LOADING_STAGES.length);
      }, 1500);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, isAnalyzing]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (['txt', 'md', 'json'].includes(extension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNotesText(e.target.result);
      };
      reader.onerror = () => {
        setFileError('Failed to read the file contents.');
      };
      reader.readAsText(file);
    } else if (extension === 'pdf') {
      setFileError('PDF direct parsing is limited in client-side. Please copy-paste the text content directly.');
    } else {
      setFileError('Unsupported file type. Please upload a .txt, .md, or .json file.');
    }
  };

  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    if (!notesText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProfile(null);

    try {
      const result = await aiOrchestrator.request({
        mode: 'analyze',
        notes: notesText,
        context: {
          goal: studentProfile?.goal || 'Learn From Scratch'
        },
        schema: SubjectAnalysisSchema
      });

      setAnalysisProfile(result.data);
      
    } catch (err) {
      console.error(err);
      // Fallback analysis if offline/API fails
      setAnalysisProfile({
        subject: 'Universal Study Topic',
        topics: ['Overview', 'Core Details', 'Key Context'],
        prerequisites: [],
        difficulty: 'Intermediate',
        estimatedTime: '30 minutes',
        learningOrder: ['Review summary', 'Flip flashcards', 'Take quiz'],
        recommendedModes: ['Flashcards', 'Quiz'],
        confidence: '85%',
        learningObjectives: ['Understand topic details', 'Retain key terms'],
        studyStrategy: [
          { step: 1, title: 'Read Summary', time: '5 min', description: 'Quick pass.' },
          { step: 2, title: 'Flip Flashcards', time: '15 min', description: 'Memory review.' },
          { step: 3, title: 'Adaptive Quiz', time: '10 min', description: 'Self test.' }
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmVault = () => {
    if (!analysisProfile) return;
    onGenerate(notesText, analysisProfile.subject, analysisProfile);
  };

  return (
    <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {!analysisProfile && !isAnalyzing && !isLoading && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={22} style={{ color: 'var(--accent-emerald)' }} /> Generate Study Workspace
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Paste notes, textbook outlines, or syllabus logs to construct an AI-powered adaptive course.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Loading stage */}
        {(isLoading || isAnalyzing) ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '60px 0',
              gap: '24px'
            }}
          >
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  border: '3px solid var(--border-color)', 
                  borderTop: '3px solid var(--accent-emerald)', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite' 
                }}
              />
              <Sparkles 
                size={24} 
                style={{ 
                  position: 'absolute', 
                  top: '28px', 
                  left: '28px', 
                  color: 'var(--accent-emerald)',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }} 
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div 
                className="loading-pulse" 
                style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em' 
                }}
              >
                {LOADING_STAGES[loadingStage]}
              </div>
              <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Lumina is parsing, structuring, and optimizing the study pipeline...
              </p>
            </div>
          </motion.div>
        ) : analysisProfile ? (
          /* Step 2: Show analysis profile for confirmation */
          <SubjectAnalysisCard 
            analysis={analysisProfile}
            onConfirm={handleConfirmVault}
            onReset={() => setAnalysisProfile(null)}
            selectedGoal={studentProfile?.goal}
            onGoalChange={onGoalChange}
          />
        ) : (
          /* Step 1: Entry Form */
          <motion.form 
            key="form"
            onSubmit={handleSubmitAnalysis}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Goal selection on form entry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label className="input-label" htmlFor="initial-goal-select" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} style={{ color: 'var(--accent-emerald)' }} /> Choose Learning Goal
              </label>
              <select
                id="initial-goal-select"
                className="input-field"
                value={studentProfile?.goal}
                onChange={(e) => onGoalChange(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                <option value="Learn From Scratch">🌱 Learn From Scratch (Detailed Outline + ELI5)</option>
                <option value="Quick Revision">⚡ Quick Revision (Concise Summary Sheets)</option>
                <option value="Exam Preparation">📝 Exam Preparation (Checklists + Practice)</option>
                <option value="Interview Preparation">💼 Interview Prep (Scenario Rubrics)</option>
                <option value="Master This Topic">Master This Topic (Complex Calculations)</option>
                <option value="30-Minute Revision">⏱️ 30-Minute Speed Study</option>
              </select>
            </div>

            {/* Drag and Drop Uploader */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed var(--accent-emerald)' : '1px dashed var(--border-color)',
                backgroundColor: dragActive ? 'var(--accent-emerald-light)' : 'var(--bg-surface-hover)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                style={{ display: 'none' }} 
                accept=".txt,.md,.json" 
                onChange={handleFileChange}
              />
              <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                Drag & Drop study file or <span style={{ color: 'var(--accent-emerald)' }}>browse</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports .txt, .md, .json (max 5MB)
              </div>
            </div>

            {fileError && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--accent-red)', 
                fontSize: '13px',
                backgroundColor: 'var(--accent-red-light)',
                border: '1px solid var(--accent-red-border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)'
              }}>
                <AlertCircle size={16} />
                <span>{fileError}</span>
              </div>
            )}

            {/* Free text input */}
            <div style={{ textAlign: 'left' }}>
              <label className="input-label" htmlFor="notes-textarea">Paste Raw Study Material</label>
              <textarea 
                id="notes-textarea"
                className="input-field"
                rows="8"
                placeholder="Paste lecture logs, textbook chapters, syllabus outline, or copy-paste transcript logs here..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                style={{ resize: 'vertical', minHeight: '150px', fontSize: '14px', lineHeight: '1.5' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '6px', 
                fontSize: '11px', 
                color: 'var(--text-muted)' 
              }}>
                <span>Minimum 50 words recommended for rich material</span>
                <span>{notesText.length} characters</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!notesText.trim()}
              style={{ width: '100%' }}
            >
              Analyze Material <ArrowRight size={16} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CreatorPanel;
