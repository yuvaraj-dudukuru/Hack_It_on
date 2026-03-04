import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

function TeamMemberRoute() {
  console.log("TeamMemberRoute: Verifying permissions...");
  const { teamId } = useParams(); // Gets the team ID from the URL
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    let unsubscribe;

    if (!currentUser) {
      setLoading(false);
      setIsMember(false);
      return;
    }

    try {
      const postRef = doc(db, 'lftPosts', teamId);
      unsubscribe = onSnapshot(postRef, (docSnap) => {
        if (docSnap.exists()) {
          const postData = docSnap.data();
          if (postData.teamMembers && postData.teamMembers.includes(currentUser.uid)) {
            setIsMember(true);
          } else {
            setIsMember(false);
          }
        } else {
          setIsMember(false);
        }
        setLoading(false);
      }, (err) => {
        console.error("Error checking team membership:", err);
        setIsMember(false);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error setting up listener:", err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, teamId]);

  if (loading) {
    return <div className="p-8 text-center text-lg text-green-400">Checking permissions...</div>;
  }

  if (!currentUser) {
    // If they got here while logged out, send to login
    return <Navigate to="/login" replace />;
  }

  if (isMember) {
    // 4. If they are a member, show the child page (our Workspace)
    return <Outlet />;
  } else {
    // 5. If they are NOT a member, boot them back to the dashboard
    return <Navigate to="/dashboard" replace />;
  }
}

export default TeamMemberRoute;