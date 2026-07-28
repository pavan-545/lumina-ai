import { MENTOR_SYSTEM_PROMPT, getMentorUserPrompt } from '../prompts/mentorPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runMentorService(notes, context, requestType, apiKey) {
  const systemPrompt = buildSystemPrompt(MENTOR_SYSTEM_PROMPT, context);
  const userPrompt = getMentorUserPrompt(
    notes,
    requestType,
    context.weakTopics || [],
    context.recentMistakes || []
  );
  
  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);
  
  if (error) {
    throw new Error(`MentorService failed: ${error}`);
  }
  
  return { data, repaired };
}
