'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SkillGraphFlow from '@/components/skills/SkillGraphFlow';
import { SkillNodeData } from '@/lib/skillGraphLayout';
import Link from 'next/link';

export default function SkillsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState<SkillNodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Handle node click to show details
  const handleNodeClick = (skillId: string, skillData: SkillNodeData) => {
    setSelectedSkill(skillData);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  // Calculate some stats
  const skillProficiency = userProfile.skillProficiency || {};
  const totalSkills = Object.keys(skillProficiency).length;
  const masteredSkills = Object.values(skillProficiency).filter(
    (s) => s.level === 'mastered'
  ).length;
  const proficientSkills = Object.values(skillProficiency).filter(
    (s) => s.level === 'proficient'
  ).length;
  const learningSkills = Object.values(skillProficiency).filter(
    (s) => s.level === 'learning'
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Your Skills Graph
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Explore your math skill progress and dependencies
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Back to Profile
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Skills</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {totalSkills}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <div className="text-sm text-green-700 dark:text-green-300">Mastered</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {masteredSkills}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <div className="text-sm text-blue-700 dark:text-blue-300">Proficient</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {proficientSkills}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Learning</div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {learningSkills}
              </div>
            </div>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Skill Dependencies
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Advanced skills at the top branch down to foundational skills. Click a skill for more details.
            </p>
          </div>

          {/* React Flow Container */}
          <div className="w-full" style={{ height: '70vh' }}>
            <SkillGraphFlow
              userProficiency={skillProficiency}
              onNodeClick={handleNodeClick}
            />
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
              Proficiency Levels
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-zinc-300 dark:bg-zinc-700 mr-2" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Unknown / Not Started</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-400 mr-2" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Learning</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-blue-400 mr-2" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Proficient</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-400 mr-2" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Mastered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {isModalOpen && selectedSkill && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedSkill.name}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {selectedSkill.description}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Proficiency Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Proficiency Level
                </h3>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
                  {selectedSkill.proficiency.level === 'unknown' ? 'Not Started' : selectedSkill.proficiency.level}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Problems Solved
                  </h3>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedSkill.proficiency.problemsSolved}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Success Count
                  </h3>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedSkill.proficiency.successCount}
                  </p>
                </div>
              </div>

              {selectedSkill.proficiency.problemsSolved > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Success Rate
                  </h3>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {Math.round(
                      (selectedSkill.proficiency.successCount / selectedSkill.proficiency.problemsSolved) * 100
                    )}%
                  </p>
                </div>
              )}

              {selectedSkill.proficiency.lastPracticed && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Last Practiced
                  </h3>
                  <p className="text-zinc-900 dark:text-zinc-50">
                    {new Date(selectedSkill.proficiency.lastPracticed).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Prerequisites */}
              {selectedSkill.layer1.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Immediate Prerequisites (Layer 1)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.layer1.map((prereqId) => (
                      <span
                        key={prereqId}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {prereqId.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSkill.layer2.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Foundational Prerequisites (Layer 2)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.layer2.map((prereqId) => (
                      <span
                        key={prereqId}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {prereqId.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
