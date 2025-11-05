import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { skillGraphManager } from '@/lib/skillGraph';

// Types for the API
export interface AnalyzeSkillsRequest {
  problemText: string;
  imageUrl?: string;
}

export interface AnalyzeSkillsResponse {
  success: boolean;
  primarySkill?: string;
  requiredSkills?: string[];
  reasoning?: string;
  error?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TIMEOUT_MS = 15000; // 15 seconds for analysis

/**
 * Validates the request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body. Must be a JSON object.' };
  }

  const req = body as Partial<AnalyzeSkillsRequest>;

  if (!req.problemText || typeof req.problemText !== 'string' || req.problemText.trim().length === 0) {
    return { valid: false, error: 'problemText is required and must be a non-empty string.' };
  }

  if (req.imageUrl !== undefined && typeof req.imageUrl !== 'string') {
    return { valid: false, error: 'imageUrl must be a string if provided.' };
  }

  return { valid: true };
}

/**
 * POST /api/skills/analyze
 * Analyzes a math problem and identifies required skills using GPT-4
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error. Please contact support.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    // Parse request body
    let body: AnalyzeSkillsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Must be valid JSON.',
        } as AnalyzeSkillsResponse,
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
        } as AnalyzeSkillsResponse,
        { status: 400 }
      );
    }

    // Load skill graph to get available skills
    let allSkills;
    try {
      allSkills = await skillGraphManager.getAllSkills();
    } catch (error) {
      console.error('Error loading skill graph:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to load skill graph. Please try again.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    if (allSkills.length === 0) {
      console.error('No skills found in skill graph');
      return NextResponse.json(
        {
          success: false,
          error: 'Skill graph is empty. Please contact support.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    // Build skill list for prompt
    const skillList = allSkills
      .map(skill => `- ${skill.id}: "${skill.name}" - ${skill.description}`)
      .join('\n');

    // Build GPT-4 prompt
    const systemPrompt = `You are an expert math education analyst. Your job is to analyze math problems and identify which mathematical skills from a predefined list are required to solve them.

Available Skills:
${skillList}

Your task:
1. Analyze the given math problem carefully
2. Identify the PRIMARY skill required (the main concept being tested)
3. Identify ALL prerequisite skills needed (skills student must know to solve this)
4. Provide clear reasoning for your choices

Return your analysis as JSON with this exact structure:
{
  "primarySkill": "skill_id",
  "requiredSkills": ["skill_id_1", "skill_id_2", "skill_id_3"],
  "reasoning": "Brief explanation of why these skills were chosen"
}

Important:
- primarySkill should be ONE skill ID (the most advanced skill needed)
- requiredSkills should include the primarySkill plus all prerequisites
- All skill IDs must be from the available skills list
- Be thorough but don't over-identify skills
- Focus on skills directly needed, not tangentially related`;

    const userPrompt = `Analyze this math problem and identify required skills:

Problem: ${body.problemText}

${body.imageUrl ? `Image URL: ${body.imageUrl}\nNote: If the image contains additional context, consider it in your analysis.` : ''}

Return your analysis as JSON.`;

    // Call OpenAI API with JSON mode
    let result;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS);
      });

      const apiPromise = openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-efficient model for skill analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Low temperature for consistent analysis
        max_tokens: 500,
      });

      result = await Promise.race([apiPromise, timeoutPromise]);
    } catch (error: unknown) {
      console.error('OpenAI API error:', error);

      if (error instanceof Error && error.message === 'Request timeout') {
        return NextResponse.json(
          {
            success: false,
            error: 'Analysis timed out after 15 seconds. Please try again.',
          } as AnalyzeSkillsResponse,
          { status: 500 }
        );
      }

      // Handle OpenAI-specific errors
      if (error && typeof error === 'object' && 'error' in error) {
        const openAIError = error as { error?: { type?: string; message?: string } };

        if (openAIError.error?.type === 'rate_limit_error') {
          return NextResponse.json(
            {
              success: false,
              error: 'Service is busy due to rate limits. Please try again in a moment.',
            } as AnalyzeSkillsResponse,
            { status: 429 }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to analyze problem. Please try again.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    // Extract and parse response
    const aiContent = result.choices[0]?.message?.content;
    if (!aiContent) {
      console.error('No response from AI');
      return NextResponse.json(
        {
          success: false,
          error: 'No response from AI. Please try again.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(aiContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', aiContent);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response. Please try again.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    // Validate response structure
    if (!analysis.primarySkill || !analysis.requiredSkills || !Array.isArray(analysis.requiredSkills)) {
      console.error('Invalid AI response structure:', analysis);
      return NextResponse.json(
        {
          success: false,
          error: 'AI returned invalid response structure. Please try again.',
        } as AnalyzeSkillsResponse,
        { status: 500 }
      );
    }

    // Validate all skill IDs against the skill graph
    const invalidSkills: string[] = [];
    const skillsToValidate = [analysis.primarySkill, ...analysis.requiredSkills];

    for (const skillId of skillsToValidate) {
      const isValid = await skillGraphManager.validateSkillExists(skillId);
      if (!isValid) {
        invalidSkills.push(skillId);
      }
    }

    if (invalidSkills.length > 0) {
      console.warn('AI returned invalid skill IDs:', invalidSkills);
      console.warn('Full AI response:', analysis);

      // Filter out invalid skills
      const validRequiredSkills = analysis.requiredSkills.filter(
        (skillId: string) => !invalidSkills.includes(skillId)
      );

      // If primary skill is invalid, try to use the first valid required skill
      let primarySkill = analysis.primarySkill;
      if (invalidSkills.includes(primarySkill)) {
        if (validRequiredSkills.length > 0) {
          primarySkill = validRequiredSkills[0];
          console.log('Replaced invalid primary skill with:', primarySkill);
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Could not identify valid skills for this problem. Please try rephrasing.',
            } as AnalyzeSkillsResponse,
            { status: 500 }
          );
        }
      }

      analysis.primarySkill = primarySkill;
      analysis.requiredSkills = validRequiredSkills;
    }

    // Ensure primarySkill is included in requiredSkills
    if (!analysis.requiredSkills.includes(analysis.primarySkill)) {
      analysis.requiredSkills.unshift(analysis.primarySkill);
    }

    // Log successful analysis
    console.log(`[Skill Analysis] Problem: "${body.problemText.substring(0, 50)}..."`);
    console.log(`[Skill Analysis] Primary Skill: ${analysis.primarySkill}`);
    console.log(`[Skill Analysis] Required Skills: ${analysis.requiredSkills.join(', ')}`);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        primarySkill: analysis.primarySkill,
        requiredSkills: analysis.requiredSkills,
        reasoning: analysis.reasoning || 'Skills identified based on problem analysis.',
      } as AnalyzeSkillsResponse,
      { status: 200 }
    );
  } catch (error: unknown) {
    // Catch-all error handling
    console.error('Unexpected error in skill analysis API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as AnalyzeSkillsResponse,
      { status: 500 }
    );
  }
}
