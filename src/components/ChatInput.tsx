'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  /** Callback when user sends a message */
  onSend: (message: string) => void;
  /** Whether the input is disabled (e.g., during AI response) */
  disabled?: boolean;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * ChatInput Component
 *
 * Multi-line text input field for chat messages with a send button.
 *
 * Features:
 * - Multi-line textarea that grows with content
 * - Enter key sends message
 * - Shift+Enter creates new line
 * - Send button next to input
 * - Auto-clears after sending
 * - Disabled state during AI response
 * - Auto-focus on mount
 * - Min/max height constraints
 * - Dark mode support
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <ChatInput
 *   onSend={(message) => handleSend(message)}
 *   disabled={isLoading}
 *   placeholder="Type your message..."
 * />
 * ```
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-focus the textarea when component mounts
   */
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height)
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  /**
   * Handle message change
   */
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Handle send action
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage(''); // Clear input after sending
    }
  };

  /**
   * Handle Enter key press
   * - Enter: Send message
   * - Shift+Enter: New line
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default new line
      handleSend();
    }
    // If Shift+Enter, let the default behavior (new line) happen
  };

  return (
    <div className={`flex items-end gap-2 p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 ${className}`}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={`
          flex-1
          resize-none
          rounded-lg
          border
          border-gray-300
          dark:border-gray-600
          bg-white
          dark:bg-gray-800
          px-4
          py-3
          text-gray-900
          dark:text-gray-100
          placeholder-gray-500
          dark:placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-transparent
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:bg-gray-100
          dark:disabled:bg-gray-800
          transition-colors
        `}
        style={{
          minHeight: '52px',
          maxHeight: '200px',
          overflow: 'auto',
        }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`
          px-6
          py-3
          rounded-lg
          font-semibold
          text-white
          bg-blue-500
          hover:bg-blue-600
          active:bg-blue-700
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:hover:bg-blue-500
          transition-colors
          shadow-sm
          hover:shadow-md
          flex-shrink-0
        `}
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
};

// Display name for debugging
ChatInput.displayName = 'ChatInput';

export default ChatInput;
