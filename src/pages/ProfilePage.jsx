import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebaseConfig.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';

function ProfilePage() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [pastProjects, setPastProjects] = useState([]);

  const targetUid = userId || currentUser?.uid;
  const isOwnProfile = currentUser && targetUid === currentUser.uid;

  useEffect(() => {
    const loadData = async () => {
      if (!targetUid) return;

      setLoading(true);

      const docRef = doc(db, 'users', targetUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
        setSkills(data.skills || '');
      }

      const postsRef = collection(db, 'lftPosts');
      const q = query(postsRef, where("teamMembers", "array-contains", targetUid));
      const querySnapshot = await getDocs(q);
      
      const projectsWithDetails = await Promise.all(querySnapshot.docs.map(async (projectDoc) => {
        const data = projectDoc.data();
        if (!data.isSubmitted) return null;

        const memberPromises = data.teamMembers.map(async (memberId) => {
           const userSnap = await getDoc(doc(db, 'users', memberId));
           let name = "Unknown";
           if (userSnap.exists()) {
             name = userSnap.data().displayName || "Anonymous";
           }
           return { id: memberId, name: name };
        });

        const members = await Promise.all(memberPromises);

        return {
          id: projectDoc.id,
          ...data,
          members: members
        };
      }));

      setPastProjects(projectsWithDetails.filter(p => p !== null));
      setLoading(false);
    };
    loadData();
  }, [targetUid]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    setMessage('');
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName, bio, skills, email: currentUser.email
      }, { merge: true });
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error("Error updating profile: ", err);
      setMessage('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!targetUid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- LEFT COLUMN: Edit Form (ONLY VISIBLE IF OWNING PROFILE) --- */}
          {isOwnProfile && (
            <div className="w-full lg:w-96 shrink-0">
              <div className="sticky top-8">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="displayName">
                        Display Name
                      </label>
                      <input 
                        type="text" 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-500"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="bio">
                        Bio
                      </label>
                      <textarea 
                        id="bio" 
                        rows="3" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none placeholder-gray-500"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="skills">
                        Skills
                      </label>
                      <input 
                        type="text" 
                        id="skills" 
                        value={skills} 
                        onChange={(e) => setSkills(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-500"
                        placeholder="React, Node.js, Python..."
                      />
                      <p className="text-xs text-gray-500 mt-2">Separate skills with commas</p>
                    </div>

                    {message && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                        <p className="text-green-400 text-sm text-center font-medium">{message}</p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02]"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- RIGHT COLUMN: Public Portfolio Preview --- */}
          <div className={`flex-1 ${!isOwnProfile ? 'max-w-5xl mx-auto' : ''}`}>
            {/* Profile Header Card */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 mb-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <img 
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${targetUid}`} 
                    alt="avatar" 
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-gray-700 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center border-4 border-gray-800">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {displayName || "Anonymous User"}
                  </h1>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {bio || "No bio yet."}
                  </p>
                  
                  {skills && (
                    <div className="flex flex-wrap gap-2">
                      {skills.split(',').map((skill, i) => skill.trim() && (
                        <span 
                          key={i} 
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Project Portfolio</h2>
                  <p className="text-sm text-gray-400">
                    {pastProjects.length} {pastProjects.length === 1 ? 'project' : 'projects'} completed
                  </p>
                </div>
              </div>
              
              {pastProjects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {pastProjects.map(project => (
                    <div 
                      key={project.id} 
                      className="group bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-green-500/50 hover:bg-gray-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                    >
                      {/* Project Header */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-white mb-1 truncate group-hover:text-green-400 transition-colors" title={project.projectName || project.postTitle}>
                            {project.projectName || project.postTitle}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                              </svg>
                              {project.hackathonName}
                            </span>
                          </div>
                        </div>
                        
                        {project.projectLink && (
                          <a 
                            href={project.projectLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-bold rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all shrink-0"
                          >
                            <span>View</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      
                      {/* Project Description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {project.finalDescription || project.ideaDescription}
                      </p>
                      
                      {/* Team Members */}
                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 mb-2 font-semibold">Team Members</p>
                        <div className="flex flex-wrap gap-2">
                          {project.members.map((member) => (
                            <Link 
                              key={member.id} 
                              to={`/user/${member.id}`}
                              className="group/member inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                            >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                                <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-400 group-hover/member:text-white transition-colors font-medium max-w-[100px] truncate">
                                {member.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-800">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Projects Yet</h3>
                  <p className="text-gray-500 text-sm">
                    {isOwnProfile ? "Start your first hackathon and build something amazing!" : "This user hasn't completed any projects yet."}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;