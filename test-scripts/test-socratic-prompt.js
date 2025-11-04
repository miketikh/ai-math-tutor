/**
 * Test Script for Socratic System Prompt (Story 4.2)
 *
 * Tests the Chat API with 10+ different problem types to ensure:
 * 1. AI asks guiding questions instead of giving direct answers
 * 2. AI never provides final numeric solutions
 * 3. AI follows Socratic teaching methodology
 *
 * Run with: node test-socratic-prompt.js
 */

const API_URL = 'http://localhost:3000/api/chat';

// Test problems covering different types
const testProblems = [
  {
    category: 'Arithmetic',
    problemContext: 'What is 25 + 37?',
    userMessage: 'What is 25 + 37?',
    expectedBehavior: 'Should ask guiding questions about addition, not give answer "62"'
  },
  {
    category: 'Algebra - Linear Equation',
    problemContext: 'Solve for x: 2x + 5 = 15',
    userMessage: 'How do I solve this equation?',
    expectedBehavior: 'Should ask about isolating variables, not give answer "x = 5"'
  },
  {
    category: 'Algebra - Quadratic Equation',
    problemContext: 'Solve x^2 + 5x + 6 = 0',
    userMessage: 'How do I solve this quadratic equation?',
    expectedBehavior: 'Should ask about methods for quadratics, not give answer "x = -2 or x = -3"'
  },
  {
    category: 'Geometry - Triangle Area',
    problemContext: 'Find the area of a triangle with base 5 and height 8',
    userMessage: 'What is the area of this triangle?',
    expectedBehavior: 'Should ask about area formulas, not give answer "20"'
  },
  {
    category: 'Fractions',
    problemContext: 'What is 1/2 + 1/3?',
    userMessage: 'How do I add these fractions?',
    expectedBehavior: 'Should ask about common denominators, not give answer "5/6"'
  },
  {
    category: 'Word Problem - Speed',
    problemContext: 'If a car travels 60 miles in 2 hours, what is its speed?',
    userMessage: 'What is the speed of the car?',
    expectedBehavior: 'Should ask about relationship between distance/time, not give answer "30 mph"'
  },
  {
    category: 'Calculus - Derivative',
    problemContext: 'What is the derivative of x^2?',
    userMessage: 'What is the derivative of x^2?',
    expectedBehavior: 'Should ask about power rule, not give answer "2x"'
  },
  {
    category: 'Trigonometry',
    problemContext: 'What is sin(30°)?',
    userMessage: 'What is sin(30°)?',
    expectedBehavior: 'Should ask about unit circle or special triangles, not give answer "0.5"'
  },
  {
    category: 'Geometry - Pythagorean Theorem',
    problemContext: 'Find the hypotenuse of a right triangle with sides 3 and 4',
    userMessage: 'What is the hypotenuse?',
    expectedBehavior: 'Should ask about Pythagorean theorem, not give answer "5"'
  },
  {
    category: 'Percentages',
    problemContext: 'What is 15% of 80?',
    userMessage: 'How do I calculate 15% of 80?',
    expectedBehavior: 'Should ask about percentage calculation methods, not give answer "12"'
  },
  {
    category: 'Algebra - System of Equations',
    problemContext: 'Solve: x + y = 10 and x - y = 2',
    userMessage: 'How do I solve this system of equations?',
    expectedBehavior: 'Should ask about methods (substitution/elimination), not give answer "x = 6, y = 4"'
  },
  {
    category: 'Exponents',
    problemContext: 'Simplify: 2^3 * 2^4',
    userMessage: 'How do I simplify this?',
    expectedBehavior: 'Should ask about exponent rules, not give answer "128" or "2^7"'
  }
];

// Patterns that indicate direct answers (to be avoided)
// Note: We need to be careful not to match equations being referenced vs solved
const directAnswerPatterns = [
  /the answer is\s*[0-9x]/i,
  /the solution is\s*[0-9x]/i,
  /\sequals?\s+\d+\s*$/i, // "equals 5" at end of sentence
  /therefore\s*[x-z]\s*=\s*\d+/i, // "therefore x = 5"
  /so\s*[x-z]\s*=\s*\d+/i, // "so x = 5"
  /^[0-9.]+\s*$/m, // Just a number alone
  /the result is\s*[0-9]/i,
  /this gives us\s*[x-z]\s*=\s*\d+/i
];

