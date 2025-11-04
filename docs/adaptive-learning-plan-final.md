# Adaptive Skill-Based Learning: Implementation Plan

**Date:** 2025-11-04
**Target:** Transform Math Tutor into adaptive learning platform with skill tracking and intelligent branching
**Scope:** Portfolio/demo project built to production standards (minimal privacy/security concerns)

---

## Core Decisions

### Architecture
- **Database:** Firestore for all data (users, sessions, problems, proficiency)
- **Skill Graph:** JSON structure stored in Firestore `/config/skillGraph`, loaded into memory
- **Authentication:** Firebase Auth (email + Google SSO)
- **Skill Tagging:** AI-driven (GPT-4 analyzes problems and tags with skills from available list)

### Feature Parameters
- **Proficiency Levels:** 4-level system (Unknown, Learning, Proficient, Mastered)
- **Branching Strategy:** Suggest & Ask - let student attempt first, detect gaps through conversation, then suggest practice
- **Initial Skill Tree:** 10-20 skills focused on Algebra + prerequisites (fractions, percentages, division, multiplication)
- **Practice Sessions:** 3 problems per skill branch
- **Seed Problems:** ~50 manually curated problems (expandable later)

### Branching Flow (Modified)
1. Student submits problem
2. AI analyzes required skills but doesn't immediately branch
3. Student attempts to explain approach
4. AI asks clarifying questions
5. If student demonstrates skill gap → "Would you like to review [skill]?"
6. Student consents → 3 practice problems → return to original

---

## Phase Breakdown

### Phase 0: Manual Setup & Configuration
**Goal:** Complete all manual infrastructure setup that would block automated implementation

**🚨 MANUAL TASKS - Complete these before starting Phase 1:**

#### 1. Firebase Console Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Create new Firebase project: "ai-math-tutor" (or your preferred name)
- [ ] Enable **Authentication**:
  - Go to Authentication → Sign-in method
  - Enable "Email/Password"
  - Enable "Google" provider (requires OAuth consent screen setup)
