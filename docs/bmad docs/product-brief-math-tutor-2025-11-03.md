# Product Brief: math-tutor

**Date:** 2025-11-03
**Author:** Mike
**Context:** Educational Technology - AI-Powered Learning Tool

---

## Executive Summary

**Math Tutor** is an AI-powered Socratic learning assistant that guides students through math problems using patient questioning rather than direct answers. Inspired by the OpenAI x Khan Academy demo, this portfolio project demonstrates the future of AI in education through multi-modal interaction - combining vision understanding, conversational AI, and spatial reasoning.

**The Problem:** Students have easy access to answer-giving tools (calculators, ChatGPT) but lack scalable access to the Socratic guidance that develops real problem-solving skills. Traditional tutoring works but doesn't scale.

**The Solution:** An intelligent tutoring system that adapts its interaction model to problem type - clean equation rendering and dialogue for algebra/calculus, interactive canvas collaboration for geometry/trigonometry. The AI never gives direct answers; instead, it asks guiding questions, validates reasoning, and provides hints only when students are genuinely stuck.

**Key Innovation:** Multi-modal pedagogy that feels like working with a human tutor at a whiteboard. Students can upload problems via text or image, annotate diagrams to show their thinking, and receive contextual guidance that references both conversation history and visual interactions.

**Target Audience:** This is a technical demonstration/portfolio piece showcasing AI + full-stack capabilities, designed to impress technical recruiters, educators, and developers interested in the intersection of AI and education.

**Scope:** MVP focuses on core Socratic dialogue, canvas interaction, and equation rendering across 5+ problem types. Stretch features include voice interface, AI canvas drawing, and advanced step visualization. Built with Next.js, OpenAI GPT-4 Vision, and modern web technologies.

---

## Core Vision

### Problem Statement

Students today have easy access to tools that give them direct answers to math problems (calculators, ChatGPT, online solvers), but these tools don't help them learn the underlying concepts or develop problem-solving skills. Traditional tutoring provides the Socratic guidance students need, but doesn't scale - teachers can't provide 1-on-1 attention to every student who gets stuck.

The challenge is creating an AI system that genuinely teaches rather than just solves - one that guides students to discover solutions themselves through patient questioning, the way a skilled human tutor would.


### Proposed Solution

An AI-powered math tutor that uses Socratic questioning to guide students to discover solutions themselves. The system adapts its interaction model based on problem type:

**For symbolic problems (algebra, calculus):** Clean equation rendering with LaTeX/KaTeX, text-based dialogue, and visual step-by-step breakdowns that show solution progression without giving away answers.

**For visual problems (geometry, trigonometry):** Interactive canvas where students can annotate diagrams - circling angles, drawing construction lines, highlighting relevant parts. The AI recognizes these spatial interactions and responds contextually, creating a two-way visual dialogue.

**Core pedagogical principle:** The system NEVER gives direct answers. Instead, it asks guiding questions, validates student reasoning, and provides hints only when students are stuck. The AI adjusts its language and scaffolding based on problem complexity (3rd grade arithmetic vs. calculus).

**Key innovation:** Multi-modal interaction that combines vision LLM (for problem parsing), conversational AI (for Socratic dialogue), and spatial reasoning (for canvas-based collaboration) - creating a tutoring experience that feels closer to working with a human tutor at a whiteboard.

### Key Differentiators

**Multi-modal pedagogy over answer-giving:** Unlike ChatGPT/calculators that just solve, or basic tutoring apps with canned responses, this system combines vision understanding, Socratic dialogue, and spatial interaction to genuinely teach problem-solving strategies.

**Adaptive interaction by problem type:** Automatically adjusts between text-based (algebra/calculus) and canvas-based (geometry/trigonometry) interaction modes, meeting students where the problem naturally lives.

**Two-way visual dialogue (stretch):** Not just students marking up diagrams - the AI can also draw, highlight, and annotate to guide attention, creating a shared whiteboard experience like working with a human tutor.

**Conversation + canvas history:** Maintains context across both verbal exchanges AND visual interactions - remembering not just what was said, but what was drawn and in what order.

**Scaffolding intelligence:** Adjusts language complexity, hint timing, and scaffolding depth based on problem difficulty (3rd grade vs calculus) and student progress (stuck for 2+ turns → more concrete hints).

---

## Target Users

### Primary Users

**Demo Audience (Primary):**
- Technical recruiters and hiring managers evaluating AI/full-stack capabilities
- Educators and EdTech professionals interested in AI tutoring potential
- Developers and AI enthusiasts curious about multi-modal learning systems

**What they need to see:** A working demonstration that handles diverse problem types (arithmetic through calculus, text and visual problems) with genuine pedagogical intelligence, not just answer-giving. The demo should feel polished and showcase technical sophistication (vision LLM, canvas interaction, voice, step visualization).

**Test Users (Secondary):**
- Developers/testers working through sample problems across skill levels (3rd grade arithmetic, algebra, geometry, trigonometry, calculus)
- Used to validate the Socratic approach works and the system handles multiple problem types gracefully

