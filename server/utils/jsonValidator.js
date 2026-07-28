import { repairJson } from './jsonRepair.js';

/**
 * Validates and parses raw text responses into clean JSON objects.
 * If initial parsing fails, attempts json repair.
 */
export function validateAndParseJson(rawText) {
  if (!rawText) {
    throw new Error('Empty AI response.');
  }

  let parsed = null;
  let errorMsg = null;

  try {
    parsed = JSON.parse(rawText);
    return { data: parsed, repaired: false };
  } catch (initialError) {
    const repairedText = repairJson(rawText);
    try {
      parsed = JSON.parse(repairedText);
      return { data: parsed, repaired: true };
    } catch (repairError) {
      errorMsg = `Parse error: ${initialError.message}. Repair error: ${repairError.message}`;
      console.error('Failed to parse or repair JSON. Raw text was:', rawText);
    }
  }

  return { data: null, error: errorMsg || 'Invalid JSON format from AI' };
}
