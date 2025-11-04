'use client';

import { useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import NewProblemButton from '@/components/NewProblemButton';

/**
 * Test Page for New Problem Button (Story 6.5)
 *
 * Tests:
 * 1. New Problem button in header (already integrated)
 * 2. Additional button on page to test onReset callback
 * 3. Add test messages to conversation
 * 4. Verify conversation clears on confirmation
 * 5. Verify conversation preserved on cancel
 * 6. Visual feedback after reset
 */

export default function NewProblemTestPage() {
  const { messages, addMessage } = useConversation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [localState, setLocalState] = useState('');

  // Handler to add test messages
  const addTestMessages = () => {
    addMessage('user', 'What is 2 + 2?');
    addMessage('assistant', "Let's think about this together. What happens when you have 2 objects and add 2 more objects?");
    addMessage('user', 'You get 4 objects');
    addMessage('assistant', 'Exactly! So 2 + 2 = 4. Great job!');
  };

  // Handler for reset callback
  const handleReset = () => {
    setLocalState('');
    setShowSuccessMessage(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            New Problem Button Test
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Story 6.5: Test the "New Problem" button functionality
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Session reset successfully! Conversation cleared.
            </p>
          </div>
        )}

        {/* Test Controls */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Test Controls
          </h2>

          <div className="space-y-4">
            {/* Add Test Messages */}
            <div>
              <button
                onClick={addTestMessages}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                Add Test Messages
              </button>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Adds 4 sample messages to the conversation
              </p>
            </div>

            {/* Local State Input */}
            <div>
              <label htmlFor="local-state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Local State (to test onReset callback):
              </label>
              <input
                id="local-state"
                type="text"
                value={localState}
                onChange={(e) => setLocalState(e.target.value)}
                placeholder="Type something here..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                This should clear when using the button below (with onReset callback)
              </p>
            </div>

            {/* New Problem Button with callback */}
            <div>
              <NewProblemButton onReset={handleReset} />
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                This button includes an onReset callback that clears local state and shows success message
              </p>
            </div>
          </div>
        </div>

        {/* Message Count */}
        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Current Messages: <span className="text-blue-600 dark:text-blue-400">{messages.length}</span>
          </p>
        </div>

        {/* Conversation History */}
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Conversation History
            </h2>
          </div>

          <div className="p-4">
            {messages.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 italic">
                No messages yet. Click "Add Test Messages" to populate the conversation.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-zinc-50 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {message.role === 'user' ? 'User' : 'Assistant'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Test Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>Click "Add Test Messages" to populate the conversation</li>
            <li>Type something in the "Local State" input field</li>
            <li>Click the "New Problem" button in the header OR the button below</li>
            <li>Verify the confirmation modal appears with the correct message</li>
            <li>Click "Cancel" and verify:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Modal closes</li>
                <li>Messages are still visible</li>
                <li>Local state is preserved</li>
              </ul>
            </li>
            <li>Click "New Problem" again and click "Start New Problem"</li>
            <li>Verify:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Modal closes</li>
                <li>All messages are cleared</li>
                <li>Local state is cleared (if using button with callback)</li>
                <li>Success message appears (if using button with callback)</li>
                <li>Message count shows 0</li>
              </ul>
            </li>
          </ol>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            Acceptance Criteria Checklist
          </h3>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>"New Problem" button in header</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Click shows confirmation: "Start a new problem? Current progress will be lost."</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Confirm clears: conversation history (canvas state and uploaded image deferred to Epic 5)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Cancel preserves current session</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>After reset, conversation is empty (ready for new problem)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Visual feedback on successful reset (when using onReset callback)</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
