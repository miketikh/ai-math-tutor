import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { PracticeProblem } from '@/types/session';

/**
 * Practice Session API Route
 * Generates practice problems for a skill and stores them in the session
 */

interface PracticeRequest {
  sessionId: string;
  skillId: string;
}

interface PracticeResponse {
  success: boolean;
  problems?: PracticeProblem[];
  sessionId?: string;
  error?: string;
}

/**
 * POST /api/sessions/practice
 * Generate practice problems and store in session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, skillId } = body as PracticeRequest;

    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sessionId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!skillId || typeof skillId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'skillId is required and must be a string' },
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Session does not have a valid userId' },
        { status: 400 }
      );
    }

    console.log(`[Practice] Generating problems for skill ${skillId} in session ${sessionId}`);

    // Call the problem generation API
    const generateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/problems/generate`;

    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillId,
        userId,
        count: 5, // Generate 5 practice problems
      }),
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      console.error('[Practice] Problem generation failed:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to generate problems' },
        { status: generateResponse.status }
      );
    }

    const generateData = await generateResponse.json();

    if (!generateData.success || !generateData.problems) {
      return NextResponse.json(
        { success: false, error: 'Problem generation did not return valid problems' },
        { status: 500 }
      );
    }

    const problems: PracticeProblem[] = generateData.problems.map((p: any) => ({
      text: p.text,
      hint: p.hint,
      solution: p.solution,
      latex: p.latex,
    }));

    console.log(`[Practice] Generated ${problems.length} problems for skill ${skillId}`);

    // Update session with problems in the current skill branch
    // Note: The SessionContext will handle updating the skillStack
    // We're just storing the problems for retrieval

    const response: PracticeResponse = {
      success: true,
      problems,
      sessionId,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Practice] Unexpected error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while generating practice problems';

    return NextResponse.json(
      { success: false, error: errorMessage } as PracticeResponse,
      { status: 500 }
    );
  }
}
