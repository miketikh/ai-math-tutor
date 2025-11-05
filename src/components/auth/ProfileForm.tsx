'use client';

import { useState, useEffect } from 'react';
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

export default function ProfileForm() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setGradeLevel(userProfile.gradeLevel || '');
      setFocusTopics(userProfile.focusTopics || []);
      setInterests(userProfile.interests || []);
    }
  }, [userProfile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    // Validation
    if (!displayName.trim()) {
      setMessage('Please enter your display name');
      return;
    }
    if (!gradeLevel) {
      setMessage('Please select your grade level');
      return;
    }
    if (focusTopics.length === 0) {
      setMessage('Please select at least one learning focus');
      return;
    }
    if (interests.length === 0) {
      setMessage('Please select at least one interest');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, removeUndefined({
        displayName: displayName.trim(),
        gradeLevel,
        focusTopics,
        interests,
      }));

      await refreshUserProfile();
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-zinc-950 shadow-md rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white dark:bg-zinc-950 shadow-md rounded-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {message && (
            <div
              className={`rounded-md p-4 border ${
                message.includes('success')
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <p
                className={`text-sm ${
                  message.includes('success')
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email - Disabled */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userProfile.email}
                disabled
                className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm py-2 px-3 text-zinc-500 dark:text-zinc-400"
              />
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3"
              />
            </div>

            {/* Grade Level */}
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Grade Level
              </label>
              <select
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3"
              >
                <option value="">Select your grade level</option>
                {GRADE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                This helps us tailor problems to your level
              </p>
            </div>

            {/* Learning Focus - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                What do you want to focus on? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => toggleFocusTopic(topic.value)}
                    className={`p-3 rounded-lg border-2 text-left font-medium transition-all ${
                      focusTopics.includes(topic.value)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{topic.label}</span>
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
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                We'll prioritize practice in these areas
              </p>
            </div>

            {/* Interests - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                What are some things you like? (Select all that apply)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.value}
                    type="button"
                    onClick={() => toggleInterest(interest.value)}
                    className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${
                      interests.includes(interest.value)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-2xl">{interest.icon}</div>
                      <div className="text-xs">{interest.label}</div>
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
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                We'll use these to make math problems more fun and relatable!
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <p>
              <strong className="text-zinc-900 dark:text-zinc-50">Account created:</strong>{' '}
              {userProfile.createdAt.toLocaleDateString()}
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-zinc-50">Last active:</strong>{' '}
              {userProfile.lastActive.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
