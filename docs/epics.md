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

**Story 1.5: Create Basic UI Shell with Header and Main Content Area**

As a student,
I want to see a clean, professional interface when I load the app,
So that I feel confident using the tutoring system.

**Acceptance Criteria:**
1. Header component with app title "Math Tutor"
2. Main content area with centered layout
3. Responsive design: works on desktop (1280x720+)
4. Clean, minimal styling inspired by Khan Academy/Linear
5. Professional typography and spacing
6. Component renders without console errors

**Prerequisites:** Story 1.3

---

## Epic 2: Problem Input & Vision Parsing

**Goal:** Enable students to submit math problems via text or image upload, with GPT-4 Vision parsing images into structured problems.

**Value:** First user-facing capability - students can input problems in the format most convenient for them.

**Stories:**

**Story 2.1: Create Text Input Component for Problem Entry**

As a student,
I want to type math problems into a text field,
So that I can quickly submit problems without needing an image.

**Acceptance Criteria:**
1. Textarea component for problem input with multi-line support
2. "Submit Problem" button that captures input
3. Input field clears after successful submission
4. Character limit of 1000 characters with counter
5. Basic validation: requires non-empty input
6. Success state shows "Problem submitted" confirmation

**Prerequisites:** Story 1.5

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

**Story 2.3: Integrate React-Dropzone for File Upload**

As a developer,
I want react-dropzone library integrated,
So that drag-and-drop upload is robust and well-tested.

**Acceptance Criteria:**
1. react-dropzone package installed
2. useDropzone hook configured with file type restrictions
3. onDrop handler processes files correctly
4. File validation integrated (type, size)
5. Multiple files rejected (only 1 at a time)
6. Accessible keyboard navigation for file picker

**Prerequisites:** Story 2.2

---

**Story 2.4: Create OpenAI Vision API Integration Route**

As a developer,
I want a Next.js API route that calls GPT-4 Vision,
So that I can parse problem images server-side.

**Acceptance Criteria:**
1. API route created at /api/parse-image
2. Accepts POST request with base64 image data
3. Calls OpenAI GPT-4 Vision API with appropriate prompt
4. Prompt instructs: "Extract the math problem from this image. Return problem text and LaTeX if applicable."
5. Returns structured response: { problemText: string, latex?: string, success: boolean }
6. Error handling for API failures with user-friendly messages
7. API key from environment variables (never exposed to client)

**Prerequisites:** Story 1.4

---

**Story 2.5: Connect Image Upload to Vision API with Loading State**

As a student,
I want my uploaded image to be automatically parsed,
So that I don't have to manually type what's in the image.

**Acceptance Criteria:**
1. After image upload, automatic API call to /api/parse-image
2. Loading indicator shows "Parsing your problem..."
3. On success: display extracted problem text
4. On failure: show error + option to type manually
5. 10 second timeout with fallback message
6. Extracted text appears in editable field for corrections

**Prerequisites:** Story 2.4

---

**Story 2.6: Add Problem Type Selection (Text vs Image)**

As a student,
I want to choose between typing or uploading an image,
So that I can use the input method that works best for me.

**Acceptance Criteria:**
1. Two clear buttons/tabs: "Type Problem" and "Upload Image"
2. Switching between modes clears previous input
3. Only one mode active at a time
4. Default mode: "Type Problem"
5. Visual indicator shows active mode
6. Smooth transition animation between modes

**Prerequisites:** Story 2.1, Story 2.2

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

**Story 3.2: Create LaTeX Rendering Component for Inline and Block Equations**

As a developer,
I want a reusable component that renders LaTeX,
So that I can display equations consistently throughout the app.

**Acceptance Criteria:**
1. MathDisplay component accepts latex string prop
2. Supports inline mode (within text) and block mode (centered)
3. Automatically detects delimiters: $ inline $, $$ block $$
4. Fallback for invalid LaTeX: shows raw text with error indicator
5. Component memoized to prevent unnecessary re-renders
6. Accessible: equations have aria-label with text description

**Prerequisites:** Story 3.1

---

**Story 3.3: Add Plain Text to LaTeX Auto-Conversion**

As a student,
I want my plain text math input to be formatted nicely,
So that I don't have to know LaTeX syntax.

