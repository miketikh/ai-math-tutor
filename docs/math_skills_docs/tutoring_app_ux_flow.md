# Tutoring App UX Flow - Recursive Skill Mastery

## Core UX Principles

1. **Always show the "North Star"** - Keep the main problem visible/accessible
2. **Visual breadcrumbs** - Student always knows where they are in the tree
3. **Gamification** - Make going "down" the tree feel like unlocking, not failing
4. **Clear transitions** - Mark when you're shifting from main problem to practice
5. **Progress visibility** - Show mastery building at each level

---

## Screen Flow Overview

```
┌─────────────────┐
│  Main Problem   │
│   "Home Base"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Socratic Chat   │ ◄── "How would you solve this?"
│  Diagnosis      │
└────────┬────────┘
         │
         ├─ Student confident? → Guide through solution
         │
         └─ Student stuck? 
                  │
                  ▼
         ┌─────────────────┐
         │ Skill Detective │ ◄── "Let's figure out what's tricky"
         │   (Mini Quiz)   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Practice Path  │ ◄── "Let's build these skills first"
         │   Selection     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Skill Practice  │ ◄── Work on prerequisite
         │   (3-5 probs)   │
         └────────┬────────┘
                  │
                  ├─ Mastered? → Return to parent
                  │
                  └─ Still stuck? → Go deeper (recursive)
                           │
                           ▼
                  ┌─────────────────┐
                  │ Deeper Practice │
                  │  (Layer 2)      │
                  └────────┬────────┘
                           │
                           ▼
                  Return up the tree...
```

---

## Key UI Components

### 1. The Persistent Header (Always Visible)

```
┌──────────────────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13                      │
│                                                       │
│ Your Path: Main Problem → One-Step Equations    [2/3]│
└──────────────────────────────────────────────────────┘
```

**Purpose:** 
- Shows what you're ultimately trying to solve
- Breadcrumb trail of where you are
- Progress toward completing current skill

**Why it works:**
- Students never feel lost
- Tapping "Main Goal" takes you back to home base
- Shows this detour has purpose

---

### 2. Screen 1: Main Problem Entry

```
┌────────────────────────────────────────┐
│                                        │
│  📝 What do you need help with?       │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Paste or type your problem here │ │
│  │                                  │ │
│  │ [2x + 5 = 13                  ] │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Or choose from recent problems:       │
│  • 3x + 7 = 22                        │
│  • What is 15% of 60?                 │
│                                        │
│            [Let's Start] →            │
│                                        │
└────────────────────────────────────────┘
```

---

### 3. Screen 2: Socratic Diagnosis

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main Problem                │
├────────────────────────────────────────┤
│                                        │
│  🤖 Tutor:                            │
│  "Great! Let's solve this together."   │
│                                        │
│  "Can you tell me what steps you'd     │
│   take to solve this equation?"        │
│                                        │
│  💬 You:                              │
│  ┌──────────────────────────────────┐ │
│  │ Type your answer or...          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Quick options:                        │
│  🔘 I'm not sure where to start       │
│  🔘 I know some steps, not all        │
│  🔘 I think I can do it               │
│                                        │
└────────────────────────────────────────┘
```

**If student picks "I'm not sure where to start":**

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
├────────────────────────────────────────┤
│                                        │
│  🤖 Tutor:                            │
│  "No problem! Let's figure out what    │
│   skills will help you solve this."    │
│                                        │
│  "I'm going to ask a few quick         │
│   questions to find the best starting  │
│   point for you."                      │
│                                        │
│            [Start Quiz] →             │
│                                        │
│  (Don't worry - this helps me help you │
│   better! Takes ~1 minute)            │
│                                        │
└────────────────────────────────────────┘
```

---

### 4. Screen 3: Skill Detective (Quick Diagnostic)

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main Problem → Skill Check  │
├────────────────────────────────────────┤
│                                        │
│  🔍 Quick Check #1 of 3               │
│                                        │
│  Can you solve this simpler problem?   │
│                                        │
│        x + 5 = 13                      │
│                                        │
│  What is x?                            │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Your answer: [      ]           │ │
│  └──────────────────────────────────┘ │
│                                        │
│  🔘 I'm not sure                      │
│                                        │
│            [Check Answer] →           │
│                                        │
│  ⚡ Tip: Try undoing what's done to x │
│                                        │
└────────────────────────────────────────┘
```

**After diagnosis completes:**

---

### 5. Screen 4: Practice Path Selection (The "Fork in the Road")

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main Problem                │
├────────────────────────────────────────┤
│                                        │
│  🎯 I found what's tricky!            │
│                                        │
│  To solve your problem, you'll need:   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🔒 One-Step Equations            │ │
│  │                                  │ │
│  │ Master this first, then you'll   │ │
│  │ be ready for two-step equations! │ │
│  │                                  │ │
│  │   [Practice This] 3-5 problems   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  OR                                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💡 Watch a quick explanation     │ │
│  │    (2 min video)                 │ │
│  └──────────────────────────────────┘ │
│                                        │
│  After this, you'll return to your     │
│  main problem with new skills! 🚀      │
│                                        │
└────────────────────────────────────────┘
```

