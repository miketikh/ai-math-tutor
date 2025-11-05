'use client';

import React, { useState } from 'react';
import SkillMastered from '@/components/tutoring/SkillMastered';

/**
 * Test page for SkillMastered component
 *
 * This page allows interactive testing of the SkillMastered component with
 * different skill data and score configurations.
 */
export default function SkillMasteredTestPage() {
  const [callbackLog, setCallbackLog] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [testKey, setTestKey] = useState(0); // Key to force component remount for confetti

  // Test scenarios with different scores
  const testScenarios = [
    {
      name: 'Perfect Score (5/5)',
      skill: 'One-Step Equations',
      score: { correct: 5, total: 5 },
      expectedXP: 100,
      expectedOnFire: true,
    },
    {
      name: 'Great Score (4/5)',
      skill: 'Understanding Variables',
      score: { correct: 4, total: 5 },
      expectedXP: 80,
      expectedOnFire: true,
    },
    {
      name: 'Good Score (3/5)',
      skill: 'Distributive Property',
      score: { correct: 3, total: 5 },
      expectedXP: 60,
      expectedOnFire: false,
    },
    {
      name: 'Minimum Pass (3/4)',
      skill: 'Percentages',
      score: { correct: 3, total: 4 },
      expectedXP: 60,
      expectedOnFire: true,
    },
    {
      name: 'High Volume (8/10)',
      skill: 'Two-Step Equations',
      score: { correct: 8, total: 10 },
      expectedXP: 160,
      expectedOnFire: true,
    },
  ];

  const currentScenario = testScenarios[selectedScenario];

  const handleReturn = () => {
    const message = `Returned to main problem from: ${currentScenario.skill}`;
    setCallbackLog([...callbackLog, message]);
    console.log(message);
  };

  const handlePracticeMore = () => {
    const message = `Practice 5 more problems for: ${currentScenario.skill}`;
    setCallbackLog([...callbackLog, message]);
    console.log(message);
  };

  const clearLog = () => {
    setCallbackLog([]);
  };

  const changeScenario = (index: number) => {
    setSelectedScenario(index);
    // Increment key to force component remount and trigger confetti again
    setTestKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            SkillMastered Component Test Page
          </h1>

          {/* Scenario Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Test Scenario:
            </label>
            <div className="flex flex-wrap gap-2">
              {testScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => changeScenario(index)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all
                    ${
                      selectedScenario === index
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Scenario Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <strong className="text-green-900">Skill:</strong>
                <div className="text-green-700">{currentScenario.skill}</div>
              </div>
              <div>
                <strong className="text-green-900">Score:</strong>
                <div className="text-green-700">
                  {currentScenario.score.correct}/{currentScenario.score.total}
                </div>
              </div>
              <div>
                <strong className="text-green-900">Expected XP:</strong>
                <div className="text-green-700">+{currentScenario.expectedXP}</div>
              </div>
              <div>
                <strong className="text-green-900">On Fire:</strong>
                <div className="text-green-700">
                  {currentScenario.expectedOnFire ? '🔥 Yes' : '⭐ No'}
                </div>
              </div>
            </div>
          </div>

          {/* Callback Log */}
          {callbackLog.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm text-blue-900">
                  Callback Log ({callbackLog.length}):
                </strong>
                <button
                  onClick={clearLog}
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {callbackLog.map((log, index) => (
                  <div key={index} className="text-sm text-blue-700 font-mono">
                    {index + 1}. {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Under Test */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Component Preview
          </h2>

          {/* Key prop forces remount when scenario changes (triggers confetti again) */}
          <SkillMastered
            key={testKey}
            skill={currentScenario.skill}
            score={currentScenario.score}
            onReturn={handleReturn}
            onPracticeMore={handlePracticeMore}
          />
        </div>

        {/* Testing Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Testing Checklist
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-1" />
              <label htmlFor="test-1" className="text-sm text-gray-700">
                <strong>Confetti Animation:</strong> Confetti appears on component mount and lasts 1-2 seconds
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-2" />
              <label htmlFor="test-2" className="text-sm text-gray-700">
                <strong>Entrance Animation:</strong> Component zooms in and fades in smoothly
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-3" />
              <label htmlFor="test-3" className="text-sm text-gray-700">
                <strong>Headline:</strong> &quot;Skill Unlocked!&quot; is displayed prominently
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-4" />
              <label htmlFor="test-4" className="text-sm text-gray-700">
                <strong>Skill Name:</strong> Skill name is displayed with green checkmark (✓)
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-5" />
              <label htmlFor="test-5" className="text-sm text-gray-700">
                <strong>Stats Display:</strong> Shows correct score (e.g., &quot;5/5 Correct&quot;)
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-6" />
              <label htmlFor="test-6" className="text-sm text-gray-700">
                <strong>XP Calculation:</strong> XP is correctly calculated (+20 per correct answer)
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-7" />
              <label htmlFor="test-7" className="text-sm text-gray-700">
                <strong>On Fire Indicator:</strong> Shows 🔥 for 80%+ success rate, ⭐ otherwise
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-8" />
              <label htmlFor="test-8" className="text-sm text-gray-700">
                <strong>Return Button:</strong> Click &quot;Return to Main Problem&quot; - verify callback in log
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-9" />
              <label htmlFor="test-9" className="text-sm text-gray-700">
                <strong>Practice More Button:</strong> Click &quot;Practice 5 More&quot; - verify callback in log
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-10" />
              <label htmlFor="test-10" className="text-sm text-gray-700">
                <strong>Gradient Background:</strong> Card has green-to-teal gradient
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-11" />
              <label htmlFor="test-11" className="text-sm text-gray-700">
                <strong>Success Rate:</strong> Success rate percentage is shown at bottom
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-12" />
              <label htmlFor="test-12" className="text-sm text-gray-700">
                <strong>Mobile (Resize to &lt;640px):</strong> Layout is responsive and stats stack vertically
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-13" />
              <label htmlFor="test-13" className="text-sm text-gray-700">
                <strong>Button Hover:</strong> Buttons scale slightly on hover
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-14" />
              <label htmlFor="test-14" className="text-sm text-gray-700">
                <strong>Focus States:</strong> Tab navigation shows focus rings on buttons
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="test-15" />
              <label htmlFor="test-15" className="text-sm text-gray-700">
                <strong>Emoji Animation:</strong> 🎉 emoji bounces on mount
              </label>
            </div>
          </div>
        </div>

        {/* Multiple Scenarios Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Scenario Testing Guide
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Perfect Score (5/5):</strong> Should show 100 XP and 🔥 On Fire!
            </div>
            <div>
              <strong>Great Score (4/5):</strong> Should show 80 XP and 🔥 On Fire! (80% success)
            </div>
            <div>
              <strong>Good Score (3/5):</strong> Should show 60 XP and ⭐ Great Job! (60% success)
            </div>
            <div>
              <strong>Minimum Pass (3/4):</strong> Should show 60 XP and 🔥 On Fire! (75% success)
            </div>
            <div>
              <strong>High Volume (8/10):</strong> Should show 160 XP and 🔥 On Fire! (80% success)
            </div>
          </div>
        </div>

        {/* Device Simulation Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
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
            <li>Verify stats cards stack vertically on small screens</li>
            <li>Test confetti animation on mobile (should perform smoothly)</li>
            <li>Verify buttons are easily tappable (44px minimum touch targets)</li>
          </ol>
        </div>

        {/* Confetti Note */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">
            🎊 Confetti Testing
          </h3>
          <p className="text-sm text-purple-800">
            To see the confetti animation again, switch to a different scenario using the buttons at the top.
            Each scenario change will remount the component and trigger a new confetti burst!
          </p>
        </div>
      </div>
    </div>
  );
}
