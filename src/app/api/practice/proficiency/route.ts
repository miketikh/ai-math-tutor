import { NextRequest, NextResponse } from 'next/server';
import { getProficiency } from '@/lib/proficiencyTracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const skillId = searchParams.get('skillId') || '';

    if (!userId || !skillId) {
      return NextResponse.json(
        { success: false, error: 'userId and skillId are required' },
        { status: 400 }
      );
    }

    const prof = await getProficiency(userId, skillId);
    return NextResponse.json({ success: true, proficiency: prof || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proficiency';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


