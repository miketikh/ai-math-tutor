'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import TextInput from '@/components/ProblemInput/TextInput';
import ImageUpload from '@/components/ProblemInput/ImageUpload';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';
import MathDisplay from '@/components/MathDisplay';
import { useConversation } from '@/contexts/ConversationContext';

type InputMode = 'text' | 'image';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // All hooks must be called before any conditional returns
  const [extractedProblem, setExtractedProblem] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [conversationStarted, setConversationStarted] = useState<boolean>(false);
  const [problemContext, setProblemContext] = useState<string>('');
  const [problemLatex, setProblemLatex] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { addMessage, getConversationHistory } = useConversation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!loading && user && userProfile) {
      const isProfileIncomplete =
        !userProfile.gradeLevel ||
        !userProfile.focusTopics ||
        userProfile.focusTopics.length === 0 ||
        !userProfile.interests ||
        userProfile.interests.length === 0;

      if (isProfileIncomplete) {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleProblemExtracted = (problemText: string, latex?: string) => {
    setExtractedProblem(problemText);
    setProblemLatex(latex);
    console.log('Problem extracted:', problemText);
    if (latex) {
      console.log('LaTeX detected:', latex);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    if (mode !== inputMode) {
      setInputMode(mode);
      setExtractedProblem(''); // Clear previous input when switching modes
    }
  };

  /**
   * Handle starting conversation with submitted problem
   */
  const handleProblemSubmit = (problemText: string, latex?: string) => {
    setProblemContext(problemText);
    setProblemLatex(latex);
    setConversationStarted(true);

    // Add initial AI greeting message with LaTeX rendering if available
    const displayProblem = latex ? `$${latex}$` : problemText;
    addMessage(
      'assistant',
      `I see you're working on: ${displayProblem}\n\nLet's work through this together! What's your first thought about this problem?`
    );
  };

  /**
   * Handle sending a message in the chat
   */
  const handleSendMessage = async (message: string) => {
    // Format user message with LaTeX using gpt-4o-mini
    let formattedMessage = message;
    try {
      const formatResponse = await fetch('/api/format-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      const formatData = await formatResponse.json();
      if (formatData.success && formatData.formattedText) {
        formattedMessage = formatData.formattedText;
      }
    } catch (err) {
      console.warn('Failed to format math, using original text:', err);
      // Continue with original message
    }

    // Add formatted user message to conversation
    addMessage('user', formattedMessage);

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

      // Add error message to conversation
      addMessage('assistant', `Sorry, I encountered an error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle reset from NewProblemButton
   */
  const handleReset = () => {
    setConversationStarted(false);
    setProblemContext('');
    setProblemLatex(undefined);
    setExtractedProblem('');
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header with reset callback */}
      <Header onReset={handleReset} />

      {/* Main content area */}
      <main className="flex-1 bg-zinc-50 dark:bg-black flex flex-col overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 flex-1 flex flex-col overflow-hidden">
          {!conversationStarted ? (
            /* Problem Input Phase */
            <div className="flex flex-col items-center justify-center space-y-8 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Welcome to Math Tutor
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Your AI-powered Socratic learning assistant for mathematics
                </p>
              </div>

              {/* Problem Input Interface with Mode Selection */}
              <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                {/* Mode Selection Tabs */}
                <div className="mb-6">
                  <div className="flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
                    <button
                      onClick={() => handleModeChange('text')}
                      className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                        inputMode === 'text'
                          ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                      }`}
                      aria-pressed={inputMode === 'text'}
                      aria-label="Type Problem mode"
                    >
                      Type Problem
                    </button>
                    <button
                      onClick={() => handleModeChange('image')}
                      className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                        inputMode === 'image'
                          ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                      }`}
                      aria-pressed={inputMode === 'image'}
                      aria-label="Upload Image mode"
                    >
                      Upload Image
                    </button>
                  </div>
                </div>

                {/* Input Component - Conditionally Rendered with Transition */}
                <div className="transition-opacity duration-200 ease-in-out">
                  {inputMode === 'text' ? (
                    <div className="animate-fadeIn">
                      <TextInput key="text-input" onSubmit={handleProblemSubmit} />
                    </div>
                  ) : (
                    <div className="animate-fadeIn">
                      <ImageUpload
                        key="image-upload"
                        onProblemExtracted={(problemText, latex) => {
                          handleProblemExtracted(problemText, latex);
                          handleProblemSubmit(problemText, latex);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface Phase */
            <div className="flex flex-col gap-6 flex-1 py-6 overflow-hidden">
              {/* Problem Context Display */}
              <div className="w-full rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 flex-shrink-0">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                  Current Problem
                </h3>
                <div className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                  {problemLatex ? (
                    <MathDisplay latex={problemLatex} displayMode={false} />
                  ) : (
                    problemContext
                  )}
                </div>
              </div>

              {/* Chat Interface */}
              <div className="w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 flex flex-col flex-1 min-h-0">
                {/* Chat Messages - Scrollable Area */}
                <div className="flex-1 overflow-y-auto">
                  <ChatMessageList showTimestamps={false} />
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
                    placeholder={
                      isLoading
                        ? 'Waiting for AI response...'
                        : 'Type your message... (Enter to send, Shift+Enter for new line)'
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer section */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 flex-shrink-0">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            A portfolio demo of an AI-powered Socratic math tutor
          </p>
        </div>
      </footer>
    </div>
  );
}
