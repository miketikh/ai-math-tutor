import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface FormatMathResponse {
  formattedText: string;
  success: boolean;
  error?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/format-math
 * Formats user input with proper LaTeX delimiters for math expressions
 */
export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
          formattedText: '',
        } as FormatMathResponse,
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json();
    const userText = body.text;

    if (!userText || typeof userText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request. "text" field required.',
          formattedText: '',
        } as FormatMathResponse,
        { status: 400 }
      );
    }

    // Call gpt-4o-mini to format math
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Your only job: wrap math expressions in \\( \\) delimiters. Return the EXACT input text with ONLY math wrapped in \\( \\). Change nothing else. NEVER use $ for math (conflicts with currency).\n\nExamples:\nInput: "solve x^2 = 4"\nOutput: "solve \\(x^2 = 4\\)"\n\nInput: "I want x^2 + 5x = 6 for x"\nOutput: "I want \\(x^2 + 5x = 6\\) for x"\n\nInput: "what is the answer"\nOutput: "what is the answer"\n\nInput: "I made $5 and spent $3"\nOutput: "I made $5 and spent $3" (no math to format)',
        },
        {
          role: 'user',
          content: userText,
        },
      ],
      max_tokens: 500,
      temperature: 0.1, // Low temperature for consistent formatting
    });

    const formattedText = response.choices[0]?.message?.content?.trim();

    if (!formattedText) {
      // Fallback to original text
      return NextResponse.json(
        {
          success: true,
          formattedText: userText,
        } as FormatMathResponse,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        formattedText,
      } as FormatMathResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in format-math API:', error);

    // Return original text on error
    const body = await request.json().catch(() => ({ text: '' }));
    return NextResponse.json(
      {
        success: true, // Still "success" so we don't break the flow
        formattedText: body.text || '',
        error: 'Formatting unavailable, using original text',
      } as FormatMathResponse,
      { status: 200 }
    );
  }
}
