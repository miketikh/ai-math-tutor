/**
 * Skill Graph Type Definitions
 * Types for the skill dependency graph system
 */

/**
 * Diagnostic questions for a skill at a specific layer
 */
export interface DiagnosticQuestions {
  layer1?: string[];
  layer2?: string[];
}

/**
 * Individual skill in the skill graph
 */
export interface Skill {
  name: string;
  description: string;
  layer1: string[];
  layer2: string[];
  diagnostics: DiagnosticQuestions;
  category?: string;
  keywords?: string[];
  common_mistakes?: string[];
  keywords_map?: Record<string, string[]>;
}

/**
 * Metadata about the skill graph
 */
export interface SkillGraphMetadata {
  description: string;
  target_audience?: string;
  version: string;
  total_skills?: number;
  note?: string;
}

/**
 * Complete skill graph structure
 */
export interface SkillGraph {
  metadata: SkillGraphMetadata;
  skills: Record<string, Skill>;
  problem_to_skill_mapping?: {
    word_problems?: Record<string, string[]>;
    equations?: Record<string, string[]>;
    graphing?: Record<string, string[]>;
  };
  usage_guide?: Record<string, string>;
  skill_categories?: Record<string, string[]>;
}

/**
 * Result from getPrerequisites method
 */
export interface PrerequisitesResult {
  skillIds: string[];
  skills: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

/**
 * Skill information for getAllSkills
 */
export interface SkillInfo {
  id: string;
  name: string;
  description: string;
}