- [ ] Enable **Firestore Database**:
  - Go to Firestore Database → Create database
  - Start in **test mode** (we'll add security rules later)
  - Choose region (us-central1 recommended)
- [ ] Get Firebase config:
  - Go to Project Settings → General → Your apps
  - Click "Add app" → Web app
  - Copy the `firebaseConfig` object

#### 2. Environment Variables Setup
Create `.env.local` file in project root with:

```bash
# Existing OpenAI key
OPENAI_API_KEY=your_existing_key_here

# Firebase Config (from console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side, optional for Phase 1)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

**How to get Admin SDK credentials:**
- Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Download JSON file
- Extract `project_id`, `client_email`, `private_key` into env vars

#### 3. Install Dependencies
Run these commands:

```bash
npm install firebase
npm install firebase-admin
npm install --save-dev @types/node
```

#### 4. Create Initial Skill Graph JSON
Create file: `data/skillGraph.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-04",
  "skills": {
    "addition": {
      "name": "Addition",
      "description": "Adding numbers together",
      "prerequisites": [],
      "level": 1
    },
    "subtraction": {
      "name": "Subtraction",
      "description": "Taking one number away from another",
      "prerequisites": [],
      "level": 1
    },
    "multiplication": {
      "name": "Multiplication",
      "description": "Repeated addition of the same number",
      "prerequisites": ["addition"],
      "level": 1
    },
    "division": {
      "name": "Division",
      "description": "Splitting a number into equal parts",
      "prerequisites": ["multiplication"],
      "level": 1
    },
    "fractions": {
      "name": "Fractions",
      "description": "Parts of a whole number",
      "prerequisites": ["division"],
      "level": 2
    },
    "decimals": {
      "name": "Decimals",
      "description": "Numbers with decimal points",
      "prerequisites": ["division"],
      "level": 2
    },
    "percentages": {
      "name": "Percentages",
      "description": "Parts per hundred",
      "prerequisites": ["fractions", "division"],
      "level": 2
    },
    "negative-numbers": {
      "name": "Negative Numbers",
      "description": "Numbers less than zero",
      "prerequisites": ["subtraction"],
      "level": 2
    },
    "order-of-operations": {
      "name": "Order of Operations",
      "description": "PEMDAS/BODMAS rules",
      "prerequisites": ["addition", "subtraction", "multiplication", "division"],
      "level": 3
    },
    "exponents": {
      "name": "Exponents",
      "description": "Repeated multiplication (powers)",
      "prerequisites": ["multiplication"],
      "level": 3
    },
    "variables": {
      "name": "Variables & Expressions",
      "description": "Using letters to represent unknown values",
      "prerequisites": ["order-of-operations"],
      "level": 4
    },
    "linear-equations": {
      "name": "Linear Equations",
      "description": "Solving equations with one variable",
      "prerequisites": ["variables", "addition", "subtraction", "multiplication", "division"],
      "level": 4
    }
  }
}
```

**Note:** This includes 12 skills. Can expand to 17 later if needed.

#### 5. Create Seed Problems File
Create file: `data/seedProblems.json`

**Structure:**
```json
[
  {
    "id": "div-001",
    "text": "What is 24 ÷ 6?",
    "solution": "4",
    "primarySkill": "division",
    "requiredSkills": ["division"],
    "difficulty": 1,
    "category": "arithmetic",
    "gradeLevel": "elementary"
  },
  {
    "id": "frac-001",
    "text": "Simplify the fraction: 8/12",
    "solution": "2/3",
    "primarySkill": "fractions",
    "requiredSkills": ["fractions", "division"],
    "difficulty": 2,
    "category": "arithmetic",
    "gradeLevel": "middle"
  }
  // ... add 48+ more problems covering all skills
]
```

**Guidelines for creating seed problems:**
- 4-6 problems per skill minimum (12 skills × 5 = 60 problems recommended)
- Mix of difficulty levels (1-3 for MVP)
- Include problems that require multiple skills
- Focus on Algebra pathway: division → fractions → variables → linear equations

**You can generate these using AI:**
- Prompt: "Generate 5 division problems for middle school students, ranging from easy to medium difficulty"
- Tag each with appropriate skills

#### 6. Firestore Security Rules
Go to Firebase Console → Firestore Database → Rules

Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to skill graph for all users
    match /config/skillGraph {
      allow read: if true;
      allow write: if false; // Only admins can update (manually via console)
    }

    // Allow read access to all problems
    match /problems/{problemId} {
      allow read: if true;
      allow write: if request.auth != null; // Logged-in users can submit problems
    }

    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write their own sessions
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Skills collection is read-only
    match /skills/{skillId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

#### 7. Upload Initial Data to Firestore
**Option A: Manual Upload (Firebase Console)**
- Go to Firestore Database → Start collection
- Create `/config/skillGraph` document
- Copy-paste JSON from `skillGraph.json`

**Option B: Automated (Preferred - we'll build this in Phase 1)**
- Create script to upload from JSON files
- Run once during Phase 1 setup

#### 8. Verification Checklist
Before proceeding to Phase 1, verify:

- [ ] Firebase project created and accessible
- [ ] Authentication enabled (Email + Google)
- [ ] Firestore database created (test mode)
- [ ] `.env.local` file created with all Firebase keys
- [ ] `npm install firebase firebase-admin` completed successfully
- [ ] `data/skillGraph.json` file created with 12+ skills
- [ ] `data/seedProblems.json` file created with 50+ problems
- [ ] Firestore security rules updated
- [ ] Can access Firebase Console without errors

---

### Phase 1: Authentication & Data Foundation
**Goal:** User accounts, skill tracking infrastructure, basic dashboard

**Deliverables:**
- Firebase SDK integration in Next.js app
- User collection with embedded skill proficiency map
- Upload skill graph and seed problems to Firestore
- Login/signup pages
- User profile with grade level selection
- Basic skill dashboard (list view of proficiency levels)

**Changes to Existing Code:**
- Add Firebase SDK initialization using env vars
- Create `AuthProvider` context
- Add protected route wrapper
- Extend main page to handle auth state
- Create new pages: `/login`, `/signup`, `/dashboard`, `/profile`

**New Files:**
- `lib/firebase.ts` - Firebase initialization (client-side)
- `lib/firebaseAdmin.ts` - Firebase Admin initialization (server-side)
- `contexts/AuthContext.tsx` - User authentication state
- `components/auth/LoginForm.tsx`, `SignupForm.tsx`
- `components/dashboard/SkillDashboard.tsx`
- `app/login/page.tsx`, `app/signup/page.tsx`, `app/dashboard/page.tsx`
- `scripts/uploadSkillGraph.ts` - Upload skill graph to Firestore (run once)
- `scripts/uploadSeedProblems.ts` - Upload seed problems to Firestore (run once)

**Firestore Collections (created via code in Phase 1):**
```
/users/{userId}
  - email, displayName, gradeLevel, focusTopic
  - skillProficiency: { [skillId]: { level, problemsSolved, successCount, lastPracticed } }
  - createdAt, lastActive

