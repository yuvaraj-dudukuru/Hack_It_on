import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { Users as UsersIcon, Shield, Send, CheckCircle2, Clock } from 'lucide-react';
import SubmissionForm from '../../components/participant/SubmissionForm';

const ParticipantDashboard = () => {
    const { userData, currentUser } = useAuth();
    const [team, setTeam] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) {
            setLoading(false);
            return;
        }

        // Listen for team changes
        const unsubTeam = onSnapshot(doc(db, 'teams', userData.teamId), (doc) => {
            if (doc.exists()) setTeam(doc.data());
            setLoading(false);
        });

        // Listen for submission changes
        const unsubSub = onSnapshot(doc(db, 'submissions', userData.teamId), (doc) => {
            if (doc.exists()) setSubmission(doc.data());
        });

        return () => {
            unsubTeam();
            unsubSub();
        };
    }, [userData?.teamId]);

    if (loading) return <div className="p-20 text-center text-gray-400">Loading Dashboard...</div>;

    const getStatusColor = (status) => {
        if (status === 'verified' || status === 'qualified') return 'text-green-400';
        if (status === 'rejected') return 'text-red-400';
        return 'text-yellow-400';
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Team Hub</h1>
                    <p className="text-gray-400 font-medium">Logged in as {userData?.name || currentUser?.email}</p>
                </div>
                {team && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 uppercase font-black">Current Rank</span>
                            <span className="text-xl font-black text-cyan-400">#12</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 uppercase font-black">Total Score</span>
                            <span className="text-xl font-black text-white">{team.totalScore || 0}</span>
                        </div>
                    </div>
                )}
            </header>

            {!userData?.teamId ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-[32px] text-center">
                    <h2 className="text-xl font-bold text-yellow-400 mb-2">No Team Found</h2>
                    <p className="text-gray-400">You haven't been assigned to a team yet. Please check your registration status or contact support.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Submission Section */}
                        <SubmissionForm teamId={userData.teamId} existingSubmission={submission} />

                        {/* Round Status */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Clock className="text-cyan-400" size={24} /> Round Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-black mb-1">Round 1: PPT Evaluation</p>
                                    <p className={`text-lg font-bold ${getStatusColor(team?.round1Status)}`}>
                                        {team?.round1Status?.toUpperCase() || 'PENDING'}
                                    </p>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-black mb-1">Round 2: Implementation</p>
                                    <p className={`text-lg font-bold ${getStatusColor(team?.round2Status)}`}>
                                        {team?.round2Status?.toUpperCase() || 'PENDING'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Team Card */}
                        <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 p-8 rounded-[32px]">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <UsersIcon className="text-cyan-400" size={24} /> {team?.teamName || 'Your Team'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black mb-1">College</p>
                                    <p className="text-white font-bold">{team?.college || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black mb-1">Payment Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${team?.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <p className={`font-bold ${getStatusColor(team?.paymentStatus)}`}>
                                            {team?.paymentStatus?.toUpperCase() || 'PENDING'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <p className="text-xs text-gray-500 uppercase font-black mb-4">Team Members</p>
                                <div className="space-y-3">
                                    {team?.members?.map((member, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
                                                {member.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 truncate">{member}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-3 underline decoration-cyan-500 underline-offset-8">
                                <Shield className="text-cyan-400" size={20} /> Guidelines
                            </h3>
                            <ul className="text-xs text-gray-400 space-y-3 font-medium leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">•</span>
                                    Ensure GitHub repo is public before submission.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">•</span>
                                    Double-check PPT permissions to 'Anyone with the link'.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">•</span>
                                    Deadline for Round 1 is absolute.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
