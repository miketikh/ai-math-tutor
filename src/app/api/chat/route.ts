import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SOCRATIC_SYSTEM_PROMPT } from '@/lib/prompts/socraticPrompt';
import { analyzeStuckLevel, describeStuckLevel } from '@/lib/stuckDetection';
import { getHintLevelPrompt } from '@/lib/prompts/hintLevels';
import { validateResponse, getViolationDescription, generateFallbackResponse } from '@/lib/responseValidation';
import { getStricterPromptWithContext } from '@/lib/prompts/stricterPrompt';
import { detectComplexity, describeComplexityLevel } from '@/lib/problemComplexity';
import { getLanguageGuidance, describeLanguageLevel } from '@/lib/prompts/languageAdaptation';

// Types for our Chat API
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
  problemContext?: string;
  recentlyMasteredSkills?: string[]; // Skills just mastered (for return context)
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 1;

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<ChatRequest>;

  if (!req.message || typeof req.message !== 'string' || req.message.trim().length === 0) {
    return { valid: false, error: 'Message is required and must be a non-empty string.' };
  }

  if (!Array.isArray(req.conversationHistory)) {
    return { valid: false, error: 'conversationHistory must be an array.' };
  }

  // Validate each message in history
  for (const msg of req.conversationHistory) {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: 'Each message must have a valid role (user, assistant, or system).' };
    }
    if (!msg.content || typeof msg.content !== 'string') {
      return { valid: false, error: 'Each message must have content as a string.' };
    }
  }

  if (req.problemContext !== undefined && typeof req.problemContext !== 'string') {
    return { valid: false, error: 'problemContext must be a string if provided.' };
  }

  if (req.recentlyMasteredSkills !== undefined && !Array.isArray(req.recentlyMasteredSkills)) {
    return { valid: false, error: 'recentlyMasteredSkills must be an array if provided.' };
  }

  return { valid: true };
}

/**
 * Builds the messages array for OpenAI API
 * Includes stuck detection, hint level adjustment, and language adaptation
 *
 * @param useStricterPrompt - If true, uses stricter regeneration prompt (for retries)
 * @param violationType - Type of violation detected (for context in stricter prompt)
 */
function buildMessagesArray(
  message: string,
  conversationHistory: Message[],
  problemContext?: string,
  useStricterPrompt = false,
  violationType?: string,
  recentlyMasteredSkills?: string[]
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Analyze stuck level for hint adjustment (NOT for branching decisions)
  // Note: Skill branching decisions are now handled by AI in /api/sessions/analyze-branching
  // This stuck detection is only used to adjust hint verbosity in tutoring responses
  const stuckLevel = analyzeStuckLevel(conversationHistory);

  // Log stuck level for debugging (server-side only, not sent to client)
  console.log(`[Hint Level Detection] ${describeStuckLevel(stuckLevel)} (Level: ${stuckLevel})`);

  // Detect problem complexity for language adaptation
  // Use problem context if available, otherwise use current message
  const textToAnalyze = problemContext || message;
  const complexityLevel = detectComplexity(textToAnalyze);

  // Log complexity level for debugging (server-side only, not sent to client)
  console.log(`[Language Adaptation] ${describeComplexityLevel(complexityLevel)} (Level: ${complexityLevel})`);
  console.log(`[Language Adaptation] Using: ${describeLanguageLevel(complexityLevel)}`);

  // Build system prompt with stuck level adjustments
  let systemMessage: string;

  if (useStricterPrompt) {
    // Use stricter prompt for regeneration after validation failure
    systemMessage = getStricterPromptWithContext(violationType);
    console.log(`[Response Validation] Using stricter prompt for regeneration (Violation: ${violationType})`);
  } else {
    // Use normal Socratic prompt with hint level adjustments
    systemMessage = SOCRATIC_SYSTEM_PROMPT;

    // Add hint level guidance based on stuck detection
    const hintLevelGuidance = getHintLevelPrompt(stuckLevel);
    if (hintLevelGuidance) {
      systemMessage += hintLevelGuidance;
    }

    // Add language adaptation guidance based on problem complexity
    const languageGuidance = getLanguageGuidance(complexityLevel);
    if (languageGuidance) {
      systemMessage += languageGuidance;
    }

    // Add diagnostic flow guidance for stuck students
    if (stuckLevel >= 2) {
      systemMessage += `\n\nDIAGNOSTIC FLOW GUIDANCE:
The student appears to be stuck. If they demonstrate a gap in prerequisite knowledge:
1. Acknowledge their difficulty without judgment
2. Ask if they would like to practice a specific prerequisite skill first
3. Suggest: "Would you like to practice [skill name]? We can work on some simpler problems to build confidence."
4. If they say "I'm not sure", "I don't know", or give an incorrect approach that shows a clear skill gap, recommend focused practice
5. Be specific about which skill would help (e.g., "Let's practice one-step equations first")

Remember: Only recommend practice if there's a CLEAR gap in prerequisite knowledge. Don't branch unnecessarily.`;
    }
  }

  // Add problem context if provided
  if (problemContext) {
    systemMessage += `\n\nCURRENT PROBLEM CONTEXT:\n${problemContext}\n\nRemember: Guide the student to solve this problem themselves. Do not solve it for them.`;
  }

  // Add return context if student just mastered skills
  if (recentlyMasteredSkills && recentlyMasteredSkills.length > 0) {
    const skillsList = recentlyMasteredSkills.join(', ');
    systemMessage += `\n\nRETURN CONTEXT - RECENTLY MASTERED SKILLS:
The student just completed practice sessions and mastered the following skill(s): ${skillsList}

IMPORTANT INSTRUCTIONS:
1. Reference this newly acquired knowledge when helping with the main problem
2. Build on their success: "Now that you understand ${recentlyMasteredSkills[0]}, let's use that skill here..."
3. Connect the practiced skill to the current problem explicitly
4. Acknowledge their progress and celebrate the connection
5. Guide them to apply what they just learned

Example: "Great job mastering ${recentlyMasteredSkills[0]}! Now you can use that to tackle this step..."`;
  }

  messages.push({ role: 'system', content: systemMessage });

  // Add conversation history
  for (const msg of conversationHistory) {
    if (msg.role !== 'system') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add new user message
  messages.push({ role: 'user', content: message });

  return messages;
}

/**
 * Calls OpenAI API with timeout and retry logic
 */
async function callOpenAIWithRetry(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  retries = MAX_RETRIES
): Promise<{ success: boolean; response?: string; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS);
      });

      // Create the OpenAI API call promise
      const apiPromise = openai.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o for better performance
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      // Race between timeout and API call
      const response = await Promise.race([apiPromise, timeoutPromise]);

      // Extract the response content
      const aiContent = response.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error('No response from AI');
      }

      return { success: true, response: aiContent };
    } catch (error: unknown) {
      console.error(`OpenAI API attempt ${attempt + 1} failed:`, error);

      // If this is the last retry, return the error
      if (attempt === retries) {
        // Handle timeout specifically
        if (error instanceof Error && error.message === 'Request timeout') {
          return {
            success: false,
            error: 'Request timed out after 10 seconds. Please try again.',
          };
        }

        // Handle OpenAI-specific errors
        if (error && typeof error === 'object' && 'error' in error) {
          const openAIError = error as { error?: { type?: string; message?: string } };

          if (openAIError.error?.type === 'rate_limit_error') {
            return {
              success: false,
              error: 'Service is busy due to rate limits. Please try again in a moment.',
            };
          }

          if (openAIError.error?.type === 'authentication_error') {
            return {
              success: false,
              error: 'Server configuration error. Please contact support.',
            };
          }

          if (openAIError.error?.type === 'invalid_request_error') {
            return {
              success: false,
              error: 'Invalid request. Please check your input and try again.',
            };
          }
        }

        // Handle network errors
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
            return {
              success: false,
              error: 'Network error. Please check your connection and try again.',
            };
          }
        }

        // Generic error
        return {
          success: false,
          error: 'Failed to generate response. Please try again.',
        };
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  // Should never reach here, but just in case
  return {
    success: false,
    error: 'Failed to generate response after retries.',
  };
}

/**
 * POST /api/chat
 * Accepts message and conversation history, returns AI tutoring response
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error. Please contact support.',
          response: '',
        } as ChatResponse,
        { status: 500 }
      );
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Must be valid JSON.',
          response: '',
        } as ChatResponse,
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          response: '',
        } as ChatResponse,
        { status: 400 }
      );
    }

    // Build messages array (initial attempt with normal prompt)
    let messages = buildMessagesArray(
      body.message,
      body.conversationHistory,
      body.problemContext,
      false, // useStricterPrompt
      undefined, // violationType
      body.recentlyMasteredSkills
    );

    // Call OpenAI API with retry logic
    let result = await callOpenAIWithRetry(messages);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          response: '',
        } as ChatResponse,
        { status: 500 }
      );
    }

    // Validate the AI response to check for direct answers
    const responseValidation = validateResponse(result.response || '');

    if (!responseValidation.isValid) {
      // Direct answer detected! Log warning
      const violationDesc = getViolationDescription(responseValidation.violationType || 'unknown');
      console.warn(`[Response Validation] Direct answer detected: ${violationDesc} (Confidence: ${responseValidation.confidence})`);
      console.warn(`[Response Validation] Problematic response: "${result.response?.substring(0, 100)}..."`);

      // Attempt regeneration with stricter prompt (maximum 1 retry)
      console.log('[Response Validation] Regenerating with stricter prompt...');

      messages = buildMessagesArray(
        body.message,
        body.conversationHistory,
        body.problemContext,
        true, // useStricterPrompt
        responseValidation.violationType,
        body.recentlyMasteredSkills
      );

      // Regenerate
      const regenerationResult = await callOpenAIWithRetry(messages);

      if (!regenerationResult.success) {
        // Regeneration failed due to API error - use fallback
        console.error('[Response Validation] Regeneration failed due to API error, using fallback');
        return NextResponse.json(
          {
            success: true,
            response: generateFallbackResponse(body.problemContext),
          } as ChatResponse,
          { status: 200 }
        );
      }

      // Validate the regenerated response
      const revalidation = validateResponse(regenerationResult.response || '');

      if (!revalidation.isValid) {
        // Still giving direct answers after stricter prompt - use fallback
        const reviolationDesc = getViolationDescription(revalidation.violationType || 'unknown');
        console.error(`[Response Validation] Regeneration still violated: ${reviolationDesc}`);
        console.error(`[Response Validation] Failed response: "${regenerationResult.response?.substring(0, 100)}..."`);
        console.error('[Response Validation] Using fallback response');

        return NextResponse.json(
          {
            success: true,
            response: generateFallbackResponse(body.problemContext),
          } as ChatResponse,
          { status: 200 }
        );
      }

      // Regeneration successful and valid
      console.log('[Response Validation] Regeneration successful - response is now valid');
      return NextResponse.json(
        {
          success: true,
          response: regenerationResult.response || '',
        } as ChatResponse,
        { status: 200 }
      );
    }

    // Original response was valid - return it
    return NextResponse.json(
      {
        success: true,
        response: result.response || '',
      } as ChatResponse,
      { status: 200 }
    );
  } catch (error: unknown) {
    // Catch-all error handling
    console.error('Unexpected error in chat API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        response: '',
      } as ChatResponse,
      { status: 500 }
    );
  }
}
