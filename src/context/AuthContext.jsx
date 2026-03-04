/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// 1. Create the context
const AuthContext = createContext();

// 2. Create a "hook" to make it easy to use this context
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the "Provider" component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser = () => { };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Listen to user document changes in real-time
        unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    role: userData?.role || 'public',
    isAdmin: userData?.role === 'admin',
    isJudge: userData?.role === 'judge',
    isParticipant: userData?.role === 'participant',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}