import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

function TeamFigma({ teamId }) {
  const { currentUser } = useAuth();
  const [figmaUrl, setFigmaUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissionError, setPermissionError] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const notesEndRef = useRef(null);

  // 1. Listen for the saved Figma URL
  useEffect(() => {
    // OLD: const docRef = doc(db, 'lftPosts', teamId, 'integrations', 'figma');
    // NEW: Listen to the main team document for the URL
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Check for 'figmaUrl' on the main document
        setSavedUrl(docSnap.data().figmaUrl || '');
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

  // 2. Listen for Design Notes (Real-time)
  useEffect(() => {
    if (!savedUrl) return; // Only listen if a file is connected

    const notesRef = collection(db, 'lftPosts', teamId, 'integrations', 'figma', 'notes');
    const q = query(notesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
      // Auto-scroll to bottom of notes
      setTimeout(() => {
        notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }); // No strict error handler here nicely, usually fails silently if main one fails
    // But let's add one just in case

    return () => unsubscribe();
  }, [teamId, savedUrl]);

  // Handle saving the Figma URL
  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!figmaUrl.includes('figma.com/file') && !figmaUrl.includes('figma.com/design')) {
      setError('Please enter a valid Figma file URL.');
      return;
    }
    try {
      setError('');
      // Save to main document with merge
      await setDoc(doc(db, 'lftPosts', teamId), { figmaUrl: figmaUrl }, { merge: true });
    } catch (err) {
      console.error("Error saving URL:", err);
      setError('Failed to save URL.');
    }
  };

  // Handle adding a new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const notesRef = collection(db, 'lftPosts', teamId, 'integrations', 'figma', 'notes');
      await addDoc(notesRef, {
        text: newNote,
        author: currentUser.displayName || currentUser.email,
        uid: currentUser.uid,
        createdAt: serverTimestamp()
      });
      setNewNote('');
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleReset = () => {
    if (window.confirm("Disconnect this Figma file?")) {
      setDoc(doc(db, 'lftPosts', teamId), { figmaUrl: '' }, { merge: true });
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading integration...</div>;

  if (permissionError) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 font-bold bg-gray-900">
        Access Denied: Figma Integration Locked
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-green-400 font-semibold flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" className="w-5 h-5" alt="Figma" />
          Figma Integration
        </h3>
        {savedUrl && (
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400">
            Change File
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {savedUrl ? (
          <>
            {/* Left: Figma Embed (Flex-1 to take remaining space) */}
            <div className="flex-1 border-r border-gray-700 relative flex flex-col">
              <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                <span className="text-xs text-gray-400">Preview Mode</span>
                <a
                  href={savedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition"
                >
                  Open in Figma ↗
                </a>
              </div>
              <iframe
                height="100%"
                width="100%"
                src={`https://www.figma.com/embed?embed_host=hackathon-platform&url=${encodeURIComponent(savedUrl)}`}
                allowFullScreen
                className="border-0 flex-1"
              ></iframe>
            </div>

            {/* Right: Notes Sidebar (Fixed width) */}
            <div className="w-80 flex flex-col bg-gray-800">
              <div className="p-3 border-b border-gray-700 font-semibold text-gray-300">
                Design Feedback
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-4">No feedback yet.</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="bg-gray-700 p-3 rounded-lg text-sm">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-green-400">{note.author}</span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))
                )}
                <div ref={notesEndRef} />
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="p-3 border-t border-gray-700">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Suggest a change..."
                  className="w-full p-2 bg-gray-900 text-white rounded-lg text-sm focus:outline-none resize-none mb-2"
                  rows="3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-sm transition disabled:bg-gray-600"
                >
                  Post Feedback
                </button>
              </form>
            </div>
          </>
        ) : (
          // Setup State (unchanged)
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Connect Figma File</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Paste the URL of your team's Figma design file.
              </p>
              <form onSubmit={handleSaveUrl} className="space-y-4">
                <input
                  type="text"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/design/..."
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" className="w-full py-3 bg-[#F24E1E] hover:bg-[#D23D14] text-white font-bold rounded transition">
                  Connect Figma
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamFigma;