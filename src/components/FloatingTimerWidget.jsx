import React, { useState, useEffect } from 'react';
import { useHackathonLock } from '../context/HackathonLockContext.jsx';
import { useNavigate } from 'react-router-dom';

function FloatingTimerWidget() {
  const { isLocked, lockEndsAt, lockedTeamId } = useHackathonLock();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!lockEndsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = lockEndsAt.toMillis() - now;

      if (distance < 0) {
        setTimeLeft('00:00:00');
        setIsUrgent(false);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Pad with zeros
        const h = hours < 10 ? `0${hours}` : hours;
        const m = minutes < 10 ? `0${minutes}` : minutes;
        const s = seconds < 10 ? `0${seconds}` : seconds;

        setTimeLeft(`${h}:${m}:${s}`);
        // Urgent if less than 1 hour left
        setIsUrgent(hours === 0 && minutes < 60);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockEndsAt]);

  if (!isLocked || !lockEndsAt) return null;

  return (
    <button
      onClick={() => navigate(`/team/${lockedTeamId}`)}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group ${
        isUrgent 
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
          : 'bg-gray-800 hover:bg-gray-750 text-green-400 border border-green-500/30'
      }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isUrgent ? 'bg-red-800' : 'bg-gray-900'}`}>
        <span className="text-lg">⏱️</span>
      </div>
      <div className="text-left">
        <p className={`text-[10px] uppercase font-bold tracking-wider ${isUrgent ? 'text-red-200' : 'text-gray-400 group-hover:text-gray-300'}`}>
          Time Remaining
        </p>
        <p className="font-mono text-xl font-black leading-none">
          {timeLeft}
        </p>
      </div>
    </button>
  );
}

export default FloatingTimerWidget;