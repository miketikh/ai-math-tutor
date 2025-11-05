/**
 * Branching Logic System
 * Determines when and how to branch to prerequisite skills
 * Implements intelligent skill selection and depth management
 */

import { SkillGraph, Skill } from '@/types/skill';
import { SkillProficiencyData, ProficiencyLevel } from '@/lib/proficiencyTracker';

/**
 * Reasons why branching might be recommended
 */
export type BranchReason =
  | 'consistent_struggle'
  | 'explicit_confusion'
  | 'incorrect_attempts'
  | 'prerequisite_gap';

/**
 * Result of shouldBranch analysis
 */
export interface BranchDecision {
  shouldBranch: boolean;
  reason?: BranchReason;
  confidence: number; // 0-1, how confident we are in this decision
  explanation: string;
}

/**
 * Result of selectBranchSkill analysis
 */
export interface BranchSkillSelection {
  skillId: string;
  skillName: string;
  reason: string;
  priority: number; // Higher = more urgent to practice
}

/**
 * Determine if student should branch to practice a prerequisite skill
 *
 * @param studentResponse Student's response text
 * @param requiredSkills Array of skill IDs required for current problem
 * @param userProficiency Record of user's proficiency levels by skill ID
 * @param incorrectAttempts Number of incorrect attempts on current problem
 * @returns Branch decision with reasoning
 */
export function shouldBranch(
  studentResponse: string,
  requiredSkills: string[],
  userProficiency: Record<string, SkillProficiencyData>,
  incorrectAttempts: number = 0
): BranchDecision {
  // Normalize response for analysis
  const response = studentResponse.toLowerCase().trim();

  // Check for explicit confusion signals
  const confusionPhrases = [
    "i don't know",
    "i'm not sure",
    "i'm stuck",
    "i don't understand",
    "i'm confused",
    "no idea",
    "help",
    "what is",
    "how do i",
    "can you explain",
  ];

  const hasExplicitConfusion = confusionPhrases.some((phrase) =>
    response.includes(phrase)
  );

  if (hasExplicitConfusion) {
    return {
      shouldBranch: true,
      reason: 'explicit_confusion',
      confidence: 0.9,
      explanation:
        'Student explicitly indicated confusion or lack of understanding',
    };
  }

  // Check for consistent struggle (2+ incorrect attempts)
  if (incorrectAttempts >= 2) {
    return {
      shouldBranch: true,
      reason: 'consistent_struggle',
      confidence: 0.85,
      explanation: `Student has made ${incorrectAttempts} incorrect attempts, indicating difficulty`,
    };
  }

  // Check proficiency levels of required skills
  const weakSkills = requiredSkills.filter((skillId) => {
    const proficiency = userProficiency[skillId];
    if (!proficiency) return true; // Unknown skill is weak
    return proficiency.level === 'unknown' || proficiency.level === 'learning';
  });

  // If multiple weak prerequisites and at least 1 incorrect attempt
  if (weakSkills.length >= 2 && incorrectAttempts >= 1) {
    return {
      shouldBranch: true,
      reason: 'prerequisite_gap',
      confidence: 0.75,
      explanation: `Student has weak proficiency in ${weakSkills.length} prerequisite skills`,
    };
  }

  // Check for single incorrect attempt with all prerequisites unknown
  if (incorrectAttempts >= 1) {
    const allUnknown = requiredSkills.every((skillId) => {
      const proficiency = userProficiency[skillId];
      return !proficiency || proficiency.level === 'unknown';
    });

    if (allUnknown && requiredSkills.length > 0) {
      return {
        shouldBranch: true,
        reason: 'prerequisite_gap',
        confidence: 0.6,
        explanation: 'Student has no recorded proficiency in required prerequisites',
      };
    }
  }

  // No branching recommended
  return {
    shouldBranch: false,
    confidence: 0.7,
    explanation: 'Student shows sufficient understanding or has not struggled enough to warrant branching',
  };
}

