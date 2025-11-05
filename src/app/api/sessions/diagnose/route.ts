/**
 * Diagnostic Flow API
 *
 * This endpoint generates diagnostic questions to detect knowledge gaps
 * when a student is stuck on a problem.
 *
 * POST /api/sessions/diagnose
 * Body: { sessionId: string, problemText: string }
 * Response: { diagnosticQuestions: [...], requiredSkills: [...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { skillGraphManager } from '@/lib/skillGraph';

interface DiagnosticRequest {
  sessionId: string;
  problemText: string;
}

interface DiagnosticQuestion {
  question: string;
  skillId: string;
  skillName: string;
  layer: 1 | 2;
}

interface DiagnosticResponse {
  success: boolean;
  diagnosticQuestions: DiagnosticQuestion[];
  requiredSkills: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  error?: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<DiagnosticRequest>;

  if (!req.sessionId || typeof req.sessionId !== 'string') {
    return { valid: false, error: 'sessionId is required and must be a string.' };
  }

  if (!req.problemText || typeof req.problemText !== 'string' || req.problemText.trim().length === 0) {
    return { valid: false, error: 'problemText is required and must be a non-empty string.' };
  }

  return { valid: true };
}

/**
 * POST /api/sessions/diagnose
 * Generate diagnostic questions to detect student's knowledge gaps
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: DiagnosticRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Must be valid JSON.',
          diagnosticQuestions: [],
          requiredSkills: [],
        } as DiagnosticResponse,
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          diagnosticQuestions: [],
          requiredSkills: [],
        } as DiagnosticResponse,
        { status: 400 }
      );
    }

    // Call skill analysis API to detect required skills
    const skillAnalysisUrl = new URL('/api/skills/analyze', request.url);
    const skillAnalysisResponse = await fetch(skillAnalysisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problemText: body.problemText }),
    });

    if (!skillAnalysisResponse.ok) {
      console.error('Skill analysis failed:', await skillAnalysisResponse.text());
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to analyze problem skills. Please try again.',
          diagnosticQuestions: [],
          requiredSkills: [],
        } as DiagnosticResponse,
        { status: 500 }
      );
    }

    const skillAnalysisData = await skillAnalysisResponse.json();

    if (!skillAnalysisData.success) {
      return NextResponse.json(
        {
          success: false,
          error: skillAnalysisData.error || 'Skill analysis failed',
          diagnosticQuestions: [],
          requiredSkills: [],
        } as DiagnosticResponse,
        { status: 500 }
      );
    }

    const primarySkill = skillAnalysisData.primarySkill;
    const requiredSkillIds = skillAnalysisData.requiredSkills || [];

    // Load skill graph
    const skillGraph = await skillGraphManager.loadSkillGraph();

    // Get details for required skills
    const requiredSkills = requiredSkillIds
      .map((skillId: string) => {
        const skill = skillGraph.skills[skillId];
        if (!skill) return null;
        return {
          id: skillId,
          name: skill.name,
          description: skill.description,
        };
      })
      .filter((skill: unknown): skill is { id: string; name: string; description: string } => skill !== null);

    // Generate diagnostic questions from skill graph
    const diagnosticQuestions: DiagnosticQuestion[] = [];

    // Get layer1 prerequisites for primary skill and their diagnostic questions
    if (primarySkill) {
      try {
        const primarySkillData = skillGraph.skills[primarySkill];
        if (primarySkillData) {
          const layer1Prerequisites = primarySkillData.layer1 || [];

          // Get diagnostic questions for each layer1 prerequisite
          for (const prereqId of layer1Prerequisites) {
            const prereqSkill = skillGraph.skills[prereqId];
            if (!prereqSkill) continue;

            const questions = await skillGraphManager.getDiagnosticQuestions(prereqId, 1);

            // Take first 1-2 questions per skill (keep total under 3)
            const questionsToAdd = questions.slice(0, 1);

            for (const question of questionsToAdd) {
              diagnosticQuestions.push({
                question,
                skillId: prereqId,
                skillName: prereqSkill.name,
                layer: 1,
              });
            }

            // Stop if we have enough questions (2-3 max)
            if (diagnosticQuestions.length >= 3) {
              break;
            }
          }

          // If we don't have enough questions from layer1, try layer2
          if (diagnosticQuestions.length < 2) {
            const layer2Prerequisites = primarySkillData.layer2 || [];

            for (const prereqId of layer2Prerequisites) {
              const prereqSkill = skillGraph.skills[prereqId];
              if (!prereqSkill) continue;

              const questions = await skillGraphManager.getDiagnosticQuestions(prereqId, 2);

              const questionsToAdd = questions.slice(0, 1);

              for (const question of questionsToAdd) {
                diagnosticQuestions.push({
                  question,
                  skillId: prereqId,
                  skillName: prereqSkill.name,
                  layer: 2,
                });
              }

              // Stop if we have enough questions
              if (diagnosticQuestions.length >= 3) {
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error generating diagnostic questions:', error);
      }
    }

    // If we couldn't generate enough diagnostic questions, use fallback
    if (diagnosticQuestions.length === 0 && requiredSkills.length > 0) {
      // Use the first required skill's diagnostic questions as fallback
      const fallbackSkill = requiredSkills[0];
      try {
        const questions = await skillGraphManager.getDiagnosticQuestions(fallbackSkill.id, 1);
        for (const question of questions.slice(0, 2)) {
          diagnosticQuestions.push({
            question,
            skillId: fallbackSkill.id,
            skillName: fallbackSkill.name,
            layer: 1,
          });
        }
      } catch (error) {
        console.error('Error getting fallback diagnostic questions:', error);
      }
    }

    // Limit to max 3 questions to avoid overwhelming student
    const limitedQuestions = diagnosticQuestions.slice(0, 3);

    console.log(`[Diagnosis] Generated ${limitedQuestions.length} diagnostic questions for session ${body.sessionId}`);
    console.log(`[Diagnosis] Required skills: ${requiredSkills.map((s: { id: string; name: string; description: string }) => s.name).join(', ')}`);

    return NextResponse.json(
      {
        success: true,
        diagnosticQuestions: limitedQuestions,
        requiredSkills,
      } as DiagnosticResponse,
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Unexpected error in diagnose API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during diagnosis. Please try again.',
        diagnosticQuestions: [],
        requiredSkills: [],
      } as DiagnosticResponse,
      { status: 500 }
    );
  }
}
