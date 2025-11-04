# Current App State Audit

**Date:** 2025-11-04
**Purpose:** Document existing app architecture, implemented features, and reusable components for future refactoring

---

## Overview

The **Math Tutor** app is a client-side React/Next.js application that provides a Socratic AI tutoring experience for math problems. The app has **no user accounts, no database, and no data persistence** - everything runs in browser memory for the current session.

**Current Implementation Status:**
- ✅ **Epics 1-4, 6**: Fully implemented (Foundation, Input, Rendering, Dialogue, Chat UI)
- ❌ **Epic 5**: Not started (Interactive Canvas for geometry)
- ❌ **Epic 7**: Not started (Step Visualization)
- ❌ **Epic 8**: Partially complete (Integration done, polish pending)

**App Flow:**
1. User lands on homepage → chooses text or image input
2. User submits problem → conversation starts with AI greeting
3. User chats with AI tutor → Socratic questioning (no direct answers)
4. User can reset → returns to problem input

---

## Architecture Pattern

**Framework:** Next.js 14+ with App Router
**State Management:** React Context API (ConversationContext)
**Styling:** Tailwind CSS with dark mode support
**Storage:** Session-based only (browser memory, no localStorage or database)

**Key Files:**
- `/src/app/page.tsx` - Main app orchestration
- `/src/app/layout.tsx` - Root layout with ConversationProvider wrapper
- `/src/contexts/ConversationContext.tsx` - Global conversation state

**Data Flow:**
```
User Input → Main Page State → API Routes (server-side) → OpenAI API
                     ↓
         ConversationContext (messages array)
                     ↓
              Chat Components (display)
```

---

## Core Components (Highly Reusable)

### 1. Problem Input Components

**TextInput** - `/src/components/ProblemInput/TextInput.tsx`
- Multi-line textarea for typing math problems
- Character counter (1000 char limit)
- Input validation and error states
- Success confirmation message
- **Reusability:** Drop-in text input for any problem submission flow

**ImageUpload** - `/src/components/ProblemInput/ImageUpload.tsx`
- Drag-and-drop image upload with react-dropzone
- File type validation (JPG, PNG, PDF)
- Size limit validation (10MB)
- Image preview with file info
- Automatic vision API parsing integration
- **Reusability:** Complete image upload + parsing flow, can be extracted

**Key Features:**
- Integrated with `/api/parse-image` for automatic problem extraction
- Error handling with fallback messages
- Loading states during parsing

---

### 2. Chat Interface Components

**ChatMessageList** - `/src/components/ChatMessageList.tsx`
- Displays conversation history from ConversationContext
- Auto-scroll to bottom on new messages
- Scroll-up to review history
- Role-based styling (user vs assistant messages)
- Optional timestamps
- LaTeX rendering within messages via ChatMessage
- **Reusability:** Generic chat message list, can work with any Message[] array

**ChatMessage** - `/src/components/ChatMessage.tsx`
- Individual message display component
- Parses and renders mixed text + LaTeX ($ and $$ delimiters)
- Role-based styling: user (right, blue) vs assistant (left, gray)
- Dark mode support
- **Reusability:** Standalone message renderer, works anywhere you need to display a chat message

**ChatInput** - `/src/components/ChatInput.tsx`
- Multi-line text input with send button
- Enter to send, Shift+Enter for new line
- Disabled state during loading
- Character limit support
- **Reusability:** Generic chat input, can work with any onSend callback

**LoadingIndicator** - `/src/components/LoadingIndicator.tsx`
- Animated loading dots
- "AI is thinking..." message
- Optional timeout warning (10 seconds)
- **Reusability:** Generic loading indicator for any async operation

---

### 3. Math Rendering Components

**MathDisplay** - `/src/components/MathDisplay.tsx`
- Renders LaTeX equations using KaTeX
- Auto-detects inline ($) vs block ($$) mode
- Manual displayMode override option
- Error handling with fallback to raw text
- Performance optimized with React.memo
- Accessibility with aria-labels
- **Reusability:** Universal LaTeX renderer, works anywhere in the app

**Key Dependency:** KaTeX library (installed)

---

### 4. Utility Components

**Header** - `/src/components/Header.tsx`
- App title and branding
- Optional onReset callback for "New Problem" button
- **Reusability:** Can be extended with additional actions

**NewProblemButton** - `/src/components/NewProblemButton.tsx`
- Confirmation dialog before resetting session
- Calls clearConversation from ConversationContext
- **Reusability:** Can be integrated into any header/navigation

---

## API Routes (Server-Side)

### 1. `/api/chat` - Main Dialogue Engine
**File:** `/src/app/api/chat/route.ts`

**Purpose:** Socratic tutoring conversation endpoint

**Request:**
```typescript
{
  message: string;
  conversationHistory: Message[];
  problemContext?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  response: string;
  error?: string;
}
```

