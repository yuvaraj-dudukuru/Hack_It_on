import React, { useState } from 'react';
import TeamTaskBoard from './TeamTaskBoard';
import TeamTrello from './TeamTrello';

function TaskHub({ teamId, teamMembers, isReadOnly }) {
  const [activeSubTab, setActiveSubTab] = useState('basic');

  return (
    <div className="h-full flex flex-col">
      <div className="flex bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          onClick={() => setActiveSubTab('basic')}
          className={`px-6 py-3 text-sm font-medium transition ${
            activeSubTab === 'basic' ? 'text-green-400 bg-gray-900 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📋 Basic Board
        </button>
        <button
          onClick={() => setActiveSubTab('trello')}
          className={`px-6 py-3 text-sm font-medium transition ${
            activeSubTab === 'trello' ? 'text-[#0079BF] bg-gray-900 border-b-2 border-[#0079BF]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🔹 Trello Integration
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-4 bg-gray-900">
        {activeSubTab === 'basic' && (
          <TeamTaskBoard teamId={teamId} teamMembers={teamMembers} isReadOnly={isReadOnly} />
        )}
        {activeSubTab === 'trello' && (
          <div className="h-full -m-4">
             <TeamTrello teamId={teamId} isReadOnly={isReadOnly} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskHub;