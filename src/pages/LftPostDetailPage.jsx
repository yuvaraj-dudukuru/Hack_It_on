import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig.js'; // Added .js extension
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx'; // Added .jsx extension

function LftPostDetailPage() {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isUserOnTeam = post && currentUser && post.teamMembers.includes(currentUser.uid);
  const isUserCreator = post && currentUser && post.creatorId === currentUser.uid;
  const isTeamFull = post && post.teamMembers.length >= post.maxTeamSize;
  const hasRequested = post && currentUser && post.joinRequests?.includes(currentUser.uid);

  // Real-time listener
  useEffect(() => {
    setLoading(true);
    const postRef = doc(db, 'lftPosts', postId);
    const unsubscribe = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
        setError('');
      } else {
        setError('Team post not found.');
        setPost(null);
      }
    }, (err) => {
      console.error("Error listening to post: ", err);
      setError('Failed to load post data.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [postId]);

  // Fetch profiles for Members AND Pending Requests
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!post) return;
      
      const getUsers = async (userIds) => {
        if (!userIds || userIds.length === 0) return [];
        return Promise.all(userIds.map(async (uid) => {
          const snap = await getDoc(doc(db, 'users', uid));
          return snap.exists() ? { id: uid, ...snap.data() } : { id: uid, email: 'Unknown' };
        }));
      };

      const [members, requests] = await Promise.all([
        getUsers(post.teamMembers),
        getUsers(post.joinRequests)
      ]);

      setTeamMembers(members);
      setPendingRequests(requests);
      setLoading(false);
    };

    fetchProfiles();
  }, [post]);

  // Handle "Request to Join"
  const handleRequestJoin = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (isUserOnTeam || isTeamFull || hasRequested) return;

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'lftPosts', postId), {
        joinRequests: arrayUnion(currentUser.uid)
      });
    } catch (err) {
      console.error("Error requesting join:", err);
      setActionError('Failed to send request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Admin Accepts Request
  const handleAcceptRequest = async (userId) => {
    if (!isUserCreator || isTeamFull) return;
    
    setPendingRequests(prev => prev.filter(u => u.id !== userId)); 

    try {
      const postRef = doc(db, 'lftPosts', postId);
      const isNowFull = (post.teamMembers.length + 1) >= post.maxTeamSize;
      
      await updateDoc(postRef, {
        joinRequests: arrayRemove(userId),
        teamMembers: arrayUnion(userId),
        isFull: isNowFull
      });
    } catch (err) {
       console.error("Error accepting:", err);
       setActionError("Failed to accept user.");
    }
  };

  // Admin Declines Request
  const handleDeclineRequest = async (userId) => {
    if (!isUserCreator) return;
    setPendingRequests(prev => prev.filter(u => u.id !== userId)); 
    try {
      await updateDoc(doc(db, 'lftPosts', postId), {
        joinRequests: arrayRemove(userId)
      });
    } catch (err) {
       console.error("Error declining:", err);
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentUser || !isUserOnTeam || isUserCreator) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'lftPosts', postId), {
        teamMembers: arrayRemove(currentUser.uid),
        isFull: false
      });
    } catch (err) {
      console.error("Error leaving:", err);
      setActionError('Failed to leave team.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
       setCopiedLink(true);
       setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (loading && !post) return <div className="p-8 text-center text-green-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!post) return null;

  const joinLink = `${window.location.origin}/join/${post.joinCode}`;

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
            <Link to={`/hackathon/${post.hackathonId}`} className="text-green-400 hover:underline">
              &larr; Back to {post.hackathonName}
            </Link>
            <h1 className="text-4xl font-bold mt-4">{post.postTitle}</h1>
            <p className="text-gray-400 mt-2">
              Posted by <span className="font-medium text-gray-200">{post.creatorName}</span>
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2">Idea & Description</h2>
            <p className="text-gray-300 text-lg whitespace-pre-wrap">{post.ideaDescription}</p>
            <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2">Required Skills</h2>
            <p className="text-gray-300 text-lg">{post.creatorSkills || 'Not specified'}</p>
          </div>

          {isUserCreator && pendingRequests.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border-2 border-yellow-500/50">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">
                 Pending Join Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                       <img src={req.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${req.id}`} className="w-8 h-8 rounded-full" alt="" />
                       <div>
                         <p className="font-medium">{req.displayName || req.email}</p>
                         <p className="text-xs text-gray-400">{req.skills || 'No skills listed'}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                         onClick={() => handleAcceptRequest(req.id)}
                         disabled={isTeamFull}
                         className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded disabled:bg-gray-500"
                      >
                        Accept
                      </button>
                      <button 
                         onClick={() => handleDeclineRequest(req.id)}
                         className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl sticky top-28">
            <h2 className="text-2xl font-bold mb-4">Team ({teamMembers.length} / {post.maxTeamSize})</h2>
            <div className="space-y-4 mb-6">
              {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <img src={member.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${member.email}&radius=50`} alt="" className="w-10 h-10 rounded-full bg-gray-600" />
                    <div>
                      <p className="font-medium text-gray-200">{member.displayName || member.email}</p>
                      {post.creatorId === member.id && <span className="text-xs text-green-400 font-bold">Team Lead</span>}
                    </div>
                  </div>
                ))
              }
            </div>
            
            {currentUser && (
              isUserOnTeam ? (
                isUserCreator ? (
                  <button disabled className="w-full bg-gray-600 text-gray-300 font-bold py-3 px-4 rounded-lg cursor-not-allowed">You are the Team Lead</button>
                ) : (
                  <button onClick={handleLeaveTeam} disabled={isProcessing} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-500">
                    {isProcessing ? 'Leaving...' : 'Leave Team'}
                  </button>
                )
              ) : hasRequested ? (
                 <button disabled className="w-full bg-yellow-500/80 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed">
                    Request Pending...
                 </button>
              ) : isTeamFull ? (
                 <button disabled className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed">Team is Full</button>
              ) : (
                 <button onClick={handleRequestJoin} disabled={isProcessing} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-500">
                   {isProcessing ? 'Sending...' : 'Request to Join'}
                 </button>
              )
            )}
            {!currentUser && (
              <button onClick={() => navigate('/login')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition">
                Login to Join
              </button>
            )}
            {actionError && <p className="text-red-500 text-xs italic mt-4 text-center">{actionError}</p>}
          </div>
          
          {isUserCreator && post.joinCode && (
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl border-t-4 border-green-400">
              <h3 className="text-xl font-bold text-green-400 mb-3">Admin: Invite Friends</h3>
              <p className="text-gray-300 text-sm mb-2">Share this code for instant access:</p>
              <input type="text" readOnly value={post.joinCode} className="w-full p-2 rounded bg-gray-800 text-white text-center font-mono text-lg mb-4" />
              <div className="flex">
                <input type="text" readOnly value={joinLink} className="w-full p-2 rounded-l bg-gray-800 text-white text-xs overflow-hidden" />
                <button onClick={() => copyToClipboard(joinLink)} className="px-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-r text-sm">
                  {copiedLink ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LftPostDetailPage;