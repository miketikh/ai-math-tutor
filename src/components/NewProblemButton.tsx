'use client';

import { useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';

/**
 * NewProblemButton Component
 *
 * Provides a button to start a new problem with confirmation dialog.
 * Clears conversation history and optionally triggers parent reset callback.
 *
 * Features:
 * - Confirmation modal to prevent accidental data loss
 * - Calls ConversationContext.clearConversation()
 * - Optional onReset callback for parent components
 * - Dark mode support
 * - Accessible (Escape key, focus management)
 */

interface NewProblemButtonProps {
  /**
   * Optional callback triggered after conversation is cleared
   * Useful for parent components to reset their own state
   */
  onReset?: () => void;
  /**
   * Optional custom button className
   */
  className?: string;
}

export default function NewProblemButton({ onReset, className }: NewProblemButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { clearConversation } = useConversation();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirm = () => {
    // Clear conversation history
    clearConversation();

    // Call optional parent reset callback
    if (onReset) {
      onReset();
    }

    // Close modal
    setShowModal(false);
  };

  // Handle Escape key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    }
  };

  return (
    <>
      {/* New Problem Button */}
      <button
        onClick={handleOpenModal}
        className={
          className ||
          'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-zinc-950'
        }
        aria-label="Start a new problem"
      >
        New Problem
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Content */}
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Modal Title */}
            <h2
              id="modal-title"
              className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Start a new problem?
            </h2>

            {/* Modal Message */}
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              Current progress will be lost. This will clear your conversation history and reset
              the session.
            </p>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
              {/* Cancel Button */}
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"
                aria-label="Cancel and preserve current session"
              >
                Cancel
              </button>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-zinc-900"
                aria-label="Confirm and start a new problem"
                autoFocus
              >
                Start New Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
