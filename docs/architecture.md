# Architecture

## Executive Summary

**math-tutor** is a Next.js web application demonstrating multi-modal AI tutoring through Socratic dialogue. The architecture integrates GPT-4 Vision (problem parsing), GPT-4 Chat (Socratic dialogue), KaTeX (equation rendering), and Fabric.js/Konva.js (interactive canvas) to create a seamless teaching experience across text and visual problem types. All architectural decisions prioritize demo quality, AI agent implementation consistency, and the unique challenge of maintaining pedagogical state across three modalities (conversation, canvas, conceptual progress).

## Project Initialization

**First Implementation Story: Project Setup**

Use the official Next.js starter to establish the base architecture:

```bash
npx create-next-app@latest math-tutor --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

**Starter Configuration Selections:**
- TypeScript: ✅ Yes
- ESLint: ✅ Yes
- Tailwind CSS: ✅ Yes
- `src/` directory: ✅ Yes
- App Router: ✅ Yes
- Import alias (@/*): ✅ Yes
- Turbopack: Optional (can enable for faster dev builds)

**This provides these architectural decisions automatically:**
- Next.js 15.x (verified current stable as of Jan 2025)
- React 19.x (latest stable)
- Tailwind CSS 4.0 (latest with performance improvements)
- TypeScript with strict mode
- ESLint configuration
- Project structure with `/src/app`, `/src/components`, `/src/lib`
- API routes support via `/src/app/api`
- Environment variable management (.env.local)

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Framework** | Next.js (App Router) | 15.x | All | Provided by starter - modern React framework with SSR, API routes, optimal for demo |
| **Language** | TypeScript (strict) | Latest | All | Provided by starter - type safety prevents agent conflicts |
| **Styling** | Tailwind CSS | 4.0 | All | Provided by starter - utility-first, rapid UI development |
| **Linting** | ESLint | Latest | All | Provided by starter - code quality enforcement |
| **Canvas Library** | Konva.js + react-konva | konva latest, react-konva 19.2.0 | Epic 5 | Declarative React bindings, excellent TypeScript support, performance optimized |
| **Math Rendering** | KaTeX + react-katex | KaTeX 0.16.24, react-katex 3.1.0 | Epic 3, 6 | Faster than MathJax, perfect for real-time rendering, proven in production |
| **AI Integration** | OpenAI Node SDK | 6.1.0 | Epic 2, 4, 5 | Official SDK, easy model swapping, TypeScript support, streaming capable |
| **State Management** | Zustand | 5.0.8 | Epic 4, 5, 6, 7 | Minimal boilerplate, perfect for conversation/canvas state, middleware support |
| **File Upload** | react-dropzone | 14.3.8 | Epic 2 | HTML5 compliant, accessible, excellent DX with hooks |
| **API Routes** | Next.js /app/api structure | - | Epic 2, 4, 5 | RESTful organization: /api/parse-image, /api/chat, /api/analyze-canvas |
| **Error Handling** | React Error Boundaries + API error codes | - | All | Global ErrorBoundary component, standard HTTP codes, user-friendly messages |
| **Session Storage** | LocalStorage | - | Epic 4, 6 | Persists across tabs, suitable for demo (no sensitive data) |
| **Image Encoding** | base64 with client-side compression | - | Epic 2, 5 | Direct OpenAI Vision API compatibility, <10MB limit enforced |
| **Loading States** | Tailwind-based spinners | - | All | Consistent with design system, no extra dependencies |
| **Testing** | Vitest + React Testing Library | Latest | All | Fast, ESM-native, compatible with Next.js, industry standard |

## Project Structure

```
math-tutor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Main chat interface page
│   │   ├── globals.css             # Tailwind + KaTeX CSS imports
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts        # POST: OpenAI chat completion
│   │       ├── parse-image/
│   │       │   └── route.ts        # POST: GPT-4 Vision problem parsing
│   │       └── analyze-canvas/
│   │           └── route.ts        # POST: GPT-4 Vision spatial understanding
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── problem-input/
│   │   │   ├── TextInput.tsx       # Story 2.1
│   │   │   ├── ImageUpload.tsx     # Story 2.2
│   │   │   └── ProblemTypeToggle.tsx # Story 2.6
│   │   ├── math/
│   │   │   └── MathDisplay.tsx     # Story 3.2 - KaTeX rendering
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx          # Story 5.2 - Konva canvas
│   │   │   ├── ToolPalette.tsx     # Story 5.3, 5.4
│   │   │   └── CanvasControls.tsx  # Story 5.6 - undo/redo
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # Story 6.1
│   │   │   ├── MessageList.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── ChatInput.tsx       # Story 6.2
│   │   │   └── LoadingIndicator.tsx # Story 6.3
│   │   └── visualization/
│   │       └── StepTracker.tsx     # Story 7.1
│   │
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── conversationStore.ts  # Zustand: conversation state
│   │   │   ├── canvasStore.ts        # Zustand: canvas state
│   │   │   └── progressStore.ts      # Zustand: step visualization
│   │   ├── openai/
│   │   │   ├── client.ts             # OpenAI client configuration
│   │   │   ├── prompts.ts            # Socratic system prompts
│   │   │   └── validators.ts         # Answer validation logic
│   │   ├── canvas/
│   │   │   ├── serializer.ts         # Canvas state to JSON
│   │   │   └── descriptor.ts         # Generate text descriptions
│   │   ├── math/
│   │   │   └── latexConverter.ts     # Plain text to LaTeX
│   │   └── utils/
│   │       ├── imageUtils.ts         # Base64 encoding, compression
│   │       ├── errorHandling.ts      # Standard error responses
│   │       └── storage.ts            # LocalStorage helpers
│   │
│   └── types/
│       ├── conversation.ts           # Message, ConversationHistory
│       ├── canvas.ts                 # DrawAction, CanvasState
│       ├── problem.ts                # Problem, ProblemType
│       └── api.ts                    # API request/response types
│
├── public/
│   └── test-problems/                # Sample problems for demo
│       ├── algebra-1.png
│       ├── geometry-1.png
│       └── calculus-1.png
│
├── __tests__/                        # Vitest tests
│   ├── components/
│   ├── lib/
│   └── api/
│
├── .env.local                        # OpenAI API key (gitignored)
├── .env.example                      # Template for env vars
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vitest.config.ts
└── README.md
```

## Epic to Architecture Mapping

| Epic | Primary Components/Modules | Key Files |
|------|---------------------------|-----------|
| **Epic 1: Foundation** | Next.js setup, layout, basic UI | `app/layout.tsx`, `app/page.tsx`, `components/ui/*` |
| **Epic 2: Problem Input** | Problem input components, Vision API | `components/problem-input/*`, `app/api/parse-image/route.ts`, `lib/utils/imageUtils.ts` |
| **Epic 3: Math Rendering** | KaTeX integration, LaTeX display | `components/math/MathDisplay.tsx`, `lib/math/latexConverter.ts` |
| **Epic 4: Socratic Dialogue** | OpenAI integration, conversation state, prompts | `app/api/chat/route.ts`, `lib/openai/*`, `lib/stores/conversationStore.ts` |
| **Epic 5: Interactive Canvas** | Konva canvas, drawing tools, spatial AI | `components/canvas/*`, `app/api/analyze-canvas/route.ts`, `lib/canvas/*`, `lib/stores/canvasStore.ts` |
| **Epic 6: Chat Interface** | Chat UI, message display, conversation UX | `components/chat/*`, integrates with Epic 3 and 4 |
| **Epic 7: Step Visualization** | Progress tracker, stage detection | `components/visualization/StepTracker.tsx`, `lib/stores/progressStore.ts` |
| **Epic 8: Integration & Polish** | Error handling, testing, deployment | `components/ui/ErrorBoundary.tsx`, `__tests__/*`, Vercel config |

## Technology Stack Details

### Core Technologies

**Frontend:**
- Next.js 15.x (App Router) - React framework with SSR/SSG
- React 19.x - UI library
- TypeScript (strict mode) - Type safety
- Tailwind CSS 4.0 - Utility-first styling

**State Management:**
- Zustand 5.0.8 - Lightweight state management
  - `conversationStore`: Messages, problem context, stuck count
  - `canvasStore`: Drawing actions, tool state, undo/redo history
  - `progressStore`: Current stage (Understanding/Method/Working/Validating)

**Canvas & Math:**
- Konva.js + react-konva 19.2.0 - Canvas drawing and manipulation
- KaTeX 0.16.24 + react-katex 3.1.0 - LaTeX equation rendering

**AI Integration:**
- OpenAI Node SDK 6.1.0
  - GPT-4 for Socratic dialogue
  - GPT-4 Vision for image/canvas parsing

**File Handling:**
- react-dropzone 14.3.8 - Drag-and-drop image upload

**Development:**
- ESLint - Code quality
- Vitest + React Testing Library - Unit/integration testing
- TypeScript strict mode - Type checking

### Integration Points

**1. Client → API Routes (Next.js Server)**
- POST `/api/parse-image` - Sends base64 image → Returns parsed problem text/LaTeX
- POST `/api/chat` - Sends message + history → Returns AI response + current stage
- POST `/api/analyze-canvas` - Sends canvas snapshot + description → Returns spatial understanding

**2. API Routes → OpenAI**
- All OpenAI calls happen server-side (API key never exposed to client)
- Retry logic: 1 automatic retry on failure with exponential backoff
- Timeout: 10 seconds per request

**3. Component → Zustand Stores**
- Components subscribe to stores with shallow equality checks
- Store updates trigger React re-renders only for changed slices
- LocalStorage sync on conversation/canvas state changes

**4. Canvas → GPT-4 Vision**
- Konva canvas → base64 PNG snapshot
- Text descriptor generated from draw actions: "Student circled top-left angle at (50, 30) and drew line from (50, 30) to (150, 200)"
- Both sent to `/api/analyze-canvas`

## Novel Architectural Patterns

### Multi-Modal Pedagogical State Management

**Challenge:** The system must maintain coherent state across THREE modalities simultaneously:
1. **Conversational State** - Chat history, stuck count, hint level
2. **Spatial State** - Canvas annotations with temporal ordering
3. **Conceptual State** - Problem-solving stage (Understanding → Method → Working → Validating)

**Solution - Synchronized Zustand Stores:**

```typescript
// Three independent stores that communicate via shared actions
conversationStore {
  messages: Message[]
  stuckCount: number
  problemContext: string

  actions: {
    addMessage() // Also triggers progressStore.detectStage()
    resetStuck()
  }
}

canvasStore {
  drawActions: DrawAction[] // Temporal sequence preserved
  currentTool: Tool
  history: { past: [], future: [] } // For undo/redo

  actions: {
    addDrawAction() // Appends with timestamp
    undo() / redo()
    generateSnapshot() // Returns base64 + description
  }
}

progressStore {
  currentStage: 'understanding' | 'method' | 'working' | 'validating'

  actions: {
    detectStage(aiResponse) // Extracts stage from AI metadata
    advance() // Only moves forward, never regresses
  }
}
```

**Key Pattern:** Each store is independent but actions can trigger cross-store updates. Canvas snapshot generation pulls from canvasStore but is called by chat submit. Stage detection is triggered by conversation updates but updates progressStore.

### Canvas State Serialization for LLM Context

**Challenge:** GPT-4 Vision needs to understand "what the student circled" from raw canvas data.

**Solution - Dual Representation:**

1. **Visual Snapshot:** Konva canvas → base64 PNG (original image + annotations)
2. **Textual Description:** Generated from `drawActions` array:

```typescript
// Canvas state JSON
{
  originalImage: "base64...",
  annotations: [
    {
      type: "circle",
      center: [50, 30],
      radius: 20,
      color: "red",
      timestamp: 1699123456789,
      order: 0
    },
    {
      type: "line",
      points: [[50, 30], [150, 200]],
      color: "blue",
      timestamp: 1699123458123,
      order: 1
    }
  ]
}

// Generated description sent with image
"Student first circled an area at coordinates (50, 30) with a red circle,
then drew a blue line from that circle to point (150, 200).
This suggests they're identifying angle ABC and the opposite side."
```

**Why This Works:** LLM gets BOTH visual context (sees the marks) AND temporal/spatial context (understands the sequence and what student was thinking).

### Socratic Constraint Enforcement

**Challenge:** Prevent AI from giving direct answers despite prompting.

**Solution - Multi-Layer Defense:**

1. **System Prompt** (Primary): Explicit Socratic rules + examples
2. **Post-Processing Validation** (Secondary): Regex patterns detect answer-giving
3. **Regeneration** (Fallback): If validation fails, retry with stricter prompt
4. **UI Design** (Tertiary): No "show answer" button exists in interface

```typescript
// Validation patterns
const DIRECT_ANSWER_PATTERNS = [
  /the answer is/i,
  /the solution is/i,
  /x\s*=\s*\d+/,  // "x = 5"
  /equals?\s*\d+/, // "equals 5"
  /\d+\s*(degrees?|units?|cm|inches)/  // "30 degrees"
]

// If detected, regenerate with:
systemPrompt += "\n\nREMINDER: You MUST NOT provide the answer.
Only ask guiding questions. If you're about to state a solution,
rephrase as a question instead."
```

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Component Patterns

**File Naming:** PascalCase for components
- ✅ `ChatInterface.tsx`, `MathDisplay.tsx`
- ❌ `chat-interface.tsx`, `mathDisplay.tsx`

**Component Structure:**
```typescript
// Standard component template
import { FC } from 'react'
import { cn } from '@/lib/utils' // Tailwind class merger

interface ComponentNameProps {
  // Props with JSDoc comments
  /** Description of prop */
  propName: string
}

