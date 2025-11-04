'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import SkillCard from './SkillCard';

interface Skill {
  name: string;
  description: string;
  layer1: string[];
  layer2: string[];
}

interface SkillGraph {
  metadata: {
    description: string;
    version: string;
  };
  skills: Record<string, Skill>;
}

export default function SkillDashboard() {
  const { userProfile } = useAuth();
  const [skillGraph, setSkillGraph] = useState<SkillGraph | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkillGraph = async () => {
      try {
        const docRef = doc(db, 'config', 'skillGraph');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSkillGraph(docSnap.data() as SkillGraph);
        } else {
          console.error('Skill graph not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading skill graph:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillGraph();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading skill data...</div>
      </div>
    );
  }

  if (!skillGraph) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Failed to load skill graph. Please try again later.</p>
      </div>
    );
  }

  const skills = Object.entries(skillGraph.skills);

  // Count proficiency levels
  const stats = {
    mastered: 0,
    proficient: 0,
    learning: 0,
    notStarted: 0,
  };

  skills.forEach(([skillId]) => {
    const prof = userProfile?.skillProficiency?.[skillId];
    if (!prof) {
      stats.notStarted++;
    } else if (prof.level === 'mastered') {
      stats.mastered++;
    } else if (prof.level === 'proficient') {
      stats.proficient++;
    } else if (prof.level === 'learning') {
      stats.learning++;
    } else {
      stats.notStarted++;
    }
  });

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Your Progress</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.mastered}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.proficient}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Proficient</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.learning}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-zinc-600 dark:text-zinc-400">{stats.notStarted}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Not Started</div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">All Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map(([skillId, skill]) => (
            <SkillCard
              key={skillId}
              skillId={skillId}
              skillName={skill.name}
              description={skill.description}
              proficiency={userProfile?.skillProficiency?.[skillId] || null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
