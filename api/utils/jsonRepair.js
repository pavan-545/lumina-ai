/**
 * Server-side JSON repair utility
 * Fixes markdown blocks, trailing commas, and unclosed brackets/braces.
 */
export function repairJson(rawString) {
  if (!rawString) return '';
  
  let cleaned = rawString.trim();
  
  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.trim();

  // Repair trailing commas in arrays/objects
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Attempt to balance braces if truncated
  let openBraces = (cleaned.match(/\{/g) || []).length;
  let closeBraces = (cleaned.match(/\}/g) || []).length;
  let openBrackets = (cleaned.match(/\[/g) || []).length;
  let closeBrackets = (cleaned.match(/\]/g) || []).length;

  while (openBraces > closeBraces) {
    cleaned += '}';
    closeBraces++;
  }
  while (openBrackets > closeBrackets) {
    cleaned += ']';
    closeBrackets++;
  }

  return cleaned;
}
