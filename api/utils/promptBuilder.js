/**
 * Shared Context Prompt Builder
 * Appends student context (learning memory, goals, stats) into LLM system prompts.
 */
export function buildSystemPrompt(baseInstruction, context = {}) {
  let contextSnippet = '';
  
  if (context && Object.keys(context).length > 0) {
    const {
      subject = '',
      goal = 'Learn From Scratch',
      difficulty = 'Intermediate',
      weakTopics = [],
      strongTopics = [],
      currentLevel = 1,
      xp = 0,
      recentMistakes = []
    } = context;

    contextSnippet = `
=========================================
STUDENT CONTEXT & PERSONALIZATION DATA:
- Subject: ${subject || 'Detected Automatically'}
- Active Learning Goal: ${goal} (Customize complexity/length to this goal)
- Current Target Difficulty Level: ${difficulty}
- Gamification Level: ${currentLevel} (XP: ${xp})
- Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None logged yet'}
- Strong Topics: ${strongTopics.length > 0 ? strongTopics.join(', ') : 'None logged yet'}
${recentMistakes.length > 0 ? `- Recent Mistakes: ${JSON.stringify(recentMistakes.slice(0, 3))}` : ''}
=========================================
PERSONALIZATION RULES:
1. Tailor the tone and material details based on the Goal. If the goal is "Quick Revision" or "30-Minute Revision", keep definitions concise and high-impact. If "Learn From Scratch", provide detailed foundations and clear analogies. If "Interview Preparation", focus on evaluation criteria, practical edge cases, and industry-standard best practices.
2. Interleave hints or content addressing the student's Weak Topics where conceptually relevant.
`;
  }

  return `${baseInstruction}\n${contextSnippet}\nStrictly output valid JSON matching the requested schema ONLY. No conversational text or markdown codeblocks outside the JSON structure.`;
}