**Advanced Features:**
- Stuck detection (analyzes last 5 messages)
- Tiered hint system (vague → specific → concrete)
- Response validation (blocks direct answers)
- Language adaptation (adjusts vocabulary by problem complexity)
- Automatic regeneration if direct answer detected

**Dependencies:**
- OpenAI GPT-4o model
- Sophisticated prompt engineering system (see Prompts section)

**Reusability:** Core logic is highly specialized for Socratic teaching but can be adapted

---

### 2. `/api/parse-image` - Vision Parsing
**File:** `/src/app/api/parse-image/route.ts`

**Purpose:** Extract math problems from uploaded images using GPT-4 Vision

**Request:**
```typescript
{
  image: string; // base64-encoded image
}
```

**Response:**
```typescript
{
  success: boolean;
  problemText: string;
  latex?: string;
  error?: string;
}
```

**Features:**
- Image validation (format, size)
- GPT-4o with vision capabilities
- Extracts both plain text and LaTeX
- 10MB size limit enforcement

**Reusability:** Vision API integration pattern can be reused for any image-to-text task

---

### 3. `/api/format-math` - Math Formatting
**File:** `/src/app/api/format-math/route.ts`

**Purpose:** Format user text input with proper LaTeX delimiters

**Request:**
```typescript
{
  text: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  formattedText: string;
}
```

**Usage:** Called before sending user messages to ensure math notation is properly formatted

**Reusability:** Simple utility endpoint, easy to adapt

---

## State Management

### ConversationContext
**Files:**
- `/src/contexts/ConversationContext.tsx` - Provider and hook
- `/src/types/conversation.ts` - TypeScript types

**Purpose:** Global conversation history management

**State Structure:**
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number; // Unix timestamp in ms
}

