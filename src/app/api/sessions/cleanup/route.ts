/**
 * Session Cleanup API Route
 *
 * Marks abandoned sessions as 'abandoned' if they haven't been updated in 24 hours.
 * This endpoint can be called manually or via a cron job (e.g., Cloud Functions).
 *
 * For Phase 2, this is a manual cleanup endpoint.
 * For Phase 3, consider scheduling this via:
 * - Vercel Cron Jobs
 * - Cloud Functions scheduled triggers
 * - GitHub Actions scheduled workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Session abandonment threshold: 24 hours
const ABANDONMENT_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/sessions/cleanup
 *
 * Finds and marks old sessions as abandoned
 *
 * Request body (optional):
 * {
 *   dryRun?: boolean  // If true, returns sessions that would be cleaned without modifying
 *   thresholdHours?: number  // Override default 24 hour threshold
 * }
 *
 * Response:
 * {
 *   success: true,
 *   sessionsFound: number,
 *   sessionsUpdated: number,
 *   sessions?: Array<{ sessionId, userId, lastMessageAt }>  // Only in dry run mode
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const thresholdHours = body.thresholdHours || 24;
    const thresholdMs = thresholdHours * 60 * 60 * 1000;

    console.log(`[Session Cleanup] Starting cleanup (dryRun: ${dryRun}, threshold: ${thresholdHours}h)`);

    // Calculate cutoff timestamp
    const cutoffTime = new Date(Date.now() - thresholdMs);
    console.log(`[Session Cleanup] Cutoff time: ${cutoffTime.toISOString()}`);

    // Query for active/paused sessions older than threshold
    const sessionsRef = adminDb.collection('sessions');
    const query = sessionsRef
      .where('status', 'in', ['active', 'paused'])
      .where('lastMessageAt', '<', cutoffTime);

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('[Session Cleanup] No sessions to clean up');
      return NextResponse.json({
        success: true,
        message: 'No sessions to clean up',
        sessionsFound: 0,
        sessionsUpdated: 0,
      });
    }

    console.log(`[Session Cleanup] Found ${snapshot.size} sessions to clean up`);

    // If dry run, return sessions without modifying
    if (dryRun) {
      const sessions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          sessionId: doc.id,
          userId: data.userId,
          status: data.status,
          lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || 'unknown',
          mainProblem: data.mainProblem?.text || 'unknown',
        };
      });

      return NextResponse.json({
        success: true,
        message: 'Dry run - no sessions modified',
        sessionsFound: snapshot.size,
        sessionsUpdated: 0,
        sessions,
      });
    }

    // Update sessions to abandoned status
    const batch = adminDb.batch();
    let updateCount = 0;

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'abandoned',
        lastMessageAt: FieldValue.serverTimestamp(),
      });
      updateCount++;
    });

    // Commit batch update
    await batch.commit();

    console.log(`[Session Cleanup] Updated ${updateCount} sessions to abandoned`);

    return NextResponse.json({
      success: true,
      message: `Marked ${updateCount} sessions as abandoned`,
      sessionsFound: snapshot.size,
      sessionsUpdated: updateCount,
    });

  } catch (error) {
    console.error('[Session Cleanup] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error during cleanup';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean up sessions',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions/cleanup
 *
 * Returns information about sessions that would be cleaned up (dry run)
 */
export async function GET(request: NextRequest) {
  try {
    // Get threshold from query params (default 24 hours)
    const url = new URL(request.url);
    const thresholdHours = parseInt(url.searchParams.get('thresholdHours') || '24', 10);
    const thresholdMs = thresholdHours * 60 * 60 * 1000;

    console.log(`[Session Cleanup] GET request (threshold: ${thresholdHours}h)`);

    // Calculate cutoff timestamp
    const cutoffTime = new Date(Date.now() - thresholdMs);

    // Query for active/paused sessions older than threshold
    const sessionsRef = adminDb.collection('sessions');
    const query = sessionsRef
      .where('status', 'in', ['active', 'paused'])
      .where('lastMessageAt', '<', cutoffTime);

    const snapshot = await query.get();

    const sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: doc.id,
        userId: data.userId,
        status: data.status,
        lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || 'unknown',
        mainProblem: data.mainProblem?.text || 'unknown',
        hoursSinceLastMessage: Math.floor(
          (Date.now() - (data.lastMessageAt?.toDate?.()?.getTime() || Date.now())) / (60 * 60 * 1000)
        ),
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Dry run - no sessions modified',
      sessionsFound: snapshot.size,
      thresholdHours,
      cutoffTime: cutoffTime.toISOString(),
      sessions,
    });

  } catch (error) {
    console.error('[Session Cleanup] GET Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error during cleanup';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions for cleanup',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
