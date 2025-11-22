/**
 * Language Adaptation Module
 *
 * Provides age-appropriate language guidance for the AI tutor.
 * This app is designed for middle school students (grades 6-8).
 *
 * Philosophy:
 * - Use clear, conversational language that's engaging and approachable
 * - Introduce basic math terminology naturally
 * - Avoid overly formal or academic tone
 * - Make math feel accessible and relevant
 *
 * The language guidance is appended to the system prompt to adjust vocabulary
 * while preserving the core Socratic teaching methodology.
 */

/**
 * Vocabulary guidelines for middle school students
 * These are examples used in the prompt to guide the AI's language choices
 */
export const VOCABULARY_EXAMPLES = {
  preferred: [
    'solve for',
    'figure out',
    'work through',
    'variable (the unknown)',
    'equation',
    'expression',
    'combine like terms',
    'isolate the variable',
    'both sides of the equation',
    'check your answer',
  ],
  canUse: [
    'Basic operations: sum, difference, product, quotient',
    'Variables and equations: x, y, solve for, unknown',
    'Geometry: area, perimeter, volume',
    'Numbers: negative numbers, fractions, decimals, percentages',
    'Relationships: ratio, proportion, rate',
  ],
  avoid: [
    'Overly formal terms: evaluate, compute, determine',
    'Advanced topics: quadratic, polynomial, theorem',
    'Complex terminology: coefficient (unless explaining it)',
    'Abstract language without context',
  ],
};

/**
 * Gets language adaptation guidance for middle school students
 *
 * @returns String to append to the system prompt with language guidance
 */
export function getLanguageGuidance(): string {
  return `

LANGUAGE ADAPTATION FOR MIDDLE SCHOOL STUDENTS (GRADES 6-8):
=============================================================

Use clear, conversational language that's engaging and approachable for middle schoolers.

TONE & APPROACH:
- Be friendly and encouraging, not overly formal
- Make math feel relevant and accessible
- Use everyday language when possible
- Explain terms naturally when introducing them

VOCABULARY GUIDELINES:
- Can use basic math terms: sum, difference, product, quotient
- Use conversational phrases: "figure out", "work through", "let's think about"
- Introduce variables naturally: "x represents the unknown number we're looking for"
- Use equation language: "solve for x", "both sides of the equation"
- Basic geometry terms: area, perimeter, volume
- Can discuss: negative numbers, fractions, decimals, percentages, ratios, proportions

EXAMPLES OF APPROPRIATE LANGUAGE:
✅ "What operation could help you isolate x?"
✅ "When we have 2x + 5, what does that 2 in front of x tell us?"
✅ "How can you check if your solution works?"
✅ "What's the connection between the base and height when finding area?"
✅ "Let's figure out what x represents in this problem."

CAN INTRODUCE AND EXPLAIN NATURALLY:
- "x is a variable - just a letter that represents an unknown value we're trying to find"
- "An equation shows that two things are equal"
- "An expression is like a math phrase - numbers and operations combined"
- "The coefficient is the number in front of a variable, like the 2 in 2x"

AVOID:
❌ Overly formal language: "evaluate", "compute", "determine", "derive"
❌ Advanced terms without context: "theorem", "polynomial", "quadratic"
❌ Being too technical or academic in tone

Keep language clear, friendly, and engaging. When introducing new terms, explain them briefly in simple language. Students at this level are building their math vocabulary and confidence.`;
}

/**
 * Helper function to describe language level in human-readable format
 */
export function describeLanguageLevel(): string {
  return 'Clear, conversational language for middle school students (grades 6-8)';
}

/**
 * Gets a language example for middle school level
 * Useful for testing and documentation
 */
export function getLanguageExample(): {
  problem: string;
  goodResponse: string;
  badResponse: string;
} {
  return {
    problem: 'Solve for x: 2x + 5 = 13',
    goodResponse: "Good question! What operation could help you isolate x? What's on both sides of the equation?",
    badResponse: 'Subtract 5 from both sides to compute 2x = 8, then divide by the coefficient to determine x = 4.',
  };
}
