'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { removeUndefined } from '@/lib/firestore-helpers';
import { db } from '@/lib/firebase';

const GRADE_LEVELS = [
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: 'other', label: 'Other' },
];

const FOCUS_TOPICS = [
  { value: 'algebra', label: 'Algebra' },
  { value: 'pre-algebra', label: 'Pre-Algebra' },
  { value: 'arithmetic', label: 'Basic Arithmetic' },
  { value: 'equations', label: 'Solving Equations' },
  { value: 'fractions', label: 'Fractions & Decimals' },
  { value: 'percentages', label: 'Percentages' },
  { value: 'ratios', label: 'Ratios & Proportions' },
  { value: 'word-problems', label: 'Word Problems' },
  { value: 'general', label: 'General Math Help' },
];

const INTERESTS = [
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'video-games', label: 'Video Games', icon: '🎮' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'fashion', label: 'Fashion', icon: '👗' },
  { value: 'cooking', label: 'Cooking', icon: '🍳' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'reading', label: 'Reading', icon: '📚' },
  { value: 'animals', label: 'Animals', icon: '🐾' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'movies', label: 'Movies', icon: '🎬' },
  { value: 'dance', label: 'Dance', icon: '💃' },
];

export default function OnboardingPage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Initialize display name from user profile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setGradeLevel(userProfile.gradeLevel || '');
      setFocusTopics(userProfile.focusTopics || []);
      setInterests(userProfile.interests || []);
    }
  }, [userProfile]);

  // Redirect if profile is already complete
  useEffect(() => {
    if (!loading && userProfile) {
      const isComplete =
        userProfile.gradeLevel &&
        userProfile.focusTopics &&
        userProfile.focusTopics.length > 0 &&
        userProfile.interests &&
        userProfile.interests.length > 0;

      if (isComplete) {
        router.push('/');
      }
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-lg text-zinc-900 dark:text-zinc-50">Loading...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const totalSteps = 4;

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && !displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (currentStep === 2 && !gradeLevel) {
      setError('Please select your grade level');
      return;
    }
    if (currentStep === 3 && focusTopics.length === 0) {
      setError('Please select at least one learning focus');
      return;
    }

    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFocusTopic = (topic: string) => {
    setFocusTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, removeUndefined({
        displayName: displayName.trim(),
        gradeLevel,
        focusTopics,
        interests,
      }));

      await refreshUserProfile();
      router.push('/');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save your profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Welcome to Math Tutor!
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Let's get to know you better
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    What's your name?
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 block w-full rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Grade Level */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  What grade are you in?
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  This helps us match problems to your level
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GRADE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setGradeLevel(level.value)}
                    className={`p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                      gradeLevel === level.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Learning Focus */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  What are you learning right now?
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Pick all that apply - we'll help with all of them!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {FOCUS_TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => toggleFocusTopic(topic.value)}
                    className={`p-4 rounded-lg border-2 text-left font-medium transition-all ${
                      focusTopics.includes(topic.value)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{topic.label}</span>
                      {focusTopics.includes(topic.value) && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  What are some things you like?
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  We'll use these to make math problems more fun and relatable!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                      interests.includes(interest.value)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-3xl">{interest.icon}</div>
                      <div className="text-sm">{interest.label}</div>
                      {interests.includes(interest.value) && (
                        <svg
                          className="w-4 h-4 mx-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={saving}
                className="flex-1 py-3 px-6 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 shadow-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          You can always update these settings later in your profile
        </p>
      </div>
    </div>
  );
}
