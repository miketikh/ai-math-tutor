'use client';

import React, { useState } from 'react';
import PracticeProblem from '@/components/tutoring/PracticeProblem';
import type { PracticeProblem as PracticeProblemType } from '@/types/session';

/**
 * Test page for PracticeProblem component
 *
 * Tests:
 * 1. Problem display with LaTeX support
 * 2. Answer input and validation
 * 3. Hint expand/collapse
 * 4. Correct answer flow
 * 5. Incorrect answer flow
 * 6. Progress stars
 * 7. Skip functionality
 */
export default function PracticeProblemTestPage() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    showNext?: boolean;
  } | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Sample practice problems
  const sampleProblems: PracticeProblemType[] = [
    {
      text: 'x + 5 = 12',
      latex: '$x + 5 = 12$',
      hint: 'Subtract 5 from both sides to isolate x.',
      solution: '7',
    },
    {
      text: 'x - 3 = 10',
      latex: '$x - 3 = 10$',
      hint: 'Add 3 to both sides to find x.',
      solution: '13',
    },
    {
      text: 'x + 8 = 15',
      latex: '$x + 8 = 15$',
      hint: 'What number plus 8 equals 15?',
      solution: '7',
    },
    {
      text: '9 + x = 20',
      latex: '$9 + x = 20$',
      hint: 'Subtract 9 from both sides.',
      solution: '11',
    },
    {
      text: 'x - 6 = 4',
      latex: '$x - 6 = 4$',
      hint: 'Add 6 to both sides to solve for x.',
      solution: '10',
    },
  ];

  const currentProblem = sampleProblems[currentProblemIndex];
  const totalProblems = sampleProblems.length;

  const handleSubmit = async (answer: string) => {
    if (!answer.trim()) {
      // Skip functionality - mark as incorrect
      setIsSubmitting(true);
      setTimeout(() => {
        setFeedback({
          isCorrect: false,
          message: 'Problem skipped. Try the next one!',
          showNext: true,
        });
        setCompletedCount(completedCount + 1);
        setIsSubmitting(false);
      }, 500);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Simple answer validation (normalize answers)
      const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, '');
      const normalizedSolution = currentProblem.solution.trim().toLowerCase().replace(/\s+/g, '');

      const isCorrect = normalizedAnswer === normalizedSolution;

      if (isCorrect) {
        setCorrectCount(correctCount + 1);
        setFeedback({
          isCorrect: true,
          message: `The answer is ${currentProblem.solution}. Great job solving this!`,
          showNext: true,
        });
      } else {
        setFeedback({
          isCorrect: false,
          message: `The correct answer is ${currentProblem.solution}. ${currentProblem.hint}`,
          showNext: true,
        });
      }

      setCompletedCount(completedCount + 1);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleNextProblem = () => {
    setFeedback(null);

    if (currentProblemIndex < totalProblems - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Show completion summary
      alert(`Practice Complete!\n\nYou got ${correctCount} out of ${totalProblems} correct.\n\nSuccess rate: ${Math.round((correctCount / totalProblems) * 100)}%`);
    }
  };

  const handleReset = () => {
    setCurrentProblemIndex(0);
    setFeedback(null);
    setCompletedCount(0);
    setCorrectCount(0);
  };

  const successRate = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                PracticeProblem Component Test
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Skill: One-Step Equations
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700
                transition-colors duration-200 text-sm font-medium"
            >
              Reset Test
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <span className="text-gray-600">Progress:</span>
                <span className="ml-2 font-semibold text-blue-900">
                  {completedCount}/{totalProblems}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Correct:</span>
                <span className="ml-2 font-semibold text-green-700">
                  {correctCount}/{completedCount || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Success Rate:</span>
                <span className="ml-2 font-semibold text-purple-700">
                  {successRate}%
                </span>
              </div>
            </div>
            {completedCount >= totalProblems && (
              <div className="text-green-600 font-semibold">
                ✓ Practice Complete!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {currentProblemIndex < totalProblems ? (
          <>
            <PracticeProblem
              problem={currentProblem}
              currentIndex={currentProblemIndex}
              totalProblems={totalProblems}
              onSubmit={handleSubmit}
              skillName="One-Step Equations"
              isSubmitting={isSubmitting}
              feedback={feedback}
            />

            {/* Next Button (appears after feedback) */}
            {feedback && feedback.showNext && (
              <div className="max-w-2xl mx-auto px-4 mt-6">
                <button
                  onClick={handleNextProblem}
                  className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl
                    font-semibold text-lg hover:bg-blue-700 active:bg-blue-800
                    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                    shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {currentProblemIndex < totalProblems - 1 ? 'Next Problem →' : 'View Results'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Practice Session Complete!
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-xl text-gray-700">
                  You answered <span className="font-bold text-green-600">{correctCount}</span> out of{' '}
                  <span className="font-bold">{totalProblems}</span> correctly
                </p>
                <p className="text-lg text-gray-600">
                  Success rate: <span className="font-semibold">{successRate}%</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                  transition-colors duration-200 font-semibold"
              >
                Practice Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Testing Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8 sm:px-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Testing Instructions
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-medium">✅ What to Test:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enter correct answers (7, 13, 7, 11, 10) to test success flow</li>
              <li>Enter incorrect answers to test error flow</li>
              <li>Click "Show hint" to test hint expansion</li>
              <li>Try skipping problems (click "Skip this problem")</li>
              <li>Press Enter key to submit (keyboard support)</li>
              <li>Complete all 5 problems to test progress tracking</li>
              <li>Test on mobile viewport (resize browser to &lt;768px)</li>
            </ul>
            <p className="font-medium mt-4">📊 Expected Behavior:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Stars fill as you progress through problems</li>
              <li>Submit button is disabled until answer is entered</li>
              <li>Feedback shows with green checkmark (correct) or orange warning (incorrect)</li>
              <li>Input auto-focuses on component mount and after moving to next problem</li>
              <li>Progress stats update in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
