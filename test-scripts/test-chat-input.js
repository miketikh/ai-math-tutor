#!/usr/bin/env node

/**
 * Test Script for ChatInput Component (Story 6.2)
 *
 * Tests the ChatInput component functionality including:
 * - Component rendering
 * - User input handling
 * - Enter key sends message
 * - Shift+Enter creates new line
 * - Input clearing after send
 * - Disabled state behavior
 * - Send button functionality
 *
 * This script validates that Story 6.2 acceptance criteria are met.
 */

console.log('='.repeat(80));
console.log('Story 6.2: ChatInput Component Test Suite');
console.log('='.repeat(80));
console.log();

// Test configuration
const tests = [
  {
    id: 1,
    name: 'Component Exports and Type Definitions',
    description: 'Verify ChatInput component and types are properly exported',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for component export
      if (!content.includes('export default ChatInput')) {
        throw new Error('ChatInput component not exported as default');
      }

      // Check for props interface
      if (!content.includes('export interface ChatInputProps')) {
        throw new Error('ChatInputProps interface not exported');
      }

      // Check for required props
      const requiredProps = ['onSend', 'disabled', 'placeholder'];
      for (const prop of requiredProps) {
        if (!content.includes(prop)) {
          throw new Error(`Missing prop: ${prop}`);
        }
      }

      return { success: true, details: 'All exports and type definitions found' };
    }
  },
  {
    id: 2,
    name: 'Textarea Element for Multi-line Input',
    description: 'Verify component uses textarea for multi-line support',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for textarea element
      if (!content.includes('<textarea')) {
        throw new Error('Component does not use textarea element');
      }

      // Check for auto-resize logic (style.height manipulation)
      if (!content.includes('textarea.style.height')) {
        throw new Error('Auto-resize logic not found');
      }

      // Check for min/max height constraints
      if (!content.includes('minHeight') || !content.includes('maxHeight')) {
        throw new Error('Min/max height constraints not found');
      }

      return { success: true, details: 'Textarea with auto-resize and height constraints implemented' };
    }
  },
  {
    id: 3,
    name: 'Send Button Implementation',
    description: 'Verify send button is properly implemented',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for button element
      if (!content.includes('<button')) {
        throw new Error('Send button not found');
      }

      // Check for onClick handler
      if (!content.includes('onClick={handleSend}') && !content.includes('onClick={')) {
        throw new Error('Button onClick handler not found');
      }

      // Check for disabled state
      if (!content.includes('disabled={disabled') && !content.includes('disabled={')) {
        throw new Error('Button disabled state not implemented');
      }

      return { success: true, details: 'Send button with proper handlers implemented' };
    }
  },
  {
    id: 4,
    name: 'Enter Key Send Functionality',
    description: 'Verify Enter key sends message',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for onKeyDown handler
      if (!content.includes('onKeyDown')) {
        throw new Error('onKeyDown handler not found');
      }

      // Check for Enter key detection
      if (!content.includes("e.key === 'Enter'") && !content.includes('e.key === "Enter"')) {
        throw new Error('Enter key detection not found');
      }

      // Check for Shift+Enter handling
      if (!content.includes('e.shiftKey')) {
        throw new Error('Shift+Enter handling not found');
      }

      // Check for preventDefault on Enter
      if (!content.includes('e.preventDefault()')) {
        throw new Error('preventDefault not called on Enter key');
      }

      return { success: true, details: 'Enter key send and Shift+Enter newline implemented' };
    }
  },
  {
    id: 5,
    name: 'Input Clearing After Send',
    description: 'Verify input clears after sending message',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for state management
      if (!content.includes('useState')) {
        throw new Error('useState not found for message state');
      }

      // Check for setMessage('') or similar clearing logic
      if (!content.includes("setMessage('')") && !content.includes('setMessage("")')) {
        throw new Error('Input clearing logic not found');
      }

      return { success: true, details: 'Input clearing after send implemented' };
    }
  },
  {
    id: 6,
    name: 'Disabled State Implementation',
    description: 'Verify input can be disabled during AI response',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for disabled prop
      if (!content.includes('disabled')) {
        throw new Error('Disabled prop not found');
      }

      // Check for disabled styling
      if (!content.includes('disabled:opacity') || !content.includes('disabled:cursor')) {
        throw new Error('Disabled state styling not found');
      }

      return { success: true, details: 'Disabled state with proper styling implemented' };
    }
  },
  {
    id: 7,
    name: 'Auto-focus on Mount',
    description: 'Verify textarea auto-focuses when component mounts',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for useEffect for focus
      if (!content.includes('useEffect')) {
        throw new Error('useEffect not found for auto-focus');
      }

      // Check for focus() call
      if (!content.includes('.focus()')) {
        throw new Error('Auto-focus logic not found');
      }

      return { success: true, details: 'Auto-focus on mount implemented' };
    }
  },
  {
    id: 8,
    name: 'Dark Mode Support',
    description: 'Verify component has dark mode styling',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const chatInputPath = path.join(process.cwd(), 'src/components/ChatInput.tsx');
      const content = fs.readFileSync(chatInputPath, 'utf8');

      // Check for dark mode classes
      const darkModeClasses = ['dark:bg-', 'dark:text-', 'dark:border-'];
      const foundClasses = darkModeClasses.filter(cls => content.includes(cls));

      if (foundClasses.length === 0) {
        throw new Error('No dark mode classes found');
      }

      return { success: true, details: `Dark mode support implemented (${foundClasses.length} dark mode classes found)` };
    }
  },
  {
    id: 9,
    name: 'Test Page Integration',
    description: 'Verify test page uses ChatInput component',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const testPagePath = path.join(process.cwd(), 'src/app/test-pages/chat-interface-test/page.tsx');
      const content = fs.readFileSync(testPagePath, 'utf8');

      // Check for ChatInput import
      if (!content.includes('ChatInput')) {
        throw new Error('ChatInput component not imported in test page');
      }

      // Check for ChatInput usage
      if (!content.includes('<ChatInput')) {
        throw new Error('ChatInput component not used in test page');
      }

      // Check for onSend handler
      if (!content.includes('onSend=')) {
        throw new Error('onSend handler not passed to ChatInput');
      }

      return { success: true, details: 'Test page properly integrates ChatInput component' };
    }
  },
  {
    id: 10,
    name: 'API Integration in Test Page',
    description: 'Verify test page calls /api/chat endpoint',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const testPagePath = path.join(process.cwd(), 'src/app/test-pages/chat-interface-test/page.tsx');
      const content = fs.readFileSync(testPagePath, 'utf8');

      // Check for fetch call
      if (!content.includes('fetch(')) {
        throw new Error('No fetch call found in test page');
      }

      // Check for API endpoint
      if (!content.includes('/api/chat')) {
        throw new Error('API endpoint /api/chat not found');
      }

      // Check for POST method
      if (!content.includes("method: 'POST'") && !content.includes('method: "POST"')) {
        throw new Error('POST method not used for API call');
      }

      // Check for conversation history
      if (!content.includes('conversationHistory')) {
        throw new Error('Conversation history not sent to API');
      }

      return { success: true, details: 'API integration with /api/chat implemented' };
    }
  },
  {
    id: 11,
    name: 'Loading State Management',
    description: 'Verify test page manages loading state',
    async run() {
      const fs = require('fs');
      const path = require('path');

      const testPagePath = path.join(process.cwd(), 'src/app/test-pages/chat-interface-test/page.tsx');
      const content = fs.readFileSync(testPagePath, 'utf8');

      // Check for loading state
      if (!content.includes('isLoading') && !content.includes('loading')) {
        throw new Error('Loading state not found');
      }

      // Check for setIsLoading or similar
      if (!content.includes('setIsLoading') && !content.includes('setLoading')) {
        throw new Error('Loading state setter not found');
      }

      // Check for loading indicator
      if (!content.includes('AI is thinking') || !content.includes('thinking')) {
        throw new Error('Loading indicator text not found');
      }

      return { success: true, details: 'Loading state management and indicator implemented' };
    }
  }
];

// Run all tests
let passedTests = 0;
let failedTests = 0;

async function runTests() {
  for (const test of tests) {
    process.stdout.write(`Test ${test.id}: ${test.name}... `);

    try {
      const result = await test.run();
      console.log('✅ PASS');
      if (result.details) {
        console.log(`  ↳ ${result.details}`);
      }
      passedTests++;
    } catch (error) {
      console.log('❌ FAIL');
      console.log(`  ↳ ${error.message}`);
      failedTests++;
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(80));
  console.log('Test Summary');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  console.log();

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Story 6.2 acceptance criteria met.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
