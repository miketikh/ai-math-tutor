import { NextRequest, NextResponse } from 'next/server';
import { updateProficiency } from '@/lib/proficiencyTracker';

interface RecordPracticeRequest {
  userId?: string;
  skillId?: string;
  correct?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecordPracticeRequest;
    const { userId, skillId, correct } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    if (!skillId || typeof skillId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'skillId is required' },
        { status: 400 }
      );
    }
    const isCorrect = Boolean(correct);

    await updateProficiency(userId, skillId, isCorrect);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record practice attempt';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


