'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MathDisplay from '@/components/MathDisplay';

interface SessionListItem {
  sessionId: string;
  mainProblem: { text: string; latex?: string };
  lastMessageAt?: Date;
  status?: string;
}

export default function SessionsIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (loading) return;
      if (!user) return;
      setPageLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid),
          orderBy('lastMessageAt', 'desc'),
          limit(25)
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
        setSessions(items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load sessions';
        setError(message);
      } finally {
        setPageLoading(false);
      }
    };
    fetchSessions();
  }, [loading, user]);

  if (loading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <Header onReset={() => router.push('/')} />
      <main className="mx-auto max-w-5xl w-full px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Sessions</h1>
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start New Problem
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            No sessions yet. Start a new problem to begin.
          </div>
        ) : (
          <ul className="space-y-4">
            {sessions.map((s) => (
              <li key={s.sessionId} className="rounded-lg border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                <Link href={`/sessions/${s.sessionId}`} className="block">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-zinc-900 dark:text-zinc-50">
                        {s.mainProblem.latex ? (
                          <MathDisplay latex={s.mainProblem.latex} displayMode={false} />
                        ) : (
                          s.mainProblem.text
                        )}
                      </div>
                      {s.status && (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Status: {s.status}</div>
                      )}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleString() : '—'}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}