/**
 * Select which skill to branch to from a list of weak skills
 * Prioritizes based on:
 * 1. Layer depth (layer2 skills before layer1)
 * 2. Proficiency level (unknown before learning)
 * 3. Dependency frequency (skills that appear in more prerequisite chains)
 *
 * @param weakSkills Array of skill IDs that student is weak in
 * @param skillGraph Complete skill graph
 * @param currentDepth Current depth in skill tree (0 = main problem)
 * @param userProficiency User's proficiency levels
 * @returns Selected skill with reasoning
 */
export function selectBranchSkill(
  weakSkills: string[],
  skillGraph: SkillGraph,
  currentDepth: number,
  userProficiency: Record<string, SkillProficiencyData>
): BranchSkillSelection | null {
  if (weakSkills.length === 0) {
    return null;
  }

  // Calculate priority score for each weak skill
  const skillScores = weakSkills.map((skillId) => {
    let score = 0;
    const proficiency = userProficiency[skillId];
    const skill = skillGraph.skills[skillId];

    if (!skill) {
      console.warn(`Skill ${skillId} not found in skill graph`);
      return { skillId, score: -1, reason: 'Skill not found' };
    }

    // Priority 1: Unknown skills are highest priority
    if (!proficiency || proficiency.level === 'unknown') {
      score += 100;
    } else if (proficiency.level === 'learning') {
      score += 50;
    }

    // Priority 2: Favor simpler skills (fewer prerequisites)
    const totalPrereqs = skill.layer1.length + skill.layer2.length;
    if (totalPrereqs === 0) {
      // Base skill - highest priority
      score += 50;
    } else if (totalPrereqs <= 2) {
      // Simple skill
      score += 30;
    } else {
      // Complex skill
      score += 10;
    }

    // Priority 3: Favor skills that appear in more dependency chains
    let dependencyCount = 0;
    Object.values(skillGraph.skills).forEach((otherSkill) => {
      if (
        otherSkill.layer1.includes(skillId) ||
        otherSkill.layer2.includes(skillId)
      ) {
        dependencyCount++;
      }
    });
    score += dependencyCount * 5;

    // Priority 4: If at depth 0, prefer layer2 skills (deeper fundamentals)
    // If at depth 1, only select from layer2 of current skill
    if (currentDepth === 0) {
      // Check if this skill is a layer2 prerequisite of any required skill
      const isLayer2 = Object.values(skillGraph.skills).some(
        (s) => s.layer2.includes(skillId)
      );
      if (isLayer2) {
        score += 20;
      }
    }

    let reason = '';
    if (!proficiency || proficiency.level === 'unknown') {
      reason = 'No prior practice with this skill';
    } else if (proficiency.level === 'learning') {
      reason = `Currently learning (${proficiency.successCount}/${proficiency.problemsSolved} correct)`;
    }

    if (totalPrereqs === 0) {
      reason += reason ? ' - Base skill with no prerequisites' : 'Base skill with no prerequisites';
    }

    return { skillId, score, reason };
  });

  // Sort by score (highest first) and select top skill
  skillScores.sort((a, b) => b.score - a.score);
  const selected = skillScores[0];

  if (selected.score < 0) {
    return null;
  }

  const skill = skillGraph.skills[selected.skillId];

  return {
    skillId: selected.skillId,
    skillName: skill.name,
    reason: selected.reason || 'This skill needs practice',
    priority: selected.score,
  };
}

/**
 * Check if we can branch deeper from current depth
 * Maximum depth is 2 (Main → Layer 1 → Layer 2)
 *
 * @param currentDepth Current depth in skill tree (0 = main, 1 = layer1, 2 = layer2)
 * @param maxDepth Maximum allowed depth (default 2)
 * @returns Whether branching deeper is allowed
 */
export function canBranchDeeper(
  currentDepth: number,
  maxDepth: number = 2
): boolean {
  return currentDepth < maxDepth;
}

