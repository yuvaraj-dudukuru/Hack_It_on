/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const HackathonLockContext = createContext();

export function useHackathonLock() {
  return useContext(HackathonLockContext);
}

export function HackathonLockProvider({ children }) {
  const { currentUser } = useAuth();
  const [lockedTeamId, setLockedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLockedTeamId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // 1. Listen to ALL teams this user is a member of
    const q = query(
      collection(db, 'lftPosts'),
      where('teamMembers', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let activeLock = null;
      const now = Date.now();

      // 2. Check if ANY team is currently active
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // A team is "active" IF:
        // - It has started (hackathonStartedAt exists)
        // - It has NOT ended yet (hackathonEndsAt > now)
        // - It is NOT submitted yet (!isSubmitted)
        if (data.hackathonStartedAt && data.hackathonEndsAt?.toMillis() > now && !data.isSubmitted) {
          activeLock = doc.id;
        }
      });

      setLockedTeamId(activeLock);
      setLoading(false);
    }, (err) => {
      console.error("Error checking locks:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Extra safety: Re-check every minute (in case timer expires while sitting on page)
  useEffect(() => {
    const interval = setInterval(() => {
      // This forces a re-render of components using this context,
      // which will re-eval the time check above if we stored the raw data.
      // For simplicity in this MVP, we rely mainly on Firestore snapshot updates,
      // but this placeholder is here if you need tighter minute-by-minute auto-unlocking later.
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    lockedTeamId,
    isLocked: !!lockedTeamId,
    lockLoading: loading
  };

  return (
    <HackathonLockContext.Provider value={value}>
      {children}
    </HackathonLockContext.Provider>
  );
}