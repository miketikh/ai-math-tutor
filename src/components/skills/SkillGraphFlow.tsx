'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { generateSkillGraph, SkillNodeData, SkillProficiencyData } from '@/lib/skillGraphLayout';
import SkillNode from './SkillNode';

// Define custom node types
const nodeTypes: NodeTypes = {
  skillNode: SkillNode,
};

interface SkillGraphFlowProps {
  userProficiency: Record<string, SkillProficiencyData>;
  onNodeClick?: (skillId: string, skillData: SkillNodeData) => void;
}

/**
 * React Flow container component for skill graph visualization
 * Handles graph generation, layout, and interactions
 */
export default function SkillGraphFlow({ userProficiency, onNodeClick }: SkillGraphFlowProps) {
  // Generate graph layout - memoized to prevent recalculation
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateSkillGraph(userProficiency),
    [userProficiency]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data) {
        onNodeClick(node.id, node.data as SkillNodeData);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          maxZoom: 1,
        }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        className="skill-graph-flow"
      >
        {/* Background pattern */}
        <Background
          color="#94a3b8"
          gap={20}
          size={1}
          className="dark:opacity-20"
        />

        {/* Navigation controls (zoom, fit view) */}
        <Controls
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
          showInteractive={false}
        />

        {/* Mini map for navigation */}
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as SkillNodeData | undefined;
            if (!data || !data.proficiency) return '#9ca3af';
            switch (data.proficiency.level) {
              case 'mastered':
                return '#22c55e';
              case 'proficient':
                return '#3b82f6';
              case 'learning':
                return '#eab308';
              default:
                return '#9ca3af';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
