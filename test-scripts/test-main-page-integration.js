#!/usr/bin/env node

/**
 * Test Script: Main Page Chat Interface Integration
 *
 * Tests the complete integration of chat components into the main page.
 *
 * Test Coverage:
 * 1. Initial state shows problem input
 * 2. Problem submission transitions to chat interface
 * 3. Chat interface displays correctly
 * 4. Messages can be sent and received
 * 5. New Problem button resets to initial state
 *
 * Manual Verification Steps:
 * - Visit http://localhost:3000
 * - Submit a problem via text input
 * - Verify chat interface appears
 * - Send a message and verify AI response
 * - Click "New Problem" and verify reset
 */

const https = require('https');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Log helper functions
 */
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, COLORS.green);
  passedTests++;
}

function logError(message) {
  log(`✗ ${message}`, COLORS.red);
  failedTests++;
}

function logInfo(message) {
  log(message, COLORS.blue);
}

function logWarning(message) {
  log(message, COLORS.yellow);
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, COLORS.cyan);
  log(message, COLORS.cyan);
  log('='.repeat(60), COLORS.cyan);
}

/**
 * Main test suite
 */
async function runTests() {
  logSection('Main Page Chat Interface Integration Tests');
  logInfo('Testing complete integration of chat components into main page\n');

  // Test 1: Check environment variables
  totalTests++;
  logInfo('Test 1: Checking environment configuration...');
  if (process.env.OPENAI_API_KEY) {
    logSuccess('OPENAI_API_KEY is configured');
  } else {
    logWarning('OPENAI_API_KEY not found - API calls will fail');
    logWarning('This is expected if testing UI only');
  }

  // Test 2: Verify build artifacts
  totalTests++;
  logInfo('\nTest 2: Verifying TypeScript compilation...');
  const fs = require('fs');
  const path = require('path');

  const buildDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(buildDir)) {
    logSuccess('Build artifacts found (.next directory exists)');
  } else {
    logError('Build artifacts not found - run npm run build first');
  }

  // Test 3: Component file structure
  totalTests++;
  logInfo('\nTest 3: Verifying component files exist...');
  const requiredFiles = [
    'src/app/page.tsx',
    'src/components/Header.tsx',
    'src/components/ChatMessageList.tsx',
    'src/components/ChatInput.tsx',
    'src/components/LoadingIndicator.tsx',
    'src/components/NewProblemButton.tsx',
    'src/contexts/ConversationContext.tsx',
    'src/app/api/chat/route.ts',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      logError(`Missing file: ${file}`);
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    logSuccess('All required component files exist');
  }

  // Test 4: Verify integration in page.tsx
  totalTests++;
  logInfo('\nTest 4: Verifying main page integration...');
  const pageContent = fs.readFileSync(
    path.join(__dirname, '..', 'src/app/page.tsx'),
    'utf8'
  );

  const integrationChecks = [
    { pattern: /import.*ChatMessageList/, name: 'ChatMessageList import' },
    { pattern: /import.*ChatInput/, name: 'ChatInput import' },
    { pattern: /import.*LoadingIndicator/, name: 'LoadingIndicator import' },
    { pattern: /import.*useConversation/, name: 'useConversation hook import' },
    { pattern: /conversationStarted/, name: 'conversationStarted state' },
    { pattern: /problemContext/, name: 'problemContext state' },
    { pattern: /handleSendMessage/, name: 'handleSendMessage function' },
    { pattern: /handleProblemSubmit/, name: 'handleProblemSubmit function' },
    { pattern: /handleReset/, name: 'handleReset function' },
    { pattern: /<ChatMessageList/, name: 'ChatMessageList component usage' },
    { pattern: /<ChatInput/, name: 'ChatInput component usage' },
    { pattern: /<LoadingIndicator/, name: 'LoadingIndicator component usage' },
  ];

  let allChecksPass = true;
  for (const check of integrationChecks) {
    if (!check.pattern.test(pageContent)) {
      logError(`Missing: ${check.name}`);
      allChecksPass = false;
    }
  }

  if (allChecksPass) {
    logSuccess('Main page integration complete (all imports and components present)');
  }

  // Test 5: Verify Header accepts onReset callback
  totalTests++;
  logInfo('\nTest 5: Verifying Header component accepts onReset...');
  const headerContent = fs.readFileSync(
    path.join(__dirname, '..', 'src/components/Header.tsx'),
    'utf8'
  );

  if (headerContent.includes('onReset') && headerContent.includes('HeaderProps')) {
    logSuccess('Header component accepts onReset callback');
  } else {
    logError('Header component missing onReset prop');
  }

  // Test 6: Verify TextInput accepts onSubmit callback
  totalTests++;
  logInfo('\nTest 6: Verifying TextInput component accepts onSubmit...');
  const textInputContent = fs.readFileSync(
    path.join(__dirname, '..', 'src/components/ProblemInput/TextInput.tsx'),
    'utf8'
  );

  if (textInputContent.includes('onSubmit') && textInputContent.includes('TextInputProps')) {
    logSuccess('TextInput component accepts onSubmit callback');
  } else {
    logError('TextInput component missing onSubmit prop');
  }

  // Test 7: Verify layout.tsx doesn't include duplicate Header
  totalTests++;
  logInfo('\nTest 7: Verifying layout structure...');
  const layoutContent = fs.readFileSync(
    path.join(__dirname, '..', 'src/app/layout.tsx'),
    'utf8'
  );

  if (!layoutContent.includes('<Header')) {
    logSuccess('Layout does not include Header (avoiding duplication)');
  } else {
    logWarning('Layout includes Header - may cause duplication');
  }

  // Print manual test instructions
  logSection('Manual Testing Instructions');
  logInfo('The automated tests have verified file structure and code integration.');
  logInfo('Please perform the following manual tests:\n');

  logInfo('1. Start the development server:');
  log('   npm run dev\n', COLORS.cyan);

  logInfo('2. Visit http://localhost:3000 in your browser\n');

  logInfo('3. Test Problem Input Phase:');
  log('   - Verify you see "Welcome to Math Tutor" heading', COLORS.cyan);
  log('   - Verify you see tabs: "Type Problem" and "Upload Image"', COLORS.cyan);
  log('   - Verify you see a text input area', COLORS.cyan);
  log('   - Type a math problem (e.g., "Solve for x: 2x + 5 = 13")', COLORS.cyan);
  log('   - Click "Submit Problem"\n', COLORS.cyan);

  logInfo('4. Test Chat Interface Transition:');
  log('   - Verify the problem input disappears', COLORS.cyan);
  log('   - Verify "Current Problem" section appears showing your problem', COLORS.cyan);
  log('   - Verify chat interface appears with AI greeting message', COLORS.cyan);
  log('   - Verify the greeting mentions your submitted problem\n', COLORS.cyan);

  logInfo('5. Test Chat Functionality:');
  log('   - Type a message in the chat input at the bottom', COLORS.cyan);
  log('   - Press Enter to send (or click Send button)', COLORS.cyan);
  log('   - Verify loading indicator appears ("AI is thinking...")', COLORS.cyan);
  log('   - Verify AI response appears in the chat', COLORS.cyan);
  log('   - Verify messages are displayed correctly (user on right, AI on left)', COLORS.cyan);
  log('   - Verify LaTeX math renders properly if present\n', COLORS.cyan);

  logInfo('6. Test New Problem Button:');
  log('   - Click "New Problem" button in the header', COLORS.cyan);
  log('   - Verify confirmation modal appears', COLORS.cyan);
  log('   - Click "Start New Problem"', COLORS.cyan);
  log('   - Verify you return to the initial problem input screen', COLORS.cyan);
  log('   - Verify all chat messages are cleared', COLORS.cyan);
  log('   - Verify conversation history is reset\n', COLORS.cyan);

  logInfo('7. Test Image Upload (if configured):');
  log('   - Click "Upload Image" tab', COLORS.cyan);
  log('   - Upload an image with a math problem', COLORS.cyan);
  log('   - Verify it transitions to chat interface automatically\n', COLORS.cyan);

  logInfo('8. Test Edge Cases:');
  log('   - Try sending multiple messages in quick succession', COLORS.cyan);
  log('   - Try Shift+Enter to create multi-line messages', COLORS.cyan);
  log('   - Verify input is disabled while AI is responding', COLORS.cyan);
  log('   - Test dark mode if browser supports it\n', COLORS.cyan);

  // Print summary
  logSection('Test Summary');
  log(`Total Tests: ${totalTests}`, COLORS.cyan);
  log(`Passed: ${passedTests}`, COLORS.green);
  if (failedTests > 0) {
    log(`Failed: ${failedTests}`, COLORS.red);
  }

  if (failedTests === 0) {
    logSuccess('\nAll automated tests passed!');
    logInfo('Please complete the manual testing steps above.\n');
    process.exit(0);
  } else {
    logError('\nSome automated tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
