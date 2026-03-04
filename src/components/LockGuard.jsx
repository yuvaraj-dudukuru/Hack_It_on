import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useHackathonLock } from '../context/HackathonLockContext';

function LockGuard() {
  const { isLocked, lockedTeamId, lockLoading } = useHackathonLock();

  if (lockLoading) {
      // Simple loading state while we check permissions
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-green-400">Checking hackathon status...</div>;
  }

  if (isLocked) {
    // If locked, redirect immediately to the active workspace
    return <Navigate to={`/team/${lockedTeamId}`} replace />;
  }

  // If NOT locked, allow access to child routes (Home, Hackathons, etc.)
  return <Outlet />;
}

export default LockGuard;