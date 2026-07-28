import { z } from 'zod';

export const TopicsSchema = z.object({
  collections: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      notes: z.string(),
      description: z.string(),
    })
  ),
});

export const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  explainLike10: z.string(),
  realWorldExample: z.string(),
  keyTerms: z.array(z.string()),
});

export const FlashcardsListSchema = z.object({
  flashcards: z.array(FlashcardSchema),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  explanation: z.string(),
  commonMistake: z.string(),
  realExample: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const QuizSchema = z.object({
  quiz: z.array(QuizQuestionSchema),
});

export const StudyGuideSchema = z.object({
  summary: z.string(),
  keyConcepts: z.array(
    z.object({
      concept: z.string(),
      explanation: z.string(),
    })
  ),
  formulas: z.array(
    z.object({
      name: z.string(),
      formula: z.string(),
      explanation: z.string(),
    })
  ),
  mnemonics: z.array(
    z.object({
      concept: z.string(),
      mnemonic: z.string(),
      description: z.string(),
    })
  ),
});

export const CheatSheetItemSchema = z.object({
  title: z.string(),
  content: z.array(z.string()),
});

export const CheatSheetSchema = z.object({
  cheatSheet: z.array(CheatSheetItemSchema),
});

export const SummarySchema = z.object({
  summaryPoints: z.array(z.string()),
  coreTakeaways: z.array(z.string()),
});

export const InterviewQuestionSchema = z.object({
  question: z.string(),
  idealAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const InterviewSchema = z.object({
  interviewQuestions: z.array(InterviewQuestionSchema),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string(),
});

export const GraphSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

// ==========================================
// NEW PRODUCTION PLATFORM SCHEMAS
// ==========================================

export const SubjectAnalysisSchema = z.object({
  subject: z.string(),
  topics: z.array(z.string()),
  prerequisites: z.array(z.string()),
  difficulty: z.string(),
  estimatedTime: z.string(),
  learningOrder: z.array(z.string()),
  recommendedModes: z.array(z.string()),
  confidence: z.string(),
  learningObjectives: z.array(z.string()),
  studyStrategy: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      time: z.string(),
      description: z.string(),
    })
  ),
});

export const SubjectResourcesSchema = z.object({
  subjectGroup: z.enum(['programming', 'mathematics', 'biology', 'history', 'languages', 'general']),
  programming: z.nullable(z.object({
    codeExamples: z.array(z.object({ title: z.string(), code: z.string(), description: z.string() })),
    complexityAnalysis: z.array(z.object({ concept: z.string(), timeComplexity: z.string(), spaceComplexity: z.string(), explanation: z.string() })),
    debuggingChallenges: z.array(z.object({ title: z.string(), buggyCode: z.string(), expectedBehavior: z.string(), solution: z.string(), explanation: z.string() })),
  })),
  mathematics: z.nullable(z.object({
    formulaSheet: z.array(z.object({ name: z.string(), formula: z.string(), usage: z.string() })),
    stepByStepSolutions: z.array(z.object({ problem: z.string(), steps: z.array(z.string()), finalAnswer: z.string() })),
    practiceProblems: z.array(z.object({ problem: z.string(), difficulty: z.string(), solution: z.string() })),
    commonMistakes: z.array(z.object({ concept: z.string(), mistake: z.string(), correction: z.string() })),
  })),
  biology: z.nullable(z.object({
    keyProcesses: z.array(z.object({ processName: z.string(), steps: z.array(z.string()), significance: z.string() })),
    revisionNotes: z.array(z.object({ sectionTitle: z.string(), points: z.array(z.string()) })),
  })),
  history: z.nullable(z.object({
    timeline: z.array(z.object({ year: z.string(), event: z.string(), significance: z.string() })),
    importantEvents: z.array(z.object({ eventName: z.string(), causes: z.string(), consequences: z.string() })),
  })),
  languages: z.nullable(z.object({
    vocabulary: z.array(z.object({ word: z.string(), translation: z.string(), usage: z.string(), pronunciation: z.string() })),
    grammarQuiz: z.array(z.object({ question: z.string(), options: z.array(z.string()), answer: z.string(), rule: z.string() })),
    readingPractice: z.object({ passage: z.string(), questions: z.array(z.object({ q: z.string(), a: z.string() })) }),
    conversationExercises: z.array(z.object({ scenario: z.string(), phrases: z.array(z.string()) })),
  })),
  general: z.nullable(z.object({
    revisionNotes: z.array(z.object({ sectionTitle: z.string(), points: z.array(z.string()) })),
    glossary: z.array(z.object({ term: z.string(), definition: z.string() })),
  })),
});

export const ChallengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  instructions: z.string(),
  placeholder: z.string(),
  points: z.number(),
  timeLimit: z.string(),
  subject: z.string(),
  topic: z.string(),
  level: z.number(),
});

export const ChallengeEvaluationSchema = z.object({
  score: z.number(),
  passed: z.boolean(),
  feedback: z.string(),
  keyCorrections: z.array(z.string()),
});

export const CareerSchema = z.object({
  recommendedCareer: z.string(),
  careerReadiness: z.number(),
  skillsCovered: z.array(z.string()),
  skillsMissing: z.array(z.string()),
  nextTopics: z.array(z.string()),
  learningRoadmap: z.array(z.string()),
  confidenceScore: z.enum(['High', 'Medium', 'Low']),
});

export const MentorResponseSchema = z.object({
  message: z.string(),
  weakTopicAdvice: z.string(),
  analogyOrExplanation: z.string(),
  practiceQuestions: z.array(
    z.object({
      question: z.string(),
      hint: z.string(),
      answer: z.string(),
    })
  ),
  motivation: z.string(),
});

export const RecommendationSchema = z.object({
  recommendedAction: z.string(),
  reason: z.string(),
  targetMode: z.enum(['quiz', 'flashcards', 'challenge', 'mentor', 'summary']),
  estimatedTime: z.string(),
  xpReward: z.number(),
});
