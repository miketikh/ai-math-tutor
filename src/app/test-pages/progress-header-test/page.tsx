'use client';

/**
 * Test page for ProgressHeader component
 */

import React, { useState } from 'react';
import ProgressHeader from '@/components/tutoring/ProgressHeader';

export default function ProgressHeaderTestPage() {
  const [progress, setProgress] = useState(60);
  const [skillPathLength, setSkillPathLength] = useState(1);

  // Test data
  const skillPaths = [
    [{ name: 'Main Problem', id: 'main' }],
    [
      { name: 'Main Problem', id: 'main' },
      { name: 'One-Step Equations', id: 'one_step_equations' },
    ],
    [
      { name: 'Main Problem', id: 'main' },
      { name: 'One-Step Equations', id: 'one_step_equations' },
      { name: 'Variables', id: 'variables' },
    ],
  ];

  const currentSkillPath = skillPaths[skillPathLength - 1];

  const handleReturnToMain = () => {
    console.log('Return to main clicked');
    setSkillPathLength(1);
  };

  const handleNavigateToLevel = (levelId: string, levelIndex: number) => {
    console.log(`Navigate to level ${levelId} (index ${levelIndex})`);
    setSkillPathLength(levelIndex + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* ProgressHeader Component */}
      <ProgressHeader
        mainProblem="2x + 5 = 13"
        mainProblemLatex="$2x + 5 = 13$"
        skillPath={currentSkillPath}
        currentProgress={progress}
        onReturnToMain={handleReturnToMain}
        onNavigateToLevel={handleNavigateToLevel}
      />

      {/* Test Controls */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          ProgressHeader Component Test
        </h1>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Controls
          </h2>

          {/* Progress Control */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="20"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span>0/5</span>
              <span>1/5</span>
              <span>2/5</span>
              <span>3/5</span>
              <span>4/5</span>
              <span>5/5</span>
            </div>
          </div>

          {/* Skill Path Control */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Skill Path Depth
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSkillPathLength(1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  skillPathLength === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                Main Only
              </button>
              <button
                onClick={() => setSkillPathLength(2)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  skillPathLength === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                + One-Step Eqs
              </button>
              <button
                onClick={() => setSkillPathLength(3)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  skillPathLength === 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                + Variables
              </button>
            </div>
          </div>

          {/* Current State Display */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Current State
            </h3>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  mainProblem: '2x + 5 = 13',
                  skillPath: currentSkillPath,
                  currentProgress: progress,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Features to Test
          </h2>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Main problem displays with LaTeX rendering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Home icon is clickable and returns to main</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Breadcrumb trail shows skill path</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Each breadcrumb is clickable to navigate back</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Progress bar shows current completion (0-100%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Header is sticky at top of screen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Mobile view collapses to compact format (&lt;768px)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Mobile view has expand/collapse toggle</span>
            </li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Testing Instructions
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Adjust progress slider to see progress bar update</li>
            <li>Change skill path depth to see breadcrumbs update</li>
            <li>Click home icon (🏠) to return to main</li>
            <li>Click breadcrumb items to navigate back</li>
            <li>Resize browser to &lt;768px to see mobile view</li>
            <li>Click collapsed header on mobile to expand</li>
            <li>Verify sticky positioning by scrolling down</li>
          </ol>
        </div>

        {/* Spacer to enable scrolling */}
        <div className="h-screen bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Scroll to test sticky header behavior
          </p>
        </div>
      </div>
    </div>
  );
}
