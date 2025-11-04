import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Types for our API response
interface ParseImageResponse {
  problemText: string;
  latex?: string;
  success: boolean;
  error?: string;
}

interface RequestBody {
  image: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum file size: 10MB (from Story 2.2)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Validates base64 image data
 */
function validateImageData(image: string): { valid: boolean; error?: string } {
  if (!image) {
    return { valid: false, error: 'No image data provided' };
  }

  // Check if it's a valid base64 string
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  if (!base64Regex.test(image)) {
    return { valid: false, error: 'Invalid image format. Must be a base64 encoded image' };
  }

  // Estimate size (base64 is ~4/3 the size of original)
  const estimatedSize = (image.length * 3) / 4;
  if (estimatedSize > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image size exceeds 10MB limit' };
  }

  return { valid: true };
}

/**
 * Parses the AI response to extract structured data
 */
function parseAIResponse(content: string): { problemText: string; latex?: string } {
  try {
    // Try to parse as JSON first (should be raw JSON now with updated prompt)
    const parsed = JSON.parse(content.trim());
    if (parsed.problemText) {
      return {
        problemText: parsed.problemText,
        latex: parsed.latex || undefined,
      };
    }
  } catch (error) {
    // If JSON parsing fails, log the error and return the content as-is
    console.error('Failed to parse AI response as JSON:', error);
    console.error('AI response content:', content);

    // Fallback: treat entire content as problem text
    return {
      problemText: content,
      latex: undefined,
    };
  }

  // Fallback if parsed but no problemText field
  return { problemText: content };
}

/**
 * POST /api/parse-image
 * Accepts base64 image and returns parsed math problem
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
          problemText: '',
        } as ParseImageResponse,
        { status: 500 }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Must be JSON with "image" field.',
          problemText: '',
        } as ParseImageResponse,
        { status: 400 }
      );
    }

    // Validate image data
    const validation = validateImageData(body.image);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          problemText: '',
        } as ParseImageResponse,
        { status: 400 }
      );
    }

    // Call OpenAI GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using gpt-4o which has vision capabilities
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the math problem from this image. Return ONLY valid JSON matching this exact format: {"problemText": "the problem text", "latex": "latex notation"}. Do not use markdown code blocks or any other formatting. Return only the raw JSON object.',
            },
            {
              type: 'image_url',
              image_url: {
                url: body.image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2, // Low temperature for more consistent extraction
    });

    // Extract the response content
    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'No response from AI. Please try again.',
          problemText: '',
        } as ParseImageResponse,
        { status: 500 }
      );
    }

    // Parse the AI response
    const parsed = parseAIResponse(aiContent);

    // Return structured response
    return NextResponse.json(
      {
        success: true,
        problemText: parsed.problemText,
        latex: parsed.latex,
      } as ParseImageResponse,
      { status: 200 }
    );
  } catch (error: unknown) {
    // Error handling
    console.error('Error in parse-image API:', error);

    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'error' in error) {
      const openAIError = error as { error?: { type?: string; message?: string } };

      if (openAIError.error?.type === 'invalid_request_error') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid image or request. Please ensure the image is clear and try again.',
            problemText: '',
          } as ParseImageResponse,
          { status: 400 }
        );
      }

      if (openAIError.error?.type === 'rate_limit_error') {
        return NextResponse.json(
          {
            success: false,
            error: 'Service is busy. Please try again in a moment.',
            problemText: '',
          } as ParseImageResponse,
          { status: 429 }
        );
      }

      if (openAIError.error?.type === 'authentication_error') {
        console.error('OpenAI authentication failed');
        return NextResponse.json(
          {
            success: false,
            error: 'Server configuration error. Please contact support.',
            problemText: '',
          } as ParseImageResponse,
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process image. Please try again.',
        problemText: '',
      } as ParseImageResponse,
      { status: 500 }
    );
  }
}
