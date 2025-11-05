/**
 * Stuck Detection Logic
 *
 * This module analyzes conversation history to detect when students are stuck
 * and determines the appropriate hint level for the Socratic tutor.
 *
 * Stuck Level Scale:
 * - Level 0-1: Not stuck, vague hints (early conversation, engaged student)
 * - Level 2: Somewhat stuck, more specific guidance needed
 * - Level 3+: Very stuck, concrete actionable hints required
 *
 * Detection Strategy:
 * - Looks at last 5 messages to determine stuck state
 * - Increments stuck counter for signs of confusion/lack of progress
 * - Resets counter when student shows understanding or progress
 * - Conservative approach: better to wait one extra turn than give hints too early
 */

/**
 * Message interface - compatible with both API route and conversation context
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

/**
 * Pattern indicators that suggest a student is stuck
 */
const STUCK_PATTERNS = {
  // Very short responses (often indicate confusion or giving up)
  SHORT_RESPONSE_THRESHOLD: 10,

  // Keywords indicating explicit confusion or help requests
  HELP_KEYWORDS: /\b(help|stuck|confused|don't know|idk|don't understand|lost|what|huh|\?{2,})\b/i,

  // Repeated similar responses (student spinning wheels)
  REPETITION_SIMILARITY_THRESHOLD: 0.8, // 80% similar content
};

/**
 * Pattern indicators that suggest student is making progress
 */
const PROGRESS_PATTERNS = {
  // Longer, thoughtful responses
  THOUGHTFUL_RESPONSE_THRESHOLD: 30,

  // Keywords indicating engagement and reasoning
  REASONING_KEYWORDS: /\b(because|so|if|then|would|could|think|believe|maybe|suppose|let me|i see|understand|right|makes sense)\b/i,

  // Questions showing engagement (not just "what?")
  ENGAGED_QUESTIONS: /\b(why|how|when|where|which|would it|could i|should i|what if|does that mean)\b/i,

  // Mathematical reasoning
  MATH_REASONING: /\b(equals|multiply|divide|add|subtract|solve|calculate|formula|equation|variable)\b/i,
};

/**
 * Analyzes a message to determine if it shows signs of being stuck
 * Returns a score (higher = more stuck indicators)
 */
function analyzeMessageForStuckness(message: Message): number {
  const content = message.content.trim();
  let stuckScore = 0;

  // Only analyze user messages
  if (message.role !== 'user') {
    return 0;
  }

  // Check for very short responses
  if (content.length < STUCK_PATTERNS.SHORT_RESPONSE_THRESHOLD) {
    stuckScore += 1;
  }

  // Check for help keywords
  if (STUCK_PATTERNS.HELP_KEYWORDS.test(content)) {
    stuckScore += 1;
  }

  // Check if it's ONLY a question mark or very minimal content
  if (/^[\s?!.]*$/.test(content) || content === '?' || content === '??') {
    stuckScore += 2; // Extra weight for extremely minimal responses
  }

  return stuckScore;
}

/**
 * Analyzes a message to determine if it shows signs of progress
 * Returns a score (higher = more progress indicators)
 */
function analyzeMessageForProgress(message: Message): number {
  const content = message.content.trim();
  let progressScore = 0;

  // Only analyze user messages
  if (message.role !== 'user') {
    return 0;
  }

  // Check for thoughtful length
  if (content.length >= PROGRESS_PATTERNS.THOUGHTFUL_RESPONSE_THRESHOLD) {
    progressScore += 1;
  }

  // Check for reasoning keywords
  if (PROGRESS_PATTERNS.REASONING_KEYWORDS.test(content)) {
    progressScore += 1;
  }

  // Check for engaged questions
  if (PROGRESS_PATTERNS.ENGAGED_QUESTIONS.test(content)) {
    progressScore += 1;
  }

  // Check for mathematical reasoning
  if (PROGRESS_PATTERNS.MATH_REASONING.test(content)) {
    progressScore += 1;
  }

  return progressScore;
}

/**
 * Checks if two messages are very similar (repetition detection)
 */
