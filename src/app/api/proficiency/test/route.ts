/**
 * Test API Route for Proficiency Tracker
 * Used to verify proficiency tracking functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateProficiency,
  calculateProficiencyLevel,
  getProficiency,
  getProficiencyByLevel,
  getAllProficiencies,
} from '@/lib/proficiencyTracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, skillId, correct, problemsSolved, successRate, level } = body;

    switch (action) {
      case 'updateProficiency':
        if (!userId || !skillId || typeof correct !== 'boolean') {
          return NextResponse.json(
            { error: 'Missing required fields: userId, skillId, correct' },
            { status: 400 }
          );
        }

        const updatedProficiency = await updateProficiency(userId, skillId, correct);
        return NextResponse.json({
          success: true,
          proficiency: updatedProficiency,
        });

      case 'calculateLevel':
        if (typeof problemsSolved !== 'number' || typeof successRate !== 'number') {
          return NextResponse.json(
            { error: 'Missing required fields: problemsSolved, successRate' },
            { status: 400 }
          );
        }

        const calculatedLevel = calculateProficiencyLevel(problemsSolved, successRate);
        return NextResponse.json({
          success: true,
          level: calculatedLevel,
          input: { problemsSolved, successRate },
        });

      case 'getProficiency':
        if (!userId || !skillId) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, skillId' },
            { status: 400 }
          );
        }

        const proficiency = await getProficiency(userId, skillId);
        return NextResponse.json({
          success: true,
          proficiency,
        });

      case 'getProficiencyByLevel':
        if (!userId || !level) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, level' },
            { status: 400 }
          );
        }

        const skillsByLevel = await getProficiencyByLevel(userId, level);
        return NextResponse.json({
          success: true,
          skills: skillsByLevel,
        });

      case 'getAllProficiencies':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing required field: userId' },
            { status: 400 }
          );
        }

        const allProficiencies = await getAllProficiencies(userId);
        return NextResponse.json({
          success: true,
          proficiencies: allProficiencies,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: updateProficiency, calculateLevel, getProficiency, getProficiencyByLevel, getAllProficiencies' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in proficiency test route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
