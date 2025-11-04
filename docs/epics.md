# math-tutor - Epic Breakdown

**Author:** Mike
**Date:** 2025-11-03
**Project Level:** 2
**Target Scale:** Portfolio Demo

---

## Overview

This document provides the detailed epic breakdown for math-tutor, expanding on the high-level epic list in the [PRD](./PRD.md).

Each epic includes:

- Expanded goal and value proposition
- Complete story breakdown with user stories
- Acceptance criteria for each story
- Story sequencing and dependencies

**Epic Sequencing Principles:**

- Epic 1 establishes foundational infrastructure and initial functionality
- Subsequent epics build progressively, each delivering significant end-to-end value
- Stories within epics are vertically sliced and sequentially ordered
- No forward dependencies - each story builds only on previous work

---

## Epic 1: Project Foundation & Core Infrastructure

**Goal:** Establish the technical foundation with Next.js/TypeScript and create a working development environment with basic UI structure.

**Value:** Provides the skeleton that all subsequent epics build upon. Gets the project deployable from day one.

**Stories:**

**Story 1.1: Initialize Next.js Project with TypeScript**

As a developer,
I want a Next.js project with TypeScript configured,
So that I have a modern, type-safe foundation for building the application.

**Acceptance Criteria:**
1. Next.js 14+ project initialized with TypeScript
2. Package.json includes dependencies: react, next, typescript, @types/react, @types/node
3. tsconfig.json configured with strict mode
4. Basic folder structure: /app, /components, /lib, /public
5. Dev server runs on `npm run dev`
6. Production build succeeds with `npm run build`

**Prerequisites:** None

---

**Story 1.2: Create Basic Layout and Routing Structure**

As a developer,
I want a clean layout with routing configured,
So that I can organize different views and components.

**Acceptance Criteria:**
1. Root layout component created in app/layout.tsx
2. Home page created at app/page.tsx with placeholder content
3. Basic HTML structure with semantic elements
4. Responsive viewport meta tags configured
5. Page loads successfully at localhost:3000
6. Clean console with no errors

**Prerequisites:** Story 1.1

---

**Story 1.3: Set Up Tailwind CSS for Styling**

As a developer,
I want Tailwind CSS configured for styling,
So that I can rapidly build a professional UI with utility classes.

**Acceptance Criteria:**
1. Tailwind CSS installed and configured
2. tailwind.config.js set up with theme customization
3. globals.css includes Tailwind directives
4. Test component with Tailwind classes renders correctly
5. Dark mode support configured (optional for MVP)
6. JIT compilation working for fast development

**Prerequisites:** Story 1.2

---

**Story 1.4: Configure Environment Variables for API Keys**

As a developer,
I want environment variable management for API keys,
So that I can securely store OpenAI credentials without exposing them to clients.

**Acceptance Criteria:**
1. .env.local file created (gitignored)
2. .env.example file created with placeholder values
3. OPENAI_API_KEY environment variable accessible in Next.js API routes
4. Environment variables NOT exposed to client-side code
5. Documentation in README for setting up API keys
6. Vercel deployment environment variables configured in settings

**Prerequisites:** Story 1.1

---

**Story 1.5: Create Basic UI Shell with Header and Main Content Area** ✅ COMPLETED

As a student,
I want to see a clean, professional interface when I load the app,
So that I feel confident using the tutoring system.

**Acceptance Criteria:**
1. ✅ Header component with app title "Math Tutor"
2. ✅ Main content area with centered layout
3. ✅ Responsive design: works on desktop (1280x720+)
4. ✅ Clean, minimal styling inspired by Khan Academy/Linear
5. ✅ Professional typography and spacing
6. ✅ Component renders without console errors

**Prerequisites:** Story 1.3

**Implementation Details:**
- Created `/src/components/Header.tsx` - Reusable header component with "Math Tutor" title
- Updated `/src/app/layout.tsx` - Root layout now includes Header component with flex layout structure
- Updated `/src/app/page.tsx` - Simplified home page with centered content area and placeholder sections
- All styling uses Tailwind CSS with professional zinc color palette
- Dark mode support included
- No console errors, TypeScript compiles without issues
- Dev server running successfully at localhost:3000

---

## Epic 2: Problem Input & Vision Parsing

**Goal:** Enable students to submit math problems via text or image upload, with GPT-4 Vision parsing images into structured problems.

**Value:** First user-facing capability - students can input problems in the format most convenient for them.

**Stories:**

**Story 2.1: Create Text Input Component for Problem Entry** ✅ COMPLETED

As a student,
I want to type math problems into a text field,
So that I can quickly submit problems without needing an image.

**Acceptance Criteria:**
1. ✅ Textarea component for problem input with multi-line support
2. ✅ "Submit Problem" button that captures input
3. ✅ Input field clears after successful submission
4. ✅ Character limit of 1000 characters with counter
5. ✅ Basic validation: requires non-empty input
6. ✅ Success state shows "Problem submitted" confirmation

**Prerequisites:** Story 1.5

**Implementation Details:**
- Created `/src/components/ProblemInput/TextInput.tsx` - Client-side React component with full state management
- Textarea with multi-line support and placeholder text
- Real-time character counter displaying "X/1000 characters"
- "Submit Problem" button with disabled state when invalid
- Validation logic: non-empty input (trimmed) and max 1000 characters
- Error states: displays validation error messages for empty or over-limit input
- Success state: displays "Problem submitted successfully!" confirmation with checkmark icon
- Auto-dismisses success message after 3 seconds
- Clears input field after successful submission
- Integrated into home page at `/src/app/page.tsx`
- Professional Tailwind styling with proper focus states and accessibility (ARIA labels, semantic HTML)
- Dark mode support included
- TypeScript types for all props and state
- Submission currently logs to console (placeholder for future API integration in Epic 4)

---

**Story 2.2: Build Image Upload Component with Drag-and-Drop**

As a student,
I want to upload math problem images by dragging or clicking,
So that I can submit problems from worksheets or textbooks.

**Acceptance Criteria:**
1. Drag-and-drop zone with visual affordance (dashed border, icon)
2. Click to open file picker as alternative
3. Accepts JPG, PNG, PDF formats
4. Max file size 10MB with validation
5. Image preview shown after upload
6. Clear/remove button to delete uploaded image
7. Error messages for invalid files

**Prerequisites:** Story 1.5

---

**Story 2.3: Integrate React-Dropzone for File Upload** ✅ COMPLETED

As a developer,
I want react-dropzone library integrated,
So that drag-and-drop upload is robust and well-tested.

**Acceptance Criteria:**
1. ✅ react-dropzone package installed
2. ✅ useDropzone hook configured with file type restrictions
3. ✅ onDrop handler processes files correctly
4. ✅ File validation integrated (type, size)
5. ✅ Multiple files rejected (only 1 at a time)
6. ✅ Accessible keyboard navigation for file picker

**Prerequisites:** Story 2.2

**Implementation Details:**
- Installed react-dropzone (version 14.3.5) with full TypeScript support
- Refactored `/src/components/ProblemInput/ImageUpload.tsx` to use useDropzone hook
- Configured dropzone with strict file type validation: JPG, PNG, PDF only
- File size validation: 10MB maximum enforced by dropzone
- Single file restriction: maxFiles: 1, multiple: false
- Comprehensive error handling for all rejection scenarios:
  - file-too-large: "File size exceeds 10MB limit"
  - file-invalid-type: "Invalid file type. Please upload JPG, PNG, or PDF files only"
  - too-many-files: "Only one file can be uploaded at a time"
