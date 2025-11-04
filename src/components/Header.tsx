'use client';

import NewProblemButton from './NewProblemButton';

interface HeaderProps {
  /** Optional callback triggered when user resets the session */
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Math Tutor
          </h1>
          <NewProblemButton onReset={onReset} />
        </div>
      </div>
    </header>
  );
}
