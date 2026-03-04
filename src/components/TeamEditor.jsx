import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { FileText, Link as LinkIcon } from 'lucide-react';

function TeamEditor({ teamId }) {
  const [editorUrl, setEditorUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the main team document for 'editorUrl'
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSavedUrl(docSnap.data().editorUrl || '');
      }
      setLoading(false);
    }, (err) => {
      console.warn("Editor integration access denied (handled):", err.code);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!editorUrl.startsWith('http')) {
      alert("Please enter a valid URL (e.g., Google Doc link)");
      return;
    }
    // Save to main document
    await setDoc(doc(db, 'lftPosts', teamId), { editorUrl: editorUrl }, { merge: true });
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this document?")) {
      setDoc(doc(db, 'lftPosts', teamId), { editorUrl: '' }, { merge: true });
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading workspace...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-blue-400 font-semibold flex items-center gap-2">
          <FileText size={18} />
          Collaborative Document
        </h3>
        {savedUrl && (
          <div className="flex items-center gap-4">
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition flex items-center gap-1"
            >
              <LinkIcon size={12} /> Open in New Tab
            </a>
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">Change Doc</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {savedUrl ? (
          <iframe
            src={savedUrl}
            height="100%"
            width="100%"
            frameBorder="0"
            allowFullScreen
            className="flex-1 bg-white"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Connect Document</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Paste the link to your <strong>Google Doc</strong>, <strong>Notion Page</strong>, or other embeddable editor.
              </p>
              <form onSubmit={handleSaveUrl} className="space-y-4">
                <input
                  type="text"
                  value={editorUrl}
                  onChange={(e) => setEditorUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="p-3 bg-blue-900/30 border border-blue-800 rounded text-blue-200 text-xs">
                  <strong>Tip:</strong> For Google Docs, ensure the sharing setting is "Anyone with the link can edit" for best collaboration.
                </div>
                <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition">
                  Connect Document
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamEditor;
