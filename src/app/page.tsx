'use client';

import { useState } from 'react';
import TextInput from '@/components/ProblemInput/TextInput';
import ImageUpload from '@/components/ProblemInput/ImageUpload';

type InputMode = 'text' | 'image';

export default function Home() {
  const [extractedProblem, setExtractedProblem] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('text');

  const handleProblemExtracted = (problemText: string, latex?: string) => {
    setExtractedProblem(problemText);
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

  return (
    <>
      {/* Main content area - placeholder for chat interface and problem input */}
      <main className="flex-1 bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
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
                    <TextInput key="text-input" />
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <ImageUpload key="image-upload" onProblemExtracted={handleProblemExtracted} />
                  </div>
                )}
              </div>
            </div>

            {/* Display extracted problem for testing */}
            {extractedProblem && (
              <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="text-left text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Extracted Problem Preview
                </h3>
                <div className="text-left bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                    {extractedProblem}
                  </p>
                </div>
              </div>
            )}

            <div className="w-full max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-400">
                Chat interface will go here
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer section - placeholder for future links/info */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            A portfolio demo of an AI-powered Socratic math tutor
          </p>
        </div>
      </footer>
    </>
  );
}
