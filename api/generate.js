import { runAnalysisService } from './services/analysisService.js';
import { runStudyService } from './services/studyService.js';
import { runFlashcardService } from './services/flashcardService.js';
import { runQuizService } from './services/quizService.js';
import { runChallengeService } from './services/challengeService.js';
import { runMentorService } from './services/mentorService.js';
import { runCareerService } from './services/careerService.js';
import { runRecommendationService } from './services/recommendationService.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are supported.' });
  }

  const {
    notes,
    mode,
    context = {},
    // Additional parameters for challenges/mentoring/recommendations
    level,
    type,
    challengeData,
    studentAnswer,
    requestType,
    activeSession
  } = req.body;

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: 'API_KEY_MISSING',
      message: 'Gemini API key is not configured on the Vercel deployment environment.',
    });
  }

  const startTime = Date.now();
  let result = null;
  let serviceName = '';

  try {
    switch (mode) {
      case 'analyze':
      case 'topics': // maintain compatibility with existing 'topics' endpoint call if any
        serviceName = 'AnalysisService';
        result = await runAnalysisService(notes, context, API_KEY);
        break;

      case 'summary':
      case 'guide':
      case 'cheat_sheet':
      case 'graph':
      case 'subject_resources':
        serviceName = 'StudyService';
        result = await runStudyService(mode, notes, context, API_KEY);
        break;

      case 'flashcards':
        serviceName = 'FlashcardService';
        result = await runFlashcardService(notes, context, API_KEY);
        break;

      case 'quiz':
        serviceName = 'QuizService';
        result = await runQuizService(notes, context, API_KEY);
        break;

      case 'challenge':
      case 'evaluate_challenge':
        serviceName = 'ChallengeService';
        result = await runChallengeService(mode, notes, context, { level, type, challengeData, studentAnswer }, API_KEY);
        break;

      case 'mentor':
        serviceName = 'MentorService';
        result = await runMentorService(notes, context, requestType, API_KEY);
        break;

      case 'career':
        serviceName = 'CareerService';
        result = await runCareerService(notes, context, API_KEY);
        break;

      case 'recommendation':
        serviceName = 'RecommendationService';
        result = await runRecommendationService(context, activeSession, API_KEY);
        break;

      default:
        return res.status(400).json({ error: 'INVALID_MODE', message: `Study mode '${mode}' is not supported.` });
    }

    const generationTimeMs = Date.now() - startTime;

    // Build the final response including developer mode metadata
    return res.status(200).json({
      data: result.data,
      isMalformed: false,
      repaired: result.repaired || false,
      debug: {
        service: serviceName,
        generationTimeMs,
        model: 'gemini-1.5-flash',
        promptVersion: 'v2.1',
        retryCount: 0 // Retries handled client-side if needed, or initialized here
      }
    });

  } catch (error) {
    console.error(`Error in generate handler [Service: ${serviceName || mode}]:`, error);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || 'An internal server error occurred while processing the request.',
      debug: {
        service: serviceName || mode,
        generationTimeMs: Date.now() - startTime,
        errorDetails: error.message
      }
    });
  }
}
