'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export interface SkillMasteredProps {
  skill: string; // Skill name (e.g., "One-Step Equations")
  score: {
    correct: number; // Number of correct answers
    total: number; // Total problems attempted
  };
  onReturn: () => void; // Callback when user clicks "Return to Main Problem"
  onPracticeMore: () => void; // Callback when user clicks "Practice 5 More"
}

/**
 * SkillMastered - Celebration screen shown when a skill is mastered
 *
 * Features:
 * - Confetti animation on mount (1-2 seconds)
 * - Large emoji (🎉) and "Skill Unlocked!" headline
 * - Display skill name with checkmark
 * - Show stats: "X/Y Correct", "+XP", "On Fire!"
 * - Primary CTA: "Return to Main Problem →"
 * - Secondary option: "Practice 5 More"
 * - Animate entrance (zoom in + fade)
 */
export default function SkillMastered({
  skill,
  score,
  onReturn,
  onPracticeMore,
}: SkillMasteredProps) {
  const [animationDone, setAnimationDone] = useState(false);

  // Calculate XP based on score (+20 per correct answer)
  const xpEarned = score.correct * 20;

  // Determine if user is "On Fire" (80%+ success rate)
  const successRate = (score.correct / score.total) * 100;
  const isOnFire = successRate >= 80;

  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 1500; // 1.5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        setAnimationDone(true);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch confetti from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="max-w-2xl mx-auto p-6 text-center animate-zoom-in"
      style={{
        animation: 'zoomIn 0.5s ease-out forwards',
      }}
    >
      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 border-2 border-green-200 shadow-xl">
        {/* Large emoji */}
        <div
          className="text-6xl md:text-7xl mb-4 animate-bounce"
          style={{
            animation: 'bounce 1s ease-in-out 2',
          }}
        >
          🎉
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Skill Unlocked!
        </h2>

        {/* Skill name with checkmark */}
        <div className="text-xl md:text-2xl text-gray-700 mb-6 flex items-center justify-center gap-2">
          <span className="text-green-600 font-bold">{skill}</span>
          <span className="text-green-600 text-2xl">✓</span>
        </div>

        {/* Encouragement message */}
        <p className="text-gray-600 mb-8 text-base md:text-lg">
          You&apos;re ready to tackle your main problem now!
        </p>

        {/* Stats section */}
        <div className="mt-8 pt-6 border-t border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-around gap-4 sm:gap-2 text-sm">
            {/* Correct answers */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {score.correct}/{score.total}
              </div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">Correct</div>
            </div>

            {/* XP earned */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                +{xpEarned}
              </div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">XP Earned</div>
            </div>

            {/* On Fire indicator */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-orange-600">
                {isOnFire ? '🔥' : '⭐'}
              </div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">
                {isOnFire ? 'On Fire!' : 'Great Job!'}
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA: Return to Main Problem */}
        <button
          onClick={onReturn}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-blue-700 active:bg-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to Main Problem →
        </button>

        {/* Secondary option: Practice 5 More */}
        <button
          onClick={onPracticeMore}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-base hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Practice 5 More (Keep building confidence)
        </button>

        {/* Success rate display (subtle) */}
        <div className="mt-6 text-xs text-gray-400">
          Success rate: {successRate.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
