import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import HackathonCard from '../components/HackathonCard';
import AddHackathonModal from '../components/AddHackathonModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HackathonCardSkeleton } from '../components/LoadingSkeletons.jsx';

function HackathonsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError('');
      const hackathonsCollection = collection(db, 'hackathons');
      const q = query(hackathonsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const hackathonsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHackathons(hackathonsList);
    } catch (err) {
      console.error("Error fetching hackathons: ", err);
      if (err.message.includes("requires an index")) {
         const simpleQuery = query(collection(db, 'hackathons'));
         const simpleSnap = await getDocs(simpleQuery);
         const simpleList = simpleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setHackathons(simpleList);
      } else {
         setError('Failed to load hackathons.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleAddClick = () => {
    if (currentUser) {
      setIsModalOpen(true);
    } else {
      navigate('/login');
    }
  }

  if (loading) {
   return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {loading ? (
      // Show 6 skeleton cards while loading
      [...Array(6)].map((_, i) => <HackathonCardSkeleton key={i} />)
    ) : (
      hackathons.map(hackathon => (
        <HackathonCard key={hackathon.id} hackathon={hackathon} />
      ))
    )}
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
          <button 
            onClick={fetchHackathons}
            className="mt-6 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-all duration-300 border border-red-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Explore Hackathons</h1>
                <p className="text-gray-400 mt-1">Discover exciting events and join the community</p>
              </div>
            </div>
            
            <button 
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Hackathon
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{hackathons.length}</p>
                  <p className="text-xs text-gray-400">Total Events</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{hackathons.length}</p>
                  <p className="text-xs text-gray-400">Active Now</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">∞</p>
                  <p className="text-xs text-gray-400">Opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hackathons Grid */}
        {hackathons.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                Available Events
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map(hackathon => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 backdrop-blur border-2 border-dashed border-gray-700 rounded-2xl p-16 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No Hackathons Yet</h3>
            <p className="text-gray-400 mb-2">
              No hackathons found in the system.
            </p>
            <p className="text-gray-500 mb-8">
              Be the first to add one and start building amazing teams!
            </p>
            <button 
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Hackathon
            </button>
          </div>
        )}

      </div>

      {isModalOpen && (
        <AddHackathonModal 
          onClose={() => setIsModalOpen(false)}
          onHackathonAdded={() => {
             fetchHackathons();
          }}
        />
      )}
    </div>
  );
}

export default HackathonsPage;