/**
 * Language Adaptation Module
 *
 * Provides age-appropriate language guidance for the AI tutor based on
 * problem complexity level. Ensures vocabulary matches student grade level
 * while maintaining the Socratic teaching method.
 *
 * Philosophy:
 * - Elementary: Simple, friendly language that young students understand
 * - Middle School: Clear, accessible language with basic math terminology
 * - High School: Standard mathematical terminology students are learning
 * - College: Precise mathematical language with technical terminology
 *
 * The language guidance is appended to the system prompt to adjust vocabulary
 * while preserving the core Socratic teaching methodology.
 */

import { ComplexityLevel } from '../problemComplexity';

/**
 * Vocabulary guidelines for each complexity level
 * These are examples used in the prompt to guide the AI's language choices
 */
export const VOCABULARY_EXAMPLES = {
  elementary: {
    preferred: [
      'add up (not sum)',
      'take away (not subtract)',
      'groups of (not multiply)',
      'split into (not divide)',
      'put together',
      'how many more',
      'how many less',
      'altogether',
      'left over',
      'equals / is the same as',
    ],
    avoid: [
      'sum',
      'difference',
      'product',
      'quotient',
      'operand',
      'coefficient',
      'variable',
      'equation',
    ],
  },

  middle: {
    preferred: [
      'sum',
      'difference',
      'product',
      'quotient',
      'solve for',
      'variable',
      'equation',
      'expression',
      'simplify',
      'combine like terms',
      'isolate the variable',
    ],
    canIntroduce: [
      'Basic terminology: variable, equation, expression',
      'Operation names: sum, difference, product, quotient',
      'Simple geometry: area, perimeter, volume',
      'Basic concepts: negative numbers, fractions, decimals',
    ],
  },

  high: {
    preferred: [
      'evaluate',
      'simplify',
      'factor',
      'expand',
      'solve',
      'function',
      'quadratic',
      'polynomial',
      'theorem',
      'formula',
      'exponent',
      'base',
      'trigonometric',
    ],
    canUse: [
      'Standard terminology: quadratic, polynomial, exponential',
      'Function language: domain, range, input, output',
      'Geometry: Pythagorean theorem, trigonometric ratios',
      'Algebraic concepts: factoring, completing the square',
    ],
  },

  college: {
    preferred: [
      'integrate',
      'differentiate',
      'compute',
      'derive',
      'evaluate the integral',
      'find the derivative',
      'apply the theorem',
      'converge / diverge',
      'continuous',
      'differentiable',
      'matrix',
      'determinant',
      'eigenvalue',
    ],
    canUse: [
      'Calculus: integral, derivative, limit, continuity',
      'Linear algebra: matrix, vector, eigenvalue, determinant',
      'Advanced concepts: convergence, series, differential equations',
      'Precise notation: partial derivatives, gradients, Laplacians',
    ],
  },
};

/**
 * Gets language adaptation guidance for a given complexity level
 *
 * @param level - The complexity level of the problem
 * @returns String to append to the system prompt, or empty string if no adaptation needed
 */
