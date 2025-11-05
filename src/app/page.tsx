'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, getDocs, limit, orderBy, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { useConversation } from '@/contexts/ConversationContext';
import Header from '@/components/Header';
import TextInput from '@/components/ProblemInput/TextInput';
import ImageUpload from '@/components/ProblemInput/ImageUpload';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';
import MathDisplay from '@/components/MathDisplay';
// ProgressHeader removed from chat pages in favor of right-side panel
import SkillFork from '@/components/tutoring/SkillFork';
import PracticeProblem from '@/components/tutoring/PracticeProblem';
import SkillMastered from '@/components/tutoring/SkillMastered';
import PracticeSidePanel from '@/components/tutoring/PracticeSidePanel';

type InputMode = 'text' | 'image';

interface RecommendedSkill {
  skillId: string;
  skillName: string;
  skillDescription?: string;
  reason: string;
}

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const {
    session,
    createSession,
    recoverableSession,
    resumeSession,
    declineSession,
    getCurrentBranch,
    startPractice,
    recordProblemAttempt,
    nextProblem,
    returnToParent,
    addMessageToSession,
    updateSessionProgress,
    branchToSkill,
  } = useSession();
  const router = useRouter();

  // Local UI state
  const [extractedProblem, setExtractedProblem] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [problemLatex, setProblemLatex] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  // Practice problem state
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Skill branching state
  const [recommendedSkill, setRecommendedSkill] = useState<RecommendedSkill | null>(null);

  const { addMessage, getConversationHistory, restoreMessages } = useConversation();

  // Inline resume prompt suppression for this tab
  const [suppressResumePrompt, setSuppressResumePrompt] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const val = window.sessionStorage.getItem('suppressResumePrompt');
      setSuppressResumePrompt(val === '1');
    } catch {}
  }, []);

  // Past sessions list
  interface SessionListItem {
    sessionId: string;
    mainProblem: { text: string; latex?: string };
    lastMessageAt?: Date;
    status?: string;
  }

  const [pastSessions, setPastSessions] = useState<SessionListItem[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState<boolean>(false);
  const [pastError, setPastError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPast = async () => {
      if (loading) return;
      if (!user) return;
      setIsLoadingPast(true);
      setPastError(null);
      try {
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid),
          orderBy('lastMessageAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const items: SessionListItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            sessionId: data.sessionId || docSnap.id,
            mainProblem: {
              text: data?.mainProblem?.text || 'Untitled problem',
              latex: data?.mainProblem?.latex,
            },
            lastMessageAt: data?.lastMessageAt?.toDate?.() || (data?.lastMessageAt ? new Date(data.lastMessageAt) : undefined),
            status: data?.status,
          };
        });
        setPastSessions(items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load sessions';
        setPastError(message);
      } finally {
        setIsLoadingPast(false);
      }
    };
    fetchPast();
  }, [loading, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!loading && user && userProfile) {
      const isProfileIncomplete =
        !userProfile.gradeLevel ||
        !userProfile.focusTopics ||
        userProfile.focusTopics.length === 0 ||
        !userProfile.interests ||
        userProfile.interests.length === 0;

      if (isProfileIncomplete) {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleProblemExtracted = (problemText: string, latex?: string) => {
    setExtractedProblem(problemText);
    setProblemLatex(latex);
    console.log('Problem extracted:', problemText);
    if (latex) {
      console.log('LaTeX detected:', latex);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    if (mode !== inputMode) {
      setInputMode(mode);
      setExtractedProblem('');
    }
  };

  /**
   * Handle starting a new tutoring session
   */
  const handleProblemSubmit = async (problemText: string, latex?: string) => {
    setIsCreatingSession(true);
    try {
      // Generate initial greeting message
      const displayProblem = latex ? `$${latex}$` : problemText;
      const greetingMessage = `I see you're working on: ${displayProblem}\n\nLet's work through this together! What's your first thought about this problem?`;

      // Step 1: Analyze problem to identify required skills BEFORE creating session
      let mainSkillId: string | undefined;
      try {
        const analysisResponse = await fetch('/api/skills/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemText }),
        });

        if (analysisResponse.ok) {
          const { primarySkill, requiredSkills, reasoning } = await analysisResponse.json();

          console.log('🔍 Problem analyzed:', {
            primarySkill,
            requiredSkills,
            reasoning,
          });

          mainSkillId = primarySkill;
        } else {
          console.warn('⚠️ Skill analysis failed, continuing without mainSkillId');
        }
      } catch (analysisError) {
        console.error('Error analyzing problem skills:', analysisError);
        // Continue anyway - skill analysis is helpful but not critical
      }

      // Step 2: Create session WITH mainSkillId already included
      const newSession = await createSession(problemText, latex, greetingMessage, mainSkillId);

      // Also add to ConversationContext for immediate display
      addMessage('assistant', greetingMessage);

      console.log('✅ Session created:', {
        sessionId: newSession.sessionId,
        messageCount: newSession.messages.length,
        mainSkillId: newSession.mainSkillId || 'none',
      });

      // Redirect to per-session page
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('suppressResumePrompt', '1');
        }
      } catch {}
      router.push(`/sessions/${newSession.sessionId}`);
    } catch (err) {
      console.error('Error creating session:', err);
      addMessage('assistant', 'Sorry, I encountered an error creating your session. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  /**
   * Handle sending a message in the chat during diagnosis
   */
  const handleSendMessage = async (message: string) => {
    // Format user message with LaTeX using gpt-4o-mini
    let formattedMessage = message;
    try {
      const formatResponse = await fetch('/api/format-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      const formatData = await formatResponse.json();
      if (formatData.success && formatData.formattedText) {
        formattedMessage = formatData.formattedText;
      }
    } catch (err) {
      console.warn('Failed to format math, using original text:', err);
    }

    // Add formatted user message to conversation
    addMessage('user', formattedMessage);

    // Add to session
    if (session) {
      await addMessageToSession({
        role: 'user',
        content: formattedMessage,
        timestamp: Date.now(),
      });
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Get conversation history
      const conversationHistory = getConversationHistory();

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          problemContext: session?.mainProblem.text || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from AI');
      }

      // Add AI response to conversation
      addMessage('assistant', data.response);

      // Add to session
      if (session) {
        await addMessageToSession({
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        });

        // AI-powered skill gap detection (replaces regex-based stuck detection)
        if (session.currentScreen === 'diagnosis' && session.mainSkillId && user) {
          try {
            // Get conversation history for AI analysis
            const conversationHistory = getConversationHistory();

            // Call AI branching analyzer
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

            if (branchingResponse.ok) {
              const branchingData = await branchingResponse.json();

              console.log('🤖 AI Branching Analysis:', {
                shouldBranch: branchingData.shouldBranch,
                weakSkill: branchingData.weakSkillName,
                confidence: branchingData.confidence,
                reasoning: branchingData.reasoning,
              });

              // If AI recommends branching, show skill recommendation
              if (branchingData.shouldBranch && branchingData.weakSkillId) {
                setRecommendedSkill({
                  skillId: branchingData.weakSkillId,
                  skillName: branchingData.weakSkillName,
                  skillDescription: branchingData.weakSkillDescription,
                  reason: branchingData.reasoning,
                });

                console.log('💡 Recommending skill practice:', branchingData.weakSkillName);
              }
            } else {
              console.warn('⚠️ Branching analysis failed, continuing without recommendation');
            }
          } catch (gapDetectionError) {
            console.error('Error detecting skill gaps:', gapDetectionError);
            // Continue anyway - gap detection is helpful but not critical
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      addMessage('assistant', `Sorry, I encountered an error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle starting practice for a skill
   */
  const handleStartPractice = async () => {
    const currentBranch = getCurrentBranch();
    if (!currentBranch || !session) return;

    // Guard against duplicate calls while already loading
    if (isLoading) {
      console.log('[Practice] Already loading, ignoring duplicate call');
      return;
    }

    setIsLoading(true);
    try {
      // Generate practice problems
      const response = await fetch('/api/sessions/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          skillId: currentBranch.skillId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate practice problems');
      }

      // Start practice with generated problems
      await startPractice(data.problems);
    } catch (err) {
      console.error('Error starting practice:', err);
      addMessage('assistant', 'Sorry, I encountered an error generating practice problems. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle submitting an answer to a practice problem
   */
  const handleSubmitAnswer = async (answer: string) => {
    const currentBranch = getCurrentBranch();
    if (!currentBranch || !session) return;

    setIsSubmittingAnswer(true);
    try {
      // Submit answer for validation
      const response = await fetch('/api/sessions/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          problemIndex: currentBranch.currentProblemIndex,
          answer: answer || '', // Empty string for skipped problems
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to validate answer');
      }

      // Record the attempt in session
      await recordProblemAttempt(answer, data.correct);

      // Show feedback
      setFeedback({
        isCorrect: data.correct,
        message: data.feedback,
      });

      // After a delay, move to next problem or mastery screen
      setTimeout(async () => {
        setFeedback(null);
        await nextProblem();
      }, 2000);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setFeedback({
        isCorrect: false,
        message: 'Sorry, there was an error checking your answer. Please try again.',
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  /**
   * Handle practice more after mastery
   */
  const handlePracticeMore = async () => {
    // Generate 5 more problems for the same skill
    await handleStartPractice();
  };

  /**
   * Handle reset from NewProblemButton
   */
  const handleReset = () => {
    // End current session if active
    if (session) {
      // Just reset local state - session will be marked as abandoned
      window.location.reload();
    }
  };

  // Determine which screen to show based on session state
  const renderMainContent = () => {
    // No session - show problem input
    if (!session || session.currentScreen === 'entry') {
      return (
        <div className="flex flex-col items-center justify-center space-y-8 text-center py-12">
          {/* Inline Resume Previous Session (non-blocking) */}
          {recoverableSession && !suppressResumePrompt && (
            <div className="w-full max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-6 text-left dark:border-blue-800 dark:bg-blue-950/30">
              <h2 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">Resume Previous Session?</h2>
              <div className="rounded-md bg-white p-4 mb-4 border border-blue-200 dark:bg-zinc-900 dark:border-blue-800">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {recoverableSession.mainProblem.latex ? (
                    <MathDisplay latex={recoverableSession.mainProblem.latex} displayMode={false} />
                  ) : (
                    recoverableSession.mainProblem.text
                  )}
                </p>
                {recoverableSession.skillStack.length > 0 && (
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    Currently practicing: {recoverableSession.skillStack[recoverableSession.skillStack.length - 1].skillName}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      await resumeSession();
                      if (recoverableSession?.messages) {
                        restoreMessages(recoverableSession.messages);
                      }
                      router.push(`/sessions/${recoverableSession.sessionId}`);
                    } catch (err) {
                      console.error('Error resuming session:', err);
                    }
                  }}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Continue Session
                </button>
                <button
                  onClick={async () => {
                    try {
                      await declineSession();
                    } catch (err) {
                      console.error('Error declining session:', err);
                    } finally {
                      try {
                        if (typeof window !== 'undefined') {
                          window.sessionStorage.setItem('suppressResumePrompt', '1');
                        }
                      } catch {}
                      setSuppressResumePrompt(true);
                    }
                  }}
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome to Math Tutor
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Your AI-powered Socratic learning assistant for mathematics
            </p>
          </div>

          {/* Problem Input Interface with Mode Selection */}
          <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            {/* Mode Selection Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
                <button
                  onClick={() => handleModeChange('text')}
                  className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                    inputMode === 'text'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  aria-pressed={inputMode === 'text'}
                  aria-label="Type Problem mode"
                >
                  Type Problem
                </button>
                <button
                  onClick={() => handleModeChange('image')}
                  className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                    inputMode === 'image'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  aria-pressed={inputMode === 'image'}
                  aria-label="Upload Image mode"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* Input Component */}
            <div className="transition-opacity duration-200 ease-in-out">
              {inputMode === 'text' ? (
                <div className="animate-fadeIn">
                  <TextInput key="text-input" onSubmit={handleProblemSubmit} />
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <ImageUpload
                    key="image-upload"
                    onProblemExtracted={(problemText, latex) => {
                      handleProblemExtracted(problemText, latex);
                      handleProblemSubmit(problemText, latex);
                    }}
                  />
                </div>
              )}
            </div>

            {isCreatingSession && (
              <div className="mt-4 flex justify-center">
                <LoadingIndicator showTimeout={false} />
              </div>
            )}
          </div>

          {/* Past Sessions List */}
          <div className="w-full max-w-2xl text-left">
            <div className="mt-10 mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Past Sessions</h3>
              <button
                onClick={async () => {
                  // Manual refresh
                  try {
                    if (!user) return;
                    setIsLoadingPast(true);
                    const q = query(
                      collection(db, 'sessions'),
                      where('userId', '==', user.uid),
                      orderBy('lastMessageAt', 'desc'),
                      limit(10)
                    );
                    const snapshot = await getDocs(q);
                    const items: SessionListItem[] = snapshot.docs.map((docSnap) => {
                      const data = docSnap.data() as any;
                      return {
                        sessionId: data.sessionId || docSnap.id,
                        mainProblem: { text: data?.mainProblem?.text || 'Untitled problem', latex: data?.mainProblem?.latex },
                        lastMessageAt: data?.lastMessageAt?.toDate?.() || (data?.lastMessageAt ? new Date(data.lastMessageAt) : undefined),
                        status: data?.status,
                      };
                    });
                    setPastSessions(items);
                  } finally {
                    setIsLoadingPast(false);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Refresh
              </button>
            </div>

            {pastError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {pastError}
              </div>
            )}

            {isLoadingPast ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
                <LoadingIndicator showTimeout={false} />
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                No past sessions yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {pastSessions.map((s) => (
                  <li key={s.sessionId} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-zinc-900 dark:text-zinc-50">
                          {s.mainProblem.latex ? (
                            <MathDisplay latex={s.mainProblem.latex} displayMode={false} />
                          ) : (
                            s.mainProblem.text
                          )}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {s.status ? `Status: ${s.status}` : ''}
                          {s.lastMessageAt ? `  ·  ${new Date(s.lastMessageAt).toLocaleString()}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/sessions/${s.sessionId}`)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Open
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const ok = window.confirm('Delete this session from history? This cannot be undone.');
                              if (!ok) return;
                              await deleteDoc(doc(db, 'sessions', s.sessionId));
                              setPastSessions((prev) => prev.filter((it) => it.sessionId !== s.sessionId));
                            } catch (err) {
                              setPastError(err instanceof Error ? err.message : 'Failed to delete session');
                            }
                          }}
                          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    // Diagnosis screen - show chat interface
    if (session.currentScreen === 'diagnosis') {
      return (
        <div className="flex-1 py-6 overflow-hidden min-h-0 flex gap-6">
          {/* Left column: Problem + Chat */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Mobile quick access to practice */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  const url = session?.mainSkillId
                    ? `/skills/${session.mainSkillId}?sessionId=${encodeURIComponent(session.sessionId)}`
                    : '/profile/skills';
                  router.push(url);
                }}
                className="mb-2 inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Practice related skills
              </button>
            </div>
            <div className="w-full rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 flex-shrink-0">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Current Problem</h3>
              <div className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                {session.mainProblem.latex ? (
                  <MathDisplay latex={session.mainProblem.latex} displayMode={false} />
                ) : (
                  session.mainProblem.text
                )}
              </div>
            </div>

            <div className="w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ChatMessageList showTimestamps={false} className="min-h-0" />
                {isLoading && (
                  <div className="px-4 pb-2">
                    <LoadingIndicator showTimeout={true} />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isLoading}
                  placeholder={
                    isLoading
                      ? 'Waiting for AI response...'
                      : 'Type your message... (Enter to send, Shift+Enter for new line)'
                  }
                />
              </div>
            </div>

            {recommendedSkill && (
              <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30 flex-shrink-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-3xl">💡</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">I notice you might benefit from practicing:</h3>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">{recommendedSkill.skillName}</p>
                    {recommendedSkill.skillDescription && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">{recommendedSkill.skillDescription}</p>
                    )}
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">{recommendedSkill.reason}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const url = session
                            ? `/skills/${recommendedSkill.skillId}?sessionId=${encodeURIComponent(session.sessionId)}`
                            : `/skills/${recommendedSkill.skillId}`;
                          setRecommendedSkill(null);
                          router.push(url);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Practice This Skill
                      </button>
                      <button
                        onClick={() => setRecommendedSkill(null)}
                        className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded-md border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600"
                      >
                        Keep Trying
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Side panel */}
          <PracticeSidePanel />
        </div>
      );
    }

    // Fork screen - show skill practice selection
    if (session.currentScreen === 'fork') {
      const currentBranch = getCurrentBranch();
      if (!currentBranch) return null;

      return (
        <SkillFork
          skill={{
            name: currentBranch.skillName,
            description: currentBranch.skillDescription || '',
          }}
          onStartPractice={handleStartPractice}
          problemCount={5}
          isLoading={isLoading}
        />
      );
    }

    // Practice screen - show practice problem
    if (session.currentScreen === 'practice') {
      const currentBranch = getCurrentBranch();
      if (!currentBranch || currentBranch.problems.length === 0) return null;

      const currentProblem = currentBranch.problems[currentBranch.currentProblemIndex];
      if (!currentProblem) return null;

      return (
        <PracticeProblem
          problem={currentProblem}
          currentIndex={currentBranch.currentProblemIndex}
          totalProblems={currentBranch.problems.length}
          onSubmit={handleSubmitAnswer}
          skillName={currentBranch.skillName}
          isSubmitting={isSubmittingAnswer}
          feedback={feedback}
          attempts={currentBranch.attempts}
        />
      );
    }

    // Mastered screen - show celebration
    if (session.currentScreen === 'mastered') {
      const currentBranch = getCurrentBranch();
      if (!currentBranch) return null;

      return (
        <SkillMastered
          skill={currentBranch.skillName}
          score={{
            correct: currentBranch.successCount,
            total: currentBranch.problems.length,
          }}
          onReturn={returnToParent}
          onPracticeMore={handlePracticeMore}
        />
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header onReset={handleReset} />

      {/* Right-side side panel replaces ProgressHeader on chat pages */}

      {/* Main content area */}
      <main className="flex-1 bg-zinc-50 dark:bg-black flex flex-col overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </div>
      </main>

      {/* Inline card replaces previous modal */}
    </div>
  );
}