**Visual metaphor:** Like unlocking a skill tree in a video game

---

### 6. Screen 5: Skill Practice (Focused Practice)

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main Problem → One-Step Eqs │
├────────────────────────────────────────┤
│                                        │
│  🎯 One-Step Equations                │
│  Progress: ⭐⭐⭐○○ (3/5 problems)     │
│                                        │
│  Problem 4:                            │
│                                        │
│        x - 7 = 15                      │
│                                        │
│  What is x?                            │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Your answer: [      ]           │ │
│  └──────────────────────────────────┘ │
│                                        │
│            [Submit] →                 │
│                                        │
│  💡 Remember: Do the opposite          │
│     operation to both sides            │
│                                        │
└────────────────────────────────────────┘
```

**If they get 3+ correct:**

```
┌────────────────────────────────────────┐
│                                        │
│        🎉 Skill Unlocked!             │
│                                        │
│     One-Step Equations ✓               │
│                                        │
│  You're ready to tackle your           │
│  main problem now!                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [Return to Main Problem] →      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  OR                                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [Practice 5 More] Keep going    │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

### 7. Screen 6: Returning to Main Problem

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main Problem                │
├────────────────────────────────────────┤
│                                        │
│  🎉 You mastered: One-Step Equations! │
│                                        │
│  Now let's apply what you learned      │
│  to your original problem.             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │        2x + 5 = 13               │ │
│  └──────────────────────────────────┘ │
│                                        │
│  🤖 Tutor:                            │
│  "Now that you know how to solve       │
│   one-step equations, can you tell me  │
│   what FIRST step you'd take here?"    │
│                                        │
│  💬 You:                              │
│  ┌──────────────────────────────────┐ │
│  │ Type your answer...              │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

### 8. Recursive Branch (Going Deeper)

**If during practice, they STILL struggle:**

```
┌────────────────────────────────────────┐
│ 🏠 Main Goal: Solve 2x + 5 = 13        │
│ Your Path: Main → One-Step → Variables │
├────────────────────────────────────────┤
│                                        │
│  🤖 Tutor:                            │
│  "I notice you're finding these        │
│   tricky. That's okay!"                │
│                                        │
│  "Let's take one more step back and    │
│   make sure you're solid on what       │
│   variables mean."                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🔒 Understanding Variables       │ │
│  │                                  │ │
│  │ This is the foundation! Once you │ │
│  │ get this, everything else will   │ │
│  │ click. 💡                        │ │
│  │                                  │ │
│  │   [Let's Go!] 3 quick problems   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Your journey:                         │
│  1. ✓ Variables (← you are here)      │
│  2. → One-Step Equations               │
│  3. → Main Problem                     │
│                                        │
└────────────────────────────────────────┘
```

---

## Visual Progress Tracking

### Skill Tree View (Optional Toggle)

```
┌────────────────────────────────────────┐
│  Your Learning Path                    │
├────────────────────────────────────────┤
│                                        │
│              [Main Problem]            │
│           2x + 5 = 13 🎯               │
│                  │                     │
│                  │                     │
│       ┌──────────┴──────────┐         │
│       │                     │         │
│  [One-Step Eqs]      [Order of Ops]   │
│      ⭐⭐⭐⭐⭐ ✓              ○○○○○         │
│       │                                │
│       │                                │
│  [Variables]                           │
│    ⭐⭐⭐○○                              │
│                                        │
│  Legend:                               │
│  ⭐ = Practiced    ✓ = Mastered       │
│  ○ = Not started  🎯 = Current goal   │
│                                        │
└────────────────────────────────────────┘
```

---

## Mobile-First Wireframes

### Collapsed View (Default)

```
┌───────────────┐
│ 🏠 2x+5=13    │ ← Tap to expand full problem
├───────────────┤
│ 🎯 One-Step   │ ← Current focus
│    [3/5] ⭐⭐⭐│
├───────────────┤
│               │
│ Problem 4:    │
│               │
│   x - 7 = 15  │
│               │
│ [        ]    │
│               │
│   [Submit]    │
│               │
└───────────────┘
```

### Expanded Context (Swipe up)

```
┌───────────────┐
│ Main Problem: │
│ 2x + 5 = 13   │
│               │
│ To solve this,│
│ you need:     │
│               │
│ ✓ Variables   │
│ 🎯 One-Step   │ ← You are here
│ ○ Two-Step    │
│               │
│ [Continue] →  │
└───────────────┘
```

