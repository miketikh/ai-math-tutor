/**
 * Math Utilities - Plain Text to LaTeX Conversion
 *
 * This module provides utilities to convert plain text math notation
 * into proper LaTeX format for rendering with KaTeX/MathDisplay component.
 *
 * Features:
 * - Converts exponents: x^2 → x^{2}, x^10 → x^{10}
 * - Converts fractions: 1/2 → \frac{1}{2}, (a+b)/(c+d) → \frac{a+b}{c+d}
 * - Converts square roots: sqrt(x) → \sqrt{x}, sqrt(x+5) → \sqrt{x+5}
 * - Preserves LaTeX input (doesn't double-convert)
 * - Handles common operators: +, -, *, /, =
 * - Optional multiplication operator: 2*x → 2 \cdot x
 */

/**
 * Checks if the input string already contains LaTeX commands
 * to avoid double-conversion
 */
export function isAlreadyLatex(input: string): boolean {
  // List of common LaTeX commands that indicate the input is already LaTeX
  const latexPatterns = [
    /\\frac\{/,        // \frac{
    /\\sqrt\{/,        // \sqrt{
    /\\int/,           // \int
    /\\sum/,           // \sum
    /\\prod/,          // \prod
    /\\lim/,           // \lim
    /\\sin/,           // \sin, \sinh, etc.
    /\\cos/,           // \cos, \cosh, etc.
    /\\tan/,           // \tan, \tanh, etc.
    /\\log/,           // \log, \ln
    /\\alpha/,         // \alpha, etc. (Greek letters)
    /\\beta/,
    /\\gamma/,
    /\\delta/,
    /\\theta/,
    /\\pi/,
    /\\infty/,         // \infty
    /\\partial/,       // \partial
    /\\nabla/,         // \nabla
    /\\cdot/,          // \cdot
    /\\times/,         // \times
    /\\div/,           // \div
    /\\pm/,            // \pm
    /\\leq/,           // \leq
    /\\geq/,           // \geq
    /\\neq/,           // \neq
    /\\approx/,        // \approx
    /\\equiv/,         // \equiv
    /\\left[(\[{]/,    // \left(, \left[, \left{
    /\\right[)\]}]/,   // \right), \right], \right}
  ];

  return latexPatterns.some(pattern => pattern.test(input));
}

/**
 * Converts plain text exponents to LaTeX format
 *
 * Examples:
 * - x^2 → x^{2}
 * - x^10 → x^{10}
 * - 2x^2 + 3x^5 → 2x^{2} + 3x^{5}
 */
export function convertExponents(input: string): string {
  // Match exponents with multi-digit or complex expressions
  // Pattern: base^exponent where exponent is not already in braces
  return input.replace(/(\w|\))(\^)(\d+|\w)/g, (match, base, caret, exp) => {
    // If exponent is single character and already has braces, skip
    if (exp.length === 1) {
      // Single digit/char - wrap in braces
      return `${base}^{${exp}}`;
    }
    // Multi-digit - wrap in braces
    return `${base}^{${exp}}`;
  });
}

/**
 * Converts plain text fractions to LaTeX \frac format
 *
 * Examples:
 * - 1/2 → \frac{1}{2}
 * - (a+b)/(c+d) → \frac{a+b}{c+d}
 * - x/y → \frac{x}{y}
 *
 * Handles:
 * - Simple fractions: a/b
 * - Parenthesized expressions: (expr)/(expr)
 * - Numbers: 1/2, 10/25
 */
export function convertFractions(input: string): string {
  // Handle parenthesized fractions first: (numerator)/(denominator)
  let result = input.replace(
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
    (match, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Handle single parenthesis: (expr)/x or x/(expr)
  result = result.replace(
    /\(([^()]+)\)\s*\/\s*([a-zA-Z0-9]+)/g,
    (match, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );
  result = result.replace(
    /([a-zA-Z0-9]+)\s*\/\s*\(([^()]+)\)/g,
    (match, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Handle simple fractions: number/number or variable/variable
  // But avoid converting if already part of \frac
  result = result.replace(
    /(?<!\\frac\{[^}]*)(\d+|[a-zA-Z])\s*\/\s*(\d+|[a-zA-Z])(?![^{]*\})/g,
    (match, num, den) => {
      // Don't convert if this is inside a \frac we just created
      return `\\frac{${num}}{${den}}`;
    }
  );

  return result;
}

/**
 * Converts plain text square root notation to LaTeX \sqrt format
 *
 * Examples:
 * - sqrt(16) → \sqrt{16}
 * - sqrt(x) → \sqrt{x}
 * - sqrt(x+5) → \sqrt{x+5}
 * - sqrt(x^2 + 1) → \sqrt{x^2 + 1}
 *
 * Handles nested parentheses in the argument
 */
export function convertSquareRoots(input: string): string {
  // Match sqrt(expression) where expression can contain nested parens
  // We'll use a simple approach: match sqrt( and find the closing )

  let result = input;
  const sqrtPattern = /sqrt\s*\(/g;
  let match;

  while ((match = sqrtPattern.exec(result)) !== null) {
    const startIndex = match.index;
    const openParenIndex = match.index + match[0].length - 1;

    // Find matching closing parenthesis
    let parenCount = 1;
    let closeParenIndex = openParenIndex + 1;

    while (closeParenIndex < result.length && parenCount > 0) {
      if (result[closeParenIndex] === '(') {
        parenCount++;
      } else if (result[closeParenIndex] === ')') {
        parenCount--;
      }
      closeParenIndex++;
    }

    if (parenCount === 0) {
      // Found matching closing paren
      const argument = result.substring(openParenIndex + 1, closeParenIndex - 1);
      const replacement = `\\sqrt{${argument}}`;

      result = result.substring(0, startIndex) + replacement + result.substring(closeParenIndex);

      // Reset regex to account for the replacement
      sqrtPattern.lastIndex = startIndex + replacement.length;
    }
  }

  return result;
}

/**
 * Converts explicit multiplication operator to LaTeX \cdot
 *
 * Examples:
 * - 2*x → 2 \cdot x
 * - a*b → a \cdot b
 *
 * Note: Implicit multiplication like "2x" is preserved as-is
 */
export function convertMultiplication(input: string): string {
  // Convert * to \cdot, but preserve implicit multiplication
  return input.replace(/\s*\*\s*/g, ' \\cdot ');
}

/**
 * Main conversion function: Plain text math notation to LaTeX
 *
 * This function orchestrates all conversions in the proper order
 * to avoid conflicts between different conversion rules.
 *
 * Features:
 * - Auto-detects if input is already LaTeX (no conversion needed)
 * - Converts in specific order to avoid conflicts
 * - Preserves original input on error (fallback)
 * - Handles edge cases (empty string, whitespace-only)
 *
 * @param input - Plain text math notation or LaTeX
 * @returns LaTeX-formatted string
 *
 * @example
 * convertToLatex("x^2 + 5x + 6 = 0")
 * // Returns: "x^{2} + 5x + 6 = 0"
 *
 * @example
 * convertToLatex("sqrt(16) = 4")
 * // Returns: "\sqrt{16} = 4"
 *
 * @example
 * convertToLatex("1/2 + 1/3 = 5/6")
 * // Returns: "\frac{1}{2} + \frac{1}{3} = \frac{5}{6}"
 *
 * @example
 * convertToLatex("\\int x^2 dx")
 * // Returns: "\int x^2 dx" (no change - already LaTeX)
 */
export function convertToLatex(input: string): string {
  // Edge case: empty or whitespace-only input
  if (!input || input.trim() === '') {
    return input;
  }

  // Edge case: already LaTeX - return unchanged
  if (isAlreadyLatex(input)) {
    return input;
  }

  try {
    let result = input;

    // Order matters! Convert in this sequence:
    // 1. Square roots (to avoid interfering with other conversions)
    result = convertSquareRoots(result);

    // 2. Exponents (before fractions, so we can handle x^2/y correctly)
    result = convertExponents(result);

    // 3. Fractions (after exponents, so x^2/y becomes x^{2}/y then \frac{x^{2}}{y})
    result = convertFractions(result);

    // 4. Multiplication operator (last, to avoid interfering with others)
    result = convertMultiplication(result);

    return result;
  } catch (error) {
    // Fallback: if any conversion fails, return original input
    console.error('Error converting to LaTeX:', error);
    return input;
  }
}

/**
 * Type definition for conversion result with metadata
 */
export interface ConversionResult {
  /** The converted LaTeX string */
  latex: string;
  /** Whether the input was already LaTeX */
  wasAlreadyLatex: boolean;
  /** Whether any conversion was applied */
  wasConverted: boolean;
  /** Original input (for fallback/comparison) */
  original: string;
}

/**
 * Enhanced conversion function that returns metadata about the conversion
 *
 * Useful for debugging or displaying conversion info to users
 *
 * @param input - Plain text math notation or LaTeX
 * @returns Conversion result with metadata
 */
export function convertToLatexWithMetadata(input: string): ConversionResult {
  const original = input;
  const alreadyLatex = isAlreadyLatex(input);
  const latex = convertToLatex(input);
  const wasConverted = !alreadyLatex && latex !== original;

  return {
    latex,
    wasAlreadyLatex: alreadyLatex,
    wasConverted,
    original
  };
}
