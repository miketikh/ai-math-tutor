'use client';

import React, { memo, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Props for the MathDisplay component
 */
interface MathDisplayProps {
  /** LaTeX string to render. Can include delimiters: \( \) for inline, $$ for block */
  latex: string;
  /** Optional: Force display mode. If not provided, auto-detects from delimiters */
  displayMode?: boolean;
  /** Optional: Accessible text description of the equation */
  ariaLabel?: string;
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * MathDisplay Component
 *
 * Renders LaTeX equations using KaTeX library.
 *
 * Features:
 * - Supports inline mode (\( \) delimiter) and block mode ($$ delimiter)
 * - Auto-detects mode from delimiters if displayMode not explicitly set
 * - Error handling: shows raw text with error indicator for invalid LaTeX
 * - Memoized to prevent unnecessary re-renders
 * - Accessible: includes aria-label for screen readers
 *
 * Usage:
 * <MathDisplay latex="\(x^2 + 5x + 6\)" />  // inline
 * <MathDisplay latex="$$\int x^2 dx$$" />  // block
 */
const MathDisplay: React.FC<MathDisplayProps> = memo(({
  latex,
  displayMode: explicitDisplayMode,
  ariaLabel,
  className = ''
}) => {
  // Process LaTeX string and determine display mode
  const { processedLatex, isBlockMode, hasError, errorMessage } = useMemo(() => {
    let processed = latex.trim();
    let blockMode = explicitDisplayMode ?? false;
    let error = false;
    let errMsg = '';

    // Auto-detect delimiters if displayMode not explicitly set
    if (explicitDisplayMode === undefined) {
      // Check for block delimiters ($$)
      if (processed.startsWith('$$') && processed.endsWith('$$')) {
        blockMode = true;
        processed = processed.slice(2, -2).trim();
      }
      // Check for inline delimiters (\( \))
      else if (processed.startsWith('\\(') && processed.endsWith('\\)')) {
        blockMode = false;
        processed = processed.slice(2, -2).trim();
      }
      // Legacy: Also support old $ delimiter (for backward compatibility)
      else if (processed.startsWith('$') && processed.endsWith('$')) {
        blockMode = false;
        processed = processed.slice(1, -1).trim();
      }
    } else {
      // Remove delimiters if present
      if (processed.startsWith('$$') && processed.endsWith('$$')) {
        processed = processed.slice(2, -2).trim();
      } else if (processed.startsWith('\\(') && processed.endsWith('\\)')) {
        processed = processed.slice(2, -2).trim();
      } else if (processed.startsWith('$') && processed.endsWith('$')) {
        processed = processed.slice(1, -1).trim();
      }
    }

    // Validate LaTeX by attempting to render
    try {
      if (!processed) {
        throw new Error('Empty LaTeX string');
      }
      // Test render to catch errors early
      katex.renderToString(processed, {
        displayMode: blockMode,
        throwOnError: true,
        strict: 'warn'
      });
    } catch (e) {
      error = true;
      errMsg = e instanceof Error ? e.message : 'Invalid LaTeX';
    }

    return {
      processedLatex: processed,
      isBlockMode: blockMode,
      hasError: error,
      errorMessage: errMsg
    };
  }, [latex, explicitDisplayMode]);

  // Render LaTeX to HTML string
  const renderedHtml = useMemo(() => {
    if (hasError) {
      return null;
    }

    try {
      return katex.renderToString(processedLatex, {
        displayMode: isBlockMode,
        throwOnError: true,
        strict: 'warn',
        trust: false // Security: don't trust user input
      });
    } catch (e) {
      return null;
    }
  }, [processedLatex, isBlockMode, hasError]);

  // Generate accessible description
  const accessibleLabel = useMemo(() => {
    if (ariaLabel) {
      return ariaLabel;
    }
    // Fallback: use raw LaTeX as description
    return `Math equation: ${processedLatex}`;
  }, [ariaLabel, processedLatex]);

  // Error state: show raw text with error indicator
  if (hasError || !renderedHtml) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm font-mono ${className}`}
        role="alert"
        aria-label={`LaTeX error: ${processedLatex}`}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate max-w-full">{processedLatex}</span>
      </span>
    );
  }

  // Success state: render LaTeX
  const containerClasses = isBlockMode
    ? `block text-center my-4 ${className}`
    : `inline ${className}`;

  return (
    <span
      className={containerClasses}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      aria-label={accessibleLabel}
      role="img"
    />
  );
});

// Display name for debugging
MathDisplay.displayName = 'MathDisplay';

export default MathDisplay;
