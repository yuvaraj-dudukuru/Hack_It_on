import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function TeamKnowledgeBase({ teamId }) {
  const [urlInput, setUrlInput] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    // NEW: Listen to the main team document
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSavedUrl(docSnap.data().knowledgeBaseUrl || '');
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.warn("Knowledge base access denied (handled):", err.code);
      setError("Restricted Access");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    // We now accept standard edit links too, as we will open them in a new tab
    if (!urlInput.startsWith('http')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    // Save to main document
    await setDoc(doc(db, 'lftPosts', teamId), { knowledgeBaseUrl: urlInput }, { merge: true });
    setUrlInput('');
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this document?")) {
      setDoc(doc(db, 'lftPosts', teamId), { knowledgeBaseUrl: '' }, { merge: true });
    }
  }

  // Helper to detect Google Docs
  const isGoogleDoc = savedUrl.includes('docs.google.com');

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900 border border-red-900/20 m-4 rounded-xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-400 mb-2">{error}</h3>
        <p className="text-gray-500 text-sm">Security protocols prevent access to this module.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-green-400 font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          Knowledge Base
        </h3>
        {savedUrl && (
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">Change File</button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {savedUrl ? (
          isGoogleDoc ? (
            // --- GOOGLE DOCS VIEW (Button instead of iframe) ---
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" className="w-16 h-16 mb-6 opacity-80" alt="Google Docs" />
              <h2 className="text-2xl font-bold text-white mb-2">Google Doc Connected</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                For security reasons, Google Docs must be edited in their own tab.
              </p>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition transform hover:scale-105 flex items-center gap-2"
              >
                Open Document to Collaborate ↗
              </a>
            </div>
          ) : (
            // --- OTHER TOOLS (Try to embed normally) ---
            <iframe
              src={savedUrl}
              height="100%"
              width="100%"
              frameBorder="0"
              allowFullScreen
              className="flex-1 bg-white"
            />
          )
        ) : (
          // --- SETUP STATE ---
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Connect Document</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Paste the <strong>share link</strong> for your Google Doc, Notion page, or other tool.
              </p>

              <form onSubmit={handleSaveUrl} className="space-y-4">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
                <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition">
                  Connect
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamKnowledgeBase;