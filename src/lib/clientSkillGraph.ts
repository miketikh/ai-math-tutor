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

export function getPrereqs(skillId: string, limit = 2): PrereqInfo[] {
  const base = getSkillInfo(skillId);
  if (!base) return [];
  const ids = (base.layer1 || []).slice(0, limit);
  return ids
    .map((id) => {
      const s = graph.skills?.[id];
      if (!s) return null;
      return { id, name: s.name, description: s.description };
    })
    .filter((x): x is PrereqInfo => Boolean(x));
}

export function listAllSkills(): PrereqInfo[] {
  if (!graph.skills) return [];
  return Object.entries(graph.skills).map(([id, s]) => ({ id, name: s.name, description: s.description }));
}


