# Feature Planning: Adaptive Skill-Based Learning System

**Date:** 2025-11-04
**Status:** Exploration Phase
**Next Step:** Discussion → PRD Creation

## Feature Request Summary

Transform the Math Tutor from a stateless demo application into a personalized learning platform that tracks student skill proficiency, identifies knowledge gaps in real-time, and adaptively branches to prerequisite skill practice when needed. The system will maintain individual student profiles with skill progression data, dynamically analyze problem requirements, detect missing prerequisites, and orchestrate multi-level tutoring sessions that return to the original problem after gap remediation.

This represents a major architectural evolution from session-based tutoring to a persistent, data-driven adaptive learning system.

---

## Initial Questions & Clarifications

### Scope & User Experience

**Q1: What defines "proficiency" in a skill?**
- Is it purely problem count (e.g., 5 successful problems = proficient)?
- Do we need success rate tracking (e.g., 80% correct = proficient)?
- Should time-to-solution factor into proficiency scores?
- Do skills decay over time without practice (spaced repetition considerations)?

**Q2: How aggressive should adaptive branching be?**
- Branch on first missing prerequisite detected?
- Allow student to attempt original problem first, then branch if they struggle?
- Provide a choice: "I notice you might need to review X. Would you like to practice, or try this problem first?"
- Should branching depth be limited (e.g., max 2 levels deep)?

**Q3: What's the target user base?**
- Still demo-focused (showcase adaptive learning to recruiters)?
- Targeting actual students for beta testing?
- Will there be multiple concurrent users (family accounts, classroom deployment)?
- This affects infrastructure choices (Firebase vs. more scalable solutions)

**Q4: Problem sourcing strategy?**
- How many seeded problems per skill (10? 50? 100+)?
- Will these be manually curated or LLM-generated?
- Can students practice on their own uploaded problems while still tracking skills?
- What happens when the problem pool for a skill is exhausted?

**Q5: Skill tree complexity?**
- How granular should skills be? (e.g., "Division" vs. "Long Division" vs. "Division with Remainders")
- How many total skills in MVP? (50? 100? 500?)
- Will skill tree be static or evolve based on usage patterns?
- Should it support multiple subject areas (Algebra, Geometry, Calculus) or start with one?

---

## Possible User Stories

### Primary Use Cases

#### 1. Student Profile Creation & Onboarding

**As a new student, I want to create a profile with my grade level and learning goals so that the system can tailor problem difficulty and track my progress appropriately.**

- **Scenario:** Student signs up for the first time
- **Expected outcome:**
  - Account created via Firebase Auth (email/password or Google SSO)
  - Student selects grade level (3rd - College)
  - Student selects current focus topic (Arithmetic, Algebra, Geometry, etc.)
  - All skills initialize with "unknown" proficiency
  - Student is guided to first problem submission

#### 2. Adaptive Skill Gap Detection & Branching

**As a student working on a problem, I want the system to detect when I'm missing prerequisite knowledge and guide me to practice those skills first, so that I can build a strong foundation before tackling advanced problems.**

- **Scenario:** 7th grader submits "Solve: 3x + 5 = 14"
  - AI analyzes required skills: [algebra fundamentals, subtraction, division, equation solving]
  - System checks proficiency: student has 0 problems solved in "division"
  - AI says: "I notice solving this equation requires division. Let's practice a few division problems first to make sure you're comfortable."
  - System presents 3 division problems
  - Student solves them → proficiency updated
  - System returns: "Great! Now let's apply what you just practiced to the original problem."

- **Expected outcome:** Student successfully learns prerequisite, then solves original problem with better understanding

#### 3. Real-Time Skill Proficiency Tracking

**As a student, I want my skill proficiency to update automatically as I solve problems, so that I can see my progress and the system knows what I've mastered.**

- **Scenario:** Student solves a multi-step algebra problem that uses: [order of operations, distribution, combining like terms, division]
- **Expected outcome:**
  - Each skill's proficiency score increases
  - Problem count per skill increments
  - Success rate for each skill updates
  - Student's profile reflects new capabilities
  - Future problem difficulty adjusts upward for mastered skills

#### 4. Returning to Original Problem After Branch

**As a student who was branched to prerequisite practice, I want to seamlessly return to my original problem with context preserved, so that I can apply what I just learned without confusion.**

- **Scenario:** Student branched from "Pythagorean theorem" problem to practice "exponents" and "square roots"
- **Expected outcome:**
  - Conversation context maintains both sessions
  - AI references the branch: "Now that you've practiced exponents and square roots, let's return to your triangle problem"
  - Original problem image/text is re-displayed
  - Student continues with enhanced understanding
  - No jarring context loss

#### 5. Skill Tree Visualization

**As a student, I want to see which skills I've mastered and which are prerequisites for my goals, so that I can understand my learning path and feel motivated by progress.**

- **Scenario:** Student opens their profile dashboard
- **Expected outcome:**
  - Visual skill tree/graph showing relationships
  - Color-coded proficiency levels (red = not practiced, yellow = learning, green = proficient)
  - Clear paths showing prerequisites for target skills
  - Gamification elements (badges, progress bars, skill unlocks)

### Secondary/Future Use Cases

- **As a teacher, I want to track multiple students' skill progression so that I can identify common gaps and provide targeted support**
  - Classroom dashboard, aggregated analytics, intervention recommendations

- **As a student, I want the system to recommend daily practice problems based on my weak skills and learning goals so that I can improve efficiently**
  - Daily personalized problem feed, spaced repetition algorithm, difficulty auto-adjustment

- **As a student, I want to compete with friends on skill mastery leaderboards so that learning feels engaging and social**
  - Friend system, weekly challenges, skill-specific leaderboards

- **As a system, I want to analyze which skills students commonly struggle with so that I can improve problem quality and prerequisite mappings**
  - Analytics pipeline, automated skill tree refinement, problem difficulty calibration

---

## Feature Possibilities

### Option A: Full Graph Database (Neo4j) Approach

**Description:** Use Neo4j or similar graph database to model skills as nodes and relationships (prerequisites, sub-skills, related-to) as edges. Firebase handles authentication and user profiles, while Neo4j stores the skill graph and problem-skill mappings.

**Pros:**
- **Natural representation:** Graph databases are purpose-built for hierarchical relationship modeling
- **Powerful queries:** Efficiently traverse prerequisite chains ("What skills do I need before learning calculus?")
- **Flexible relationships:** Easily add new relationship types (e.g., "commonly-practiced-together", "alternative-paths")
- **Scalability:** Handle complex skill trees with thousands of nodes without performance degradation
- **Advanced features:** Graph algorithms for learning path optimization, skill clustering, gap analysis

**Cons:**
- **Increased complexity:** Additional database to manage, deploy, and maintain
- **Dual-database sync:** Need to coordinate between Firebase (users) and Neo4j (skills/problems)
- **Cost:** Neo4j hosting adds expense (though AuraDB has free tier)
- **Learning curve:** Graph query language (Cypher) is less familiar than SQL/NoSQL
- **Deployment overhead:** More moving parts for a demo/portfolio project

**What we'd need:**
- Neo4j AuraDB (cloud-hosted) or self-hosted Neo4j instance
- Node.js Neo4j driver for API integration
- Data modeling expertise for optimal graph structure
- Migration scripts to seed initial skill tree
- Backup/sync strategy between Firebase and Neo4j

**Best fit for:** Production-scale deployment with complex skill relationships and thousands of students. Overkill for MVP but excellent showcase of advanced tech.

---

