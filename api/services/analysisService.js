import { ANALYSIS_SYSTEM_PROMPT, getAnalysisUserPrompt } from '../prompts/analysisPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runAnalysisService(notes, context, apiKey) {
  const systemPrompt = buildSystemPrompt(ANALYSIS_SYSTEM_PROMPT, context);
  const userPrompt = getAnalysisUserPrompt(notes);
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`AnalysisService failed: ${error}`);
  }
  
  return { data, repaired };
}
