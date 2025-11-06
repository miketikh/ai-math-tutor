import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { skillGraphManager } from '@/lib/skillGraph';
import { getProficiency } from '@/lib/proficiencyTracker';
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
  interests: string[],
  proficiency: string
): Promise<GeneratedProblem[]> {
  const interestsText = interests.join(', ');

  const prompt = `You are an expert math tutor creating a small, leveled practice set.

Skill: ${skillName}
Description: ${skillDescription}
Student grade: ${gradeLevel}
Student interests: ${interestsText}
Student proficiency in this skill: ${proficiency}

Goal
- Generate ${count} problems that gently increase in complexity and stay aligned to the student’s grade and proficiency.

Progression concept
- Start with the core idea, then a single-step procedure, then a simple applied context.
- If proficiency is unknown, begin at the most basic recognition/procedure level using small integers and denominators ≤ 12.
- Keep numbers simple; for unknown/learning avoid multi-step reasoning.

Each problem must include
- text: concise statement (≤2 sentences), using relatable context when natural for the given interests
- hint: one short scaffold with
  - Concept label (what idea to recall)
  - Leading question
  - One micro-step (no final result)
- solution: clear, step-by-step resolution
- difficulty: easy | medium | hard
- subskill: read_fractions | compare_fractions | multiply_fraction_by_whole | add_fractions | subtract_fractions

Keep it concise
- Each hint ≤ 1 sentence; each solution ≤ 3 short steps.

Math format
- Wrap inline math with \\(...\\) and display math with $$...$$
- In JSON strings, backslashes MUST be double-escaped: write \\(\\frac{1}{2}\\), \\(15\\div 3\\), \\(2\\times 5\\)
- NEVER use single $ for inline math (conflicts with currency)

Output
- Return ONLY a JSON object with a single field "problems": an array with exactly ${count} objects, each with fields: text, hint, solution, difficulty, subskill.

Example (structure)
{
  "problems": [
    {
      "text": "A player hits \\(\\frac{2}{3}\\) of 15 pitches. How many hits?",
      "hint": "Concept: fraction of a whole. Question: What is one-third of 15? Step: compute \\(15\\div 3\\) then multiply by 2.",
      "solution": "Compute \\(15\\div 3 = 5\\), then \\(2\\times 5 = 10\\).",
      "difficulty": "easy",
      "subskill": "multiply_fraction_by_whole"
    }
  ]
}`;

  console.log(`[Generate Problems] Calling GPT-4 to generate ${count} problems for skill: ${skillName}`);

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert math tutor who generates practice problems in JSON format. Always return a valid JSON object with a "problems" array. Format inline math with \\( \\) delimiters and display math with $$ delimiters.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Some creativity for variety, but not too random
        response_format: { type: 'json_object' },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI request timeout')), TIMEOUT_MS)
      ),
    ]);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response (JSON mode ensures valid JSON)
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Generate Problems] Failed to parse OpenAI response as JSON');
      throw new Error('Invalid JSON response from AI');
    }

    // Handle different response formats (some models return nested structure)
    let problems: GeneratedProblem[];
    if (parsed.problems && Array.isArray(parsed.problems)) {
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
      userProfile.interests,
      // proficiency string
      (await (async () => {
        try {
          const p = await getProficiency(userId, skillId);
          return p?.level || 'unknown';
        } catch {
          return 'unknown';
        }
      })())
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
