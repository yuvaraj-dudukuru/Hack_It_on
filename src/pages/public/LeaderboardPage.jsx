import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Trophy, Medal, Crown, Search, Filter } from 'lucide-react';

import { useLeaderboard } from '../../hooks/useLeaderboard';

const LeaderboardPage = () => {
    const { standings: teams, loading } = useLeaderboard();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeams = teams.filter(team =>
        team.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-gray-300" size={24} />;
        if (index === 2) return <Medal className="text-orange-400" size={24} />;
        return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">The Arena</h1>
                    <p className="text-gray-400 text-lg">Real-time standings of HackOS 2026</p>
                </header>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search team name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                                    <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Team</th>
                                    <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">College</th>
                                    <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-gray-500">Loading standings...</td>
                                    </tr>
                                ) : filteredTeams.length > 0 ? (
                                    filteredTeams.map((team, index) => (
                                        <tr key={team.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">{team.teamName}</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-tighter">{team.members?.length || 0} Members</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-gray-400 font-medium">{team.college}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-2xl font-black text-white">{team.totalScore || 0}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-gray-500">No teams found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
