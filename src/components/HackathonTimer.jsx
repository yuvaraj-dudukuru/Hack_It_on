import React, { useState, useEffect } from 'react';
import { cn } from '../design-system/theme.js';

function HackathonTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const end = endsAt.toMillis ? endsAt.toMillis() : endsAt;
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(diff);

      // Set urgency levels
      const oneHour = 60 * 60 * 1000;
      const threeHours = 3 * 60 * 60 * 1000;

      setIsCritical(diff <= oneHour);
      setIsUrgent(diff <= threeHours && diff > oneHour);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  // Calculate time units
  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Calculate progress percentage (assuming max 48 hours)
  const maxDuration = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  const progress = Math.min(100, (timeLeft / maxDuration) * 100);

  // Calculate circle properties
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Determine color based on time left
  const getColorClass = () => {
    if (isCritical) return 'text-red-500';
    if (isUrgent) return 'text-yellow-500';
    return 'text-green-500';
  };


  const getBgGlowClass = () => {
    if (isCritical) return 'from-red-500/20 to-red-600/20';
    if (isUrgent) return 'from-yellow-500/20 to-orange-500/20';
    return 'from-green-500/20 to-blue-500/20';
  };

  // Format display text
  const getDisplayText = () => {
    if (days > 0) {
      return { main: `${days}d`, sub: `${hours}h` };
    } else if (hours > 0) {
      return { main: `${hours}h`, sub: `${minutes}m` };
    } else if (minutes > 0) {
      return { main: `${minutes}m`, sub: `${seconds}s` };
    } else {
      return { main: `${seconds}s`, sub: 'left' };
    }
  };

  const displayText = getDisplayText();

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          ⏰ Time's Up!
        </span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Outer glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-full blur-xl transition-all duration-1000',
        'bg-gradient-to-r opacity-30',
        getBgGlowClass(),
        isCritical && 'animate-pulse'
      )} />

      {/* Main timer container */}
      <div className="relative">
        {/* SVG Circle Progress */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-800"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000 ease-linear',
              getColorClass()
            )}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`
            }}
          />

          {/* Inner pulse ring (only when critical) */}
          {isCritical && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - 3}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-red-500 opacity-40 animate-ping"
            />
          )}
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-2xl font-black leading-none',
            getColorClass()
          )}>
            {displayText.main}
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            {displayText.sub}
          </span>
        </div>

        {/* Warning indicator (pulsing dot) */}
        {(isUrgent || isCritical) && (
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                isCritical ? 'bg-red-400' : 'bg-yellow-400'
              )} />
              <span className={cn(
                'relative inline-flex rounded-full h-3 w-3',
                isCritical ? 'bg-red-500' : 'bg-yellow-500'
              )} />
            </span>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 shadow-2xl whitespace-nowrap">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Time Remaining</p>
            <p className="text-sm font-bold text-white">
              {days > 0 && `${days}d `}
              {hours > 0 && `${hours}h `}
              {minutes}m {seconds}s
            </p>
            {isCritical && (
              <p className="text-xs text-red-400 mt-1 flex items-center justify-center gap-1">
                <span>⚠️</span> Critical!
              </p>
            )}
            {isUrgent && !isCritical && (
              <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                <span>⏰</span> Urgent
              </p>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default HackathonTimer;