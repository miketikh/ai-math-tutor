'use client';

// Lightweight client-side access to the static skill graph JSON used for UI rendering
// This intentionally avoids server-only Firestore access in lib/skillGraph.ts

import rawGraph from '../../data/skillGraph.json';

type SkillRecord = Record<string, {
  name: string;
  description: string;
  layer1: string[];
  layer2: string[];
  diagnostics?: { layer1?: string[]; layer2?: string[] };
}>;

interface SkillGraphJson {
  metadata?: Record<string, unknown>;
  skills: SkillRecord;
}

const graph = rawGraph as SkillGraphJson;

export interface ClientSkillInfo {
  id: string;
  name: string;
  description: string;
  layer1: string[];
  layer2: string[];
}

export interface PrereqInfo { id: string; name: string; description: string }

export function getSkillInfo(skillId: string): ClientSkillInfo | null {
  const skill = graph.skills?.[skillId];
  if (!skill) return null;
  return {
    id: skillId,
    name: skill.name,
    description: skill.description,
    layer1: skill.layer1 || [],
    layer2: skill.layer2 || [],
  };
}

export function getPrereqs(skillId: string, limit = 6): PrereqInfo[] {
  if (!graph.skills) return [];
  const root = graph.skills[skillId];
  if (!root || limit <= 0) {
    return [];
  }

  const visited = new Set<string>([skillId]);
  const queue: string[] = [];
  const results: PrereqInfo[] = [];

  const enqueue = (ids?: string[]) => {
    if (!ids) return;
    for (const id of ids) {
      if (!id) continue;
      if (visited.has(id)) continue;
      if (!graph.skills[id]) continue;
      visited.add(id);
      queue.push(id);
    }
  };

  // Start with direct prerequisites (layer1) first, then deeper ones (layer2)
  enqueue(root.layer1);
  enqueue(root.layer2);

  while (queue.length > 0 && results.length < limit) {
    const currentId = queue.shift();
    if (!currentId) continue;
    const current = graph.skills[currentId];
    if (!current) continue;

    results.push({ id: currentId, name: current.name, description: current.description });
    if (results.length >= limit) break;

    // Breadth-first expansion: layer1 prerequisites before deeper ones
    enqueue(current.layer1);
    enqueue(current.layer2);
  }

  return results;
}

export function listAllSkills(): PrereqInfo[] {
  if (!graph.skills) return [];
  return Object.entries(graph.skills).map(([id, s]) => ({ id, name: s.name, description: s.description }));
}