### Option B: Firestore Document-Based Approach

**Description:** Store everything in Firestore using carefully structured collections. Skills are documents with embedded prerequisite arrays, problems are documents with skill tag arrays. Relationships are modeled via document references and arrays.

**Structure:**
```
/users/{userId}
  - profile: { gradeLevel, focusTopic, createdAt }
  - skillProficiency: { [skillId]: { problemsSolved, successRate, lastPracticed } }

/skills/{skillId}
  - name, description, gradeLevel, category
  - prerequisites: [skillId1, skillId2, ...]
  - subSkills: [skillId1, skillId2, ...]
  - relatedSkills: [skillId1, skillId2, ...]

/problems/{problemId}
  - text, imageUrl, difficulty, category
  - requiredSkills: [skillId1, skillId2, ...]
  - createdBy: "system" | userId

/sessions/{sessionId}
  - userId, originalProblemId, status, createdAt
  - branches: [{ skillId, problemIds, completedAt }]
  - messages: [{ role, content, timestamp }]
```

**Pros:**
- **Single database:** Everything in Firebase ecosystem (simpler architecture)
- **Real-time updates:** Firestore's real-time listeners perfect for live proficiency tracking
- **Easy authentication integration:** Firebase Auth + Firestore work seamlessly together
- **Cost-effective:** Generous free tier, predictable pricing
- **Lower complexity:** Team likely already knows Firestore/NoSQL patterns
- **Fast MVP development:** Less infrastructure setup, familiar tools

**Cons:**
- **Query limitations:** Firestore queries are less powerful than graph queries (e.g., can't efficiently traverse multi-level prerequisites)
- **Data duplication:** Might need to denormalize data (copy skill names into problems for efficient display)
- **Relationship traversal:** Checking "all prerequisites recursively" requires multiple queries or client-side logic
- **Scalability concerns:** Large skill trees with deep nesting could hit query limits
- **Less semantic:** Relationships are just arrays of IDs, not first-class entities

**What we'd need:**
- Firestore security rules for user data isolation
- Indexing strategy for common queries (skillsByGradeLevel, problemsBySkill)
- Helper functions to traverse prerequisite chains
- Careful denormalization to avoid N+1 query problems
- Cloud Functions for complex operations (e.g., batch proficiency updates)

**Best fit for:** MVP development, demo purposes, small-to-medium scale (< 10,000 students). Pragmatic choice balancing functionality and complexity.

---

### Option C: Hybrid Approach (Firestore + Lightweight Graph)

**Description:** Use Firestore for operational data (users, sessions, problems) but maintain a simplified skill graph as a single denormalized document or client-side graph structure. Skill relationships are precomputed and cached.

**Structure:**
- Firestore handles authentication, user profiles, sessions, problem storage
- **Skill graph lives in:**
  - **Option C1:** Single `/skillGraph` document with entire tree serialized as JSON
  - **Option C2:** Client-side graph loaded on app start (fetched from CDN or Cloud Storage)
  - **Option C3:** Redis cache for fast graph queries (serverless Redis like Upstash)

**Example Skill Graph Document:**
```json
{
  "skills": {
    "addition": { "name": "Addition", "prerequisites": [], "level": 1 },
    "subtraction": { "name": "Subtraction", "prerequisites": ["addition"], "level": 2 },
    "algebra": { "name": "Algebra", "prerequisites": ["addition", "subtraction", "multiplication"], "level": 5 }
  },
  "version": "1.0.0",
  "lastUpdated": "2025-11-04"
}
```

**Pros:**
- **Best of both worlds:** Firestore simplicity for data, graph structure for skill relationships
- **Performance:** Entire skill graph can be cached in memory (small enough for hundreds of skills)
- **No additional database:** If using client-side or single-document approach
- **Easy graph operations:** Can use standard graph algorithms (topological sort, pathfinding) in code
- **Flexible:** Can switch to full graph DB later without major refactor

**Cons:**
- **Static skill graph:** Changes require re-deploying the graph document (not dynamic)
- **Client-side risk:** If graph is client-loaded, anyone can inspect/modify it (though not critical for demo)
- **Versioning complexity:** Managing skill graph versions as it evolves
- **Consistency:** Need to ensure graph and Firestore skills collection stay in sync

**What we'd need:**
- JSON skill graph schema and initial data
- Graph utility library (e.g., graphology) for traversal
- Caching strategy (in-memory, CDN, or Redis)
- Admin UI or script to update skill graph
- Version migration strategy

**Best fit for:** MVP with growth potential. Balances simplicity (Firestore) with graph capabilities (cached structure). Recommended for this project.

---

### Option D: PostgreSQL with Recursive Queries

**Description:** Use PostgreSQL (via Supabase or similar) for all data, leveraging recursive CTEs (Common Table Expressions) to query hierarchical skill relationships. Firebase Auth for authentication, Supabase handles everything else.

**Pros:**
- **Powerful SQL queries:** Recursive CTEs can traverse prerequisite trees efficiently
- **ACID transactions:** Strong consistency guarantees for skill updates
- **Mature ecosystem:** PostgreSQL is battle-tested, tons of tooling
- **Cost-effective:** Supabase has generous free tier
- **Real-time subscriptions:** Supabase offers real-time features like Firestore

**Cons:**
- **Switching databases:** Team may be more familiar with Firestore
- **Relational modeling:** Requires different mental model than document-based
- **Deployment complexity:** Another service to manage (though Supabase is simple)
- **May be overkill:** SQL's power not fully needed for this use case

**What we'd need:**
- Supabase project setup
- Schema design with junction tables for relationships
- Recursive query patterns for prerequisite traversal
- Row-level security policies
- Migration from current Firebase setup (if Firebase is already in use)

**Best fit for:** Teams comfortable with SQL and needing complex querying. Good option if starting from scratch, but not ideal if Firebase is already chosen.

---

## Recommendation: Hybrid Approach (Option C)

**Rationale:**

For this project's needs, **Option C (Firestore + Lightweight Graph)** strikes the optimal balance:

1. **MVP Speed:** Firestore is quick to set up and integrate with Firebase Auth
2. **Graph Capabilities:** Skill relationships can be modeled clearly in a cached structure
3. **Scalability Path:** Can migrate to Neo4j later if needed without major refactor
4. **Portfolio Value:** Demonstrates thoughtful architecture (not just throwing graph DB at the problem)
5. **Cost:** No additional database hosting costs
6. **Complexity:** Manageable for solo development or small team

**Implementation approach:**
- Store skill graph as JSON in Cloud Storage
- Load into memory on server startup (Next.js API routes)
- Use Firestore for all dynamic data (users, sessions, proficiency)
- Precompute common graph queries (e.g., "all prerequisites for calculus") and cache

**When to reconsider:**
- If skill tree exceeds 500+ skills → consider Neo4j
- If relationship types become highly complex → consider Neo4j
- If real-time skill graph updates needed → consider Redis or graph DB

---

## Database Architecture Design

### Firestore Schema (Option C Approach)

#### Collections Structure

**1. Users Collection:** `/users/{userId}`

```typescript
interface UserProfile {
  // Basic Info
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName?: string;

  // Learning Context
  gradeLevel: 'elementary' | 'middle' | 'high' | 'college';
  focusTopic?: string;            // "Algebra", "Geometry", etc.

  // Metadata
  createdAt: Timestamp;
  lastActive: Timestamp;

  // Skill Proficiency (embedded for fast reads)
  skillProficiency: {
    [skillId: string]: {
      level: 0 | 1 | 2 | 3;       // 0=unknown, 1=learning, 2=proficient, 3=mastered
      problemsSolved: number;
      successCount: number;        // Number of correct attempts
      lastPracticed: Timestamp;
      firstPracticed: Timestamp;
    }
  }
}
```

**Design decisions:**
- Skill proficiency embedded in user document (not sub-collection) for atomic updates
- Success rate computed as `successCount / problemsSolved`
- Level determined by algorithm (e.g., 5+ problems with 80%+ success = proficient)

---

**2. Skills Collection:** `/skills/{skillId}`

```typescript
interface Skill {
  id: string;                     // "addition", "quadratic-equations", etc.
  name: string;                   // "Addition", "Quadratic Equations"
  description: string;
  category: 'arithmetic' | 'algebra' | 'geometry' | 'calculus' | 'statistics';
  gradeLevel: string[];           // ["elementary", "middle"] - can span multiple

  // Not stored here - lives in skill graph JSON
  // prerequisites: string[];
  // subSkills: string[];
  // relatedSkills: string[];

  // Problem generation hints
  exampleProblems: string[];      // Sample problems for this skill
  latexTemplate?: string;         // For automatic problem generation

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Design decisions:**
- Relationships (prerequisites, etc.) stored in separate skill graph JSON
- This collection is for metadata and problem generation templates
- Allows graph to evolve separately from skill descriptions

---

**3. Problems Collection:** `/problems/{problemId}`

```typescript
interface Problem {
  id: string;

  // Content
  text: string;                   // LaTeX-formatted problem text
  imageUrl?: string;              // If problem has diagram
  solution?: string;              // For system-generated problems

  // Classification
  requiredSkills: string[];       // [skillId1, skillId2, ...]
  primarySkill: string;           // Main skill being tested
  difficulty: 1 | 2 | 3 | 4 | 5;  // 1=easiest, 5=hardest
  category: string;               // Same as Skill category
  gradeLevel: string;

  // Provenance
  source: 'system' | 'user' | 'generated';
  createdBy?: string;             // userId if user-submitted

  // Metadata
  timesAttempted: number;         // Analytics
  averageSuccessRate: number;
  createdAt: Timestamp;
}
```

**Design decisions:**
- `requiredSkills` is the key field for adaptive branching
- System curates a seed set of problems per skill
- Users can upload problems → AI analyzes to tag with skills
- Success rate tracking helps calibrate difficulty

---

**4. Sessions Collection:** `/sessions/{sessionId}`

```typescript
interface TutoringSession {
  id: string;
  userId: string;

  // Original Problem Context
  originalProblemId: string;
  originalProblemText: string;    // Cached for display

  // Session State
  status: 'active' | 'completed' | 'abandoned';
  currentBranch?: string;         // If branched, which skill are we practicing?

  // Branching History
  branches: BranchRecord[];

  // Conversation
  messages: Message[];            // Full conversation history

  // Metadata
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  completedAt?: Timestamp;
}

interface BranchRecord {
  skillId: string;
  skillName: string;
  reason: string;                 // "Missing prerequisite: division"
  problemsAssigned: string[];     // [problemId1, problemId2]
  problemsCompleted: string[];
  completedAt?: Timestamp;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    branchId?: string;            // Which branch this message belongs to
    skillsUsed?: string[];        // For proficiency tracking
  }
}
```

**Design decisions:**
- Session tracks the full journey including branches
- Messages include metadata for skill tracking
- System can reconstruct entire conversation flow for analysis

---

**5. Skill Graph (Cloud Storage JSON)**

**Location:** `gs://bucket-name/skillGraph.json` or single Firestore doc at `/config/skillGraph`

