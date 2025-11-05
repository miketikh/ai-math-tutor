import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { skillGraphManager } from '@/lib/skillGraph';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Problem Generation API Route
 * Generates practice problems for a specific skill using GPT-4,
 * personalized to the user's grade level and interests.
 */

// Request body interface
interface GenerateProblemsRequest {
  skillId: string;
  userId: string;
  count: number;
}

// Generated problem structure
interface GeneratedProblem {
  text: string;
  hint: string;
  solution: string;
}

// Response interface
interface GenerateProblemsResponse {
  success: boolean;
  problems?: GeneratedProblem[];
  error?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const TIMEOUT_MS = 30000; // 30 seconds
const MIN_PROBLEMS = 3;
const MAX_PROBLEMS = 10;
const DEFAULT_GRADE_LEVEL = '8th grade';
const DEFAULT_INTERESTS = ['general math'];

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<GenerateProblemsRequest>;

  if (!req.skillId || typeof req.skillId !== 'string' || req.skillId.trim().length === 0) {
    return { valid: false, error: 'skillId is required and must be a non-empty string.' };
  }

  if (!req.userId || typeof req.userId !== 'string' || req.userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string.' };
  }

  if (typeof req.count !== 'number' || !Number.isInteger(req.count)) {
    return { valid: false, error: 'count is required and must be an integer.' };
  }

  if (req.count < MIN_PROBLEMS) {
    return { valid: false, error: `count must be at least ${MIN_PROBLEMS}.` };
  }

  if (req.count > MAX_PROBLEMS) {
    return { valid: false, error: `count must be at most ${MAX_PROBLEMS}.` };
  }

  return { valid: true };
}

/**
 * Fetches user profile data from Firestore
 */
async function getUserProfile(userId: string): Promise<{
  gradeLevel: string;
  interests: string[];
}> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.warn(`[Generate Problems] User ${userId} not found, using defaults`);
      return {
        gradeLevel: DEFAULT_GRADE_LEVEL,
        interests: DEFAULT_INTERESTS,
      };
    }

    const userData = userDoc.data();
    return {
      gradeLevel: userData?.gradeLevel || DEFAULT_GRADE_LEVEL,
      interests: userData?.interests && userData.interests.length > 0
        ? userData.interests
        : DEFAULT_INTERESTS,
    };
  } catch (error) {
    console.error(`[Generate Problems] Error fetching user profile:`, error);
    return {
      gradeLevel: DEFAULT_GRADE_LEVEL,
      interests: DEFAULT_INTERESTS,
    };
  }
}

/**
 * Generates practice problems using OpenAI GPT-4
 */
async function generateProblemsWithAI(
  skillName: string,
  skillDescription: string,
  count: number,
  gradeLevel: string,
  interests: string[]
): Promise<GeneratedProblem[]> {
  const interestsText = interests.join(', ');

  const prompt = `You are an expert math tutor creating practice problems for a student.

Skill: ${skillName}
Description: ${skillDescription}
Target grade level: ${gradeLevel}
Student interests: ${interestsText}

Generate ${count} practice problems for this skill. Each problem should:
1. Be appropriate for the specified grade level
2. Progressively increase in difficulty (first problem easiest, last problem hardest)
3. When possible, incorporate the student's interests to make the problem more engaging
4. Include a clear problem statement, a helpful hint, and a complete solution with step-by-step explanation

Return ONLY a JSON array with exactly ${count} problems in this format:
[
  {
    "text": "The problem statement",
    "hint": "A helpful hint that guides without giving away the answer",
    "solution": "The complete answer with step-by-step explanation"
  }
]

Math formatting: Use $ for inline math (e.g., $x + 5 = 12$, $\\frac{1}{2}$) and $$ for display equations.`;

  console.log(`[Generate Problems] Calling GPT-4 to generate ${count} problems for skill: ${skillName}`);

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert math tutor who generates practice problems in JSON format. Always return valid JSON arrays only. Format all math with $ delimiters.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Some creativity for variety, but not too random
        // Note: Not using response_format to allow array responses (we handle parsing manually)
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI request timeout')), TIMEOUT_MS)
      ),
    ]);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Generate Problems] Failed to parse OpenAI response as JSON:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Handle different response formats (some models return nested structure)
    let problems: GeneratedProblem[];
    if (Array.isArray(parsed)) {
      problems = parsed;
    } else if (parsed.problems && Array.isArray(parsed.problems)) {
      problems = parsed.problems;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      problems = parsed.data;
    } else {
      console.error('[Generate Problems] Unexpected response structure:', parsed);
      throw new Error('Unexpected response structure from AI');
    }

    // Validate each problem has required fields
    const validProblems = problems.filter((p) => {
      return (
        p &&
        typeof p === 'object' &&
        typeof p.text === 'string' &&
        p.text.trim().length > 0 &&
        typeof p.hint === 'string' &&
        p.hint.trim().length > 0 &&
        typeof p.solution === 'string' &&
        p.solution.trim().length > 0
      );
    });

    if (validProblems.length === 0) {
      throw new Error('No valid problems in AI response');
    }

    // Ensure we have the requested count (or as close as possible)
    if (validProblems.length < count) {
      console.warn(
        `[Generate Problems] Generated ${validProblems.length} valid problems, requested ${count}`
      );
    }

    console.log(`[Generate Problems] Successfully generated ${validProblems.length} problems`);

    // Return only the requested count
    return validProblems.slice(0, count);

  } catch (error) {
    console.error('[Generate Problems] Error calling OpenAI:', error);
    throw error;
  }
}

/**
 * POST /api/problems/generate
 * Generates practice problems for a specific skill
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { skillId, userId, count } = body as GenerateProblemsRequest;

    // Validate skill exists in graph
    const skillExists = await skillGraphManager.validateSkillExists(skillId);
    if (!skillExists) {
      return NextResponse.json(
        { success: false, error: `Skill '${skillId}' not found in skill graph.` },
        { status: 404 }
      );
    }

    // Get skill details
    const skill = await skillGraphManager.getSkill(skillId);

    // Get user profile for personalization
    const userProfile = await getUserProfile(userId);

    console.log(`[Generate Problems] Generating ${count} problems for skill '${skillId}' (user: ${userId})`);
    console.log(`[Generate Problems] Grade level: ${userProfile.gradeLevel}, Interests: ${userProfile.interests.join(', ')}`);

    // Generate problems using AI
    const problems = await generateProblemsWithAI(
      skill.name,
      skill.description,
      count,
      userProfile.gradeLevel,
      userProfile.interests
    );

    const response: GenerateProblemsResponse = {
      success: true,
      problems,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Generate Problems] Unexpected error:', error);

    // Handle specific error types
    let errorMessage = 'An unexpected error occurred while generating problems.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Problem generation timed out. Please try again.';
        statusCode = 504;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
        statusCode = 429;
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Failed to parse AI response. Please try again.';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as GenerateProblemsResponse,
      { status: statusCode }
    );
  }
}
