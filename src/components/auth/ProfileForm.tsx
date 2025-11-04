'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const GRADE_LEVELS = [
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade (High School)' },
  { value: '10', label: '10th Grade (High School)' },
  { value: 'other', label: 'Other' },
];

const FOCUS_TOPICS = [
  { value: 'algebra', label: 'Algebra' },
  { value: 'pre-algebra', label: 'Pre-Algebra' },
  { value: 'arithmetic', label: 'Basic Arithmetic' },
  { value: 'equations', label: 'Solving Equations' },
  { value: 'fractions', label: 'Fractions & Decimals' },
  { value: 'general', label: 'General Math Help' },
];

export default function ProfileForm() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [focusTopic, setFocusTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setGradeLevel(userProfile.gradeLevel || '');
      setFocusTopic(userProfile.focusTopic || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        displayName,
        gradeLevel,
        focusTopic,
      });

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
    <div className="w-full max-w-2xl">
      <div className="bg-white dark:bg-zinc-950 shadow-md rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={userProfile.email}
              disabled
              className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm py-2 px-3 text-zinc-500 dark:text-zinc-400"
            />
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            />
          </div>

          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">
              Grade Level
            </label>
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
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

          <div>
            <label htmlFor="focusTopic" className="block text-sm font-medium text-gray-700">
              What do you want to focus on?
            </label>
            <select
              id="focusTopic"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            >
              <option value="">Select a focus area</option>
              {FOCUS_TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              We&apos;ll prioritize practice in this area
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong className="text-zinc-900 dark:text-zinc-50">Account created:</strong>{' '}
              {userProfile.createdAt.toLocaleDateString()}
            </p>
            <p className="mt-1">
              <strong className="text-zinc-900 dark:text-zinc-50">Last active:</strong>{' '}
              {userProfile.lastActive.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
