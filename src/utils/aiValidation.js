/**
 * AI Content Validation and JSON Recovery Engine
 */

/**
 * Clean and repair malformed JSON strings returned by LLM models
 */
export function repairJsonString(rawString) {
  if (!rawString) return '';
  
  let cleaned = rawString.trim();
  
  // Remove markdown JSON formatting if present
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
  // e.g. [1, 2, ] -> [1, 2] or {"a": 1, } -> {"a": 1}
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Attempt to balance brackets if truncated
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

/**
 * Validate and score parsed JSON data using Zod schema
 */
export function validateAndScoreResponse(rawResponse, schema) {
  let wasRepaired = false;
  let parsedJson = null;
  let parseError = null;

  // 1. Initial Attempt to Parse JSON
  try {
    parsedJson = JSON.parse(rawResponse);
  } catch (initialError) {
    // Attempt repair
    const repaired = repairJsonString(rawResponse);
    try {
      parsedJson = JSON.parse(repaired);
      wasRepaired = true;
    } catch (repairError) {
      parseError = repairError.message;
    }
  }

  // 2. If parsing failed, return Low Confidence
  if (!parsedJson) {
    return {
      success: false,
      parsedData: null,
      confidence: 'Low Confidence',
      confidenceScore: 10,
      confidenceMessage: 'Failed to parse AI output. The response is malformed. Consider regenerating.',
      error: parseError || 'Malformed JSON output',
    };
  }

  // 3. Schema Validation
  const validationResult = schema.safeParse(parsedJson);
  
  if (!validationResult.success) {
    // Attempt fallback/partial recovery or just return Needs Review / Low Confidence
    const issues = validationResult.error.issues;
    console.warn('Zod validation failed, checking issues:', issues);

    // Let's count missing vs invalid type issues
    const isMainStructureValid = !issues.some(issue => issue.path.length === 0);
    
    if (isMainStructureValid) {
      // Partial structure exists, score as Needs Review
      return {
        success: true, // We allow parsing fallback if we can still render it
        parsedData: parsedJson, // return raw parsed json to let UI attempt render
        confidence: 'Needs Review',
        confidenceScore: 45,
        confidenceMessage: 'Study material was generated but contains missing fields or minor schema mismatches.',
        error: issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      };
    } else {
      return {
        success: false,
        parsedData: null,
        confidence: 'Low Confidence',
        confidenceScore: 20,
        confidenceMessage: 'The AI output does not match the required study format structure. Consider regenerating.',
        error: 'Schema structure mismatch',
      };
    }
  }

  // 4. Calculate Final Confidence Score
  // Excellent: Parse succeeded, no repairs, full Zod compliance.
  // Good: Parse succeeded but needed JSON repair string normalization.
  if (wasRepaired) {
    return {
      success: true,
      parsedData: validationResult.data,
      confidence: 'Good',
      confidenceScore: 80,
      confidenceMessage: 'Successful generation. Minor syntax corrections were automatically applied.',
    };
  }

  return {
    success: true,
    parsedData: validationResult.data,
    confidence: 'Excellent',
    confidenceScore: 100,
    confidenceMessage: 'Ideal generation. Perfect JSON structure and full data schema validation matching.',
  };
}
