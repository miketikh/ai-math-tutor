'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Message, ConversationContextType } from '@/types/conversation';

/**
 * ConversationContext
 *
 * Manages conversation history across the application.
 * Provides methods to add messages, clear conversation, and retrieve history.
 *
 * Features:
 * - Session-based storage (no persistence)
 * - Maximum 50 messages (oldest dropped when exceeded)
 * - Automatic timestamp generation
 */

// Create the context with undefined default (will be provided by Provider)
const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Maximum number of messages to keep in history
const MAX_MESSAGES = 50;

/**
 * ConversationProvider Props
 */
interface ConversationProviderProps {
  children: ReactNode;
}

/**
 * ConversationProvider Component
 *
 * Wraps the application to provide conversation context.
 * Should be placed high in the component tree (typically in layout.tsx).
 */
export function ConversationProvider({ children }: ConversationProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * Add a new message to the conversation
   * Automatically generates timestamp and enforces 50 message limit
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];

      // Enforce 50 message limit - drop oldest messages if exceeded
      if (updatedMessages.length > MAX_MESSAGES) {
        return updatedMessages.slice(updatedMessages.length - MAX_MESSAGES);
      }

      return updatedMessages;
    });
  }, []);

  /**
   * Clear all messages from the conversation
   * Used when starting a new problem
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Get the conversation history
   * Returns a copy of the messages array
   */
  const getConversationHistory = useCallback((): Message[] => {
    return [...messages];
  }, [messages]);

  const value: ConversationContextType = {
    messages,
    addMessage,
    clearConversation,
    getConversationHistory,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

/**
 * useConversation Hook
 *
 * Custom hook to access the conversation context.
 * Throws an error if used outside of ConversationProvider.
 *
 * @returns ConversationContextType
 *
 * @example
 * ```tsx
 * const { messages, addMessage, clearConversation } = useConversation();
 *
 * // Add a user message
 * addMessage('user', 'What is 2 + 2?');
 *
 * // Add an assistant message
 * addMessage('assistant', 'Let me guide you to the answer...');
 *
 * // Clear conversation
 * clearConversation();
 * ```
 */
export function useConversation(): ConversationContextType {
  const context = useContext(ConversationContext);

  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }

  return context;
}
