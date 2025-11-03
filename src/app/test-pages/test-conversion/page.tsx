'use client';

import React, { useState } from 'react';
import MathDisplay from '@/components/MathDisplay';
import { convertToLatex, convertToLatexWithMetadata, ConversionResult } from '@/lib/mathUtils';

/**
 * Test page for Plain Text to LaTeX conversion
 *
 * This page demonstrates the auto-conversion feature that allows
 * students to type plain text math notation and see it rendered
 * beautifully as LaTeX.
 */
export default function TestConversionPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleConvert = () => {
    if (input.trim()) {
      const conversionResult = convertToLatexWithMetadata(input);
      setResult(conversionResult);
    }
  };

  const handleTestExample = (example: string) => {
    setInput(example);
    const conversionResult = convertToLatexWithMetadata(example);
    setResult(conversionResult);
  };

  // Test examples from acceptance criteria
  const testExamples = [
    {
      category: 'Exponents',
      examples: [
        { input: 'x^2', description: 'Simple exponent' },
        { input: 'x^10', description: 'Multi-digit exponent' },
        { input: 'x^2 + 5x + 6 = 0', description: 'Quadratic equation' },
        { input: '2x^2 + 3x^5 - x^3', description: 'Multiple exponents' },
      ]
    },
    {
      category: 'Fractions',
      examples: [
        { input: '1/2', description: 'Simple fraction' },
        { input: '1/2 + 1/3 = 5/6', description: 'Fraction equation' },
        { input: '(a+b)/(c+d)', description: 'Complex fraction' },
        { input: 'x/y', description: 'Variable fraction' },
      ]
    },
    {
      category: 'Square Roots',
      examples: [
        { input: 'sqrt(16) = 4', description: 'Square root equation' },
        { input: 'sqrt(x)', description: 'Variable square root' },
        { input: 'sqrt(x+5)', description: 'Expression in root' },
        { input: 'sqrt(x^2 + 1)', description: 'Complex expression' },
      ]
    },
    {
      category: 'Combined Operations',
      examples: [
        { input: 'x^2 + sqrt(16)', description: 'Exponent + root' },
        { input: '1/2 * x^2', description: 'Fraction + exponent' },
        { input: 'sqrt(x^2 + y^2)', description: 'Pythagorean' },
        { input: '(x^2 + 1)/(x - 1)', description: 'Complex rational' },
      ]
    },
    {
      category: 'Already LaTeX (No Conversion)',
      examples: [
        { input: '\\int x^2 dx', description: 'Integral' },
        { input: '\\frac{1}{2}', description: 'LaTeX fraction' },
        { input: '\\sqrt{16}', description: 'LaTeX square root' },
        { input: '\\sum_{i=1}^n i', description: 'Summation' },
      ]
    },
    {
      category: 'Operators',
      examples: [
        { input: '2*x', description: 'Explicit multiplication' },
        { input: 'a*b + c*d', description: 'Multiple multiplications' },
        { input: 'x + y - z', description: 'Addition and subtraction' },
        { input: 'a = b', description: 'Equals operator' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Plain Text to LaTeX Converter
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Type plain text math notation and see it automatically converted to beautifully rendered LaTeX.
            Students don't need to know LaTeX syntax!
          </p>
        </div>

        {/* Interactive Converter */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
            Try It Yourself
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="math-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Enter math expression:
              </label>
              <input
                id="math-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                placeholder="e.g., x^2 + 5x + 6 = 0"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono"
              />
            </div>

            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Convert to LaTeX
            </button>

            {result && (
              <div className="mt-6 space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                {/* Conversion Info */}
                <div className="flex items-center gap-4 text-sm">
                  {result.wasAlreadyLatex ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Already LaTeX - No conversion needed
                    </span>
                  ) : result.wasConverted ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Converted successfully
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      No changes made
                    </span>
                  )}
                </div>

                {/* Original Input */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Original Input:</h3>
                  <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-mono text-zinc-800 dark:text-zinc-200">
                    {result.original}
                  </div>
                </div>

                {/* Converted LaTeX */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">LaTeX Code:</h3>
                  <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-mono text-zinc-800 dark:text-zinc-200">
                    {result.latex}
                  </div>
                </div>

                {/* Rendered Result */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Rendered Result:</h3>
                  <div className="px-4 py-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <div className="text-center text-2xl">
                      <MathDisplay latex={result.latex} displayMode={true} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Examples */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
            Test Examples
          </h2>

          {testExamples.map((category, catIndex) => (
            <div key={catIndex} className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-3">
                {category.category}
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {category.examples.map((example, exIndex) => {
                  const conversionResult = convertToLatexWithMetadata(example.input);
                  return (
                    <div
                      key={exIndex}
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer"
                      onClick={() => handleTestExample(example.input)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {example.description}
                        </h4>
                        <button
                          className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestExample(example.input);
                          }}
                        >
                          Test
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Input:</div>
                          <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded font-mono text-sm text-zinc-800 dark:text-zinc-200">
                            {example.input}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                            {conversionResult.wasAlreadyLatex ? 'LaTeX (unchanged):' : 'Converted to:'}
                          </div>
                          <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded font-mono text-sm text-zinc-800 dark:text-zinc-200 break-all">
                            {conversionResult.latex}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Renders as:</div>
                          <div className="px-3 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded text-center">
                            <MathDisplay latex={conversionResult.latex} displayMode={true} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Acceptance Criteria Validation */}
        <div className="mt-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-green-900 dark:text-green-100 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Acceptance Criteria Validation
          </h2>

          <div className="space-y-3 text-green-900 dark:text-green-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Utility function converts common notation to LaTeX</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Conversions: "x^2" → "x^{'{2}'}", "1/2" → "\frac{'{1}'}{'{2}'}", "sqrt(x)" → "\sqrt{'{x}'}"</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Preserves LaTeX input unchanged (doesn't double-convert)</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Handles common operators: +, -, *, /, =</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Displays converted equation with MathDisplay component</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Original text preserved in case conversion fails (fallback with try-catch)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