/config/skillGraph
  - version, lastUpdated
  - skills: { [skillId]: { name, description, prerequisites[], level } }

/problems/{problemId}
  - (uploaded from seedProblems.json)

/skills/{skillId}
  - (optional metadata collection, can defer to Phase 2)
```

---

### Phase 2: Skill Analysis & Problem Tagging
**Goal:** AI-powered skill detection, problem database, proficiency tracking

**Deliverables:**
- Skill graph manager utility (loads JSON, traverses prerequisites)
- Problem analysis API (AI tags problems with required skills)
- Problem collection in Firestore
- Seed 50 problems with skill tags
- Proficiency update logic (increment after each problem)

**New API Routes:**
- `POST /api/skills/analyze` - Analyze problem text/image for required skills
- `POST /api/skills/check-prerequisites` - Check if user has sufficient proficiency
- `GET /api/problems/practice` - Fetch practice problems for a skill
- `POST /api/proficiency/update` - Update user skill proficiency after problem attempt

**New Files:**
- `lib/skillGraph.ts` - SkillGraphManager class
- `lib/proficiencyTracker.ts` - Proficiency update functions
- `app/api/skills/analyze/route.ts`
- `app/api/skills/check-prerequisites/route.ts`
- `app/api/problems/practice/route.ts`
- `app/api/proficiency/update/route.ts`
- `scripts/seedProblems.ts` - Script to populate problem database

**Firestore Schema Additions:**
```
/problems/{problemId}
  - text, imageUrl, solution
  - requiredSkills: [skillId1, skillId2]
  - primarySkill: skillId
  - difficulty: 1-5
  - category, gradeLevel
  - source: 'system' | 'user'
  - createdAt
```

**AI Integration:**
- Skill analysis prompt: "Analyze this problem and tag with skills from this list: [skills]. Return JSON: { primarySkill, requiredSkills[], difficulty, reasoning }"
- Use GPT-4o-mini for cost efficiency
- Cache analysis results in problem document

---

### Phase 3: Adaptive Conversation & Branching
**Goal:** Session management, intelligent gap detection through conversation, branching to practice

**Deliverables:**
- Session state machine (tracking original problem, branches, conversation flow)
- Modified chat API to detect skill gaps during conversation (not upfront)
- Branch initiation logic ("Would you like to review division?")
- Practice problem tutoring
- Return-to-original flow with context preservation

**Session Flow:**
1. **Problem Submission** → AI analyzes skills quietly (doesn't branch yet)
2. **Student Attempts** → "How would you approach this problem?"
3. **Clarifying Questions** → AI asks follow-ups to probe understanding
4. **Gap Detection** → If student struggles with prerequisite, suggest practice
5. **Branch (if accepted)** → 3 practice problems with Socratic tutoring
6. **Return** → "Great work on [skill]. Now let's apply it to your original problem."

**Changes to Existing Code:**
- Extend `ConversationContext` to track session ID and branch context
- Modify `/api/chat` to:
  - Load session from Firestore
  - Check proficiency before responding
  - Detect gaps from student's responses (not just problem requirements)
  - Initiate branches when appropriate
  - Track which skill is being practiced
- Update chat UI to show branch indicators

**New API Routes:**
- `POST /api/sessions/create` - Start new tutoring session
- `POST /api/sessions/{id}/message` - Send message (handles branching logic)
- `POST /api/sessions/{id}/branch` - Initiate skill practice branch

**New Files:**
- `lib/sessionManager.ts` - Session state machine
- `components/chat/BranchNotification.tsx` - "Now practicing: Division"
- `components/chat/SessionBreadcrumbs.tsx` - Show current context

**Firestore Schema Additions:**
```
/sessions/{sessionId}
  - userId, originalProblemId, originalProblemText
  - status: 'active' | 'completed' | 'abandoned'
  - currentBranch?: { skillId, problemIds, currentIndex }
  - branches: [{ skillId, skillName, reason, problemsCompleted, completedAt }]
  - messages: [{ role, content, timestamp, metadata: { branchId?, skillsUsed? } }]
  - createdAt, lastMessageAt
