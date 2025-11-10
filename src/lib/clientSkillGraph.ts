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

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  depth: number;
  children: SkillTreeNode[];
}

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

/**
 * Get a hierarchical tree of skill dependencies
 * @param skillId - The root skill to build the tree from
 * @param maxDepth - Maximum depth to traverse (default 3)
 * @returns Array of tree nodes representing direct dependencies (layer1)
 */
export function getSkillDependencyTree(skillId: string, maxDepth = 3): SkillTreeNode[] {
  if (!graph.skills) return [];
  const root = graph.skills[skillId];
  if (!root) return [];

  const buildNode = (id: string, currentDepth: number): SkillTreeNode | null => {
    const skill = graph.skills[id];
    if (!skill) return null;

    const node: SkillTreeNode = {
      id,
      name: skill.name,
      description: skill.description,
      depth: currentDepth,
      children: [],
    };

    // Recursively build children if we haven't hit max depth
    if (currentDepth < maxDepth && skill.layer1 && skill.layer1.length > 0) {
      for (const childId of skill.layer1) {
        if (!childId) continue;
        const childNode = buildNode(childId, currentDepth + 1);
        if (childNode) {
          node.children.push(childNode);
        }
      }
    }

    return node;
  };

  // Build tree nodes for each direct dependency (layer1)
  const treeNodes: SkillTreeNode[] = [];
  if (root.layer1) {
    for (const depId of root.layer1) {
      if (!depId) continue;
      const node = buildNode(depId, 1);
      if (node) {
        treeNodes.push(node);
      }
    }
  }

  return treeNodes;
}


