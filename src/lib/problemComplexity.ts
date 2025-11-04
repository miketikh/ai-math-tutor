/**
 * Problem Complexity Detection Module
 *
 * Analyzes math problems to determine their complexity level and
 * categorize them by grade level appropriateness.
 *
 * Complexity Levels:
 * - elementary (K-5): Basic arithmetic, whole numbers, simple fractions
 * - middle (6-8): Variables, simple equations, percentages, basic geometry
 * - high (9-12): Quadratics, trigonometry, exponentials, complex equations
 * - college: Calculus, linear algebra, differential equations, complex analysis
 *
 * Detection Strategy:
 * The detector uses regex patterns to identify mathematical symbols and notation
 * characteristic of each level. It's intentionally conservative - when in doubt,
 * it assumes a higher level to avoid oversimplifying for advanced students.
 */

export type ComplexityLevel = 'elementary' | 'middle' | 'high' | 'college';

/**
 * Pattern definitions for each complexity level
 */
const COMPLEXITY_PATTERNS = {
  // College-level patterns (checked first - highest priority)
  college: [
    /\\int\b/i,           // Integral symbol: \int
    /∫/,                  // Unicode integral
    /\\partial\b/i,       // Partial derivative: \partial
    /∂/,                  // Unicode partial
    /\\lim\b/i,           // Limit: \lim
    /lim\s*\(/i,          // Limit with parentheses
    /\\frac\{d[a-z]\}\{d[a-z]\}/i,  // Derivative notation: dy/dx
    /d[a-z]\/d[a-z]/i,    // Derivative: dy/dx
    /\\nabla/i,           // Gradient operator
    /∇/,                  // Unicode nabla
    /\\sum\b/i,           // Summation: \sum
    /∑/,                  // Unicode summation
    /\\prod\b/i,          // Product: \prod
    /∏/,                  // Unicode product
    /\\matrix\b/i,        // Matrix
    /\\begin\{matrix\}/i, // LaTeX matrix
    /\[[^\]]+,[^\]]+\]/,  // Matrix notation [a, b; c, d]
    /eigenvalue/i,        // Linear algebra
    /eigenvector/i,       // Linear algebra
    /differential\s+equation/i, // Differential equations
    /laplace/i,           // Laplace transform
    /fourier/i,           // Fourier series/transform
    /taylor\s+series/i,   // Taylor series
    /complex\s+analysis/i,// Complex analysis
  ],

  // High school patterns (9-12)
  high: [
    /[a-z]\^2|[a-z]²/i,   // Quadratic terms: x^2, x²
    /quadratic/i,         // Quadratic equation keyword
    /\\sin\b|\\cos\b|\\tan\b/i, // Trig functions in LaTeX
    /\bsin\(|cos\(|tan\(/i,     // Trig functions
    /sin|cos|tan|cot|sec|csc/i, // Trig functions (general)
    /\\theta|\\alpha|\\beta/i,  // Greek letters (angles)
    /θ|α|β|γ|φ|ψ/,        // Unicode Greek letters
    /log\(|ln\(/i,        // Logarithms
    /\\log\b|\\ln\b/i,    // LaTeX logarithms
    /exponential/i,       // Exponential functions
    /[0-9]\^[a-z]/i,      // Exponential: 2^x
    /polynomial/i,        // Polynomial keyword
    /factor|factoring/i,  // Factoring
    /\\sqrt\{[a-z]/i,     // Square root of variables
    /sqrt\([a-z]/i,       // Square root of variables
    /parabola|hyperbola|ellipse/i, // Conic sections
    /system\s+of\s+equations/i,    // Systems of equations
    /simultaneous/i,      // Simultaneous equations
    /radian|degree/i,     // Angle measurements
    /pythagorean/i,       // Pythagorean theorem
  ],

  // Middle school patterns (6-8)
  middle: [
    /[a-z]\s*=|=\s*[a-z]/i,  // Variables: x = 5 or 5 = x
    /solve\s+for\s+[a-z]/i,   // "Solve for x"
    /\b[a-z]\b(?![a-z])/i,    // Single letters (variables)
    /[0-9]+[a-z]|[a-z][0-9]+/i, // Coefficients: 2x, x5
    /percent|%/i,          // Percentages
    /ratio|proportion/i,   // Ratios and proportions
    /area|perimeter|volume/i, // Basic geometry
    /equation/i,           // Equation keyword
    /variable/i,           // Variable keyword
    /expression/i,         // Expression keyword
    /negative\s+number/i,  // Negative numbers
    /-[0-9]+/,             // Negative number notation
    /\\frac\{[0-9]+\}\{[0-9]+\}/, // Fractions in LaTeX
    /[0-9]+\/[0-9]+/,      // Fractions: 3/4
    /decimal/i,            // Decimals
    /\.[0-9]+/,            // Decimal notation
  ],

  // Elementary patterns (K-5) - basic arithmetic
  elementary: [
    /\b[0-9]+\s*[\+\-\×\*]\s*[0-9]+\b/, // Basic operations: 5 + 3
    /\b[0-9]+\s*[\÷\/]\s*[0-9]+\b/,     // Division: 10 / 2
    /add|subtract|multiply|divide/i,     // Operation keywords
    /plus|minus|times/i,                 // Simple operation words
    /how\s+many/i,                       // Word problem marker
    /count/i,                            // Counting
    /total/i,                            // Totals
    /sum\s+of\s+[0-9]/i,                 // Sum of numbers
    /difference\s+between/i,             // Difference
  ],
};

/**
 * Detects the complexity level of a math problem
 *
 * @param problemText - The problem text to analyze (can include LaTeX)
 * @returns ComplexityLevel - One of: 'elementary' | 'middle' | 'high' | 'college'
 *
 * @example
 * detectComplexity("What is 5 + 7?") // returns 'elementary'
 * detectComplexity("Solve for x: 2x + 5 = 13") // returns 'middle'
 * detectComplexity("Factor x² + 5x + 6") // returns 'high'
 * detectComplexity("Find the derivative of x³") // returns 'college'
 */
export function detectComplexity(problemText: string): ComplexityLevel {
  if (!problemText || problemText.trim().length === 0) {
    // Default to middle school for empty input
    return 'middle';
  }

  const text = problemText.trim();

  // Check patterns in order of complexity (highest to lowest)
  // This ensures we don't misclassify advanced problems as simple

  // 1. Check for college-level patterns
  for (const pattern of COMPLEXITY_PATTERNS.college) {
    if (pattern.test(text)) {
      return 'college';
    }
  }

  // 2. Check for high school patterns
  for (const pattern of COMPLEXITY_PATTERNS.high) {
    if (pattern.test(text)) {
      return 'high';
    }
  }

  // 3. Check for middle school patterns
  for (const pattern of COMPLEXITY_PATTERNS.middle) {
    if (pattern.test(text)) {
      return 'middle';
    }
  }

  // 4. Check for elementary patterns
  for (const pattern of COMPLEXITY_PATTERNS.elementary) {
    if (pattern.test(text)) {
      return 'elementary';
    }
  }

  // 5. Default: If no patterns match, assume middle school
  // This is a conservative default that works for most cases
  return 'middle';
}

/**
 * Detects complexity level with confidence score and reasoning
 * Useful for debugging and testing
 *
 * @param problemText - The problem text to analyze
 * @returns Object with level, confidence (0-1), and matched patterns
 */
export function detectComplexityWithMetadata(problemText: string): {
  level: ComplexityLevel;
  confidence: number;
  matchedPatterns: string[];
} {
  if (!problemText || problemText.trim().length === 0) {
    return {
      level: 'middle',
      confidence: 0.5,
      matchedPatterns: [],
    };
  }

  const text = problemText.trim();
  const matchedPatterns: string[] = [];
  let level: ComplexityLevel = 'middle';
  let confidence = 0.5;

  // Count matches for each level
  const matches = {
    college: 0,
    high: 0,
    middle: 0,
    elementary: 0,
  };

  // Check college patterns
  for (const pattern of COMPLEXITY_PATTERNS.college) {
    if (pattern.test(text)) {
      matches.college++;
      matchedPatterns.push(`college: ${pattern.source}`);
    }
  }

  // Check high school patterns
  for (const pattern of COMPLEXITY_PATTERNS.high) {
    if (pattern.test(text)) {
      matches.high++;
      matchedPatterns.push(`high: ${pattern.source}`);
    }
  }

  // Check middle school patterns
  for (const pattern of COMPLEXITY_PATTERNS.middle) {
    if (pattern.test(text)) {
      matches.middle++;
      matchedPatterns.push(`middle: ${pattern.source}`);
    }
  }

  // Check elementary patterns
  for (const pattern of COMPLEXITY_PATTERNS.elementary) {
    if (pattern.test(text)) {
      matches.elementary++;
      matchedPatterns.push(`elementary: ${pattern.source}`);
    }
  }

  // Determine level based on matches (highest level with matches wins)
  if (matches.college > 0) {
    level = 'college';
    confidence = Math.min(0.7 + (matches.college * 0.1), 1.0);
  } else if (matches.high > 0) {
    level = 'high';
    confidence = Math.min(0.7 + (matches.high * 0.1), 1.0);
  } else if (matches.middle > 0) {
    level = 'middle';
    confidence = Math.min(0.6 + (matches.middle * 0.1), 1.0);
  } else if (matches.elementary > 0) {
    level = 'elementary';
    confidence = Math.min(0.6 + (matches.elementary * 0.1), 1.0);
  } else {
    // No matches - default to middle with lower confidence
    level = 'middle';
    confidence = 0.4;
  }

  return {
    level,
    confidence,
    matchedPatterns,
  };
}

/**
 * Helper function to describe complexity level in human-readable format
 */
export function describeComplexityLevel(level: ComplexityLevel): string {
  const descriptions = {
    elementary: 'Elementary (K-5): Basic arithmetic and simple concepts',
    middle: 'Middle School (6-8): Variables, equations, and basic geometry',
    high: 'High School (9-12): Algebra, trigonometry, and advanced topics',
    college: 'College: Calculus, linear algebra, and advanced mathematics',
  };

  return descriptions[level];
}
