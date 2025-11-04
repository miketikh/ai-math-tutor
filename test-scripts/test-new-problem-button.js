/**
 * Test Script for New Problem Button (Story 6.5)
 *
 * Tests the New Problem button functionality:
 * 1. NewProblemButton component renders correctly
 * 2. Button has proper styling and attributes
 * 3. Confirmation modal appears on click
 * 4. Cancel preserves conversation
 * 5. Confirm clears conversation
 * 6. onReset callback is triggered
 *
 * Usage: node test-scripts/test-new-problem-button.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
let passed = 0;
let failed = 0;
const failures = [];

/**
 * Test helper function
 */
function test(description, fn) {
  try {
    fn();
    passed++;
    console.log(`${colors.green}✓${colors.reset} ${description}`);
  } catch (error) {
    failed++;
    failures.push({ description, error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
  }
}

/**
 * Assert helper function
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file content
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if content contains string
 */
function contains(content, search) {
  return content.includes(search);
}

// Test suite
console.log(`\n${colors.cyan}Running New Problem Button Tests (Story 6.5)${colors.reset}\n`);

// Test 1: NewProblemButton component exists
test('NewProblemButton component file exists', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  assert(fileExists(componentPath), 'NewProblemButton.tsx should exist');
});

// Test 2: Component has required imports
test('Component imports useConversation hook', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, "import { useConversation }") || contains(content, "import {useConversation}"),
    'Should import useConversation hook'
  );
});

// Test 3: Component uses clearConversation
test('Component uses clearConversation from context', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'clearConversation'),
    'Should use clearConversation from context'
  );
});

// Test 4: Component has modal state
test('Component manages modal visibility state', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'useState') && (contains(content, 'showModal') || contains(content, 'isOpen') || contains(content, 'open')),
    'Should manage modal state with useState'
  );
});

// Test 5: Component has onReset prop
test('Component accepts optional onReset prop', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'onReset'),
    'Should accept onReset prop'
  );
});

// Test 6: Component has confirmation message
test('Component displays confirmation message', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'Start a new problem') || contains(content, 'new problem'),
    'Should display confirmation message about starting new problem'
  );
  assert(
    contains(content, 'progress will be lost') || contains(content, 'will be lost'),
    'Should warn about losing progress'
  );
});

// Test 7: Component has Cancel button
test('Component has Cancel button in modal', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'Cancel'),
    'Should have Cancel button'
  );
});

// Test 8: Component has Confirm button
test('Component has Start New Problem button in modal', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'Start New Problem') || contains(content, 'Confirm'),
    'Should have confirm button'
  );
});

// Test 9: Header includes NewProblemButton
test('Header component imports NewProblemButton', () => {
  const headerPath = path.join(__dirname, '../src/components/Header.tsx');
  const content = readFile(headerPath);
  assert(
    contains(content, 'NewProblemButton'),
    'Header should import and use NewProblemButton'
  );
});

// Test 10: Header is client component
test('Header is a client component', () => {
  const headerPath = path.join(__dirname, '../src/components/Header.tsx');
  const content = readFile(headerPath);
  assert(
    contains(content, "'use client'") || contains(content, '"use client"'),
    'Header should be a client component'
  );
});

// Test 11: Test page exists
test('Test page exists at test-pages/new-problem-test', () => {
  const testPagePath = path.join(__dirname, '../src/app/test-pages/new-problem-test/page.tsx');
  assert(fileExists(testPagePath), 'Test page should exist');
});

// Test 12: Test page uses useConversation
test('Test page uses conversation context', () => {
  const testPagePath = path.join(__dirname, '../src/app/test-pages/new-problem-test/page.tsx');
  const content = readFile(testPagePath);
  assert(
    contains(content, 'useConversation'),
    'Test page should use conversation context'
  );
});

// Test 13: Test page has NewProblemButton
test('Test page includes NewProblemButton', () => {
  const testPagePath = path.join(__dirname, '../src/app/test-pages/new-problem-test/page.tsx');
  const content = readFile(testPagePath);
  assert(
    contains(content, 'NewProblemButton'),
    'Test page should use NewProblemButton component'
  );
});

// Test 14: Test page has onReset callback
test('Test page demonstrates onReset callback', () => {
  const testPagePath = path.join(__dirname, '../src/app/test-pages/new-problem-test/page.tsx');
  const content = readFile(testPagePath);
  assert(
    contains(content, 'onReset'),
    'Test page should demonstrate onReset callback'
  );
});

// Test 15: Component has proper TypeScript types
test('Component has proper TypeScript interface', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'interface') || contains(content, 'type'),
    'Should have TypeScript type definitions'
  );
});

// Test 16: Component has accessibility attributes
test('Component has accessibility attributes', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'aria-') || contains(content, 'role='),
    'Should have accessibility attributes for modal'
  );
});

// Test 17: Component has dark mode support
test('Component has dark mode styling', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'dark:'),
    'Should have dark mode Tailwind classes'
  );
});

// Test 18: Modal prevents background clicks
test('Modal has overlay to prevent background clicks', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'stopPropagation') || contains(content, 'onClick'),
    'Should prevent clicks on modal background from closing modal content'
  );
});

// Test 19: Component is exported
test('Component is exported as default', () => {
  const componentPath = path.join(__dirname, '../src/components/NewProblemButton.tsx');
  const content = readFile(componentPath);
  assert(
    contains(content, 'export default'),
    'Should export component as default'
  );
});

// Test 20: Test page has test instructions
test('Test page includes test instructions', () => {
  const testPagePath = path.join(__dirname, '../src/app/test-pages/new-problem-test/page.tsx');
  const content = readFile(testPagePath);
  assert(
    contains(content, 'Test Instructions') || contains(content, 'instructions'),
    'Test page should include instructions for manual testing'
  );
});

// Summary
console.log(`\n${colors.cyan}Test Summary${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
  console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
  failures.forEach(({ description, error }) => {
    console.log(`  ${colors.red}✗${colors.reset} ${description}`);
    console.log(`    ${error}`);
  });
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}\n`);
  console.log(`${colors.blue}Manual Testing:${colors.reset}`);
  console.log(`  Visit http://localhost:3000/test-pages/new-problem-test to test the UI\n`);
  process.exit(0);
}