export const ComponentName: FC<ComponentNameProps> = ({ propName }) => {
  // 1. Hooks first
  // 2. Derived state
  // 3. Event handlers
  // 4. Effects
  // 5. Render

  return (
    <div className={cn("base-classes", conditionalClass)}>
      {/* Content */}
    </div>
  )
}
```

**Import Alias:** Always use `@/` for absolute imports
- ✅ `import { Button } from '@/components/ui/Button'`
- ❌ `import { Button } from '../../../components/ui/Button'`

### API Route Patterns

**File Structure:** One route per feature
- `/app/api/chat/route.ts`
- `/app/api/parse-image/route.ts`
- `/app/api/analyze-canvas/route.ts`

**Standard Response Format:**
```typescript
// Success response
return NextResponse.json({
  success: true,
  data: { /* actual data */ }
}, { status: 200 })

// Error response
return NextResponse.json({
  success: false,
  error: {
    message: "User-friendly message",
    code: "ERROR_CODE",
    details: "Technical details for debugging"
  }
}, { status: 400 })
```

**Error Handling:**
```typescript
export async function POST(req: Request) {
  try {
    // Implementation
  } catch (error) {
    console.error('[API_ROUTE_NAME]', error)
    return NextResponse.json({
      success: false,
      error: {
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR"
      }
    }, { status: 500 })
  }
}
```

### State Management Patterns

**Zustand Store Structure:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreState {
  // State
  items: Item[]
  // Actions
  addItem: (item: Item) => void
  clearItems: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Initial state
      items: [],

      // Actions
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),

      clearItems: () => set({ items: [] })
    }),
    {
      name: 'store-name', // LocalStorage key
      // Only persist specific fields if needed
      partialize: (state) => ({ items: state.items })
    }
  )
)
```

**Store Usage in Components:**
```typescript
// Subscribe to specific slice only (prevents unnecessary re-renders)
const messages = useConversationStore(state => state.messages)
const addMessage = useConversationStore(state => state.addMessage)
```

### Data Flow Patterns

**Type-Safe API Calls:**
```typescript
// Define types in @/types/api.ts
export interface ChatRequest {
  message: string
  conversationHistory: Message[]
  problemContext: string
}

export interface ChatResponse {
  success: true
  data: {
    response: string
    currentStage: Stage
  }
} | {
  success: false
  error: ErrorResponse
}

// Use in components
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData satisfies ChatRequest)
})

const data: ChatResponse = await response.json()
if (data.success) {
  // TypeScript knows data.data exists
}
```

## Consistency Rules

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `ChatInterface.tsx`)
- Utilities/Stores: `camelCase.ts` (e.g., `conversationStore.ts`, `latexConverter.ts`)
- Types: `camelCase.ts` (e.g., `conversation.ts`, `api.ts`)
- API Routes: `route.ts` in feature folder (e.g., `/api/chat/route.ts`)

**Variables:**
- camelCase for all variables, functions
- PascalCase for types, interfaces, components
- SCREAMING_SNAKE_CASE for constants

**Boolean Variables:** Prefix with `is`, `has`, `should`
- ✅ `isLoading`, `hasError`, `shouldRender`
- ❌ `loading`, `error`, `render`

