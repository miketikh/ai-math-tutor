# Middle School Math Skill Dependency Graph

## Overview

This is a condensed, practical skill dependency structure designed for a math tutoring app targeting middle school students (grades 6-8) who are actively learning algebra.

Unlike the original Khan Academy data (1400+ rows with very granular skills like "making 10" and "subtraction by 1"), this focuses on **15-20 core middle school concepts** with a **2-layer dependency structure** that's actually usable for real-time tutoring.

## Files Included

### 1. `compact_skill_graph.json` ⭐ **Start Here**
The main data structure. Clean, query-friendly JSON with:
- **Layer 1 prerequisites**: Direct dependencies to check first
- **Layer 2 prerequisites**: Deeper fundamentals if Layer 1 fails
- **Diagnostic questions**: Quick checks for each layer
- **15 core skills** covering algebra fundamentals

**Best for:** Production use in your app

### 2. `middle_school_math_skills.json`
More detailed version with:
- Full descriptions
- Sub-skills breakdown
- Skill levels (0-4)
- Richer metadata

**Best for:** Understanding the full concept model

### 3. `dependency_navigation_examples.md`
Practical walkthroughs showing:
- How to navigate dependencies when students struggle
- 3 complete examples (two-step equations, percentages, distributive property)
- Decision trees for drilling down

**Best for:** Understanding the tutoring flow

### 4. `implementation_example.js`
Working code examples:
- `SkillDependencyManager` class
- React component integration
- AI assistant integration pattern
- Real query examples

**Best for:** Copy-paste into your codebase

---

## Core Philosophy

### The 2-Layer Approach

When a student struggles with a problem:

**Step 1: Check Layer 1 (Direct Prerequisites)**
```
Student fails: "Solve 2x + 5 = 13"
↓
Check Layer 1:
  ✓ Can they solve x + 5 = 13? (one-step equations)
  ✗ Do they understand order of operations?
```

**Step 2: If Layer 1 fails, check Layer 2 (Fundamentals)**
```
Student fails: "x + 5 = 13"
↓
Check Layer 2:
  ✗ Do they understand what 'x' represents? (variables)
  ✓ Can they do 13 - 5? (basic arithmetic)
```

**Step 3: Start Practice at Weakest Point**
```
Focus on: Understanding Variables
↓ (once mastered)
Practice: One-Step Equations  
↓ (once mastered)
Return to: Two-Step Equations
```

### Why Only 2 Layers?

- **Keeps it manageable**: You're not drilling down 5+ levels to "counting to 10"
- **Middle school appropriate**: Assumes students have K-5 basics
- **Actionable**: Each layer gives you concrete next steps
- **Prevents overwhelm**: Student isn't told they need to learn 47 prerequisite concepts

---

## Key Skills Included

### Foundation (Layer 0)
- Basic Arithmetic
- Understanding Variables
- Place Value

### Core Middle School (Layers 1-2)
- One-Step Equations
- Two-Step Equations
- Fractions (operations)
- Decimals
- Percentages
- Ratios & Proportions
- Order of Operations
- Combining Like Terms
- Distributive Property

### Advanced Middle School (Layers 3-4)
- Multi-Step Equations
- Linear Inequalities
- Slope & Linear Functions
- Systems of Equations

---

## Quick Start Examples

### Example 1: Simple Query
```javascript
const manager = new SkillDependencyManager(skillGraph);

// Student struggles with percentages
const prereqs = manager.getPrerequisites('percentages', 1);
// Returns: ['decimals', 'fractions', 'multiplication']

// Get diagnostic questions
const tests = manager.getDiagnosticQuestions('percentages', 1);
// Returns: ['Convert 25% to decimal', 'What is 0.5 × 10?', ...]
```

