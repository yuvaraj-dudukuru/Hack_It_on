import React from 'react';

// Base Skeleton Component
export function Skeleton({ className = "", variant = "default" }) {
  const baseClasses = "animate-pulse bg-gradient-to-r";
  const variantClasses = {
    default: "from-gray-800 via-gray-700 to-gray-800",
    light: "from-gray-700 via-gray-600 to-gray-700",
    shimmer: "from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

// Team Workspace Loading
export function WorkspaceLoading() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gradient-to-br from-[#0a0e17] via-gray-900 to-[#0f172a] p-6">
      {/* Progress Bar Skeleton */}
      <Skeleton className="h-1 w-full mb-6 rounded-full" />

      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-10 w-80 rounded-xl" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Main Panel */}
        <div className="lg:col-span-3 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          {/* Tabs */}
          <div className="p-3 border-b border-white/5">
            <div className="flex p-1 bg-black/20 rounded-2xl gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <div className="mt-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-12 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Member Card Skeleton
export function TeamMemberSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isMe = false }) {
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
      <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {!isMe && <Skeleton className="w-8 h-8 rounded-full" />}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className={`h-20 rounded-2xl ${isMe ? 'w-64' : 'w-72'}`} />
        </div>
      </div>
    </div>
  );
}

// Task Card Skeleton
export function TaskCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

// Hackathon Card Skeleton
export function HackathonCardSkeleton() {
  return (
    <div className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// LFT Post Card Skeleton
export function LftPostSkeleton() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-2/3 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

// Generic List Skeleton
export function ListSkeleton({ count = 3, itemHeight = "h-20" }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className={`${itemHeight} w-full rounded-2xl`} />
      ))}
    </div>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-10 w-20 rounded-lg mb-2" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      ))}
    </div>
  );
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="w-32 h-32 rounded-full shrink-0" />
        <div className="flex-1 space-y-4">
          <div>
            <Skeleton className="h-8 w-48 rounded-xl mb-2" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Full Page Loading with Logo
export function FullPageLoading({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-gray-900 to-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-500 rounded-2xl animate-pulse opacity-20 blur-xl" />
          <div className="relative w-full h-full bg-gradient-to-tr from-green-400 to-blue-500 rounded-2xl flex items-center justify-center animate-bounce">
            <span className="text-gray-900 font-black text-4xl">H</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{message}</h3>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Spinner (for inline loading)
export function InlineSpinner({ size = "sm", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
}