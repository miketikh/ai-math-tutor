/**
 * Response Validation Utility
 *
 * This module detects if an AI response gave a direct answer, which violates
 * the Socratic teaching methodology. It acts as a fail-safe layer to catch
 * responses that slip through the system prompt.
 *
 * Detection Patterns:
 * - Numeric solutions: "x = 5", "the answer is 5", "= 5"
 * - Formula reveals: "use the quadratic formula: x = (-b ± √(b²-4ac))/2a"
 * - Solution steps: "first, subtract 5, then divide by 2"
 * - Final answers: "therefore, x equals...", "so the solution is..."
 *
 * NOTE: Level 3 hints (when student is very stuck) are allowed to be concrete,
 * but should still not give final numeric answers.
 */

export interface ValidationResult {
  isValid: boolean;
  violationType?: string;
  confidence?: number; // 0-1, how confident we are this is a violation
}

/**
 * Validates an AI response to ensure it doesn't give direct answers
 *
 * @param aiResponse - The response from the AI tutor
 * @returns ValidationResult with isValid flag and violation details
 */
export function validateResponse(aiResponse: string): ValidationResult {
  const response = aiResponse.toLowerCase();

  // Pattern 1: Numeric equations with equals signs
  // Matches: "x = 5", "y = 10", "the answer = 7"
  // But allows: "x = ?" or "what does x equal?"
  const numericEquationPattern = /(?:^|\s)([a-z]|answer|result|solution)\s*=\s*[-+]?\d+(?:\.\d+)?(?:\s|$|[.,!?])/;
  if (numericEquationPattern.test(response)) {
    // Check if it's in a question context (allowed)
    if (!response.includes('?') || response.indexOf('=') < response.indexOf('?')) {
      return {
        isValid: false,
        violationType: 'numeric_equation',
        confidence: 0.95
      };
    }
  }

  // Pattern 2: "The answer is..." or "The solution is..."
  const answerRevealPattern = /(the\s+)?(answer|solution|result)\s+is\s+[-+]?\d+/;
  if (answerRevealPattern.test(response)) {
    return {
      isValid: false,
      violationType: 'answer_reveal',
      confidence: 0.98
    };
  }

  // Pattern 3: "Therefore, x equals..." or "So x = ..."
  const conclusionPattern = /(therefore|thus|so|hence)[,\s]+(.*\s+)?(equals?|=)\s*[-+]?\d+/;
  if (conclusionPattern.test(response)) {
    return {
      isValid: false,
      violationType: 'conclusion_with_answer',
      confidence: 0.92
    };
  }

  // Pattern 4: Complete formula reveals with explicit syntax
  // Matches: "use the quadratic formula: x = (-b ± √(b²-4ac))/2a"
  // But allows: "have you considered the quadratic formula?"
  const completeFormulaPattern = /(?:use|apply|plug\s+into)\s+(?:the\s+)?[a-z\s]+formula\s*[:]\s*[a-z]\s*=/;
  if (completeFormulaPattern.test(response)) {
    return {
      isValid: false,
      violationType: 'complete_formula_reveal',
      confidence: 0.90
    };
  }

  // Pattern 5: Step-by-step solution sequences
  // Matches: "first, subtract 5, then divide by 2, giving you x = 10"
  // Looks for multiple sequential steps with final numeric result
  const stepSequencePattern = /(first|step\s+1)[,\s].+(then|next|step\s+2)[,\s].+[-+]?\d+/;
  const hasNumericResult = /(?:giving|yields?|results?\s+in|equals?)\s+[-+]?\d+/;
  if (stepSequencePattern.test(response) && hasNumericResult.test(response)) {
    return {
      isValid: false,
      violationType: 'step_by_step_solution',
      confidence: 0.88
    };
  }

  // Pattern 6: Direct calculation results
  // Matches: "5 + 3 = 8", "2 * 4 = 8", "15 / 3 = 5"
  // But only if presented as a statement, not a question
  const calculationPattern = /\d+\s*[+\-*/×÷]\s*\d+\s*=\s*\d+/;
  if (calculationPattern.test(response) && !response.includes('?')) {
    // Allow if it's clearly asking them to verify: "does 5 + 3 = 8?"
    const questionContext = /does|is|would|what\s+(?:is|does)/;
    if (!questionContext.test(response)) {
      return {
        isValid: false,
        violationType: 'direct_calculation',
        confidence: 0.85
      };
    }
  }

  // Pattern 7: Specific numeric hints that are too revealing
  // Matches: "substitute x = 5 into the equation"
  // This is borderline - Level 3 hints can be concrete, but not give final answers
  const substituteNumberPattern = /substitute\s+[a-z]\s*=\s*[-+]?\d+/;
  if (substituteNumberPattern.test(response)) {
    // Only flag if this appears to be THE answer, not a test value
    // Check for words like "the answer", "solution", "final"
    if (/(answer|solution|final|correct)/i.test(response)) {
      return {
        isValid: false,
        violationType: 'answer_substitution',
        confidence: 0.80
      };
    }
  }

  // Pattern 8: LaTeX/Math expressions with equals and numbers
  // Matches LaTeX-style equations: $x = 5$ or $$y = 10$$
  const latexEquationPattern = /\$+\s*[a-z]\s*=\s*[-+]?\d+(?:\.\d+)?\s*\$+/;
  if (latexEquationPattern.test(aiResponse)) { // Use original case for LaTeX
    return {
      isValid: false,
      violationType: 'latex_numeric_answer',
      confidence: 0.93
    };
  }

  // Pattern 9: "The value of x is..." or "x has a value of..."
  const valueRevealPattern = /(?:the\s+)?value\s+(?:of\s+)?[a-z]\s+(?:is|equals?|=)\s*[-+]?\d+/;
  if (valueRevealPattern.test(response)) {
    return {
      isValid: false,
      violationType: 'value_reveal',
      confidence: 0.90
    };
  }

  // Pattern 10: "You get x = 5" or "This gives x = 5"
  const resultImplicationPattern = /(?:you\s+)?(?:get|gives?|obtains?|finds?)\s+[a-z]\s*=\s*[-+]?\d+/;
  if (resultImplicationPattern.test(response)) {
    return {
      isValid: false,
      violationType: 'result_implication',
      confidence: 0.87
    };
  }

  // If we got here, no direct answer patterns detected
  return {
    isValid: true,
    confidence: 1.0
  };
}

