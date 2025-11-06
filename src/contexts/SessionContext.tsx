'use client';

/**
 * SessionContext
 * Manages tutoring session state with Firestore persistence
 * Handles recursive skill branching, practice flow, and session recovery
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { removeUndefined } from '@/lib/firestore-helpers';
import { useAuth } from './AuthContext';
import type { Message } from '@/types/conversation';
import type {
  TutoringSession,
  SessionState,
  SessionStatus,
  SkillBranch,
  PracticeProblem,
  SessionUpdate,
  SessionContextType,
} from '@/types/session';

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Maximum depth for skill branching (prevent infinite recursion)
const MAX_DEPTH = 2;

// Session timeout threshold (1 hour)
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

/**
 * SessionProvider Props
 */
interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider Component
 * Wraps the application to provide session context with Firestore persistence
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<TutoringSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverableSession, setRecoverableSession] = useState<TutoringSession | null>(null);
  const { user } = useAuth();

  // Debounce timer for auto-save
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  // Ref to always hold the latest session snapshot to avoid stale-closure races
  const sessionRef = React.useRef<TutoringSession | null>(null);

  // Keep sessionRef in sync with state
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  /**
   * Convert Firestore data to TutoringSession
   */
  const convertFirestoreToSession = (data: any): TutoringSession => {
    const session = {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      lastMessageAt: data.lastMessageAt?.toDate?.() || new Date(data.lastMessageAt),
      completedAt: data.completedAt?.toDate?.() || (data.completedAt ? new Date(data.completedAt) : undefined),
      messages: data.messages || [],
      skillStack: (data.skillStack || []).map((branch: any) => ({
        ...branch,
        startedAt: branch.startedAt?.toDate?.() || new Date(branch.startedAt),
        completedAt: branch.completedAt?.toDate?.() || (branch.completedAt ? new Date(branch.completedAt) : undefined),
        attempts: (branch.attempts || []).map((attempt: any) => ({
          ...attempt,
          timestamp: attempt.timestamp?.toDate?.() || new Date(attempt.timestamp),
        })),
      })),
    };

    console.log('🔄 Loading session from Firestore:', {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      messages: session.messages,
      status: session.status,
    });

    return session;
  };

  /**
   * Save session to Firestore with debouncing
   */
  const saveSessionToFirestore = async (sessionData: TutoringSession, debounce: boolean = false) => {
    if (!sessionData.sessionId) {
      throw new Error('Cannot save session without sessionId');
    }

    const performSave = async () => {
      try {
        const sessionRef = doc(db, 'sessions', sessionData.sessionId);

        // Convert dates to Firestore timestamps
        const firestoreData = removeUndefined({
          ...sessionData,
          lastMessageAt: serverTimestamp(),
        });

        await setDoc(sessionRef, firestoreData, { merge: true });

        console.log('💾 Saved session to Firestore:', {
          sessionId: sessionData.sessionId,
          messageCount: sessionData.messages?.length || 0,
          messages: sessionData.messages,
          debounced: debounce,
          status: sessionData.status,
        });

        // Update localStorage with active session ID
        if (typeof window !== 'undefined' && sessionData.status === 'active') {
          localStorage.setItem('activeSessionId', sessionData.sessionId);
        }
      } catch (err) {
        console.error('Error saving session to Firestore:', err);
        throw new Error('Failed to save session');
      }
    };

    if (debounce) {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new timer (5 seconds debounce)
      saveTimerRef.current = setTimeout(() => {
        performSave();
      }, 5000);
    } else {
      // Save immediately
      await performSave();
    }
  };

  /**
   * Create a new tutoring session
   */
  const createSession = useCallback(
    async (problemText: string, problemLatex?: string, initialMessage?: string, mainSkillId?: string): Promise<TutoringSession> => {
      if (!user) {
        throw new Error('User must be authenticated to create a session');
      }

      setLoading(true);
      setError(null);

      try {
        // Generate session ID
        const sessionId = `session_${user.uid}_${Date.now()}`;

        // Create initial messages array with greeting if provided
        const initialMessages: Message[] = initialMessage
          ? [{ role: 'assistant', content: initialMessage, timestamp: Date.now() }]
          : [];

        const newSession: TutoringSession = {
          sessionId,
          userId: user.uid,
          mainProblem: {
            text: problemText,
            ...(problemLatex && { latex: problemLatex }),
          },
          ...(mainSkillId && { mainSkillId }), // Include mainSkillId if provided
          skillStack: [],
          currentScreen: 'diagnosis',
          messages: initialMessages,
          createdAt: new Date(),
          lastMessageAt: new Date(),
          status: 'active',
          branchHistory: [],
          totalProblemsAttempted: 0,
          totalCorrectAnswers: 0,
        };

        console.log('📝 Creating new session:', {
          sessionId,
          messageCount: initialMessages.length,
          hasInitialMessage: !!initialMessage,
        });

        // Save to Firestore
        await saveSessionToFirestore(newSession);

        // Update local state
        setSession(newSession);

        return newSession;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Load an existing session from Firestore
   */
  const loadSession = useCallback(async (sessionId: string): Promise<TutoringSession> => {
    setLoading(true);
    setError(null);

    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = convertFirestoreToSession(sessionDoc.data());

      // Check if session belongs to current user
      if (user && sessionData.userId !== user.uid) {
        throw new Error('Unauthorized: Session belongs to different user');
      }

      setSession(sessionData);
      return sessionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * End the current session
   */
  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      const updates: SessionUpdate = {
        status: 'completed',
        completedAt: new Date(),
        currentScreen: 'completed',
      };

      await updateSessionProgress(updates);

      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeSessionId');
      }

      setSession(null);
    } catch (err) {
      console.error('Error ending session:', err);
      throw err;
    }
  }, [session]);

  /**
   * Branch to a prerequisite skill
   */
  const branchToSkill = useCallback(
    async (skillId: string, skillName: string, skillDescription?: string) => {
      if (!session) {
        throw new Error('No active session');
      }

      // Check if already practiced this skill
      if (session.branchHistory.includes(skillId)) {
        throw new Error('This skill has already been practiced in this session');
      }

      // Check depth limit
      if (session.skillStack.length >= MAX_DEPTH) {
        throw new Error('Maximum branching depth reached');
      }

      try {
        const newBranch: SkillBranch = {
          skillId,
          skillName,
          skillDescription,
          problems: [],
          currentProblemIndex: 0,
          successCount: 0,
          attempts: [],
          startedAt: new Date(),
          mastered: false,
        };

        const updatedSession = {
          ...session,
          skillStack: [...session.skillStack, newBranch],
          currentScreen: 'fork' as SessionState,
          branchHistory: [...session.branchHistory, skillId],
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to branch to skill';
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  /**
   * Start practice with generated problems
   */
  const startPractice = useCallback(
    async (problems: PracticeProblem[]) => {
      if (!session) {
        throw new Error('No active session');
      }

      if (session.skillStack.length === 0) {
        throw new Error('No skill branch to practice');
      }

      try {
        const updatedStack = [...session.skillStack];
        const currentBranch = updatedStack[updatedStack.length - 1];

        currentBranch.problems = problems;
        currentBranch.currentProblemIndex = 0;

        const updatedSession = {
          ...session,
          skillStack: updatedStack,
          currentScreen: 'practice' as SessionState,
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start practice';
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  /**
   * Record a problem attempt
   */
  const recordProblemAttempt = useCallback(
    async (answer: string, correct: boolean) => {
      if (!session) {
        throw new Error('No active session');
      }

      if (session.skillStack.length === 0) {
        throw new Error('No active skill branch');
      }

      try {
        const updatedStack = [...session.skillStack];
        const currentBranch = updatedStack[updatedStack.length - 1];

        // Record attempt
        currentBranch.attempts.push({
          problemIndex: currentBranch.currentProblemIndex,
          answer,
          correct,
          timestamp: new Date(),
        });
        

        // Update success count
        if (correct) {
          currentBranch.successCount += 1;
        }

        const updatedSession = {
          ...session,
          skillStack: updatedStack,
          totalProblemsAttempted: session.totalProblemsAttempted + 1,
          totalCorrectAnswers: session.totalCorrectAnswers + (correct ? 1 : 0),
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to record attempt';
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  /**
   * Move to next problem
   */
  const nextProblem = useCallback(async () => {
    if (!session) {
      throw new Error('No active session');
    }

    if (session.skillStack.length === 0) {
      throw new Error('No active skill branch');
    }

    try {
      const updatedStack = [...session.skillStack];
      const currentBranch = updatedStack[updatedStack.length - 1];

      currentBranch.currentProblemIndex += 1;

      // Check if practice is complete
      if (currentBranch.currentProblemIndex >= currentBranch.problems.length) {
        // Calculate mastery (60% threshold = 3/5 correct)
        const successRate = currentBranch.successCount / currentBranch.problems.length;
        const mastered = successRate >= 0.6;

        currentBranch.mastered = mastered;
        currentBranch.completedAt = new Date();

        const updatedSession = {
          ...session,
          skillStack: updatedStack,
          currentScreen: 'mastered' as SessionState,
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      } else {
        const updatedSession = {
          ...session,
          skillStack: updatedStack,
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move to next problem';
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  /**
   * Complete current branch (mark as mastered)
   */
  const completeCurrentBranch = useCallback(async () => {
    if (!session) {
      throw new Error('No active session');
    }

    if (session.skillStack.length === 0) {
      throw new Error('No skill branch to complete');
    }

    try {
      const updatedStack = [...session.skillStack];
      const currentBranch = updatedStack[updatedStack.length - 1];

      currentBranch.mastered = true;
      currentBranch.completedAt = new Date();

      const updatedSession = {
        ...session,
        skillStack: updatedStack,
        currentScreen: 'mastered' as SessionState,
      };

      await saveSessionToFirestore(updatedSession);
      setSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete branch';
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  /**
   * Return to parent level after completing a skill
   */
  const returnToParent = useCallback(async () => {
    if (!session) {
      throw new Error('No active session');
    }

    if (session.skillStack.length === 0) {
      throw new Error('No skill branch to return from');
    }

    try {
      // Get completed skill info before popping
      const completedBranch = session.skillStack[session.skillStack.length - 1];
      const completedSkillName = completedBranch.skillName;
      const successRate = completedBranch.problems.length > 0
        ? Math.round((completedBranch.successCount / completedBranch.problems.length) * 100)
        : 0;

      // Pop completed skill from stack
      const updatedStack = [...session.skillStack];
      updatedStack.pop();

      // Determine next screen and generate return message
      let nextScreen: SessionState;
      let returnMessage: string;

      if (updatedStack.length > 0) {
        // Returning to parent skill practice
        nextScreen = 'practice';
        const parentSkillName = updatedStack[updatedStack.length - 1].skillName;
        returnMessage = `Excellent! Now that you understand ${completedSkillName}, let's continue with ${parentSkillName}. You got ${successRate}% correct - great progress!`;
      } else {
        // Returning to main problem diagnosis
        nextScreen = 'diagnosis';
        const mainProblemText = session.mainProblem.text;
        returnMessage = `Great! You mastered ${completedSkillName} (${successRate}% correct). Now let's apply it to your original problem: ${mainProblemText}`;
      }

      // Create return message to add to conversation
      const returnMessageObj: Message = {
        role: 'assistant',
        content: returnMessage,
        timestamp: Date.now(),
      };

      const updatedSession = {
        ...session,
        skillStack: updatedStack,
        currentScreen: nextScreen,
        messages: [...session.messages, returnMessageObj],
      };

      await saveSessionToFirestore(updatedSession);
      setSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to return to parent';
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  /**
   * Update session progress
   */
  const updateSessionProgress = useCallback(
    async (updates: SessionUpdate) => {
      if (!session) {
        throw new Error('No active session');
      }

      try {
        // Clean updates to remove any undefined values before spreading
        const cleanedUpdates = removeUndefined(updates);

        const updatedSession = {
          ...session,
          ...cleanedUpdates,
        };

        await saveSessionToFirestore(updatedSession);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  /**
   * Update current screen state
   */
  const updateCurrentScreen = useCallback(
    async (screen: SessionState) => {
      await updateSessionProgress({ currentScreen: screen });
    },
    [updateSessionProgress]
  );

  /**
   * Add message to session history with immediate save
   */
  const addMessageToSession = useCallback(
    async (message: Message) => {
      const current = sessionRef.current;
      if (!current) {
        throw new Error('No active session');
      }

      try {
        const updatedSession = {
          ...current,
          messages: [...current.messages, message],
        };

        console.log('➕ Adding message to session:', {
          sessionId: current.sessionId,
          currentMessageCount: current.messages.length,
          newMessageCount: updatedSession.messages.length,
          newMessage: {
            role: message.role,
            content: message.content.substring(0, 50) + '...',
          },
        });

        // ✅ FIX: Use immediate save for messages (no debounce)
        // Messages are critical data and should persist immediately
        await saveSessionToFirestore(updatedSession, false);
        // Update both ref and state immediately to prevent race overwrites
        sessionRef.current = updatedSession;
        setSession(updatedSession);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Get current skill branch
   */
  const getCurrentBranch = useCallback((): SkillBranch | null => {
    if (!session || session.skillStack.length === 0) {
      return null;
    }
    return session.skillStack[session.skillStack.length - 1];
  }, [session]);

  /**
   * Get current depth in skill tree
   */
  const getDepth = useCallback((): number => {
    return session?.skillStack.length || 0;
  }, [session]);

  /**
   * Check if can branch deeper
   */
  const canBranchDeeper = useCallback((): boolean => {
    return (session?.skillStack.length || 0) < MAX_DEPTH;
  }, [session]);

  /**
   * Check if a skill has already been attempted
   */
  const hasAttemptedSkill = useCallback(
    (skillId: string): boolean => {
      return session?.branchHistory.includes(skillId) || false;
    },
    [session]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resume a recoverable session
   */
  const resumeSession = useCallback(async () => {
    if (!recoverableSession) {
      throw new Error('No recoverable session');
    }

    try {
      setLoading(true);

      // Mark session as active again
      const resumedSession = {
        ...recoverableSession,
        status: 'active' as const,
      };

      // Update in Firestore
      await saveSessionToFirestore(resumedSession, false);

      setSession(resumedSession);
      setRecoverableSession(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recoverableSession]);

  /**
   * Decline to resume session and mark as abandoned
   */
  const declineSession = useCallback(async () => {
    if (!recoverableSession) return;

    try {
      const sessionRef = doc(db, 'sessions', recoverableSession.sessionId);
      await updateDoc(sessionRef, {
        status: 'abandoned',
        lastMessageAt: serverTimestamp(),
      });

      localStorage.removeItem('activeSessionId');
      setRecoverableSession(null);
    } catch (err) {
      console.error('Error declining session:', err);
      // Clear anyway
      localStorage.removeItem('activeSessionId');
      setRecoverableSession(null);
    }
  }, [recoverableSession]);

  /**
   * Check for abandoned session on mount
   */
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const checkForAbandonedSession = async () => {
      const activeSessionId = localStorage.getItem('activeSessionId');

      if (!activeSessionId) return;

      // Defensive check: ensure session ID belongs to current user
      // Session IDs have format: session_{userId}_{timestamp}
      if (!activeSessionId.includes(user.uid)) {
        console.log('Clearing activeSessionId from different user:', activeSessionId);
        localStorage.removeItem('activeSessionId');
        return;
      }

      try {
        const sessionRef = doc(db, 'sessions', activeSessionId);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
          localStorage.removeItem('activeSessionId');
          return;
        }

        const sessionData = convertFirestoreToSession(sessionDoc.data());

        // Check if session is recent and active/paused (paused means user refreshed page)
        const timeSinceLastMessage = Date.now() - sessionData.lastMessageAt.getTime();

        if (
          sessionData.userId === user.uid &&
          (sessionData.status === 'active' || sessionData.status === 'paused') &&
          timeSinceLastMessage < SESSION_TIMEOUT_MS
        ) {
          // Session is recoverable - set it for UI to display modal
          console.log('Found recoverable session:', activeSessionId);
          setRecoverableSession(sessionData);
        } else if (timeSinceLastMessage >= SESSION_TIMEOUT_MS) {
          // Mark as abandoned
          await updateDoc(sessionRef, {
            status: 'abandoned',
            lastMessageAt: serverTimestamp(),
          });
          localStorage.removeItem('activeSessionId');
        }
      } catch (err) {
        console.error('Error checking for abandoned session:', err);
        localStorage.removeItem('activeSessionId');
      }
    };

    checkForAbandonedSession();
  }, [user]);

  /**
   * Auto-save on page unload
   */
  useEffect(() => {
    if (!session || typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      if (session.status === 'active') {
        // ✅ FIX: Clear any pending debounced saves
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }

        // Mark as paused and save current state including messages
        const sessionRef = doc(db, 'sessions', session.sessionId);
        updateDoc(sessionRef, {
          status: 'paused',
          lastMessageAt: serverTimestamp(),
          messages: session.messages, // ✅ Include messages array
        }).catch(err => console.error('Error pausing session:', err));

        console.log('⏸️ Pausing session on page unload:', {
          sessionId: session.sessionId,
          messageCount: session.messages.length,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  const value: SessionContextType = {
    session,
    loading,
    error,
    recoverableSession,
    createSession,
    loadSession,
    endSession,
    pauseAndClearSession: async () => {
      const current = sessionRef.current;
      if (!current) return;
      try {
        const sessionDbRef = doc(db, 'sessions', current.sessionId);
        await updateDoc(sessionDbRef, {
          status: 'paused',
          lastMessageAt: serverTimestamp(),
          messages: current.messages,
        });
      } catch (err) {
        console.error('Error pausing session:', err);
      } finally {
        setSession(null);
      }
    },
    resumeSession,
    declineSession,
    branchToSkill,
    completeCurrentBranch,
    returnToParent,
    startPractice,
    recordProblemAttempt,
    nextProblem,
    updateSessionProgress,
    updateCurrentScreen,
    addMessageToSession,
    getCurrentBranch,
    getDepth,
    canBranchDeeper,
    hasAttemptedSkill,
    clearError,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * useSession Hook
 * Custom hook to access the session context
 * @throws Error if used outside of SessionProvider
 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}
