# Story 1.1: Initialize Next.js Project with TypeScript

Status: ready-for-dev

## Story

As a developer,
I want a Next.js project with TypeScript configured,
so that I have a modern, type-safe foundation for building the application.

## Requirements Context

**From Epic 1: Project Foundation & Core Infrastructure**

This is the foundational story that establishes the entire project structure. The architecture document specifies using the official `create-next-app` starter with specific configuration flags to ensure consistency with architectural decisions.

**Key Architectural Decisions:**
- Next.js 15.x (App Router)
- TypeScript with strict mode
- Tailwind CSS 4.0
- ESLint configuration
- `src/` directory structure
- Import alias `@/*` for clean imports

[Source: docs/architecture.md#Project-Initialization]

## Acceptance Criteria

1. ✅ Next.js 14+ project initialized with TypeScript
2. ✅ Package.json includes dependencies: react, next, typescript, @types/react, @types/node
3. ✅ tsconfig.json configured with strict mode
4. ✅ Basic folder structure: /src/app, /src/components, /src/lib, /src/public
5. ✅ Dev server runs on `npm run dev`
6. ✅ Production build succeeds with `npm run build`

[Source: docs/epics.md#Story-1.1]

## Tasks / Subtasks

- [ ] **Task 1: Initialize Next.js project using create-next-app** (AC: #1)
  - [ ] Run: `npx create-next-app@latest math-tutor --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`
  - [ ] Select configuration options as specified in architecture
  - [ ] Verify project created successfully with correct structure

- [ ] **Task 2: Verify TypeScript configuration** (AC: #2, #3)
  - [ ] Confirm package.json includes: react, next, typescript, @types/react, @types/node
  - [ ] Open tsconfig.json and verify `"strict": true` is enabled
  - [ ] Verify compiler options match project requirements
  - [ ] Check that import alias `@/*` is configured in tsconfig paths

- [ ] **Task 3: Verify folder structure** (AC: #4)
  - [ ] Confirm `/src/app` exists (App Router structure)
  - [ ] Confirm `/src/components` directory exists
  - [ ] Confirm `/src/lib` directory exists
  - [ ] Confirm `/public` directory exists (note: not under src/)
  - [ ] Verify starter files: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Task 4: Test development server** (AC: #5)
  - [ ] Run `npm run dev` from project root
  - [ ] Verify server starts on port 3000
  - [ ] Open http://localhost:3000 in browser
  - [ ] Confirm default Next.js page loads without errors
  - [ ] Check browser console for any errors
  - [ ] Stop dev server (Ctrl+C)

- [ ] **Task 5: Test production build** (AC: #6)
  - [ ] Run `npm run build` from project root
  - [ ] Verify build completes without errors
  - [ ] Confirm `.next` directory created
  - [ ] Check build output for any warnings
  - [ ] Optionally test production mode: `npm run start`

- [ ] **Task 6: Verify Tailwind and ESLint integration**
  - [ ] Confirm `tailwind.config.js` (or `.ts`) exists
  - [ ] Confirm `globals.css` includes Tailwind directives
  - [ ] Confirm `.eslintrc.json` exists
  - [ ] Run `npm run lint` to verify ESLint works
  - [ ] Confirm no linting errors in starter code

## Dev Notes

### Architecture Constraints

**Project Initialization Command (MANDATORY):**

```bash
npx create-next-app@latest math-tutor --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

**Configuration Flags Explained:**
- `--typescript`: Enable TypeScript
- `--tailwind`: Include Tailwind CSS
- `--app`: Use App Router (Next.js 13+ feature)
- `--eslint`: Include ESLint configuration
- `--src-dir`: Use `src/` directory for project organization
- `--import-alias "@/*"`: Configure clean imports (e.g., `@/components/Button`)

**Expected Versions (from Architecture):**
- Next.js: 15.x (current stable as of Jan 2025)
- React: 19.x
- TypeScript: Latest with strict mode
- Tailwind CSS: 4.0

### Project Structure Notes

The `create-next-app` starter will generate this structure:

```
math-tutor/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── globals.css     # Global styles (includes Tailwind)
│   │   └── favicon.ico     # Favicon
│   ├── components/         # Empty initially
│   └── lib/                # Empty initially
├── public/                 # Static assets (NOT under src/)
├── .next/                  # Build output (created on build)
├── node_modules/           # Dependencies
├── .eslintrc.json          # ESLint config
├── .gitignore              # Git ignore
├── next.config.js          # Next.js config
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── README.md               # Project README
```

**Note:** The `/public` directory is at project root, NOT inside `/src`. This is Next.js convention for static assets.

### Testing Standards

**Manual Verification Required:**
- Dev server starts without errors
- Production build completes successfully
- TypeScript strict mode enabled
- No console errors on default page load

**No automated tests for this story** - this is infrastructure setup.

### References

- [Source: docs/architecture.md#Project-Initialization] - Exact initialization command
- [Source: docs/architecture.md#Decision-Summary] - Technology versions and rationale
- [Source: docs/architecture.md#Project-Structure] - Full project structure specification
- [Source: docs/epics.md#Story-1.1] - User story and acceptance criteria

### Common Issues & Solutions

**Issue: Version mismatch warnings**
- Solution: Accept latest stable versions if prompted. Architecture specifies "Next.js 15.x" which means any 15.x version is acceptable.

**Issue: Port 3000 already in use**
- Solution: Next.js will automatically suggest port 3001. This is fine for development.

**Issue: npm vs pnpm vs yarn**
- Solution: Use npm (default) for consistency unless project standards specify otherwise.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled by dev agent during implementation -->

### Completion Notes List

<!-- Dev agent will document:
- Actual versions installed
- Any deviations from architecture
- New patterns established
- Interfaces created for reuse
- Technical debt deferred
- Recommendations for next story
-->

### File List

<!-- Dev agent will list:
- NEW: Files created by create-next-app
- MODIFIED: Any configuration files adjusted
- DELETED: None expected
-->