/**
 * Gets a human-readable description of the violation type
 *
 * @param violationType - The type of violation detected
 * @returns A description string for logging
 */
export function getViolationDescription(violationType: string): string {
  const descriptions: Record<string, string> = {
    numeric_equation: 'Provided numeric equation (e.g., "x = 5")',
    answer_reveal: 'Explicitly revealed the answer (e.g., "the answer is 5")',
    conclusion_with_answer: 'Drew conclusion with numeric answer (e.g., "therefore x = 5")',
    complete_formula_reveal: 'Revealed complete formula with syntax (e.g., "use formula: x = ...")',
    step_by_step_solution: 'Provided step-by-step solution with final answer',
    direct_calculation: 'Showed direct calculation result (e.g., "5 + 3 = 8")',
    answer_substitution: 'Suggested substituting the final answer value',
    latex_numeric_answer: 'Provided numeric answer in LaTeX format',
    value_reveal: 'Explicitly stated the value (e.g., "the value of x is 5")',
    result_implication: 'Implied the result (e.g., "you get x = 5")',
  };

  return descriptions[violationType] || 'Unknown violation type';
}

/**
 * Generates a fallback response when validation fails after regeneration
 * This ensures we never leave the student without a response
 *
 * @param problemContext - Optional context about the current problem
 * @returns A generic Socratic response that doesn't reveal the answer
 */
export function generateFallbackResponse(problemContext?: string): string {
  // Generic Socratic responses that work for any problem type
  const fallbackResponses = [
    "Let me guide you through this with some questions instead. What information are you given in this problem?",
    "Great question! Let's think about this step by step. What's the first thing we need to understand about this problem?",
    "I want to make sure you discover this yourself. What do you know about problems like this one?",
    "Let's approach this together. What concepts or methods have you learned that might apply here?",
    "Good thinking! Instead of giving you the answer, let me ask: what's the relationship between the values in this problem?",
  ];

  // Choose a random fallback to add variety
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  let response = fallbackResponses[randomIndex];

  // If we have problem context, add a hint about it (without being specific)
  if (problemContext) {
    response += " Think about what the problem is asking you to find.";
  }

  return response;
}

/**
 * Quick test examples for development/debugging
 * These are not exhaustive - see test-response-validation.js for full tests
 */
export const TEST_EXAMPLES = {
  // Should be INVALID (direct answers)
  invalid: [
    "The answer is 5",
    "x = 5",
    "Therefore, x equals 5",
    "Use the quadratic formula: x = (-b ± √(b²-4ac))/2a",
    "First, subtract 5, then divide by 2, giving you x = 10",
    "5 + 3 = 8",
    "The solution is x = 7",
    "So x = 3",
    "$x = 5$",
    "The value of x is 10",
    "You get x = 5",
  ],

  // Should be VALID (Socratic hints, even concrete ones)
  valid: [
    "What operation would help you isolate x?",
    "Try subtracting 5 from both sides. What do you get?",
    "Have you considered the Pythagorean theorem?",
    "What happens when you substitute x = 2 to test if it works?", // Testing is OK
    "The quadratic formula might be useful here. Do you remember it?",
    "Let's think about what x could equal. What constraints do we have?",
    "Does x = 5 make sense if we plug it back into the equation?", // Asking is OK
    "What if we set up the equation? What would it look like?",
    "Try factoring this expression. What factors of 15 would work?",
    "You're close! Check your calculation - what's 3 times 4?", // Asking them to calculate
  ],
};
