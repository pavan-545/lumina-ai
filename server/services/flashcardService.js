import { FLASHCARD_SYSTEM_PROMPT, getFlashcardUserPrompt } from '../prompts/flashcardPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runFlashcardService(notes, context, apiKey) {
  const systemPrompt = buildSystemPrompt(FLASHCARD_SYSTEM_PROMPT, context);
  const userPrompt = getFlashcardUserPrompt(notes);
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`FlashcardService failed: ${error}`);
  }
  
  return { data, repaired };
}
