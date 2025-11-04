# Visual Dependency Graph Structure

## Complete Middle School Math Dependency Tree

```
                    SYSTEMS OF EQUATIONS (Level 4)
                            |
                            |
                    MULTI-STEP EQUATIONS (Level 3)
                    /        |         \
                   /         |          \
        TWO-STEP    COMBINING    DISTRIBUTIVE
        EQUATIONS   LIKE TERMS   PROPERTY
           |            |            |
           |            |            |
        ONE-STEP    UNDERSTANDING   ORDER OF
        EQUATIONS   VARIABLES       OPERATIONS
           |            |              |
           |            |              |
        ---------------+--------------+----------------
                       |
              BASIC ARITHMETIC (Level 0)
              /        |        \
             /         |         \
    ADDITION/    MULTIPLICATION/  PLACE
    SUBTRACTION  DIVISION         VALUE
```

---

## Detailed Example: Path to Two-Step Equations

### The Full Tree
```
                TWO-STEP EQUATIONS
                "Solve 2x + 5 = 13"
                       /\
                      /  \
           Layer 1: /    \
                   /      \
                  /        \
     ONE-STEP EQUATIONS  ORDER OF OPERATIONS
     "Solve x + 5 = 13"  "What comes first?"
             /\                /\
            /  \              /  \
  Layer 2: /    \            /    \
          /      \          /      \
    VARIABLES   BASIC    MULT/DIV  ADD/SUB
    "What is x?"  ARITHMETIC  "3×2"   "5+3"
```

### If Student Struggles at Each Node

**Struggle: Two-Step Equations (2x + 5 = 13)**
→ Test Layer 1: ✓ One-step? ✗ Order of ops?
→ Drill to Layer 2 under "Order of ops"
→ Find they don't know multiplication comes before addition
→ **Focus Practice: Order of Operations basics**

---

## Percentage Problems - Full Dependency Chain

```
                    PERCENTAGES
                "Find 15% of 60"
                    /    |    \
                   /     |     \
        DECIMALS  FRACTIONS  MULTIPLICATION
         "0.15"    "15/100"    "× 60"
           |         |           |
           |         |           |
      PLACE VALUE  DIVISION   TIMES TABLES
       "tenths"    "15÷100"    "6×15"
           |         |           |
           |         |           |
           +----+----+----+------+
                |
          BASIC ARITHMETIC
```

### Navigation Example
```
Student: "What is 15% of 60?"
Answer: "9"  ❌ (Incorrect - actual answer: 9)

Layer 1 Test:
  Q: "Convert 25% to decimal"     → ❌ Failed (answers 25.0)
  Q: "What is 0.5 × 10?"          → ✓ Passed
  Q: "What is 1/4 of 12?"         → ✓ Passed

Diagnosis: Weak on "Converting Percentages"

Layer 2 Test (for Converting Percentages):
  Q: "What is 25 ÷ 100?"          → ✓ Passed
  Q: "In 0.25, what place is 5?"  → ❌ Failed

Root Cause: Place Value with decimals

Focus: Practice place value → decimals → converting percentages
```

---

## Fraction Operations Tree

```
                FRACTION OPERATIONS
                    /    |    \
                   /     |     \
              ADDING  MULTIPLY  DIVIDING
            FRACTIONS FRACTIONS FRACTIONS
             /     \      |        |
            /       \     |        |
    EQUIVALENT   COMMON  MULT   MULTIPLY
    FRACTIONS    DENOM   BASICS  FRACTIONS
         |         |       |        |
         |         |       |        |
         +----+----+----+--+--------+
              |
      UNDERSTANDING DIVISION
      UNDERSTANDING MULTIPLICATION
              |
      BASIC ARITHMETIC
```

---

## Algebra Progression Path (Full Stack)

### Vertical Progression
```
Level 4: SYSTEMS OF EQUATIONS
           ↓
Level 3: MULTI-STEP EQUATIONS
           ↓ 
Level 2: TWO-STEP EQUATIONS
           ↓
Level 1: ONE-STEP EQUATIONS
           ↓
Level 0: UNDERSTANDING VARIABLES
           ↓
Level 0: BASIC ARITHMETIC
```

### Horizontal Skills (Same Level)

**Level 2 Skills (Can Learn in Any Order):**
```
TWO-STEP        PERCENTAGES     RATIOS &
EQUATIONS                       PROPORTIONS
    |               |               |
    +-------+-------+-------+-------+
            |
    FRACTIONS & DECIMALS
```

---

## Quick Reference: Problem → Skill Mapping