/**
 * Get appropriate weak skills for branching based on current context
 * If at main problem: return layer1 prerequisites
 * If at layer1 skill: return layer2 prerequisites
 *
 * @param currentSkillId Current skill ID (undefined if at main problem)
 * @param requiredSkills Required skills for current problem/skill
 * @param skillGraph Complete skill graph
 * @param userProficiency User's proficiency levels
 * @param currentDepth Current depth in skill tree
 * @returns Array of weak skill IDs appropriate for current depth
 */
export function getWeakSkillsForBranching(
  currentSkillId: string | undefined,
  requiredSkills: string[],
  skillGraph: SkillGraph,
  userProficiency: Record<string, SkillProficiencyData>,
  currentDepth: number
): string[] {
  let candidateSkills: string[] = [];

  if (currentDepth === 0) {
    // At main problem - look at layer1 prerequisites
    candidateSkills = requiredSkills.filter((skillId) => {
      const skill = skillGraph.skills[skillId];
      return skill && skill.layer1.length >= 0; // Any skill can be layer1
    });
  } else if (currentDepth === 1 && currentSkillId) {
    // At layer1 skill - look at layer2 prerequisites
    const currentSkill = skillGraph.skills[currentSkillId];
    if (currentSkill) {
      candidateSkills = currentSkill.layer2;
    }
  }

  // Filter to only weak skills
  const weakSkills = candidateSkills.filter((skillId) => {
    const proficiency = userProficiency[skillId];
    if (!proficiency) return true; // Unknown is weak
    return proficiency.level === 'unknown' || proficiency.level === 'learning';
  });

  return weakSkills;
}

/**
 * Generate a user-friendly message asking for permission to branch
 *
 * @param skillName Name of skill to branch to
 * @param reason Reason for branching
 * @returns Message to display to student
 */
export function generateBranchMessage(
  skillName: string,
  reason: string
): string {
  const messages = [
    `I notice ${skillName.toLowerCase()} might need some practice. Would you like to work on that first? ${reason}`,
    `Let's build a strong foundation with ${skillName.toLowerCase()}. ${reason} Ready to practice?`,
    `I think practicing ${skillName.toLowerCase()} would help here. ${reason} Shall we try a few problems?`,
    `Before we continue, let's strengthen your ${skillName.toLowerCase()} skills. ${reason}`,
  ];

  // Return a random message for variety
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Check if a skill has already been attempted in the current session
 *
 * @param skillId Skill ID to check
 * @param branchHistory Array of skill IDs already practiced in session
 * @returns Whether skill has been attempted
 */
export function hasAttemptedSkill(
  skillId: string,
  branchHistory: string[]
): boolean {
  return branchHistory.includes(skillId);
}

/**
 * Get all valid branch options (excluding already attempted skills)
 *
 * @param weakSkills Array of weak skill IDs
 * @param branchHistory Array of skill IDs already practiced
 * @returns Filtered array of skill IDs not yet attempted
 */
export function getValidBranchOptions(
  weakSkills: string[],
  branchHistory: string[]
): string[] {
  return weakSkills.filter((skillId) => !branchHistory.includes(skillId));
}

/**
 * Determine if we should offer alternative help when max depth reached
 *
 * @param currentDepth Current depth in skill tree
 * @param maxDepth Maximum allowed depth
 * @returns Whether to offer alternative resources
 */
export function shouldOfferAlternativeHelp(
  currentDepth: number,
  maxDepth: number = 2
): boolean {
  return currentDepth >= maxDepth;
}

/**
 * Generate alternative help message when branching not possible
 *
 * @param skillName Name of skill student is struggling with
 * @returns Helpful message with alternatives
 */
export function generateAlternativeHelpMessage(skillName: string): string {
  return `I see ${skillName.toLowerCase()} is challenging. Since we've already practiced several skills, let me try explaining it differently or we can work through it together step by step. Which would you prefer?`;
}
