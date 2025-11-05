import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { skillGraphManager } from '@/lib/skillGraph';
import { getProficiency } from '@/lib/proficiencyTracker';
import type { ProficiencyLevel } from '@/lib/proficiencyTracker';

/**
 * AI-Powered Skill Branching Analyzer
 *
 * Analyzes conversation history to determine if student needs prerequisite practice.
 * Replaces regex-based stuck detection with AI understanding of:
 * - Student confusion patterns
 * - Specific prerequisite skill gaps
 * - Conversation context and proficiency history
 */

// Request body interface
interface AnalyzeBranchingRequest {
  conversationHistory: Array<{ role: string; content: string; timestamp?: number }>;
  mainProblem: string;
  mainSkillId: string;
  userId: string;
}

// Response interface
interface AnalyzeBranchingResponse {
  success: boolean;
  shouldBranch: boolean;
  weakSkillId: string | null;
  weakSkillName: string | null;
  weakSkillDescription: string | null;
  reasoning: string;
  confidence: number;
  error?: string;
}

// Prerequisite with proficiency info
interface PrerequisiteWithProficiency {
  id: string;
  name: string;
  description: string;
  proficiency: ProficiencyLevel;
  layer: 1 | 2;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<AnalyzeBranchingRequest>;

  if (!Array.isArray(req.conversationHistory)) {
    return { valid: false, error: 'conversationHistory must be an array.' };
  }

  if (!req.mainProblem || typeof req.mainProblem !== 'string') {
    return { valid: false, error: 'mainProblem is required and must be a string.' };
  }

  if (!req.mainSkillId || typeof req.mainSkillId !== 'string') {
    return { valid: false, error: 'mainSkillId is required and must be a string.' };
  }

  if (!req.userId || typeof req.userId !== 'string') {
    return { valid: false, error: 'userId is required and must be a string.' };
  }

  return { valid: true };
}

/**
 * Recursively fetch complete prerequisite tree with user proficiency levels
 * Expands the full dependency tree so AI can see all skills needed for the problem
 */
async function fetchFullPrerequisiteTree(
  skillId: string,
  userId: string,
  visited: Set<string> = new Set(),
  currentDepth: number = 0,
  maxDepth: number = 5
): Promise<PrerequisiteWithProficiency[]> {
  // Prevent infinite recursion and excessive depth
  if (currentDepth >= maxDepth || visited.has(skillId)) {
    return [];
  }

  visited.add(skillId);
  const allPrerequisites: PrerequisiteWithProficiency[] = [];

  try {
    // Get layer 1 and layer 2 prerequisites for this skill
    const layer1 = await skillGraphManager.getPrerequisites(skillId, 1);
    const layer2 = await skillGraphManager.getPrerequisites(skillId, 2);

    // Process layer 1 prerequisites
    for (const prereq of layer1.skills) {
      if (!visited.has(prereq.id)) {
        try {
          const proficiencyData = await getProficiency(userId, prereq.id);
          allPrerequisites.push({
            id: prereq.id,
            name: prereq.name,
            description: prereq.description,
            proficiency: proficiencyData?.level || 'unknown',
            layer: currentDepth === 0 ? 1 : (currentDepth + 1) as 1 | 2, // Track relative depth
          });

          // Recursively get prerequisites of this prerequisite
          const childPrereqs = await fetchFullPrerequisiteTree(
            prereq.id,
            userId,
            visited,
            currentDepth + 1,
            maxDepth
          );
          allPrerequisites.push(...childPrereqs);
        } catch (error) {
          console.warn(`Failed to get proficiency for ${prereq.id}:`, error);
          allPrerequisites.push({
            id: prereq.id,
            name: prereq.name,
            description: prereq.description,
            proficiency: 'unknown',
            layer: currentDepth === 0 ? 1 : (currentDepth + 1) as 1 | 2,
          });
        }
      }
    }

    // Process layer 2 prerequisites
    for (const prereq of layer2.skills) {
      if (!visited.has(prereq.id)) {
        try {
          const proficiencyData = await getProficiency(userId, prereq.id);
          allPrerequisites.push({
            id: prereq.id,
            name: prereq.name,
            description: prereq.description,
            proficiency: proficiencyData?.level || 'unknown',
            layer: 2,
          });

          // Recursively get prerequisites of this prerequisite
          const childPrereqs = await fetchFullPrerequisiteTree(
            prereq.id,
            userId,
            visited,
            currentDepth + 1,
            maxDepth
          );
          allPrerequisites.push(...childPrereqs);
        } catch (error) {
          console.warn(`Failed to get proficiency for ${prereq.id}:`, error);
          allPrerequisites.push({
            id: prereq.id,
            name: prereq.name,
            description: prereq.description,
            proficiency: 'unknown',
            layer: 2,
          });
        }
      }
    }

    return allPrerequisites;
  } catch (error) {
    console.error(`Error fetching prerequisites for ${skillId}:`, error);
    return [];
  }
}

/**
 * Build AI prompt for branching analysis
 */
function buildBranchingPrompt(
  mainProblem: string,
  mainSkill: { name: string; description: string },
  prerequisites: PrerequisiteWithProficiency[],
  conversationHistory: Array<{ role: string; content: string }>
): string {
  // Deduplicate prerequisites (in case same skill appears at multiple depths)
  const uniquePrereqs = Array.from(
    new Map(prerequisites.map(p => [p.id, p])).values()
  );

  // Separate direct prerequisites from deeper ones
  const directPrereqs = uniquePrereqs.filter(p => p.layer === 1 || p.layer === 2);
  const deeperPrereqs = uniquePrereqs.filter(p => p.layer !== 1 && p.layer !== 2);

  const formatPrerequisites = (prereqs: PrerequisiteWithProficiency[]) => {
    if (prereqs.length === 0) return '  (none)';
    return prereqs
      .map(
        p =>
          `  - ${p.id}: "${p.name}" - ${p.description} (proficiency: ${p.proficiency})`
      )
      .join('\n');
  };

  // Format conversation (last 8 messages)
  const recentMessages = conversationHistory.slice(-8);
  const formattedConversation = recentMessages
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return `You are an expert math tutor analyzing a student's conversation to determine if they need prerequisite practice.

CONTEXT:
- Main Problem: "${mainProblem}"
- Main Skill Required: ${mainSkill.name} - ${mainSkill.description}

COMPLETE PREREQUISITE TREE (all skills needed to solve this problem):

Direct Prerequisites (Layer 1 & 2):
${formatPrerequisites(directPrereqs)}

${deeperPrereqs.length > 0 ? `
Foundational Prerequisites (deeper dependencies):
${formatPrerequisites(deeperPrereqs)}
` : ''}

Note: This tree shows ALL skills transitively required. For example, to solve multi-step equations,
you need two-step equations (layer 1), which requires fractions (deeper), which requires basic arithmetic (foundational).

CONVERSATION (last ${recentMessages.length} messages):
${formattedConversation}

YOUR TASK:
1. Analyze the conversation to identify WHAT SPECIFIC CONCEPT/STEP the student is struggling with
2. Look for explicit signals: "I don't understand X", "confused about Y", repeated errors on a specific concept
3. Look for implicit signals: minimal responses, incorrect reasoning pattern, avoiding certain problem aspects
4. Match the struggling concept to a skill in the prerequisite tree above
5. Decide if we should branch to practice NOW or continue diagnosing

DECISION CRITERIA:
- Branch if: Student shows clear confusion + specific skill weakness identified + confidence > 0.7
- Don't branch if: Student making progress, asking clarifying questions, just started, showing good reasoning
- Prefer skills closer to main problem (direct prerequisites first)
- But ANY skill in the tree is valid if that's clearly what the student is struggling with
- Consider proficiency levels: 'unknown' or 'learning' indicate weakness, 'proficient' or 'mastered' indicate strength

IMPORTANT EXAMPLES:
- User says "I don't understand fractions" → Suggest fractions skill (even if it's a deeper prerequisite)
- User repeatedly fails at combining like terms → Suggest combining_like_terms
- User asks "what's a variable?" → Suggest understanding_variables
- User making good progress, just thinking → Don't branch yet

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no extra text).

Expected JSON format:
{
  "shouldBranch": boolean,
  "weakSkillId": "skill_id" or null,
  "weakSkillName": "Skill Name" or null,
  "weakSkillDescription": "description" or null,
  "reasoning": "Brief explanation of decision (which concept they're stuck on and why)",
  "confidence": 0.85
}`;
}

