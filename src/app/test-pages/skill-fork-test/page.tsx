'use client';

import React, { useState } from 'react';
import SkillFork from '@/components/tutoring/SkillFork';

/**
 * Test page for SkillFork component
 *
 * This page allows interactive testing of the SkillFork component with
 * different skill data and configurations.
 */
export default function SkillForkTestPage() {
  const [callbackLog, setCallbackLog] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState(0);

  // Sample skills for testing
  const testSkills = [
    {
      name: 'One-Step Equations',
      description: 'Master this first, then you\'ll be ready for two-step equations!',
      problemCount: 5,
    },
    {
      name: 'Understanding Variables',
      description: 'Learn what variables represent and how to work with them in equations.',
      problemCount: 4,
    },
    {
      name: 'Distributive Property',
      description: 'Learn how to multiply a number by a sum or difference.',
      problemCount: 3,
    },
    {
      name: 'Percentages',
      description: 'Understand how to calculate and work with percentages in real-world problems.',
      problemCount: 6,
    },
  ];

  const currentSkill = testSkills[selectedSkill];

  const handleStartPractice = () => {
    const message = `Started practice for: ${currentSkill.name} (${currentSkill.problemCount} problems)`;
    setCallbackLog([...callbackLog, message]);
    console.log(message);
  };

  const clearLog = () => {
    setCallbackLog([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            SkillFork Component Test Page
          </h1>

          {/* Skill Selector */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Select Test Skill:
            </label>
            {testSkills.map((skill, index) => (
              <button
                key={index}
                onClick={() => setSelectedSkill(index)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                  ${
                    selectedSkill === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {skill.name}
              </button>
            ))}
          </div>

          {/* Current Skill Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm">
              <strong className="text-blue-900">Current Skill:</strong>
              <span className="text-blue-700 ml-2">{currentSkill.name}</span>
            </div>
            <div className="text-sm mt-1">
              <strong className="text-blue-900">Description:</strong>
              <span className="text-blue-700 ml-2">{currentSkill.description}</span>
            </div>
            <div className="text-sm mt-1">
              <strong className="text-blue-900">Problem Count:</strong>
              <span className="text-blue-700 ml-2">{currentSkill.problemCount}</span>
            </div>
          </div>

          {/* Callback Log */}
          {callbackLog.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm text-green-900">
                  Callback Log ({callbackLog.length}):
                </strong>
                <button
                  onClick={clearLog}
                  className="text-xs text-green-700 hover:text-green-900 font-medium"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {callbackLog.map((log, index) => (
                  <div key={index} className="text-sm text-green-700 font-mono">
                    {index + 1}. {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Under Test */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Component Preview
          </h2>

          <SkillFork
            skill={{
              name: currentSkill.name,
              description: currentSkill.description,
            }}
            onStartPractice={handleStartPractice}
            problemCount={currentSkill.problemCount}
          />
        </div>

        {/* Testing Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Testing Checklist
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-1" />
              <label htmlFor="test-1" className="text-sm text-gray-700">
                <strong>Visual:</strong> Verify skill name and description display correctly
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-2" />
              <label htmlFor="test-2" className="text-sm text-gray-700">
                <strong>Animation:</strong> Component slides up and fades in on mount
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-3" />
              <label htmlFor="test-3" className="text-sm text-gray-700">
                <strong>CTA Button:</strong> Click &quot;Practice This&quot; button - verify callback fires in log
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-4" />
              <label htmlFor="test-4" className="text-sm text-gray-700">
                <strong>Problem Count:</strong> Button shows correct number of problems
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-5" />
              <label htmlFor="test-5" className="text-sm text-gray-700">
                <strong>Gradient:</strong> Skill card has blue-to-purple gradient background
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-6" />
              <label htmlFor="test-6" className="text-sm text-gray-700">
                <strong>Icons:</strong> Target emoji (🎯) and lock icon (🔒) display correctly
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-7" />
              <label htmlFor="test-7" className="text-sm text-gray-700">
                <strong>Secondary Option:</strong> &quot;Watch explanation&quot; button is visible
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-8" />
              <label htmlFor="test-8" className="text-sm text-gray-700">
                <strong>Encouragement:</strong> Text shows &quot;After this, you&apos;ll return...&quot; message
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-9" />
              <label htmlFor="test-9" className="text-sm text-gray-700">
                <strong>Mobile (Resize to &lt;640px):</strong> Layout is responsive and doesn&apos;t break
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-10" />
              <label htmlFor="test-10" className="text-sm text-gray-700">
                <strong>Mobile:</strong> &quot;Why this skill?&quot; expandable section works on small screens
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-11" />
              <label htmlFor="test-11" className="text-sm text-gray-700">
                <strong>Hover Effects:</strong> Buttons scale slightly on hover
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-12" />
              <label htmlFor="test-12" className="text-sm text-gray-700">
                <strong>Focus States:</strong> Tab navigation shows focus rings on buttons
              </label>
            </div>
          </div>
        </div>

        {/* Device Simulation Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            📱 Mobile Testing Instructions
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            To test mobile view:
          </p>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1 ml-2">
            <li>Open browser DevTools (F12 or Cmd+Opt+I)</li>
            <li>Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)</li>
            <li>Select iPhone 12 Pro or similar device</li>
            <li>Test portrait and landscape orientations</li>
            <li>Verify touch targets are easily tappable (44px minimum)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
