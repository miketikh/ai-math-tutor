'use client';

/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { removeUndefined } from '@/lib/firestore-helpers';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  gradeLevel?: string;
  focusTopics?: string[];
  interests?: string[];
  skillProficiency: Record<string, SkillProficiencyData>;
  createdAt: Date;
  lastActive: Date;
}

interface SkillProficiencyData {
  level: 'unknown' | 'learning' | 'proficient' | 'mastered';
  problemsSolved: number;
  successCount: number;
  lastPracticed?: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for:', uid);
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('User profile found:', docSnap.data());
        const data = docSnap.data();
        return {
          uid,
          email: data.email,
          displayName: data.displayName,
          gradeLevel: data.gradeLevel,
          focusTopics: data.focusTopics || [],
          interests: data.interests || [],
          skillProficiency: data.skillProficiency || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate() || new Date(),
        };
      }
      console.warn('User profile not found in Firestore');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Create initial user profile in Firestore
  const createUserProfile = async (user: User, displayName: string) => {
    const userRef = doc(db, 'users', user.uid);
    const profile: Omit<UserProfile, 'uid'> = {
      email: user.email || '',
      displayName: displayName || user.displayName || 'Student',
      focusTopics: [],
      interests: [],
      skillProficiency: {},
      createdAt: new Date(),
      lastActive: new Date(),
    };

    await setDoc(userRef, removeUndefined(profile));
    return { uid: user.uid, ...profile };
  };

  // Update last active timestamp
  const updateLastActive = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { lastActive: new Date() }, { merge: true });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  };

  // Refresh user profile from Firestore
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user, displayName);
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Check if user profile exists, create if not
    const existingProfile = await fetchUserProfile(result.user.uid);
    if (!existingProfile) {
      await createUserProfile(result.user, result.user.displayName || 'Student');
    }
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    // Clear session data from localStorage to prevent showing old user's sessions
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeSessionId');
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);

        // Update last active
        await updateLastActive(user.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