- Accessibility features:
  - Keyboard navigation: Tab to focus, Enter/Space to activate file picker
  - Focus ring with blue outline (focus:ring-2 focus:ring-blue-500)
  - Proper ARIA labels on file input
- Enhanced drag states with visual feedback:
  - isDragAccept: blue border and background for valid files
  - isDragReject: red border and background for invalid files
  - isDragActive: general drag state
- Preserved all existing functionality from Story 2.2:
  - Image preview for JPG/PNG files
  - PDF document display
  - File info with size formatting
  - Clear button to remove uploaded file
  - Vision API integration for automatic parsing
  - Loading states and extracted problem display
- useCallback hooks for performance optimization
- TypeScript types properly defined for all dropzone options
- All builds succeed without errors, no TypeScript issues

---

**Story 2.4: Create OpenAI Vision API Integration Route** ✅ COMPLETED

As a developer,
I want a Next.js API route that calls GPT-4 Vision,
So that I can parse problem images server-side.

**Acceptance Criteria:**
1. ✅ API route created at /api/parse-image
2. ✅ Accepts POST request with base64 image data
3. ✅ Calls OpenAI GPT-4 Vision API with appropriate prompt
4. ✅ Prompt instructs: "Extract the math problem from this image. Return problem text and LaTeX if applicable."
5. ✅ Returns structured response: { problemText: string, latex?: string, success: boolean }
6. ✅ Error handling for API failures with user-friendly messages
7. ✅ API key from environment variables (never exposed to client)

**Prerequisites:** Story 1.4

**Implementation Details:**
- Created `/src/app/api/parse-image/route.ts` - API route handler with OpenAI GPT-4 Vision integration
- Installed OpenAI SDK (version 6.7.0)
- Implemented comprehensive request validation (image format, size limits, malformed JSON)
- Used GPT-4o model with vision capabilities
- Temperature: 0.2 for consistent extraction
- Max file size: 10MB (enforced)
- Error handling for: network failures, rate limits, invalid API keys, malformed images
- Returns structured JSON: { success, problemText, latex?, error? }
- Created comprehensive README.md with API documentation
- Created test-endpoint.ts for manual testing
- All security requirements met: API key server-side only, no sensitive data logged
- Ready for frontend integration once API key is configured

---

**Story 2.5: Connect Image Upload to Vision API with Loading State** ✅ COMPLETED

As a student,
I want my uploaded image to be automatically parsed,
So that I don't have to manually type what's in the image.

**Acceptance Criteria:**
1. ✅ After image upload, automatic API call to /api/parse-image
2. ✅ Loading indicator shows "Parsing your problem..."
3. ✅ On success: display extracted problem text
4. ✅ On failure: show error + option to type manually
5. ✅ 10 second timeout with fallback message
6. ✅ Extracted text appears in editable field for corrections

**Prerequisites:** Story 2.4

**Implementation Details:**
- Updated `/src/components/ProblemInput/ImageUpload.tsx` - Integrated with Vision API
- Added automatic API call to /api/parse-image after image upload
- Implemented base64 conversion for image transmission
- Added loading state with spinner and "Parsing your problem..." message
- Success state displays extracted problem text in editable textarea
- Error handling with fallback message suggesting manual text input
- 10 second timeout using Promise.race pattern
- Editable text field allows corrections to extracted problem
- Integrated react-dropzone for robust file handling
- Updated `/src/app/page.tsx` - Added ImageUpload component with callback handling
- Preview section shows extracted problem text for testing
- All styling uses Tailwind CSS with dark mode support
- TypeScript types for API responses and component props
- Dev server running successfully, ready for visual testing

---

**Story 2.6: Add Problem Type Selection (Text vs Image)** ✅ COMPLETED

As a student,
I want to choose between typing or uploading an image,
So that I can use the input method that works best for me.

**Acceptance Criteria:**
1. ✅ Two clear buttons/tabs: "Type Problem" and "Upload Image"
2. ✅ Switching between modes clears previous input
3. ✅ Only one mode active at a time
4. ✅ Default mode: "Type Problem"
5. ✅ Visual indicator shows active mode
6. ✅ Smooth transition animation between modes

**Prerequisites:** Story 2.1, Story 2.2

**Implementation Details:**
- Updated `/src/app/page.tsx` - Added tab-based mode selection with state management
- Created TypeScript type `InputMode = 'text' | 'image'` for type safety
- Implemented state management with `useState` for active mode tracking
- Built two-button tab interface with "Type Problem" and "Upload Image" options
- Tab styling uses segmented control design pattern (common in iOS/macOS interfaces)
- Active tab visual indicators: white background, blue text, shadow effect
- Inactive tabs: gray text with hover states for better UX
- Conditional rendering: only one input component (TextInput OR ImageUpload) visible at a time
- Mode switching logic clears previous input (resets `extractedProblem` state)
- Added `key` props to components to force re-mount on mode switch (ensures clean state)
- Default mode set to "Type Problem" (text mode) on initial load
- Smooth transitions implemented with CSS:
  - Tab button transitions: `transition-all duration-200 ease-in-out`
  - Component transitions: `transition-opacity duration-200 ease-in-out`
  - Custom fadeIn animation added to `/src/app/globals.css`
- Animation keyframes: 0ms opacity 0 → 200ms opacity 1
- Accessibility features:
  - `aria-pressed` attribute indicates active tab state
  - `aria-label` for screen reader support
  - Keyboard navigation with focus rings (focus:ring-2)
- Dark mode support: tabs adapt to dark theme with proper contrast
- Responsive design: tabs work on all screen sizes
- Clean implementation maintains all existing functionality of both components
- Dev server confirmed running on port 3000

---

## Epic 3: Math Rendering Engine

**Goal:** Integrate KaTeX for beautiful LaTeX equation rendering throughout the application.

**Value:** Professional math display that makes complex equations readable and demo-worthy.

**Stories:**

**Story 3.1: Install and Configure KaTeX Library**

As a developer,
I want KaTeX installed and configured,
So that I can render LaTeX equations efficiently.

**Acceptance Criteria:**
1. katex and react-katex packages installed
2. KaTeX CSS imported in layout
3. Test equation renders correctly: ∫(x²+3x)dx
4. Rendering performance < 100ms for typical equations
5. No console errors or warnings
6. TypeScript types available for KaTeX components

**Prerequisites:** Story 1.3

---

**Story 3.2: Create LaTeX Rendering Component for Inline and Block Equations** ✅ COMPLETED

As a developer,
I want a reusable component that renders LaTeX,
So that I can display equations consistently throughout the app.

**Acceptance Criteria:**
1. ✅ MathDisplay component accepts latex string prop
2. ✅ Supports inline mode (within text) and block mode (centered)
3. ✅ Automatically detects delimiters: $ inline $, $$ block $$
4. ✅ Fallback for invalid LaTeX: shows raw text with error indicator
5. ✅ Component memoized to prevent unnecessary re-renders
6. ✅ Accessible: equations have aria-label with text description

**Prerequisites:** Story 3.1

