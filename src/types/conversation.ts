/**
 * Conversation Types
 *
 * Type definitions for conversation history management across the application.
 * These types are used by the ConversationContext and Chat API.
 */

/**
 * Message interface representing a single message in the conversation
 */
export interface Message {
  /** The role of the message sender */
  role: 'user' | 'assistant';
  /** The content of the message */
  content: string;
  /** Unix timestamp (milliseconds) when the message was created */
  timestamp: number;
}

/**
 * Conversation context type used by ConversationContext
 */
export interface ConversationContextType {
  /** Array of all messages in the conversation */
  messages: Message[];
  /** Add a new message to the conversation */
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  /** Clear all messages from the conversation */
  clearConversation: () => void;
  /** Restore messages from a saved conversation (used for session recovery) */
  restoreMessages: (messages: Message[]) => void;
  /** Get the conversation history (returns messages array) */
  getConversationHistory: () => Message[];
}