```typescript
interface SkillGraph {
  version: string;                // "1.0.0"
  lastUpdated: string;            // ISO timestamp

  skills: {
    [skillId: string]: {
      name: string;
      prerequisites: string[];    // [skillId1, skillId2]
      subSkills: string[];        // Skills this one contains
      relatedSkills: string[];    // Often practiced together
      level: number;              // Hierarchical level (1=foundational, 5=advanced)
    }
  };

  // Precomputed paths for performance
  precomputedPaths?: {
    [skillId: string]: {
      allPrerequisites: string[]; // Flattened prerequisite tree
      dependents: string[];       // Skills that depend on this one
    }
  };
}
```

**Example:**
```json
{
  "version": "1.0.0",
  "skills": {
    "addition": {
      "name": "Addition",
      "prerequisites": [],
      "subSkills": ["single-digit-addition", "multi-digit-addition"],
      "relatedSkills": ["counting", "number-sense"],
      "level": 1
    },
    "algebra-basics": {
      "name": "Basic Algebra",
      "prerequisites": ["addition", "subtraction", "multiplication", "division"],
      "subSkills": ["variable-introduction", "simple-equations"],
      "relatedSkills": ["order-of-operations"],
      "level": 3
    }
  }
}
```

---

### Query Patterns

**1. Check User Proficiency for Required Skills**
```typescript
// API route: /api/check-prerequisites
async function checkPrerequisites(userId: string, requiredSkills: string[]) {
  const userDoc = await firestore.collection('users').doc(userId).get();
  const proficiency = userDoc.data().skillProficiency;

  const missingSkills = requiredSkills.filter(skillId => {
    const prof = proficiency[skillId];
    return !prof || prof.level === 0 || prof.problemsSolved < 3;
  });

  // Use skill graph to find prerequisites of missing skills
  const allPrerequisites = getPrerequisites(missingSkills);

  return { missingSkills, allPrerequisites };
}
```

**2. Get Practice Problems for Skill**
```typescript
async function getPracticeProblems(skillId: string, count: number = 3) {
  return await firestore
    .collection('problems')
    .where('primarySkill', '==', skillId)
    .where('difficulty', '<=', 3) // Start with easier problems
    .orderBy('timesAttempted', 'asc') // Prefer less-used problems
    .limit(count)
    .get();
}
```

**3. Update Skill Proficiency After Problem**
```typescript
async function updateSkillProficiency(
  userId: string,
  skillsUsed: string[],
  success: boolean
) {
  const userRef = firestore.collection('users').doc(userId);

  const updates = {};
  skillsUsed.forEach(skillId => {
    const path = `skillProficiency.${skillId}`;
    updates[`${path}.problemsSolved`] = FieldValue.increment(1);
    if (success) {
      updates[`${path}.successCount`] = FieldValue.increment(1);
    }
    updates[`${path}.lastPracticed`] = Timestamp.now();
  });

  await userRef.update(updates);

  // Recompute proficiency levels
  await recomputeProficiencyLevels(userId, skillsUsed);
}
```

---

### Skill Graph Management

**Loading Strategy:**
1. Server startup: Load skill graph JSON into memory
2. Cache in Next.js API route (edge function compatible)
3. Expose utility functions: `getPrerequisites()`, `getSubSkills()`, `findLearningPath()`

**Graph Utility Functions:**
```typescript
class SkillGraphManager {
  private graph: SkillGraph;

  constructor(graphData: SkillGraph) {
    this.graph = graphData;
  }

  // Get all prerequisites (recursive)
  getAllPrerequisites(skillId: string): string[] {
    const skill = this.graph.skills[skillId];
    if (!skill || skill.prerequisites.length === 0) return [];

    const prereqs = [...skill.prerequisites];
    skill.prerequisites.forEach(prereqId => {
      prereqs.push(...this.getAllPrerequisites(prereqId));
    });

    return [...new Set(prereqs)]; // Deduplicate
  }

  // Find optimal learning path
  findLearningPath(fromSkills: string[], toSkill: string): string[] {
    // Topological sort + shortest path algorithm
    // Returns ordered list of skills to learn
  }

  // Check if skill is learnable given current proficiency
  isLearnable(skillId: string, masteredSkills: string[]): boolean {
    const prereqs = this.graph.skills[skillId].prerequisites;
    return prereqs.every(prereq => masteredSkills.includes(prereq));
  }
}
```

