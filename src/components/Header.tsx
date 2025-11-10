'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import NewProblemButton from './NewProblemButton';

interface HeaderProps {
  /** Optional callback triggered when user resets the session */
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  const { user, userProfile, logout } = useAuth();
  const { session, pauseAndClearSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Handle logo click - clear session if active before navigating to /tutor
  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (session) {
      try {
        await pauseAndClearSession();
      } catch (err) {
        console.error('Error clearing session:', err);
      }
    }

    router.push('/tutor');
  };

  // Only show New Problem button on /sessions page
  const showNewProblemButton = pathname === '/sessions';

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <a
            href="/tutor"
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image
              src="/favicon/android-chrome-192x192.png"
              alt="MathFoundry Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              MathFoundry
            </span>
          </a>

          <div className="flex items-center gap-4">
            {showNewProblemButton && <NewProblemButton onReset={onReset} />}

            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                        {user.email}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Profile Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
