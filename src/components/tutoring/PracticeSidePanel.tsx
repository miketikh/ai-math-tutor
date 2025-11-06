'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MathDisplay from '@/components/MathDisplay';
import { useSession } from '@/contexts/SessionContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProficiencyColor } from '@/lib/skillGraphLayout';
import { getSkillInfo, getPrereqs } from '@/lib/clientSkillGraph';

export default function PracticeSidePanel() {
  const router = useRouter();
  const { session } = useSession();
  const { userProfile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sessionId = session?.sessionId;
  const mainSkillId = session?.mainSkillId;

  const mainSkill = useMemo(() => (mainSkillId ? getSkillInfo(mainSkillId) : null), [mainSkillId]);
  const prereqs = useMemo(() => (mainSkillId ? getPrereqs(mainSkillId, 10) : []), [mainSkillId]);

  const getProficiency = (skillId?: string) => {
    if (!skillId) return undefined;
    // userProfile.skillProficiency is optional; fall back to unknown
    return userProfile?.skillProficiency?.[skillId];
  };

  if (!session) return null;

  return (
    <aside className="hidden md:block w-[340px] shrink-0">
      <div className="sticky top-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Study Map</h3>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-4">
            {/* Current Problem */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Current Problem</div>
              <div className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {session.mainProblem.latex ? (
                  <MathDisplay latex={session.mainProblem.latex} displayMode={false} />
                ) : (
                  session.mainProblem.text
                )}
              </div>
            </div>

            {/* Main Skill */}
            {mainSkill && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Main Skill</div>
                  {(() => {
                    const prof = getProficiency(mainSkill.id);
                    if (!prof) return null;
                    const colors = getProficiencyColor(prof.level);
                    return (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>{prof.level}</span>
                    );
                  })()}
                </div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{mainSkill.name}</div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{mainSkill.description}</p>
                <div className="mt-3">
                  <Link
                    href={sessionId ? `/skills/${mainSkill.id}?sessionId=${encodeURIComponent(sessionId)}` : `/skills/${mainSkill.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Practice this skill
                  </Link>
                </div>
              </div>
            )}

            {/* Dependencies */}
            {prereqs.length > 0 && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Related skills</div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {prereqs.map((p) => {
                    const prof = getProficiency(p.id);
                    const badge = prof ? getProficiencyColor(prof.level) : null;
                    return (
                      <div key={p.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">{p.name}</div>
                          {badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text}`}>{prof!.level}</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{p.description}</p>
                        <div className="mt-2">
                          <Link
                            href={sessionId ? `/skills/${p.id}?sessionId=${encodeURIComponent(sessionId)}` : `/skills/${p.id}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                          >
                            Practice
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}


