import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

function StartHackathonModal({ teamId, onClose }) {
  const [duration, setDuration] = useState(24);
  const [projectName, setProjectName] = useState(''); // 1. New State for Project Name
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!projectName.trim()) {
        alert("Please enter a project name to start.");
        return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

      await updateDoc(doc(db, 'lftPosts', teamId), {
        hackathonStartedAt: Timestamp.fromDate(now),
        hackathonEndsAt: Timestamp.fromDate(endTime),
        hackathonDuration: duration,
        projectName: projectName // 2. Save the official project name
      });
      onClose();
    } catch (err) {
      console.error("Error starting hackathon:", err);
      alert("Failed to start timer.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold text-white mb-4">Start Hackathon Timer</h2>
        
        {/* 3. New Input Field */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">Official Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., EcoTracker 3000"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Duration (Hours)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
          >
            <option value={6}>6 Hours (Sprint)</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (Standard)</option>
            <option value={36}>36 Hours</option>
            <option value={48}>48 Hours (Weekend)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
          <button 
            onClick={handleStart}
            disabled={loading || !projectName.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition disabled:bg-gray-600"
          >
            {loading ? 'Starting...' : 'Start Timer ⏱️'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartHackathonModal;