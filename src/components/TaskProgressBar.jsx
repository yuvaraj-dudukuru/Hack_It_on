import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Zap, Target } from 'lucide-react';
import { cn } from '../design-system/theme';

function TaskProgressBar({ teamId }) {
  const [percentage, setPercentage] = useState(0);
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0 });
  const [statusColor, setStatusColor] = useState('from-cyan-500 to-blue-600');
  const [glowColor, setGlowColor] = useState('shadow-cyan-500/50');

  useEffect(() => {
    const tasksRef = collection(db, 'lftPosts', teamId, 'tasks');
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => doc.data());
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;

      setTaskStats({ total, done });

      if (total === 0) {
        setPercentage(0);
      } else {
        const percent = (done / total) * 100;
        setPercentage(percent);

        if (percent === 100) {
          setStatusColor('from-emerald-400 to-green-600');
          setGlowColor('shadow-emerald-500/50');
        } else if (percent > 66) {
          setStatusColor('from-cyan-400 to-blue-600');
          setGlowColor('shadow-cyan-500/50');
        } else if (percent > 33) {
          setStatusColor('from-amber-400 to-orange-600');
          setGlowColor('shadow-amber-500/50');
        } else {
          setStatusColor('from-rose-500 to-red-700');
          setGlowColor('shadow-rose-500/50');
        }
      }
    }, (error) => {
      console.error("Error fetching tasks:", error);
      // Fallback to 0 progress on error
      setPercentage(0);
      setTaskStats({ total: 0, done: 0 });
    });

    return () => unsubscribe();
  }, [teamId]);

  return (
    <div className="w-full bg-[#030712] h-4 relative overflow-hidden border-b border-white/5 group">
      {/* Scanning Effect Layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-scan pointer-events-none" />

      {/* Progress Fill */}
      <div
        className={cn(
          "h-full transition-all duration-1000 ease-out bg-gradient-to-r relative",
          statusColor
        )}
        style={{ width: `${percentage}%` }}
      >
        {/* Glowing Tip */}
        {percentage > 0 && (
          <div className={cn(
            "absolute top-0 right-0 h-full w-4 blur-md z-10",
            glowColor.replace('shadow', 'bg')
          )} />
        )}

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
      </div>

      {/* Meta Overlay */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <div className="flex items-center gap-2">
          <Target size={8} className="text-white fill-white animate-pulse" />
          <span className="text-[7px] font-black text-white uppercase tracking-[0.3em] opacity-80">
            Mission Completion Status: <span className="opacity-100">{percentage.toFixed(0)}%</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.3em]">
            Synchronized to Mainframe
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">{taskStats.done}/{taskStats.total} UNITS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskProgressBar;
