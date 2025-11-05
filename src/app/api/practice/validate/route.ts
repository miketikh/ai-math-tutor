import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ValidateRequest {
  userId?: string;
  skillId?: string;
  problemText?: string;
  solutionText?: string;
  answer?: string;
}

interface ValidateResponse {
  success: boolean;
  correct?: boolean;
  feedback?: string;
  error?: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TIMEOUT_MS = 10000;

async function validateWithAI(
  userAnswer: string,
  correctSolution: string,
  problemText: string
): Promise<{ correct: boolean; feedback: string }> {
  const prompt = `You are a math tutor checking if a student's answer is correct.

Problem: ${problemText}

Expected Solution: ${correctSolution}

Student's Answer: ${userAnswer}

Determine if the student's answer is mathematically equivalent to the expected solution. Consider:
- Algebraic equivalence
- Equivalent forms (fraction/decimal, order, simplification)

Return JSON only:
{
  "correct": true|false,
  "feedback": "1-2 sentences of constructive feedback"
}`;

  const completion = await Promise.race([
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You validate math answers and return strict JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
  ]);

  const text = completion.choices?.[0]?.message?.content || '{"correct":false,"feedback":"Unable to validate."}';
  const parsed = JSON.parse(text);
  return { correct: Boolean(parsed.correct), feedback: String(parsed.feedback || '') };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequest;
    const { userId, skillId, problemText, solutionText, answer } = body;

    if (!userId || !skillId || !problemText || !solutionText || typeof answer !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userId, skillId, problemText, solutionText, and answer are required' } as ValidateResponse,
        { status: 400 }
      );
    }

    const result = await validateWithAI(answer, solutionText, problemText);
    return NextResponse.json({ success: true, correct: result.correct, feedback: result.feedback } as ValidateResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Validation failed';
    return NextResponse.json({ success: false, error: msg } as ValidateResponse, { status: 500 });
  }
}


