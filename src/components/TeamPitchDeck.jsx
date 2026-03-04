import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function TeamPitchDeck({ teamId }) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NEW: Listen to the main team document
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSavedUrl(docSnap.data().pitchDeckUrl || '');
      }
      setLoading(false);
    }, (err) => {
      console.warn("Pitch Deck access error (handled):", err.code);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!embedUrl.startsWith('http')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    // Save to main document
    await setDoc(doc(db, 'lftPosts', teamId), { pitchDeckUrl: embedUrl }, { merge: true });
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this presentation?")) {
      setDoc(doc(db, 'lftPosts', teamId), { pitchDeckUrl: '' }, { merge: true });
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-green-400 font-semibold">Pitch Deck Embed</h3>
        {savedUrl && (
          <div className="flex items-center gap-4">
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition"
            >
              Open Presentation ↗
            </a>
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">Change File</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {savedUrl ? (
          <iframe src={savedUrl} height="100%" width="100%" allowFullScreen className="flex-1 border-0" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Connect Pitch Deck</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Paste the <strong>embed link</strong> for your presentation (Google Slides 'Publish to web' link, Canva embed link, etc.).
              </p>
              <form onSubmit={handleSaveUrl} className="space-y-4">
                <input
                  type="text"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/e/..."
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition">
                  Connect Presentation
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamPitchDeck;