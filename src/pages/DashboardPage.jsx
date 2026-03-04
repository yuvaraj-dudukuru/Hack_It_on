import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Trophy, Rocket, Target, Zap, Users, LayoutDashboard } from 'lucide-react';
import { cn, colors, typography } from '../design-system/theme';

function DashboardPage() {
  const { currentUser } = useAuth();
  const [activeTeams, setActiveTeams] = useState([]);
  const [pastTeams, setPastTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchMyTeams = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const postsRef = collection(db, 'lftPosts');
        const q = query(postsRef, where("teamMembers", "array-contains", currentUser.uid));

        const querySnapshot = await getDocs(q);
        const allTeams = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        allTeams.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });

        setActiveTeams(allTeams.filter(team => !team.isSubmitted));
        setPastTeams(allTeams.filter(team => team.isSubmitted));

      } catch (err) {
        console.error("Error fetching user's teams: ", err);
        setError('Failed to load your metrics. System diagnostics required.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeams();
  }, [currentUser]);

  const TeamCard = ({ team, isActive }) => (
    <div className={cn(
      "group relative overflow-hidden transition-all duration-500",
      "bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8",
      "hover:bg-white/[0.05] hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    )}>
      {/* Neo Glow Background */}
      <div className={cn(
        "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        isActive ? "bg-cyan-500" : "bg-purple-500"
      )} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
              isActive
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:rotate-3"
                : "bg-purple-500/10 border-purple-500/20 text-purple-400"
            )}>
              {isActive ? <Rocket className="w-7 h-7 animate-float" /> : <Trophy className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                {team.postTitle}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Target size={14} className="text-cyan-500/70" />
                <span className="font-bold tracking-tight uppercase text-[10px]">{team.hackathonName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isActive ? (
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                Active Sector
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                Archived
              </span>
            )}
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full">
              <Users size={12} /> {team.teamMembers.length} Devs
            </div>
          </div>
        </div>

        <Link
          to={`/team/${team.id}`}
          className={cn(
            "inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300",
            isActive
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.5)] hover:scale-105"
              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
          )}
        >
          <span>{isActive ? 'Enter Terminal' : 'Review Manifest'}</span>
          <Zap size={16} className={isActive ? 'animate-pulse' : ''} />
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin-slow"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-[2rem] border border-cyan-500/20 shadow-inner">
          <LayoutDashboard size={40} className="text-cyan-400" />
        </div>
        <div>
          <h1 className={typography.h1}>Protocol <span className="text-cyan-400">Engine</span></h1>
          <p className="text-gray-400 font-medium tracking-wide">All systems operational.</p>
        </div>
      </div>

      {/* Projects Sectors */}
      <div className="space-y-16">
        {/* Active Sector */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <h2 className="text-3xl font-black text-white tracking-tight">Active <span className="text-cyan-400 font-light">Deployments</span></h2>
          </div>

          {activeTeams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {activeTeams.map(team => <TeamCard key={team.id} team={team} isActive={true} />)}
            </div>
          ) : (
            <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                <Target size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No Active Deployments</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">Scan the network for new hackathon opportunities and initiate your next build.</p>
              <Link to="/hackathons" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-gray-950 font-black rounded-2xl shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-all">
                Search Network
              </Link>
            </div>
          )}
        </section>

        {/* History Sector */}
        <section className="space-y-8 opacity-70 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-purple-500 rounded-full" />
            <h2 className="text-3xl font-black text-white tracking-tight">Project <span className="text-purple-400 font-light">Archive</span></h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pastTeams.length > 0 ? (
              pastTeams.map(team => <TeamCard key={team.id} team={team} isActive={false} />)
            ) : (
              <p className="text-gray-500 italic p-12 text-center border border-white/5 rounded-3xl">No historical data found in your manifest.</p>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}

export default DashboardPage;