/**
 * POST /api/sessions/analyze-branching
 * AI-powered analysis of whether student needs prerequisite practice
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        {
          success: false,
          shouldBranch: false,
          weakSkillId: null,
          weakSkillName: null,
          weakSkillDescription: null,
          reasoning: 'API key not configured',
          confidence: 0,
          error: 'Server configuration error',
        } as AnalyzeBranchingResponse,
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          shouldBranch: false,
          weakSkillId: null,
          weakSkillName: null,
          weakSkillDescription: null,
          reasoning: validation.error || 'Invalid request',
          confidence: 0,
          error: validation.error,
        } as AnalyzeBranchingResponse,
        { status: 400 }
      );
    }

    const { conversationHistory, mainProblem, mainSkillId, userId } = body as AnalyzeBranchingRequest;

    // Early exit if conversation is too short
    if (conversationHistory.length < 2) {
      console.log('[Branching Analysis] Conversation too short, skipping analysis');
      return NextResponse.json(
        {
          success: true,
          shouldBranch: false,
          weakSkillId: null,
          weakSkillName: null,
          weakSkillDescription: null,
          reasoning: 'Conversation too short to analyze',
          confidence: 0.9,
        } as AnalyzeBranchingResponse,
        { status: 200 }
      );
    }

    // Get main skill details
    let mainSkill;
    try {
      mainSkill = await skillGraphManager.getSkill(mainSkillId);
    } catch (error) {
      console.error(`[Branching Analysis] Skill '${mainSkillId}' not found:`, error);
      return NextResponse.json(
        {
          success: false,
          shouldBranch: false,
          weakSkillId: null,
          weakSkillName: null,
          weakSkillDescription: null,
          reasoning: 'Main skill not found in skill graph',
          confidence: 0,
          error: `Skill '${mainSkillId}' not found`,
        } as AnalyzeBranchingResponse,
        { status: 404 }
      );
    }

    // Fetch complete prerequisite tree with proficiency (recursively expands all dependencies)
    const prerequisites = await fetchFullPrerequisiteTree(mainSkillId, userId);

    console.log(`[Branching Analysis] Analyzing ${conversationHistory.length} messages for skill '${mainSkillId}' with ${prerequisites.length} total prerequisites in tree`);

    // Build AI prompt
    const prompt = buildBranchingPrompt(
      mainProblem,
      { name: mainSkill.name, description: mainSkill.description },
      prerequisites,
      conversationHistory
    );

    // Call OpenAI with JSON mode
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise educational analyst. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.4, // Low temperature for consistent decisions
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const analysis = JSON.parse(responseContent);

      // Validate response structure
      if (typeof analysis.shouldBranch !== 'boolean') {
        throw new Error('Invalid response: shouldBranch must be boolean');
      }

      if (typeof analysis.reasoning !== 'string') {
        throw new Error('Invalid response: reasoning must be string');
      }

      if (typeof analysis.confidence !== 'number' || analysis.confidence < 0 || analysis.confidence > 1) {
        analysis.confidence = 0.5; // Default to medium confidence
      }

      // Ensure nulls are properly set
      if (!analysis.shouldBranch) {
        analysis.weakSkillId = null;
        analysis.weakSkillName = null;
        analysis.weakSkillDescription = null;
      }

      console.log(`[Branching Analysis] AI Decision:`, {
        shouldBranch: analysis.shouldBranch,
        weakSkill: analysis.weakSkillName || 'none',
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      });

      return NextResponse.json(
        {
          success: true,
          shouldBranch: analysis.shouldBranch,
          weakSkillId: analysis.weakSkillId,
          weakSkillName: analysis.weakSkillName,
          weakSkillDescription: analysis.weakSkillDescription,
          reasoning: analysis.reasoning,
          confidence: analysis.confidence,
        } as AnalyzeBranchingResponse,
        { status: 200 }
      );

    } catch (aiError) {
      console.error('[Branching Analysis] OpenAI API error:', aiError);

      // Safe fallback: Don't branch on AI errors
      return NextResponse.json(
        {
          success: true,
          shouldBranch: false,
          weakSkillId: null,
          weakSkillName: null,
          weakSkillDescription: null,
          reasoning: 'Unable to analyze due to AI error. Continuing conversation.',
          confidence: 0.3,
        } as AnalyzeBranchingResponse,
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('[Branching Analysis] Unexpected error:', error);

    // Safe fallback: Don't branch on unexpected errors
    return NextResponse.json(
      {
        success: true,
        shouldBranch: false,
        weakSkillId: null,
        weakSkillName: null,
        weakSkillDescription: null,
        reasoning: 'Unable to analyze due to error. Continuing conversation.',
        confidence: 0.3,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as AnalyzeBranchingResponse,
      { status: 200 }
    );
  }
}
