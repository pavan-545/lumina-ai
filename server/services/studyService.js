import { SUMMARY_SYSTEM_PROMPT, getSummaryUserPrompt } from '../prompts/summaryPrompt.js';
import { GUIDE_SYSTEM_PROMPT, getGuideUserPrompt } from '../prompts/guidePrompt.js';
import { CHEAT_SHEET_SYSTEM_PROMPT, getCheatSheetUserPrompt } from '../prompts/cheatSheetPrompt.js';
import { GRAPH_SYSTEM_PROMPT, getGraphUserPrompt } from '../prompts/graphPrompt.js';
import { SUBJECT_RESOURCES_SYSTEM_PROMPT, getSubjectResourcesUserPrompt } from '../prompts/subjectResourcesPrompt.js';
import { callGemini } from '../utils/geminiClient.js';
import { validateAndParseJson } from '../utils/jsonValidator.js';
import { buildSystemPrompt } from '../utils/promptBuilder.js';

export async function runStudyService(mode, notes, context, apiKey) {
  let systemPrompt = '';
  let userPrompt = '';

  switch (mode) {
    case 'summary':
      systemPrompt = buildSystemPrompt(SUMMARY_SYSTEM_PROMPT, context);
      userPrompt = getSummaryUserPrompt(notes);
      break;
    case 'guide':
      systemPrompt = buildSystemPrompt(GUIDE_SYSTEM_PROMPT, context);
      userPrompt = getGuideUserPrompt(notes);
      break;
    case 'cheat_sheet':
      systemPrompt = buildSystemPrompt(CHEAT_SHEET_SYSTEM_PROMPT, context);
      userPrompt = getCheatSheetUserPrompt(notes);
      break;
    case 'graph':
      systemPrompt = buildSystemPrompt(GRAPH_SYSTEM_PROMPT, context);
      userPrompt = getGraphUserPrompt(notes);
      break;
    case 'subject_resources':
      systemPrompt = buildSystemPrompt(SUBJECT_RESOURCES_SYSTEM_PROMPT, context);
      userPrompt = getSubjectResourcesUserPrompt(notes);
      break;
    default:
      throw new Error(`Unsupported mode in StudyService: ${mode}`);
  }

  const rawText = await callGemini(systemPrompt, userPrompt, apiKey);
  const { data, error, repaired } = validateAndParseJson(rawText);

  if (error) {
    throw new Error(`StudyService (${mode}) failed to parse: ${error}`);
  }

  return { data, repaired };
}
