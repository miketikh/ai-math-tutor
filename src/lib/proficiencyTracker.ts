/**
 * Proficiency Tracking System
 * Updates user skill proficiency after each problem attempt
 * Uses Firestore transactions for atomic updates to prevent race conditions
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Proficiency levels and their thresholds
 */
export type ProficiencyLevel = 'unknown' | 'learning' | 'proficient' | 'mastered';

export interface SkillProficiencyData {
  level: ProficiencyLevel;
  problemsSolved: number;
  successCount: number;
  lastPracticed?: Date;
}

/**
 * Calculate proficiency level based on problems solved and success rate
 *
 * Thresholds:
 * - Unknown: 0 problems solved
 * - Learning: 1-4 problems solved (any success rate)
 * - Proficient: 5+ problems, 70%+ success rate
 * - Mastered: 10+ problems, 90%+ success rate
 *
 * @param problemsSolved Total number of problems attempted
 * @param successRate Success rate (0 to 1)
 * @returns Proficiency level
 */
export function calculateProficiencyLevel(
  problemsSolved: number,
  successRate: number
): ProficiencyLevel {
  if (problemsSolved === 0) {
    return 'unknown';
  }

  if (problemsSolved < 5) {
    return 'learning';
  }

  if (problemsSolved >= 10 && successRate >= 0.9) {
    return 'mastered';
  }

  if (problemsSolved >= 5 && successRate >= 0.7) {
    return 'proficient';
  }

  return 'learning';
}

/**
 * Update user skill proficiency after a problem attempt
 * Uses Firestore transaction for atomic updates
 *
 * @param userId User ID
 * @param skillId Skill ID from skill graph
 * @param correct Whether the problem was solved correctly
 * @returns Updated proficiency data
 */
export async function updateProficiency(
  userId: string,
  skillId: string,
  correct: boolean
): Promise<SkillProficiencyData> {
  const userRef = adminDb.collection('users').doc(userId);

  try {
    // Use transaction to prevent race conditions
    const result = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data();
      const skillProficiency = userData?.skillProficiency || {};

      // Get current proficiency or initialize
      const currentProficiency: SkillProficiencyData = skillProficiency[skillId] || {
        level: 'unknown' as ProficiencyLevel,
        problemsSolved: 0,
        successCount: 0,
      };

      // Update counts
      const newProblemsSolved = currentProficiency.problemsSolved + 1;
      const newSuccessCount = currentProficiency.successCount + (correct ? 1 : 0);
      const successRate = newProblemsSolved > 0 ? newSuccessCount / newProblemsSolved : 0;

      // Calculate new level
      const newLevel = calculateProficiencyLevel(newProblemsSolved, successRate);

      // Create updated proficiency data
      const updatedProficiency: SkillProficiencyData = {
        level: newLevel,
        problemsSolved: newProblemsSolved,
        successCount: newSuccessCount,
        lastPracticed: new Date(),
      };

      // Update Firestore
      transaction.update(userRef, {
        [`skillProficiency.${skillId}`]: {
          level: updatedProficiency.level,
          problemsSolved: updatedProficiency.problemsSolved,
          successCount: updatedProficiency.successCount,
          lastPracticed: FieldValue.serverTimestamp(),
        },
        lastActive: FieldValue.serverTimestamp(),
      });

      return updatedProficiency;
    });

    console.log(`Updated proficiency for user ${userId}, skill ${skillId}:`, result);
    return result;
  } catch (error) {
    console.error('Error updating proficiency:', error);
    throw new Error(`Failed to update proficiency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get current proficiency for a specific skill
 *
 * @param userId User ID
 * @param skillId Skill ID
 * @returns Proficiency data or null if not found
 */
export async function getProficiency(
  userId: string,
  skillId: string
): Promise<SkillProficiencyData | null> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    const userData = userDoc.data();
    const skillProficiency = userData?.skillProficiency || {};
    const proficiency = skillProficiency[skillId];

    if (!proficiency) {
      return null;
    }

    // Convert Firestore timestamp to Date if needed
    return {
      level: proficiency.level,
      problemsSolved: proficiency.problemsSolved,
      successCount: proficiency.successCount,
      lastPracticed: proficiency.lastPracticed?.toDate?.() || proficiency.lastPracticed,
    };
  } catch (error) {
    console.error('Error getting proficiency:', error);
    throw new Error(`Failed to get proficiency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all skills at a specific proficiency level
 *
 * @param userId User ID
 * @param level Proficiency level to filter by
 * @returns Array of skill IDs and their proficiency data
 */
export async function getProficiencyByLevel(
  userId: string,
  level: ProficiencyLevel
): Promise<Array<{ skillId: string; proficiency: SkillProficiencyData }>> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    const userData = userDoc.data();
    const skillProficiency = userData?.skillProficiency || {};

    const results: Array<{ skillId: string; proficiency: SkillProficiencyData }> = [];

    for (const [skillId, proficiencyData] of Object.entries(skillProficiency)) {
      const data = proficiencyData as any;
      if (data.level === level) {
        results.push({
          skillId,
          proficiency: {
            level: data.level,
            problemsSolved: data.problemsSolved,
            successCount: data.successCount,
            lastPracticed: data.lastPracticed?.toDate?.() || data.lastPracticed,
          },
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error getting proficiency by level:', error);
    throw new Error(`Failed to get proficiency by level: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all proficiencies for a user
 *
 * @param userId User ID
 * @returns Record of all skill proficiencies
 */
export async function getAllProficiencies(
  userId: string
): Promise<Record<string, SkillProficiencyData>> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    const userData = userDoc.data();
    const skillProficiency = userData?.skillProficiency || {};

    const results: Record<string, SkillProficiencyData> = {};

    for (const [skillId, proficiencyData] of Object.entries(skillProficiency)) {
      const data = proficiencyData as any;
      results[skillId] = {
        level: data.level,
        problemsSolved: data.problemsSolved,
        successCount: data.successCount,
        lastPracticed: data.lastPracticed?.toDate?.() || data.lastPracticed,
      };
    }

    return results;
  } catch (error) {
    console.error('Error getting all proficiencies:', error);
    throw new Error(`Failed to get all proficiencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reset proficiency for a skill (useful for testing or allowing users to retry)
 *
 * @param userId User ID
 * @param skillId Skill ID
 */
export async function resetProficiency(
  userId: string,
  skillId: string
): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(userId);

    await userRef.update({
      [`skillProficiency.${skillId}`]: {
        level: 'unknown',
        problemsSolved: 0,
        successCount: 0,
        lastPracticed: FieldValue.serverTimestamp(),
      },
    });

    console.log(`Reset proficiency for user ${userId}, skill ${skillId}`);
  } catch (error) {
    console.error('Error resetting proficiency:', error);
    throw new Error(`Failed to reset proficiency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