function areSimilarMessages(msg1: string, msg2: string): boolean {
  const normalized1 = msg1.toLowerCase().trim();
  const normalized2 = msg2.toLowerCase().trim();

  // Simple Jaccard similarity on words
  const words1 = new Set(normalized1.split(/\s+/));
  const words2 = new Set(normalized2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  const similarity = intersection.size / union.size;

  return similarity >= STUCK_PATTERNS.REPETITION_SIMILARITY_THRESHOLD;
}

/**
 * Main function: Analyzes conversation history to determine stuck level
 *
 * @param messages - Array of conversation messages
 * @returns Stuck level from 0 (not stuck) to 3+ (very stuck)
 *
 * Algorithm:
 * 1. Look at last 5 messages (recent context)
 * 2. For each user message, check for stuck vs progress indicators
 * 3. Accumulate stuck count based on patterns
 * 4. Reset on clear progress signals
 * 5. Cap at level 3 for concrete hints
 *
 * @example
 * ```typescript
 * const messages = [
 *   { role: 'user', content: 'help', timestamp: 123 },
 *   { role: 'assistant', content: 'What do you know?', timestamp: 124 },
 *   { role: 'user', content: 'idk', timestamp: 125 },
 * ];
 * const level = analyzeStuckLevel(messages); // Returns 2 (student stuck)
 * ```
 */
export function analyzeStuckLevel(messages: Message[]): number {
  // Handle empty or very short conversations
  if (messages.length === 0) {
    return 0; // Not stuck, just starting
  }

  // Look at last 5 messages for recent context
  const recentMessages = messages.slice(-5);

  // Filter for only user messages
  const userMessages = recentMessages.filter(msg => msg.role === 'user');

  if (userMessages.length === 0) {
    return 0; // No user messages to analyze
  }

  let stuckCount = 0;
  let progressCount = 0;

  // Analyze each user message
  for (let i = 0; i < userMessages.length; i++) {
    const message = userMessages[i];

    // Check for stuck indicators
    const stuckScore = analyzeMessageForStuckness(message);
    stuckCount += stuckScore;

    // Check for progress indicators
    const progressScore = analyzeMessageForProgress(message);
    progressCount += progressScore;

    // Check for repetition if we have a previous message
    if (i > 0) {
      const prevMessage = userMessages[i - 1];
      if (areSimilarMessages(message.content, prevMessage.content)) {
        stuckCount += 1; // Repetition indicates stuck
      }
    }
  }

  // If student shows strong progress, reset stuck level
  if (progressCount >= 2) {
    return 0; // Clear progress, reset to vague hints
  }

  // If student shows some progress, reduce stuck level
  if (progressCount >= 1 && stuckCount > 0) {
    stuckCount = Math.floor(stuckCount / 2); // Reduce by half
  }

  // Conservative approach: require at least 2 stuck indicators for level 2
  if (stuckCount < 2) {
    return Math.min(stuckCount, 1); // Level 0 or 1 (vague hints)
  }

  // Cap at level 3 for concrete hints
  return Math.min(stuckCount, 3);
}

/**
 * Helper function to describe the stuck level for logging/debugging
 */
export function describeStuckLevel(level: number): string {
  switch (level) {
    case 0:
      return 'Not stuck - Student just starting or engaged';
    case 1:
      return 'Slightly uncertain - Use vague hints';
    case 2:
      return 'Stuck - Provide more specific guidance';
    case 3:
    default:
      return `Very stuck (level ${level}) - Give concrete actionable hints`;
  }
}

/**
 * Skill gap analysis result
 */
export interface SkillGapAnalysis {
  understands: boolean;
  missingSkill?: string;
  reasoning: string;
  confidence: number;
}

/**
 * Analyzes a student's response to determine if they understand a specific skill
 * Uses GPT-4 to perform deep analysis of understanding
 *
 * @param message - The student's response to analyze
 * @param requiredSkills - Array of skill IDs that are required for the problem
 * @param skillDescriptions - Map of skill IDs to their descriptions for context
 * @returns Promise<SkillGapAnalysis> - Analysis of which skills are missing
 *
 * @example
 * ```typescript
 * const analysis = await analyzeStudentResponse(
 *   "I think I add 5 to both sides?",
 *   ["one_step_equations", "basic_arithmetic"],
 *   { "one_step_equations": "Solve equations with one operation" }
 * );
 * // Returns: { understands: true, reasoning: "Shows correct approach", confidence: 0.85 }
 * ```
 */
export async function analyzeStudentResponse(
  message: string,
  requiredSkills: string[],
  skillDescriptions: Record<string, string> = {}
): Promise<SkillGapAnalysis> {
  // Import OpenAI dynamically to avoid server-side issues
  const OpenAI = (await import('openai')).default;

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
    console.error('OpenAI API key not configured for gap analysis');
    return {
      understands: false,
      reasoning: 'Unable to analyze response: API key not configured',
      confidence: 0,
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Build context about required skills
    const skillContext = requiredSkills
      .map(skillId => {
        const description = skillDescriptions[skillId] || skillId;
        return `- ${skillId}: ${description}`;
      })
      .join('\n');

    // Build prompt for GPT-4
    const prompt = `You are a math education expert analyzing a student's response to determine if they understand specific prerequisite skills.

REQUIRED SKILLS:
${skillContext}

STUDENT'S RESPONSE:
"${message}"

Analyze this response and determine:
1. Does the student demonstrate understanding of these skills?
2. Which specific skill (if any) appears to be missing or weak?
3. What is your reasoning for this assessment?
4. How confident are you in this assessment (0.0 to 1.0)?

Return your analysis as JSON in this exact format:
{
  "understands": boolean,
  "missingSkill": "skill_id" or null,
  "reasoning": "brief explanation",
  "confidence": number between 0 and 1
}

Guidelines:
- "I'm not sure", "I don't know", "help" → understands: false
- Incorrect mathematical approach → identify which skill is missing
- Vague or minimal response → understands: false
- Correct approach or reasoning → understands: true
- If multiple skills are weak, return the most fundamental one (earliest prerequisite)`;

    // Call OpenAI with JSON mode
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise educational analyst. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3, // Low temperature for consistent analysis
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(responseContent) as SkillGapAnalysis;

    // Validate response structure
    if (typeof analysis.understands !== 'boolean') {
      throw new Error('Invalid response format: understands must be boolean');
    }

    if (typeof analysis.reasoning !== 'string') {
      throw new Error('Invalid response format: reasoning must be string');
    }

    if (typeof analysis.confidence !== 'number' || analysis.confidence < 0 || analysis.confidence > 1) {
      // Default to medium confidence if invalid
      analysis.confidence = 0.5;
    }

    console.log(`[Gap Analysis] Message: "${message.substring(0, 50)}..."`);
    console.log(`[Gap Analysis] Understands: ${analysis.understands}, Missing: ${analysis.missingSkill || 'none'}`);
    console.log(`[Gap Analysis] Reasoning: ${analysis.reasoning}`);

    return analysis;
  } catch (error: unknown) {
    console.error('Error in gap analysis:', error);

    // Return conservative fallback - assume student doesn't understand
    return {
      understands: false,
      reasoning: 'Unable to analyze response due to error. Assuming gap for safety.',
      confidence: 0.3,
      missingSkill: requiredSkills[0] || undefined,
    };
  }
}
