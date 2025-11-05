'use client';

import React from 'react';

/**
 * Props for DepthIndicator component
 */
export interface DepthIndicatorProps {
  /** Array of skills showing the student's journey through the skill tree */
  skillStack: Array<{
    name: string;
    status: 'complete' | 'current' | 'upcoming';
  }>;
  /** Optional callback when a completed skill is clicked (for navigation) */
  onNavigateToSkill?: (index: number) => void;
}

/**
 * DepthIndicator Component
 *
 * Visual indicator showing the student's journey through the skill tree.
 * Displays a vertical list (horizontal on mobile <640px) showing each skill
 * with appropriate status icons and styling.
 *
 * Features:
 * - Complete skills: ✓ icon, gray text, line-through
 * - Current skill: 🎯 icon, bold, highlighted, "← you are here" indicator
 * - Upcoming skills: ○ icon, light gray
 * - Clickable completed skills for backward navigation
 * - Responsive: vertical on desktop, horizontal on mobile
 */
export default function DepthIndicator({ skillStack, onNavigateToSkill }: DepthIndicatorProps) {
  const getStatusIcon = (status: 'complete' | 'current' | 'upcoming') => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'current':
        return '🎯';
      case 'upcoming':
        return '○';
      default:
        return '○';
    }
  };

  const getStatusStyles = (status: 'complete' | 'current' | 'upcoming') => {
    switch (status) {
      case 'complete':
        return 'text-gray-500 line-through opacity-75';
      case 'current':
        return 'font-semibold text-blue-700';
      case 'upcoming':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mb-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          Your Journey:
        </div>

        {/* Desktop: Vertical layout */}
        <div className="hidden sm:block space-y-2">
          {skillStack.map((skill, idx) => {
            const isComplete = skill.status === 'complete';
            const isCurrent = skill.status === 'current';
            const isClickable = isComplete && onNavigateToSkill;

            const SkillContent = (
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl flex-shrink-0 transition-transform duration-200">
                  {getStatusIcon(skill.status)}
                </span>
                <div className={`flex-1 transition-all duration-200 ${getStatusStyles(skill.status)}`}>
                  {idx + 1}. {skill.name}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">
                      (← you are here)
                    </span>
                  )}
                </div>
              </div>
            );

            if (isClickable) {
              return (
                <button
                  key={idx}
                  onClick={() => onNavigateToSkill(idx)}
                  className="w-full text-left p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Navigate back to ${skill.name}`}
                >
                  {SkillContent}
                </button>
              );
            }

            return (
              <div
                key={idx}
                className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-100' : ''}`}
              >
                {SkillContent}
              </div>
            );
          })}
        </div>

        {/* Mobile: Horizontal layout */}
        <div className="sm:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {skillStack.map((skill, idx) => {
              const isComplete = skill.status === 'complete';
              const isCurrent = skill.status === 'current';
              const isClickable = isComplete && onNavigateToSkill;

              const SkillContent = (
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  <span className="text-3xl transition-transform duration-200">
                    {getStatusIcon(skill.status)}
                  </span>
                  <div className={`text-xs text-center ${getStatusStyles(skill.status)}`}>
                    {skill.name}
                  </div>
                  {isCurrent && (
                    <div className="text-[10px] text-blue-600 font-medium whitespace-nowrap">
                      you are here
                    </div>
                  )}
                </div>
              );

              if (isClickable) {
                return (
                  <button
                    key={idx}
                    onClick={() => onNavigateToSkill(idx)}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Navigate back to ${skill.name}`}
                  >
                    {SkillContent}
                    {idx < skillStack.length - 1 && (
                      <div className="text-gray-400 text-xl mx-1">→</div>
                    )}
                  </button>
                );
              }

              return (
                <React.Fragment key={idx}>
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg ${isCurrent ? 'bg-blue-100' : ''}`}
                  >
                    {SkillContent}
                  </div>
                  {idx < skillStack.length - 1 && (
                    <div className="text-gray-400 text-xl mx-1">→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
