'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopProfileListener: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Clean up previous listener if it exists
      if (stopProfileListener) {
        stopProfileListener();
        stopProfileListener = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        stopProfileListener = onSnapshot(userDocRef, async (userDoc) => {
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              displayName: user.displayName || 'Learner',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: serverTimestamp(),
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              console.error("Error creating user profile:", err);
            }
          } else {
            const data = userDoc.data();
            let createdAtVal = Date.now();
            if (data?.createdAt) {
              if (typeof data.createdAt.toMillis === 'function') {
                createdAtVal = data.createdAt.toMillis();
              } else if (data.createdAt.seconds) {
                createdAtVal = data.createdAt.seconds * 1000;
              } else if (typeof data.createdAt === 'number') {
                createdAtVal = data.createdAt;
              }
            }
            setUserProfile({
              displayName: data?.displayName || 'Learner',
              email: data?.email || '',
              photoURL: data?.photoURL || '',
              createdAt: createdAtVal,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile listener error:", error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (stopProfileListener) stopProfileListener();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
