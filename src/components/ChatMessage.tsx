'use client';

import React, { useMemo } from 'react';
import MathDisplay from './MathDisplay';

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  /** The message text, potentially containing LaTeX delimiters */
  message: string;
  /** The role of the message sender */
  role: 'user' | 'assistant';
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * Content chunk type for parsed message
 */
interface ContentChunk {
  type: 'text' | 'latex-inline' | 'latex-block';
  content: string;
  key: string;
}

/**
 * ChatMessage Component
 *
 * Displays a chat message with support for LaTeX rendering.
 *
 * Features:
 * - Parses message text to detect LaTeX delimiters ($..$ for inline, $$...$$ for block)
 * - Renders text chunks as normal text
 * - Renders LaTeX chunks using MathDisplay component
 * - Handles mixed content (text + inline equations + block equations)
 * - Styled differently for user vs assistant messages
 * - Prevents layout shifts with proper spacing
 *
 * Usage:
 * <ChatMessage message="The answer is $x^2 + 5$" role="user" />
 * <ChatMessage message="Let's solve $$\int x^2 dx$$" role="assistant" />
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, role, className = '' }) => {
  /**
   * Parse message into chunks of text and LaTeX
   * Handles both inline ($...$) and block ($$...$$) equations
   */
  const contentChunks = useMemo(() => {
    const chunks: ContentChunk[] = [];
    let remaining = message;
    let chunkIndex = 0;

    while (remaining.length > 0) {
      // First, look for block equations ($$...$$)
      // Note: Using [\s\S] instead of 's' flag for compatibility
      const blockMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);

      // Then look for inline equations ($...$)
      const inlineMatch = remaining.match(/\$(.*?)\$/);

      // Determine which match comes first
      let nextMatch: RegExpMatchArray | null = null;
      let matchType: 'block' | 'inline' | null = null;

      if (blockMatch && inlineMatch) {
        // Both found - use whichever comes first
        if (blockMatch.index! < inlineMatch.index!) {
          nextMatch = blockMatch;
          matchType = 'block';
        } else {
          nextMatch = inlineMatch;
          matchType = 'inline';
        }
      } else if (blockMatch) {
        nextMatch = blockMatch;
        matchType = 'block';
      } else if (inlineMatch) {
        nextMatch = inlineMatch;
        matchType = 'inline';
      }

      if (!nextMatch || nextMatch.index === undefined) {
        // No more LaTeX - rest is plain text
        if (remaining.trim()) {
          chunks.push({
            type: 'text',
            content: remaining,
            key: `chunk-${chunkIndex++}`
          });
        }
        break;
      }

      // Add text before the match (if any)
      const textBefore = remaining.substring(0, nextMatch.index);
      if (textBefore) {
        chunks.push({
          type: 'text',
          content: textBefore,
          key: `chunk-${chunkIndex++}`
        });
      }

      // Add the LaTeX chunk
      const latexContent = nextMatch[1] || '';
      if (latexContent.trim()) {
        chunks.push({
          type: matchType === 'block' ? 'latex-block' : 'latex-inline',
          content: latexContent,
          key: `chunk-${chunkIndex++}`
        });
      }

      // Continue with remaining text
      remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
    }

    return chunks;
  }, [message]);

  // Determine message styling based on role
  const messageClasses = useMemo(() => {
    const baseClasses = 'max-w-[80%] rounded-lg px-4 py-3 shadow-sm';

    if (role === 'user') {
      return `${baseClasses} ml-auto bg-blue-500 text-white`;
    } else {
      return `${baseClasses} mr-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100`;
    }
  }, [role]);

  const containerClasses = useMemo(() => {
    return role === 'user' ? 'flex justify-end' : 'flex justify-start';
  }, [role]);

  return (
    <div className={`${containerClasses} mb-4 ${className}`}>
      <div className={messageClasses}>
        {contentChunks.map((chunk) => {
          if (chunk.type === 'text') {
            return (
              <span key={chunk.key} className="whitespace-pre-wrap">
                {chunk.content}
              </span>
            );
          } else if (chunk.type === 'latex-inline') {
            return (
              <MathDisplay
                key={chunk.key}
                latex={chunk.content}
                displayMode={false}
                className="mx-1"
              />
            );
          } else {
            // latex-block
            return (
              <div key={chunk.key} className="my-2">
                <MathDisplay
                  latex={chunk.content}
                  displayMode={true}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// Display name for debugging
ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
