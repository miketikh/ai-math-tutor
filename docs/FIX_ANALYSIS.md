# Skill Branching Fix Analysis

**Date:** 2025-11-04
**Issue:** Skill branching feature not triggering despite user confusion
**Root Cause:** Using regex patterns and hardcoded thresholds instead of AI for educational decisions

---

## Problem Summary

### What We Discovered

User submitted: "What is 15% of 80?"
User responses: "not sure", "not sure about decimals", "still not sure"

**Expected behavior:** Blue branching recommendation appears → "Practice Decimals"
**Actual behavior:** Nothing happens. AI continues teaching without branching.

### Console Logs Analysis

```
[Stuck Detection] Not stuck - Student just starting or engaged (Level: 0)
[Stuck Detection] Slightly uncertain - Use vague hints (Level: 1)
[Stuck Detection] Not stuck - Student just starting or engaged (Level: 0)
```

**Stuck level never reaches 2**, so branching check in `page.tsx:264` never runs:
```typescript
if (stuckLevel >= 2) {  // Never true!
  // Check prerequisites and show recommendation
}
```

---

## Root Causes

### 1. Regex Patterns Miss Common Phrases

**File:** `src/lib/stuckDetection.ts:36`

```typescript
HELP_KEYWORDS: /\b(help|stuck|confused|don't know|idk|don't understand|lost|what|huh|\?{2,})\b/i
```

**Missing phrases:**
- "not sure" ❌
- "unsure" ❌
- "no idea" ❌
- "not certain" ❌
- "dunno" ❌

User's actual messages don't match, so stuck score stays low.

### 2. Short Response Threshold Too Strict

```typescript
SHORT_RESPONSE_THRESHOLD: 10
```

- "not sure" = 8 chars ✅ counts
- "still not sure" = 14 chars ❌ doesn't count
- "not sure about decimals" = 24 chars ❌ doesn't count

Most natural confused responses are 10-25 chars, so they're missed.

### 3. Stuck Scoring Algorithm Too Conservative

**Scoring breakdown for user's conversation:**

| Message | Length | Short? | Keywords? | Stuck Score | Cumulative |
|---------|--------|--------|-----------|-------------|------------|
| "not sure" | 8 | +1 | +0 (no match) | 1 | 1 |
| "not sure about decimals" | 24 | +0 | +0 | 0 | 1 |
| "still not sure" | 14 | +0 | +0 | 0 | 1 |

**Total stuck count = 1**

Lines 219-221 cap this:
```typescript
if (stuckCount < 2) {
  return Math.min(stuckCount, 1);  // Returns 0 or 1
}
```

Branching requires `stuckLevel >= 2`, so it never triggers.

### 4. Fundamental Design Flaw: Regex for Educational Decisions

**The core problem:** We're using regex patterns to determine:
- Is the student struggling?
- Which prerequisite skill are they missing?
- Should we branch to practice?

These are **complex educational assessments** that require:
- Understanding conversation context
- Recognizing confusion patterns (not just keywords)
- Identifying which specific skill is the blocker
- Considering user's proficiency history

**Regex cannot do this.** AI should make ALL these decisions.

---

## Files Using Regex/Logic for Decisions

### 🔴 Primary Offenders

1. **`src/lib/stuckDetection.ts`** (390 lines)
   - Lines 31-40: `STUCK_PATTERNS` regex definitions
   - Lines 45-57: `PROGRESS_PATTERNS` regex definitions
   - Lines 63-87: `analyzeMessageForStuckness()` - regex matching
   - Lines 94-124: `analyzeMessageForProgress()` - regex matching
   - Lines 168-225: `analyzeStuckLevel()` - aggregates regex scores
   - **ENTIRE FILE SHOULD BE REPLACED WITH AI**

2. **`src/app/page.tsx`** (lines 254-298)
   - Line 259: Calls `analyzeStuckLevel()`
   - Line 264: Hardcoded threshold `if (stuckLevel >= 2)`
   - Lines 267-294: Prerequisites check + recommendation logic
   - **REPLACE WITH SINGLE AI CALL**

