/**
 * SkillGraphManager - Utility for loading and querying the skill dependency graph
 * Implements singleton pattern with in-memory caching for server-side efficiency
 */

import { adminDb } from './firebaseAdmin';
import type {
  Skill,
  SkillGraph,
  PrerequisitesResult,
  SkillInfo
} from '@/types/skill';

/**
 * SkillGraphManager class
 * Manages loading and querying of the skill dependency graph from Firestore
 */
class SkillGraphManager {
  private static instance: SkillGraphManager | null = null;
  private skillGraph: SkillGraph | null = null;
  private loading: Promise<SkillGraph> | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance of SkillGraphManager
   */
  public static getInstance(): SkillGraphManager {
    if (!SkillGraphManager.instance) {
      SkillGraphManager.instance = new SkillGraphManager();
    }
    return SkillGraphManager.instance;
  }

  /**
   * Load skill graph from Firestore with in-memory caching
   * @returns Promise<SkillGraph>
   * @throws Error if skill graph not found or invalid
   */
  public async loadSkillGraph(): Promise<SkillGraph> {
    // Return cached version if already loaded
    if (this.skillGraph) {
      return this.skillGraph;
    }

    // Return existing loading promise if already in progress
    if (this.loading) {
      return this.loading;
    }

    // Start loading
    this.loading = this.fetchSkillGraphFromFirestore();

    try {
      this.skillGraph = await this.loading;
      return this.skillGraph;
    } finally {
      this.loading = null;
    }
  }

  /**
   * Fetch skill graph from Firestore
   * @private
   */
  private async fetchSkillGraphFromFirestore(): Promise<SkillGraph> {
    try {
      const docRef = adminDb.collection('config').doc('skillGraph');
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error('Skill graph not found in Firestore at /config/skillGraph');
      }

      const data = docSnap.data() as SkillGraph;

      // Validate structure
      if (!data.skills || typeof data.skills !== 'object') {
        throw new Error('Invalid skill graph structure: missing skills object');
      }

      if (!data.metadata || !data.metadata.version) {
        throw new Error('Invalid skill graph structure: missing metadata');
      }

      console.log(`Skill graph loaded: version ${data.metadata.version}, ${Object.keys(data.skills).length} skills`);

      return data;
    } catch (error) {
      console.error('Error loading skill graph from Firestore:', error);
      throw error;
    }
  }

  /**
   * Get skill details by ID
   * @param skillId - The skill identifier
   * @returns Skill object with full details
   * @throws Error if skill not found
   */
  public async getSkill(skillId: string): Promise<Skill> {
    const graph = await this.loadSkillGraph();

    const skill = graph.skills[skillId];
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    return skill;
  }

  /**
   * Get prerequisites for a skill at a specific layer
   * @param skillId - The skill identifier
   * @param layer - Dependency layer (1 or 2)
   * @returns Array of prerequisite skill IDs with details
   */
  public async getPrerequisites(
    skillId: string,
    layer: 1 | 2
  ): Promise<PrerequisitesResult> {
    const graph = await this.loadSkillGraph();
    const skill = graph.skills[skillId];

    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const prerequisiteIds = layer === 1 ? skill.layer1 : skill.layer2;

    // Map IDs to full skill objects
    const skills = prerequisiteIds.map(id => {
      const prereqSkill = graph.skills[id];
      if (!prereqSkill) {
        console.warn(`Prerequisite skill not found: ${id} (referenced by ${skillId})`);
        return null;
      }
      return {
        id,
        name: prereqSkill.name,
        description: prereqSkill.description,
      };
    }).filter((s): s is { id: string; name: string; description: string } => s !== null);

    return {
      skillIds: prerequisiteIds,
      skills,
    };
  }

  /**
   * Get diagnostic questions for a skill at a specific layer
   * @param skillId - The skill identifier
   * @param layer - Diagnostic layer (1 or 2)
   * @returns Array of diagnostic question strings
   */
  public async getDiagnosticQuestions(
    skillId: string,
    layer: 1 | 2
  ): Promise<string[]> {
    const skill = await this.getSkill(skillId);

    if (!skill.diagnostics) {
      console.warn(`No diagnostics found for skill: ${skillId}`);
      return [];
    }

    const questions = layer === 1
      ? skill.diagnostics.layer1 || []
      : skill.diagnostics.layer2 || [];

    return questions;
  }

  /**
   * Get all skills with their IDs and names
   * @returns Array of skill info objects
   */
  public async getAllSkills(): Promise<SkillInfo[]> {
    const graph = await this.loadSkillGraph();

    return Object.entries(graph.skills).map(([id, skill]) => ({
      id,
      name: skill.name,
      description: skill.description,
    }));
  }

  /**
   * Validate if a skill ID exists in the graph
   * @param skillId - The skill identifier to validate
   * @returns boolean indicating if skill exists
   */
  public async validateSkillExists(skillId: string): Promise<boolean> {
    try {
      const graph = await this.loadSkillGraph();
      return skillId in graph.skills;
    } catch (error) {
      console.error('Error validating skill:', error);
      return false;
    }
  }

  /**
   * Clear the cached skill graph (useful for testing or updates)
   * @internal
   */
  public clearCache(): void {
    this.skillGraph = null;
    this.loading = null;
  }

  /**
   * Get the current skill graph (if loaded)
   * @returns SkillGraph or null if not yet loaded
   */
  public getSkillGraphSync(): SkillGraph | null {
    return this.skillGraph;
  }
}

// Export singleton instance
export const skillGraphManager = SkillGraphManager.getInstance();

// Export class for testing
export { SkillGraphManager };
