'use client';

import { useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import type { ChatRequest, ChatResponse } from '@/app/api/chat/route';

export default function ChatApiTestPage() {
  // Use ConversationContext instead of local state
  const { messages, addMessage, clearConversation, getConversationHistory } = useConversation();

  const [message, setMessage] = useState('');
  const [problemContext, setProblemContext] = useState('Solve: 2x + 5 = 13');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeSampleSkills, setIncludeSampleSkills] = useState(true);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const requestBody: ChatRequest = {
        message: message.trim(),
        conversationHistory: getConversationHistory(),
        problemContext: problemContext.trim() || undefined,
      };

      // Optionally include sample skill context for testing
      if (includeSampleSkills) {
        (requestBody as any).mainSkillId = 'algebra.multi_step_equations';
        (requestBody as any).relatedSkills = [
          { id: 'algebra.variables', name: 'Variables' },
          { id: 'algebra.two_step_equations', name: 'Two-Step Equations' },
          { id: 'algebra.combining_like_terms', name: 'Combining Like Terms' },
        ];
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: ChatResponse = await res.json();

      if (data.success && data.response) {
        setResponse(data.response);

        // Add messages to conversation context
        addMessage('user', message.trim());
        addMessage('assistant', data.response);

        setMessage(''); // Clear input
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearConversation();
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Chat API Test</h1>
          <p className="text-gray-600 mb-6">Test the /api/chat endpoint with Socratic tutoring</p>

          {/* Problem Context */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Context (Optional)
            </label>
            <input
              type="text"
              value={problemContext}
              onChange={(e) => setProblemContext(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Solve: 2x + 5 = 13"
            />
          </div>

          {/* Sample Skill Context Toggle */}
          <div className="mb-6 flex items-center gap-3">
            <input
              id="sample-skills"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={includeSampleSkills}
              onChange={(e) => setIncludeSampleSkills(e.target.checked)}
            />
            <label htmlFor="sample-skills" className="text-sm text-gray-800">
              Include sample skill context (main skill + 3 related skills)
            </label>
          </div>

          {/* Conversation History Display */}
          {messages.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Conversation History</h2>
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear History / New Problem
                </button>
              </div>
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded ${
                      msg.role === 'user'
                        ? 'bg-blue-100 ml-8'
                        : 'bg-green-100 mr-8'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 text-gray-700">
                      {msg.role === 'user' ? 'You' : 'Tutor'}
                    </div>
                    <div className="text-sm text-gray-900">{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={3}
              placeholder="Ask a question about the problem..."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Press Enter to send, Shift+Enter for new line</p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>

          {/* Response Display */}
          {response && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Latest Response:</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{response}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Test Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Enter a problem context (optional) to give the AI background</li>
              <li>Ask a question about solving a math problem</li>
              <li>The AI should respond using the Socratic method (questions, not direct answers)</li>
              <li>Continue the conversation to test conversation history tracking</li>
              <li>Try clearing history and starting a new conversation</li>
              <li>Test error handling by checking the network tab if requests fail</li>
            </ul>
          </div>

          {/* API Info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">API Info:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Endpoint:</strong> POST /api/chat</p>
              <p><strong>Model:</strong> GPT-4o</p>
              <p><strong>Timeout:</strong> 10 seconds</p>
              <p><strong>Retry Logic:</strong> 1 retry on failure</p>
              <p><strong>Messages in History:</strong> {messages.length}</p>
              <p><strong>Max Messages:</strong> 50 (oldest dropped when exceeded)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