### Code Organization

**Import Order:**
```typescript
// 1. External dependencies
import { FC } from 'react'
import { create } from 'zustand'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/Button'
import { useConversationStore } from '@/lib/stores/conversationStore'

// 3. Relative imports (avoid if possible)
import { helper } from './helper'

// 4. Types
import type { Message } from '@/types/conversation'
```

**File Organization by Feature:**
- Group related files in feature folders (e.g., `components/canvas/*`)
- Shared utilities in `lib/utils/*`
- Types centralized in `types/*`

### Error Handling

**Client-Side:**
```typescript
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()

  if (!data.success) {
    // Show user-friendly error
    toast.error(data.error.message)
    return
  }

  // Handle success
} catch (error) {
  console.error('[ComponentName]', error)
  toast.error("Something went wrong. Please try again.")
}
```

**Server-Side (API Routes):**
- Always log errors with route context: `console.error('[/api/chat]', error)`
- Return 400 for client errors, 500 for server errors
- User-facing messages should be friendly, non-technical

### Logging Strategy

**Format:**
```typescript
console.log('[Context] Action', data)
console.error('[Context] Error:', error)

// Examples:
console.log('[ChatInterface] Sending message', { messageLength: message.length })
console.error('[/api/chat] OpenAI API error:', error)
```

