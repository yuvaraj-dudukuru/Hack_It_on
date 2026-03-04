import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';

function CreatePostModal({ hackathon, onClose, onPostCreated }) {
  const { currentUser } = useAuth();
  const [postTitle, setPostTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 1. NEW FUNCTION: Generate a random 6-char code ---
  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to post.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let creatorName = currentUser.email;
      let creatorSkills = '';

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        creatorName = userData.displayName || currentUser.email;
        creatorSkills = userData.skills || '';
      }

      const newMaxTeamSize = parseInt(maxTeamSize, 10);
      const newJoinCode = generateJoinCode(); // <-- 2. Generate the code

      await addDoc(collection(db, 'lftPosts'), {
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        creatorId: currentUser.uid,
        creatorName: creatorName,
        creatorSkills: creatorSkills,
        postTitle: postTitle,
        ideaDescription: ideaDescription,
        teamMembers: [currentUser.uid], 
        maxTeamSize: newMaxTeamSize, 
        isFull: 1 >= newMaxTeamSize, 
        joinCode: newJoinCode, // <-- 3. Add the code to the document
        createdAt: serverTimestamp() 
      });

      console.log('LFT Post created successfully!');
      setLoading(false);
      onPostCreated(); 
      onClose();
      
    } catch (err) {
      console.error("Error creating post: ", err);
      setError('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4 text-green-400">Post Your Idea</h2>
        <p className="text-gray-400 mb-6">
          You are posting for: <span className="font-bold">{hackathon.name}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="postTitle">
                Post Title
              </label>
              <input
                type="text"
                id="postTitle"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
                placeholder="e.g., Need Backend Dev for AI Chatbot!"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="maxTeamSize">
                Max Team Size (incl. you)
              </label>
              <select
                id="maxTeamSize"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="ideaDescription">
              Your Idea & What You're Looking For
            </label>
            <textarea
              id="ideaDescription"
              rows="5"
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
              placeholder="Describe your project idea and what kind of teammates (or skills) you need."
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs italic mb-4">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition duration-300 disabled:bg-gray-500"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;