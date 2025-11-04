'use client';

import React, { useState } from 'react';
import ChatMessageList from '@/components/ChatMessageList';
import { useConversation } from '@/contexts/ConversationContext';

/**
 * Test Page for ChatMessageList Component
 *
 * Tests:
 * 1. Display of multiple messages (10+ messages)
 * 2. Auto-scroll functionality when new messages are added
 * 3. Manual scroll up/down behavior
 * 4. Long messages
 * 5. Messages with LaTeX equations
 * 6. Timestamp display toggle
 * 7. User vs Assistant message styling
 */
export default function ChatListTestPage() {
  const { addMessage, clearConversation, messages } = useConversation();
  const [showTimestamps, setShowTimestamps] = useState(false);

  /**
   * Load sample conversation with 15+ messages
   * Includes various types: short, long, with LaTeX
   */
  const loadSampleConversation = () => {
    clearConversation();

    // Initial problem
    addMessage('user', 'Can you help me solve this equation: $x^2 - 5x + 6 = 0$?');

    addMessage(
      'assistant',
      'I\'d be happy to help you solve that quadratic equation! Let\'s work through this step by step. First, can you tell me what methods you know for solving quadratic equations?'
    );

    addMessage('user', 'I know the quadratic formula and factoring.');

    addMessage(
      'assistant',
      'Excellent! Those are both great methods. For $x^2 - 5x + 6 = 0$, let\'s try factoring first since it might be simpler. Can you think of two numbers that multiply to give 6 and add to give -5?'
    );

    addMessage('user', 'Hmm... -2 and -3?');

    addMessage(
      'assistant',
      'Perfect! You got it! So we can write $x^2 - 5x + 6$ as $(x - 2)(x - 3)$. Now, what does our equation become?'
    );

    addMessage('user', '$(x - 2)(x - 3) = 0$');

    addMessage(
      'assistant',
      'Exactly right! Now we have $(x - 2)(x - 3) = 0$. What does this tell us about the values of $x$?'
    );

    addMessage('user', 'Either $x - 2 = 0$ or $x - 3 = 0$?');

    addMessage(
      'assistant',
      'Yes! That\'s the zero product property. So what are the two solutions?'
    );

    addMessage('user', '$x = 2$ or $x = 3$');

    addMessage(
      'assistant',
      'Perfect! You\'ve successfully solved the equation. The solutions are $x = 2$ and $x = 3$. Great work walking through the factoring method!'
    );

    // Start a new problem
    addMessage('user', 'Now can you help me with this integral: $$\\int_{0}^{\\pi} \\sin(x) dx$$');

    addMessage(
      'assistant',
      'Absolutely! Let\'s work on this definite integral. First, do you remember what the antiderivative of $\\sin(x)$ is?'
    );

    addMessage('user', 'Is it $-\\cos(x)$?');

    addMessage(
      'assistant',
      'Exactly! So now we need to evaluate $-\\cos(x)$ from $0$ to $\\pi$. Can you show me how to apply the fundamental theorem of calculus here?'
    );

    addMessage('user', 'Would it be $[-\\cos(\\pi)] - [-\\cos(0)]$?');

    addMessage(
      'assistant',
      'Perfect setup! Now can you calculate what $\\cos(\\pi)$ and $\\cos(0)$ equal?'
    );

    addMessage('user', '$\\cos(\\pi) = -1$ and $\\cos(0) = 1$');

    addMessage(
      'assistant',
      'Excellent! So substituting those values, what do you get?'
    );

    addMessage('user', '$[-(-1)] - [-(1)] = 1 + 1 = 2$');

    addMessage(
      'assistant',
      'Perfect! The answer is $2$. You\'ve done an excellent job working through both the quadratic equation and the definite integral. You clearly understand the key concepts!'
    );
  };

  /**
   * Load a conversation with very long messages to test scrolling
   */
  const loadLongMessageConversation = () => {
    clearConversation();

    addMessage(
      'user',
      'I need help understanding the concept of limits in calculus. Can you explain what it means when we say the limit of a function as x approaches a value?'
    );

    addMessage(
      'assistant',
      'Great question! Understanding limits is fundamental to calculus. A limit describes the behavior of a function as the input approaches a particular value, not necessarily what happens AT that value. Think of it like this: imagine you\'re walking toward a door. The limit describes where you\'re heading (the door), even if you never actually reach it or if there\'s something blocking the door itself. In mathematical notation, when we write $$\\lim_{x \\to a} f(x) = L$$ we\'re saying that as $x$ gets arbitrarily close to $a$ (from either side), the function $f(x)$ gets arbitrarily close to $L$. The key insight is that we care about what happens NEAR the point, not necessarily AT the point. Can you think of a situation where a function might approach a value even if it\'s not defined at that exact point?'
    );

    addMessage(
      'user',
      'Maybe something like $(x^2 - 1)/(x - 1)$ when $x$ approaches $1$? The function isn\'t defined at $x = 1$ because we\'d divide by zero, but it seems like it should approach something.'
    );

    addMessage(
      'assistant',
      'Excellent example! You\'ve identified a classic case of a removable discontinuity. Let\'s explore this together. You\'re absolutely right that $\\frac{x^2 - 1}{x - 1}$ is undefined at $x = 1$. But let\'s think about what happens as we get close to $1$. First, can you try factoring the numerator $x^2 - 1$? This is a difference of squares.'
    );

    addMessage('user', 'Oh right! $x^2 - 1 = (x + 1)(x - 1)$');

    addMessage(
      'assistant',
      'Perfect! Now we have $$\\frac{(x + 1)(x - 1)}{x - 1}$$ What can we do with this expression, keeping in mind that we\'re interested in values of $x$ that are NEAR $1$ but not exactly equal to $1$?'
    );
  };

  /**
   * Add a new test message (user)
   */
  const addTestUserMessage = () => {
    const testMessages = [
      'What is the derivative of $e^x$?',
      'How do I factor $x^2 + 7x + 12$?',
      'Can you explain the chain rule?',
      'What is $\\int x^2 dx$?',
      'How do I solve $2x + 5 = 13$?',
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    addMessage('user', randomMessage);
  };

  /**
   * Add a new test message (assistant)
   */
  const addTestAssistantMessage = () => {
    const testMessages = [
      'Great question! Let\'s work through this step by step.',
      'I can help with that. What have you tried so far?',
      'Excellent! You\'re on the right track. Can you tell me why you think that?',
      'Good effort! Let me guide you with a hint: think about the properties we discussed earlier.',
      'Perfect! That\'s exactly right. Can you explain your reasoning?',
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    addMessage('assistant', randomMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          ChatMessageList Component Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Story 6.1: Chat Message Display Component
        </p>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Test Controls
          </h2>

          <div className="space-y-4">
            {/* Load Sample Data */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadSampleConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Load Sample Conversation (22 messages)
              </button>
              <button
                onClick={loadLongMessageConversation}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Load Long Messages
              </button>
              <button
                onClick={clearConversation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Messages
              </button>
            </div>

            {/* Add Messages */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={addTestUserMessage}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add User Message (Test Auto-Scroll)
              </button>
              <button
                onClick={addTestAssistantMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add Assistant Message (Test Auto-Scroll)
              </button>
            </div>

            {/* Toggle Timestamps */}
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-gray-100">
                  Show Timestamps
                </span>
              </label>
            </div>

            {/* Message Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total messages: {messages.length}
            </div>
          </div>
        </div>

        {/* Chat Message List Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Chat Messages
            </h2>
          </div>

          <ChatMessageList showTimestamps={showTimestamps} />
        </div>

        {/* Test Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Test Instructions
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Click "Load Sample Conversation" to populate with 22 messages containing LaTeX</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Verify auto-scroll to bottom on load</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Scroll up manually to read earlier messages</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>Click "Add User/Assistant Message" buttons to verify auto-scroll only happens when at bottom</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <span>Scroll to bottom manually, then add a message - should auto-scroll</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">6.</span>
              <span>Toggle timestamps to verify optional display</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">7.</span>
              <span>Load "Long Messages" to test with lengthy content</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">8.</span>
              <span>Verify user messages are right-aligned (blue) and AI messages are left-aligned (gray)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
