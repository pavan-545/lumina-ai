import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, BarChart3, ListTodo, History, Settings, ShieldAlert, 
  Sparkles, Play, Trash2, EyeOff, LayoutGrid, Zap, Briefcase, GraduationCap, Trophy, Award, Flame, UserCheck 
} from 'lucide-react';

// Hooks & Utilities
import useLocalStorage from './hooks/useLocalStorage';
import usePomodoro from './hooks/usePomodoro';
import { validateAndScoreResponse } from './utils/aiValidation';
import { 
  FlashcardsListSchema, QuizSchema, StudyGuideSchema, 
  CheatSheetSchema, SummarySchema, InterviewSchema, GraphSchema,
  SubjectAnalysisSchema, SubjectResourcesSchema
} from './schemas';
import FEATURES from './config/features';
import { aiOrchestrator } from './services/aiOrchestrator';

// Components
import DashboardHome from './features/dashboard/DashboardHome';
import AnalyticsView from './features/analytics/AnalyticsView';
import CreatorPanel from './features/study/CreatorPanel';
import FlashcardView from './features/flashcards/FlashcardView';
import QuizView from './features/quiz/QuizView';
import MistakeNotebook from './features/mistakes/MistakeNotebook';
import InterviewPractice from './features/interview/InterviewPractice';
import KnowledgeGraph from './features/graph/KnowledgeGraph';
import GuideView from './features/study/GuideView';
import PomodoroWidget from './features/pomodoro/PomodoroWidget';
import FocusMode from './features/focus/FocusMode';
import SettingsModal from './components/SettingsModal';
import DeveloperModeConsole from './components/DeveloperModeConsole';

// Lazy Loaded Features
const LandingPage = React.lazy(() => import('./features/landing/LandingPage'));
const ChallengeArena = React.lazy(() => import('./features/challenge-arena/ChallengeArena'));
const AIMentorPanel = React.lazy(() => import('./features/mentor/AIMentorPanel'));
const CareerModeView = React.lazy(() => import('./features/career/CareerModeView'));

