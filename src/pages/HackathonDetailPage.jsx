import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from '../components/CreatePostModal';
import { LftPostSkeleton } from '../components/LoadingSkeletons.jsx';

function HackathonDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [lftPosts, setLftPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLftPosts = React.useCallback(async () => {
    try {
      const lftCollection = collection(db, 'lftPosts');

      const q = query(
        lftCollection,
        where("hackathonId", "==", id)
      );

      const querySnapshot = await getDocs(q);
      const allPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const openPosts = allPosts.filter(post => {
        const teamSize = post.teamMembers ? post.teamMembers.length : 0;
        const maxSize = post.maxTeamSize || 999;
        return teamSize < maxSize;
      });

      openPosts.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });

      setLftPosts(openPosts);
    } catch (err) {
      console.error("Error fetching LFT posts: ", err);
      setError('Failed to load team posts.');
    }
  }, [id]);

  useEffect(() => {
    const fetchHackathonDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const docRef = doc(db, 'hackathons', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setHackathon({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Hackathon not found.');
          setLoading(false);
          return;
        }

        await fetchLftPosts();

      } catch (err) {
        console.error("Error fetching details: ", err);
        setError('Failed to load hackathon details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathonDetails();
  }, [id, fetchLftPosts]);

  const handleOpenModal = () => {
    if (currentUser) {
      setIsModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handlePostCreated = () => {
    fetchLftPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <LftPostSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur border border-red-500/30 rounded-2xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hackathon Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur border border-gray-700 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            {/* Event Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-sm font-bold uppercase tracking-wide">Live Event</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {hackathon.name}
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-6 leading-relaxed max-w-4xl">
              {hackathon.description}
            </p>

            {/* Event Details */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Starts</p>
                  <p className="text-white font-bold">{hackathon.startDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Ends</p>
                  <p className="text-white font-bold">{hackathon.endDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Open Teams</p>
                  <p className="text-white font-bold">{lftPosts.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Find Teammates</h2>
              <p className="text-sm text-gray-400">Browse teams or create your own</p>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Your Idea
          </button>
        </div>

        {/* Team Posts Grid */}
        <div className="space-y-4">
          {lftPosts.length > 0 ? (
            lftPosts.map(post => (
              <div
                key={post.id}
                className="group bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:bg-gray-800/80 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section: Post Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Creator Avatar */}
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-2 border-gray-700 group-hover:border-blue-500/50 transition-colors">
                          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* Post Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {post.postTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium text-gray-300">{post.creatorName}</span>
                          </div>

                          <span className="text-gray-600">•</span>

                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 rounded-lg">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-sm font-bold text-white">
                              {post.teamMembers.length} / {post.maxTeamSize}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        {post.creatorSkills && (
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <div className="flex flex-wrap gap-2">
                              {post.creatorSkills.split(',').map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/20"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Action Button */}
                  <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-2 shrink-0">
                    {/* Team Size Display - Mobile */}
                    <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm font-bold text-white">
                        {post.teamMembers.length} / {post.maxTeamSize}
                      </span>
                    </div>

                    <Link
                      to={`/post/${post.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
                    >
                      <span>View & Join</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800/30 backdrop-blur border-2 border-dashed border-gray-700 rounded-2xl p-16 text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3">No Teams Yet</h3>
              <p className="text-gray-400 mb-2">
                No open teams found for this event yet.
              </p>
              <p className="text-gray-500 mb-8">
                Be the first one! Click "Post Your Idea" to build your team.
              </p>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Team
              </button>
            </div>
          )}
        </div>

      </div>

      {isModalOpen && (
        <CreatePostModal
          hackathon={hackathon}
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

export default HackathonDetailPage;