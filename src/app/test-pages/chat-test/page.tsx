'use client';

import React from 'react';
import ChatMessage from '@/components/ChatMessage';

/**
 * Chat Test Page
 *
 * Demonstrates the ChatMessage component with various test cases:
 * - Pure text messages
 * - Pure equation messages
 * - Mixed text and inline equations
 * - Block equations
 * - Multiple equations in one message
 * - Both user and assistant messages
 */
export default function ChatTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ChatMessage Component Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Story 3.4: Integrate LaTeX Rendering into Chat Messages
          </p>
        </div>

        {/* Test Cases */}
        <div className="space-y-8">
          {/* Section 1: Pure Text */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Pure Text Messages
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="Hello! I need help with my math homework."
                role="user"
              />
              <ChatMessage
                message="Of course! I'd be happy to help. What problem are you working on?"
                role="assistant"
              />
            </div>
          </section>

          {/* Section 2: Pure Equations */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Pure Equation Messages
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="$$x^2 + 5x + 6 = 0$$"
                role="user"
              />
              <ChatMessage
                message="$$\int_0^1 x^2 dx = \frac{1}{3}$$"
                role="assistant"
              />
            </div>
          </section>

          {/* Section 3: Inline Equations */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Mixed Text + Inline Equations
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="The solution is $x^2 + 5x + 6 = 0$ which factors to $(x+2)(x+3) = 0$."
                role="user"
              />
              <ChatMessage
                message="Great! Now, what does that tell you about the values of $x$ that satisfy the equation?"
                role="assistant"
              />
              <ChatMessage
                message="I think $x = -2$ or $x = -3$ would work."
                role="user"
              />
              <ChatMessage
                message="Excellent reasoning! You're correct that $x = -2$ and $x = -3$ are the solutions."
                role="assistant"
              />
            </div>
          </section>

          {/* Section 4: Block Equations in Context */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Block Equations with Surrounding Text
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="I'm stuck on this calculus problem: $$\int_0^{\pi} \sin(x) dx$$"
                role="user"
              />
              <ChatMessage
                message="Let's work through it step by step. First, what's the antiderivative of $\sin(x)$?"
                role="assistant"
              />
              <ChatMessage
                message="I think it's $-\cos(x)$, so the answer would be: $$-\cos(x) \Big|_0^{\pi} = -\cos(\pi) - (-\cos(0)) = -(-1) + 1 = 2$$"
                role="user"
              />
              <ChatMessage
                message="Perfect! You've got it. The definite integral equals 2."
                role="assistant"
              />
            </div>
          </section>

          {/* Section 5: Multiple Equations */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Multiple Equations in One Message
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="I need to solve both $x^2 - 4 = 0$ and $2x + 6 = 0$ for my homework."
                role="user"
              />
              <ChatMessage
                message="Let's tackle them one at a time. For $x^2 - 4 = 0$, what can you tell me about this equation? And for $2x + 6 = 0$, what's your first step?"
                role="assistant"
              />
              <ChatMessage
                message="For the first one, $x^2 = 4$ so $x = 2$ or $x = -2$. For the second, I subtract 6: $2x = -6$, then divide by 2: $x = -3$."
                role="user"
              />
            </div>
          </section>

          {/* Section 6: Complex Equations */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Complex Mathematical Expressions
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="How do I approach this limit: $$\lim_{x \to 0} \frac{\sin(x)}{x}$$"
                role="user"
              />
              <ChatMessage
                message="This is a famous limit! Before we use L'Hôpital's rule, what happens if you try to substitute $x = 0$ directly into $\frac{\sin(x)}{x}$?"
                role="assistant"
              />
              <ChatMessage
                message="I get $\frac{0}{0}$ which is indeterminate. So that's why we need special techniques."
                role="user"
              />
              <ChatMessage
                message="Exactly! The indeterminate form $\frac{0}{0}$ tells us we need to investigate further. This particular limit equals 1, which you can prove using L'Hôpital's rule or the Taylor series expansion: $$\sin(x) = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots$$"
                role="assistant"
              />
            </div>
          </section>

          {/* Section 7: Geometry */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Geometry with Mixed Content
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="In a right triangle, if the hypotenuse is $c$ and the legs are $a$ and $b$, then: $$a^2 + b^2 = c^2$$"
                role="user"
              />
              <ChatMessage
                message="That's the Pythagorean theorem! Now, if $a = 3$ and $b = 4$, can you find $c$?"
                role="assistant"
              />
              <ChatMessage
                message="Sure! Using the formula: $3^2 + 4^2 = c^2$, so $9 + 16 = 25 = c^2$, which means $c = 5$."
                role="user"
              />
            </div>
          </section>

          {/* Section 8: Matrices and Vectors */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Advanced: Matrices and Vectors
            </h2>
            <div className="space-y-4">
              <ChatMessage
                message="I have this matrix multiplication problem: $$\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 5 \\ 11 \end{bmatrix}$$"
                role="user"
              />
              <ChatMessage
                message="Good! This is a system of linear equations. Can you write out what the first row tells you about $x$ and $y$?"
                role="assistant"
              />
              <ChatMessage
                message="The first row gives me $1 \cdot x + 2 \cdot y = 5$, so $x + 2y = 5$."
                role="user"
              />
            </div>
          </section>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Acceptance Criteria Checklist
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>Chat message component detects LaTeX delimiters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>Inline equations render within text flow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>Block equations render centered and larger</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>Mixed text + equations display correctly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>No layout shifts during rendering (proper spacing and padding)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span>Equations render in both student and AI messages</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
