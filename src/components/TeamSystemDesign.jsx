import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function TeamSystemDesign({ teamId }) {
  const [embedInput, setEmbedInput] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NEW: Listen to the main team document
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSavedUrl(docSnap.data().systemDesignUrl || '');
      }
      setLoading(false);
    }, (err) => {
      console.warn("System Design access denied (handled):", err.code);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    let urlToSave = embedInput.trim();

    // Smart Extraction for <iframe>
    if (urlToSave.includes('<iframe')) {
      const match = urlToSave.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        urlToSave = match[1];
      } else {
        alert("Could not find a valid URL in that code. Please copy just the 'https://...' part.");
        return;
      }
    }

    if (!urlToSave.startsWith('http')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }

    // Save to main document
    await setDoc(doc(db, 'lftPosts', teamId), { systemDesignUrl: urlToSave }, { merge: true });
    setEmbedInput('');
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this diagram?")) {
      setDoc(doc(db, 'lftPosts', teamId), { systemDesignUrl: '' }, { merge: true });
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-green-400 font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
          </svg>
          System Architecture (Draw.io / Lucid)
        </h3>
        {savedUrl && (
          <div className="flex items-center gap-4">
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition"
            >
              Open Diagram ↗
            </a>
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">Change File</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {savedUrl ? (
          <iframe
            src={savedUrl}
            height="100%"
            width="100%"
            frameBorder="0"
            allowFullScreen
            className="flex-1 bg-white min-h-[500px]"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-start p-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
              <h2 className="text-xl font-bold text-white mb-6">Connect System Diagram</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: The Form */}
                <div>
                  <p className="text-gray-300 mb-4 text-sm">
                    Paste the <strong>embed code</strong> from Draw.io (diagrams.net) or Lucidchart.
                  </p>
                  <form onSubmit={handleSaveUrl} className="space-y-4">
                    <textarea
                      value={embedInput}
                      onChange={(e) => setEmbedInput(e.target.value)}
                      placeholder="<iframe src='...'></iframe>"
                      className="w-full p-3 rounded bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:border-green-500 font-mono text-xs h-32"
                    />
                    <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition">
                      Connect Diagram
                    </button>
                  </form>
                </div>

                {/* Right Column: The Instructions */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-sm">
                  <h3 className="text-green-400 font-bold mb-3">How to get the link (Draw.io):</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>In Draw.io, go to <strong>File &rarr; Embed &rarr; IFrame</strong>.</li>
                    <li>Click <strong>Create</strong>.</li>
                    <li>Copy the full HTML code and paste it here.</li>
                  </ol>

                  <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-200 text-xs">
                    <strong>Important:</strong> If you get a 401 Error, your file is private.
                    <ul className="list-disc list-inside mt-1 ml-1">
                      <li>Go to Google Drive (where the file is saved).</li>
                      <li>Right-click the file &rarr; <strong>Share</strong>.</li>
                      <li>Set General Access to <strong>"Anyone with the link"</strong> can <strong>"Viewer"</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamSystemDesign;