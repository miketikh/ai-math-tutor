# Example: Dependency Navigation for Struggling Students

## Example Problem: "Solve for x: 2x + 5 = 13"

### Initial Assessment
**Problem Type Detected:** Two-step equation

### Layer 1: Direct Prerequisites
If student struggles with this problem, check these skills first:
1. **One-step equations** - Can they solve x + 5 = 13 or 2x = 8?
2. **Order of operations** - Do they know to undo operations in reverse order?
3. **Inverse operations** - Do they understand subtraction undoes addition?

**Action:** Present simpler problems testing these skills
- x + 5 = 13 (one-step addition)
- 3x = 12 (one-step multiplication)

---

### Layer 2: Deeper Prerequisites (if Layer 1 problems also fail)

If student fails **one-step equations**, drill down to:
1. **Understanding variables** - Do they know what 'x' represents?
2. **Basic arithmetic operations** - Can they do 13 - 5 or 12 ÷ 3?

**Action:** Present even simpler problems
- "If x + 3 = 7, what is x?" (with visual/concrete examples)
- "What number plus 3 equals 7?"

If student fails **order of operations**, drill down to:
1. **Understanding multiplication/division** - Do they know these come before addition/subtraction?
2. **Understanding addition/subtraction** - Can they perform these operations?

---

## Example Problem 2: "What is 15% of 60?"

### Initial Assessment
**Problem Type Detected:** Percentage calculation

### Layer 1: Direct Prerequisites
If student struggles:
1. **Converting percentages** - Can they convert 15% to 0.15 or 15/100?
2. **Decimal multiplication** - Can they multiply 0.15 × 60?
3. **Understanding what "of" means** - Do they know "of" means multiply?

**Action:** Present simpler problems
- "Convert 20% to a decimal"
- "What is 0.5 × 10?"

---

### Layer 2: Deeper Prerequisites

If student fails **converting percentages**, drill down to:
1. **Fractions fundamentals** - Do they understand 15% = 15/100?
2. **Decimals** - Can they work with decimal places?
3. **Understanding division** - Do they know 15 ÷ 100 = 0.15?

**Action:** Present foundational problems
- "What is 1/4 as a decimal?"
- "Divide 50 by 100"

If student fails **decimal multiplication**, drill down to:
1. **Place value** - Do they understand decimal places?
2. **Basic multiplication** - Can they multiply whole numbers?

---

## Example Problem 3: "Solve: 3(x + 2) = 15"

### Initial Assessment
**Problem Type Detected:** Equation with distributive property

### Layer 1: Direct Prerequisites
If student struggles:
1. **Distributive property** - Can they expand 3(x + 2) to 3x + 6?
2. **Two-step equations** - After expanding, can they solve 3x + 6 = 15?
3. **Order of operations** - Do they know to distribute first?

**Action:** Break down the problem
- "First, expand 3(x + 2)"
- OR "Can you solve 3x + 6 = 15?" (skip distribution step)

---

### Layer 2: Deeper Prerequisites

If student fails **distributive property**, drill down to:
1. **Understanding variables** - Do they understand x represents a number?
2. **Multiplication with variables** - Can they calculate 3 × x and 3 × 2?
3. **Basic multiplication** - Can they do 3 × 2?

If student fails **two-step equations**, go to Layer 2 from Example 1 above.

---

## Implementation Strategy

```javascript
// Example data structure for tracking student struggle
const problemAnalysis = {
  problemId: "eq_2step_001",
  problemText: "Solve for x: 2x + 5 = 13",
  mainSkill: "two_step_equations",
  
  // Layer 1 - Direct prerequisites to check
  directPrerequisites: [
    "one_step_equations",
    "order_of_operations",
    "inverse_operations"
  ],
  
  // Layer 2 - Deeper prerequisites if Layer 1 fails
  deeperPrerequisites: {
    one_step_equations: [
      "understanding_variables",
      "basic_arithmetic_operations"
    ],
    order_of_operations: [
      "understanding_multiplication_division",
      "understanding_addition_subtraction"
    ]
  },
  
  // Diagnostic mini-problems for each layer
  diagnosticProblems: {
    layer1: {
      one_step_equations: [
        { problem: "x + 5 = 13", answer: "8" },
        { problem: "3x = 12", answer: "4" }
      ]
    },
    layer2: {
      understanding_variables: [
        { problem: "If x + 3 = 7, what is x?", answer: "4" }
      ],
      basic_arithmetic_operations: [
        { problem: "13 - 5 = ?", answer: "8" },
        { problem: "12 ÷ 3 = ?", answer: "4" }
      ]
    }
  }
};
```

## Key Principles

1. **Start broad, then narrow** - Check direct prerequisites first before drilling deeper
2. **Maximum 2-3 layers** - Don't go too deep or it becomes overwhelming
3. **Targeted diagnostics** - Quick 1-2 question checks at each layer
4. **Adaptive pathing** - Only drill to Layer 2 if Layer 1 diagnostics fail
5. **Focus on blockers** - Identify the specific missing skill, not everything they don't know
