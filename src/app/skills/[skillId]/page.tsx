'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import LoadingIndicator from '@/components/LoadingIndicator';
import PracticeProblem from '@/components/tutoring/PracticeProblem';
import SkillFork from '@/components/tutoring/SkillFork';
import { useAuth } from '@/contexts/AuthContext';
import { getSkillInfo } from '@/lib/clientSkillGraph';
import type { PracticeProblem as PracticeProblemType } from '@/types/session';

export default function SkillPracticePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const skillId = useMemo(() => {
    const raw = (params as { skillId?: string } | undefined)?.skillId;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const sessionId = searchParams.get('sessionId') || '';
  const skill = getSkillInfo(skillId);

  type Mode = 'overview' | 'loading' | 'practice' | 'review';
  const [mode, setMode] = useState<Mode>('overview');
  const [pageError, setPageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [problems, setProblems] = useState<PracticeProblemType[]>([]);
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [review, setReview] = useState<{ correct: number; total: number; proficiency?: { level: string; problemsSolved: number; successCount: number } | null } | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const loadProblems = useCallback(async () => {
    if (!user || !skillId) return;
    setIsLoading(true);
    setPageError(null);
    setMode('loading');
    try {
      const resp = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, userId: user.uid, count: 5 }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate practice problems');
      }
      setProblems(data.problems);
      setIndex(0);
      setFeedback(null);
      setMode('practice');
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to generate problems');
    } finally {
      setIsLoading(false);
    }
  }, [user, skillId]);

  // No auto-load; we show overview first and load once the user clicks Practice

  const recordAttempt = async (correct: boolean) => {
    try {
      await fetch('/api/practice/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, correct, userId: user?.uid }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleSubmit = async (answer: string) => {
    const current = problems[index];
    if (!current) return;
    setIsSubmitting(true);
    try {
      // AI validation
      const resp = await fetch('/api/practice/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          skillId,
          problemText: current.text,
          solutionText: current.solution,
          answer,
        }),
      });
      const data = await resp.json();
      const correct = Boolean(data.correct);
      await recordAttempt(correct);
      setFeedback({ isCorrect: correct, message: String(data.feedback || (correct ? 'Nice work!' : 'Not quite—let’s try the next one.')) });
      setTimeout(() => {
        setFeedback(null);
        const nextIndex = index + 1;
        if (nextIndex >= problems.length) {
          // For review: compute score by counting corrects from server would require attempts
          // We derive it naively from last correctness here: increment if correct
          const prior = review?.correct || 0;
          const correctCount = prior + (feedback?.isCorrect ? 1 : 0);
          setIndex(nextIndex);
          setReview({ correct: correctCount, total: problems.length, proficiency: undefined });
          // Fetch proficiency snapshot
          (async () => {
            try {
              const r = await fetch(`/api/practice/proficiency?userId=${encodeURIComponent(user!.uid)}&skillId=${encodeURIComponent(skillId)}`);
              const j = await r.json();
              if (j.success) {
                setReview((prev) => prev ? { ...prev, proficiency: j.proficiency } : prev);
              }
            } catch {
              // ignore
            }
          })();
        } else {
          setIndex(nextIndex);
        }
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (mode === 'loading')) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Header onReset={() => router.push('/')} />
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl" aria-hidden>🧮</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  Generating practice problems just for you!
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Hang tight while we build a fun set of {skill ? skill.name.toLowerCase() : 'math'} questions.
                </p>
                <LoadingIndicator
                  message="✨ Cooking up personalized questions…"
                  showTimeout={true}
                  timeoutMessage="Still working on it—great things take a moment!"
                  className="rounded-md"
                />
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Tip: Grab a sip of water while you wait 💧
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <Header onReset={() => router.push('/')} />
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-6">
        {pageError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {pageError}
          </div>
        )}

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {skill ? skill.name : 'Practice'}
          </h1>
          {sessionId && (
            <div className="mt-2 text-sm">
              <Link href={`/sessions/${sessionId}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                ← Return to session
              </Link>
            </div>
          )}
        </div>

        {/* Overview */}
        {mode === 'overview' && skill && (
          <div className="max-w-2xl mx-auto">
            <SkillFork
              skill={{ name: skill.name, description: skill.description }}
              onStartPractice={loadProblems}
              problemCount={5}
              isLoading={isLoading}
            />
            {sessionId && (
              <div className="mt-2 text-center">
                <Link href={`/sessions/${sessionId}`} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Return to session</Link>
              </div>
            )}
          </div>
        )}

        {/* Problem flow */}
        {mode === 'practice' && problems.length > 0 && index < problems.length ? (
          <PracticeProblem
            problem={problems[index]}
            currentIndex={index}
            totalProblems={problems.length}
            onSubmit={handleSubmit}
            skillName={skill?.name || 'Practice'}
            isSubmitting={isSubmitting}
            feedback={feedback}
          />
        ) : null}

        {/* Review */}
        {mode === 'practice' && problems.length > 0 && index >= problems.length && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 text-center">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Great work!</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">You've completed this set of practice problems.</p>
            <div className="mb-6 text-sm text-zinc-700 dark:text-zinc-300">
              {review ? (
                <div>
                  <div className="mb-1">Score: {review.correct}/{review.total}</div>
                  {review.proficiency && (
                    <div>Current proficiency: {review.proficiency.level}</div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500">Loading your results…</div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={loadProblems}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Practice more
              </button>
              <Link
                href="/profile/skills"
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Choose another skill
              </Link>
              {sessionId && (
                <Link
                  href={`/sessions/${sessionId}`}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Return to session
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


