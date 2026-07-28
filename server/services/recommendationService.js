import { RECOMMENDATION_SYSTEM_PROMPT, getRecommendationUserPrompt } from '../prompts/recommendationPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runRecommendationService(context, activeSession, apiKey) {
  const systemPrompt = buildSystemPrompt(RECOMMENDATION_SYSTEM_PROMPT, context);
  const userPrompt = getRecommendationUserPrompt(context, activeSession);
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`RecommendationService failed: ${error}`);
  }
  
  return { data, repaired };
}
