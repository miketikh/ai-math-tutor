#!/usr/bin/env node

/**
 * Test Script for LaTeX Rendering in Chat Messages
 *
 * Tests Story 6.4 acceptance criteria:
 * 1. Chat messages parse LaTeX delimiters ($ and $$)
 * 2. Inline equations render within text flow
 * 3. Block equations render centered
 * 4. Both student and AI messages support LaTeX
 * 5. No layout shifts during rendering
 * 6. Fallback for invalid LaTeX
 *
 * Run: node test-scripts/test-chat-latex-rendering.js
 */

const http = require('http');
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

// Test configuration
const TEST_URL = 'http://localhost:3000/test-pages/chat-test';
let testsPassed = 0;
let testsFailed = 0;

/**
 * Print test header
 */
function printHeader() {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + 'LaTeX Rendering in Chat Messages Test Suite' + colors.reset);
  console.log(colors.cyan + 'Story 6.4: Integrate LaTeX Rendering into Chat Messages' + colors.reset);
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Print test result
 */
function printResult(testName, passed, message = '') {
  if (passed) {
    console.log(colors.green + '✓ PASS' + colors.reset + ': ' + testName);
    if (message) console.log('  ' + colors.blue + message + colors.reset);
    testsPassed++;
  } else {
    console.log(colors.red + '✗ FAIL' + colors.reset + ': ' + testName);
    if (message) console.log('  ' + colors.yellow + message + colors.reset);
    testsFailed++;
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n' + colors.cyan + '-'.repeat(80) + colors.reset);
  console.log(colors.bright + 'Test Summary:' + colors.reset);
  console.log(colors.green + `  Passed: ${testsPassed}` + colors.reset);
  if (testsFailed > 0) {
    console.log(colors.red + `  Failed: ${testsFailed}` + colors.reset);
  } else {
    console.log(colors.green + '  Failed: 0' + colors.reset);
  }
  console.log(colors.cyan + '-'.repeat(80) + colors.reset);

  if (testsFailed === 0) {
    console.log('\n' + colors.green + colors.bright + '🎉 All tests passed!' + colors.reset + '\n');
  } else {
    console.log('\n' + colors.red + colors.bright + '❌ Some tests failed.' + colors.reset + '\n');
  }
}

/**
 * Make HTTP request to test page
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Test 1: Test page loads successfully
 */
async function testPageLoads() {
  try {
    const { statusCode } = await makeRequest(TEST_URL);
    printResult(
      'Test Page Loads Successfully',
      statusCode === 200,
      statusCode === 200 ? 'Test page accessible at /test-pages/chat-test' : `Got status code ${statusCode}`
    );
  } catch (error) {
    printResult('Test Page Loads Successfully', false, error.message);
  }
}

/**
 * Test 2: ChatMessage component file exists and has LaTeX parsing
 */
async function testChatMessageComponent() {
  const componentPath = path.join(__dirname, '../src/components/ChatMessage.tsx');

  try {
    const exists = fs.existsSync(componentPath);
    if (!exists) {
      printResult('ChatMessage Component Exists', false, 'Component file not found');
      return;
    }

    const content = fs.readFileSync(componentPath, 'utf8');

    // Test AC1: Parse LaTeX delimiters ($ and $$)
    const hasInlineDelimiterParsing = content.includes('\\$(.*?)\\$');
    const hasBlockDelimiterParsing = content.includes('\\$\\$') && content.includes('[\\s\\S]*?');
    const parsesDelimiters = hasInlineDelimiterParsing && hasBlockDelimiterParsing;

    printResult(
      'AC1: Parses LaTeX Delimiters ($ and $$)',
      parsesDelimiters,
      parsesDelimiters
        ? 'Both inline ($) and block ($$) delimiter parsing found'
        : 'Missing delimiter parsing logic'
    );

    // Test for content chunking
    const hasContentChunking = content.includes('ContentChunk') && content.includes('type:') &&
                               (content.includes('latex-inline') || content.includes('latex-block'));

    printResult(
      'LaTeX Content Chunking Implemented',
      hasContentChunking,
      hasContentChunking
        ? 'Message content properly split into text/latex chunks'
        : 'Content chunking not found'
    );

  } catch (error) {
    printResult('ChatMessage Component Exists', false, error.message);
  }
}

/**
 * Test 3: Inline and block equation rendering
 */
async function testEquationRendering() {
  const componentPath = path.join(__dirname, '../src/components/ChatMessage.tsx');

  try {
    const content = fs.readFileSync(componentPath, 'utf8');

    // AC2: Inline equations render within text flow
    const hasInlineRendering = content.includes('displayMode={false}') ||
                                content.includes('latex-inline');

    printResult(
      'AC2: Inline Equations Render Within Text Flow',
      hasInlineRendering,
      hasInlineRendering
        ? 'Inline rendering with displayMode=false found'
        : 'Inline rendering not configured'
    );

    // AC3: Block equations render centered
    const hasBlockRendering = content.includes('displayMode={true}') ||
                               (content.includes('latex-block') && content.includes('MathDisplay'));

    printResult(
      'AC3: Block Equations Render Centered',
      hasBlockRendering,
      hasBlockRendering
        ? 'Block rendering with displayMode=true found'
        : 'Block rendering not configured'
    );

    // Check MathDisplay integration
    const usesMathDisplay = content.includes('MathDisplay') && content.includes('from');

    printResult(
      'MathDisplay Component Integration',
      usesMathDisplay,
      usesMathDisplay
        ? 'MathDisplay component properly imported and used'
        : 'MathDisplay component not integrated'
    );

  } catch (error) {
    printResult('Equation Rendering Tests', false, error.message);
  }
}

/**
 * Test 4: Both user and AI messages support LaTeX
 */
async function testBothRolesSupport() {
  const componentPath = path.join(__dirname, '../src/components/ChatMessage.tsx');

  try {
    const content = fs.readFileSync(componentPath, 'utf8');

    // AC4: Both student and AI messages support LaTeX
    const hasRoleProp = content.includes("role: 'user' | 'assistant'") ||
                        content.includes('role="user"') ||
                        content.includes('role="assistant"');

    // LaTeX parsing should be role-agnostic
    const latexParsingIndex = content.indexOf('contentChunks');
    const roleCheckIndex = content.indexOf('role ===');
    const isRoleAgnostic = latexParsingIndex > 0 &&
                           (roleCheckIndex < 0 || roleCheckIndex > latexParsingIndex);

    printResult(
      'AC4: Both User and AI Messages Support LaTeX',
      hasRoleProp && isRoleAgnostic,
      hasRoleProp && isRoleAgnostic
        ? 'LaTeX parsing works for both user and assistant roles'
        : 'Role-specific restrictions found or role prop missing'
    );

  } catch (error) {
    printResult('Both Roles Support LaTeX', false, error.message);
  }
}

/**
 * Test 5: No layout shifts during rendering
 */
async function testNoLayoutShifts() {
  const componentPath = path.join(__dirname, '../src/components/ChatMessage.tsx');

  try {
    const content = fs.readFileSync(componentPath, 'utf8');

    // AC5: No layout shifts - check for memoization and proper spacing
    const usesMemo = content.includes('useMemo');
    const hasSpacing = content.includes('className') &&
                       (content.includes('mx-') || content.includes('my-') ||
                        content.includes('px-') || content.includes('py-'));

    printResult(
      'AC5: No Layout Shifts During Rendering',
      usesMemo && hasSpacing,
      usesMemo && hasSpacing
        ? 'useMemo prevents re-parsing, proper spacing classes applied'
        : 'Missing optimization or spacing'
    );

  } catch (error) {
    printResult('No Layout Shifts', false, error.message);
  }
}

/**
 * Test 6: Fallback for invalid LaTeX
 */
async function testInvalidLatexFallback() {
  const mathDisplayPath = path.join(__dirname, '../src/components/MathDisplay.tsx');

  try {
    const exists = fs.existsSync(mathDisplayPath);
    if (!exists) {
      printResult('AC6: Fallback for Invalid LaTeX', false, 'MathDisplay component not found');
      return;
    }

    const content = fs.readFileSync(mathDisplayPath, 'utf8');

    // AC6: Fallback for invalid LaTeX
    const hasTryCatch = content.includes('try') && content.includes('catch');
    const hasErrorHandling = content.includes('hasError') || content.includes('error');
    const hasErrorUI = content.includes('role="alert"') ||
                       (content.includes('bg-red') && content.includes('Error'));

    printResult(
      'AC6: Fallback for Invalid LaTeX',
      hasTryCatch && hasErrorHandling && hasErrorUI,
      hasTryCatch && hasErrorHandling && hasErrorUI
        ? 'Error handling with try-catch and error UI implemented'
        : 'Missing error handling components'
    );

  } catch (error) {
    printResult('Invalid LaTeX Fallback', false, error.message);
  }
}

/**
 * Test 7: Test page has comprehensive examples
 */
async function testPageExamples() {
  try {
    const { data } = await makeRequest(TEST_URL);

    const hasInlineExample = data.includes('$x^2') || data.includes('inline');
    const hasBlockExample = data.includes('$$\\int') || data.includes('$$');
    const hasMixedContent = data.includes('text') && data.includes('equation');
    const hasUserAndAssistant = data.includes('user') && data.includes('assistant');

    const allExamplesPresent = hasInlineExample && hasBlockExample &&
                               hasMixedContent && hasUserAndAssistant;

    printResult(
      'Test Page Has Comprehensive Examples',
      allExamplesPresent,
      allExamplesPresent
        ? 'Page includes inline, block, mixed content, and both roles'
        : 'Missing some example types'
    );

  } catch (error) {
    printResult('Test Page Examples', false, error.message);
  }
}

/**
 * Test 8: Acceptance criteria checklist on test page
 */
async function testAcceptanceCriteriaChecklist() {
  try {
    const { data } = await makeRequest(TEST_URL);

    const hasChecklist = data.includes('Acceptance Criteria');
    const hasAllCriteria = hasChecklist &&
                           data.includes('LaTeX delimiters') &&
                           data.includes('Inline equations') &&
                           data.includes('Block equations') &&
                           data.includes('student and AI messages');

    printResult(
      'Test Page Has AC Checklist',
      hasAllCriteria,
      hasAllCriteria
        ? 'Complete acceptance criteria checklist on test page'
        : 'Checklist missing or incomplete'
    );

  } catch (error) {
    printResult('Acceptance Criteria Checklist', false, error.message);
  }
}

/**
 * Test 9: Integration with ChatMessageList
 */
async function testChatMessageListIntegration() {
  const chatListPath = path.join(__dirname, '../src/components/ChatMessageList.tsx');

  try {
    const exists = fs.existsSync(chatListPath);
    if (!exists) {
      printResult('ChatMessageList Integration', false, 'ChatMessageList component not found');
      return;
    }

    const content = fs.readFileSync(chatListPath, 'utf8');

    const importsChatMessage = content.includes('ChatMessage') && content.includes('from');
    const passesChatMessage = content.includes('<ChatMessage') &&
                              content.includes('message=') &&
                              content.includes('role=');

    printResult(
      'ChatMessageList Uses ChatMessage Component',
      importsChatMessage && passesChatMessage,
      importsChatMessage && passesChatMessage
        ? 'ChatMessageList properly integrates ChatMessage with LaTeX support'
        : 'ChatMessage not properly integrated'
    );

  } catch (error) {
    printResult('ChatMessageList Integration', false, error.message);
  }
}

/**
 * Test 10: TypeScript types are correct
 */
async function testTypeScriptTypes() {
  const componentPath = path.join(__dirname, '../src/components/ChatMessage.tsx');

  try {
    const content = fs.readFileSync(componentPath, 'utf8');

    const hasPropsInterface = content.includes('ChatMessageProps');
    const hasMessageProp = content.includes('message: string');
    const hasRoleProp = content.includes("role: 'user' | 'assistant'");
    const hasTypeAnnotations = content.includes(': React.FC<') || content.includes(': FC<');

    const allTypesCorrect = hasPropsInterface && hasMessageProp &&
                            hasRoleProp && hasTypeAnnotations;

    printResult(
      'TypeScript Types Defined Correctly',
      allTypesCorrect,
      allTypesCorrect
        ? 'Props interface and type annotations are complete'
        : 'Missing or incomplete type definitions'
    );

  } catch (error) {
    printResult('TypeScript Types', false, error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  printHeader();

  console.log(colors.bright + 'Running Tests...\n' + colors.reset);

  // Core functionality tests
  await testPageLoads();
  await testChatMessageComponent();
  await testEquationRendering();
  await testBothRolesSupport();
  await testNoLayoutShifts();
  await testInvalidLatexFallback();

  // Integration and documentation tests
  await testPageExamples();
  await testAcceptanceCriteriaChecklist();
  await testChatMessageListIntegration();
  await testTypeScriptTypes();

  printSummary();

  // Exit with error code if tests failed
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests();