async function testProblem(problem, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${index + 1}/${testProblems.length}: ${problem.category}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Problem: ${problem.problemContext}`);
  console.log(`User Message: "${problem.userMessage}"`);
  console.log(`Expected: ${problem.expectedBehavior}`);
  console.log('-'.repeat(80));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: problem.userMessage,
        conversationHistory: [],
        problemContext: problem.problemContext
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.log(`❌ FAILED: API Error - ${data.error}`);
      return { passed: false, category: problem.category, error: data.error };
    }

    console.log(`AI Response:\n"${data.response}"\n`);

    // Check if response contains direct answers
    const containsDirectAnswer = directAnswerPatterns.some(pattern =>
      pattern.test(data.response)
    );

    // Check if response contains questions (good indicator of Socratic method)
    const containsQuestions = data.response.includes('?');

    // Check if response is encouraging
    const isEncouraging = /great|good|excellent|let's|together|think|can you/i.test(data.response);

    // Evaluation
    if (containsDirectAnswer) {
      console.log('❌ FAILED: Response appears to contain a direct answer');
      console.log('   Matched pattern that suggests direct answer giving');
      return { passed: false, category: problem.category, reason: 'Contains direct answer pattern' };
    }

    if (!containsQuestions) {
      console.log('⚠️  WARNING: Response does not contain questions');
      console.log('   (Socratic method typically uses guiding questions)');
    }

    if (!isEncouraging) {
      console.log('⚠️  WARNING: Response may not be encouraging enough');
    }

    if (!containsDirectAnswer && containsQuestions && isEncouraging) {
      console.log('✅ PASSED: Response follows Socratic method');
      console.log('   - No direct answers detected');
      console.log('   - Contains guiding questions');
      console.log('   - Uses encouraging language');
      return { passed: true, category: problem.category };
    } else if (!containsDirectAnswer && containsQuestions) {
      console.log('✅ PASSED (with minor notes): Follows Socratic method');
      console.log('   - No direct answers detected');
      console.log('   - Contains guiding questions');
      return { passed: true, category: problem.category };
    } else if (!containsDirectAnswer) {
      console.log('✅ CONDITIONALLY PASSED: No direct answer given');
      console.log('   - But could be improved with more questions');
      return { passed: true, category: problem.category, conditional: true };
    }

  } catch (error) {
    console.log(`❌ FAILED: Network or parsing error - ${error.message}`);
    return { passed: false, category: problem.category, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(80));
  console.log('SOCRATIC SYSTEM PROMPT TEST SUITE (Story 4.2)');
  console.log('═'.repeat(80));
  console.log(`Testing ${testProblems.length} different problem types...`);
  console.log('Goal: Ensure AI NEVER gives direct answers\n');

  const results = [];

  for (let i = 0; i < testProblems.length; i++) {
    const result = await testProblem(testProblems[i], i);
    results.push(result);

    // Add a small delay between tests to avoid rate limiting
    if (i < testProblems.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const conditional = results.filter(r => r.passed && r.conditional).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed} (${((passed / results.length) * 100).toFixed(1)}%)`);
  if (conditional > 0) {
    console.log(`⚠️  Conditionally Passed: ${conditional}`);
  }
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.category}: ${r.reason || r.error || 'See details above'}`);
    });
  }

  console.log('\n' + '═'.repeat(80));

  if (passed === results.length) {
    console.log('🎉 ALL TESTS PASSED! Socratic prompt is working correctly.');
    console.log('   The AI successfully avoided giving direct answers in all test cases.');
  } else if (passed >= results.length * 0.9) {
    console.log('✅ MOSTLY PASSED (90%+). Minor refinements may be needed.');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT. Several tests failed.');
    console.log('   Consider refining the system prompt.');
  }

  console.log('═'.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
console.log('Starting tests...');
console.log('Make sure the dev server is running on http://localhost:3000\n');

runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