---

## Interaction Patterns

### Transition Animations

**Going Deeper (to practice):**
```
Main Problem [2x + 5 = 13]
    ↓ (slide down, fade)
    ↓ "Let's build this skill..."
    ↓
Practice [x + 5 = 13]
```

**Going Up (returning):**
```
Practice [x + 5 = 13]
    ↑ (slide up with celebration)
    ↑ "🎉 Skill unlocked!"
    ↑
Main Problem [2x + 5 = 13]
```

**Breadcrumb Trail:**
- Always clickable
- Each level is a bubble
- Current level is highlighted
- Can jump back to any parent level

```
[🏠 Main] → [One-Step] → [Variables]
                            ↑
                      (you are here)
```

---

## Gamification Elements

### Progress Indicators

```
🏆 Session Progress:
━━━━━━━━○○ 80% complete

⭐ Skills Mastered Today:
• One-Step Equations ✓
• Understanding Variables ✓

🔥 Streak: 3 days in a row!
```

### Micro-Celebrations

After each correct answer:
- ✓ Check mark animation
- "+1 XP" or star fill
- Encouraging message: "Nice work!"

After mastering a skill:
- 🎉 Confetti animation
- Badge unlock
- "You're ready for the next level!"

---

## Error Handling

### When Student Gets Multiple Wrong

```
┌────────────────────────────────────────┐
│                                        │
│  🤖 Tutor:                            │
│  "Hmm, this one seems tricky.          │
│   Would you like to:                   │
│                                        │
│  🔘 See a worked example               │
│  🔘 Try an easier version              │
│  🔘 Take a quick break                 │
│  🔘 Learn the basics first             │
│                                        │
│  No worries - learning takes time! 💪  │
│                                        │
└────────────────────────────────────────┘
```

### When Student Wants to Jump Ahead

```
┌────────────────────────────────────────┐
│                                        │
│  🤖 Tutor:                            │
│  "I see you want to skip ahead!        │
│   That's great confidence! 🚀          │
│                                        │
│  Let me just check you're ready with   │
│  one quick problem..."                 │
│                                        │
│  [Quick Challenge: x + 5 = 13]         │
│                                        │
│  ✓ Nailed it? Skip ahead              │
│  ✗ Need practice? Stay here           │
│                                        │
└────────────────────────────────────────┘
```

---

## Settings & Preferences

```
┌────────────────────────────────────────┐
│  ⚙️ Settings                          │
├────────────────────────────────────────┤
│                                        │
│  Learning Style:                       │
│  🔘 Guided (more hints)                │
│  🔘 Challenge me (fewer hints)         │
│                                        │
│  Practice Amount:                      │
│  🔘 Quick (3 problems)                 │
│  🔘 Standard (5 problems)              │
│  🔘 Thorough (8 problems)              │
│                                        │
│  Show skill tree: [ON/OFF]             │
│                                        │
│  Encourage

ments: [ON/OFF]             │
│  (confetti, celebrations)              │
│                                        │
└────────────────────────────────────────┘
```

---

## Key UX Decisions

### Why This Works:

1. **Always Visible North Star**: Header shows main goal
2. **Breadcrumb Navigation**: Always know where you are
3. **Clear Transitions**: "Let's build this skill first" messaging
4. **Progress Bars**: Visual feedback at every level
5. **Gamification**: Feels like unlocking, not failing
6. **One Level at a Time**: Only show immediate next step
7. **Easy Returns**: "Return to Main Problem" is always clear
8. **Quick Options**: Buttons for common responses
9. **Micro-Celebrations**: Positive reinforcement frequently

### Why It's Age-Appropriate:

- **Simple language**: No jargon
- **Visual progress**: Stars, bars, checkmarks
- **Gaming metaphors**: "unlock skills"
- **Bite-sized**: 3-5 problems max
- **Encouraging**: Never punitive language
- **Quick wins**: Celebrate small victories

---

## Technical Implementation Notes

### State Management

```javascript
{
  mainProblem: "2x + 5 = 13",
  skillPath: ["main_problem", "one_step_equations", "variables"],
  currentLevel: "variables",
  skillProgress: {
    variables: { completed: 3, total: 5, mastered: false },
    one_step_equations: { completed: 0, total: 5, mastered: false }
  },
  returnStack: ["main_problem", "one_step_equations"]
}
```

### Navigation Logic

```javascript
function returnToParent() {
  const parent = returnStack.pop();
  currentLevel = parent;
  showMessage("🎉 Returning to " + parent);
}

function branchToPrerequisite(skill) {
  returnStack.push(currentLevel);
  currentLevel = skill;
  showMessage("Let's build this skill first!");
}
```