**Acceptance Criteria:**
1. Utility function converts common notation to LaTeX
2. Conversions: "x^2" → "x²", "1/2" → "\\frac{1}{2}", "sqrt(x)" → "\\sqrt{x}"
3. Preserves LaTeX input unchanged (doesn't double-convert)
4. Handles common operators: +, -, *, /, =
5. Displays converted equation with MathDisplay component
6. Original text preserved in case conversion fails

**Prerequisites:** Story 3.2

---

**Story 3.4: Integrate LaTeX Rendering into Chat Messages**

As a student,
I want equations in chat messages to render beautifully,
So that I can read complex math easily.

**Acceptance Criteria:**
1. Chat message component detects LaTeX delimiters
2. Inline equations render within text flow
3. Block equations render centered and larger
4. Mixed text + equations display correctly
5. No layout shifts during rendering
6. Equations render in both student and AI messages

**Prerequisites:** Story 3.2 (Note: Will be fully integrated in Epic 6, but component is prepared here)

---

## Epic 4: Socratic Dialogue Core

**Goal:** Build the AI-powered dialogue engine that guides students through Socratic questioning without giving direct answers.

**Value:** The pedagogical heart of the system - what makes this a tutor, not an answer machine.

**Stories:**

**Story 4.1: Create OpenAI Chat API Integration Route**

As a developer,
I want a Next.js API route that calls OpenAI Chat API,
So that I can generate AI tutoring responses.

**Acceptance Criteria:**
1. API route created at /api/chat
2. Accepts POST with: { message: string, conversationHistory: Message[], problemContext: string }
3. Calls OpenAI GPT-4 API with conversation history
4. Returns AI response as JSON
5. Error handling with retry logic (1 retry on failure)
6. Timeout after 10 seconds with warning
7. API key securely managed server-side

**Prerequisites:** Story 1.4

---

**Story 4.2: Design and Implement Socratic System Prompt**

As a developer,
I want a carefully crafted system prompt that enforces Socratic teaching,
So that the AI never gives direct answers.

**Acceptance Criteria:**
1. System prompt file created with Socratic guidelines
2. Prompt explicitly states: "NEVER give direct answers"
3. Instructs AI to ask guiding questions
4. Includes examples of good vs bad responses
5. Defines hint progression: vague → specific → concrete
6. Specifies encouraging language patterns
7. Tested manually with 10+ problems - no direct answers given

**Prerequisites:** Story 4.1

---

**Story 4.3: Implement Conversation History Management**

As a developer,
I want to maintain conversation history across turns,
So that the AI can reference earlier parts of the dialogue.

**Acceptance Criteria:**
1. ConversationContext React context manages message array
2. Each message stored with: { role: 'user' | 'assistant', content: string, timestamp: number }
3. Messages persisted in component state (session-based, no backend)
4. API receives full conversation history for context
5. History cleared on "New Problem"
6. Maximum 50 messages (oldest dropped if exceeded)

**Prerequisites:** Story 4.1

---

**Story 4.4: Build Tiered Hint System with Stuck Detection**

As a developer,
I want logic that tracks when students are stuck and escalates hints,
So that the AI provides appropriate support without spoiling solutions.

**Acceptance Criteria:**
1. Stuck counter tracks consecutive unhelpful student responses
2. Counter resets on progress or correct reasoning
3. Hint levels defined: Level 0-1 (vague), Level 2 (specific), Level 3+ (concrete)
4. System prompt adjusted based on stuck level
5. Frontend doesn't display stuck count (internal only)
6. Tested: Intentionally stuck for 3 turns shows hint progression

**Prerequisites:** Story 4.2, Story 4.3

---

**Story 4.5: Add Response Validation to Block Direct Answers**

As a developer,
I want post-processing that detects if AI gave a direct answer,
So that I can regenerate if needed.

**Acceptance Criteria:**
1. Validation function checks AI response for answer patterns
2. Detects: numeric solutions, explicit formulas, "the answer is..."
3. If detected: log warning and regenerate with stricter prompt
4. Maximum 1 regeneration attempt
5. If still fails: return generic "Let me guide you..." response
6. Tested with 20 problems - catches direct answers 90%+

**Prerequisites:** Story 4.2

---

**Story 4.6: Implement Language Adaptation Based on Problem Complexity**

As a developer,
I want the AI to adjust vocabulary based on problem difficulty,
So that language is appropriate for student level.

**Acceptance Criteria:**
1. Problem complexity detector analyzes input
2. Signals: basic operators (simple), algebra symbols (medium), calculus notation (advanced)
3. System prompt includes grade-level guidance
4. Examples: "add up" (simple) vs "evaluate the integral" (advanced)
5. Language adaptation visible in AI responses
6. Tested across difficulty levels - language matches appropriately

**Prerequisites:** Story 4.2

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

**Story 6.1: Create Chat Message Display Component**

As a student,
I want to see conversation history in a scrollable chat interface,
So that I can review earlier parts of our discussion.

**Acceptance Criteria:**
1. Message list component displays conversation history
2. Student messages: right-aligned, distinct background color
3. AI messages: left-aligned, different background color
4. Timestamps shown subtly (optional to toggle)
5. Auto-scroll to bottom on new messages
6. Scroll up to read earlier messages

**Prerequisites:** Story 4.3

---

**Story 6.2: Build Chat Input Field with Send Button**

As a student,
I want a text input field to respond to the AI,
So that I can continue the conversation.

**Acceptance Criteria:**
1. Multi-line text input at bottom of chat
2. "Send" button next to input
3. Enter key sends message
4. Shift+Enter creates new line (optional)
5. Input field clears after sending
6. Input disabled during AI response (loading state)

**Prerequisites:** Story 6.1

---

**Story 6.3: Add Loading Indicator for AI Responses**

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

**Prerequisites:** Story 6.2

---

**Story 6.4: Integrate LaTeX Rendering into Chat Messages**

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

**Prerequisites:** Story 6.1, Story 3.2

---

**Story 6.5: Add "New Problem" Button to Reset Session**

As a student,
I want to start a fresh problem,
So that I can work on multiple problems in one session.

**Acceptance Criteria:**
1. "New Problem" button in header
2. Click shows confirmation: "Start a new problem? Current progress will be lost."
3. Confirm clears: conversation history, canvas state, uploaded image
4. Cancel preserves current session
5. After reset, returns to problem input screen
6. Visual feedback on successful reset

**Prerequisites:** Story 6.1, Story 4.3

---

**Story 6.6: Implement Problem Type Detection UI Adaptation**

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

**Prerequisites:** Story 6.1, Story 5.2

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
