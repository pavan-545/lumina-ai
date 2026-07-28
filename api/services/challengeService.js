import { 
  CHALLENGE_SYSTEM_PROMPT, getChallengeUserPrompt,
  EVALUATE_CHALLENGE_SYSTEM_PROMPT, getEvaluateChallengeUserPrompt 
} from '../prompts/challengePrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runChallengeService(mode, notes, context, additionalData, apiKey) {
  let systemPrompt = '';
  let userPrompt = '';

  if (mode === 'challenge') {
    const level = additionalData.level || 1;
    const type = additionalData.type || 'Daily';
    systemPrompt = buildSystemPrompt(CHALLENGE_SYSTEM_PROMPT, context);
    userPrompt = getChallengeUserPrompt(notes, level, type);
  } else if (mode === 'evaluate_challenge') {
    const challengeData = additionalData.challengeData || {};
    const studentAnswer = additionalData.studentAnswer || '';
    systemPrompt = buildSystemPrompt(EVALUATE_CHALLENGE_SYSTEM_PROMPT, context);
    userPrompt = getEvaluateChallengeUserPrompt(challengeData, studentAnswer);
  } else {
    throw new Error(`Unsupported mode in ChallengeService: ${mode}`);
  }

  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);

  if (error) {
    throw new Error(`ChallengeService (${mode}) failed to parse: ${error}`);
  }

  return { data, repaired };
}