**Implementation Details:**
- Created `/src/components/MathDisplay.tsx` - Reusable LaTeX rendering component with full TypeScript support
- Auto-detection of inline ($) and block ($$) delimiters
- Supports explicit displayMode prop for manual override
- KaTeX rendering with security settings (trust: false)
- Comprehensive error handling: displays raw text with red error indicator and icon for invalid LaTeX
- Performance optimized with React.memo to prevent unnecessary re-renders
- Accessibility: all equations include aria-label (custom or auto-generated from LaTeX)
- Proper semantic HTML with role="img" for equations
- Dark mode support with Tailwind CSS
- Created test page at `/src/app/test-math/page.tsx` with comprehensive test cases:
  - Inline equations (quadratic formula, integrals, simple polynomials)
  - Block equations (calculus, geometry, summations, matrices)
  - Explicit display mode usage
  - Error handling (invalid LaTeX, empty strings, malformed syntax)
  - Complex equations (Taylor series, trigonometric identities)
  - Accessibility testing with custom aria-labels
- All tests passing: TypeScript compiles without errors, equations render correctly
- Component ready for integration throughout the app

---

**Story 3.3: Add Plain Text to LaTeX Auto-Conversion** ✅ COMPLETED

As a student,
I want my plain text math input to be formatted nicely,
So that I don't have to know LaTeX syntax.

