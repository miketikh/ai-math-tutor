'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from '@/components/auth/ProfileForm';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">My Profile</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage your account settings and learning preferences
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              View Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Start Learning
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
