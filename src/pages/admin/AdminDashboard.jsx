import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { hackathonService } from '../../services/hackathonService';
import { auditService } from '../../services/auditService';
import { scoreService } from '../../services/scoreService';
import { Users, CreditCard, Send, CheckCircle2, XCircle, Search, Filter, Download, MoreHorizontal, Lock, Unlock, Calendar, Calculator } from 'lucide-react';

import { useTeams } from '../../hooks/useTeams';

const AdminDashboard = () => {
    const { userData } = useAuth();
    const { teams, loading } = useTeams();
    const [settings, setSettings] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const settingsUnsubscribe = hackathonService.subscribeToSettings(setSettings);
        return () => settingsUnsubscribe();
    }, []);

    const updateTeamStatus = async (teamId, field, value) => {
        try {
            const teamRef = doc(db, 'teams', teamId);
            await updateDoc(teamRef, { [field]: value });

            // Audit Log
            await auditService.logEvent(
                'TEAM_STATUS_UPDATE',
                userData.uid,
                'admin',
                teamId,
                { field, newValue: value }
            );
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const handleFinalizeRound = async (teamId) => {
        if (!window.confirm('Are you sure you want to finalize scores for this team?')) return;
        try {
            await scoreService.finalizeTeamRound(teamId, settings.currentRound, userData.uid);
            alert('Round finalized and leaderboard updated.');
        } catch (error) {
            alert(`Finalization failed: ${error.message}`);
        }
    };

    const toggleRoundLock = async (roundNum) => {
        const roundKey = `round${roundNum}`;
        const newLockedState = !settings[roundKey].isLocked;
        try {
            await hackathonService.updateRoundSettings({
                [`${roundKey}.isLocked`]: newLockedState
            });
            await auditService.logEvent(
                'ROUND_LOCK_TOGGLE',
                userData.uid,
                'admin',
                'global',
                { round: roundNum, locked: newLockedState }
            );
        } catch (error) {
            console.error("Error toggling lock:", error);
        }
    };

    const stats = {
        total: teams.length,
        verified: teams.filter(t => t.paymentStatus === 'verified').length,
        submissions: teams.filter(t => t.round1Status === 'qualified' || t.round1Status === 'pending').length
    };

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.leaderEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || team.paymentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Command Center</h1>
                    <p className="text-gray-400 font-medium">Managing HackOS 2026 Ecosystem</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Round Control Panel */}
            {settings && (
                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                                <Calendar className="text-purple-400" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Round {settings.currentRound} Management</h2>
                                <p className="text-gray-400 text-sm font-medium">Status: {settings[`round${settings.currentRound}`].isActive ? 'ACTIVE' : 'READY'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => toggleRoundLock(settings.currentRound)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all border ${settings[`round${settings.currentRound}`].isLocked
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'bg-green-500/10 border-green-500/20 text-green-500'
                                    }`}
                            >
                                {settings[`round${settings.currentRound}`].isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                                {settings[`round${settings.currentRound}`].isLocked ? 'LOCKED' : 'ALLOW SUBMISSIONS'}
                            </button>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                                NEXT ROUND
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Teams', value: stats.total, icon: <Users className="text-cyan-400" />, color: 'from-cyan-500/10' },
                    { label: 'Payments Verified', value: stats.verified, icon: <CreditCard className="text-green-400" />, color: 'from-green-500/10' },
                    { label: 'Project Submissions', value: stats.submissions, icon: <Send className="text-purple-400" />, color: 'from-purple-500/10' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} to-transparent border border-white/5 p-8 rounded-[32px]`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Live Metadata</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-1">{stat.label}</h3>
                        <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Team Management Table */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by team or leader email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-14 pr-6 focus:outline-none focus:border-cyan-500/30 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 focus:outline-none focus:border-cyan-500/30 font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="all">All Payments</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Team / Leader</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">College</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Payment</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Round 1</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500 font-bold">InSync with Firestore...</td></tr>
                            ) : filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                    <tr key={team.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{team.teamName}</p>
                                                <p className="text-xs text-gray-500">{team.leaderEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-medium text-gray-400">{team.college}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => updateTeamStatus(team.id, 'paymentStatus', team.paymentStatus === 'verified' ? 'pending' : 'verified')}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${team.paymentStatus === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                    }`}
                                            >
                                                {team.paymentStatus || 'pending'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {['pending', 'qualified', 'rejected'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateTeamStatus(team.id, 'round1Status', s)}
                                                        className={`w-2 h-2 rounded-full ${team.round1Status === s ? 'ring-4 ring-cyan-500/20 scale-125' : 'opacity-20'} ${s === 'qualified' ? 'bg-green-500' : s === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleFinalizeRound(team.id)}
                                                    className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                                                >
                                                    <Calculator size={14} /> Finalize
                                                </button>
                                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500">No teams matching criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