export function App() {
  const [hasEntered, setHasEntered] = useLocalStorage('has_entered_landing', false);
  const [activeTab, setActiveTab] = useLocalStorage('active_tab', 'dashboard');
  const [activeStudyTab, setActiveStudyTab] = useState('summary');
  
  // Master states
  const [history, setHistory] = useLocalStorage('study_history', []);
  const [mistakes, setMistakes] = useLocalStorage('mistakes_notebook', []);
  const [activeSession, setActiveSession] = useState(null);
  
  // Analytics aggregates
  const [studyMinutes, setStudyMinutes] = useLocalStorage('study_minutes_total', 120);
  const [quizzesTaken, setQuizzesTaken] = useLocalStorage('quizzes_taken_count', 4);
  const [quizScores, setQuizScores] = useLocalStorage('quiz_scores_history', [75, 80, 85, 90]);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Loading & Debug Console state
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [activeDebugData, setActiveDebugData] = useState(null);
  const [lazyLoadStatus, setLazyLoadStatus] = useState({}); // tracking background load per module

  // 1. Personalized Student Profile
  const [studentProfile, setStudentProfile] = useLocalStorage('student_profile', {
    xp: 250,
    level: 1,
    streak: 3,
    goal: 'Learn From Scratch',
    achievements: [
      { id: 'first_session', title: 'Curious Learner', description: 'Analyze your first study material', unlocked: false, icon: '🌱' },
      { id: 'first_quiz', title: 'Quiz Master', description: 'Complete a study quiz', unlocked: false, icon: '🎯' },
      { id: 'level_5_unlocked', title: 'Arena Conqueror', description: 'Unlock the Boss level in any subject', unlocked: false, icon: '👑' },
      { id: 'career_mapped', title: 'Roadmap Mapped', description: 'Generate a career alignment mapping', unlocked: false, icon: '💼' }
    ],
    timeline: [
      { date: new Date().toLocaleDateString(), action: 'Initialized Lumina Study Workspace', xpEarned: 50 }
    ],
    weakTopics: [],
    strongTopics: []
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const triggerToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // 2. AI Event System Listeners
  useEffect(() => {
    aiOrchestrator.on('SETTINGS_UPDATED', (prefs) => {
      triggerToast('Settings updated successfully.');
    });

    aiOrchestrator.on('CHALLENGE_COMPLETED', ({ level, score, passed }) => {
      const actionText = passed 
        ? `Passed Level ${level} Challenge Arena task with score ${score}%`
        : `Attempted Level ${level} Challenge Arena task`;
      
      logTimelineAction(actionText, passed ? 100 : 20);
      
      if (passed && level === 5) {
        unlockAchievement('level_5_unlocked');
      }
    });

    aiOrchestrator.on('QUIZ_COMPLETED', ({ score }) => {
      logTimelineAction(`Completed Adaptive Study Quiz with score ${score}%`, score >= 90 ? 150 : 50);
      unlockAchievement('first_quiz');
    });

    aiOrchestrator.on('CAREER_ANALYZED', ({ career }) => {
      unlockAchievement('career_mapped');
      logTimelineAction(`Generated Career Alignment Report: ${career}`, 50);
    });
  }, []);

  // Sync profile streaking on startup
  useEffect(() => {
    // simple auto-increment or maintenance of streak
    setStudentProfile(prev => {
      if (!prev.streak) return { ...prev, streak: 3 };
      return prev;
    });
  }, []);

  // Initialize Pomodoro timer
  const pomodoroTimer = usePomodoro((mins) => {
    setStudyMinutes(prev => prev + mins);
    logTimelineAction(`Pomodoro study session completed: ${mins} minutes`, mins * 10);
  });

  const logTimelineAction = (action, xpEarned) => {
    setStudentProfile(prev => {
      const updatedTimeline = [
        { date: new Date().toLocaleDateString(), action, xpEarned },
        ...prev.timeline
      ].slice(0, 30); // keep last 30 actions

      let newXp = prev.xp + xpEarned;
      // Formula: next level at level * 500 XP
      const xpNeeded = prev.level * 500;
      let newLevel = prev.level;
      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        setTimeout(() => triggerToast(`🎉 LEVEL UP! Reached Level ${newLevel}`), 1000);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        timeline: updatedTimeline
      };
    });
  };

  const unlockAchievement = (id) => {
    setStudentProfile(prev => {
      const isAlreadyUnlocked = prev.achievements.find(a => a.id === id)?.unlocked;
      if (isAlreadyUnlocked) return prev;

      const updated = prev.achievements.map(a => a.id === id ? { ...a, unlocked: true } : a);
      const ach = prev.achievements.find(a => a.id === id);
      setTimeout(() => triggerToast(`🏆 Achievement Unlocked: ${ach?.title}`), 500);

      return {
        ...prev,
        achievements: updated
      };
    });
  };

  // 3. AI Task Pipeline Initialization
  // Generates analysis, summary, and guide immediately. Leaves others to lazy load in the background.
  const handleGenerateStudySession = async (notesText, title, analysisProfile) => {
    setIsLoading(true);
    setLoadError(null);
    setActiveDebugData(null);

    const generatedSet = {
      id: 'set_' + Date.now(),
      title,
      notes: notesText,
      createdAt: new Date().toISOString(),
      analysisProfile,
      // immediate generation placeholders
      summary: null,
      guide: null,
      subjectResources: null,
      // lazy generation placeholders
      flashcards: null,
      quiz: null,
      graph: null,
      interview: null,
      career: null
    };

    try {
      // Step A: Fetch Summary & Guide & Subject Resources in parallel (Immediate pipeline steps)
      const [summaryRes, guideRes, resourcesRes] = await Promise.all([
        aiOrchestrator.request({
          mode: 'summary',
          notes: notesText,
          context: { subject: title, goal: studentProfile.goal },
          schema: SummarySchema
        }),
        aiOrchestrator.request({
          mode: 'guide',
          notes: notesText,
          context: { subject: title, goal: studentProfile.goal },
          schema: StudyGuideSchema
        }),
        aiOrchestrator.request({
          mode: 'subject_resources',
          notes: notesText,
          context: { subject: title, goal: studentProfile.goal },
          schema: SubjectResourcesSchema
        })
      ]);

      generatedSet.summary = summaryRes.data;
      generatedSet.guide = guideRes.data;
      generatedSet.subjectResources = resourcesRes.data;

      // Log Developer Mode details if active
      if (summaryRes.debug) {
        setActiveDebugData(summaryRes.debug);
      }

      setHistory(prev => [generatedSet, ...prev]);
      setActiveSession(generatedSet);
      setActiveTab('study');
      setActiveStudyTab('summary');
      
      triggerToast('Study Vault initialized successfully.');
      unlockAchievement('first_session');
      logTimelineAction(`Created dynamic study vault for: ${title}`, 100);

    } catch (error) {
      console.error(error);
      setLoadError('Failed to initialize study workspace pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Downstream Lazy Module Loader
  const ensureLazyModuleLoaded = async (mode, schema, propKey) => {
    if (!activeSession || activeSession[propKey]) return; // already loaded

    setLazyLoadStatus(prev => ({ ...prev, [mode]: 'loading' }));
    try {
      const result = await aiOrchestrator.request({
        mode,
        notes: activeSession.notes,
        context: {
          subject: activeSession.title,
          goal: studentProfile.goal,
          weakTopics: studentProfile.weakTopics,
          strongTopics: studentProfile.strongTopics
        },
        schema
      });

      // Update activeSession state
      const updatedSession = {
        ...activeSession,
        [propKey]: result.data
      };

      setActiveSession(updatedSession);
      setHistory(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s));
      
      if (result.debug) {
        setActiveDebugData(result.debug);
      }

      setLazyLoadStatus(prev => ({ ...prev, [mode]: 'done' }));
    } catch (err) {
      console.error(`Error lazy loading ${mode}:`, err);
      setLazyLoadStatus(prev => ({ ...prev, [mode]: 'error' }));
      triggerToast(`Offline/Error: Could not load module ${mode}.`);
    }
  };

  // Refinement Loop updates guide resources
  const handleRefineSession = async (promptText) => {
    if (!activeSession) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: activeSession.notes,
          mode: 'guide',
          context: { subject: activeSession.title, goal: studentProfile.goal },
          refinementPrompt: promptText
        })
      });

      if (!response.ok) throw new Error('Refinement request failed.');
      
      const res = await response.json();
      const validationResult = validateAndScoreResponse(JSON.stringify(res.data), StudyGuideSchema);

      if (validationResult.success) {
        const updatedSession = {
          ...activeSession,
          guide: validationResult.parsedData
        };

        setActiveSession(updatedSession);
        setHistory(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s));
        triggerToast('Refinement applied successfully.');
        logTimelineAction(`Refined study guide for: ${activeSession.title}`, 30);
      } else {
        alert('AI model output was malformed. Refinement rejected.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while refining study set.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSession = (session) => {
    setActiveSession(session);
    setActiveTab('study');
    setActiveStudyTab('summary');
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(s => s.id !== id));
    if (activeSession && activeSession.id === id) {
      setActiveSession(null);
    }
  };

  // Mistakes
  const handleAddMistake = (questionObj) => {
    setMistakes(prev => {
      const alreadyHas = prev.some(m => m.question === questionObj.question);
      if (alreadyHas) return prev;
      return [questionObj, ...prev];
    });
    // Add to weak topics
    const topicText = questionObj.question.split(' ').slice(0, 3).join(' ');
    setStudentProfile(prev => ({
      ...prev,
      weakTopics: Array.from(new Set([...prev.weakTopics, topicText]))
    }));
  };

  const handleRemoveMistake = (index) => {
    setMistakes(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAllMistakes = () => {
    setMistakes([]);
  };

  const handleQuizFinished = (scorePercent) => {
    setQuizzesTaken(prev => prev + 1);
    setQuizScores(prev => [...prev, scorePercent]);

    aiOrchestrator.emit('QUIZ_COMPLETED', { score: scorePercent });

    // evaluate weak/strong topics from latest scores
    if (activeSession) {
      const topicText = activeSession.title.split(' ').slice(0, 2).join(' ');
      setStudentProfile(prev => {
        const strong = scorePercent >= 80 
          ? Array.from(new Set([...prev.strongTopics, topicText]))
          : prev.strongTopics;
        const weak = scorePercent < 70
          ? Array.from(new Set([...prev.weakTopics, topicText]))
          : prev.weakTopics.filter(t => t !== topicText);

        return {
          ...prev,
          strongTopics: strong,
          weakTopics: weak
        };
      });
    }
  };

  const handleUpdateProfile = (xpReward, isBossPassed, actionKey) => {
    logTimelineAction(`Earned progression XP (+${xpReward})`, xpReward);
  };

  const handleResetProfile = () => {
    setStudentProfile({
      xp: 0,
      level: 1,
      streak: 1,
      goal: 'Learn From Scratch',
      achievements: [
        { id: 'first_session', title: 'Curious Learner', description: 'Analyze your first study material', unlocked: false, icon: '🌱' },
        { id: 'first_quiz', title: 'Quiz Master', description: 'Complete a study quiz', unlocked: false, icon: '🎯' },
        { id: 'level_5_unlocked', title: 'Arena Conqueror', description: 'Unlock the Boss level in any subject', unlocked: false, icon: '👑' },
        { id: 'career_mapped', title: 'Roadmap Mapped', description: 'Generate a career alignment mapping', unlocked: false, icon: '💼' }
      ],
      timeline: [],
      weakTopics: [],
      strongTopics: []
    });
    setMistakes([]);
    setStudyMinutes(0);
    setQuizzesTaken(0);
    setQuizScores([]);
  };

  // Compile general statistics for Dashboard indicators
  const avgQuizScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) 
    : 80;

  const totalStreak = studentProfile.streak || 3;

  const stats = {
    streak: totalStreak,
    avgQuizScore,
    flashcardsMastered: Math.round(history.length * 3.5) || 12,
    totalFlashcards: Math.round(history.length * 5) || 20,
    studyMinutes,
    quizzesTaken,
    weakTopics: studentProfile.weakTopics.slice(0, 3),
    strongTopics: studentProfile.strongTopics.slice(0, 3),
    dailyStudyData: [
      { day: 'Mon', minutes: 20 },
      { day: 'Tue', minutes: 30 },
      { day: 'Wed', minutes: Math.min(60, studyMinutes) },
      { day: 'Thu', minutes: 25 },
      { day: 'Fri', minutes: 15 },
      { day: 'Sat', minutes: 0 },
      { day: 'Sun', minutes: 0 }
    ],
    quizHistory: quizScores.map((score, idx) => ({
      name: `Quiz ${idx + 1}`,
      score,
      accuracy: score
    }))
  };

  // Render content depending on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome 
            stats={stats} 
            recentSessions={history} 
            onResumeSession={handleResumeSession}
            onNavigateToStudy={() => setActiveTab('study')}
            studentProfile={studentProfile}
            activeSession={activeSession}
            onStartDailyChallenge={() => {
              if (FEATURES.CHALLENGE_ARENA) {
                setActiveTab('arena');
              }
            }}
          />
        );

      case 'analytics':
        return <AnalyticsView stats={stats} />;

      case 'study':
        if (!activeSession) {
          return (
            <CreatorPanel 
              onGenerate={handleGenerateStudySession} 
              isLoading={isLoading} 
              studentProfile={studentProfile}
              onGoalChange={(g) => setStudentProfile(prev => ({ ...prev, goal: g }))}
            />
          );
        }

        // Inside Study workspace: dynamically lazy-load tabs on select
        const StudyPlayer = () => {
          switch (activeStudyTab) {
            case 'flashcards':
              ensureLazyModuleLoaded('flashcards', FlashcardsListSchema, 'flashcards');
              if (!activeSession.flashcards) {
                return <div className="card text-center" style={{ padding: '60px' }}><p>Lazy loading flashcards in background...</p></div>;
              }
              return (
                <FlashcardView 
                  flashcards={activeSession.flashcards} 
                  onMarkMastered={() => setStudyMinutes(p => p + 2)}
                />
              );

            case 'quiz':
              ensureLazyModuleLoaded('quiz', QuizSchema, 'quiz');
              if (!activeSession.quiz) {
                return <div className="card text-center" style={{ padding: '60px' }}><p>Lazy loading study quiz in background...</p></div>;
              }
              return (
                <QuizView 
                  quizQuestions={activeSession.quiz}
                  onQuizFinished={handleQuizFinished}
                  onAddMistake={handleAddMistake}
                />
              );

            case 'graph':
              if (FEATURES.KNOWLEDGE_GRAPH) {
                ensureLazyModuleLoaded('graph', GraphSchema, 'graph');
                if (!activeSession.graph) {
                  return <div className="card text-center" style={{ padding: '60px' }}><p>Lazy loading knowledge network in background...</p></div>;
                }
                return <KnowledgeGraph graphData={activeSession.graph} />;
              }
              return null;

            default: // summary, guide, cheat_sheet, formulas, mnemonics
              return (
                <GuideView 
                  studySet={activeSession}
                  activeSubTab={activeStudyTab}
                  onRefineStudySet={handleRefineSession}
                  isRefining={isLoading}
                />
              );
          }
        };

        // Custom sub-tabs row based on what exists in dynamic subject resources
        const dynamicTabs = [
          { tab: 'summary', label: 'One Page Summary' },
          { tab: 'cheat_sheet', label: 'Cheat Sheet' },
          { tab: 'guide', label: 'Checklist / Guide' }
        ];
        
        // Add formulas/mnemonics dynamic sub-tabs
        if (activeSession.guide?.formulas?.length > 0) {
          dynamicTabs.push({ tab: 'formulas', label: 'Key Formulas' });
        }
        if (activeSession.guide?.mnemonics?.length > 0) {
          dynamicTabs.push({ tab: 'mnemonics', label: 'Mnemonic Vault' });
        }

        // Add dynamically compiled subject-specific tabs
        if (activeSession.subjectResources?.programming?.codeExamples?.length > 0) {
          dynamicTabs.push({ tab: 'programming_examples', label: 'Code Examples' });
        }
        if (activeSession.subjectResources?.mathematics?.stepByStepSolutions?.length > 0) {
          dynamicTabs.push({ tab: 'math_solutions', label: 'Step-by-Step Solutions' });
        }
        if (activeSession.subjectResources?.biology?.keyProcesses?.length > 0) {
          dynamicTabs.push({ tab: 'biology_processes', label: 'Biological Processes' });
        }
        if (activeSession.subjectResources?.history?.timeline?.length > 0) {
          dynamicTabs.push({ tab: 'history_timeline', label: 'Historical Timeline' });
        }
        if (activeSession.subjectResources?.languages?.vocabulary?.length > 0) {
          dynamicTabs.push({ tab: 'language_vocabulary', label: 'Vocabulary Builder' });
        }

        // Universal modular components
        dynamicTabs.push(
          { tab: 'flashcards', label: 'Flashcards' },
          { tab: 'quiz', label: 'Adaptive Quiz' }
        );

        if (FEATURES.KNOWLEDGE_GRAPH) {
          dynamicTabs.push({ tab: 'graph', label: 'Knowledge Graph' });
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Session Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px' 
            }}>
              <div>
                <h2 style={{ fontSize: '20px' }}>{activeSession.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Session opened &middot; Goal: {studentProfile.goal}
                  </span>
                  
                  {activeSession.analysisProfile?.confidence && (
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--accent-emerald-light)',
                      color: 'var(--accent-emerald)',
                      border: '1px solid var(--accent-emerald-border)'
                    }}>
                      Profile Locked: {activeSession.analysisProfile.subject}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsFocusMode(true)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  <EyeOff size={14} /> Focus Mode
                </button>
                <button onClick={() => setActiveSession(null)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  Close Set
                </button>
              </div>
            </div>

            {/* Dynamic Subpages row */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              overflowX: 'auto', 
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)' 
            }}>
              {dynamicTabs.map(({ tab, label }) => (
                <button
                  key={tab}
                  onClick={() => setActiveStudyTab(tab)}
                  className="btn"
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    backgroundColor: activeStudyTab === tab ? 'var(--bg-surface-hover)' : 'transparent',
                    border: '1px solid transparent',
                    borderColor: activeStudyTab === tab ? 'var(--border-color)' : 'transparent',
                    color: activeStudyTab === tab ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Dynamic rendering */}
            <StudyPlayer />

            {/* Developer Mode panel */}
            <DeveloperModeConsole debug={activeDebugData} />
          </div>
        );

      case 'arena':
        if (FEATURES.CHALLENGE_ARENA) {
          return (
            <Suspense fallback={<div>Loading Challenge Arena...</div>}>
              <ChallengeArena 
                activeSession={activeSession} 
                studentProfile={studentProfile} 
                onUpdateProfile={handleUpdateProfile} 
              />
            </Suspense>
          );
        }
        return null;

      case 'mentor':
        if (FEATURES.AI_MENTOR) {
          return (
            <Suspense fallback={<div>Loading AI Mentor...</div>}>
              <AIMentorPanel 
                activeSession={activeSession} 
                studentProfile={studentProfile} 
                mistakes={mistakes} 
              />
            </Suspense>
          );
        }
        return null;

      case 'career':
        if (FEATURES.CAREER_MODE) {
          return (
            <Suspense fallback={<div>Loading Career Readiness...</div>}>
              <CareerModeView 
                activeSession={activeSession} 
                studentProfile={studentProfile} 
              />
            </Suspense>
          );
        }
        return null;

      case 'mistakes':
        return (
          <MistakeNotebook 
            mistakes={mistakes}
            onRemoveMistake={handleRemoveMistake}
            onClearAll={handleClearAllMistakes}
          />
        );

      case 'history':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Study History Vault</h2>
              <p>Revisit past parsed materials and resume your learning modules.</p>
            </div>

            {history.length === 0 ? (
              <div className="card text-center" style={{ padding: '60px 24px' }}>
                <p>No study sessions saved in this browser yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {history.map((session, index) => (
                  <div 
                    key={session.id || index}
                    onClick={() => handleResumeSession(session)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="hover-card"
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{session.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Created on {new Date(session.createdAt).toLocaleDateString()} &bull; {session.analysisProfile?.subject || 'Detected Subject'}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleResumeSession(session); }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Play size={12} fill="currentColor" /> Resume
                      </button>
                      <button 
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: 'var(--accent-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // If landing page isn't entered, show premium intro screen
  if (!hasEntered) {
    return (
      <Suspense fallback={<div>Loading Landing Page...</div>}>
        <LandingPage onEnterApp={() => setHasEntered(true)} />
      </Suspense>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Platform Navigation Header */}
      <header style={{ 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}>
        <div className="container" style={{ 
          height: '64px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--accent-emerald)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'var(--bg-base)'
            }}>
              L
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, letterSpacing: '0.02em' }}>
                Lumina AI
              </h1>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Universal AI Learning Platform</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { tab: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={14} />, enabled: true },
              { tab: 'study', label: 'Study Hub', icon: <BookOpen size={14} />, enabled: true },
              { tab: 'arena', label: 'Challenge Arena', icon: <Zap size={14} />, enabled: FEATURES.CHALLENGE_ARENA },
              { tab: 'mentor', label: 'AI Mentor', icon: <GraduationCap size={14} />, enabled: FEATURES.AI_MENTOR },
              { tab: 'career', label: 'Career Mode', icon: <Briefcase size={14} />, enabled: FEATURES.CAREER_MODE },
              { tab: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} />, enabled: FEATURES.ANALYTICS },
              { tab: 'mistakes', label: 'Mistakes', icon: <ListTodo size={14} />, enabled: true },
              { tab: 'history', label: 'History', icon: <History size={14} />, enabled: true },
            ].map(({ tab, label, icon, enabled }) => {
              if (!enabled) return null;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab !== 'study') setLoadError(null); }}
                  className="btn btn-ghost"
                  style={{ 
                    color: activeTab === tab ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    padding: '8px 12px'
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Display mini XP Level badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px'
            }}>
              <Flame size={13} style={{ color: 'var(--accent-emerald)' }} />
              <span>Lvl {studentProfile.level}</span>
            </div>

            <button 
              onClick={() => setShowSettings(true)}
              className="btn btn-ghost" 
              style={{ padding: '8px' }}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Toast notifications drawer */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--accent-emerald)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trophy size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main View Area */}
      <main style={{ flex: 1, padding: '32px 0', position: 'relative' }}>
        <div className="container">
          
          {/* Main Error notification */}
          {loadError && (
            <div className="card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              borderColor: 'var(--accent-red-border)',
              backgroundColor: 'var(--accent-red-light)',
              color: 'var(--accent-red)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px'
            }}>
              <ShieldAlert size={20} />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '14px' }}>Load Error</strong>
                <p style={{ fontSize: '13px', color: 'var(--accent-red)', marginTop: '2px' }}>{loadError}</p>
              </div>
              <button onClick={() => setLoadError(null)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
                Dismiss
              </button>
            </div>
          )}

          {renderTabContent()}
        </div>
      </main>

      {/* Pomodoro Timer Floating Badge */}
      <PomodoroWidget timer={pomodoroTimer} />

      {/* Settings Modal Overlay */}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          historyCount={history.length}
          onExportHistory={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `lumina_history_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          onImportHistory={(imported) => {
            setHistory(imported);
          }}
          studentProfile={studentProfile}
          onResetProfile={handleResetProfile}
        />
      )}

      {/* Full-Screen Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && activeSession && (
          <FocusMode 
            title={activeSession.title}
            timer={pomodoroTimer}
            onExit={() => setIsFocusMode(false)}
          >
            {activeStudyTab === 'flashcards' && activeSession.flashcards && (
              <FlashcardView 
                flashcards={activeSession.flashcards} 
                onMarkMastered={() => setStudyMinutes(p => p + 2)}
              />
            )}
            {activeStudyTab === 'quiz' && activeSession.quiz && (
              <QuizView 
                quizQuestions={activeSession.quiz}
                onQuizFinished={handleQuizFinished}
                onAddMistake={handleAddMistake}
              />
            )}
            {activeStudyTab !== 'flashcards' && activeStudyTab !== 'quiz' && (
              <GuideView 
                studySet={activeSession}
                activeSubTab={activeStudyTab}
                onRefineStudySet={handleRefineSession}
                isRefining={isLoading}
              />
            )}
          </FocusMode>
        )}
      </AnimatePresence>

      {/* Standard Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '20px 0',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Lumina AI &ndash; Universal Study Platform &bull; Made with Antigravity
      </footer>

    </div>
  );
}
export default App;
