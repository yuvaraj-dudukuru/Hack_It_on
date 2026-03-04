import React, { useState, useEffect, useRef } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function TeamWhiteboard({ teamId }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const timeoutRef = useRef(null);
  const isSyncingFromFirebase = useRef(false);

  // 1. Load & Listen for changes from Firestore
  useEffect(() => {
    if (!excalidrawAPI) return;

    const docRef = doc(db, 'lftPosts', teamId, 'wiki', 'whiteboard');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.elements && !isSyncingFromFirebase.current) {
          // We wrap this in a flag so our own 'onChange' doesn't
          // immediately re-trigger a save loop.
          isSyncingFromFirebase.current = true;
          excalidrawAPI.updateScene({
            elements: JSON.parse(data.elements),
            appState: data.appState ? JSON.parse(data.appState) : undefined
          });
          setStatus('Synced');
          // Reset flag after a moment
          setTimeout(() => isSyncingFromFirebase.current = false, 1000);
        }
      } else {
        setStatus('Ready');
      }
    }, (err) => {
      console.error("Error syncing whiteboard:", err);
      setStatus('Offline Mode (Access Denied)');
    });

    return () => unsubscribe();
  }, [teamId, excalidrawAPI]);

  // 2. Handle local changes (Auto-save to Firestore)
  const handleChange = (elements, appState) => {
    // Don't save if this change came from Firebase
    if (isSyncingFromFirebase.current) return;

    setStatus('Unsaved changes...');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Debounce save: wait 1 second after last edit
    timeoutRef.current = setTimeout(async () => {
      setStatus('Saving...');
      try {
        const docRef = doc(db, 'lftPosts', teamId, 'wiki', 'whiteboard');
        // We must stringify because Firestore doesn't like deeply nested arrays/undefined
        await setDoc(docRef, {
          elements: JSON.stringify(elements),
          appState: JSON.stringify({ viewBackgroundColor: appState.viewBackgroundColor })
        }, { merge: true });
        setStatus('Saved');
      } catch (err) {
        console.error("Error saving whiteboard: ", err);
        setStatus('Error saving');
      }
    }, 1000);
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center text-sm">
        <span className="text-green-400 font-semibold ml-4">Framework Design Space (Excalidraw)</span>
        <span className={`mr-4 ${status === 'Saved' || status === 'Synced' ? 'text-gray-400' : 'text-yellow-400'}`}>
          {status}
        </span>
      </div>
      <div className="flex-1">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          theme="dark"
          UIOptions={{
            canvasActions: { loadScene: false, saveToActiveFile: false }
          }}
        />
      </div>
    </div>
  );
}

export default TeamWhiteboard;