'use client';

import React, { useState, useEffect, useRef } from 'react';
import MathDisplay from '@/components/MathDisplay';
import TextWithMath from '@/components/TextWithMath';
import type { PracticeProblem as PracticeProblemType, ProblemAttempt } from '@/types/session';

/**
 * Props for the PracticeProblem component
 */
interface PracticeProblemProps {
  problem: PracticeProblemType;
  currentIndex: number;
  totalProblems: number;
  onSubmit: (answer: string) => void;
  skillName: string;
  isSubmitting?: boolean;
  feedback?: {
    isCorrect: boolean;
    message: string;
    showNext?: boolean;
  } | null;
  attempts?: ProblemAttempt[];
}

/**
 * PracticeProblem Component
 *
 * Displays a focused practice interface for solving individual skill problems.
 *
 * Features:
 * - Progress stars at top (⭐⭐⭐○○ for 3/5)
 * - Problem text with MathDisplay support
 * - Large text input for answer (autofocus)
 * - Submit button (disabled until answer entered)
 * - Collapsible hint section ("💡 Show hint")
 * - Feedback after submission (correct/incorrect with encouragement)
 * - Problem count display
 * - Answer validation (non-empty)
 * - Supports numeric and algebraic answers
 */
export default function PracticeProblem({
  problem,
  currentIndex,
  totalProblems,
  onSubmit,
  skillName,
  isSubmitting = false,
  feedback = null,
  attempts = [],
}: PracticeProblemProps) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  

  // Auto-focus input on component mount and when feedback is cleared
  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, currentIndex]);

  // Clear answer when moving to next problem
  useEffect(() => {
    setAnswer('');
    setShowHint(false);
  }, [currentIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || isSubmitting) {
      return;
    }

    onSubmit(trimmedAnswer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isAnswerValid = answer.trim().length > 0;

  // Generate encouragement messages
  const encouragementMessages = [
    "Great work!",
    "Nice job!",
    "Excellent!",
    "Well done!",
    "Perfect!",
    "You're on fire!",
  ];

  const correctionMessages = [
    "Not quite, but you're getting there!",
    "That's not quite right. Want to try again?",
    "Almost! Give it another shot.",
    "Not the answer we're looking for. Try again!",
  ];

  const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  const randomCorrection = correctionMessages[Math.floor(Math.random() * correctionMessages.length)];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress Stars */}
      <div className="flex justify-center items-center gap-2 mb-6 sm:mb-8">
        {Array.from({ length: totalProblems }).map((_, idx) => {
          const attemptForIdx = attempts.find((a) => a.problemIndex === idx);
          const isCompleted = idx < currentIndex || (!!attemptForIdx && idx === currentIndex);
          const isCorrect = attemptForIdx?.correct === true;

          // Choose icon and color
          const icon = isCompleted ? (isCorrect ? '⭐' : '✖️') : '○';
          const colorClass = !isCompleted
            ? 'text-gray-300'
            : isCorrect
            ? 'text-green-600'
            : 'text-red-500';

          const aria = !isCompleted
            ? 'Upcoming problem'
            : isCorrect
            ? 'Completed correctly'
            : 'Completed incorrectly';

          return (
            <span
              key={idx}
              className={`text-2xl sm:text-3xl transition-all duration-300 ${colorClass}`}
              aria-label={aria}
            >
              {icon}
            </span>
          );
        })}
      </div>

      {/* Problem Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-100">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-xs sm:text-sm text-gray-500 font-medium mb-2">
            {skillName}
          </div>
          <div className="text-sm sm:text-base text-gray-600 font-medium mb-4">
            Problem {currentIndex + 1} of {totalProblems}
          </div>

          {/* Problem Text */}
          <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-gray-800 mb-4 leading-tight">
            {problem.latex ? (
              <MathDisplay latex={problem.latex} displayMode={true} />
            ) : (
              <TextWithMath text={problem.text} />
            )}
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div
            className={`mb-6 p-4 sm:p-5 rounded-xl border-2 ${
              feedback.isCorrect
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-orange-50 border-orange-300 text-orange-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl flex-shrink-0">
                {feedback.isCorrect ? '✓' : '⚠️'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base sm:text-lg mb-1">
                  {feedback.isCorrect ? randomEncouragement : randomCorrection}
                </p>
                <div className="text-sm sm:text-base">
                  <TextWithMath text={feedback.message} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer Input */}
        {!feedback && (
          <form onSubmit={handleSubmit} className="mb-6">
            <label
              htmlFor="answer-input"
              className="block text-gray-700 font-medium mb-3 text-sm sm:text-base"
            >
              Your answer:
            </label>
            <input
              ref={inputRef}
              id="answer-input"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full text-xl sm:text-2xl text-center font-mono
                p-4 sm:p-5
                border-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2
                transition-all duration-200
                ${
                  isAnswerValid
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'border-gray-200 focus:border-gray-300 focus:ring-gray-300'
                }
                text-gray-900 placeholder-gray-500 bg-white`}
              placeholder="Enter your answer"
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
            />
            {!isAnswerValid && answer.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Please enter a valid answer
              </p>
            )}
          </form>
        )}

        {/* Submit Button */}
        {!feedback && (
          <button
            onClick={handleSubmit}
            disabled={!isAnswerValid || isSubmitting}
            className={`w-full py-4 sm:py-5 px-4 sm:px-6
              rounded-lg sm:rounded-xl
              font-semibold text-base sm:text-lg
              transition-all duration-200
              transform
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isAnswerValid && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:ring-green-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking...
              </span>
            ) : (
              'Submit Answer'
            )}
          </button>
        )}

        {/* Hint Section */}
        {!feedback && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium
                focus:outline-none focus:underline
                transition-colors duration-200"
              type="button"
            >
              💡 {showHint ? 'Hide hint' : 'Show hint'}
            </button>

            {showHint && (
              <div className="mt-4 p-4 sm:p-5 bg-yellow-50 border-2 border-yellow-200 rounded-lg sm:rounded-xl">
                <div className="text-sm sm:text-base text-gray-700 leading-relaxed text-left">
                  <strong className="font-semibold text-yellow-800 block mb-1">
                    Hint:
                  </strong>
                  <TextWithMath text={problem.hint} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skip Button (Optional) */}
        {!feedback && (
          <div className="mt-4 text-center">
            <button
              onClick={() => onSubmit('')}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700
                font-medium focus:outline-none focus:underline
                transition-colors duration-200"
              type="button"
            >
              Skip this problem (marks as incorrect)
            </button>
          </div>
        )}
      </div>

      {/* Problem Counter (Bottom) */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Problem {currentIndex + 1} of {totalProblems}
      </div>
    </div>
  );
}