3. **`src/app/api/skills/check-prerequisites/route.ts`** (lines 61-63)
   - `isWeakProficiency()` function:
   ```typescript
   function isWeakProficiency(level: ProficiencyLevel): boolean {
     return level === 'unknown' || level === 'learning';
   }
   ```
   - Hardcoded logic for "is student ready?"
   - **SHOULD BE AI DECISION** (though less critical than stuck detection)

### ✅ Keep As-Is

**`src/lib/proficiencyTracker.ts`**
- `calculateProficiencyLevel()` - This is DATA tracking (problems solved, success rate)
- NOT decision-making about branching
- Keep this as-is

---

## The Solution: AI-Powered Branching

### High-Level Approach

**Replace 3 separate systems:**
1. Stuck detection (regex in `stuckDetection.ts`)
2. Prerequisites checking (logic in `check-prerequisites/route.ts`)
3. Branching decision (threshold in `page.tsx`)

**With 1 AI endpoint:**
- Analyzes entire conversation context
- Understands skill dependencies
- Considers user proficiency
- Makes holistic branching decision

### New API Endpoint

**`POST /api/sessions/analyze-branching`**

**Purpose:** AI analyzes conversation and decides if/when to branch to prerequisite practice.

#### Input Format

```json
{
  "conversationHistory": [
    { "role": "user", "content": "not sure", "timestamp": 123 },
    { "role": "assistant", "content": "Let's think about...", "timestamp": 124 }
  ],
  "mainProblem": "What is 15% of 80?",
  "mainSkillId": "percentages",
  "userId": "user_xyz"
}
```

#### AI Prompt Structure

```
You are an expert math tutor analyzing a student's conversation to determine if they need prerequisite practice.

CONTEXT:
- Main Problem: {mainProblem}
- Main Skill: {mainSkillName} ({mainSkillDescription})

PREREQUISITE SKILLS (from skill graph):
Layer 1 (direct dependencies):
  - decimals: "Numbers with decimal points" (proficiency: unknown)
  - fractions: "Parts of a whole" (proficiency: learning)
  - multiplication: "Repeated addition" (proficiency: proficient)

Layer 2 (foundational):
  - division: "Splitting into equal parts" (proficiency: mastered)
  - place_value: "Understanding digit positions" (proficiency: unknown)

CONVERSATION (last 8 messages):
{formattedConversation}

ANALYZE:
1. Is the student struggling or confused?
2. Look for signals: "not sure", "don't know", "confused", minimal responses, repeated confusion
3. Is their confusion due to a missing prerequisite skill?
4. Which SPECIFIC Layer 1 prerequisite is the blocker?
5. Should we branch to practice NOW or keep diagnosing?

DECISION CRITERIA:
- Branch if: Student explicitly confused + specific prerequisite weakness identified + confidence >0.7
- Don't branch if: Student making progress, asking engaged questions, showing reasoning
- Prefer Layer 1 prerequisites (most direct dependencies)

Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "shouldBranch": boolean,
  "weakSkillId": "skill_id" or null,
  "weakSkillName": "Skill Name" or null,
  "weakSkillDescription": "description" or null,
  "reasoning": "Brief explanation of decision",
  "confidence": 0.0-1.0
}
```

#### Expected Output Format

**Example 1: Should Branch**
```json
{
  "shouldBranch": true,
  "weakSkillId": "decimals",
  "weakSkillName": "Decimals",
  "weakSkillDescription": "Numbers with decimal points",
  "reasoning": "Student repeatedly says 'not sure' and 'not sure about decimals'. They have unknown proficiency in decimals, which is a prerequisite for converting percentages.",
  "confidence": 0.85
}
```

**Example 2: Keep Diagnosing**
```json
{
  "shouldBranch": false,
  "weakSkillId": null,
  "weakSkillName": null,
  "weakSkillDescription": null,
  "reasoning": "Student is asking engaged questions and showing reasoning. Continue Socratic dialogue to identify specific gap.",
  "confidence": 0.72
}
```

---

## Implementation Plan

### Files to Create

#### 1. `/src/app/api/sessions/analyze-branching/route.ts`

**Purpose:** AI-powered branching analyzer

**Key Functions:**
- Load skill graph data (main skill + prerequisites)
- Fetch user proficiency for all prerequisites
- Build AI prompt with full context
- Call OpenAI with JSON mode
- Return structured decision