export function getLanguageGuidance(level: ComplexityLevel): string {
  switch (level) {
    case 'elementary':
      return `

LANGUAGE ADAPTATION FOR ELEMENTARY STUDENTS (K-5):
===================================================

Use simple, friendly language appropriate for young students (ages 5-11).

VOCABULARY GUIDELINES:
- Say "add up" or "put together" instead of "sum"
- Say "take away" instead of "subtract" or "difference"
- Say "groups of" or "times" instead of "multiply" or "product"
- Say "split into" or "share" instead of "divide" or "quotient"
- Say "equals" or "is the same as" instead of "equivalent"
- Use concrete language: "How many more?" instead of "Find the difference"

EXAMPLES OF APPROPRIATE LANGUAGE:
✅ "Great! Let's add up these numbers. How many do we have when we put 5 and 7 together?"
✅ "If we take away 3 from 10, how many are left?"
✅ "Can you think of 4 groups of 2? How many altogether?"
✅ "If we split 12 cookies into 3 equal groups, how many in each group?"

AVOID:
❌ Technical terms: sum, difference, product, quotient, operand
❌ Abstract concepts: variables, equations, expressions
❌ Formal language: "compute", "calculate", "determine"

Keep explanations concrete and relatable to everyday experiences.
Use encouraging, warm language that makes math feel approachable and fun.`;

    case 'middle':
      return `

LANGUAGE ADAPTATION FOR MIDDLE SCHOOL STUDENTS (6-8):
======================================================

Use clear, accessible language while introducing basic mathematical terminology.

VOCABULARY GUIDELINES:
- Can use basic math terms: sum, difference, product, quotient
- Introduce variables: "x represents the unknown number"
- Use equation language: "solve for x", "both sides of the equation"
- Basic geometry terms: area, perimeter, volume
- Can discuss negative numbers, fractions, decimals, percentages

EXAMPLES OF APPROPRIATE LANGUAGE:
✅ "What operation would help you isolate the variable x?"
✅ "When we have 2x + 5, what does the coefficient 2 tell us?"
✅ "How can you check if your solution makes both sides of the equation equal?"
✅ "What's the relationship between the base and height in finding the area?"

CAN INTRODUCE AND EXPLAIN:
- Variable: "a letter that represents an unknown value"
- Equation: "a mathematical statement that two things are equal"
- Expression: "a combination of numbers and operations"
- Coefficient: "the number in front of a variable"

Keep language clear and accessible. When introducing new terms, briefly explain them.
Students at this level are building their math vocabulary, so support their learning.`;

    case 'high':
      return `

LANGUAGE ADAPTATION FOR HIGH SCHOOL STUDENTS (9-12):
=====================================================

Use standard mathematical terminology. Students understand formal math language.

VOCABULARY GUIDELINES:
- Use standard terms: evaluate, simplify, factor, expand, solve
- Function language: domain, range, f(x), input, output
- Algebra: quadratic, polynomial, exponential, logarithmic
- Geometry: theorem, proof, trigonometric ratios
- Can reference formulas and theorems by name

EXAMPLES OF APPROPRIATE LANGUAGE:
✅ "What methods do you know for solving quadratic equations?"
✅ "Which trigonometric ratio relates the opposite side to the hypotenuse?"
✅ "Can you identify the pattern in this polynomial function?"
✅ "What theorem might apply to this right triangle?"

CAN USE:
- Formal terminology: quadratic formula, Pythagorean theorem, FOIL method
- Function notation: f(x), g(x), f(g(x))
- Advanced concepts: factoring, completing the square, systems of equations
- Geometric terms: congruent, similar, complementary, supplementary

Students at this level are familiar with mathematical language and conventions.
Use precise terminology while maintaining the Socratic questioning approach.`;

    case 'college':
      return `

LANGUAGE ADAPTATION FOR COLLEGE STUDENTS:
==========================================

Use precise mathematical language. Students are comfortable with technical terminology.

VOCABULARY GUIDELINES:
- Calculus: integrate, differentiate, evaluate the limit, compute the derivative
- Linear algebra: matrix, vector, determinant, eigenvalue, linear transformation
- Advanced terms: converge, diverge, continuous, differentiable, analytic
- Precise notation: ∫, d/dx, ∂/∂x, ∇, Σ, Π
- Can reference theorems, rules, and methods by formal names

EXAMPLES OF APPROPRIATE LANGUAGE:
✅ "What integration technique would apply to this polynomial?"
✅ "How does the power rule help you find the derivative of x^n?"
✅ "What does the Fundamental Theorem of Calculus tell us here?"
✅ "What are the conditions for this series to converge?"
✅ "How would you compute the determinant of this 3×3 matrix?"

CAN USE:
- Calculus: Fundamental Theorem, chain rule, integration by parts, u-substitution
- Linear algebra: row reduction, eigendecomposition, basis vectors
- Analysis: epsilon-delta definition, uniform convergence, Cauchy sequences
- Advanced topics: differential equations, Fourier series, Laplace transforms

Students at this level expect precise mathematical language.
Use formal terminology while maintaining the Socratic teaching methodology.
Focus on understanding principles, not just mechanical application.`;

    default:
      // No language adaptation needed - use base prompt
      return '';
  }
}

/**
 * Helper function to describe language level in human-readable format
 */
export function describeLanguageLevel(level: ComplexityLevel): string {
  const descriptions = {
    elementary: 'Simple, friendly language for young learners (K-5)',
    middle: 'Clear language with basic math terminology (6-8)',
    high: 'Standard mathematical terminology (9-12)',
    college: 'Precise mathematical language with technical terms',
  };

  return descriptions[level];
}

/**
 * Gets a brief language example for each level
 * Useful for testing and documentation
 */
export function getLanguageExample(level: ComplexityLevel): {
  problem: string;
  goodResponse: string;
  badResponse: string;
} {
  switch (level) {
    case 'elementary':
      return {
        problem: 'What is 5 + 7?',
        goodResponse: "Great question! Let's add up these numbers. How many do we have when we put 5 and 7 together?",
        badResponse: 'The sum of 5 and 7 is 12. You add the operands to compute the result.',
      };

    case 'middle':
      return {
        problem: 'Solve for x: 2x + 5 = 13',
        goodResponse: "Good question! What operation would help you isolate the variable x? What's on both sides of the equation?",
        badResponse: 'Subtract 5 from both sides to get 2x = 8, then divide by the coefficient to find x = 4.',
      };

    case 'high':
      return {
        problem: 'Factor x² + 5x + 6',
        goodResponse: 'What methods do you know for factoring quadratic expressions? What two numbers multiply to 6 and add to 5?',
        badResponse: 'Add up x and 6 to find the answer. Put them together to get the total.',
      };

    case 'college':
      return {
        problem: 'Find ∫x² dx',
        goodResponse: 'What integration rule applies to polynomial terms of the form x^n? What does the power rule tell us about integrals?',
        badResponse: "Let's add up the x's to find how many we have altogether!",
      };

    default:
      return {
        problem: '',
        goodResponse: '',
        badResponse: '',
      };
  }
}
