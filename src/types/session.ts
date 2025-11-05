/**
 * Session Type Definitions
 * Types for the tutoring session state management system
 */

import { Message } from './conversation';

/**
 * Session state enum representing different screens in the tutoring flow
 */
export type SessionState =
  | 'entry'       // Initial problem entry
  | 'diagnosis'   // Socratic questioning to detect gaps
  | 'fork'        // Skill practice selection screen
  | 'practice'    // Working on practice problems
  | 'mastered'    // Celebration screen after mastering a skill
  | 'completed';  // Session complete

/**
 * Session status
 */
export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'paused';

/**
 * Individual problem in a practice session
 */
export interface PracticeProblem {
  text: string;
  hint: string;
  solution: string;
  latex?: string;
}

/**
 * Student's attempt at a practice problem
 */
export interface ProblemAttempt {
  problemIndex: number;
  answer: string;
  correct: boolean;
  timestamp: Date;
}

/**
 * A skill branch in the session stack
 * Represents one level of practice (can be nested up to 2 levels deep)
 */
export interface SkillBranch {
  skillId: string;
  skillName: string;
  skillDescription?: string;
  problems: PracticeProblem[];
  currentProblemIndex: number;
  successCount: number;
  attempts: ProblemAttempt[];
  startedAt: Date;
  completedAt?: Date;
  mastered: boolean;
}

/**
 * Main problem that initiated the tutoring session
 */
export interface MainProblem {
  text: string;
  latex?: string;
  imageUrl?: string;
}

/**
 * Complete tutoring session
 * Stores all state needed to manage the recursive skill practice flow
 */
export interface TutoringSession {
  // Session identification
  sessionId: string;
  userId: string;

  // Main problem
  mainProblem: MainProblem;
  mainSkillId?: string;

  // Skill stack (supports recursive branching)
  // Index 0 = main problem level
  // Index 1 = first branch (layer 1)
  // Index 2 = second branch (layer 2, max depth)
  skillStack: SkillBranch[];

  // Current UI state
  currentScreen: SessionState;

  // Message history for this session
  messages: Message[];

  // Timestamps
  createdAt: Date;
  lastMessageAt: Date;
  completedAt?: Date;

  // Session status
  status: SessionStatus;

  // Metadata
  branchHistory: string[]; // List of skill IDs already practiced (prevent loops)
  totalProblemsAttempted: number;
  totalCorrectAnswers: number;
}

/**
 * Partial session data for updates
 */
export type SessionUpdate = Partial<Omit<TutoringSession, 'sessionId' | 'userId' | 'createdAt'>>;

/**
 * Session context state
 */
export interface SessionContextState {
  session: TutoringSession | null;
  loading: boolean;
  error: string | null;
  recoverableSession: TutoringSession | null;
}

/**
 * Session context type
 */
export interface SessionContextType extends SessionContextState {
  // Session lifecycle
  createSession: (
    problemText: string,
    problemLatex?: string,
    initialMessage?: string,
    mainSkillId?: string
  ) => Promise<TutoringSession>;
  loadSession: (sessionId: string) => Promise<TutoringSession>;
  endSession: () => Promise<void>;

  // Session recovery
  resumeSession: () => Promise<void>;
  declineSession: () => Promise<void>;

  // Skill branching
  branchToSkill: (skillId: string, skillName: string, skillDescription?: string) => Promise<void>;
  completeCurrentBranch: () => Promise<void>;
  returnToParent: () => Promise<void>;

  // Practice flow
  startPractice: (problems: PracticeProblem[]) => Promise<void>;
  recordProblemAttempt: (answer: string, correct: boolean) => Promise<void>;
  nextProblem: () => Promise<void>;

  // Session updates
  updateSessionProgress: (updates: SessionUpdate) => Promise<void>;
  updateCurrentScreen: (screen: SessionState) => Promise<void>;

  // Message management
  addMessageToSession: (message: Message) => Promise<void>;

  // Utilities
  getCurrentBranch: () => SkillBranch | null;
  getDepth: () => number;
  canBranchDeeper: () => boolean;
  hasAttemptedSkill: (skillId: string) => boolean;
  clearError: () => void;
}