```

**AI Prompt Updates:**
- Add session context to system prompt: "Original problem: X. Student has practiced: Y. Current focus: Z."
- Include proficiency levels: "Student's proficiency: division (Learning), fractions (Unknown)"
- Branch detection: "Based on this response, does the student lack prerequisite skills? If yes, which skill should they practice?"

---

### Phase 4: Real-Time Proficiency & Dashboard
**Goal:** Live skill updates during conversation, enhanced dashboard visualization

**Deliverables:**
- Real-time proficiency computation after each problem
- Skill decay algorithm (proficiency decreases without practice)
- Enhanced dashboard with skill tree visualization
- Proficiency level badges and progress bars
- Skill recommendations ("You should practice: X, Y, Z")

**Dashboard Features:**
- Interactive skill tree (show prerequisites/dependencies)
- Color-coded proficiency: Red (Unknown), Yellow (Learning), Green (Proficient), Blue (Mastered)
- Clickable skills → detailed view (problems solved, success rate, last practiced)
- "Practice Now" buttons for weak skills
- Recent activity feed

**New Components:**
- `components/dashboard/SkillTreeVisualization.tsx` - Interactive graph
- `components/dashboard/SkillDetailCard.tsx` - Individual skill view
- `components/dashboard/ProficiencyBadge.tsx` - Visual level indicator
- `components/dashboard/RecommendedPractice.tsx` - Suggested skills

**Proficiency Algorithm:**
```typescript
Level 0 (Unknown): 0 problems solved
Level 1 (Learning): 1-4 problems solved, any success rate
Level 2 (Proficient): 5+ problems, 70%+ success rate
Level 3 (Mastered): 10+ problems, 90%+ success rate

Decay Factor: proficiency * max(0.5, 1 - daysSinceLastPractice/90)
```

**Real-Time Updates:**
- After each correct/incorrect answer, update skill proficiency in Firestore
- Firestore listeners update dashboard in real-time
- Show celebrations when student levels up ("You're now Proficient in Division!")

---

### Phase 5: Polish, Testing & Optimization
**Goal:** Production-ready demo with smooth UX

**Deliverables:**
- End-to-end testing (10+ user scenarios)
- Edge case handling (infinite branch loops, missing skills, session recovery)
- Performance optimization (cache skill graph, optimize Firestore queries)
- Onboarding tutorial for new users
- Error states and loading skeletons
- Session persistence across page refreshes

**Testing Scenarios:**
- Complete flow: signup → profile → problem → branch → return → solve
- Edge case: student declines branch suggestion
- Edge case: student abandons session during branch
- Edge case: skill proficiency updates correctly after multiple problems
- Edge case: AI misidentifies required skills (graceful handling)
- Performance: skill analysis < 2s, branching decision < 1s

**UX Refinements:**
- Smooth transitions between branches (fade in/out)
- Clear visual hierarchy (original problem always visible)
- Encouraging messaging throughout
- Onboarding flow: "Welcome! Let's start by finding your current skill level."
- Branch consent UI: Modal or inline suggestion with accept/decline buttons

**Performance:**
- Cache skill graph in memory on server startup
- Firestore composite indexes for common queries
- Optimize message history loading (paginate if > 50 messages)
- Loading skeletons for skill dashboard

---

## Key Changes to Existing Codebase

### Reuse As-Is
- `MathDisplay` - LaTeX rendering
- `ChatMessage`, `ChatMessageList` - Message display
- `ChatInput` - Text input
- `ImageUpload` - Problem image upload
- `LoadingIndicator` - Loading UI
- Math utilities (`mathUtils.ts`) - LaTeX conversion

### Adapt & Extend
- `ConversationContext` - Add session ID, branch context, Firestore sync
- `app/page.tsx` - Refactor for auth state (logged out → login, logged in → chat)
- `app/api/chat/route.ts` - Extend with skill detection, branching logic, session management
- `prompts/socraticPrompt.ts` - Add adaptive context (proficiency, branch status)

### New Systems
- Authentication system (Firebase Auth + contexts)
- Session management (Firestore sessions collection)
- Skill graph utilities (load, traverse, query)
- Proficiency tracking (update, compute levels, decay)
- Dashboard & visualization (skill tree, progress)

---

## Initial Skill Tree Structure

**Focus Area:** Algebra + Prerequisites

### Level 1 (Foundational)
- `addition` - Addition
- `subtraction` - Subtraction
- `multiplication` - Multiplication
- `division` - Division

### Level 2 (Intermediate)
- `fractions` - Fractions (prerequisites: division)
- `decimals` - Decimals (prerequisites: division)
- `percentages` - Percentages (prerequisites: fractions, division)
- `negative-numbers` - Negative Numbers (prerequisites: subtraction)

### Level 3 (Pre-Algebra)
- `order-of-operations` - Order of Operations (prerequisites: addition, subtraction, multiplication, division)
- `exponents` - Exponents (prerequisites: multiplication)
- `factors-multiples` - Factors & Multiples (prerequisites: multiplication, division)

### Level 4 (Algebra Basics)
- `variables` - Variables & Expressions (prerequisites: order-of-operations)
- `linear-equations` - Linear Equations (prerequisites: variables, addition, subtraction, multiplication, division)
- `inequalities` - Inequalities (prerequisites: linear-equations)

### Level 5 (Algebra)
- `systems-of-equations` - Systems of Equations (prerequisites: linear-equations)
- `quadratic-equations` - Quadratic Equations (prerequisites: linear-equations, exponents)
- `functions` - Functions (prerequisites: variables, linear-equations)

**Total:** 17 skills (can trim to 10-12 for MVP by focusing on one path, e.g., Algebra basics)

**Stored as JSON:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-04",
  "skills": {
    "division": {
      "name": "Division",
      "prerequisites": [],
      "level": 1
    },
    "fractions": {
      "name": "Fractions",
      "prerequisites": ["division"],
      "level": 2
    },
    "linear-equations": {
      "name": "Linear Equations",
      "prerequisites": ["variables", "addition", "subtraction", "multiplication", "division"],
      "level": 4
    }
    // ... etc
  }
}
```