**What to Log:**
- API route entry/exit
- OpenAI API calls (request size, response time)
- Canvas state changes (action type, timestamp)
- Errors (always with context)

**What NOT to Log:**
- API keys
- Full conversation history (only summary)
- User personal information

## Data Architecture

### Core Data Models

```typescript
// Message - Conversation history
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  latex?: string[] // Extracted LaTeX equations
}

// DrawAction - Canvas annotation
interface DrawAction {
  id: string
  type: 'freehand' | 'circle' | 'line' | 'highlight'
  coordinates: number[] | number[][] // Varies by type
  color: string
  lineWidth: number
  timestamp: number
  order: number // Sequence in which drawn
}

// Problem - Parsed problem context
interface Problem {
  id: string
  type: 'text' | 'image'
  content: string // Raw text or base64 image
  parsedText?: string // From GPT-4 Vision
  latex?: string // Extracted LaTeX
  problemType: 'equation-heavy' | 'diagram-heavy'
}

// Stage - Problem-solving progress
type Stage = 'understanding' | 'method' | 'working' | 'validating'
```

### Data Relationships

```
Problem (1) ──→ (many) Messages
              ╰──→ (many) DrawActions

ConversationStore owns:
- Problem context
- Message history
- Stuck count (derived from messages)

CanvasStore owns:
- DrawActions array
- Undo/Redo history

ProgressStore owns:
- Current Stage (derived from last AI response)
```

## API Contracts

### POST /api/parse-image

**Request:**
```typescript
{
  image: string // base64 encoded
}
```

**Response:**
```typescript
{
  success: true
  data: {
    problemText: string
    latex?: string
    problemType: 'equation-heavy' | 'diagram-heavy'
  }
}
```

### POST /api/chat

**Request:**
```typescript
{
  message: string
  conversationHistory: Message[]
  problemContext: string
  stuckCount: number
}
```

**Response:**
```typescript
{
  success: true
  data: {
    response: string
    currentStage: Stage
  }
}
```

### POST /api/analyze-canvas

**Request:**
```typescript
{
  originalImage: string // base64
  canvasSnapshot: string // base64 (image + annotations)
  textDescription: string // Generated from drawActions
  conversationHistory: Message[] // For context
}
```

**Response:**
```typescript
{
  success: true
  data: {
    response: string // AI's understanding of spatial context
  }
}
```

## Security Architecture

**API Key Protection:**
- OpenAI API key stored in `.env.local` (gitignored)
- NEVER exposed to client-side code
- All OpenAI calls via server-side API routes
- Environment variable validation on startup

