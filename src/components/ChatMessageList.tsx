'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ChatMessage from './ChatMessage';

/**
 * Props for the ChatMessageList component
 */
export interface ChatMessageListProps {
  /** Optional: Additional CSS classes */
  className?: string;
  /** Optional: Show timestamps for each message */
  showTimestamps?: boolean;
}

/**
 * ChatMessageList Component
 *
 * Displays the conversation history in a scrollable chat interface.
 *
 * Features:
 * - Displays all messages from ConversationContext
 * - Auto-scrolls to bottom when new messages are added
 * - Allows manual scrolling to read earlier messages
 * - Student messages: right-aligned, blue background
 * - AI messages: left-aligned, gray background
 * - Optional timestamps for each message
 * - Smooth scroll behavior
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <ChatMessageList />
 * <ChatMessageList showTimestamps={true} />
 * ```
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  className = '',
  showTimestamps = false
}) => {
  const { messages } = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track if user has manually scrolled up
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const previousMessageCount = useRef(messages.length);

  /**
   * Auto-scroll to bottom when new messages are added
   * Only auto-scroll if user hasn't manually scrolled up
   */
  useEffect(() => {
    // Only auto-scroll if:
    // 1. There are new messages (message count increased)
    // 2. User hasn't manually scrolled up
    const hasNewMessages = messages.length > previousMessageCount.current;

    if (hasNewMessages && !isUserScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    previousMessageCount.current = messages.length;
  }, [messages, isUserScrolled]);

  /**
   * Detect when user manually scrolls
   * If they scroll up, disable auto-scroll
   * If they scroll to bottom, re-enable auto-scroll
   */
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px threshold

    setIsUserScrolled(!isAtBottom);
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth px-4 py-6 pb-4 ${className}`}
      style={{ contain: 'layout paint' }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-center">
            No messages yet. Start by asking a math question!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <div key={`message-${message.timestamp}-${index}`} className="mb-2">
              <ChatMessage
                message={message.content}
                role={message.role}
              />
              {showTimestamps && (
                <div
                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    message.role === 'user' ? 'text-right mr-2' : 'text-left ml-2'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              )}
            </div>
          ))}
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

// Display name for debugging
ChatMessageList.displayName = 'ChatMessageList';

export default ChatMessageList;