---

## AI/LLM Integration Strategy

### 1. Problem Skill Analysis

**Challenge:** Given a math problem (text or image), determine which skills are required to solve it.

#### Approach A: AI-Powered Skill Tagging (Recommended)

**How it works:**
1. When user submits a problem, send to GPT-4 with skill list context
2. Prompt: "Analyze this problem and identify required skills from this list: [skill names]. Return JSON: { primarySkill, requiredSkills[], reasoning }"
3. AI returns structured skill tags
4. System validates tags against skill graph (ensure skills exist)

**Prompt template:**
```typescript
const SKILL_ANALYSIS_PROMPT = `
You are a math education expert. Analyze the following problem and identify which mathematical skills are required to solve it.

Problem: ${problemText}

Available skills (ID - Name):
${skillList}

Return a JSON object with:
- primarySkill: The main skill being tested (skill ID)
- requiredSkills: All skills needed to solve this (array of skill IDs)
- difficulty: Estimated difficulty level (1-5)
- reasoning: Brief explanation of your analysis

Example response:
{
  "primarySkill": "quadratic-equations",
  "requiredSkills": ["quadratic-equations", "factoring", "multiplication", "order-of-operations"],
  "difficulty": 3,
  "reasoning": "This problem tests quadratic equations using the factoring method, requiring knowledge of factoring and basic algebraic manipulation."
}
`;
```

**Pros:**
- Flexible: Handles novel problem types
- Accurate: GPT-4 has strong math understanding
- Low maintenance: No manual tagging of thousands of problems

**Cons:**
- API cost: Every problem analysis costs tokens
- Latency: Adds 1-2 seconds to problem submission
- Reliability: Need validation/fallback if AI returns invalid skills

**Mitigation:**
- Cache analysis results per problem
- Use cheaper model (GPT-4o-mini) for this task
- Validate against known skill IDs
- Allow manual correction by students/admins

---

#### Approach B: Pre-Tagged Problem Database

**How it works:**
1. Curate 500-1000 problems, manually tag with skills
2. When student submits problem, try to match to existing problem
3. If no match, fall back to AI analysis (Approach A)

**Pros:**
- Zero cost for pre-tagged problems
- Instant response
- High quality tags (human-verified)

**Cons:**
- Requires significant upfront curation effort
- Limited to pre-tagged problems
- Students can't use custom problems without AI fallback

**Best for:** MVP with limited problem set, then expand over time

---

#### Approach C: Hybrid (Recommended for MVP)

**Implementation:**
1. Seed database with 100-200 pre-tagged problems covering core skills
2. Use AI analysis for user-submitted or novel problems
3. Cache AI analysis results to build library over time
4. Admin review process to verify AI tags periodically

**This balances quality, cost, and flexibility.**

---

### 2. Skill Gap Detection

**Challenge:** Decide when to branch to prerequisite practice vs. letting student continue.

#### Detection Strategy: Proficiency Threshold + AI Context

