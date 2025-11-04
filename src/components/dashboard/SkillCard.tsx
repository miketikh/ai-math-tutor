'use client';

interface SkillCardProps {
  skillId: string;
  skillName: string;
  description: string;
  proficiency: {
    level: 'unknown' | 'learning' | 'proficient' | 'mastered';
    problemsSolved: number;
    successCount: number;
    lastPracticed?: Date;
  } | null;
}

const PROFICIENCY_CONFIG = {
  unknown: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-300',
    badgeColor: 'bg-gray-500',
  },
  learning: {
    label: 'Learning',
    color: 'bg-yellow-50 text-yellow-800',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-500',
  },
  proficient: {
    label: 'Proficient',
    color: 'bg-green-50 text-green-800',
    borderColor: 'border-green-300',
    badgeColor: 'bg-green-500',
  },
  mastered: {
    label: 'Mastered',
    color: 'bg-blue-50 text-blue-800',
    borderColor: 'border-blue-300',
    badgeColor: 'bg-blue-500',
  },
};

export default function SkillCard({ skillId, skillName, description, proficiency }: SkillCardProps) {
  const level = proficiency?.level || 'unknown';
  const config = PROFICIENCY_CONFIG[level];
  const successRate = proficiency?.problemsSolved
    ? Math.round((proficiency.successCount / proficiency.problemsSolved) * 100)
    : 0;

  return (
    <div
      className={`rounded-lg border-2 ${config.borderColor} ${config.color} p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{skillName}</h3>
          <p className="text-sm opacity-75 mt-1">{description}</p>
        </div>
        <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium text-white ${config.badgeColor}`}>
          {config.label}
        </div>
      </div>

      {proficiency && proficiency.problemsSolved > 0 && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-75">Problems Solved</p>
              <p className="text-xl font-bold">{proficiency.problemsSolved}</p>
            </div>
            <div>
              <p className="opacity-75">Success Rate</p>
              <p className="text-xl font-bold">{successRate}%</p>
            </div>
            <div>
              <p className="opacity-75">Last Practiced</p>
              <p className="text-sm font-medium">
                {proficiency.lastPracticed
                  ? new Date(proficiency.lastPracticed).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      )}

      {(!proficiency || proficiency.problemsSolved === 0) && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <p className="text-sm opacity-75 italic">No practice yet - start solving problems to track progress!</p>
        </div>
      )}
    </div>
  );
}
