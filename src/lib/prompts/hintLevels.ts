/**
 * Hint Level Prompts
 *
 * This module provides additional system prompt guidance based on
 * the detected stuck level of the student.
 *
 * The prompts are appended to the base Socratic system prompt to
 * adjust hint specificity while maintaining the Socratic method.
 *
 * Hint Levels:
 * - Level 0-1: Very vague hints that prompt thinking (base Socratic approach)
 * - Level 2: More specific guidance to help student past the block
 * - Level 3+: Concrete actionable hints while still requiring student to execute
 */

/**
 * Gets the appropriate hint level prompt addition based on stuck level
 *
 * @param stuckLevel - The detected stuck level (0-3+)
 * @returns Additional prompt text to append to system prompt
 *
 * @example
 * ```typescript
 * const stuckLevel = analyzeStuckLevel(messages);
 * const hintPrompt = getHintLevelPrompt(stuckLevel);
 * const systemPrompt = SOCRATIC_SYSTEM_PROMPT + hintPrompt;
 * ```
 */
export function getHintLevelPrompt(stuckLevel: number): string {
  if (stuckLevel <= 1) {
    // Level 0-1: Use base Socratic prompt (very vague hints)
    // No additional guidance needed - the base prompt handles this well
    return '';
  } else if (stuckLevel === 2) {
    // Level 2: Student seems stuck - provide more specific guidance
    return `

CURRENT STUDENT STATE: The student seems stuck and needs more specific guidance.

ADJUSTED APPROACH:
- Move from very vague hints to more specific ones
- You can mention relevant concepts or theorems by name
- Guide them toward the method, but don't tell them the exact steps
- Example: Instead of "What do you know about triangles?", try "What formula relates the area of a triangle to its base and height?"
- Still ask questions, but make them more targeted and specific
- Help narrow down the solution path without revealing it

Remember: Even with more specific hints, NEVER give the final answer or solve it for them.`;
  } else {
    // Level 3+: Student is struggling - give concrete actionable hints
    return `

CURRENT STUDENT STATE: The student is clearly struggling and needs concrete, actionable hints to make progress.

ADJUSTED APPROACH:
- Provide concrete hints that give them something specific to do
- Tell them which concept/formula/method to use, but let them execute it
- Example: "Try using the Pythagorean theorem: a² + b² = c². Can you identify which sides are a, b, and c in your triangle?"
- Example: "The first step is to isolate the variable. Try subtracting 5 from both sides of the equation."
- Be direct about the approach, but still make them do the work
- After giving a concrete hint, ask them to execute it: "Can you try that now?"

IMPORTANT:
- Even at this level, NEVER solve the problem for them
- NEVER give the final numerical answer
- Give them the next concrete step, then let them work through it
- After they execute your hint, continue with Socratic questioning

Think of it as: "Here's WHAT to do next, but YOU need to DO it and tell me what you get."`;
  }
}

/**
 * Hint level examples for reference/testing
 *
 * These examples demonstrate the progression from vague to concrete hints
 * for the same problem at different stuck levels.
 */
export const HINT_LEVEL_EXAMPLES = {
  problem: 'Solve for x: 2x + 5 = 13',

  level0to1: {
    description: 'Very vague - prompts thinking',
    examples: [
      'What are you trying to find in this equation?',
      'What do you know about solving equations?',
      'How do equations stay balanced?',
      'What would be your first step in approaching this?',
    ],
  },

  level2: {
    description: 'More specific - guides toward method',
    examples: [
      'What operation would help you isolate the variable x on one side?',
      'Think about inverse operations - what\'s the opposite of adding 5?',
      'Remember that you can do the same operation to both sides of an equation. What could you subtract from both sides?',
      'Notice the "+5" next to the 2x. What could you do to eliminate that 5 from the left side?',
    ],
  },

  level3plus: {
    description: 'Concrete - tells what to do, student executes',
    examples: [
      'The first step is to isolate the term with x. Try subtracting 5 from both sides of the equation. What do you get?',
      'Start by removing the "+5" from the left side. Subtract 5 from both sides: (2x + 5) - 5 = 13 - 5. Can you simplify that?',
      'Use inverse operations to isolate x. First, subtract 5 from both sides to remove the constant. What equation do you get after doing that?',
    ],
  },
};

/**
 * Validates that a hint level is within expected range
 * Useful for error checking
 */
export function isValidHintLevel(level: number): boolean {
  return typeof level === 'number' && level >= 0 && level <= 5;
}
