'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { SkillNodeData, getProficiencyColor, calculateProgress } from '@/lib/skillGraphLayout';

/**
 * Custom node component for displaying skills in the graph
 * Shows skill name, proficiency status with color coding, progress indicator, and badges
 */
function SkillNode({ data }: NodeProps) {
  const skillData = data as SkillNodeData;
  const { name, description, proficiency } = skillData;
  const colors = getProficiencyColor(proficiency.level);
  const progress = calculateProgress(proficiency);

  // Determine if skill is mastered for badge display
  const isMastered = proficiency.level === 'mastered';

  // Success rate
  const successRate = proficiency.problemsSolved > 0
    ? Math.round((proficiency.successCount / proficiency.problemsSolved) * 100)
    : 0;

  return (
    <>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div
        className={`
          relative px-4 py-3 rounded-lg border-2 shadow-lg
          min-w-[220px] max-w-[220px] min-h-[120px]
          transition-all duration-200
          hover:shadow-xl hover:scale-105
          ${colors.bg} ${colors.border}
        `}
      >
        {/* Mastered Badge */}
        {isMastered && (
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Skill Name */}
        <div className={`font-semibold text-sm mb-1 ${colors.text}`}>
          {name}
        </div>

        {/* Description */}
        <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
          {description}
        </div>

        {/* Proficiency Level Label */}
        <div className={`text-xs font-medium mb-2 ${colors.text} capitalize`}>
          {proficiency.level === 'unknown' ? 'Not Started' : proficiency.level}
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${
              proficiency.level === 'mastered' ? 'bg-green-500' :
              proficiency.level === 'proficient' ? 'bg-blue-500' :
              proficiency.level === 'learning' ? 'bg-yellow-500' :
              'bg-zinc-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="mt-2 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>{proficiency.problemsSolved} problems</span>
          {proficiency.problemsSolved > 0 && (
            <span>{successRate}% success</span>
          )}
        </div>

        {/* Tooltip on hover - styled by Tailwind */}
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className="
            opacity-0 hover:opacity-100
            absolute -top-24 left-1/2 transform -translate-x-1/2
            bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900
            px-3 py-2 rounded-md text-xs
            pointer-events-none
            transition-opacity duration-200
            whitespace-nowrap
            z-50
          ">
            <div className="font-semibold mb-1">{name}</div>
            <div>Level: {proficiency.level}</div>
            <div>Problems: {proficiency.problemsSolved}</div>
            <div>Success: {successRate}%</div>
            {proficiency.lastPracticed && (
              <div>Last: {new Date(proficiency.lastPracticed).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SkillNode);