**Dependencies:**
- `skillGraphManager.getSkill(mainSkillId)`
- `skillGraphManager.getPrerequisites(mainSkillId, 1)` for layer 1
- `skillGraphManager.getPrerequisites(mainSkillId, 2)` for layer 2
- `getProficiency(userId, skillId)` for each prerequisite
- OpenAI client with `response_format: { type: 'json_object' }`

**Error Handling:**
- If AI fails, return `{ shouldBranch: false }` (safe default)
- Log all errors for debugging
- Validate JSON structure before returning

---

### Files to Modify

#### 2. `/src/app/page.tsx` (lines 254-298)

**Current Code (REMOVE):**
```typescript
// Line 258-259
const conversationHistory = getConversationHistory();
const stuckLevel = analyzeStuckLevel(conversationHistory);

// Line 264-295
if (stuckLevel >= 2) {
  const prereqResponse = await fetch('/api/skills/check-prerequisites', {
    method: 'POST',
    body: JSON.stringify({ userId: user.uid, skillId: session.mainSkillId }),
  });

  const { ready, weakSkills, recommendations } = await prereqResponse.json();

  if (!ready && weakSkills && weakSkills.length > 0) {
    const weakestSkill = weakSkills[0];
    setRecommendedSkill({
      skillId: weakestSkill.id,
      skillName: weakestSkill.name,
      skillDescription: weakestSkill.description,
      reason: recommendations[0],
    });
  }
}
```

**New Code (REPLACE WITH):**
```typescript
const conversationHistory = getConversationHistory();

// Single AI call replaces stuck detection + prerequisites check
const branchingResponse = await fetch('/api/sessions/analyze-branching', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationHistory,
    mainProblem: session.mainProblem.text,
    mainSkillId: session.mainSkillId,
    userId: user.uid,
  }),
});

const branchingData = await branchingResponse.json();

console.log('🤖 AI Branching Analysis:', {
  shouldBranch: branchingData.shouldBranch,
  weakSkill: branchingData.weakSkillName,
  confidence: branchingData.confidence,
  reasoning: branchingData.reasoning,
});

if (branchingData.shouldBranch && branchingData.weakSkillId) {
  setRecommendedSkill({
    skillId: branchingData.weakSkillId,
    skillName: branchingData.weakSkillName,
    skillDescription: branchingData.weakSkillDescription,
    reason: branchingData.reasoning,
  });
}
```

**Remove Import:**
```typescript
// DELETE THIS LINE:
import { analyzeStuckLevel } from '@/lib/stuckDetection';
```

---

### Files to Delete

#### 3. `/src/lib/stuckDetection.ts`

**Action:** DELETE ENTIRE FILE (390 lines)

**Why:** All regex-based stuck detection replaced by AI.

**Check Dependencies:**
- `src/app/page.tsx` - Remove import after updating
- `src/app/api/chat/route.ts` - Check if used, remove if so

---

### Files to Keep (No Changes)

#### 4. `/src/app/api/skills/check-prerequisites/route.ts`

**Action:** KEEP file but it's no longer called from `page.tsx`

**Reason:** May be useful for other features (dashboard, analytics). Keep for now.

**Future:** Could also be replaced with AI if needed.

#### 5. `/src/lib/proficiencyTracker.ts`

**Action:** KEEP AS-IS

**Reason:** This tracks DATA (problems solved, success rate), not DECISIONS. This is correct to keep as logic.

---

## Expected Behavior After Fix

### Test Scenario 1: Basic Branching

**Steps:**
1. User submits: "What is 15% of 80?"
2. AI identifies: mainSkillId = "percentages"
3. User responds: "not sure"
4. AI response (teaching)
5. User responds: "not sure about decimals"
6. **AI branching analysis:**
   - Detects repeated confusion
   - Identifies "decimals" as prerequisite weakness
   - Returns `shouldBranch: true`
7. **Blue recommendation box appears:**
   - "I notice you might benefit from practicing: **Decimals**"
   - "Student repeatedly says 'not sure' and 'not sure about decimals'..."
   - [Practice This Skill] [Keep Trying]
8. User clicks "Practice This Skill"
9. Branches to decimals practice (existing flow works)

### Test Scenario 2: Student Making Progress