**Algorithm:**
```typescript
async function shouldBranch(
  userId: string,
  requiredSkills: string[],
  conversationContext: Message[]
): Promise<{ shouldBranch: boolean, skillsToPractice: string[] }> {

  // Step 1: Check proficiency scores
  const userProfile = await getUserProfile(userId);
  const weakSkills = requiredSkills.filter(skillId => {
    const prof = userProfile.skillProficiency[skillId];
    return !prof || prof.level < 2 || prof.problemsSolved < 5;
  });

  if (weakSkills.length === 0) {
    return { shouldBranch: false, skillsToPractice: [] };
  }

  // Step 2: Consult AI for context-aware decision
  const aiDecision = await askAI(`
    The student is working on a problem requiring these skills: ${requiredSkills.join(', ')}.

    Their proficiency:
    ${weakSkills.map(s => `- ${s}: ${userProfile.skillProficiency[s]?.problemsSolved || 0} problems solved`).join('\n')}

    Recent conversation:
    ${conversationContext.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

    Should we branch to practice ${weakSkills.join(', ')} before continuing?
    Consider: Is the student showing confusion? Have they asked for help?

    Respond: { "shouldBranch": true/false, "skillsToPractice": ["skill1", "skill2"], "reasoning": "..." }
  `);

  return aiDecision;
}
```

**Decision factors:**
1. **Proficiency threshold:** < 5 problems or < 80% success rate → consider branching
2. **Conversation context:** Student showing confusion or asking for help → more likely to branch
3. **Problem difficulty:** Harder problems may require stricter prerequisite checks
4. **Branching history:** Don't branch twice in a row (avoid infinite loops)

**Proficiency Levels:**
- **Level 0 (Unknown):** 0 problems solved → Branch immediately
- **Level 1 (Learning):** 1-4 problems solved → Branch if student seems confused
- **Level 2 (Proficient):** 5+ problems with 70%+ success → Don't branch
- **Level 3 (Mastered):** 10+ problems with 90%+ success → Definitely don't branch

---

### 3. Adaptive Tutoring Flow

**Challenge:** Orchestrate conversation across multiple branches while maintaining context.

#### Conversation State Machine

```typescript
enum SessionState {
  INITIAL_GREETING = 'initial_greeting',
  ANALYZING_PROBLEM = 'analyzing_problem',
  CHECKING_PREREQUISITES = 'checking_prerequisites',
  BRANCHING_TO_PRACTICE = 'branching_to_practice',
  PRACTICING_SKILL = 'practicing_skill',
  RETURNING_TO_ORIGINAL = 'returning_to_original',
  TUTORING_ORIGINAL = 'tutoring_original',
  COMPLETED = 'completed'
}

interface SessionContext {
  state: SessionState;
  originalProblem: Problem;
  requiredSkills: string[];
  currentBranch?: BranchContext;
  conversationHistory: Message[];
}

interface BranchContext {
  skillId: string;
  practiceProblems: Problem[];
  currentProblemIndex: number;
  completedSuccessfully: boolean;
}
```

#### Flow Orchestration

**1. Initial Problem Analysis:**
```typescript
async function handleProblemSubmission(problemText: string, userId: string) {
  // Analyze skills
  const { primarySkill, requiredSkills } = await analyzeSkills(problemText);

  // Check prerequisites
  const { shouldBranch, skillsToPractice } = await shouldBranch(
    userId,
    requiredSkills,
    []
  );

  if (shouldBranch) {
    return initiateSkillBranch(skillsToPractice[0], userId);
  } else {
    return startSocraticTutoring(problemText, userId);
  }
}
```

**2. Skill Branch Initiation:**
```typescript
async function initiateSkillBranch(skillId: string, userId: string) {
  const skill = await getSkill(skillId);
  const practiceProblems = await getPracticeProblems(skillId, 3);

  const branchMessage = `
I notice this problem requires ${skill.name}, which we should strengthen first.
Let's practice a few ${skill.name} problems, then we'll return to your original question.

Here's your first practice problem:
${practiceProblems[0].text}
  `;

  // Update session state
  await updateSession(userId, {
    state: SessionState.PRACTICING_SKILL,
    currentBranch: {
      skillId,
      practiceProblems,
      currentProblemIndex: 0,
      completedSuccessfully: false
    }
  });

  return { message: branchMessage, type: 'branch_start' };
}
```

**3. Practice Problem Tutoring:**
```typescript
async function handlePracticeProblemResponse(
  userResponse: string,
  userId: string
) {
  const session = await getSession(userId);
  const branch = session.currentBranch;

  // Evaluate student's answer
  const { isCorrect, feedback } = await evaluateAnswer(
    userResponse,
    branch.practiceProblems[branch.currentProblemIndex]
  );

  if (isCorrect) {
    // Update proficiency
    await updateSkillProficiency(userId, [branch.skillId], true);

    // Move to next problem or complete branch
    if (branch.currentProblemIndex < branch.practiceProblems.length - 1) {
      return nextPracticeProblem(session);
    } else {
      return completeBranch(session);
    }
  } else {
    // Continue Socratic guidance on this problem
    return socraticResponse(userResponse, session);
  }
}
```

**4. Returning to Original Problem:**
```typescript
async function completeBranch(session: SessionContext) {
  const skill = await getSkill(session.currentBranch.skillId);

  const returnMessage = `
Excellent work! You've shown strong understanding of ${skill.name}.

Now let's return to your original problem:
${session.originalProblem.text}

With what you just practiced, how would you approach this?
  `;

  await updateSession(session.userId, {
    state: SessionState.RETURNING_TO_ORIGINAL,
    currentBranch: null
  });

  return { message: returnMessage, type: 'branch_complete' };
}
```

---

#### Maintaining Context Across Branches

**Prompt Engineering Strategy:**

**System Prompt includes:**
```typescript
const ADAPTIVE_TUTORING_PROMPT = `
${BASE_SOCRATIC_PROMPT}

ADDITIONAL CONTEXT:
- Original problem: ${session.originalProblem.text}
- Student has completed practice on: ${completedBranches.map(b => b.skillName).join(', ')}
- Current focus: ${session.state === 'practicing_skill' ? 'Practice problem' : 'Original problem'}

BRANCHING RULES:
- If practicing a skill, focus ONLY on that skill's problem
- When returning to original problem, reference the practice: "Remember what we just practiced about [skill]..."
- Maintain encouraging tone: "Great work on [skill], now let's apply it here..."

CONTEXT PRESERVATION:
- The student may have asked questions during the original problem - refer back to these if relevant
- Build on concepts from practice when tutoring the original problem
`;
```

**Message metadata tracks branch context:**
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata: {
    branchId?: string;        // null = original problem, string = branch ID
    skillFocus?: string;      // Which skill this message relates to
    problemId?: string;       // Which problem this message discusses
  }
}
```

**When generating responses:**
- Filter conversation history by current context (original vs. branch)
- Include summary of completed branches in system prompt
- Reference branch outcomes when returning to original problem

---

### 4. Proficiency Scoring Algorithm

**Challenge:** Translate raw problem-solving data into meaningful proficiency levels.

#### Algorithm Design

```typescript
function computeProficiencyLevel(skillData: SkillProficiency): 0 | 1 | 2 | 3 {
  const { problemsSolved, successCount, lastPracticed } = skillData;

  if (problemsSolved === 0) return 0; // Unknown

  const successRate = successCount / problemsSolved;
  const daysSinceLastPractice = (Date.now() - lastPracticed.toMillis()) / (1000 * 60 * 60 * 24);

  // Decay factor (proficiency decreases if not practiced)
  const decayFactor = Math.max(0.5, 1 - (daysSinceLastPractice / 90)); // 50% decay after 90 days

  // Adjusted success rate
  const adjustedRate = successRate * decayFactor;

  // Level thresholds
  if (problemsSolved >= 10 && adjustedRate >= 0.90) return 3; // Mastered
  if (problemsSolved >= 5 && adjustedRate >= 0.70) return 2;  // Proficient
  if (problemsSolved >= 1) return 1;                          // Learning

  return 0; // Unknown
}
```

**Threshold Rationale:**
- **Level 3 (Mastered):** 10+ problems with 90%+ success shows deep understanding
- **Level 2 (Proficient):** 5+ problems with 70%+ success is solid competency
- **Level 1 (Learning):** 1+ problems attempted shows engagement
- **Decay:** Skills rust without practice - penalize long gaps

**Alternative: Bayesian Model**
- Start with prior distribution (student's grade level → expected skill)
- Update belief with each problem attempt (Bayesian inference)
- More sophisticated but harder to explain/debug

---

## Implementation Approach

### What to Reuse from Current App

#### Highly Reusable (Keep As-Is)
- **MathDisplay component:** LaTeX rendering works perfectly, no changes needed
- **ChatMessage & ChatMessageList:** Generic message display, just needs new message types (branch notifications)
- **ChatInput:** Text input component unchanged
- **LoadingIndicator:** Universal loading UI
- **ImageUpload:** Can still be used for problem images
- **TextInput:** Still needed for text problem entry
- **Math utilities (mathUtils.ts):** LaTeX conversion logic unchanged

#### Moderately Reusable (Adapt)
- **ConversationContext:** Need to extend for multi-branch support
  - Add `sessionId` tracking
  - Add `branchContext` to messages
  - Sync to Firestore instead of just local state
- **Header component:** Add user profile dropdown, skill progress link
- **Chat API route:** Core Socratic logic is reusable, but needs:
  - Skill proficiency checking
  - Branching decision logic
  - Session state management
- **Prompts (socraticPrompt.ts, etc.):** Extend to include adaptive context

#### Requires Significant Changes
- **Main page (page.tsx):** Complete refactor needed
  - Add authentication flow
  - Add session management
  - Add skill dashboard
  - Handle multiple app states (logged out → profile setup → problem solving → skill view)
- **API routes:** Add new routes:
  - `/api/auth/*` - Firebase Auth integration
  - `/api/skills/*` - Skill queries
  - `/api/sessions/*` - Session CRUD
  - `/api/analyze-problem` - Skill tagging
  - `/api/check-prerequisites` - Branching decisions

---

### Phased Implementation Plan

#### Phase 1: Core Infrastructure (Week 1-2)

**Milestone:** Authentication and user profiles working, skill graph loaded

**Tasks:**
1. **Firebase Setup**
   - Create Firebase project
   - Configure Firebase Auth (email + Google SSO)
   - Set up Firestore database
   - Define security rules

2. **User Profile System**
   - Create `/users` collection schema
   - Build profile creation flow (grade level, focus topic)
   - Create user dashboard component
   - Implement skill proficiency data structure

3. **Skill Graph Foundation**
   - Design skill graph JSON schema
   - Create initial skill graph (50-100 core skills across topics)
   - Build SkillGraphManager utility class
   - Store graph in Cloud Storage / Firestore config
   - Create skill detail pages

4. **Authentication UI**
   - Login/signup pages
   - Protected route middleware
   - User context provider
   - Profile settings page

**Deliverable:** Users can sign up, create profiles, and view skill tree (no tutoring yet)

---

#### Phase 2: Skill Analysis & Detection (Week 3-4)

**Milestone:** System can analyze problems and detect skill gaps

**Tasks:**
1. **Problem Analysis API**
   - Create `/api/analyze-problem` endpoint
   - Implement GPT-4 skill tagging
   - Build skill validation logic
   - Create problem storage in Firestore

2. **Prerequisite Checking**
   - Implement `/api/check-prerequisites` endpoint
   - Build graph traversal functions
   - Create proficiency threshold logic
   - Test branching decision algorithm

3. **Problem Database**
   - Seed 100-200 problems with manual skill tags
   - Create problem CRUD APIs
   - Build problem query functions (by skill, difficulty)
   - Add problem submission UI

4. **Proficiency Tracking**
   - Implement proficiency update functions
   - Build level computation algorithm
   - Create skill progress visualization components
   - Add real-time proficiency display

**Deliverable:** System can analyze submitted problems, identify required skills, and detect gaps

---

#### Phase 3: Adaptive Branching Logic (Week 5-6)

**Milestone:** Conversation flow with skill branches working end-to-end

**Tasks:**
1. **Session Management**
   - Create session collection schema
   - Build session state machine
   - Implement session CRUD APIs
   - Add session persistence to ConversationContext

2. **Branch Orchestration**
   - Implement skill branch initiation
   - Create practice problem selection logic
   - Build branch completion detection
   - Add "return to original" flow

3. **Conversation Context**
   - Extend Message type with branch metadata
   - Update chat API to handle branch context
   - Implement context filtering for prompts
   - Add branch indicators in UI

4. **UI Updates**
   - Add branch notification components ("Now practicing: Division")
   - Create branch navigation (breadcrumbs showing current context)
   - Add practice problem counter ("Problem 2 of 3")
   - Build branch history visualization

**Deliverable:** Complete adaptive flow - problem → gap detection → branch → practice → return → solve

---

#### Phase 4: Real-Time Proficiency Tracking (Week 7)

**Milestone:** Skills update in real-time as students solve problems

**Tasks:**
1. **Skill Detection in Conversation**
   - Enhance chat API to identify skills used in each exchange
   - Add skill tracking to message metadata
   - Implement real-time proficiency updates

2. **Proficiency Computation**
   - Build automatic level recomputation after each problem
   - Add decay factor calculation
   - Create proficiency history tracking
   - Implement spaced repetition hints

3. **Dashboard Enhancements**
   - Build real-time skill progress dashboard
   - Add proficiency level indicators
   - Create skill recommendation engine
   - Add "practice weak skills" quick actions

4. **Analytics & Insights**
   - Track problem completion rates
   - Identify commonly weak skills
   - Build learning path recommendations
   - Add achievement/milestone celebrations

**Deliverable:** Full adaptive learning system with real-time proficiency tracking

---

#### Phase 5: Polish & Testing (Week 8)

**Milestone:** Production-ready MVP

**Tasks:**
1. **End-to-End Testing**
   - Test complete user journeys (10+ scenarios)
   - Validate branching logic with edge cases
   - Test proficiency algorithm accuracy
   - Load test with simulated users

2. **UX Refinements**
   - Smooth transitions between branches
   - Clear visual hierarchy
   - Onboarding tutorial
   - Error state improvements

3. **Performance Optimization**
   - Cache skill graph in memory
   - Optimize Firestore queries
   - Reduce API call latency
   - Implement loading skeletons

4. **Documentation**
   - User guide
   - Admin documentation for skill graph updates
   - API documentation
   - Deployment guide

**Deliverable:** Polished, tested adaptive learning platform ready for beta users

---

### Technical Risks & Challenges

#### High Risk

**1. Skill Graph Complexity Explosion**
- **Risk:** Skill tree becomes too large/complex to manage manually
- **Impact:** Difficult to maintain, relationships become tangled
- **Mitigation:**
  - Start small (50-100 skills for MVP)
  - Use admin UI to visualize and edit graph
  - Implement versioning and rollback
  - Consider AI-assisted graph curation later

**2. AI Skill Detection Accuracy**
- **Risk:** GPT-4 misidentifies required skills, leading to incorrect branching
- **Impact:** Students branch unnecessarily or miss critical prerequisites
- **Mitigation:**
  - Pre-tag MVP problems manually
  - Implement confidence scoring (AI returns certainty)
  - Allow students to report incorrect branching
  - Admin review process for AI-tagged problems
  - Fallback to conservative detection (if uncertain, don't branch)

**3. Infinite Branch Loops**
- **Risk:** System detects gaps in branches, creating nested branches ad infinitum
- **Impact:** Students get stuck in endless prerequisite practice, never solve original problem
- **Mitigation:**
  - Hard limit on branch depth (max 2 levels)
  - Track branching history per session
  - Don't branch on same skill twice in one session
  - Escape hatch: "Skip prerequisite practice" button

#### Medium Risk

**4. Conversation Context Loss**
- **Risk:** Students lose track of original problem after branching
- **Impact:** Confusion, frustration, poor learning experience
- **Mitigation:**
  - Clear UI indicators (breadcrumbs, persistent original problem display)
  - AI references original problem when returning
  - Session summary at each transition
  - Option to review conversation history by branch

**5. Proficiency Tracking Errors**
- **Risk:** Algorithm incorrectly assesses proficiency (false positives/negatives)
- **Impact:** Students branch unnecessarily or skip needed practice
- **Mitigation:**
  - Conservative thresholds (require more evidence before declaring mastery)
  - Allow manual proficiency adjustments
  - Track proficiency history for debugging
  - A/B test different algorithms

**6. Firestore Query Performance**
- **Risk:** Complex queries for prerequisites/problems slow down at scale
- **Impact:** Laggy UX, poor demo experience
- **Mitigation:**
  - Denormalize data where needed
  - Cache skill graph in memory
  - Use Firestore composite indexes
  - Consider Redis cache for hot data

#### Low Risk

**7. Firebase Cost Overruns**
- **Risk:** Firestore read/write costs exceed budget
- **Impact:** Unexpected expenses
- **Mitigation:**
  - Monitor usage with Firebase console
  - Implement caching aggressively
  - Set billing alerts
  - Free tier should handle MVP traffic

**8. Multi-Device Session Sync**
- **Risk:** Student switches devices mid-session, loses context
- **Impact:** Minor UX issue
- **Mitigation:**
  - Firestore real-time sync handles this automatically
  - Test cross-device experience
  - Low priority for MVP

---

## Open Questions & Design Decisions

### Decision Points

#### Decision 1: Proficiency Scoring Granularity

**Options:**
- **A) Simple 4-level system** (Unknown, Learning, Proficient, Mastered)
- **B) Numeric 0-100 score**
- **C) Multi-dimensional** (Accuracy, Speed, Consistency)

**Considerations:**
- Simple system easier to explain and debug
- Numeric score gives more flexibility but harder to interpret
- Multi-dimensional captures nuance but complex to compute

**Recommendation:** Start with A (simple 4-level), can always add B later

---

#### Decision 2: Mini-Session Length

**Options:**
- **A) Fixed 3 problems** per skill branch
- **B) Adaptive** (2-5 problems based on student performance)
- **C) Until mastery** (keep practicing until proficiency threshold met)

**Considerations:**
- Fixed is predictable, students know what to expect
- Adaptive is more efficient but less predictable
- Until mastery could take too long, frustrate students

**Recommendation:** Start with A (fixed 3), then test B

---

#### Decision 3: Branching Consent

**Options:**
- **A) Auto-branch** (system decides, branches immediately)
- **B) Suggest and ask** ("I recommend practicing X first. Sound good?")
- **C) Always ask** (never branch without explicit consent)

**Considerations:**
- Auto-branch is seamless but students may feel railroaded
- Suggest/ask gives agency while still guiding
- Always ask may slow down learning flow

**Recommendation:** B (suggest and ask) - balances guidance and agency

---

#### Decision 4: Problem Generation vs. Seeded Database

**Options:**
- **A) Fully seeded** (manually curated 1000+ problems)
- **B) Fully generated** (AI creates problems on-demand)
- **C) Hybrid** (seeded core + generated variations)

**Considerations:**
- Seeded guarantees quality but requires huge upfront effort
- Generated is scalable but quality varies
- Hybrid is pragmatic

**Recommendation:** C (hybrid) - seed 100-200 per major skill, generate as needed

---

#### Decision 5: Skill Tree Visibility

**Options:**
- **A) Hidden** (students don't see skill names, just practice problems)
- **B) Visible but passive** (students see skills but can't choose)
- **C) Fully interactive** (students can select skills to practice)

**Considerations:**
- Hidden reduces cognitive load but limits transparency
- Visible but passive gives insight without overwhelming
- Fully interactive empowers students but may overwhelm

**Recommendation:** B for MVP (visible but passive), then test C

---

### Unknowns (Require Research/Testing)

**1. Optimal Proficiency Thresholds**
- What's the right balance between 5 problems = proficient vs. 10?
- Need A/B testing with real students

**2. Decay Rate for Skill Proficiency**
- How quickly do skills rust? 30 days? 90 days?
- Need educational research or experimentation

**3. Skill Graph Granularity**
- Is "division" one skill or multiple (long division, decimal division, fraction division)?
- Need to test different granularities

**4. AI Skill Detection Accuracy**
- What's the error rate for GPT-4 skill tagging?
- Need benchmark testing on 100+ problems

**5. Student Acceptance of Branching**
- Do students find branching helpful or annoying?
- Need user testing

---

### Trade-offs to Discuss

#### Trade-off 1: Branching Frequency vs. Flow State

**Tension:** Frequent branching maximizes learning but disrupts problem-solving flow

**Spectrum:**
- **Conservative:** Only branch if student has 0 attempts in a prerequisite skill
- **Moderate:** Branch if < 5 attempts or student shows confusion
- **Aggressive:** Branch if < 10 attempts or success rate < 80%

**Discussion:** How do we balance thorough preparation vs. letting students learn by trying?

---

#### Trade-off 2: Skill Tree Complexity vs. Simplicity

**Tension:** Detailed skill tree captures nuance but becomes unwieldy

**Spectrum:**
- **Simple:** 50 high-level skills (Addition, Algebra, Calculus)
- **Moderate:** 200 skills with 2-3 levels of hierarchy
- **Complex:** 500+ granular skills (Single-digit addition, Multi-digit addition, etc.)

**Discussion:** What's the sweet spot for MVP? Start simple, expand later?

---

#### Trade-off 3: AI Autonomy vs. Human Curation

**Tension:** AI skill tagging is scalable but imperfect; manual curation is accurate but slow

**Spectrum:**
- **Full AI:** All problems auto-tagged, no manual review
- **Hybrid:** AI tags, humans spot-check
- **Full Manual:** Every problem manually curated

**Discussion:** Where do we invest human time for maximum quality?

---

#### Trade-off 4: Data Persistence vs. Privacy

**Tension:** Tracking detailed learning data improves adaptivity but raises privacy concerns

**Spectrum:**
- **Minimal:** Only track proficiency levels, no problem history
- **Moderate:** Track proficiency + problem IDs + success/failure
- **Maximal:** Track full conversation logs, time-to-solution, hint requests

**Discussion:** For demo purposes, can go maximal; for production, need privacy policy

---

## Rough Implementation Thoughts

### Core Components Needed

#### 1. Authentication System

**Purpose:** User sign-up, login, session management

**Rough approach:**
- Firebase Auth SDK for client-side
- Next.js middleware for route protection
- Server-side auth verification in API routes
- Auth context provider for React

**Components:**
- `AuthProvider` (context)
- `LoginPage`, `SignupPage`, `ProfileSetupPage`
- `ProtectedRoute` wrapper
- `/api/auth/*` endpoints (if needed beyond Firebase)

---

#### 2. Skill Graph Manager

**Purpose:** Load, query, and traverse skill relationships

**Rough approach:**
- Singleton class that loads JSON on server startup
- Exposes methods: `getPrerequisites()`, `findPath()`, `isLearnable()`
- Caches results for performance
- Updates via admin API (not runtime mutation)

**Implementation:**
```typescript
// lib/skillGraph.ts
export class SkillGraphManager {
  private static instance: SkillGraphManager;
  private graph: SkillGraph;

  static async getInstance() {
    if (!this.instance) {
      const graphData = await loadFromFirestore('config/skillGraph');
      this.instance = new SkillGraphManager(graphData);
    }
    return this.instance;
  }

  // Methods: getAllPrerequisites, findLearningPath, etc.
}
```

---

#### 3. Problem Analyzer

**Purpose:** Tag problems with required skills using AI

**Rough approach:**
- API endpoint `/api/analyze-problem`
- Accepts problem text/image
- Calls GPT-4 with skill list in prompt
- Returns structured JSON with skill tags
- Caches results per problem

**Integration:**
- Called when user submits new problem
- Results stored in Firestore problem document
- Manual override option for incorrect tags

---

#### 4. Branching Decision Engine

**Purpose:** Determine when to branch based on proficiency + context

**Rough approach:**
- Function that takes: `(userId, requiredSkills, conversationContext)`
- Checks proficiency scores against thresholds
- Optionally consults AI for context-aware decision
- Returns: `{ shouldBranch, skillToPractice, reasoning }`

**Integration:**
- Called after problem analysis
- Called periodically during conversation (check if struggling)
- Results logged to session for analytics

---

#### 5. Session Orchestrator

**Purpose:** Manage conversation flow, branch transitions, state persistence

**Rough approach:**
- State machine pattern with clear transitions
- Stores full session context in Firestore
- Handles message routing (original problem vs. branch)
- Coordinates between chat API and skill tracking

**Components:**
- `SessionManager` class
- `/api/sessions/*` endpoints
- `SessionContext` provider for React
- Transition logic for each state

---

#### 6. Proficiency Tracker

**Purpose:** Update skill proficiency in real-time after each problem attempt

**Rough approach:**
- Atomic Firestore updates to user's `skillProficiency` map
- Triggers level recomputation
- Logs proficiency history for analytics
- Handles batch updates (one problem uses multiple skills)

**Implementation:**
```typescript
// lib/proficiencyTracker.ts
export async function updateProficiency(
  userId: string,
  skillsUsed: string[],
  success: boolean
) {
  // Firestore transaction for atomic updates
  // Recompute levels
  // Emit event for real-time UI updates
}
```

---

#### 7. Dashboard & Skill Visualization

**Purpose:** Show student their skill tree, proficiency levels, progress

**Rough approach:**
- Interactive skill tree visualization (D3.js or Recharts)
- Color-coded by proficiency level
- Clickable skills to see details/history
- Recommendations for skills to practice next

**Components:**
- `SkillTreeVisualization`
- `SkillDetailCard`
- `ProficiencyProgressBar`
- `RecommendedPractice`

---

### Integration Points

#### Frontend (React/Next.js)

**Affected Areas:**
- **Auth flow:** New pages for login/signup/profile setup
- **Main app page:** Refactor to handle authenticated state
- **Chat UI:** Add branch indicators, session context display
- **Navigation:** Add dashboard link, profile dropdown
- **New pages:** Skill tree view, profile settings, problem history

**New Components:**
- `SkillDashboard` - Main skill visualization page
- `BranchNotification` - "Now practicing: Division"
- `SessionBreadcrumbs` - Shows current context in conversation
- `ProficiencyBadge` - Display skill level (beginner/proficient/mastered)
- `PracticeProblemCounter` - "Problem 2 of 3"

---

#### Backend (Next.js API Routes)

**New Routes:**
- `/api/auth/session` - Verify user session
- `/api/skills/analyze` - Analyze problem for required skills
- `/api/skills/prerequisites` - Check user's prerequisite proficiency
- `/api/sessions/create` - Start new tutoring session
- `/api/sessions/[id]/message` - Send message to session
- `/api/sessions/[id]/branch` - Initiate skill branch
- `/api/proficiency/update` - Update user skill proficiency
- `/api/problems/practice` - Get practice problems for skill
- `/api/problems/submit` - Submit user-created problem

**Modified Routes:**
- `/api/chat` - Extend to handle session context, branching logic
- `/api/parse-image` - Add skill analysis after parsing

---

#### Database (Firestore)

**New Collections:**
- `/users` - User profiles and skill proficiency
- `/skills` - Skill metadata
- `/problems` - Problem database with skill tags
- `/sessions` - Active and historical tutoring sessions
- `/config` - Skill graph and system configuration

**Indexes Needed:**
- `problems` by `primarySkill` + `difficulty`
- `problems` by `requiredSkills` array
- `sessions` by `userId` + `status`
- `sessions` by `lastMessageAt` (for cleanup)

---

#### External Services

**Firebase:**
- **Firebase Auth:** User authentication
- **Firestore:** Primary database
- **Cloud Storage:** Skill graph JSON, uploaded problem images
- **Cloud Functions (optional):** Background proficiency computations

**OpenAI API:**
- **GPT-4o:** Socratic tutoring (existing)
- **GPT-4o-mini:** Skill analysis (new)
- **GPT-4 Vision:** Image parsing (existing)

**Potential Future:**
- **Redis/Upstash:** Cache for skill graph, hot data
- **Analytics:** PostHog, Mixpanel for usage tracking

---

## Success Criteria (Preliminary)

### Functional Success

- **Skill detection accuracy:** 85%+ of problems correctly tagged with required skills
- **Branching effectiveness:** Students who branch solve original problem with 70%+ success rate
- **Proficiency tracking:** Level assignments match manual review 90%+ of time
- **Session persistence:** Zero data loss across page refreshes, device switches
- **Performance:** Skill analysis < 2s, branching decision < 1s, proficiency update < 500ms

### User Experience Success

- **Onboarding completion:** 80%+ of new users complete profile setup
- **Branching acceptance:** Students don't abandon session after branch (< 10% abandonment)
- **Dashboard engagement:** 60%+ of users visit skill dashboard at least once
- **Perceived value:** User testing shows students understand and appreciate adaptive features

### Technical Success

- **Test coverage:** 80%+ coverage for core branching logic
- **Uptime:** 99.5%+ availability
- **Database performance:** 95th percentile query time < 500ms
- **Error rate:** < 1% of API calls fail

---

## Next Steps

### Before Moving to PRD

- [ ] **Decide on proficiency scoring system** (4-level vs. numeric vs. multi-dimensional)
- [ ] **Decide on branching strategy** (auto-branch vs. suggest-and-ask vs. always-ask)
- [ ] **Validate skill graph scope** (how many skills for MVP? which topics?)
- [ ] **Confirm database choice** (Firestore hybrid approach vs. full graph DB)
- [ ] **Define MVP problem set** (how many seeded problems? which skills?)

### To Prepare for PRD Creation

- [ ] **Research spaced repetition algorithms** for skill decay modeling
- [ ] **Benchmark GPT-4 skill detection** on sample problems (test accuracy)
- [ ] **Draft initial skill graph** (50-100 core skills with relationships)
- [ ] **Prototype branching UI** (mockup branch notifications, breadcrumbs)
- [ ] **Estimate Firebase costs** (storage, reads/writes, Auth usage)
- [ ] **Review educational research** on prerequisite learning effectiveness

---

## Discussion Notes

_Space to capture thoughts during the conversation_

[To be filled in during discussion with stakeholders]

**Key questions to address:**
1. Is this still primarily a demo/portfolio project, or are we building for actual student usage?
2. What's the time budget for implementation? (Affects scope decisions)
3. Do we need multi-tenant support (classrooms, teachers) or just individual students?
4. Should we target one grade level/topic for MVP, or cover broad range?
5. How do we plan to validate the adaptive learning effectiveness?

---

## Transition to PRD

Once we've discussed and aligned on the approach, we'll create a formal PRD that includes:

### PRD Will Include:

**1. Structured Requirements**
- User stories with acceptance criteria
- Functional requirements per component
- Non-functional requirements (performance, security, scalability)
- API specifications

**2. Phased Implementation Plan**
- Epic breakdown (8-10 epics)
- User story mapping per epic
- Dependencies and critical path
- Timeline estimates

**3. Specific Code Changes and Files**
- Detailed file structure
- New components with props/interfaces
- API route specifications
- Database schema with sample queries
- Migration plan from current architecture

**4. Detailed Acceptance Criteria**
- Test scenarios for each feature
- Edge cases to handle
- Performance benchmarks
- User testing plan

**5. Technical Specifications**
- Architecture diagrams
- Data flow diagrams
- State machine specifications
- Integration patterns
- Error handling strategies

**6. Risk Mitigation Plan**
- Detailed mitigation for each identified risk
- Contingency plans
- Testing strategy
- Rollback procedures

---

## Appendix: Comparison Summary

### Database Options Comparison

| Aspect | Neo4j (Option A) | Firestore (Option B) | Hybrid (Option C) | PostgreSQL (Option D) |
|--------|------------------|----------------------|-------------------|----------------------|
| **Setup Complexity** | High | Low | Medium | Medium |
| **Query Performance** | Excellent | Good | Good | Very Good |
| **Relationship Modeling** | Natural | Manual | Manual | Manual |
| **Cost (MVP)** | $0-50/mo | $0-10/mo | $0-10/mo | $0-25/mo |
| **Scalability** | Excellent | Very Good | Good | Excellent |
| **Learning Curve** | Steep | Gentle | Gentle | Moderate |
| **Firebase Integration** | Complex | Native | Native | Moderate |
| **Recommendation** | Future | Good | **Best for MVP** | Alternative |

### Branching Strategy Comparison

| Strategy | User Experience | Learning Effectiveness | Implementation Complexity |
|----------|----------------|----------------------|--------------------------|
| **Auto-branch** | Seamless but less control | High (ensures prerequisites) | Medium |
| **Suggest & Ask** | Empowering, slight friction | High (students buy in) | Medium |
| **Always Ask** | Maximum control, slower | Medium (students may skip) | Low |
| **Recommendation** | **Suggest & Ask** - best balance |

### Skill Analysis Comparison

| Approach | Accuracy | Cost per Problem | Scalability | Maintenance |
|----------|----------|-----------------|-------------|-------------|
| **AI-Powered** | 80-90% | $0.01-0.03 | Unlimited | Low |
| **Pre-Tagged** | 95%+ | $0 (after curation) | Limited | High |
| **Hybrid** | 90-95% | $0-0.02 | High | Medium |
| **Recommendation** | **Hybrid** - quality + scalability |

---

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Status:** Ready for Discussion → PRD Creation

---

_This planning document provides a comprehensive exploration of the adaptive skill-based learning system feature. It identifies key architectural decisions, implementation approaches, technical risks, and open questions to guide the next phase of formal PRD creation and development._
