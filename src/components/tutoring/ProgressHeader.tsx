'use client';

/**
 * ProgressHeader Component
 * Persistent header showing main goal, breadcrumb trail, and progress
 * Sticky at top of screen with mobile-responsive collapse behavior
 */

import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import MathDisplay from '@/components/MathDisplay';

/**
 * Breadcrumb item in the skill path
 */
export interface BreadcrumbItem {
  name: string;
  id: string;
}

/**
 * ProgressHeader Props
 */
export interface ProgressHeaderProps {
  /** Main problem text */
  mainProblem: string;
  /** Optional LaTeX representation of the main problem */
  mainProblemLatex?: string;
  /** Breadcrumb trail showing skill path */
  skillPath: BreadcrumbItem[];
  /** Current progress percentage (0-100) */
  currentProgress: number;
  /** Callback when user clicks home icon to return to main */
  onReturnToMain?: () => void;
  /** Callback when user clicks a breadcrumb to navigate back */
  onNavigateToLevel?: (levelId: string, levelIndex: number) => void;
}

/**
 * ProgressHeader Component
 * Shows persistent header with main goal, breadcrumb trail, and progress
 */
export default function ProgressHeader({
  mainProblem,
  mainProblemLatex,
  skillPath,
  currentProgress,
  onReturnToMain,
  onNavigateToLevel,
}: ProgressHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate current problem count display
  const getCurrentProgressDisplay = () => {
    if (currentProgress === 0) return '0/5';
    if (currentProgress <= 20) return '1/5';
    if (currentProgress <= 40) return '2/5';
    if (currentProgress <= 60) return '3/5';
    if (currentProgress <= 80) return '4/5';
    return '5/5';
  };

  // Get the current skill (last item in path, excluding "Main Problem")
  const currentSkill = skillPath.length > 1 ? skillPath[skillPath.length - 1].name : null;

  return (
    <header className="sticky top-0 bg-white border-b border-zinc-200 shadow-sm z-50 dark:bg-zinc-950 dark:border-zinc-800">
      {/* Desktop View (md and up) */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Main Goal */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onReturnToMain}
              className="text-2xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Return to main problem"
              title="Return to main problem"
            >
              🏠
            </button>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Main Goal
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                {mainProblemLatex ? (
                  <MathDisplay latex={mainProblemLatex} />
                ) : (
                  mainProblem
                )}
              </div>
            </div>
          </div>

          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-sm mb-3">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Your Path:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {skillPath.map((skill, idx) => (
                <React.Fragment key={skill.id}>
                  <button
                    onClick={() => onNavigateToLevel?.(skill.id, idx)}
                    className={`transition-colors rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      idx === skillPath.length - 1
                        ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950'
                        : 'text-blue-500 dark:text-blue-400 hover:underline hover:bg-blue-50 dark:hover:bg-blue-950'
                    }`}
                    disabled={idx === skillPath.length - 1}
                  >
                    {skill.name}
                  </button>
                  {idx < skillPath.length - 1 && (
                    <span className="text-zinc-400 dark:text-zinc-600">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${currentProgress}%` }}
                role="progressbar"
                aria-valuenow={currentProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[4rem] text-right">
              {getCurrentProgressDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile View (sm and below) */}
      <div className="md:hidden">
        {!isExpanded ? (
          /* Collapsed Mobile View */
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="Expand header"
            aria-expanded={false}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">🏠</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {mainProblemLatex ? (
                  <MathDisplay latex={mainProblemLatex} />
                ) : (
                  mainProblem
                )}
              </span>
            </div>
            {currentSkill && (
              <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">|</span>
                <span className="flex items-center gap-1">
                  <span>🎯</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {currentSkill}
                  </span>
                </span>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                  [{getCurrentProgressDisplay()}]
                </span>
              </div>
            )}
            <svg
              className="w-5 h-5 text-zinc-400 flex-shrink-0"
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
        ) : (
          /* Expanded Mobile View */
          <div className="px-4 py-3">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onReturnToMain}
                  className="text-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label="Return to main problem"
                >
                  🏠
                </button>
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Main Goal</div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                    {mainProblemLatex ? (
                      <MathDisplay latex={mainProblemLatex} />
                    ) : (
                      mainProblem
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Collapse header"
                aria-expanded={true}
              >
                <svg
                  className="w-5 h-5 text-zinc-400 transform rotate-180"
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
            </div>

            {/* Breadcrumb Trail */}
            <div className="mb-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Your Path:</div>
              <div className="flex items-center gap-2 flex-wrap">
                {skillPath.map((skill, idx) => (
                  <React.Fragment key={skill.id}>
                    <button
                      onClick={() => onNavigateToLevel?.(skill.id, idx)}
                      className={`text-xs transition-colors rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        idx === skillPath.length - 1
                          ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950'
                          : 'text-blue-500 dark:text-blue-400 hover:underline hover:bg-blue-50 dark:hover:bg-blue-950'
                      }`}
                      disabled={idx === skillPath.length - 1}
                    >
                      {skill.name}
                    </button>
                    {idx < skillPath.length - 1 && (
                      <span className="text-zinc-400 dark:text-zinc-600 text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${currentProgress}%` }}
                  role="progressbar"
                  aria-valuenow={currentProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {getCurrentProgressDisplay()}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * ProgressHeaderContainer
 * Wrapper component that integrates with SessionContext
 * Automatically pulls data from current session
 */
export function ProgressHeaderContainer() {
  const { session, returnToParent } = useSession();

  if (!session || session.currentScreen === 'entry') {
    return null;
  }

  // Build breadcrumb path from session
  const skillPath: BreadcrumbItem[] = [
    { name: 'Main Problem', id: 'main' },
  ];

  // Add skill branches to path
  session.skillStack.forEach((branch) => {
    skillPath.push({
      name: branch.skillName,
      id: branch.skillId,
    });
  });

  // Calculate progress based on current branch
  const currentBranch = session.skillStack[session.skillStack.length - 1];
  let currentProgress = 0;

  if (currentBranch && currentBranch.problems.length > 0) {
    const completedCount = currentBranch.currentProblemIndex;
    const totalCount = currentBranch.problems.length;
    currentProgress = (completedCount / totalCount) * 100;
  }

  const handleReturnToMain = () => {
    // Return to main problem - pop all branches
    if (session.skillStack.length > 0) {
      returnToParent();
    }
  };

  const handleNavigateToLevel = (levelId: string, levelIndex: number) => {
    // Navigate back to a specific level
    // For now, only allow going back one level at a time
    if (levelIndex < skillPath.length - 1) {
      returnToParent();
    }
  };

  return (
    <ProgressHeader
      mainProblem={session.mainProblem.text}
      mainProblemLatex={session.mainProblem.latex}
      skillPath={skillPath}
      currentProgress={currentProgress}
      onReturnToMain={handleReturnToMain}
      onNavigateToLevel={handleNavigateToLevel}
    />
  );
}
