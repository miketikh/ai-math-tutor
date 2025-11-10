'use client';

import React, { useEffect, useState } from 'react';

/**
 * Props for the SkillFork component
 */
interface SkillForkProps {
  skill: {
    name: string;
    description: string;
  };
  onStartPractice: () => void;
  problemCount: number;
  isLoading?: boolean;
}

/**
 * SkillFork Component
 *
 * Displays the "practice path selection" screen shown when branching to a prerequisite skill.
 * Shows the skill that needs to be practiced with encouragement and clear CTAs.
 *
 * Features:
 * - Large target emoji (🎯) with headline
 * - Gradient skill card with lock icon
 * - Primary CTA for practice
 * - Secondary option for explanations
 * - Encouragement text
 * - Slide-up + fade-in animation
 * - Mobile responsive
 */
export default function SkillFork({ skill, onStartPractice, problemCount, isLoading = false }: SkillForkProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    // Small delay to ensure animation is visible
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleWatchExplanation = () => {
    // Placeholder for Phase 2 - will be implemented in Phase 3
    alert('Video explanations coming soon! For now, try the practice problems to learn this skill.');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
      {/* Animated Container */}
      <div
        className={`transition-all duration-500 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Main Card Container wrapping everything */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Subtle gradient background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50/80 via-transparent" />
            <div className="absolute inset-y-0 right-0 w-32 sm:w-48 bg-gradient-to-l from-purple-50/60 via-transparent" />
          </div>

          <div className="relative px-5 py-8 sm:px-10 sm:py-12">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="text-5xl sm:text-6xl mb-4 animate-bounce">
                🎯
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                I found what&apos;s tricky!
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                To solve your problem, you&apos;ll need:
              </p>
            </div>

            {/* Main Skill Card */}
            <div
              className={`bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
                rounded-xl sm:rounded-2xl p-5 sm:p-8
                border border-blue-200/80
                shadow-lg hover:shadow-xl
                transition-all duration-300
                mb-5 sm:mb-7`}
            >
              {/* Skill Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="flex-shrink-0">
                  <span className="text-3xl sm:text-4xl">🔒</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {skill.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {skill.description || 'Master this first, then you\'ll be ready for the next step!'}
                  </p>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={onStartPractice}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white
                  py-3 sm:py-4 px-4 sm:px-6
                  rounded-lg sm:rounded-xl
                  font-semibold text-base sm:text-lg
                  hover:bg-blue-700
                  active:bg-blue-800
                  transition-all duration-200
                  transform hover:scale-[1.02] active:scale-[0.98]
                  shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading ? 'Generating Problems...' : `Practice This (${problemCount} problem${problemCount !== 1 ? 's' : ''})`}
              </button>
            </div>

            {/* Divider */}
            <div className="text-center mb-5 sm:mb-7">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 sm:px-4 bg-white text-slate-500 font-medium">
                    OR
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Option - Watch Explanation */}
            <div className="text-center mb-7 sm:mb-9">
              <button
                onClick={handleWatchExplanation}
                className={`w-full bg-white border-2 border-slate-200
                  py-3 px-4 sm:px-6
                  rounded-lg sm:rounded-xl
                  font-medium text-sm sm:text-base
                  text-slate-700
                  hover:border-slate-300 hover:bg-slate-50
                  active:bg-slate-100
                  transition-all duration-200
                  transform hover:scale-[1.01] active:scale-[0.99]
                  focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={false}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="text-xl">💡</span>
                  <span>Watch a quick explanation</span>
                </span>
              </button>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                (Coming in Phase 3)
              </p>
            </div>

            {/* Encouragement Text */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                After this, you&apos;ll return to your main problem with new skills! 🚀
              </p>
            </div>

            {/* Optional: Expandable Info Section for Mobile */}
            <div className="mt-7 sm:mt-9 lg:hidden">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700
                  font-medium py-2 focus:outline-none"
              >
                {isExpanded ? 'Hide details ▲' : 'Why this skill? ▼'}
              </button>

              {isExpanded && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>Why practice this skill?</strong>
                    <br />
                    This skill is a building block for solving your main problem.
                    By mastering it first, you&apos;ll have a much easier time understanding
                    the solution to your original question.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
