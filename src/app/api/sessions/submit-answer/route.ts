import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { adminDb } from '@/lib/firebaseAdmin';
import { updateProficiency } from '@/lib/proficiencyTracker';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Submit Answer API Route
 * Validates student answers using GPT-4 for algebraic equivalence
 * Updates session progress and user proficiency
 */

interface SubmitAnswerRequest {
  sessionId: string;
  problemIndex: number;
  answer: string;
}

interface SubmitAnswerResponse {
  success: boolean;
  correct?: boolean;
  feedback?: string;
  mastered?: boolean;
  error?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TIMEOUT_MS = 10000; // 10 seconds for answer validation
const MASTERY_THRESHOLD = 0.6; // 60% correct = mastered (3/5 or higher)

/**
 * Validate answer using GPT-4 for algebraic equivalence
 */
async function validateAnswer(
  userAnswer: string,
  correctSolution: string,
  problemText: string
): Promise<{ correct: boolean; feedback: string }> {
  const prompt = `You are a math tutor checking if a student's answer is correct.

Problem: ${problemText}

Expected Solution: ${correctSolution}

Student's Answer: ${userAnswer}

Determine if the student's answer is mathematically equivalent to the expected solution. Consider:
- Algebraic equivalence (e.g., "2/4" = "1/2", "8.0" = "8")
- Different but equivalent forms (e.g., "x + 5" = "5 + x")
- Decimal vs fraction equivalence
- Simplified vs unsimplified forms

Return a JSON object with:
{
  "correct": true or false,
  "feedback": "A brief explanation of why the answer is correct or incorrect (1-2 sentences)"
}`;

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a math tutor that validates student answers and provides constructive feedback. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Low temperature for consistent validation
        response_format: { type: 'json_object' },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Answer validation timeout')), TIMEOUT_MS)
      ),
    ]);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(responseText);

    return {
      correct: Boolean(result.correct),
      feedback: String(result.feedback || 'Answer validated'),
    };
  } catch (error) {
    console.error('[Submit Answer] Error validating answer with GPT-4:', error);

    // Fallback to simple string comparison if AI fails
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedSolution = correctSolution.trim().toLowerCase().replace(/\s+/g, '');
    const correct = normalizedUser === normalizedSolution;

    return {
      correct,
      feedback: correct
        ? 'Your answer is correct!'
        : 'Your answer doesn\'t match the expected solution. Please review the problem and try again.',
    };
  }
}

/**
 * POST /api/sessions/submit-answer
 * Validate answer, update session and proficiency
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, problemIndex, answer } = body as SubmitAnswerRequest;

    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sessionId is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof problemIndex !== 'number' || problemIndex < 0) {
      return NextResponse.json(
        { success: false, error: 'problemIndex is required and must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof answer !== 'string') {
      return NextResponse.json(
        { success: false, error: 'answer is required and must be a string' },
        { status: 400 }
      );
    }

    // Get session from Firestore
    const sessionRef = adminDb.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = sessionDoc.data();
    const userId = sessionData?.userId;
    const skillStack = sessionData?.skillStack || [];

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Session does not have a valid userId' },
        { status: 400 }
      );
    }

    if (skillStack.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active skill branch in session' },
        { status: 400 }
      );
    }

    // Get current skill branch (last item in stack)
    const currentBranch = skillStack[skillStack.length - 1];
    const problems = currentBranch.problems || [];

    if (problemIndex >= problems.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid problem index' },
        { status: 400 }
      );
    }

    const currentProblem = problems[problemIndex];
    const skillId = currentBranch.skillId;

    console.log(`[Submit Answer] Validating answer for session ${sessionId}, problem ${problemIndex}`);

    // Validate answer using GPT-4
    const validation = await validateAnswer(
      answer,
      currentProblem.solution,
      currentProblem.text
    );

    console.log(`[Submit Answer] Answer is ${validation.correct ? 'correct' : 'incorrect'}`);

    // Create attempt data with current timestamp
    const now = new Date();
    const attemptData = {
      problemIndex,
      answer,
      correct: validation.correct,
      timestamp: now,
    };

    currentBranch.attempts = [...(currentBranch.attempts || []), attemptData];

    if (validation.correct) {
      currentBranch.successCount = (currentBranch.successCount || 0) + 1;
    }

    // Update skillStack in session
    // Note: This is not atomic - potential race condition if multiple answers submitted simultaneously
    skillStack[skillStack.length - 1] = currentBranch;

    await sessionRef.update({
      skillStack,
      totalProblemsAttempted: FieldValue.increment(1),
      totalCorrectAnswers: FieldValue.increment(validation.correct ? 1 : 0),
      lastMessageAt: now,
    });

    // Update user proficiency in Firestore
    try {
      await updateProficiency(userId, skillId, validation.correct);
      console.log(`[Submit Answer] Updated proficiency for user ${userId}, skill ${skillId}`);
    } catch (proficiencyError) {
      console.error('[Submit Answer] Failed to update proficiency:', proficiencyError);
      // Continue even if proficiency update fails
    }

    // Check if skill is mastered
    const totalAttempts = currentBranch.attempts.length;
    const successCount = currentBranch.successCount || 0;
    const successRate = totalAttempts > 0 ? successCount / totalAttempts : 0;
    const mastered = successRate >= MASTERY_THRESHOLD && totalAttempts >= problems.length;

    console.log(
      `[Submit Answer] Progress: ${successCount}/${totalAttempts} (${(successRate * 100).toFixed(1)}%), ` +
      `Mastered: ${mastered}`
    );

    const response: SubmitAnswerResponse = {
      success: true,
      correct: validation.correct,
      feedback: validation.feedback,
      mastered,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Submit Answer] Unexpected error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while submitting answer';

    return NextResponse.json(
      { success: false, error: errorMessage } as SubmitAnswerResponse,
      { status: 500 }
    );
  }
}
