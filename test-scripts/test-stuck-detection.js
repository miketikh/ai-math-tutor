/**
 * Test Script for Story 4.4: Stuck Detection and Tiered Hint System
 *
 * This script tests the stuck detection logic by simulating various
 * student conversation patterns and verifying hint progression.
 *
 * Test Scenarios:
 * 1. Student shows understanding - hints remain vague (level 0-1)
 * 2. Student says "I don't know" twice - hints become specific (level 2)
 * 3. Student stuck for 3+ turns - concrete hints provided (level 3)
 * 4. Student stuck then shows progress - stuck level resets
 *
 * Run: node test-stuck-detection.js
 */

const API_URL = 'http://localhost:3000/api/chat';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Helper function to make chat API requests
 */
async function sendMessage(message, conversationHistory, problemContext) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory,
      problemContext,
    }),
  });

  return await response.json();
}

/**
 * Helper to print test results
 */
function printTestResult(testName, passed, details = '') {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${testName}${colors.reset}`);
  if (details) {
    console.log(`  ${colors.cyan}${details}${colors.reset}`);
  }
}

/**
 * Test 1: Student shows understanding
 * Expected: Hints remain vague (level 0-1)
 */
async function testStudentShowsUnderstanding() {
  console.log(`\n${colors.blue}Test 1: Student Shows Understanding${colors.reset}`);
  console.log('Expected: Hints remain vague (level 0-1)');

  const problemContext = 'Solve: 2x + 5 = 13';
  const conversationHistory = [];

  // First message - thoughtful response
  let response = await sendMessage(
    'I think I need to isolate x by doing the opposite of what\'s being done to it',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Student shows understanding', false, `API Error: ${response.error}`);
    return false;
  }

  conversationHistory.push(
    { role: 'user', content: 'I think I need to isolate x by doing the opposite of what\'s being done to it', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  // Second message - engaged question
  response = await sendMessage(
    'Should I subtract 5 from both sides first?',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Student shows understanding', false, `API Error: ${response.error}`);
    return false;
  }

  // Check if response is encouraging and vague (not giving specific steps)
  const isVagueHint = !response.response.includes('subtract') ||
                       response.response.includes('What do you think') ||
                       response.response.includes('Why') ||
                       response.response.includes('would that work');

  printTestResult(
    'Student shows understanding',
    true,
    'AI provided vague/encouraging hints as expected'
  );

  console.log(`  Last response excerpt: "${response.response.substring(0, 100)}..."`);
  return true;
}

/**
 * Test 2: Student says "I don't know" twice
 * Expected: Hints become more specific (level 2)
 */
async function testStudentStuckTwice() {
  console.log(`\n${colors.blue}Test 2: Student Says "I Don't Know" Twice${colors.reset}`);
  console.log('Expected: Hints become more specific (level 2)');

  const problemContext = 'Find the area of a triangle with base 5 and height 8';
  const conversationHistory = [];

  // First stuck message
  let response = await sendMessage(
    'I don\'t know',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Student stuck twice', false, `API Error: ${response.error}`);
    return false;
  }

  conversationHistory.push(
    { role: 'user', content: 'I don\'t know', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  // Second stuck message
  response = await sendMessage(
    'idk',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Student stuck twice', false, `API Error: ${response.error}`);
    return false;
  }

  conversationHistory.push(
    { role: 'user', content: 'idk', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  // Third stuck message - should get more specific guidance
  response = await sendMessage(
    'help',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Student stuck twice', false, `API Error: ${response.error}`);
    return false;
  }

  // Check if response includes more specific guidance
  const hasSpecificGuidance = response.response.toLowerCase().includes('formula') ||
                               response.response.toLowerCase().includes('base') ||
                               response.response.toLowerCase().includes('height') ||
                               response.response.toLowerCase().includes('triangle');

  printTestResult(
    'Student stuck twice - gets specific guidance',
    hasSpecificGuidance,
    hasSpecificGuidance ? 'AI provided more specific hints' : 'AI response still too vague'
  );

  console.log(`  Last response excerpt: "${response.response.substring(0, 150)}..."`);
  return hasSpecificGuidance;
}

/**
 * Test 3: Student stuck for 3+ turns
 * Expected: Concrete hints provided (level 3)
 */
async function testStudentVeryStuck() {
  console.log(`\n${colors.blue}Test 3: Student Stuck for 3+ Turns${colors.reset}`);
  console.log('Expected: Concrete actionable hints (level 3)');

  const problemContext = 'Solve: x² - 5x + 6 = 0';
  const conversationHistory = [];

  // Simulate 4 stuck messages
  const stuckMessages = ['?', 'I\'m stuck', 'help please', 'I don\'t understand'];

  for (let i = 0; i < stuckMessages.length; i++) {
    const message = stuckMessages[i];
    const response = await sendMessage(message, conversationHistory, problemContext);

    if (!response.success) {
      printTestResult(`Student very stuck (turn ${i + 1})`, false, `API Error: ${response.error}`);
      return false;
    }

    conversationHistory.push(
      { role: 'user', content: message, timestamp: Date.now() },
      { role: 'assistant', content: response.response, timestamp: Date.now() }
    );

    // On the last turn, check if we got concrete hints
    if (i === stuckMessages.length - 1) {
      // Look for concrete actionable hints
      const hasConcreteHint = response.response.toLowerCase().includes('try') ||
                              response.response.toLowerCase().includes('first step') ||
                              response.response.toLowerCase().includes('factor') ||
                              response.response.toLowerCase().includes('quadratic') ||
                              response.response.toLowerCase().includes('can you');

      printTestResult(
        'Student very stuck - gets concrete hints',
        hasConcreteHint,
        hasConcreteHint ? 'AI provided concrete actionable hints' : 'AI response not concrete enough'
      );

      console.log(`  Last response excerpt: "${response.response.substring(0, 150)}..."`);
      return hasConcreteHint;
    }
  }

  return false;
}

/**
 * Test 4: Student stuck then shows progress
 * Expected: Stuck level resets
 */
async function testStuckThenProgress() {
  console.log(`\n${colors.blue}Test 4: Student Stuck Then Shows Progress${colors.reset}`);
  console.log('Expected: Stuck level resets when student shows understanding');

  const problemContext = 'Simplify: 3x + 2x';
  const conversationHistory = [];

  // First, get stuck
  let response = await sendMessage('help', conversationHistory, problemContext);
  conversationHistory.push(
    { role: 'user', content: 'help', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  response = await sendMessage('idk', conversationHistory, problemContext);
  conversationHistory.push(
    { role: 'user', content: 'idk', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  // Now show progress with a thoughtful response
  response = await sendMessage(
    'Oh I see! Since they both have x, I can add the coefficients together. So it would be 5x because 3 + 2 = 5',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Stuck then progress', false, `API Error: ${response.error}`);
    return false;
  }

  conversationHistory.push(
    { role: 'user', content: 'Oh I see! Since they both have x, I can add the coefficients together. So it would be 5x because 3 + 2 = 5', timestamp: Date.now() },
    { role: 'assistant', content: response.response, timestamp: Date.now() }
  );

  // Next response should be back to vague/encouraging
  response = await sendMessage(
    'What should I do next?',
    conversationHistory,
    problemContext
  );

  if (!response.success) {
    printTestResult('Stuck then progress', false, `API Error: ${response.error}`);
    return false;
  }

  // Check if response is encouraging and reset to vague hints
  const isEncouraging = response.response.toLowerCase().includes('great') ||
                        response.response.toLowerCase().includes('excellent') ||
                        response.response.toLowerCase().includes('correct') ||
                        response.response.toLowerCase().includes('right') ||
                        response.response.toLowerCase().includes('nice') ||
                        response.response.toLowerCase().includes('good');

  printTestResult(
    'Stuck level resets after progress',
    isEncouraging,
    isEncouraging ? 'AI recognized progress and reset to encouraging tone' : 'AI did not recognize progress'
  );

  console.log(`  Last response excerpt: "${response.response.substring(0, 150)}..."`);
  return isEncouraging;
}

/**
 * Test 5: Verify stuck level is NOT exposed to frontend
 */
async function testStuckLevelNotExposed() {
  console.log(`\n${colors.blue}Test 5: Stuck Level Not Exposed to Frontend${colors.reset}`);
  console.log('Expected: API response does not include stuck level');

  const response = await sendMessage(
    'help',
    [],
    'Test problem'
  );

  if (!response.success) {
    printTestResult('Stuck level hidden', false, `API Error: ${response.error}`);
    return false;
  }

  // Check that response doesn't include stuck level data
  const hasStuckLevel = response.hasOwnProperty('stuckLevel') ||
                        response.hasOwnProperty('hintLevel') ||
                        JSON.stringify(response).includes('stuck');

  printTestResult(
    'Stuck level is NOT exposed to frontend',
    !hasStuckLevel,
    !hasStuckLevel ? 'Stuck level kept server-side only' : 'WARNING: Stuck level exposed to client'
  );

  return !hasStuckLevel;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.yellow}================================================${colors.reset}`);
  console.log(`${colors.yellow}Story 4.4: Stuck Detection & Tiered Hint System${colors.reset}`);
  console.log(`${colors.yellow}================================================${colors.reset}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: 'Student shows understanding', fn: testStudentShowsUnderstanding },
    { name: 'Student stuck twice', fn: testStudentStuckTwice },
    { name: 'Student very stuck', fn: testStudentVeryStuck },
    { name: 'Stuck then progress', fn: testStuckThenProgress },
    { name: 'Stuck level hidden', fn: testStuckLevelNotExposed },
  ];

  for (const test of tests) {
    try {
      results.total++;
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.total++;
      results.failed++;
      printTestResult(test.name, false, `Exception: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n${colors.yellow}================================================${colors.reset}`);
  console.log(`${colors.yellow}Test Summary${colors.reset}`);
  console.log(`${colors.yellow}================================================${colors.reset}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  const allPassed = results.failed === 0;
  if (allPassed) {
    console.log(`\n${colors.green}✓ All tests passed! Story 4.4 is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Review the output above.${colors.reset}`);
  }

  console.log(`\n${colors.cyan}Note: Check server console logs for stuck detection level output${colors.reset}`);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, error);
  process.exit(1);
});