interface ConversationContextType {
  messages: Message[];
  addMessage: (role, content) => void;
  clearConversation: () => void;
  getConversationHistory: () => Message[];
}
```

**Features:**
- Session-based only (no persistence)
- 50 message limit (oldest dropped when exceeded)
- Automatic timestamp generation
- Used throughout app via `useConversation()` hook

**Reusability:** Generic conversation pattern, can be extended for other chat use cases

---

## Utilities & Libraries

### Math Utilities
**File:** `/src/lib/mathUtils.ts`

**Purpose:** Convert plain text math to LaTeX

**Functions:**
- `convertToLatex(text: string)` - Main conversion function
- `isAlreadyLatex(text: string)` - Detects existing LaTeX
- Converts: exponents (x^2), fractions (1/2), sqrt, multiplication

**Reusability:** Standalone utility, works anywhere

---

### AI/LLM Feature Libraries

#### Socratic Prompting System
**File:** `/src/lib/prompts/socraticPrompt.ts`
- Core 450-word system prompt enforcing Socratic method
- Explicit "never give direct answers" instructions
- Four-phase teaching approach
- **Reusability:** Template for any pedagogical AI system

#### Stuck Detection
**File:** `/src/lib/stuckDetection.ts`
- Analyzes last 5 messages to determine if student is stuck
- Returns stuck level (0-3)
- Conservative approach: requires 2+ indicators before escalating
- **Reusability:** Pattern applicable to any conversational learning system

#### Hint Level System
**File:** `/src/lib/prompts/hintLevels.ts`
- Three-tier hint progression (vague → specific → concrete)
- Prompt additions based on stuck level
- Even level 3 maintains Socratic method (no direct answers)
- **Reusability:** Template for adaptive hint systems

#### Response Validation
**File:** `/src/lib/responseValidation.ts`
- 10 pattern detectors for direct answer violations
- Confidence scoring (0.80-0.98)
- Returns violation type and whether to regenerate
- **Reusability:** Pattern for enforcing conversational constraints

#### Stricter Prompt
**File:** `/src/lib/prompts/stricterPrompt.ts`
- Emphatic regeneration prompt when validation fails
- Context-specific guidance based on violation type
- **Reusability:** Template for prompt correction flows

#### Problem Complexity Detection
**File:** `/src/lib/problemComplexity.ts`
- Detects complexity level: elementary, middle, high, college
- Uses regex patterns for math symbols
- **Reusability:** Foundation for any grade-level adaptation system

#### Language Adaptation
**File:** `/src/lib/prompts/languageAdaptation.ts`
- Adjusts AI vocabulary based on problem complexity
- Comprehensive vocabulary mappings per level
- **Reusability:** Template for age-appropriate language systems

---

## What's NOT Implemented

### Epic 5: Interactive Canvas (NOT STARTED)
- Canvas overlay on images
- Drawing tools (freehand, circle, line, highlight)
- Canvas state tracking and serialization
- AI spatial understanding of annotations
- Undo/redo functionality

**Planned Library:** Fabric.js or Konva.js (not yet chosen or installed)

### Epic 7: Step Visualization (NOT STARTED)
- Progress indicator sidebar
- Conceptual stage tracking (Understanding → Method → Working → Validating)
- AI-based stage detection

### Epic 8: Polish & Demo Features (PARTIAL)
- End-to-end testing
- Performance optimization
- Error recovery UX enhancements
- Deployment configuration

---

## Technology Stack

**Core:**
- Next.js 14+ (App Router, TypeScript)
- React 18+
- Tailwind CSS (with dark mode)

**UI Libraries:**
- react-dropzone (file uploads)
- KaTeX (math rendering)

**AI/API:**
- OpenAI SDK (gpt-4o, gpt-4o-mini)
- Server-side API routes only (keys never exposed to client)

**Not Used:**
- No database or ORM
- No authentication library
- No state management library (using Context API)
- No form library (custom forms)

---

## Reusability Assessment

### Highly Reusable (Minimal Changes Needed)
✅ **MathDisplay** - Universal LaTeX renderer
✅ **ChatMessageList** - Generic message list component
✅ **ChatMessage** - Individual message renderer
✅ **ChatInput** - Generic chat input
✅ **LoadingIndicator** - Universal loading UI
✅ **ImageUpload** - Complete image upload flow (remove vision parsing call if not needed)
✅ **TextInput** - Generic text input with validation

### Moderately Reusable (Some Adaptation Required)
🔄 **ConversationContext** - Generic pattern but tied to specific Message type
🔄 **Vision API Integration** - Reusable pattern but prompt is math-specific
🔄 **Math Utilities** - Specific to LaTeX conversion but logic is sound
🔄 **Header** - Generic structure but needs branding changes

### Specialized (Requires Significant Changes)
🔧 **Chat API Route** - Highly specialized for Socratic teaching
🔧 **Prompt Engineering System** - Specific to math tutoring pedagogy
🔧 **Stuck Detection** - Specific to learning scenarios
🔧 **Response Validation** - Enforces Socratic constraints

---

## Key Insights for Refactoring

### Current Architecture Strengths
1. **Clean separation** between UI components and API logic
2. **Reusable chat components** that work with any message flow
3. **Solid TypeScript types** throughout
4. **Well-documented code** with inline comments

### Current Architecture Limitations
1. **No data persistence** - everything lost on page refresh
2. **No user system** - can't track multiple students or save progress
3. **Tightly coupled** - Main page orchestrates too much logic
4. **No testing infrastructure** - all testing is manual via test pages

### Recommendations for New Architecture
1. **Keep:** Chat UI components, MathDisplay, Input components
2. **Refactor:** State management if adding persistence/multi-user
3. **Extract:** Prompt engineering system into separate module
4. **Consider:** Breaking main page.tsx into smaller sub-components
5. **Add:** Testing framework if moving beyond demo scope

---

## File Structure Summary

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              (Socratic dialogue engine)
│   │   ├── parse-image/route.ts       (Vision API integration)
│   │   └── format-math/route.ts       (Math formatting utility)
│   ├── test-pages/                    (Manual testing pages)
│   ├── layout.tsx                     (Root layout + ConversationProvider)
│   └── page.tsx                       (Main app orchestration)
├── components/
│   ├── ProblemInput/
│   │   ├── TextInput.tsx              (Text problem entry)
│   │   └── ImageUpload.tsx            (Image upload + parsing)
│   ├── ChatMessageList.tsx            (Message history display)
│   ├── ChatMessage.tsx                (Individual message renderer)
│   ├── ChatInput.tsx                  (Chat text input)
│   ├── MathDisplay.tsx                (LaTeX renderer)
│   ├── LoadingIndicator.tsx           (Loading UI)
│   ├── Header.tsx                     (App header)
│   └── NewProblemButton.tsx           (Reset button)
├── contexts/
│   └── ConversationContext.tsx        (Global conversation state)
├── lib/
│   ├── prompts/
│   │   ├── socraticPrompt.ts          (Core teaching prompt)
│   │   ├── hintLevels.ts              (Tiered hint system)
│   │   ├── stricterPrompt.ts          (Regeneration prompt)
│   │   └── languageAdaptation.ts      (Vocabulary adaptation)
│   ├── stuckDetection.ts              (Analyze student stuck state)
│   ├── responseValidation.ts          (Block direct answers)
│   ├── problemComplexity.ts           (Grade level detection)
│   └── mathUtils.ts                   (Text-to-LaTeX conversion)
└── types/
    └── conversation.ts                (TypeScript interfaces)
```

---

## Environment Variables

```env
OPENAI_API_KEY=<your-openai-api-key>
```

No other configuration required. No database URLs, no auth secrets, no third-party services.

---

**Last Updated:** 2025-11-04
**Status:** Documented for architecture refactoring