```
PROBLEM TYPE                    MAIN SKILL              LAYER 1 DEPS
================================================================================
"Solve 2x + 5 = 13"         → two_step_equations    → [one_step, order_ops]
"Solve 3x + 2 = x + 8"      → multi_step_equations  → [two_step, like_terms]
"What is 15% of 60?"        → percentages           → [decimals, fractions]
"If 2:3 = x:12, find x"     → ratios_proportions    → [fractions, mult/div]
"Expand 3(x + 2)"           → distributive_property → [mult, order_ops]
"Simplify 3x + 5x"          → combining_like_terms  → [variables, addition]
"Solve 2x + 3 < 15"         → linear_inequalities   → [two_step, number_line]
```

---

## Student Journey Flowchart

```
START: Student attempts problem
    |
    v
 Correct? ──Yes──> Next Problem
    |No
    v
IDENTIFY main skill required
    |
    v
TEST Layer 1 prerequisites
    |
    v
All pass? ──Yes──> Problem was careless error, try similar problem
    |No
    v
IDENTIFY which Layer 1 skill failed
    |
    v
TEST Layer 2 prerequisites for that skill
    |
    v
All pass? ──Yes──> Focus practice on Layer 1 skill
    |No
    v
IDENTIFY weakest Layer 2 skill
    |
    v
START targeted practice at that level
    |
    v
Master Layer 2 skill
    |
    v
Practice Layer 1 skill
    |
    v
RETURN to original problem type
```

---

## Comparison: Khan Data vs. This Structure

### Khan Academy Original (Too Granular)
```
two-step-word-problems (row 176)
    ↓
subtraction_4 (row 97)
    ↓
subtraction_3 (row 82)
    ↓
subtraction_2 (row 39)
    ↓
subtraction_1 (row 21)
    ↓
take-apart (row 17)
    ↓
put-together (row 14)
    ↓
how-many-objects-2 (row 12)
    ↓
how-many-objects-1 (row 9)
    ↓
counting-out-1-20-objects (row 3)

❌ 11 levels deep!
❌ Not appropriate for middle school tutoring
```

### This Structure (Right Level)
```
two_step_equations
    ↓ Layer 1
one_step_equations
    ↓ Layer 2
basic_arithmetic

✓ Only 3 levels
✓ Assumes K-5 foundations
✓ Appropriate for grades 6-8
```

---

## Usage Pattern Diagram

```
   STUDENT INPUT
        |
        v
   [Parse Problem]
        |
        v
   Identify Skill ────> Look up in skill_graph
        |                     |
        |                     v
        |              Get prerequisites
        |                     |
        |<────────────────────+
        v
   Attempt Problem
        |
        +──Correct──> Success! 
        |
        +──Wrong────> Run Layer 1 Diagnostics
                           |
                           +──All Pass──> Careless error
                           |
                           +──Some Fail──> Run Layer 2 Diagnostics
                                               |
                                               v
                                        Find Weakest Skill
                                               |
                                               v
                                        Generate Practice
                                               |
                                               v
                                        Track Progress
                                               |
                                               v
                                        Return to Original ←─┐
                                               |              |
                                               v              |
                                        Still struggling? ────┘
```

---

## Real Example: Complete Diagnosis

```
PROBLEM: "Sarah has $50. She spends 15% on lunch. How much did she spend?"

Step 1: Identify Skills
→ Main: percentage_word_problems
→ Layer 1 deps: [percentages, multiplication, word_problems]

Step 2: Student Answer
→ Student: "$15"  ❌
→ Correct: "$7.50"

Step 3: Layer 1 Diagnostics
→ "Convert 20% to decimal" → ❌ (student says "20.0")
→ "What is 0.5 × 10?" → ✓ (student says "5")
→ "If John has 20 apples and eats 1/4, how many?" → ✓ (student says "5")

RESULT: Weak on "converting percentages"

Step 4: Layer 2 Diagnostics (for converting percentages)
→ "What is 20 ÷ 100?" → ✓ (student says "0.2")
→ "What does 'percent' mean?" → ❌ (student unsure)
→ "What place is 5 in 0.25?" → ❌ (student says "ones")

RESULT: Weak on "place value" and "understanding percent concept"

Step 5: Learning Path
1. Review place value with decimals (2-3 problems)
2. Teach "percent = per hundred = ÷ 100" concept
3. Practice converting percentages (5 problems)
4. Return to multiplication with decimals
5. Try original problem type again

FOCUS: 10 minutes on place value + percent concept
THEN: Return to percentage calculations
```

---

## Key Takeaway

This 2-layer structure hits the sweet spot:
- Deep enough to find root causes
- Shallow enough to stay actionable  
- Middle school appropriate
- Aligned with how tutors actually diagnose struggles

Use `compact_skill_graph.json` as your source of truth!
```
