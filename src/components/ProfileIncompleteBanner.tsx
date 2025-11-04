'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileIncompleteBanner() {
  const { userProfile } = useAuth();

  // Check if profile is complete
  const isProfileIncomplete = !userProfile?.gradeLevel || !userProfile?.focusTopic;

  if (!isProfileIncomplete) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
              <svg
                className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </span>
            <p className="ml-3 font-medium text-yellow-800 dark:text-yellow-200 text-sm">
              Complete your profile to get personalized learning recommendations
            </p>
          </div>
          <div className="mt-2 sm:mt-0 sm:ml-3">
            <Link
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700 transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
