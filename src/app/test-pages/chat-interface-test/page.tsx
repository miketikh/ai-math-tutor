'use client';

import React, { useState } from 'react';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useConversation } from '@/contexts/ConversationContext';

/**
 * Chat Interface Test Page
 *
 * Full integration test demonstrating:
 * - ChatInput component for user input
 * - ChatMessageList component for displaying messages
 * - ConversationContext for state management
 * - API integration with /api/chat endpoint
 * - Loading states and error handling
 * - Problem context input for testing
 *
 * This page serves as both a test and a demonstration of the complete
 * chat interface functionality.
 */
export default function ChatInterfaceTestPage() {
  const { addMessage, clearConversation, getConversationHistory } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problemContext, setProblemContext] = useState('Solve for x: 2x + 5 = 13');
  const [includeSampleSkills, setIncludeSampleSkills] = useState(true);

  /**
   * Handle sending a message
   * 1. Add user message to conversation
   * 2. Call API with message and history
   * 3. Add AI response to conversation
   */
  const handleSendMessage = async (message: string) => {
    // Clear any previous errors
    setError(null);

    // Add user message to conversation
    addMessage('user', message);

    // Set loading state
    setIsLoading(true);

    try {
      // Get conversation history before the API call
      const conversationHistory = getConversationHistory();

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          problemContext,
          ...(includeSampleSkills
            ? {
                mainSkillId: 'algebra.multi_step_equations',
                relatedSkills: [
                  { id: 'algebra.variables', name: 'Variables' },
                  { id: 'algebra.two_step_equations', name: 'Two-Step Equations' },
                  { id: 'algebra.combining_like_terms', name: 'Combining Like Terms' },
                ],
              }
            : {}),
        }),
      });

      // Parse response
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from AI');
      }

      // Add AI response to conversation
      addMessage('assistant', data.response);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Optionally add error message to conversation
      addMessage('assistant', `Sorry, I encountered an error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle starting a new conversation
   */
  const handleNewProblem = () => {
    clearConversation();
    setError(null);
    setProblemContext('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chat Interface Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Story 6.2: Testing ChatInput + ChatMessageList + API Integration
          </p>
        </div>

        {/* Problem Context Input */}
        <div className="bg-white dark:bg-gray-800 shadow-lg p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Problem Context (for AI tutor):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={problemContext}
              onChange={(e) => setProblemContext(e.target.value)}
              placeholder="e.g., Solve for x: 2x + 5 = 13"
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleNewProblem}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              New Problem
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This context helps the AI tutor understand what problem you're working on.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              id="include-skills"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={includeSampleSkills}
              onChange={(e) => setIncludeSampleSkills(e.target.checked)}
            />
            <label htmlFor="include-skills" className="text-sm text-gray-800 dark:text-gray-200">
              Include sample skill context (main skill + 3 related skills)
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                  Error: {error}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg flex flex-col" style={{ height: '600px' }}>
          {/* Chat Messages - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            <ChatMessageList showTimestamps={true} />
          </div>

          {/* Loading Indicator - Within scrollable area */}
          {isLoading && (
            <div className="flex-shrink-0 px-4 pb-2">
              <LoadingIndicator showTimeout={true} />
            </div>
          )}

          {/* Chat Input - Fixed at bottom */}
          <div className="flex-shrink-0">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder={isLoading ? "Waiting for AI response..." : "Type your message... (Enter to send, Shift+Enter for new line)"}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Test Instructions
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">1.</span>
              <p>Set a problem context above (e.g., "Solve for x: 2x + 5 = 13")</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">2.</span>
              <p>Type a question in the input field at the bottom</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">3.</span>
              <p>Press Enter to send (or click the Send button)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">4.</span>
              <p>Use Shift+Enter to create a new line without sending</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">5.</span>
              <p>Input is disabled while AI is responding (you'll see "AI is thinking...")</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-500 mt-0.5">6.</span>
              <p>Click "New Problem" to start a fresh conversation</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Features Being Tested:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>Multi-line text input with auto-resize</li>
              <li>Enter to send, Shift+Enter for new line</li>
              <li>Send button functionality</li>
              <li>Input clearing after send</li>
              <li>Disabled state during AI response</li>
              <li>Loading indicator</li>
              <li>Real API integration with GPT-4o</li>
              <li>Conversation history management</li>
              <li>Error handling and display</li>
              <li>Auto-scroll in message list</li>
              <li>Timestamps on messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