**Scope Note:** This is a portfolio/showcase project - not a production classroom deployment. No authentication, user data persistence, or scale/privacy concerns. Focus is on demonstrating what's technically possible with AI-powered education.


---

## Success Metrics

**Demo Success Criteria:**
- System successfully guides students through **5+ diverse problem types** (arithmetic, algebra, geometry, trigonometry, calculus) without giving direct answers
- **Maintains conversation and canvas context** - remembers what was discussed and what was drawn/annotated
- **Adapts scaffolding** to problem complexity - uses appropriate language for 3rd grade arithmetic vs. calculus
- **Authentic Socratic pedagogy** - feels like working with a patient tutor, not an answer machine

**Key Demo Scenarios to Showcase:**

1. **Calculus Problem (Equation-Heavy):** Complex derivative/integral with beautiful LaTeX rendering, principle-based guidance ("What rule applies here?"), step visualization showing progress without revealing the answer

2. **Geometry Problem (Canvas-Heavy):** Diagram upload, student annotates/circles elements, AI responds to spatial references ("I see you've identified angle ABC..."), demonstrates visual dialogue

3. **Algebra Problem (Hybrid):** Multi-step equation solving with mix of equation rendering and conversational guidance, shows AI adjusting hint depth when student gets stuck

**Evaluation Dimensions (from requirements):**
- **Pedagogical Quality (35%):** Genuine guidance without answer-giving, appropriate scaffolding, encouragement
- **Technical Implementation (30%):** Vision parsing works, context maintained, rendering polished
- **User Experience (20%):** Intuitive interface, responsive interactions, professional feel
- **Innovation (15%):** Creative integration of multi-modal features (canvas + conversation + vision)

---

## MVP Scope

### Core Features

**MVP - Must-Have for Demo:**

1. **Problem Input System**
   - Text entry for typed problems
   - Image upload with drag-and-drop
   - Vision LLM parsing to extract problem from images (handles both printed and handwritten)

2. **Math Rendering Engine**
   - LaTeX/KaTeX integration for equation display
   - Handles inline and block equations
   - Clean, readable formatting for complex expressions

3. **Socratic Dialogue Engine**
   - Multi-turn conversation with context retention
   - Never gives direct answers - only guiding questions and hints
   - Validates student responses and adapts follow-up questions
   - Increases hint concreteness after 2+ stuck turns

4. **Interactive Canvas (for visual problems)**
   - Student can draw, circle, highlight on uploaded diagrams
   - Canvas state tracking (what was drawn + sequence/order)
   - Canvas snapshots sent to LLM for spatial understanding
   - AI references student's marks in conversation ("I see you've circled angle ABC...")

5. **Step Visualization**
   - Visual breakdown showing solution progress
   - Updates as conversation advances
   - Never reveals final answer - shows thinking progression

6. **Chat Interface**
   - Clean, intuitive UI with conversation history
   - Equation rendering in chat messages
   - Image preview for uploaded problems
   - Clear visual distinction between student and AI messages

7. **Problem Type Adaptation**
   - Automatically detects equation-heavy vs. diagram-heavy problems
   - Surfaces appropriate interaction mode (chat-focused vs. canvas-focused)
   - Adjusts language complexity based on problem difficulty (arithmetic vs. calculus)

### Out of Scope for MVP

**Explicitly NOT included in MVP:**
- User authentication or accounts
- Data persistence across sessions
- Deployment/scaling infrastructure
- Privacy/security features (PII handling, data encryption)
- Multi-user support or collaboration features
- Payment or subscription systems
- Mobile native apps (web-based only)
- Comprehensive error handling for production use

### MVP Success Criteria

**The MVP is successful if:**
- Demonstrates working Socratic guidance on 5+ problem types without giving answers
- Canvas interaction feels natural and AI understands spatial references
- LaTeX rendering is clean and professional
- Step visualization provides value without spoiling solutions
- System maintains context across 10+ turn conversations
- Demo can be completed smoothly in 5 minutes showcasing all three key scenarios

### Future Vision (Stretch Features)

**High-Value Enhancements:**

1. **Two-Way Canvas Interaction**
   - AI can draw/highlight on canvas to guide attention
   - "Let me show you which angle is the hypotenuse" → AI highlights it
   - True shared whiteboard experience

2. **Voice Interface**
   - Text-to-speech for AI responses (natural tutoring voice)
   - Speech-to-text for student input
   - Particularly valuable for younger students or accessibility

3. **Advanced Step Visualization**
   - Animated breakdowns showing mathematical transformations
   - Interactive "show me the next step" feature
   - Visual proof walkthroughs

**Polish Enhancements:**

4. **Animated Avatar**
   - 2D/3D tutor character with expressions
   - Reacts to student progress (encouraging nods, thinking poses)
   - Pairs well with voice interface

