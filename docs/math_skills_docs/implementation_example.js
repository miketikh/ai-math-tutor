// Example implementation: Using the skill dependency graph in a tutoring app

import skillGraph from './compact_skill_graph.json';

// Example 1: Student struggles with a two-step equation
function diagnoseStruggle(problemType, studentAnswer, correctAnswer) {
  const skill = skillGraph.skills[problemType];
  
  if (studentAnswer !== correctAnswer) {
    console.log(`Student struggled with: ${skill.name}`);
    console.log(`Description: ${skill.description}`);
    console.log('\n--- Layer 1 Diagnostics ---');
    
    // Test Layer 1 prerequisites
    const layer1Results = testPrerequisites(skill.layer1);
    
    if (hasFailures(layer1Results)) {
      console.log('Student has gaps in Layer 1 prerequisites');
      
      // Drill down to Layer 2 for failed skills
      const failedSkills = getFailedSkills(layer1Results);
      console.log('\n--- Layer 2 Diagnostics ---');
      
      failedSkills.forEach(failedSkill => {
        const deeperSkill = skillGraph.skills[failedSkill];
        if (deeperSkill && deeperSkill.layer2.length > 0) {
          console.log(`\nTesting deeper prerequisites for: ${failedSkill}`);
          testPrerequisites(deeperSkill.layer2);
        }
      });
    }
    
    return generateLearningPath(skill, layer1Results);
  }
}

// Example 2: Generate a learning path
function generateLearningPath(mainSkill, diagnosticResults) {
  const path = {
    currentGoal: mainSkill.name,
    weakestSkills: [],
    recommendedOrder: []
  };
  
  // Find the most foundational weak skill
  diagnosticResults.forEach(result => {
    if (!result.passed) {
      path.weakestSkills.push(result.skill);
    }
  });
  
  // Order by dependency depth (work on foundations first)
  path.recommendedOrder = path.weakestSkills.sort((a, b) => {
    return getSkillDepth(a) - getSkillDepth(b);
  });
  
  return path;
}

// Example 3: Real-world usage in React component
function TutoringSession({ problem, studentAttempt }) {
  const [currentFocus, setCurrentFocus] = useState(problem.mainSkill);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  
  const handleIncorrectAnswer = () => {
    // Student got it wrong - start diagnostics
    setDiagnosticMode(true);
    
    const skill = skillGraph.skills[problem.mainSkill];
    const layer1Tests = skill.diagnostics.layer1;
    
    // Show Layer 1 diagnostic questions
    return layer1Tests.map(test => ({
      question: test,
      onComplete: (passed) => {
        if (!passed) {
          // Drill deeper - show Layer 2 questions
          const layer2Tests = skill.diagnostics.layer2;
          return layer2Tests;
        }
      }
    }));
  };
  
  return (
    <div>
      <h2>{problem.text}</h2>
      {diagnosticMode ? (
        <DiagnosticQuestions 
          skill={currentFocus}
          onComplete={handleDiagnosticComplete}
        />
      ) : (
        <ProblemAttempt 
          problem={problem}
          onIncorrect={handleIncorrectAnswer}
        />
      )}
    </div>
  );
}

// Example 4: Simplified query helper
class SkillDependencyManager {
  constructor(skillGraph) {
    this.skills = skillGraph.skills;
  }
  
  getPrerequisites(skillName, depth = 1) {
    const skill = this.skills[skillName];
    if (!skill) return [];
    
    if (depth === 1) {
      return skill.layer1;
    } else if (depth === 2) {
      return skill.layer2;
    }
    return [];
  }
  
  getDiagnosticQuestions(skillName, depth = 1) {
    const skill = this.skills[skillName];
    if (!skill || !skill.diagnostics) return [];
    
    const layerKey = `layer${depth}`;
    return skill.diagnostics[layerKey] || [];
  }
  
  identifyWeakestSkill(failedSkills) {
    // Return the most foundational skill that failed
    // (the one with fewest prerequisites)
    return failedSkills.sort((a, b) => {
      const aDepth = this.getSkillDepth(a);
      const bDepth = this.getSkillDepth(b);
      return aDepth - bDepth;
    })[0];
  }
  
  getSkillDepth(skillName, visited = new Set()) {
    if (visited.has(skillName)) return 0;
    visited.add(skillName);
    
    const skill = this.skills[skillName];
    if (!skill || skill.layer1.length === 0) return 0;
    
    const prereqDepths = skill.layer1.map(prereq => 
      this.getSkillDepth(prereq, visited)
    );
    
    return 1 + Math.max(...prereqDepths, 0);
  }
  
  buildLearningPath(targetSkill, weakSkills) {
    // Create an ordered list of skills to work on
    // Start with most foundational, end with target
    const path = [];
    const skillsToLearn = new Set([targetSkill, ...weakSkills]);
    
    // Sort by depth (foundational first)
    const sortedSkills = Array.from(skillsToLearn).sort((a, b) => 
      this.getSkillDepth(a) - this.getSkillDepth(b)
    );
    
    return sortedSkills.map(skillName => ({
      skill: skillName,
      name: this.skills[skillName].name,
      description: this.skills[skillName].description,
      diagnostics: this.getDiagnosticQuestions(skillName, 1)
    }));
  }
}

// Example 5: Usage in practice
const manager = new SkillDependencyManager(skillGraph);

// Student struggles with "2x + 5 = 13"
const targetSkill = 'two_step_equations';

// Get immediate prerequisites to check
const layer1 = manager.getPrerequisites(targetSkill, 1);
console.log('Check these first:', layer1);
// Output: ['one_step_equations', 'order_of_operations']

// Student fails 'one_step_equations' check
// Drill deeper
const layer2 = manager.getPrerequisites('one_step_equations', 2);
console.log('Drill down to:', layer2);
// Output: ['understanding_variables', 'basic_arithmetic']

// Get diagnostic questions
const diagnostics = manager.getDiagnosticQuestions('one_step_equations', 1);
console.log('Test with:', diagnostics);
// Output: ['What does x represent?', 'Calculate 12 - 5']

// Build complete learning path
const weakSkills = ['understanding_variables'];
const learningPath = manager.buildLearningPath(targetSkill, weakSkills);
console.log('\nLearning path:');
learningPath.forEach((step, i) => {
  console.log(`${i + 1}. ${step.name}`);
});
// Output:
// 1. Understanding Variables
// 2. One-Step Equations  
// 3. Two-Step Equations

// Example 6: Integration with AI assistant
async function generateHelpWithAI(problem, weakestSkill) {
  const skill = skillGraph.skills[weakestSkill];
  
  const prompt = `
    Student is struggling with: ${problem}
    
    The root cause is a gap in: ${skill.name}
    Description: ${skill.description}
    
    Generate:
    1. A simple explanation of ${skill.name}
    2. 3 practice problems at this level
    3. A strategy for connecting this back to the original problem
  `;
  
  const aiResponse = await callAIAssistant(prompt);
  return aiResponse;
}

export { SkillDependencyManager, diagnoseStruggle, generateLearningPath };
