import { CAREER_SYSTEM_PROMPT, getCareerUserPrompt } from '../prompts/careerPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runCareerService(notes, context, apiKey) {
  const systemPrompt = buildSystemPrompt(CAREER_SYSTEM_PROMPT, context);
  const userPrompt = getCareerUserPrompt(notes);
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`CareerService failed: ${error}`);
  }
  
  return { data, repaired };
}