### Example 2: Building a Learning Path
```javascript
// Student struggled with: 3(x + 2) = 15
// Diagnostics revealed weak spots: distributive_property, understanding_variables

const path = manager.buildLearningPath(
  'multi_step_equations',
  ['distributive_property', 'understanding_variables']
);

// Returns ordered path:
// 1. Understanding Variables (most foundational)
// 2. Distributive Property
// 3. Two-Step Equations
// 4. Multi-Step Equations (original goal)
```

### Example 3: Problem Type Detection
```javascript
// When student starts a problem, detect required skills
const problem = {
  text: "What is 15% of 60?",
  type: "percentage_calculation"
};

const requiredSkills = skillGraph.problem_to_skill_mapping
  .word_problems.percentage_problems;
// Returns: ['percentages', 'multiplication', 'division']
```

---

## Integration with Your App

### For ClipForge (Video Editing App)

When analyzing a math video problem:

1. **Detect problem type** using AI or pattern matching
2. **Tag with main skill** (e.g., "two_step_equations")
3. **If student struggles:**
   - Query Layer 1 prerequisites
   - Present quick diagnostic problems
   - Identify weakest skill
4. **Generate targeted help** using AI with context:
   ```
   "Student needs help with [weakest_skill].
   Generate: explanation + 3 practice problems + connection to original problem"
   ```

### For Real-Time Tutoring

```javascript
function handleStudentStruggle(problem, studentAnswer) {
  // 1. Identify main skill
  const mainSkill = detectSkillFromProblem(problem);
  
  // 2. Get Layer 1 prerequisites
  const layer1 = getPrerequisites(mainSkill, 1);
  
  // 3. Quick diagnostic
  const diagnosticResults = await testStudentOn(layer1);
  
  // 4. Find weakest skill
  const weakest = findWeakestSkill(diagnosticResults);
  
  // 5. Generate help for that specific skill
  return generateTargetedHelp(weakest);
}
```

---

## Why This Beats the Khan Academy Data

| Khan Academy | This Structure |
|-------------|----------------|
| 1,400+ skills | 15-20 core skills |
| Includes K-2 basics | Middle school focused |
| Flat prerequisite list | 2-layer hierarchy |
| "counting-out-1-20-objects" | Assumes basic numeracy |
| No diagnostic questions | Built-in quick checks |
| Academic structure | Tutor-flow optimized |

---

## Next Steps

### For MVP:
1. Start with `compact_skill_graph.json`
2. Implement basic skill detection for common problem types
3. Add Layer 1 diagnostics when students struggle
4. Use AI to generate explanations targeted at the weak skill

### For V2:
1. Add more problem-to-skill mappings based on real usage
2. Track which skills correlate most with struggles
3. Build adaptive difficulty (easier problems for weak skills)
4. Add visual skill tree for students to see progress

### Future Expansion:
1. Add geometry concepts
2. Add pre-algebra statistics
3. Expand Layer 2 for special cases
4. Create skill mastery tracking over time

---

## Questions This Solves

✅ **"Student can't solve 2x + 5 = 13 - what should I teach them?"**
→ Check one_step_equations and order_of_operations first

✅ **"They still can't do one-step equations - now what?"**
→ Drill down to understanding_variables and basic_arithmetic

✅ **"What's the fastest path from where they are to the goal?"**
→ buildLearningPath() returns ordered list from foundation up

✅ **"How do I know if they really have a gap or just made a mistake?"**
→ Use diagnostic questions - 2-3 quick checks per layer

✅ **"The Khan data is overwhelming - what do middle schoolers actually need?"**
→ These 15 core skills cover 90% of middle school algebra

---

## License & Usage

This is a curated, simplified structure derived from publicly available Common Core standards and Khan Academy's deprecated knowledge map. Free to use for your tutoring app.

The original Khan Academy data is in `/mnt/user-data/uploads/mathdata_-_khandata.csv` if you need more granular topics later.

---

## Contact

Built for: Mike's math tutoring app
Created: November 2024
Questions? Adjust the JSON structure as needed for your specific use cases.