5. **Difficulty Mode Selector**
   - Explicit grade level or topic selection
   - Pre-configured scaffolding levels
   - Adjusts vocabulary and hint density

6. **Problem Generator**
   - "Create a similar problem for practice"
   - Generates variations with adjustable difficulty
   - Tracks which problem types student has mastered

**Architecture Note:** MVP canvas API should be designed extensible enough that AI drawing (stretch #1) can be added without major refactoring.

---


## Technical Preferences

**Frontend Stack:**
- **Framework:** Next.js with React + TypeScript
- **Math Rendering:** KaTeX (fast, lightweight LaTeX rendering)
- **Canvas:** Fabric.js or Konva.js (interactive canvas with layer management)
- **Image Upload:** React-Dropzone (drag-and-drop file handling)
- **UI Components:** TBD (Tailwind CSS + Headless UI, or similar)

**Backend/AI:**
- **LLM Provider:** OpenAI API
  - GPT-4 Vision for image parsing and problem extraction
  - GPT-4 for Socratic dialogue engine (excellent at following system prompts)
- **API Layer:** Next.js API routes (serverless functions)

**Voice (Stretch Feature):**
- **Text-to-Speech:** OpenAI TTS API
- **Speech-to-Text:** OpenAI Whisper API
- **Fallback Option:** Web Speech API (browser-native, lower quality but zero-cost)

**Deployment:**
- **Hosting:** Vercel (seamless Next.js deployment)
- **Environment:** Single deployment with frontend + serverless API
- **Scope:** Demo/local environment - no production scaling concerns

**Architecture Decisions:**
- Monorepo approach (Next.js handles both frontend and API)
- Session-based state (no database needed for demo)
- Canvas API abstraction layer (enables future AI drawing without refactor)
- Modular prompt engineering (separate system prompts for difficulty levels)


## Risks and Assumptions

**Technical Risks:**

1. **Vision LLM Accuracy on Complex Notation**
   - Risk: Handwritten calculus/advanced math symbols may not parse correctly
   - Mitigation: Start testing with printed problems, validate handwriting separately; provide text input fallback

2. **Canvas-to-LLM Understanding**
   - Risk: GPT-4 Vision may struggle to understand spatial references ("the angle you circled")
   - Mitigation: Send clear canvas snapshots with annotations highlighted; include textual descriptions of canvas actions alongside images

3. **Context Window Management**
   - Risk: Long conversations + multiple images + canvas snapshots could exceed token limits
   - Mitigation: Implement conversation summarization after N turns; compress canvas state to essentials

4. **LaTeX Input Parsing**
   - Risk: Students typing plain text "2x+5=13" needs conversion to LaTeX for rendering
   - Mitigation: Use LLM to normalize input to LaTeX; support both formats gracefully

**Pedagogical Risks:**

5. **LLM Answer-Giving Slippage**
   - Risk: Despite system prompts, LLM might give direct answers under certain conditions
   - Mitigation: Aggressive prompt engineering with examples; post-processing to detect/block direct answers; extensive testing

6. **Hint Calibration**
   - Risk: Finding the sweet spot between helpful and hand-holding
   - Mitigation: Tiered hint system (vague → specific); test with real problem-solving sessions

7. **Step Visualization Spoilers**
   - Risk: Showing "progress" might reveal too much of the solution path
   - Mitigation: Show conceptual steps ("understanding the problem" → "identifying the method") not mathematical steps

**Scope/Timeline Risks:**

8. **Feature Creep**
   - Risk: Stretch features (voice, AI canvas drawing) eating into MVP completion time
   - Mitigation: Strict MVP feature lock; stretch features only after MVP fully working

9. **Canvas Complexity Underestimation**
   - Risk: Interactive canvas with sequence tracking might be more complex than anticipated
   - Mitigation: Spike/prototype canvas early; consider simplified version if needed

**Key Assumptions:**

- OpenAI API costs for demo development and presentation are acceptable (~$50-200 estimate)
- 5 problem types across difficulty levels is sufficient to prove pedagogical approach
- Session-based state without persistence is acceptable for demo purposes
- Vercel free tier sufficient for demo hosting (no high traffic expected)
- No accessibility compliance required (WCAG, screen readers) for MVP demo
- Demo audience values innovation over production-readiness

## Supporting Materials

**Reference Documents:**
- Original project overview: `/docs/user_added/math_tutor_overview.md`
- Inspiration: OpenAI x Khan Academy demo - https://www.youtube.com/watch?v=IvXZCocyU_M

**Test Problem Set (to prepare):**
- Simple arithmetic (3rd grade level)
- Algebraic equations (linear, quadratic)
- Geometry diagrams (triangles, angles, proofs)
- Trigonometry (visual + calculation)
- Calculus (derivatives, integrals with complex notation)

---

_This Product Brief captures the vision and requirements for math-tutor._

_It was created through collaborative discovery and reflects the unique needs of this educational technology portfolio project._

_Next: The PRD workflow will transform this brief into detailed planning artifacts, including epic breakdown and technical specifications._
