# Parse Image API Endpoint

## Overview
This API endpoint accepts base64-encoded images of math problems and uses OpenAI's GPT-4 Vision API to extract the problem text and LaTeX notation.

## Endpoint
`POST /api/parse-image`

## Request Format

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "image": "data:image/png;base64,iVBORw0KG..."
}
```

The `image` field must be a base64-encoded data URL with the format:
`data:image/{type};base64,{base64-data}`

Supported image types: png, jpeg, jpg, gif, webp

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "problemText": "Solve for x: 2x + 5 = 13",
  "latex": "2x + 5 = 13"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "User-friendly error message",
  "problemText": ""
}
```

## Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Invalid request body | Malformed JSON |
| 400 | No image data provided | Missing image field |
| 400 | Invalid image format | Image is not valid base64 data URL |
| 400 | Image size exceeds 10MB limit | Image too large |
| 400 | Invalid image or request | OpenAI rejected the image |
| 429 | Service is busy | Rate limit exceeded |
| 500 | Server configuration error | API key not configured |
| 500 | Failed to process image | Generic processing error |

## Configuration

### Environment Variables
Set in `.env.local`:
```
OPENAI_API_KEY=sk-...
```

**IMPORTANT**: Never commit `.env.local` to version control. The API key is kept secure on the server side only.

## Testing

### Prerequisites
1. Configure OpenAI API key in `.env.local`
2. Start dev server: `npm run dev`

### Manual Testing with cURL

Test with valid image:
```bash
curl -X POST http://localhost:3000/api/parse-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
  }'
```

Test with missing image:
```bash
curl -X POST http://localhost:3000/api/parse-image \
  -H "Content-Type: application/json" \
  -d '{}'
```

Test with invalid format:
```bash
curl -X POST http://localhost:3000/api/parse-image \
  -H "Content-Type: application/json" \
  -d '{"image": "not-a-valid-image"}'
```

### Automated Testing
Run the test script (requires dev server running):
```bash
npx tsx src/app/api/parse-image/test-endpoint.ts
```

## Implementation Details

### Security Features
- API key stored server-side only (never exposed to client)
- Request body validation before processing
- Image size limit enforcement (10MB max)
- Proper error handling without exposing sensitive details
- Rate limit error handling

### OpenAI Configuration
- Model: `gpt-4o` (with vision capabilities)
- Temperature: 0.2 (for consistent extraction)
- Max tokens: 1000

### Prompt
```
Extract the math problem from this image. Return the problem text and LaTeX
notation if applicable. Format your response as JSON with fields:
problemText (string) and latex (optional string).
```

## Story Completion Checklist

- [x] API route created at `/api/parse-image`
- [x] Accepts POST request with base64 image data
- [x] Calls OpenAI GPT-4 Vision API with appropriate prompt
- [x] Returns structured response: `{ problemText, latex?, success }`
- [x] Error handling for API failures with user-friendly messages
- [x] API key from environment variables (never exposed to client)
- [x] OpenAI SDK installed
- [x] TypeScript types defined
- [x] Request validation implemented
- [x] Image size limit enforced (10MB)
- [x] Comprehensive error handling
- [x] Documentation created

## Next Steps

After configuring a valid OpenAI API key in `.env.local`, this endpoint will be ready to:
1. Accept math problem images from the frontend
2. Parse them using GPT-4 Vision
3. Return structured problem data for the tutoring interface

The endpoint is now ready for integration with the frontend upload component (Story 2.2/2.3).
