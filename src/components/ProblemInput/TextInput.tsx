'use client';

import { useState } from 'react';

const MAX_CHARACTERS = 1000;

interface TextInputProps {
  /** Optional callback when problem is submitted */
  onSubmit?: (problemText: string) => void;
}

export default function TextInput({ onSubmit }: TextInputProps) {
  const [input, setInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const characterCount = input.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const isEmpty = input.trim().length === 0;
  const isValid = !isEmpty && !isOverLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setShowError(false);
    setShowSuccess(false);
    setErrorMessage('');

    // Validate input
    if (isEmpty) {
      setShowError(true);
      setErrorMessage('Please enter a math problem to submit.');
      return;
    }

    if (isOverLimit) {
      setShowError(true);
      setErrorMessage(`Problem exceeds maximum length of ${MAX_CHARACTERS} characters.`);
      return;
    }

    // Store the problem text before clearing
    const problemText = input.trim();

    // Call the onSubmit callback if provided
    if (onSubmit) {
      onSubmit(problemText);
    } else {
      // Legacy behavior for backward compatibility
      console.log('Problem submitted:', problemText);

      // Show success message
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }

    // Clear input
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Clear error message when user starts typing
    if (showError) {
      setShowError(false);
      setErrorMessage('');
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="math-problem-input"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Enter your math problem
          </label>

          <textarea
            id="math-problem-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your math problem here... (e.g., How do I solve 2x + 5 = 15?)"
            className={`w-full min-h-[120px] rounded-lg border px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 ${
              isOverLimit
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700'
            }`}
            aria-describedby="character-count"
            aria-invalid={isOverLimit}
          />

          <div className="flex items-center justify-between">
            <div
              id="character-count"
              className={`text-sm ${
                isOverLimit
                  ? 'font-medium text-red-600 dark:text-red-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {characterCount}/{MAX_CHARACTERS} characters
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`w-full rounded-lg px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
          }`}
        >
          Submit Problem
        </button>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Problem submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
