import React, { useState } from 'react';
import TeamFigma from './TeamFigma';
import TeamSystemDesign from './TeamSystemDesign';
import TeamPitchDeck from './TeamPitchDeck';

function DesignHub({ teamId }) {
  // Default to 'uiux' (Figma) as the first view
  const [activeSubTab, setActiveSubTab] = useState('system');

  return (
    <div className="h-full flex flex-col">
      {/* Sub-Navigation Bar */}
      <div className="flex bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          onClick={() => setActiveSubTab('system')}
          className={`px-6 py-3 text-sm font-medium transition ${
            activeSubTab === 'system' ? 'text-green-400 bg-gray-900 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🏗️ System Design
        </button>
        <button
          onClick={() => setActiveSubTab('uiux')}
          className={`px-6 py-3 text-sm font-medium transition ${
            activeSubTab === 'uiux' ? 'text-green-400 bg-gray-900 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🎨 UI/UX (Figma)
        </button>
        <button
          onClick={() => setActiveSubTab('pitch')}
          className={`px-6 py-3 text-sm font-medium transition ${
            activeSubTab === 'pitch' ? 'text-green-400 bg-gray-900 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📢 Pitch Deck
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeSubTab === 'system' && <TeamSystemDesign teamId={teamId} />}
        {activeSubTab === 'uiux' && <TeamFigma teamId={teamId} />}
        {activeSubTab === 'pitch' && <TeamPitchDeck teamId={teamId} />}
      </div>
    </div>
  );
}

export default DesignHub;