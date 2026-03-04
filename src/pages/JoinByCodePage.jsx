import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function JoinByCodePage() {
  const { joinCode } = useParams(); // Get code from URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // 1. Find the team post using the join code
  useEffect(() => {
    const fetchPostByCode = async () => {
      setLoading(true);
      setError('');
      
      try {
        const postsRef = collection(db, 'lftPosts');
        // Query Firestore for a document matching this join code
        const q = query(postsRef, where("joinCode", "==", joinCode));
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Invalid or expired join code.');
        } else {
          // Get the first (and only) document
          const postDoc = querySnapshot.docs[0];
          setPost({ id: postDoc.id, ...postDoc.data() });
        }
      } catch (err) {
        console.error("Error fetching post by code: ", err);
        setError('Failed to find team. Please check the code and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostByCode();
  }, [joinCode]); // Re-run if the code changes

  // 2. Handle the "Join" button click
  const handleJoin = async () => {
    if (!currentUser) {
      navigate('/login'); // Not logged in
      return;
    }
    
    if (!post) return; // No post found
    
    // Check if user is already on the team
    if (post.teamMembers.includes(currentUser.uid)) {
      navigate(`/post/${post.id}`); // Already on the team, just go to the page
      return;
    }

    // Check if team is full
    if (post.teamMembers.length >= post.maxTeamSize) {
      setError('This team is already full.');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // --- TYPO FIX 1: Was 'lfsPosts' ---
      const postRef = doc(db, 'lftPosts', post.id);
      const isNowFull = (post.teamMembers.length + 1) >= post.maxTeamSize;
      
      await updateDoc(postRef, {
        teamMembers: arrayUnion(currentUser.uid),
        isFull: isNowFull
      });
      
      // Success! Send them to the team page
      navigate(`/post/${post.id}`);
      
    // --- TYPO FIX 2: Was (err)_ ---
    } catch (err) { 
      console.error("Error joining team: ", err);
      setError('Failed to join team. Please try again.');
      setIsJoining(false);
    }
  };

  // --- Render Logic ---

  if (loading) {
    return <div className="p-8 text-center text-lg text-green-400">Searching for team...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Invite Not Found</h1>
        <p className="text-gray-300 text-lg mb-8">{error}</p>
        <Link 
          to="/hackathons"
          className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition duration-300"
        >
          Browse Hackathons
        </Link>
      </div>
    );
  }

  // Success state (post found)
  if (post) {
    return (
      <div className="p-8 flex justify-center items-start pt-16">
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-green-400">You're Invited!</h1>
          <p className="text-gray-300 text-lg">
            You've been invited to join the team:
          </p>
          <p className="text-2xl font-semibold text-white my-4">
            "{post.postTitle}"
          </p>
          <p className="text-gray-400 mb-2">
            for the hackathon: <span className="font-bold">{post.hackathonName}</span>
          </p>
          <p className="text-gray-400 mb-6">
            Team is currently {post.teamMembers.length} / {post.maxTeamSize}
          </p>
          
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500"
          >
            {isJoining ? 'Joining...' : 'Confirm & Join Team'}
          </button>
        </div>
      </div>
    );
  }

  return null; // Should not be reached
}

export default JoinByCodePage;