---

## Migration Strategy

### From Current Stateless App

**Current State:**
- Stateless chat (no user accounts)
- No skill tracking
- No session persistence
- Pure Socratic tutoring (no branching)

**Migration Path:**
1. **Phase 1:** Add auth as optional (users can still use without login, but no skill tracking)
2. **Phase 2:** Once logged in, start tracking skills silently (no branching yet)
3. **Phase 3:** Enable branching for logged-in users
4. **Phase 4:** Promote dashboard as primary landing page for logged-in users

**Backward Compatibility:**
- Keep anonymous chat mode for demos (no login required)
- Logged-in users get full adaptive features
- Gradually transition UI to emphasize logged-in experience

---

## Success Criteria

### Functional
- ✅ User can sign up, create profile, view skill dashboard
- ✅ AI correctly tags problems with skills 85%+ of the time
- ✅ Branching triggers when student demonstrates skill gap
- ✅ Student can complete 3 practice problems and return to original
- ✅ Proficiency levels update after each problem
- ✅ Session persists across page refreshes

### UX
- ✅ Onboarding takes < 2 minutes
- ✅ Students understand why they're branching (clear messaging)
- ✅ Branch transitions feel smooth (no jarring context loss)
- ✅ Dashboard clearly shows progress

### Technical
- ✅ Skill analysis < 2s
- ✅ Firestore queries < 500ms (95th percentile)
- ✅ No infinite branch loops
- ✅ Session state remains consistent

---

## Risk Mitigation

### High Risk: AI Misidentifies Skills
- **Mitigation:** Start with manually tagged seed problems; validate AI tags against expected patterns; allow flagging incorrect tags

### High Risk: Infinite Branch Loops
- **Mitigation:** Hard limit of 2 branch levels deep; track branching history per session; don't branch on same skill twice

### Medium Risk: Context Loss During Branches
- **Mitigation:** Always display original problem; AI references original when returning; breadcrumb UI showing context

### Medium Risk: Proficiency Algorithm Inaccuracy
- **Mitigation:** Conservative thresholds; manual proficiency override; track history for debugging

---

## Next Steps

### Immediate (Phase 0):
1. **Complete all manual setup tasks** listed in Phase 0
2. **Create skill graph JSON** with 12+ skills
3. **Create seed problems JSON** with 50+ problems (can use AI to generate)
4. **Set up Firebase project** and get all credentials
5. **Install dependencies** and configure environment variables

### After Phase 0 Complete:
6. **Begin Phase 1 implementation** (authentication & data foundation)
7. **Upload data to Firestore** using scripts
8. **Build login/signup pages**
9. **Create basic dashboard**

**Once Phase 0 is verified complete, ready to create detailed PRD for Phase 1.**

---

**Document Version:** 2.0
**Status:** Phase 0 Manual Setup Required → Then Ready for PRD Creation
