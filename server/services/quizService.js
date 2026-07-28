import { QUIZ_SYSTEM_PROMPT, getQuizUserPrompt } from '../prompts/quizPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runQuizService(notes, context, apiKey) {
  const systemPrompt = buildSystemPrompt(QUIZ_SYSTEM_PROMPT, context);
  const userPrompt = getQuizUserPrompt(notes);
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`QuizService failed: ${error}`);
  }
  
  return { data, repaired };
}
