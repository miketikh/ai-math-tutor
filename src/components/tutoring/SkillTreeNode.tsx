'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SkillTreeNode as SkillTreeNodeType } from '@/lib/clientSkillGraph';
import { getProficiencyColor } from '@/lib/skillGraphLayout';

interface SkillTreeNodeProps {
  node: SkillTreeNodeType;
  sessionId?: string;
  getProficiency?: (skillId: string) => { level: 'unknown' | 'learning' | 'proficient' | 'mastered' } | undefined;
  isLast?: boolean;
  parentExpanded?: boolean;
}

export default function SkillTreeNode({
  node,
  sessionId,
  getProficiency,
  isLast = false,
  parentExpanded = true,
}: SkillTreeNodeProps) {
  // All skills start collapsed by default
  const [expanded, setExpanded] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const proficiency = getProficiency ? getProficiency(node.id) : undefined;
  const badge = proficiency ? getProficiencyColor(proficiency.level) : null;

  // Calculate indentation based on depth (20px per level)
  const indentLevel = node.depth - 1;
  const indentPx = indentLevel * 20;

  return (
    <div className="relative">
      {/* Tree connector lines */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{ width: `${indentPx}px` }}
      >
        {indentLevel > 0 && (
          <>
            {/* Vertical line from parent */}
            {!isLast && (
              <div
                className="absolute border-l border-zinc-300 dark:border-zinc-700"
                style={{
                  left: `${indentPx - 10}px`,
                  top: 0,
                  bottom: 0,
                }}
              />
            )}
            {/* Horizontal line to node */}
            <div
              className="absolute border-t border-zinc-300 dark:border-zinc-700"
              style={{
                left: `${indentPx - 10}px`,
                top: '12px',
                width: '10px',
              }}
            />
          </>
        )}
      </div>

      {/* Node content */}
      <div
        className="relative"
        style={{ marginLeft: `${indentPx}px` }}
      >
        <div className="flex items-start gap-2 py-1.5">
          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse dependencies' : 'Expand dependencies'}
            >
              {expanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Skill info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-medium text-sm text-zinc-900 dark:text-zinc-50"
                title={node.description}
              >
                {node.name}
              </span>
              {badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text} flex-shrink-0`}>
                  {proficiency!.level}
                </span>
              )}
            </div>
          </div>

          {/* Practice button */}
          <Link
            href={sessionId ? `/skills/${node.id}?sessionId=${encodeURIComponent(sessionId)}` : `/skills/${node.id}`}
            className="flex-shrink-0 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Practice
          </Link>
        </div>

        {/* Description tooltip on hover - show as smaller text below */}
        {expanded && hasChildren && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 ml-6 mb-1 line-clamp-1" title={node.description}>
            {node.description}
          </div>
        )}
      </div>

      {/* Recursive children */}
      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <SkillTreeNode
              key={child.id}
              node={child}
              sessionId={sessionId}
              getProficiency={getProficiency}
              isLast={index === node.children.length - 1}
              parentExpanded={expanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