**Input Validation:**
- Image upload: Max 10MB, only JPG/PNG/PDF
- Text input: Max 1000 characters
- API routes validate all inputs with Zod schemas

**No User Data Storage:**
- Session-based state (LocalStorage)
- No backend database
- No PII collection
- Conversation history cleared on "New Problem"

**Rate Limiting (Nice-to-Have):**
- Could add simple rate limiting to API routes
- Not critical for portfolio demo

## Performance Considerations

**Client-Side:**
- Code splitting: Canvas library loaded on-demand (only for diagram problems)
- Image compression before upload (target <2MB)
- LaTeX rendering cached (React memoization)
- Zustand stores use shallow equality checks

**Server-Side:**
- OpenAI API timeout: 10 seconds
- Retry logic: 1 automatic retry with exponential backoff
- Stream responses from OpenAI (future enhancement)

**Canvas Performance:**
- Konva layer optimization (separate layers for image vs annotations)
- Debounce canvas state saves (don't save every mousemove)
- Limit undo history to 50 actions

**Bundle Size:**
- Target: <500KB initial bundle
- Lazy load canvas/math libraries
- Tree-shake unused Tailwind classes

## Deployment Architecture

**Vercel Deployment:**
- Platform: Vercel (optimal for Next.js)
- Build command: `npm run build`
- Environment variables configured in Vercel dashboard:
  - `OPENAI_API_KEY`
- Automatic deployments on `main` branch push
- Serverless functions for API routes (auto-scaling)

**Domain:** Custom domain or Vercel-provided subdomain

**Monitoring:**
- Vercel Analytics (included)
- Error logging via console (visible in Vercel logs)

## Development Environment

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm
- OpenAI API key ([https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Setup Commands

```bash
# 1. Create project with Next.js starter
npx create-next-app@latest math-tutor --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

cd math-tutor

# 2. Install additional dependencies
npm install zustand
npm install konva react-konva
npm install katex react-katex
npm install openai
npm install react-dropzone

# 3. Install dev dependencies
npm install -D @types/katex
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# 5. Run development server
npm run dev
# Open http://localhost:3000
```

### `.env.example` Template

```bash
# OpenAI API Key (required)
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
```

## Architecture Decision Records (ADRs)

### ADR-001: Why Konva.js Over Fabric.js?

**Decision:** Use Konva.js + react-konva

**Rationale:**
- React bindings are first-class (maintained by same team)
- Excellent TypeScript support
- Better performance for our use case (layered drawing)
- Active maintenance and community

**Alternatives Considered:**
- Fabric.js: More mature but React integration less clean
- HTML5 Canvas directly: Too low-level for rapid development

### ADR-002: Why Zustand Over Redux/Context?

**Decision:** Use Zustand for state management

**Rationale:**
- Minimal boilerplate (critical for demo timeline)
- Built-in LocalStorage persistence
- Excellent TypeScript inference
- No Provider hell
- Easy to test

**Alternatives Considered:**
- Redux Toolkit: Too much boilerplate for project scope
- React Context: Performance issues with frequent updates
- Jotai: Similar to Zustand, but less familiar

### ADR-003: Why KaTeX Over MathJax?

**Decision:** Use KaTeX for LaTeX rendering

**Rationale:**
- 10x faster rendering than MathJax
- No layout shifts (synchronous rendering)
- Smaller bundle size
- Good enough for demo math (doesn't need 100% LaTeX coverage)

**Trade-off:** MathJax has broader LaTeX support, but speed matters more for UX

### ADR-004: Why LocalStorage Over SessionStorage?

**Decision:** Use LocalStorage for conversation persistence

**Rationale:**
- Persists across browser tabs (better demo UX)
- Survives accidental page refreshes
- Still demo-scoped (cleared on "New Problem")

**Trade-off:** SessionStorage would be more ephemeral but less user-friendly

### ADR-005: Server-Side API Routes vs Direct Client Calls

**Decision:** All OpenAI API calls via Next.js API routes (server-side)

**Rationale:**
- API key security (never exposed to client)
- Can add rate limiting/caching later
- Standard Next.js pattern
- Demo-appropriate architecture

**Trade-off:** Adds slight latency but security is non-negotiable

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-03_
_For: Mike_
