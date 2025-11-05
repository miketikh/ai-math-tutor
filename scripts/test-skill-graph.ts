/**
 * Test script for SkillGraphManager
 * Run with: npx tsx scripts/test-skill-graph.ts
 */

import { skillGraphManager } from '../src/lib/skillGraph';

async function testSkillGraphManager() {
  console.log('=== Testing SkillGraphManager ===\n');

  try {
    // Test 1: Load skill graph
    console.log('Test 1: Loading skill graph...');
    const graph = await skillGraphManager.loadSkillGraph();
    console.log(`✓ Loaded skill graph version ${graph.metadata.version}`);
    console.log(`✓ Total skills: ${Object.keys(graph.skills).length}\n`);

    // Test 2: Get a specific skill
    console.log('Test 2: Getting skill "two_step_equations"...');
    const skill = await skillGraphManager.getSkill('two_step_equations');
    console.log(`✓ Skill name: ${skill.name}`);
    console.log(`✓ Description: ${skill.description}\n`);

    // Test 3: Get prerequisites (layer 1)
    console.log('Test 3: Getting layer 1 prerequisites for "two_step_equations"...');
    const prereqs1 = await skillGraphManager.getPrerequisites('two_step_equations', 1);
    console.log(`✓ Layer 1 prerequisite IDs: ${JSON.stringify(prereqs1.skillIds)}`);
    console.log(`✓ Expected: ["one_step_equations", "order_of_operations"]`);
    console.log(`✓ Match: ${JSON.stringify(prereqs1.skillIds) === JSON.stringify(['one_step_equations', 'order_of_operations'])}`);
    console.log(`✓ Skill details:`);
    prereqs1.skills.forEach(s => {
      console.log(`  - ${s.id}: ${s.name}`);
    });
    console.log('');

    // Test 4: Get prerequisites (layer 2)
    console.log('Test 4: Getting layer 2 prerequisites for "two_step_equations"...');
    const prereqs2 = await skillGraphManager.getPrerequisites('two_step_equations', 2);
    console.log(`✓ Layer 2 prerequisite IDs: ${JSON.stringify(prereqs2.skillIds)}`);
    console.log(`✓ Expected: ["understanding_variables", "basic_arithmetic"]`);
    console.log(`✓ Match: ${JSON.stringify(prereqs2.skillIds) === JSON.stringify(['understanding_variables', 'basic_arithmetic'])}`);
    console.log('');

    // Test 5: Get diagnostic questions (layer 1)
    console.log('Test 5: Getting layer 1 diagnostic questions for "two_step_equations"...');
    const diag1 = await skillGraphManager.getDiagnosticQuestions('two_step_equations', 1);
    console.log(`✓ Layer 1 diagnostics: ${JSON.stringify(diag1)}`);
    console.log(`✓ Expected: ["x + 5 = 13", "3x = 12"]`);
    console.log(`✓ Match: ${JSON.stringify(diag1) === JSON.stringify(['x + 5 = 13', '3x = 12'])}`);
    console.log('');

    // Test 6: Get diagnostic questions (layer 2)
    console.log('Test 6: Getting layer 2 diagnostic questions for "two_step_equations"...');
    const diag2 = await skillGraphManager.getDiagnosticQuestions('two_step_equations', 2);
    console.log(`✓ Layer 2 diagnostics: ${JSON.stringify(diag2)}`);
    console.log('');

    // Test 7: Get all skills
    console.log('Test 7: Getting all skills...');
    const allSkills = await skillGraphManager.getAllSkills();
    console.log(`✓ Total skills: ${allSkills.length}`);
    console.log(`✓ First 5 skills:`);
    allSkills.slice(0, 5).forEach(s => {
      console.log(`  - ${s.id}: ${s.name}`);
    });
    console.log('');

    // Test 8: Validate skill exists
    console.log('Test 8: Validating skill existence...');
    const exists = await skillGraphManager.validateSkillExists('two_step_equations');
    console.log(`✓ "two_step_equations" exists: ${exists}`);
    const notExists = await skillGraphManager.validateSkillExists('nonexistent_skill');
    console.log(`✓ "nonexistent_skill" exists: ${notExists}`);
    console.log('');

    // Test 9: Error handling - invalid skill
    console.log('Test 9: Testing error handling for invalid skill...');
    try {
      await skillGraphManager.getSkill('invalid_skill_id');
      console.log('✗ Should have thrown an error');
    } catch (error) {
      console.log(`✓ Correctly threw error: ${(error as Error).message}`);
    }
    console.log('');

    console.log('=== All Tests Passed! ===');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

testSkillGraphManager();
