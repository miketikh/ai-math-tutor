import { NextRequest, NextResponse } from 'next/server';
import { skillGraphManager } from '@/lib/skillGraph';
import { getProficiency } from '@/lib/proficiencyTracker';
import type { ProficiencyLevel } from '@/lib/proficiencyTracker';

/**
 * Check Prerequisites API Route
 * Determines if a user is ready to tackle a skill based on their proficiency
 * in the prerequisite skills.
 */

// Request body interface
interface CheckPrerequisitesRequest {
  userId: string;
  skillId: string;
}

// Response interface
interface CheckPrerequisitesResponse {
  success: boolean;
  ready: boolean;
  weakSkills: Array<{ id: string; name: string; description: string }>;
  recommendations: string[];
  error?: string;
}

// Skill prerequisite details
interface PrerequisiteDetail {
  skillId: string;
  skillName: string;
  skillDescription: string;
  currentLevel: ProficiencyLevel;
  isWeak: boolean;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<CheckPrerequisitesRequest>;

  if (!req.userId || typeof req.userId !== 'string' || req.userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string.' };
  }

  if (!req.skillId || typeof req.skillId !== 'string' || req.skillId.trim().length === 0) {
    return { valid: false, error: 'skillId is required and must be a non-empty string.' };
  }

  return { valid: true };
}

/**
 * Determines if a proficiency level is considered "weak" (not ready)
 * Ready levels: 'proficient', 'mastered'
 * Weak levels: 'unknown', 'learning'
 */
function isWeakProficiency(level: ProficiencyLevel): boolean {
  return level === 'unknown' || level === 'learning';
}

/**
 * Generate recommendations based on weak skills
 */
function generateRecommendations(weakSkills: PrerequisiteDetail[]): string[] {
  const recommendations: string[] = [];

  if (weakSkills.length === 0) {
    recommendations.push('You are ready to tackle this skill! Your prerequisite knowledge is solid.');
    return recommendations;
  }

  // Group by proficiency level
  const unknownSkills = weakSkills.filter(s => s.currentLevel === 'unknown');
  const learningSkills = weakSkills.filter(s => s.currentLevel === 'learning');

  // Recommendations for unknown skills (highest priority)
  if (unknownSkills.length > 0) {
    const skillNames = unknownSkills.map(s => s.skillName).join(', ');
    recommendations.push(
      `Practice these foundational skills first: ${skillNames}. These are essential prerequisites you haven't explored yet.`
    );
  }

  // Recommendations for learning skills (need more practice)
  if (learningSkills.length > 0) {
    const skillNames = learningSkills.map(s => s.skillName).join(', ');
    recommendations.push(
      `Strengthen your understanding of: ${skillNames}. You've started learning these, but more practice will help.`
    );
  }

  // General recommendation
  if (weakSkills.length === 1) {
    recommendations.push(
      `Focus on mastering ${weakSkills[0].skillName} before moving forward. This will make the main skill much easier.`
    );
  } else if (weakSkills.length <= 3) {
    recommendations.push(
      `Practice these skills one at a time. Start with the most fundamental skill and work your way up.`
    );
  } else {
    recommendations.push(
      `You have several prerequisite skills to practice. Don't worry - we'll guide you through them step by step!`
    );
  }

  return recommendations;
}

/**
 * POST /api/skills/check-prerequisites
 * Checks if user has sufficient proficiency in prerequisite skills
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

    const { userId, skillId } = body as CheckPrerequisitesRequest;

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

    // Get layer 1 and layer 2 prerequisites
    const layer1Prerequisites = await skillGraphManager.getPrerequisites(skillId, 1);
    const layer2Prerequisites = await skillGraphManager.getPrerequisites(skillId, 2);

    // Combine all prerequisites with layer info
    const allPrerequisites = [
      ...layer1Prerequisites.skills.map(s => ({ ...s, layer: 1 })),
      ...layer2Prerequisites.skills.map(s => ({ ...s, layer: 2 })),
    ];

    console.log(`[Check Prerequisites] Checking ${allPrerequisites.length} prerequisites for skill '${skillId}'`);

    // Check user's proficiency for each prerequisite
    const prerequisiteDetails: PrerequisiteDetail[] = await Promise.all(
      allPrerequisites.map(async (prereq) => {
        try {
          const proficiency = await getProficiency(userId, prereq.id);
          const level: ProficiencyLevel = proficiency?.level || 'unknown';

          return {
            skillId: prereq.id,
            skillName: prereq.name,
            skillDescription: prereq.description,
            currentLevel: level,
            isWeak: isWeakProficiency(level),
          };
        } catch (error) {
          console.warn(`[Check Prerequisites] Error checking proficiency for ${prereq.id}:`, error);
          // If error fetching proficiency, assume unknown
          return {
            skillId: prereq.id,
            skillName: prereq.name,
            skillDescription: prereq.description,
            currentLevel: 'unknown' as ProficiencyLevel,
            isWeak: true,
          };
        }
      })
    );

    // Filter for weak skills
    const weakSkills = prerequisiteDetails.filter(p => p.isWeak);

    // Determine readiness: Ready if ALL layer 1 skills are proficient or mastered
    const layer1Skills = prerequisiteDetails.filter(p =>
      layer1Prerequisites.skillIds.includes(p.skillId)
    );
    const weakLayer1Skills = layer1Skills.filter(p => p.isWeak);
    const ready = weakLayer1Skills.length === 0;

    // Generate recommendations
    const recommendations = generateRecommendations(weakSkills);

    // Log result
    console.log(`[Check Prerequisites] User ${userId} readiness for '${skillId}': ${ready ? 'READY' : 'NOT READY'}`);
    console.log(`[Check Prerequisites] Weak skills: ${weakSkills.map(s => s.skillName).join(', ') || 'None'}`);

    const response: CheckPrerequisitesResponse = {
      success: true,
      ready,
      weakSkills: weakSkills.map(s => ({
        id: s.skillId,
        name: s.skillName,
        description: s.skillDescription,
      })),
      recommendations,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Check Prerequisites] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        ready: false,
        weakSkills: [],
        recommendations: [],
        error: error instanceof Error ? error.message : 'An unexpected error occurred.',
      } as CheckPrerequisitesResponse,
      { status: 500 }
    );
  }
}
