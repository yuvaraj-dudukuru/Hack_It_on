import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseConfig.js';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

// --- COMPONENTS ---
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import WorkspaceMembersSidebar from '../components/WorkspaceMembersSidebar.jsx';
import { WorkspaceLoading } from '../components/LoadingSkeletons.jsx';
import TaskProgressBar from '../components/TaskProgressBar.jsx';
import TeamChat from '../components/TeamChat.jsx';
import TaskHub from '../components/TaskHub.jsx';
import DesignHub from '../components/DesignHub.jsx';
import TeamKnowledgeBase from '../components/TeamKnowledgeBase.jsx';
import TeamResearch from '../components/TeamResearch.jsx';

// --- MODALS ---
import StartHackathonModal from '../components/StartHackathonModal.jsx';
import SubmitProjectModal from '../components/SubmitProjectModal.jsx';

import {
  MessageSquare,
  CheckSquare,
  Palette,
  BookOpen,
  Cpu
} from 'lucide-react';
import { cn } from '../design-system/theme';

function TeamWorkspacePage() {
  const { teamId } = useParams();
  const { currentUser } = useAuth();

  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // 1. Real-time listener for team data
  useEffect(() => {
    const postRef = doc(db, 'lftPosts', teamId);
    const unsubscribe = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setTeam({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Team workspace not found.');
      }
    }, (err) => {
      console.error("Error listening to team: ", err);
      setError('Failed to load team data.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  // 2. Real-time listener for team member profiles (to get presence)
  useEffect(() => {
    if (!team || team.teamMembers.length === 0) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    const membersRef = collection(db, 'users');
    const q = query(membersRef, where('__name__', 'in', team.teamMembers));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(membersData);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to members:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [team]);

  // 3. Presence Heartbeat
  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          lastActive: serverTimestamp(),
          currentTeam: teamId // Useful for knowing where they are
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    updatePresence(); // Initial
    const interval = setInterval(updatePresence, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [currentUser, teamId]);

  // 3. Handle Project Submission
  const handleSubmitProject = () => {
    setIsSubmitModalOpen(true);
  };

  if (loading) return <WorkspaceLoading />;

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
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

  if (!team) return null;

  const isCreator = currentUser && team.creatorId === currentUser.uid;
  const displayTitle = team.projectName || team.postTitle;

  // --- CALCULATE STATES ---
  const isExpired = team.hackathonEndsAt && team.hackathonEndsAt.toMillis() < Date.now();
  const isHackathonActive = team.hackathonStartedAt && !team.isSubmitted && !isExpired;
  const isReadOnly = team.isSubmitted || isExpired;

  // Tab configuration with icons
  const tabs = [
    { id: 'chat', label: 'Comm-Link', icon: <MessageSquare size={18} /> },
    { id: 'tasks', label: 'Task Hub', icon: <CheckSquare size={18} /> },
    { id: 'design', label: 'Design Core', icon: <Palette size={18} /> },
    { id: 'docs', label: 'Archives', icon: <BookOpen size={18} /> },
    { id: 'research', label: 'AI Oracle', icon: <Cpu size={18} /> }
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

      {/* Progress Bar at top */}
      <div className="shrink-0">
        <TaskProgressBar teamId={teamId} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">

        {/* --- HEADER (Extracted) --- */}
        <WorkspaceHeader
          displayTitle={displayTitle}
          isHackathonActive={isHackathonActive}
          hackathonEndsAt={team.hackathonEndsAt}
          isReadOnly={isReadOnly}
          isSubmitted={team.isSubmitted}
          projectLink={team.projectLink}
          hackathonStartedAt={team.hackathonStartedAt}
          isCreator={isCreator}
          setIsStartModalOpen={setIsStartModalOpen}
          handleSubmitProject={handleSubmitProject}
          hackathonId={team.hackathonId}
        />

        {/* --- MAIN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 flex-1 min-h-0">
          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex bg-[#030712]/40 border-b border-white/5 shrink-0 overflow-x-auto custom-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-8 py-5 text-center transition-all duration-300 flex items-center gap-3 group",
                    activeTab === tab.id
                      ? "text-cyan-400 bg-white/[0.03]"
                      : "text-gray-500 hover:text-white hover:bg-white/[0.01]"
                  )}
                >
                  <div className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    activeTab === tab.id ? "text-cyan-400" : "text-gray-600 group-hover:text-gray-400"
                  )}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">
                    {tab.label}
                  </span>

                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden bg-gray-900/50">
              {activeTab === 'chat' && <div className="h-full"><TeamChat teamId={teamId} isReadOnly={isReadOnly} /></div>}
              {activeTab === 'tasks' && <div className="h-full"><TaskHub teamId={teamId} teamMembers={teamMembers} isReadOnly={isReadOnly} /></div>}
              {activeTab === 'design' && <div className="h-full"><DesignHub teamId={teamId} isReadOnly={isReadOnly} /></div>}
              {activeTab === 'docs' && <div className="h-full"><TeamKnowledgeBase teamId={teamId} isReadOnly={isReadOnly} /></div>}
              {activeTab === 'research' && <div className="h-full"><TeamResearch teamId={teamId} isReadOnly={isReadOnly} /></div>}
            </div>
          </div>

          {/* Team Members Sidebar (Extracted) */}
          <WorkspaceMembersSidebar
            teamMembers={teamMembers}
            maxTeamSize={team.maxTeamSize}
            creatorId={team.creatorId}
          />
        </div>
      </div>

      {isStartModalOpen && <StartHackathonModal teamId={teamId} onClose={() => setIsStartModalOpen(false)} />}
      {isSubmitModalOpen && (<SubmitProjectModal teamId={teamId} teamName={displayTitle} onClose={() => setIsSubmitModalOpen(false)} />)}
    </div>
  );
}

export default TeamWorkspacePage;