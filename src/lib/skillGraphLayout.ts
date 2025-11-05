import Dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';
import skillGraphDataImport from '../../data/skillGraph.json';

// Type for the skill graph JSON structure
interface SkillData {
  name: string;
  description: string;
  layer1: string[];
  layer2: string[];
  diagnostics?: {
    layer1?: string[];
    layer2?: string[];
  };
}

interface SkillGraphData {
  metadata: Record<string, unknown>;
  skills: Record<string, SkillData>;
  problem_to_skill_mapping?: Record<string, unknown>;
  usage_guide?: Record<string, unknown>;
}

const skillGraphData = skillGraphDataImport as SkillGraphData;

export interface SkillProficiencyData {
  level: 'unknown' | 'learning' | 'proficient' | 'mastered';
  problemsSolved: number;
  successCount: number;
  lastPracticed?: Date;
}

export interface SkillNodeData extends Record<string, unknown> {
  skillId: string;
  name: string;
  description: string;
  proficiency: SkillProficiencyData;
  layer1: string[];
  layer2: string[];
}

/**
 * Builds the dependency edges for the skill graph
 * Reverses the direction so advanced skills point DOWN to their prerequisites
 */
function buildGraphEdges(skills: Record<string, SkillData>): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>(); // Prevent duplicate edges

  Object.entries(skills).forEach(([skillId, skillData]) => {
    // Create edges from current skill to its layer1 prerequisites
    skillData.layer1.forEach((prereqId: string) => {
      const edgeId = `${skillId}->${prereqId}`;
      if (!edgeSet.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: skillId,
          target: prereqId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
        edgeSet.add(edgeId);
      }
    });

    // For visualization clarity, we can optionally show layer2 dependencies
    // with a different style (dashed line)
    // Uncomment if you want to show layer2 connections:
    /*
    skillData.layer2.forEach((prereqId) => {
      const edgeId = `${skillId}->${prereqId}-layer2`;
      if (!edgeSet.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: skillId,
          target: prereqId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5,5' },
        });
        edgeSet.add(edgeId);
      }
    });
    */
  });

  return edges;
}

/**
 * Calculates the hierarchy level of each skill
 * (how many layers of dependencies exist below it)
 */
function calculateSkillLevels(skills: Record<string, SkillData>): Record<string, number> {
  const levels: Record<string, number> = {};
  const visited = new Set<string>();

  function calculateLevel(skillId: string): number {
    if (visited.has(skillId)) {
      return levels[skillId] || 0;
    }

    visited.add(skillId);
    const skill = skills[skillId];

    if (!skill) {
      return 0;
    }

    // If no dependencies, it's a foundational skill (level 0)
    if (skill.layer1.length === 0 && skill.layer2.length === 0) {
      levels[skillId] = 0;
      return 0;
    }

    // Calculate level as 1 + max level of all prerequisites
    const prereqLevels = [
      ...skill.layer1.map((id: string) => calculateLevel(id)),
      ...skill.layer2.map((id: string) => calculateLevel(id))
    ];

    const level = Math.max(...prereqLevels, -1) + 1;
    levels[skillId] = level;
    return level;
  }

  // Calculate levels for all skills
  Object.keys(skills).forEach(skillId => calculateLevel(skillId));

  return levels;
}

/**
 * Creates React Flow nodes from skill graph data
 * Includes proficiency data from user profile
 */
function buildGraphNodes(
  skills: Record<string, SkillData>,
  userProficiency: Record<string, SkillProficiencyData>
): Node<SkillNodeData>[] {
  const nodes: Node<SkillNodeData>[] = [];

  Object.entries(skills).forEach(([skillId, skillData]) => {
    const proficiency = userProficiency[skillId] || {
      level: 'unknown',
      problemsSolved: 0,
      successCount: 0,
    };

    nodes.push({
      id: skillId,
      type: 'skillNode',
      position: { x: 0, y: 0 }, // Will be set by Dagre
      data: {
        skillId,
        name: skillData.name,
        description: skillData.description,
        proficiency,
        layer1: skillData.layer1,
        layer2: skillData.layer2,
      },
    });
  });

  return nodes;
}

/**
 * Applies Dagre layout algorithm to position nodes hierarchically
 */
function applyDagreLayout(
  nodes: Node<SkillNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node<SkillNodeData>[]; edges: Edge[] } {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // Top-to-bottom or left-to-right
    nodesep: 100, // Horizontal spacing between nodes
    ranksep: 120, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 120 });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  Dagre.layout(dagreGraph);

  // Update node positions from dagre layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110, // Center node (width / 2)
        y: nodeWithPosition.y - 60,  // Center node (height / 2)
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Main function to generate the complete skill graph layout
 * This should be memoized in the component to avoid recalculation
 */
export function generateSkillGraph(
  userProficiency: Record<string, SkillProficiencyData>
): { nodes: Node<SkillNodeData>[]; edges: Edge[] } {
  const skills = skillGraphData.skills;

  // Build nodes and edges
  const nodes = buildGraphNodes(skills, userProficiency);
  const edges = buildGraphEdges(skills);

  // Apply hierarchical layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(nodes, edges, 'TB');

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

/**
 * Get proficiency color for a skill level
 */
export function getProficiencyColor(level: SkillProficiencyData['level']): {
  bg: string;
  border: string;
  text: string;
} {
  switch (level) {
    case 'mastered':
      return { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500', text: 'text-green-700 dark:text-green-300' };
    case 'proficient':
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' };
    case 'learning':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' };
    default: // unknown
      return { bg: 'bg-zinc-100 dark:bg-zinc-800', border: 'border-zinc-400 dark:border-zinc-600', text: 'text-zinc-600 dark:text-zinc-400' };
  }
}

/**
 * Calculate progress percentage for a skill
 */
export function calculateProgress(proficiency: SkillProficiencyData): number {
  if (proficiency.problemsSolved === 0) return 0;

  const successRate = (proficiency.successCount / proficiency.problemsSolved) * 100;

  // Map levels to minimum progress
  const levelProgress = {
    unknown: 0,
    learning: 25,
    proficient: 50,
    mastered: 100,
  };

  // Return the higher of success rate or level-based progress
  return Math.max(successRate, levelProgress[proficiency.level]);
}
