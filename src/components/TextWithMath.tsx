'use client';

import React, { useMemo } from 'react';
import MathDisplay from './MathDisplay';

/**
 * Props for the TextWithMath component
 */
interface TextWithMathProps {
  /** Text potentially containing LaTeX delimiters (\(...\) inline, $$...$$ block) */
  text: string;
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * Content chunk for parsed text
 */
interface ContentChunk {
  type: 'text' | 'latex-inline' | 'latex-block';
  content: string;
  key: string;
}

/**
 * TextWithMath Component
 *
 * Renders text with inline LaTeX math expressions.
 * Parses \(...\) for inline math and $$...$$ for block math.
 */
export default function TextWithMath({ text, className = '' }: TextWithMathProps) {
  const contentChunks = useMemo(() => {
    const chunks: ContentChunk[] = [];
    let remaining = text;
    let chunkIndex = 0;

    while (remaining.length > 0) {
      const blockMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
      const inlineMatch = remaining.match(/\\\((.*?)\\\)/);

      let nextMatch: RegExpMatchArray | null = null;
      let matchType: 'block' | 'inline' | null = null;

      if (blockMatch && inlineMatch) {
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
        if (remaining.trim()) {
          chunks.push({
            type: 'text',
            content: remaining,
            key: `chunk-${chunkIndex++}`,
          });
        }
        break;
      }

      const textBefore = remaining.substring(0, nextMatch.index);
      if (textBefore) {
        chunks.push({
          type: 'text',
          content: textBefore,
          key: `chunk-${chunkIndex++}`,
        });
      }

      const latexContent = nextMatch[1] || '';
      if (latexContent.trim()) {
        chunks.push({
          type: matchType === 'block' ? 'latex-block' : 'latex-inline',
          content: latexContent,
          key: `chunk-${chunkIndex++}`,
        });
      }

      remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
    }

    return chunks;
  }, [text]);

  return (
    <span className={className}>
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
              className="inline-block mx-1"
            />
          );
        } else {
          return (
            <div key={chunk.key} className="my-2">
              <MathDisplay latex={chunk.content} displayMode={true} />
            </div>
          );
        }
      })}
    </span>
  );
}
