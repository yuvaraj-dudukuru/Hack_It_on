import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function TeamTrello({ teamId }) {
  const [trelloUrl, setTrelloUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    // OLD: const docRef = doc(db, 'lftPosts', teamId, 'integrations', 'trello');
    // NEW: Listen to the main team document
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Check for 'trelloUrl' on the main document
        setSavedUrl(docSnap.data().trelloUrl || '');
      }
      setLoading(false);
      setPermissionError(false);
    }, (err) => {
      console.warn("Team document access error (handled):", err.code);
      setPermissionError(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!trelloUrl.includes('trello.com/b/')) {
      alert("Please enter a valid Trello Board URL (it should contain 'trello.com/b/')");
      return;
    }
    // Save to main document with merge
    await setDoc(doc(db, 'lftPosts', teamId), { trelloUrl: trelloUrl }, { merge: true });
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this Trello board?")) {
      setDoc(doc(db, 'lftPosts', teamId), { trelloUrl: '' }, { merge: true });
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  if (permissionError) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 font-bold bg-gray-900">
        Access Denied: Trello Integration Locked
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-[#0079BF] font-semibold flex items-center gap-2">
          {/* Trello Logo Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h5c.55 0 1 .45 1 1v12zm7-6c0 .55-.45 1-1 1h-5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h5c.55 0 1 .45 1 1v6z" />
          </svg>
          Trello Board
        </h3>
        {savedUrl && (
          <div className="flex items-center gap-4">
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-[#0079BF] hover:bg-[#026AA7] text-white px-3 py-1 rounded transition"
            >
              Open in Trello ↗
            </a>
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">Change Board</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {savedUrl ? (
          <div className="flex-1 relative">
            <iframe
              src={`${savedUrl}.html`}
              height="100%"
              width="100%"
              frameBorder="0"
              allowFullScreen
              className="flex-1 bg-[#F4F5F7] absolute inset-0"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Connect Trello Board</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Paste the full URL of your Trello board.
              </p>
              <form onSubmit={handleSaveUrl} className="space-y-4">
                <input
                  type="text"
                  value={trelloUrl}
                  onChange={(e) => setTrelloUrl(e.target.value)}
                  placeholder="https://trello.com/b/your-board-id/..."
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#0079BF]"
                />
                <div className="p-3 bg-blue-900/30 border border-blue-800 rounded text-blue-200 text-xs">
                  <strong>Note:</strong> Your board must be set to "Public" or "Workspace Visible" for all team members to see it without logging in every time.
                </div>
                <button type="submit" className="w-full py-3 bg-[#0079BF] hover:bg-[#026AA7] text-white font-bold rounded transition">
                  Connect Trello
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamTrello;