import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SOCRATIC_SYSTEM_PROMPT } from '@/lib/prompts/socraticPrompt';
import { analyzeStuckLevel, describeStuckLevel } from '@/lib/stuckDetection';
import { getHintLevelPrompt } from '@/lib/prompts/hintLevels';
import { validateResponse, getViolationDescription, generateFallbackResponse } from '@/lib/responseValidation';
import { getStricterPromptWithContext } from '@/lib/prompts/stricterPrompt';
import { getLanguageGuidance } from '@/lib/prompts/languageAdaptation';

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
  // New: Skill context for the tutor to reason about prerequisites
  mainSkillId?: string;
  relatedSkills?: Array<{ id: string; name: string }>; // Up to 10 items recommended
  recentlyMasteredSkills?: string[]; // Skills just mastered (for return context)
  studentProfile?: {
    gradeLevel?: string;
    interests?: string[];
    focusTopics?: string[];
  };
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
  // Practice recommendation fields
  needsPractice?: boolean;
  practiceSkillId?: string | null;
  practiceSkillName?: string | null;
  practiceReason?: string | null;
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

  // mainSkillId and relatedSkills are optional; if present validate shapes
  if (req.mainSkillId !== undefined && typeof req.mainSkillId !== 'string') {
    return { valid: false, error: 'mainSkillId must be a string if provided.' };
  }

  if (req.relatedSkills !== undefined) {
    if (!Array.isArray(req.relatedSkills)) {
      return { valid: false, error: 'relatedSkills must be an array if provided.' };
    }
    for (const s of req.relatedSkills) {
      if (!s || typeof s !== 'object' || typeof (s as any).id !== 'string' || typeof (s as any).name !== 'string') {
        return { valid: false, error: 'Each related skill must have string id and name.' };
      }
    }
  }

  if (req.recentlyMasteredSkills !== undefined && !Array.isArray(req.recentlyMasteredSkills)) {
    return { valid: false, error: 'recentlyMasteredSkills must be an array if provided.' };
  }

  if (req.studentProfile !== undefined && typeof req.studentProfile !== 'object') {
    return { valid: false, error: 'studentProfile must be an object if provided.' };
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
  recentlyMasteredSkills?: string[],
  studentProfile?: {
    gradeLevel?: string;
    interests?: string[];
    focusTopics?: string[];
  },
  mainSkillId?: string,
  relatedSkills?: Array<{ id: string; name: string }>
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Analyze stuck level for hint adjustment
  // This stuck detection is used to adjust hint verbosity in tutoring responses
  // Practice recommendations are now included directly in the AI's structured JSON response
  const stuckLevel = analyzeStuckLevel(conversationHistory);

  // Log stuck level for debugging (server-side only, not sent to client)
  console.log(`[Hint Level Detection] ${describeStuckLevel(stuckLevel)} (Level: ${stuckLevel})`);

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

    // Add language adaptation guidance for middle school students
    const languageGuidance = getLanguageGuidance();
    if (languageGuidance) {
      systemMessage += languageGuidance;
    }

    // Add student personalization context
    if (studentProfile) {
      const interests = studentProfile.interests && studentProfile.interests.length > 0
        ? studentProfile.interests.join(', ')
        : null;
      const gradeLevel = studentProfile.gradeLevel || null;

      if (interests || gradeLevel) {
        systemMessage += `\n\nSTUDENT CONTEXT:`;
        if (gradeLevel) {
          systemMessage += `\n- Grade Level: ${gradeLevel}`;
        }
        if (interests) {
          systemMessage += `\n- Interests: ${interests}`;
          systemMessage += `\n\nWhen creating examples or word problems, incorporate their interests naturally when relevant. Don't force it - only use when it genuinely fits the problem.`;
        }
      }
    }

    // Add SKILL CONTEXT block if provided
    if (mainSkillId || (relatedSkills && relatedSkills.length > 0)) {
      systemMessage += `\n\nSKILL CONTEXT:`;
      if (mainSkillId) {
        systemMessage += `\n- Main Skill ID: ${mainSkillId}`;
      }
      if (relatedSkills && relatedSkills.length > 0) {
        const limited = relatedSkills.slice(0, 10);
        const list = limited.map(s => `  • [${s.id}] ${s.name}`).join('\n');
        systemMessage += `\n- Direct Prerequisite Skills (layer1 only - these are the ONLY skills available for practice):\n${list}`;
      }
      systemMessage += `\n\nPRACTICE RECOMMENDATION INSTRUCTIONS:
- The skills listed above are the DIRECT prerequisite skills (layer1) needed for the main problem
- These are the ONLY skills you can recommend for practice - there are no other options
- If the student is struggling with one of these specific prerequisite concepts, recommend they practice that skill
- Only recommend practice after you've confirmed through conversation that they're missing this specific prerequisite knowledge
- To recommend practice: In your JSON response, set needsPractice=true, practiceSkillId to the exact skill ID from the list above, practiceSkillName to the skill name, and practiceReason to a brief explanation
- The practiceSkillId MUST be one of the IDs from the Direct Prerequisite Skills list above - do not invent new IDs
- If the student's struggle is not related to any of the listed prerequisite skills, set needsPractice=false
- If no practice is needed, set needsPractice=false and leave other practice fields null`;
    }

    // Add enhanced diagnostic flow guidance for stuck students
    if (stuckLevel >= 2) {
      systemMessage += `\n\nDIAGNOSTIC STRATEGY - Multi-Step Approach:
The student appears stuck. Follow this progression:

STEP 1 - SIMPLIFY FIRST (Try 1-2 exchanges):
- Break down the problem into smaller steps
- "Let's focus on just this part first..."
- "What if we tried a simpler version?"

STEP 2 - DIAGNOSTIC QUESTIONING (If still stuck after simplification):
- Pose a targeted diagnostic question to test prerequisite understanding
- Choose a simpler problem testing the suspected weak skill
- Frame naturally: "Before we continue, let me check something..."
- Example: If stuck on "2x + 5 = 13", ask "Can you solve x + 5 = 12?"
- Use student's interests when crafting examples when relevant

STEP 3 - ANALYZE RESPONSE & DECIDE:
- If they answer correctly:
  "Great! You understand [skill]. Let's apply that to our original problem..."
  Guide them back to main problem using that foundation

- If they struggle or show confusion on the diagnostic:
  "I notice [specific skill] needs some practice. Would you like to work on that with some focused problems?"
  This triggers the branching recommendation

CRITICAL: Only recommend branching AFTER confirming prerequisite gap through diagnostic interaction.
Don't send students to practice if they're just confused about the current concept.`;
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

  // Add JSON response format instructions
  systemMessage += `\n\nRESPONSE FORMAT:
You must respond with valid JSON in this exact format:
{
  "tutorResponse": "Your tutoring message to the student here",
  "needsPractice": false,
  "practiceSkillId": null,
  "practiceSkillName": null,
  "practiceReason": null
}

- tutorResponse: Your Socratic tutoring message (required, string)
- needsPractice: true if recommending practice, false otherwise (required, boolean)
- practiceSkillId: The exact skill ID from Related Skills list if recommending practice, null otherwise (required, string or null)
- practiceSkillName: The skill name if recommending practice, null otherwise (required, string or null)
- practiceReason: Brief explanation why practice is needed, null if not recommending practice (required, string or null)

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`;

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
 * Structured AI response from JSON mode
 */
interface AIStructuredResponse {
  tutorResponse: string;
  needsPractice: boolean;
  practiceSkillId: string | null;
  practiceSkillName: string | null;
  practiceReason: string | null;
}

/**
 * Calls OpenAI API with timeout and retry logic, using JSON mode
 */
async function callOpenAIWithRetry(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  retries = MAX_RETRIES
): Promise<{ success: boolean; data?: AIStructuredResponse; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS);
      });

      // Create the OpenAI API call promise with JSON mode
      const apiPromise = openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      // Race between timeout and API call
      const response = await Promise.race([apiPromise, timeoutPromise]);

      // Extract the response content
      const aiContent = response.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      let parsedData: AIStructuredResponse;
      try {
        parsedData = JSON.parse(aiContent);
      } catch (parseError) {
        console.error('Failed to parse AI JSON response:', aiContent);
        throw new Error('AI returned invalid JSON');
      }

      // Validate required fields
      if (typeof parsedData.tutorResponse !== 'string' || !parsedData.tutorResponse) {
        throw new Error('AI response missing tutorResponse field');
      }
      if (typeof parsedData.needsPractice !== 'boolean') {
        throw new Error('AI response missing needsPractice field');
      }

      return { success: true, data: parsedData };
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
      body.recentlyMasteredSkills,
      body.studentProfile,
      body.mainSkillId,
      body.relatedSkills
    );

    // Call OpenAI API with retry logic
    let result = await callOpenAIWithRetry(messages);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          response: '',
        } as ChatResponse,
        { status: 500 }
      );
    }

    // Validate the AI tutorResponse to check for direct answers
    const responseValidation = validateResponse(result.data.tutorResponse);

    if (!responseValidation.isValid) {
      // Direct answer detected! Log warning
      const violationDesc = getViolationDescription(responseValidation.violationType || 'unknown');
      console.warn(`[Response Validation] Direct answer detected: ${violationDesc} (Confidence: ${responseValidation.confidence})`);
      console.warn(`[Response Validation] Problematic response: "${result.data.tutorResponse.substring(0, 100)}..."`);

      // Attempt regeneration with stricter prompt (maximum 1 retry)
      console.log('[Response Validation] Regenerating with stricter prompt...');

      messages = buildMessagesArray(
        body.message,
        body.conversationHistory,
        body.problemContext,
        true, // useStricterPrompt
        responseValidation.violationType,
        body.recentlyMasteredSkills,
        body.studentProfile,
        body.mainSkillId,
        body.relatedSkills
      );

      // Regenerate
      const regenerationResult = await callOpenAIWithRetry(messages);

      if (!regenerationResult.success || !regenerationResult.data) {
        // Regeneration failed due to API error - use fallback
        console.error('[Response Validation] Regeneration failed due to API error, using fallback');
        return NextResponse.json(
          {
            success: true,
            response: generateFallbackResponse(body.problemContext),
            needsPractice: false,
            practiceSkillId: null,
            practiceSkillName: null,
            practiceReason: null,
          } as ChatResponse,
          { status: 200 }
        );
      }

      // Validate the regenerated response
      const revalidation = validateResponse(regenerationResult.data.tutorResponse);

      if (!revalidation.isValid) {
        // Still giving direct answers after stricter prompt - use fallback
        const reviolationDesc = getViolationDescription(revalidation.violationType || 'unknown');
        console.error(`[Response Validation] Regeneration still violated: ${reviolationDesc}`);
        console.error(`[Response Validation] Failed response: "${regenerationResult.data.tutorResponse.substring(0, 100)}..."`);
        console.error('[Response Validation] Using fallback response');

        return NextResponse.json(
          {
            success: true,
            response: generateFallbackResponse(body.problemContext),
            needsPractice: false,
            practiceSkillId: null,
            practiceSkillName: null,
            practiceReason: null,
          } as ChatResponse,
          { status: 200 }
        );
      }

      // Regeneration successful and valid - return with practice fields
      console.log('[Response Validation] Regeneration successful - response is now valid');
      return NextResponse.json(
        {
          success: true,
          response: regenerationResult.data.tutorResponse,
          needsPractice: regenerationResult.data.needsPractice,
          practiceSkillId: regenerationResult.data.practiceSkillId,
          practiceSkillName: regenerationResult.data.practiceSkillName,
          practiceReason: regenerationResult.data.practiceReason,
        } as ChatResponse,
        { status: 200 }
      );
    }

    // Original response was valid - return it with practice fields
    return NextResponse.json(
      {
        success: true,
        response: result.data.tutorResponse,
        needsPractice: result.data.needsPractice,
        practiceSkillId: result.data.practiceSkillId,
        practiceSkillName: result.data.practiceSkillName,
        practiceReason: result.data.practiceReason,
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