**Steps:**
1. User submits: "Solve 2x + 5 = 13"
2. User responds: "Maybe I should subtract 5 from both sides?"
3. AI detects: Engaged question, shows reasoning
4. **AI branching analysis:**
   - `shouldBranch: false`
   - `reasoning: "Student asking engaged questions, showing reasoning"`
5. No branching recommendation appears
6. Continue Socratic dialogue

### Test Scenario 3: False Positive Prevention

**Steps:**
1. User submits: "What is 20% of 50?"
2. User responds: "I'm not sure... is it 10?"
3. AI detects: Student made attempt, just uncertain
4. **AI branching analysis:**
   - `shouldBranch: false` (low confidence)
   - `reasoning: "Student is attempting, just needs encouragement"`
5. No branching, continue teaching

---

## Console Log Examples

### Before Fix (Current - Broken)
```
📊 Stuck level analysis: { stuckLevel: 1 }
(No more logs - threshold not reached)
```

### After Fix (Expected - Working)
```
🤖 AI Branching Analysis: {
  shouldBranch: true,
  weakSkill: "Decimals",
  confidence: 0.85,
  reasoning: "Student repeatedly says 'not sure' and 'not sure about decimals'. They have unknown proficiency in decimals, which is a prerequisite for converting percentages."
}
💡 Recommending skill practice: Decimals
```

---

## Implementation Checklist

- [ ] Create `/src/app/api/sessions/analyze-branching/route.ts`
  - [ ] Load skill graph (main skill + prerequisites)
  - [ ] Fetch user proficiency for each prerequisite
  - [ ] Build comprehensive AI prompt
  - [ ] Call OpenAI with JSON mode
  - [ ] Validate and return response
  - [ ] Error handling

- [ ] Modify `/src/app/page.tsx`
  - [ ] Replace lines 258-295 with single AI call
  - [ ] Remove `analyzeStuckLevel` import
  - [ ] Update console logs
  - [ ] Test error handling

- [ ] Delete `/src/lib/stuckDetection.ts`
  - [ ] Check no other files import it
  - [ ] Remove file

- [ ] Test end-to-end flow
  - [ ] Test: Basic branching (confused student)
  - [ ] Test: No branching (engaged student)
  - [ ] Test: Multiple prerequisites (picks most relevant)
  - [ ] Test: Error handling (AI fails gracefully)

---

## Why This Fix is Better

### Before (Regex/Logic-Based)
- ❌ Misses common phrases ("not sure")
- ❌ Arbitrary thresholds (10 chars, level 2)
- ❌ No context understanding
- ❌ Can't identify WHICH prerequisite is the problem
- ❌ 390 lines of brittle pattern matching
- ❌ Requires constant tuning as we discover edge cases

### After (AI-Powered)
- ✅ Understands natural language confusion
- ✅ Considers full conversation context
- ✅ Identifies specific prerequisite blocker
- ✅ Adapts to different communication styles
- ✅ Single source of truth for branching decision
- ✅ Self-improving as model improves

---

## Notes for Implementation

1. **OpenAI Model:** Use `gpt-4o-mini` for cost efficiency (branching analysis is simpler than tutoring)
2. **JSON Mode:** MUST use `response_format: { type: 'json_object' }` to ensure valid JSON
3. **Temperature:** Use 0.3-0.5 (we want consistent decisions, not creative responses)
4. **Max Tokens:** ~500 should be enough for decision + reasoning
5. **Conversation Window:** Last 8 messages is reasonable (balance context vs cost)
6. **Caching:** Don't cache - we want fresh analysis after each AI response
7. **Rate Limiting:** This adds 1 OpenAI call per user message - monitor costs

---

## Future Enhancements

Once this works, consider replacing other hardcoded logic with AI:

1. **Proficiency threshold logic** (`isWeakProficiency` in check-prerequisites)
2. **Problem difficulty selection** (currently random - should be AI)
3. **Mastery determination** (3/5 correct is arbitrary - AI could assess true understanding)
4. **Return-to-main-problem timing** (after practice, when is student ready?)

**Principle:** If it's an educational decision, AI should make it. If it's data tracking/storage, logic is fine.

---

## End Notes

This fix addresses the fundamental design flaw: using regex patterns for complex educational assessments. The student was clearly confused ("not sure" repeated 3 times), but our regex didn't recognize it.

AI doesn't just pattern-match - it understands. That's what we need for intelligent tutoring.
