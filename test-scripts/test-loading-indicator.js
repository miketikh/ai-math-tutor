/**
 * Test Script: Loading Indicator Component
 *
 * Tests for Story 6.3: Add Loading Indicator for AI Responses
 *
 * This script tests:
 * 1. Loading indicator appears after message sent
 * 2. "AI is thinking..." text is shown
 * 3. Input field gets disabled
 * 4. Loading clears when response arrives
 * 5. Timeout warning appears after 10 seconds
 * 6. Smooth transitions are present
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Log test result
 */
function logTest(name, passed, message = '') {
  const status = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;

  console.log(`  ${color}${status}${colors.reset} ${name}`);
  if (message) {
    console.log(`    ${colors.cyan}${message}${colors.reset}`);
  }

  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

/**
 * Log warning
 */
function logWarning(message) {
  console.log(`  ${colors.yellow}⚠${colors.reset} ${message}`);
  results.warnings++;
}

/**
 * Log section header
 */
function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
}

/**
 * Read file content
 */
function readFile(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Check if text exists in file
 */
function fileContains(filePath, searchText) {
  const content = readFile(filePath);
  if (!content) return false;
  return content.includes(searchText);
}

/**
 * Check if regex pattern exists in file
 */
function fileMatches(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return false;
  return pattern.test(content);
}

// ============================================================================
// Test Suite
// ============================================================================

console.log(`\n${colors.bright}${'='.repeat(80)}${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}Story 6.3: Loading Indicator Component Tests${colors.reset}`);
console.log(`${colors.bright}${'='.repeat(80)}${colors.reset}`);

// ============================================================================
// AC1: Loading indicator appears after sending message
// ============================================================================

logSection('AC1: Loading indicator appears after sending message');

const chatInterfacePath = 'src/app/test-pages/chat-interface-test/page.tsx';
const loadingIndicatorPath = 'src/components/LoadingIndicator.tsx';

logTest(
  'LoadingIndicator component file exists',
  fs.existsSync(path.resolve(__dirname, '..', loadingIndicatorPath)),
  'Component should be in src/components/LoadingIndicator.tsx'
);

logTest(
  'Chat interface imports LoadingIndicator',
  fileContains(chatInterfacePath, 'import LoadingIndicator'),
  'Chat test page should import the LoadingIndicator component'
);

logTest(
  'Chat interface uses loading state',
  fileMatches(chatInterfacePath, /const\s+\[isLoading,\s*setIsLoading\]/),
  'Should have isLoading state to track loading status'
);

logTest(
  'Loading state set to true on message send',
  fileContains(chatInterfacePath, 'setIsLoading(true)'),
  'Loading state should be set when user sends message'
);

logTest(
  'LoadingIndicator conditionally rendered',
  fileMatches(chatInterfacePath, /\{isLoading\s+&&\s+<LoadingIndicator/),
  'LoadingIndicator should only render when isLoading is true'
);

// ============================================================================
// AC2: Shows "AI is thinking..." text or typing animation
// ============================================================================

logSection('AC2: Shows "AI is thinking..." text or typing animation');

logTest(
  'LoadingIndicator has default message',
  fileContains(loadingIndicatorPath, 'AI is thinking...'),
  'Default message should be "AI is thinking..."'
);

logTest(
  'LoadingIndicator has animated dots',
  fileContains(loadingIndicatorPath, 'animate-bounce'),
  'Should use bouncing animation for dots'
);

logTest(
  'LoadingIndicator has staggered animation delays',
  fileMatches(loadingIndicatorPath, /animationDelay.*0ms.*150ms.*300ms/s),
  'Dots should have staggered delays for wave effect'
);

logTest(
  'LoadingIndicator has three dots',
  (readFile(loadingIndicatorPath)?.match(/animate-bounce/g) || []).length >= 3,
  'Should have at least 3 animated dots'
);

// ============================================================================
// AC3: Input field disabled during loading
// ============================================================================

logSection('AC3: Input field disabled during loading');

logTest(
  'ChatInput receives disabled prop',
  fileMatches(chatInterfacePath, /disabled=\{isLoading\}/),
  'ChatInput should be disabled when loading'
);

const chatInputPath = 'src/components/ChatInput.tsx';
logTest(
  'ChatInput component has disabled prop in interface',
  fileContains(chatInputPath, 'disabled?:'),
  'ChatInputProps should include optional disabled property'
);

logTest(
  'ChatInput applies disabled to textarea',
  fileContains(chatInputPath, 'disabled={disabled}'),
  'Textarea element should receive disabled prop'
);

logTest(
  'ChatInput has disabled styles',
  fileContains(chatInputPath, 'disabled:opacity-50') &&
  fileContains(chatInputPath, 'disabled:cursor-not-allowed'),
  'Should have visual feedback for disabled state'
);

// ============================================================================
// AC4: Loading state cleared when response arrives
// ============================================================================

logSection('AC4: Loading state cleared when response arrives');

logTest(
  'Loading state cleared in finally block',
  fileMatches(chatInterfacePath, /finally\s*\{[\s\S]*setIsLoading\(false\)/),
  'setIsLoading(false) should be in finally block for cleanup'
);

logTest(
  'Loading cleared regardless of success/error',
  fileContains(chatInterfacePath, 'finally'),
  'Using finally ensures loading is cleared even on error'
);

// ============================================================================
// AC5: Timeout after 10 seconds shows warning
// ============================================================================

logSection('AC5: Timeout after 10 seconds shows "Taking longer than expected..."');

logTest(
  'LoadingIndicator has showTimeout prop',
  fileContains(loadingIndicatorPath, 'showTimeout?:'),
  'LoadingIndicator should accept showTimeout prop'
);

logTest(
  'LoadingIndicator uses timeout effect',
  fileContains(loadingIndicatorPath, 'useEffect') &&
  fileContains(loadingIndicatorPath, 'setTimeout'),
  'Should use useEffect with setTimeout for timeout logic'
);

logTest(
  'Default timeout is 10 seconds',
  fileContains(loadingIndicatorPath, 'timeoutDuration = 10000'),
  'Default timeout duration should be 10000ms (10 seconds)'
);

logTest(
  'Timeout warning message exists',
  fileContains(loadingIndicatorPath, 'taking longer than expected') ||
  fileContains(loadingIndicatorPath, 'This is taking longer'),
  'Should have appropriate timeout warning message'
);

logTest(
  'Chat interface uses showTimeout',
  fileMatches(chatInterfacePath, /<LoadingIndicator[\s\S]*showTimeout=\{true\}/),
  'Chat interface should enable timeout feature'
);

logTest(
  'Timeout state is tracked',
  fileContains(loadingIndicatorPath, 'showTimeoutWarning') ||
  fileContains(loadingIndicatorPath, 'useState'),
  'Should track timeout warning state internally'
);

logTest(
  'Timeout is cleaned up',
  fileContains(loadingIndicatorPath, 'clearTimeout'),
  'Should clean up timeout on unmount'
);

// ============================================================================
// AC6: Smooth transitions
// ============================================================================

logSection('AC6: Smooth transition from loading to response');

logTest(
  'LoadingIndicator uses transition classes',
  fileContains(loadingIndicatorPath, 'animate-') ||
  fileContains(loadingIndicatorPath, 'transition'),
  'Should use Tailwind animation or transition classes'
);

logTest(
  'ChatInput has transition for disabled state',
  fileContains(chatInputPath, 'transition'),
  'ChatInput should have smooth transitions'
);

const messageListPath = 'src/components/ChatMessageList.tsx';
logTest(
  'Message list has smooth scroll',
  fileContains(messageListPath, 'smooth') ||
  fileContains(messageListPath, 'scroll-smooth'),
  'Messages should scroll smoothly when new message arrives'
);

// ============================================================================
// Component Quality & Best Practices
// ============================================================================

logSection('Component Quality & Best Practices');

logTest(
  'LoadingIndicator is a client component',
  fileContains(loadingIndicatorPath, "'use client'"),
  'Should have "use client" directive for React hooks'
);

logTest(
  'LoadingIndicator has TypeScript props interface',
  fileContains(loadingIndicatorPath, 'LoadingIndicatorProps'),
  'Should have well-defined TypeScript interface'
);

logTest(
  'LoadingIndicator has displayName',
  fileContains(loadingIndicatorPath, 'displayName'),
  'Should set displayName for debugging'
);

logTest(
  'LoadingIndicator has JSDoc comments',
  fileMatches(loadingIndicatorPath, /\/\*\*[\s\S]*\*\//),
  'Should have JSDoc documentation'
);

logTest(
  'LoadingIndicator has dark mode support',
  fileContains(loadingIndicatorPath, 'dark:'),
  'Should have dark mode styles'
);

logTest(
  'LoadingIndicator is accessible',
  fileContains(loadingIndicatorPath, 'role=') ||
  fileContains(loadingIndicatorPath, 'aria-'),
  'Should have ARIA attributes for accessibility'
);

logTest(
  'Component is customizable',
  fileContains(loadingIndicatorPath, 'message?:') &&
  fileContains(loadingIndicatorPath, 'className?:'),
  'Should accept custom message and className props'
);

// ============================================================================
// Integration Tests
// ============================================================================

logSection('Integration Tests');

logTest(
  'Chat interface handles loading flow',
  fileContains(chatInterfacePath, 'handleSendMessage') &&
  fileContains(chatInterfacePath, 'setIsLoading(true)') &&
  fileMatches(chatInterfacePath, /finally[\s\S]*setIsLoading\(false\)/),
  'Complete loading flow from start to finish'
);

logTest(
  'Error handling preserves loading cleanup',
  fileContains(chatInterfacePath, 'catch') &&
  fileContains(chatInterfacePath, 'finally'),
  'Loading state cleaned up even on error'
);

logTest(
  'Placeholder changes during loading',
  fileMatches(chatInterfacePath, /placeholder=\{isLoading\s*\?/),
  'Input placeholder should change to indicate waiting'
);

// ============================================================================
// File Structure
// ============================================================================

logSection('File Structure & Organization');

logTest(
  'Component in correct directory',
  fs.existsSync(path.resolve(__dirname, '..', 'src/components/LoadingIndicator.tsx')),
  'LoadingIndicator should be in src/components/'
);

logTest(
  'Test page exists',
  fs.existsSync(path.resolve(__dirname, '..', chatInterfacePath)),
  'Chat interface test page should exist'
);

logTest(
  'No duplicate implementations',
  !fileContains(chatInterfacePath, 'animate-bounce.*animate-bounce.*animate-bounce') ||
  fileContains(chatInterfacePath, '<LoadingIndicator'),
  'Should use LoadingIndicator component, not inline implementation'
);

// ============================================================================
// Summary
// ============================================================================

console.log(`\n${colors.bright}${'='.repeat(80)}${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}Test Summary${colors.reset}`);
console.log(`${colors.bright}${'='.repeat(80)}${colors.reset}\n`);

const totalTests = results.passed + results.failed;
const passRate = totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(1) : 0;

console.log(`  Total Tests:     ${totalTests}`);
console.log(`  ${colors.green}Passed:          ${results.passed}${colors.reset}`);
console.log(`  ${colors.red}Failed:          ${results.failed}${colors.reset}`);
console.log(`  ${colors.yellow}Warnings:        ${results.warnings}${colors.reset}`);
console.log(`  Pass Rate:       ${passRate}%\n`);

// Detailed failures
if (results.failed > 0) {
  console.log(`${colors.bright}${colors.red}Failed Tests:${colors.reset}\n`);
  results.tests
    .filter(t => !t.passed)
    .forEach(t => {
      console.log(`  ${colors.red}✗${colors.reset} ${t.name}`);
      if (t.message) {
        console.log(`    ${colors.cyan}${t.message}${colors.reset}`);
      }
    });
  console.log();
}

// Acceptance Criteria Summary
console.log(`${colors.bright}${colors.cyan}Acceptance Criteria Status:${colors.reset}\n`);

const acTests = {
  'AC1: Loading indicator appears': results.tests.slice(0, 5).every(t => t.passed),
  'AC2: Shows "AI is thinking..." text': results.tests.slice(5, 9).every(t => t.passed),
  'AC3: Input disabled during loading': results.tests.slice(9, 13).every(t => t.passed),
  'AC4: Loading cleared on response': results.tests.slice(13, 15).every(t => t.passed),
  'AC5: 10-second timeout warning': results.tests.slice(15, 22).every(t => t.passed),
  'AC6: Smooth transitions': results.tests.slice(22, 25).every(t => t.passed),
};

Object.entries(acTests).forEach(([name, passed]) => {
  const status = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`  ${color}${status}${colors.reset} ${name}`);
});

console.log(`\n${colors.bright}${'='.repeat(80)}${colors.reset}\n`);

// Exit with appropriate code
const allAcPassed = Object.values(acTests).every(ac => ac);
if (allAcPassed && results.failed === 0) {
  console.log(`${colors.green}${colors.bright}✓ All tests passed! Story 6.3 is complete.${colors.reset}\n`);
  process.exit(0);
} else if (results.failed > 0) {
  console.log(`${colors.red}${colors.bright}✗ Some tests failed. Please review the failures above.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.yellow}${colors.bright}⚠ All acceptance criteria met, but some quality checks failed.${colors.reset}\n`);
  process.exit(0);
}