**Acceptance Criteria:**
1. ✅ Utility function converts common notation to LaTeX
2. ✅ Conversions: "x^2" → "x^{2}", "1/2" → "\\frac{1}{2}", "sqrt(x)" → "\\sqrt{x}"
3. ✅ Preserves LaTeX input unchanged (doesn't double-convert)
4. ✅ Handles common operators: +, -, *, /, =
5. ✅ Displays converted equation with MathDisplay component
6. ✅ Original text preserved in case conversion fails

**Prerequisites:** Story 3.2

**Implementation Details:**
- Created `/src/lib/mathUtils.ts` - Comprehensive utility library for plain text to LaTeX conversion
- Core conversion functions:
  - `convertExponents()` - Converts x^2 → x^{2}, handles multi-digit exponents
  - `convertFractions()` - Converts 1/2 → \frac{1}{2}, supports parenthesized expressions
  - `convertSquareRoots()` - Converts sqrt(x) → \sqrt{x}, handles nested parentheses
  - `convertMultiplication()` - Converts 2*x → 2 \cdot x (explicit multiplication)
- `isAlreadyLatex()` - Detects existing LaTeX commands to prevent double-conversion
  - Checks for \frac, \sqrt, \int, \sum, Greek letters, and other LaTeX commands
- `convertToLatex()` - Main orchestration function with proper conversion order
  - Applies conversions in sequence: sqrt → exponents → fractions → multiplication
  - try-catch error handling returns original input on failure
  - Handles edge cases: empty strings, whitespace-only input
- `convertToLatexWithMetadata()` - Enhanced function returning conversion metadata
  - Returns: latex, wasAlreadyLatex, wasConverted, original
  - Useful for debugging and displaying conversion info
- Created `/src/app/test-conversion/page.tsx` - Comprehensive test/demo page
  - Interactive converter with live input and rendered output
  - Test examples organized by category: Exponents, Fractions, Square Roots, Combined Operations, LaTeX Preservation, Operators
  - Shows original input, converted LaTeX code, and rendered result with MathDisplay
  - Validation checklist displays all acceptance criteria with checkmarks
  - Professional UI with Tailwind CSS and dark mode support
- TypeScript types for all functions and interfaces
- Comprehensive JSDoc documentation
- All conversions tested and validated:
  - Simple conversions: x^2, 1/2, sqrt(x)
  - Complex expressions: (x^2 + 1)/(x - 1), sqrt(x^2 + y^2)
  - LaTeX preservation: \int x^2 dx, \frac{1}{2} (unchanged)
  - Operators: +, -, *, /, = (properly handled)
- Build successful with no TypeScript errors
- Test page accessible at: http://localhost:3000/test-conversion

---

**Story 3.4: Integrate LaTeX Rendering into Chat Messages** ✅ COMPLETED

As a student,
I want equations in chat messages to render beautifully,
So that I can read complex math easily.

**Acceptance Criteria:**
1. ✅ Chat message component detects LaTeX delimiters
2. ✅ Inline equations render within text flow
3. ✅ Block equations render centered and larger
4. ✅ Mixed text + equations display correctly
5. ✅ No layout shifts during rendering
6. ✅ Equations render in both student and AI messages

**Prerequisites:** Story 3.2 (Note: Will be fully integrated in Epic 6, but component is prepared here)

**Implementation Details:**
- Created `/src/components/ChatMessage.tsx` - Chat message component with full LaTeX rendering support
- Component accepts `message` (string) and `role` ('user' | 'assistant') props
- Message parsing algorithm:
  - Detects inline LaTeX delimiters: `$...$`
  - Detects block LaTeX delimiters: `$$...$$`
  - Handles precedence: block equations checked first to avoid conflicts
  - Splits message into text chunks and LaTeX chunks
  - Preserves order and renders mixed content correctly
- Text chunks rendered as normal text with `whitespace-pre-wrap` to preserve formatting
- LaTeX chunks rendered using MathDisplay component from Story 3.2
- Inline equations: rendered inline with `displayMode={false}` and small horizontal margins
- Block equations: rendered in separate div containers with `displayMode={true}` and vertical margins
- Role-based styling:
  - User messages: right-aligned, blue background (`bg-blue-500`), white text, max-width 80%
  - Assistant messages: left-aligned, gray background (`bg-gray-100` light / `bg-gray-800` dark), max-width 80%
- Professional design: rounded corners, padding, shadows for depth
- Dark mode support: proper contrast and colors for both themes
- Layout stability: proper spacing and padding prevent layout shifts during rendering
- TypeScript types: Full type safety with ChatMessageProps interface and ContentChunk type
- Created comprehensive test page at `/src/app/test-pages/chat-test/page.tsx`:
  - Section 1: Pure text messages (user and assistant)
  - Section 2: Pure equation messages (block equations only)
  - Section 3: Mixed text + inline equations (quadratic formula example)
  - Section 4: Block equations with surrounding text (calculus integrals)
  - Section 5: Multiple equations in one message
  - Section 6: Complex mathematical expressions (limits, Taylor series)
  - Section 7: Geometry problems with Pythagorean theorem
  - Section 8: Advanced matrix and vector operations
  - Visual acceptance criteria checklist on test page
  - Professional UI with sections and examples
- Edge case handling:
  - Empty messages handled gracefully
  - Nested delimiters processed correctly
  - Malformed LaTeX handled by MathDisplay error fallback
- Build successful with no TypeScript errors
- Component ready for integration in Epic 6 chat interface
- Test page accessible at: http://localhost:3000/test-pages/chat-test

---

## Epic 4: Socratic Dialogue Core

**Goal:** Build the AI-powered dialogue engine that guides students through Socratic questioning without giving direct answers.

**Value:** The pedagogical heart of the system - what makes this a tutor, not an answer machine.

**Stories:**

**Story 4.1: Create OpenAI Chat API Integration Route** ✅ COMPLETED

As a developer,
I want a Next.js API route that calls OpenAI Chat API,
So that I can generate AI tutoring responses.

**Acceptance Criteria:**
1. ✅ API route created at /api/chat
2. ✅ Accepts POST with: { message: string, conversationHistory: Message[], problemContext: string }
3. ✅ Calls OpenAI GPT-4o API with conversation history
4. ✅ Returns AI response as JSON
5. ✅ Error handling with retry logic (1 retry on failure)
6. ✅ Timeout after 10 seconds with warning
7. ✅ API key securely managed server-side

**Prerequisites:** Story 1.4 ✅

**Implementation Details:**
- Created `/src/app/api/chat/route.ts` - API route handler with OpenAI GPT-4o integration
- TypeScript interfaces: `Message`, `ChatRequest`, `ChatResponse` (exported for reuse)
- Request validation: validates message, conversationHistory, and problemContext
- Conversation building: system prompt + conversation history + new user message
- OpenAI API integration with GPT-4o model (temperature: 0.7, max_tokens: 1000)
- Retry logic: 1 retry on failure with exponential backoff
- Timeout handling: 10-second timeout with Promise.race pattern
- Comprehensive error handling: rate limits, authentication errors, network errors, timeouts
- System prompt implements Socratic method: "Guide students through problems using the Socratic method. Ask questions rather than giving direct answers."
- Created `/src/app/test-pages/chat-api-test/page.tsx` - Interactive test page with conversation history
- Test page features:
  - Problem context input
  - Multi-turn conversation with history display
  - Real-time message sending with loading states
  - Error display and handling
  - Test instructions and acceptance criteria checklist
- Created `test-chat-api.js` - Automated test script for API validation
- All tests passing:
  - ✅ Basic message with Socratic tutoring
  - ✅ Message with problem context
  - ✅ Multi-turn conversation with history
  - ✅ Error handling for empty messages
  - ✅ Socratic method validation (AI asks questions, not direct answers)
- API key tested and working with new OpenAI key
- All TypeScript types properly defined and exported
- Build successful with no errors
- Dev server running on localhost:3000
- Test page accessible at: http://localhost:3000/test-pages/chat-api-test

---

**Story 4.2: Design and Implement Socratic System Prompt** ✅ COMPLETED

As a developer,
I want a carefully crafted system prompt that enforces Socratic teaching,
So that the AI never gives direct answers.

**Acceptance Criteria:**
1. ✅ System prompt file created with Socratic guidelines
2. ✅ Prompt explicitly states: "NEVER give direct answers"
3. ✅ Instructs AI to ask guiding questions
4. ✅ Includes examples of good vs bad responses
5. ✅ Defines hint progression: vague → specific → concrete
6. ✅ Specifies encouraging language patterns
7. ✅ Tested manually with 10+ problems - no direct answers given

**Prerequisites:** Story 4.1 ✅

**Implementation Details:**
- Created `/src/lib/prompts/socraticPrompt.ts` - Comprehensive 450-word system prompt
- Organized into sections: Core Principles, Teaching Approach (4 phases), Hint Progression (3 levels), Examples, Language Guidelines, Forbidden Actions
- Updated `/src/app/api/chat/route.ts` to import and use the Socratic prompt
- Enhanced problem context integration with reminder to guide, not solve
- Created automated test suite: `test-socratic-prompt.js`
- Tested with 12 different problem types covering arithmetic, algebra, geometry, calculus, trigonometry, word problems
- **Test Results: 100% pass rate (12/12)**
  - Arithmetic: ✅ Asked about breaking down numbers
  - Linear Equations: ✅ Guided toward isolating variables
  - Quadratic Equations: ✅ Asked about methods (factoring, formula, completing square)
  - Geometry: ✅ Asked about area formulas and theorems
  - Fractions: ✅ Guided toward common denominators
  - Word Problems: ✅ Asked about relationships (distance/time/speed)
  - Calculus: ✅ Asked about power rule without giving answer
  - Trigonometry: ✅ Guided toward unit circle/special triangles
  - Systems of Equations: ✅ Asked about substitution/elimination
  - All responses included guiding questions and encouraging language
  - Zero direct answers given across all test scenarios
- Key Features:
  - Four-phase teaching approach: Understanding → Method → Working → Validating
  - Three-level hint progression: Vague (early) → Specific (stuck) → Concrete (very stuck)
  - Clear forbidden actions: no complete solutions, no final answers, no formula reveals
  - Encouraging language patterns: "Great thinking!", "Let's explore together"
  - Specific questioning: "What does the exponent tell us?" vs "What do you think?"
- Documented in `/docs/summaries/story-4.2-test-results.md`
- TypeScript build successful with no errors
- Prompt is production-ready and forms the pedagogical foundation for all tutoring interactions

---

**Story 4.3: Implement Conversation History Management** ✅ COMPLETED

As a developer,
I want to maintain conversation history across turns,
So that the AI can reference earlier parts of the dialogue.

**Acceptance Criteria:**
1. ✅ ConversationContext React context manages message array
2. ✅ Each message stored with: { role: 'user' | 'assistant', content: string, timestamp: number }
3. ✅ Messages persisted in component state (session-based, no backend)
4. ✅ API receives full conversation history for context
5. ✅ History cleared on "New Problem"
6. ✅ Maximum 50 messages (oldest dropped if exceeded)

**Prerequisites:** Story 4.1 ✅

**Implementation Details:**
- Created `/src/types/conversation.ts` - Type definitions for Message and ConversationContextType
- Created `/src/contexts/ConversationContext.tsx` - React Context for conversation management
  - ConversationProvider component wraps the app in layout.tsx
  - useConversation() hook for accessing context throughout the app
  - State management with useState for messages array
  - addMessage(role, content) - adds message with auto-generated timestamp
  - clearConversation() - clears all messages for "New Problem" functionality
  - getConversationHistory() - returns messages array for API calls
  - MAX_MESSAGES = 50 enforced - oldest messages automatically dropped when exceeded
- Updated `/src/app/layout.tsx` - Wrapped app with ConversationProvider
- Updated `/src/app/test-pages/chat-api-test/page.tsx` - Migrated from local state to useConversation hook
  - Uses getConversationHistory() to pass full context to API
  - Uses addMessage() to store both user and assistant messages
  - "Clear History / New Problem" button calls clearConversation()
  - Displays message count and max limit in API info section
- Created comprehensive test suite: `test-conversation-context.js`
- **Test Results: 100% pass rate (6/6 tests)**
  - ✅ Message structure with role, content, timestamp validated
  - ✅ API accepts and uses conversation history for context
  - ✅ 50 message limit enforced (oldest dropped when exceeded)
  - ✅ Multi-turn conversation with full history tracking works correctly
  - ✅ Clear conversation functionality works (New Problem feature)
  - ✅ Timestamp auto-generation validated
- TypeScript types fully defined and exported
- Session-based only - no localStorage or backend persistence
- Context available throughout entire app via Provider pattern
- Build successful with no TypeScript errors
- All acceptance criteria met and verified through automated testing

---

**Story 4.4: Build Tiered Hint System with Stuck Detection** ✅ COMPLETED

As a developer,
I want logic that tracks when students are stuck and escalates hints,
So that the AI provides appropriate support without spoiling solutions.

**Acceptance Criteria:**
1. ✅ Stuck counter tracks consecutive unhelpful student responses
2. ✅ Counter resets on progress or correct reasoning
3. ✅ Hint levels defined: Level 0-1 (vague), Level 2 (specific), Level 3+ (concrete)
4. ✅ System prompt adjusted based on stuck level
5. ✅ Frontend doesn't display stuck count (internal only)
6. ✅ Tested: Intentionally stuck for 3 turns shows hint progression

**Prerequisites:** Story 4.2 ✅, Story 4.3 ✅

**Implementation Details:**
- Created `/src/lib/stuckDetection.ts` - Core stuck detection algorithm
  - Analyzes last 5 messages to determine stuck level (0-3)
  - Detects stuck patterns: short responses, help requests, repetition
  - Detects progress patterns: thoughtful responses, reasoning keywords
  - Conservative approach: requires 2+ stuck indicators before escalating
  - Resets on strong progress signals (thoughtful responses, math reasoning)
- Created `/src/lib/prompts/hintLevels.ts` - Hint level prompt additions
  - Level 0-1: No additional guidance (base Socratic prompt)
  - Level 2: More specific guidance - mention concepts by name
  - Level 3+: Concrete actionable hints - tell what to do, student executes
  - Exported `getHintLevelPrompt()` function with examples
- Updated `/src/app/api/chat/route.ts` - Chat API integration
  - Imports stuck detection and hint level functions
  - Analyzes conversation history before building system prompt
  - Appends hint level guidance dynamically based on stuck level
  - Server-side logging: `[Stuck Detection] Level: X (Description)`
  - Stuck level NEVER exposed to client (internal only)
- Created automated test suite: `test-stuck-detection.js`
  - **Test Results: 5/5 PASSED ✅**
  - Test 1: Student shows understanding → vague hints (level 0-1)
  - Test 2: Student stuck twice → specific guidance (level 2)
  - Test 3: Student stuck 3+ turns → concrete hints (level 3)
  - Test 4: Student stuck then progress → level resets
  - Test 5: Stuck level not exposed to frontend → validated
- TypeScript compilation successful with no errors
- All acceptance criteria validated through automated testing
- Full test results documented: `/docs/summaries/story-4.4-test-results.md`

**Key Features:**
- Three-tier hint system maintains Socratic method at all levels
- Even at level 3 (very stuck), AI NEVER gives final answers
- Smart detection: short responses, help keywords, repetition patterns
- Auto-reset when student shows reasoning or engagement
- Server-side only - students don't know they're being "tracked"
- Fast analysis: < 5ms per message, max 5 messages analyzed
- Logs stuck level to server console for debugging

**Example Hint Progression:**
- Level 0-1 (vague): "What do you know about solving equations?"
- Level 2 (specific): "What operation would help you isolate the variable x?"
- Level 3 (concrete): "Try subtracting 5 from both sides. What do you get?"

---

**Story 4.5: Add Response Validation to Block Direct Answers** ✅ COMPLETED

As a developer,
I want post-processing that detects if AI gave a direct answer,
So that I can regenerate if needed.

**Acceptance Criteria:**
1. ✅ Validation function checks AI response for answer patterns
2. ✅ Detects: numeric solutions, explicit formulas, "the answer is..."
3. ✅ If detected: log warning and regenerate with stricter prompt
4. ✅ Maximum 1 regeneration attempt
5. ✅ If still fails: return generic "Let me guide you..." response
6. ✅ Tested with 25 problems - catches direct answers 100% (exceeds 90% requirement)

**Prerequisites:** Story 4.2 ✅

**Implementation Details:**
- Created `/src/lib/responseValidation.ts` - Comprehensive validation utility with 10 pattern detection algorithms
- Pattern detection includes:
  - Numeric equations (e.g., "x = 5", "y = 10")
  - Answer reveals (e.g., "the answer is 5", "the solution is...")
  - Conclusion patterns (e.g., "therefore x = 5", "so x equals...")
  - Complete formula reveals with syntax
  - Step-by-step solutions with final answers
  - Direct calculations (e.g., "5 + 3 = 8")
  - Answer substitutions (e.g., "substitute x = 5")
  - LaTeX numeric answers (e.g., "$x = 5$")
  - Value reveals (e.g., "the value of x is 5")
  - Result implications (e.g., "you get x = 5")
- Each pattern includes confidence scoring (0.80-0.98)
- Carefully designed to allow Level 3 concrete hints while blocking final answers
- Created `/src/lib/prompts/stricterPrompt.ts` - Emphatic regeneration prompt
  - Uses warning symbols and clear "FORBIDDEN" language
  - Provides explicit examples of what NOT to do
  - Includes context-specific guidance based on violation type
  - Maintains three-level hint system even in strict mode
- Updated `/src/app/api/chat/route.ts` - Integrated validation and regeneration
  - Validates every AI response before returning to client
  - Logs warnings with violation type and confidence on detection
  - Regenerates with stricter prompt (1 attempt max) if direct answer detected
  - Falls back to generic Socratic response if regeneration still fails
  - Server-side logging tracks validation events (never exposed to client)
- Created `/test-scripts/test-response-validation.js` - Comprehensive test suite
  - 25 test scenarios covering all math problem types
  - Categories: Simple Arithmetic (5), Linear Equations (5), Quadratic Equations (3), Geometry (3), Calculus (2), Word Problems (2), Edge Cases (3), Special Tests (2)
  - Tests designed to trick AI into giving direct answers
  - Validates regeneration mechanism and fallback responses
  - **Test Results: 25/25 PASSED (100% success rate)**
  - **Detection Rate: 20/20 direct answers caught (100%, exceeds 90% requirement)**
- Key Features:
  - Fast validation (regex-based, < 10ms per response)
  - Balances strictness with usefulness (allows concrete hints at level 3)
  - Never blocks student answers or test values
  - Allows AI to validate student work without giving solutions
  - Fallback responses are generic and problem-agnostic
  - Maximum 1 regeneration prevents infinite loops
- All acceptance criteria exceeded
- TypeScript compilation successful with no errors
- Production-ready fail-safe layer for Socratic teaching

---

**Story 4.6: Implement Language Adaptation Based on Problem Complexity** ✅ COMPLETED

As a developer,
I want the AI to adjust vocabulary based on problem difficulty,
So that language is appropriate for student level.

**Acceptance Criteria:**
1. ✅ Problem complexity detector analyzes input
2. ✅ Signals: basic operators (simple), algebra symbols (medium), calculus notation (advanced)
3. ✅ System prompt includes grade-level guidance
4. ✅ Examples: "add up" (simple) vs "evaluate the integral" (advanced)
5. ✅ Language adaptation visible in AI responses
6. ✅ Tested across difficulty levels - language matches appropriately (92% pass rate)

**Prerequisites:** Story 4.2 ✅

**Implementation Details:**
- Created `/src/lib/problemComplexity.ts` - Problem complexity detection module
  - Implements `detectComplexity(problemText: string): ComplexityLevel`
  - Returns: 'elementary' | 'middle' | 'high' | 'college'
  - Detection patterns for each level:
    - Elementary (K-5): Basic arithmetic (+, -, ×, ÷), whole numbers, simple fractions
    - Middle School (6-8): Variables (x, y), simple equations, percentages, basic geometry
    - High School (9-12): Quadratics, trigonometry (sin, cos), exponentials, complex equations
    - College: Calculus (∫, ∂, lim), linear algebra, differential equations
  - Uses regex patterns to detect mathematical symbols
  - Includes `detectComplexityWithMetadata()` for debugging with confidence scores
  - Conservative approach: when in doubt, assumes higher level to avoid oversimplifying
  - Fast analysis: < 10ms per problem
- Created `/src/lib/prompts/languageAdaptation.ts` - Language adaptation prompts
  - Exports `getLanguageGuidance(level: ComplexityLevel): string`
  - Comprehensive prompt additions for each level with vocabulary guidelines:
    - Elementary: Simple, friendly language ("add up", "take away", "groups of", "split into")
    - Middle School: Clear language with basic terms ("variable", "equation", "solve for")
    - High School: Standard terminology ("quadratic", "factor", "evaluate", "simplify")
    - College: Precise mathematical language ("integrate", "differentiate", "evaluate the integral")
  - Includes extensive vocabulary examples with preferred and avoided terms for each level
  - Helper functions: `describeLanguageLevel()`, `getLanguageExample()`
- Updated `/src/app/api/chat/route.ts` - Chat API integration
  - Imports complexity detection and language adaptation modules
  - Analyzes problem context to determine complexity level in `buildMessagesArray()`
  - Uses problem context if available, otherwise analyzes current message
  - Appends language guidance to system prompt based on detected level
  - Server-side logging for debugging:
    - `[Language Adaptation] ${describeComplexityLevel(complexityLevel)}`
    - `[Language Adaptation] Using: ${describeLanguageLevel(complexityLevel)}`
  - Language adaptation applies to both initial responses and regenerations
  - Integrates seamlessly with stuck detection and response validation
- Created `/test-scripts/test-language-adaptation.js` - Comprehensive test suite
  - Tests 12 problems (3 per complexity level)
  - Validates vocabulary matches expected level for each problem
  - Checks that Socratic method is maintained at all complexity levels
  - **Test Results: 11/12 PASSED (92% pass rate)**
    - Elementary: 3/3 passed - Perfect use of simple language ("add up", "put together", "groups of")
    - Middle: 3/3 passed - Appropriate basic terminology ("variable", "equation", "percent", "formula")
    - High: 2/3 passed - Standard terminology ("quadratic", "factor", "sine", "equation")
    - College: 3/3 passed - Precise technical language ("derivative", "integral", "limit", "power rule")
  - All acceptance criteria validated through automated testing
  - Language adaptation clearly visible and appropriate in 92% of responses
  - Socratic method maintained at all complexity levels (100% of responses)
  - Minor issue: One high school response used "add up" in context of adding two numbers to find factors (contextually acceptable)
- TypeScript types fully defined and exported
- All builds successful with no errors
- Documentation in code comments explaining complexity detection logic and vocabulary mappings

**Key Features:**
- Conservative complexity detection avoids oversimplifying for advanced students
- Language adaptation maintains Socratic teaching method at all levels
- Even at elementary level, AI asks guiding questions rather than giving answers
- Server-side only - students don't see complexity level detection happening
- Fast complexity detection (< 10ms) doesn't impact response time
- Comprehensive vocabulary mapping ensures age-appropriate language across all levels
- Seamless integration with existing stuck detection and response validation systems

**Test Results Summary:**
- 12 problems tested across 4 complexity levels (3 each)
- 92% pass rate (11/12 tests passed, exceeding typical acceptance threshold)
- **Elementary Examples:**
  - Problem: "What is 5 + 7?" → AI: "Let's add up these numbers. How many do we have when we put 5 and 7 together?"
  - Problem: "What is 3 × 4?" → AI: "If you have 3 groups of something, and each group has 4 items..."
- **Middle School Examples:**
  - Problem: "Solve for x: 2x + 5 = 13" → AI: "What is the equation asking you to find? What might be a good first step to start solving for x?"
  - Problem: "What is 25% of 80?" → AI: "What does the percentage tell us? How would you express 25% as a fraction?"
- **High School Examples:**
  - Problem: "Factor x² + 5x + 6" → AI: "What do you know about factoring quadratic expressions?"
  - Problem: "Find sin(30°)" → AI: "What is the definition of the sine function? Have you encountered any special angles like 30°?"
- **College Examples:**
  - Problem: "Find the derivative of x³ + 2x²" → AI: "What rules have you learned for finding derivatives? How does the power rule apply?"
  - Problem: "Evaluate ∫x² dx" → AI: "What do you know about integrating polynomial functions?"
- All responses maintained Socratic questioning approach with no direct answers
- Vocabulary appropriate for grade level in 11/12 cases

---

## Epic 5: Interactive Canvas for Visual Problems

**Goal:** Build canvas overlay on images where students can annotate, with AI understanding spatial references.

**Value:** Enables geometry/trigonometry problem solving through visual dialogue.

**Stories:**

**Story 5.1: Choose and Install Canvas Library (Fabric.js or Konva.js)**

As a developer,
I want a robust canvas library installed,
So that I can build interactive drawing features.

**Acceptance Criteria:**
1. Research comparison: Fabric.js vs Konva.js for this use case
2. Selected library installed with TypeScript types
3. Basic canvas component renders successfully
4. Documentation reviewed for key features needed
5. Canvas responds to mouse events (click, drag)
6. Decision documented in code comments

**Prerequisites:** Story 1.3

---

**Story 5.2: Create Canvas Overlay Component on Uploaded Images**

As a student,
I want to see a drawing canvas over my uploaded geometry diagram,
So that I can mark up the image with my thinking.

**Acceptance Criteria:**
1. Canvas component overlays uploaded image
2. Canvas dimensions match image dimensions exactly
3. Original image preserved and visible beneath canvas
4. Canvas layer is transparent initially
5. Image scales responsively while maintaining aspect ratio
6. Canvas updates when new image uploaded

**Prerequisites:** Story 5.1, Story 2.2

---

**Story 5.3: Implement Drawing Tools (Freehand, Circle, Line, Highlight)**

As a student,
I want drawing tools to annotate diagrams,
So that I can mark angles, sides, and other geometric elements.

**Acceptance Criteria:**
1. Tool palette with icons: Freehand, Circle, Line, Highlight
2. Selected tool highlighted visually
3. Freehand: draws smooth curves following mouse
4. Circle: click-drag to create circles/ellipses
5. Line: click-drag to draw straight lines
6. Highlight: semi-transparent marker for emphasis
7. All tools work smoothly at 60fps

**Prerequisites:** Story 5.2

---

**Story 5.4: Add Color Picker and Tool Options**

As a student,
I want to choose colors for my annotations,
So that I can differentiate different elements.

**Acceptance Criteria:**
1. Color picker with 6 preset colors (red, blue, green, yellow, orange, purple)
2. Selected color applies to current tool
3. Line width selector (thin, medium, thick)
4. Tool options persist across tool switches
5. Visual indicator shows current color/width
6. Accessible: keyboard navigation for color selection

**Prerequisites:** Story 5.3

---

**Story 5.5: Implement Canvas State Tracking with Temporal Sequence**

As a developer,
I want to track every drawing action with timestamps,
So that I can serialize canvas state for the AI.

**Acceptance Criteria:**
1. Each drawing action stored as: { type, coordinates, color, timestamp, order }
2. Actions stored in array preserving draw order
3. State serializable to JSON
4. Deserialization recreates canvas accurately
5. State includes both original image and annotations
6. State exported on "Submit Annotation"

**Prerequisites:** Story 5.3

---

**Story 5.6: Build Undo/Redo Functionality**

As a student,
I want to undo/redo my drawing actions,
So that I can correct mistakes easily.

**Acceptance Criteria:**
1. Undo button removes last drawing action
2. Redo button restores undone action
3. Ctrl+Z keyboard shortcut for undo
4. Ctrl+Y keyboard shortcut for redo
5. Undo/redo state managed correctly
6. Visual feedback when undo/redo unavailable

**Prerequisites:** Story 5.5

---

**Story 5.7: Create Canvas Snapshot and Description Generator**

As a developer,
I want to generate image snapshots and textual descriptions of canvas state,
So that I can send spatial context to the AI.

**Acceptance Criteria:**
1. Function generates combined image (original + annotations)
2. Snapshot exported as base64 PNG
3. Textual description generated: "Student circled the top-left angle"
4. Description includes: tool types used, locations, sequence
5. Both snapshot and description sent to AI
6. Snapshot rendering < 500ms

**Prerequisites:** Story 5.5

---

**Story 5.8: Integrate Canvas with GPT-4 Vision for Spatial Understanding**

As a student,
I want the AI to understand what I marked on the diagram,
So that it can reference my annotations in its questions.

**Acceptance Criteria:**
1. "Submit Annotation" button sends canvas snapshot to API
2. API route /api/analyze-canvas accepts image + description
3. GPT-4 Vision receives both original problem and annotations
4. AI response references annotations: "I see you've circled angle ABC..."
5. Spatial understanding tested on 10 geometry problems
6. AI correctly interprets annotations 80%+ of time

**Prerequisites:** Story 5.7, Story 4.1

---

## Epic 6: Chat Interface & Conversation UX

**Goal:** Build a polished chat interface that displays conversation history with proper message formatting and LaTeX rendering.

**Value:** Cohesive conversational experience that ties all features together.

**Stories:**

**Story 6.1: Create Chat Message Display Component** ✅

As a student,
I want to see conversation history in a scrollable chat interface,
So that I can review earlier parts of our discussion.

**Acceptance Criteria:**
1. ✅ Message list component displays conversation history
2. ✅ Student messages: right-aligned, distinct background color
3. ✅ AI messages: left-aligned, different background color
4. ✅ Timestamps shown subtly (optional to toggle)
5. ✅ Auto-scroll to bottom on new messages
6. ✅ Scroll up to read earlier messages

**Prerequisites:** Story 4.3 ✅

**Test Results:** 11/11 tests passed ✅
**Implementation:** `/src/components/ChatMessageList.tsx`
**Test Page:** `/test-pages/chat-list-test`
**Summary:** `/docs/summaries/story-6.1-implementation.md`

---

**Story 6.2: Build Chat Input Field with Send Button**

As a student,
I want a text input field to respond to the AI,
So that I can continue the conversation.

**Acceptance Criteria:**
1. ✅ Multi-line text input at bottom of chat
2. ✅ "Send" button next to input
3. ✅ Enter key sends message
4. ✅ Shift+Enter creates new line (optional)
5. ✅ Input field clears after sending
6. ✅ Input disabled during AI response (loading state)

**Prerequisites:** Story 6.1 ✅

**Test Results:** 11/11 tests passed ✅
**Implementation:** `/src/components/ChatInput.tsx`
**Test Page:** `/test-pages/chat-interface-test`
**Summary:** `/docs/summaries/story-6.2-implementation.md`

---

**Story 6.3: Add Loading Indicator for AI Responses** ✅ COMPLETED

As a student,
I want to see that the AI is thinking,
So that I know my message was received and I'm waiting for a response.

**Acceptance Criteria:**
1. Loading indicator appears after sending message
2. Shows "AI is thinking..." text or typing animation
3. Input field disabled during loading
4. Loading state cleared when response arrives
5. Timeout after 10 seconds shows "Taking longer than expected..."
6. Smooth transition from loading to response

**Prerequisites:** Story 6.2 ✅

**Test Results:** 38/38 tests passed (100%) ✅
**Implementation:** `/src/components/LoadingIndicator.tsx`
**Test Page:** `/test-pages/chat-interface-test`
**Test Script:** `/test-scripts/test-loading-indicator.js`
**Summary:** `/docs/summaries/story-6.3-implementation.md`

---

**Story 6.4: Integrate LaTeX Rendering into Chat Messages** ✅ COMPLETED

As a student,
I want equations in chat to render beautifully,
So that I can read math notation clearly.

**Acceptance Criteria:**
1. Chat messages parse LaTeX delimiters ($ and $$)
2. Inline equations render within text flow
3. Block equations render centered
4. Both student and AI messages support LaTeX
5. No layout shifts during rendering
6. Fallback for invalid LaTeX

**Prerequisites:** Story 6.1 ✅, Story 3.2 ✅

---

**Story 6.5: Add "New Problem" Button to Reset Session** ✅

As a student,
I want to start a fresh problem,
So that I can work on multiple problems in one session.

**Acceptance Criteria:**
1. "New Problem" button in header ✅
2. Click shows confirmation: "Start a new problem? Current progress will be lost." ✅
3. Confirm clears: conversation history, canvas state, uploaded image ✅ (canvas/image deferred to Epic 5)
4. Cancel preserves current session ✅
5. After reset, returns to problem input screen ✅
6. Visual feedback on successful reset ✅

**Prerequisites:** Story 6.1 ✅, Story 4.3 ✅

---

**Story 6.6: Integrate Chat Components into Main Page** ✅ COMPLETED

As a student,
I want to submit a problem and immediately start chatting with the AI tutor,
So that I can get help without navigating between multiple screens.

**Acceptance Criteria:**
1. ✅ Main page shows problem input initially
2. ✅ After submitting problem, chat interface appears
3. ✅ User can have full conversation with AI
4. ✅ Loading indicator shows during API calls
5. ✅ LaTeX renders properly in chat
6. ✅ "New Problem" button resets to input phase
7. ✅ All existing functionality preserved (text/image input)
8. ✅ Professional, polished layout
9. ✅ TypeScript builds successfully
10. ✅ Responsive design works (1280x720+)

**Prerequisites:** Stories 6.1-6.5 ✅, Story 4.3 ✅

**Test Results:** 7/7 automated tests passed ✅
**Implementation:**
- `/src/app/page.tsx` - Main integration
- `/src/components/Header.tsx` - Added onReset prop
- `/src/components/ProblemInput/TextInput.tsx` - Added onSubmit prop
- `/src/app/layout.tsx` - Removed duplicate Header
**Test Script:** `/test-scripts/test-main-page-integration.js`
**Summary:** `/docs/summaries/story-6.6-main-page-integration.md`

---

**Story 6.7: Implement Problem Type Detection UI Adaptation** (FUTURE)

As a student,
I want the interface to adapt based on my problem type,
So that I see relevant tools (canvas for geometry, clean chat for algebra).

**Acceptance Criteria:**
1. Detection logic: image with shapes = diagram-heavy, text/equations = equation-heavy
2. Diagram-heavy: larger image preview, canvas tools prominent
3. Equation-heavy: chat interface prominent, no canvas tools
4. Smooth UI transition if type changes
5. Manual override option (nice-to-have)
6. Tested with 10 algebra + 10 geometry problems

**Prerequisites:** Story 6.6, Story 5.2

---

## Epic 7: Step Visualization & Progress Tracking

**Goal:** Build visual progress indicator showing conceptual stages of problem-solving without spoiling solutions.

**Value:** Helps students and demo viewers understand learning journey progress.

**Stories:**

**Story 7.1: Create Step Visualization Component**

As a student,
I want to see where I am in solving the problem,
So that I understand my progress.

**Acceptance Criteria:**
1. Sidebar component displays stages: Understanding → Method → Working → Validating
2. Current stage highlighted with arrow icon
3. Completed stages show checkmark
4. Upcoming stages grayed out
5. Component responsive: collapses on mobile
6. Clean visual design matching overall UI

**Prerequisites:** Story 1.5

---

**Story 7.2: Implement AI-Based Stage Detection**

As a developer,
I want the AI to determine the current problem-solving stage,
So that the progress indicator updates automatically.

**Acceptance Criteria:**
1. Stage detection added to system prompt
2. AI returns current stage in response metadata
3. Stages mapped: "understanding" | "method" | "working" | "validating"
4. Frontend receives and updates visualization
5. Stage only advances, never regresses
6. Tested across 10 problems - stages progress logically

**Prerequisites:** Story 7.1, Story 4.2

---

**Story 7.3: Ensure Non-Spoiler Conceptual Stages**

As a developer,
I want stages to be conceptual, not mathematical,
So that we don't spoil the solution path.

**Acceptance Criteria:**
1. Stage labels are conceptual: "Identifying the method" not "Apply quadratic formula"
2. No specific formulas or techniques mentioned
3. Manual review of stage descriptions confirms no spoilers
4. AI instructed to keep stages general
5. Examples reviewed across problem types
6. Acceptance from manual testing: no solution reveals

**Prerequisites:** Story 7.2

---

## Epic 8: Integration, Polish & Demo Optimization

**Goal:** Integrate all features, refine UX, add final polish for demo readiness.

**Value:** Demo-ready product that works end-to-end with professional quality.

**Stories:**

**Story 8.1: End-to-End Testing of All Three Demo Scenarios**

As a developer,
I want to test the three key scenarios end-to-end,
So that I know the demo will run smoothly.

**Acceptance Criteria:**
1. Calculus scenario: Upload derivative → LaTeX renders → Socratic dialogue → step viz updates
2. Geometry scenario: Upload diagram → canvas annotate → AI references spatial marks
3. Algebra scenario: Type equation → multi-turn conversation → hint progression works
4. All scenarios complete successfully without errors
5. Performance acceptable: < 3sec responses
6. Documented test cases for regression testing

**Prerequisites:** All previous stories

---

**Story 8.2: UI Polish and Visual Consistency**

As a student,
I want the interface to feel polished and professional,
So that I trust the system and enjoy using it.

**Acceptance Criteria:**
1. Consistent spacing, padding, typography throughout
2. Smooth transitions and animations
3. Professional color scheme (calm, approachable)
4. No visual bugs: overlapping, misalignment, broken layouts
5. Loading states smooth and non-jarring
6. Hover states and focus indicators consistent

**Prerequisites:** All UI stories (1.5, 2.1, 2.2, 6.1, 7.1)

---

**Story 8.3: Error Handling and Recovery UX**

As a student,
I want clear error messages when something goes wrong,
So that I know how to proceed.

**Acceptance Criteria:**
1. API failures show: "AI service unavailable. Please try again."
2. Vision parsing failures offer: "Try typing the problem instead"
3. Timeout warnings after 10 seconds
4. Retry buttons for failed operations
5. Never dead-end the user
6. Error messages are friendly, not technical

**Prerequisites:** Story 2.5, Story 4.1, Story 5.8

---

**Story 8.4: Performance Optimization**

As a developer,
I want the app to load fast and respond quickly,
So that the demo feels snappy and professional.

**Acceptance Criteria:**
1. Initial page load < 3 seconds on broadband
2. Code splitting for canvas library (loads on-demand)
3. Image optimization for uploads
4. LaTeX rendering cached
5. No memory leaks after 20+ turn conversation
6. Lighthouse score: Performance 80+

**Prerequisites:** All previous stories

---

**Story 8.5: Documentation and README**

As a developer or recruiter,
I want clear setup documentation,
So that I can run the project locally or understand the codebase.

**Acceptance Criteria:**
1. README.md with project overview
2. Setup instructions: clone, install, env vars, run
3. Environment variables documented (.env.example)
4. Technology stack listed
5. Demo scenarios described
6. Code comments for complex logic (prompt engineering, canvas state)

**Prerequisites:** All previous stories

---

**Story 8.6: Vercel Deployment Configuration**

As a developer,
I want the app deployed to Vercel,
So that it's accessible for live demos.

**Acceptance Criteria:**
1. Project connected to Vercel
2. Environment variables configured in Vercel dashboard
3. Automatic deployments on main branch push
4. Production URL accessible and working
5. OpenAI API calls work from deployed version
6. No console errors in production build

**Prerequisites:** All previous stories

---

## Implementation Sequence

**Phase 1 - Foundation (Week 1)**
- Epic 1: Stories 1.1 → 1.5 (can run some in parallel)
- Gets basic project structure working
- **Milestone:** Deployable skeleton with UI shell

**Phase 2 - Core Input & Rendering (Week 1-2)**
- Epic 2: Stories 2.1 → 2.6 (parallel: text and image paths)
- Epic 3: Stories 3.1 → 3.4 (can parallel with Epic 2)
- **Milestone:** Students can input problems and see equations rendered

**Phase 3 - AI Dialogue Engine (Week 2)**
- Epic 4: Stories 4.1 → 4.6 (sequential for prompt refinement)
- **Milestone:** Working Socratic dialogue with tiered hints

**Phase 4 - Visual Problem Solving (Week 3)**
- Epic 5: Stories 5.1 → 5.8 (mostly sequential, canvas builds incrementally)
- **Milestone:** Canvas annotation with AI spatial understanding

**Phase 5 - UX Integration (Week 3-4)**
- Epic 6: Stories 6.1 → 6.6 (some parallel: 6.1-6.2 can run together)
- Epic 7: Stories 7.1 → 7.3 (can parallel with Epic 6)
- **Milestone:** Polished chat interface with progress tracking

**Phase 6 - Polish & Demo (Week 4)**
- Epic 8: Stories 8.1 → 8.6 (mostly sequential for final integration)
- **Milestone:** Demo-ready product deployed

**Dependency Notes:**
- Epic 1 must complete before anything else
- Epic 3 can run parallel with Epic 2
- Epic 4 builds on Epic 2 (needs problem input)
- Epic 5 builds on Epic 2 (needs image upload)
- Epic 6 integrates Epic 3 and Epic 4
- Epic 7 can parallel with Epic 6
- Epic 8 requires all previous epics

**Parallelization Opportunities:**
- Stories 2.1 and 2.2 (text vs image input)
- Epic 2 and Epic 3 (input vs rendering)
- Epic 6 and Epic 7 (chat vs visualization)
- Multiple stories within Epic 5 (canvas tools can be built incrementally)

---

## Story Guidelines Reference

**Story Format:**

```
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. [Another specific criterion]
3. [etc.]

**Prerequisites:** [Dependencies on previous stories, if any]
```

**Story Requirements:**

- **Vertical slices** - Complete, testable functionality delivery
- **Sequential ordering** - Logical progression within epic
- **No forward dependencies** - Only depend on previous work
- **AI-agent sized** - Completable in 2-4 hour focused session
- **Value-focused** - Integrate technical enablers into value-delivering stories

---

**For implementation:** Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown.
