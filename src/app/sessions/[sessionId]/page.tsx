'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { useConversation } from '@/contexts/ConversationContext';
import Header from '@/components/Header';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';
import MathDisplay from '@/components/MathDisplay';
// ProgressHeader removed from chat pages in favor of right-side panel
import SkillFork from '@/components/tutoring/SkillFork';
import PracticeProblem from '@/components/tutoring/PracticeProblem';
import SkillMastered from '@/components/tutoring/SkillMastered';
import PracticeSidePanel from '@/components/tutoring/PracticeSidePanel';
import { getLayer1Skills } from '@/lib/clientSkillGraph';
import { getKidFriendlyErrorMessage } from '@/lib/errorMessages';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = useMemo(() => {
    const raw = (params as { sessionId?: string } | undefined)?.sessionId;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const { user, loading: authLoading, userProfile } = useAuth();
  const {
    session,
    loadSession,
    getCurrentBranch,
    startPractice,
    recordProblemAttempt,
    nextProblem,
    returnToParent,
    addMessageToSession,
    branchToSkill,
    pauseAndClearSession,
  } = useSession();
  const { addMessage, getConversationHistory, restoreMessages } = useConversation();

  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [recommendedSkill, setRecommendedSkill] = useState<{
    skillId: string;
    skillName: string;
    skillDescription?: string;
    reason: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const relatedSkillsForMain = useMemo(() => {
    if (!session?.mainSkillId) return [] as ReturnType<typeof getLayer1Skills>;
    return getLayer1Skills(session.mainSkillId);
  }, [session?.mainSkillId]);

  const relatedSkillPayload = useMemo(
    () => relatedSkillsForMain.map(({ id, name }) => ({ id, name })),
    [relatedSkillsForMain]
  );

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Load the session when user and sessionId are available
  useEffect(() => {
    const doLoad = async () => {
      if (authLoading) return;
      if (!user) return; // will redirect above
      if (!sessionId) return;
      setPageLoading(true);
      setError(null);
      try {
        const loaded = await loadSession(sessionId);
        if (loaded?.messages) {
          restoreMessages(loaded.messages);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load session';
        setError(message);
      } finally {
        setPageLoading(false);
      }
    };

    doLoad();
  }, [authLoading, user, sessionId, loadSession, restoreMessages]);

  // Onboarding redirect if profile is incomplete (mirrors home behavior)
  useEffect(() => {
    if (!authLoading && user && userProfile) {
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
  }, [authLoading, user, userProfile, router]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      // Format user message with LaTeX using formatter API
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
      } catch {
        // continue with original text
      }

      // Add formatted user message to UI and session
      addMessage('user', formattedMessage);
      if (session) {
        await addMessageToSession({ role: 'user', content: formattedMessage, timestamp: Date.now() });
      }

      setIsLoading(true);
      try {
        const conversationHistory = getConversationHistory();
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationHistory,
            problemContext: session?.mainProblem.text || '',
            mainSkillId: session?.mainSkillId,
            relatedSkills: relatedSkillPayload.length > 0 ? relatedSkillPayload : undefined,
            studentProfile: {
              gradeLevel: userProfile?.gradeLevel,
              interests: userProfile?.interests,
              focusTopics: userProfile?.focusTopics,
            },
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to get response from AI');
        }

        addMessage('assistant', data.response);
        if (session) {
          await addMessageToSession({ role: 'assistant', content: data.response, timestamp: Date.now() });

          // Check if AI recommends practice (integrated into chat response)
          if (data.needsPractice && data.practiceSkillId && data.practiceSkillName) {
            setRecommendedSkill({
              skillId: data.practiceSkillId,
              skillName: data.practiceSkillName,
              skillDescription: undefined,
              reason: data.practiceReason || 'Practice recommended',
            });
          }
        }
      } catch (err) {
        const friendlyMessage = getKidFriendlyErrorMessage(err);
        addMessage('assistant', friendlyMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, addMessageToSession, getConversationHistory, session, user, relatedSkillPayload, userProfile]
  );

  const handleStartPractice = useCallback(async () => {
    const currentBranch = getCurrentBranch();
    if (!currentBranch || !session) return;
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, skillId: currentBranch.skillId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate practice problems');
      }
      await startPractice(data.problems);
    } catch (err) {
      const friendlyMessage = getKidFriendlyErrorMessage(err);
      addMessage('assistant', friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentBranch, session, isLoading, startPractice, addMessage]);

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      const currentBranch = getCurrentBranch();
      if (!currentBranch || !session) return;
      
      setIsSubmittingAnswer(true);
      try {
        const response = await fetch('/api/sessions/submit-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            problemIndex: currentBranch.currentProblemIndex,
            answer: answer || '',
          }),
        });
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to validate answer');
        }
        await recordProblemAttempt(answer, data.correct);
        setFeedback({ isCorrect: data.correct, message: data.feedback });
        setTimeout(async () => {
          setFeedback(null);
          await nextProblem();
        }, 2000);
      } catch (err) {
        const friendlyMessage = getKidFriendlyErrorMessage(err);
        setFeedback({ isCorrect: false, message: friendlyMessage });
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [getCurrentBranch, session, recordProblemAttempt, nextProblem]
  );

  const handlePracticeMore = useCallback(async () => {
    await handleStartPractice();
  }, [handleStartPractice]);

  // Page-level loading and error handling
  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Header onReset={() => router.push('/tutor')} />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Unable to open session</h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/sessions')}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View My Sessions
              </button>
              <button
                onClick={() => router.push('/tutor')}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Start New Problem
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render active session workspace
  const renderMainContent = () => {
    if (!session) return null;

    if (session.currentScreen === 'diagnosis') {
      return (
        <div className="flex-1 py-6 overflow-hidden min-h-0 flex gap-6">
          {/* Left column: Current Problem + Chat */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Mobile quick access to practice */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  const url = sessionId && session?.mainSkillId
                    ? `/skills/${session.mainSkillId}?sessionId=${encodeURIComponent(sessionId)}`
                    : session?.mainSkillId
                      ? `/skills/${session.mainSkillId}`
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
                  placeholder={isLoading ? 'Waiting for AI response...' : 'Type your message... (Enter to send, Shift+Enter for new line)'}
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
                          const url = sessionId
                            ? `/skills/${recommendedSkill.skillId}?sessionId=${encodeURIComponent(sessionId)}`
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

          {/* Right column: Practice Side Panel */}
          <PracticeSidePanel />
        </div>
      );
    }

    if (session.currentScreen === 'fork') {
      const currentBranch = getCurrentBranch();
      if (!currentBranch) return null;
      return (
        <SkillFork
          skill={{ name: currentBranch.skillName, description: currentBranch.skillDescription || '' }}
          onStartPractice={handleStartPractice}
          problemCount={5}
          isLoading={isLoading}
        />
      );
    }

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

    if (session.currentScreen === 'mastered') {
      const currentBranch = getCurrentBranch();
      if (!currentBranch) return null;
      return (
        <SkillMastered
          skill={currentBranch.skillName}
          score={{ correct: currentBranch.successCount, total: currentBranch.problems.length }}
          onReturn={returnToParent}
          onPracticeMore={handlePracticeMore}
        />
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        onReset={async () => {
          try {
            await pauseAndClearSession();
          } finally {
            router.push('/tutor');
          }
        }}
      />
      <main className="flex-1 bg-zinc-50 dark:bg-black flex flex-col overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}


