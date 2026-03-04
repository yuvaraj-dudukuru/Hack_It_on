import React from 'react';
import { User, Shield, Zap, Circle } from 'lucide-react';
import { cn } from '../design-system/theme.js';

function WorkspaceMembersSidebar({ teamMembers, maxTeamSize, creatorId }) {

    const isOnline = (lastActive) => {
        if (!lastActive) return false;
        const lastActiveMillis = lastActive.toMillis ? lastActive.toMillis() : lastActive;
        // Consider online if active in the last 2 minutes
        return (Date.now() - lastActiveMillis) < 120000;
    };

    return (
        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group h-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 shadow-inner">
                            <Zap size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">Squad</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                {teamMembers.length} / {maxTeamSize} Syncing
                            </p>
                        </div>
                    </div>
                </div>

                {/* Member List */}
                <div className="space-y-4 overflow-y-auto max-h-[500px] lg:max-h-none custom-scrollbar pr-2">
                    {teamMembers.map((member) => {
                        const online = isOnline(member.lastActive);
                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500",
                                    "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30",
                                    online && "border-emerald-500/20"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity",
                                        online ? "bg-emerald-500" : "bg-purple-500"
                                    )} />
                                    <img
                                        src={member.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${member.id}`}
                                        alt=""
                                        className={cn(
                                            "relative w-14 h-14 rounded-2xl border-2 transition-all duration-500 object-cover",
                                            online ? "border-emerald-500/50" : "border-white/10 group-hover:border-purple-500/50"
                                        )}
                                    />

                                    {/* Online Indicator Dot */}
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0a0a0c] z-10",
                                        online ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-gray-600"
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="font-black text-sm text-white truncate transition-colors group-hover:text-purple-400">
                                            {member.displayName || member.email?.split('@')[0]}
                                        </p>
                                        {creatorId === member.id && (
                                            <Shield size={12} className="text-amber-400 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            online ? "text-emerald-400" : "text-gray-600"
                                        )}>
                                            {online ? 'Active Now' : 'Offline'}
                                        </span>
                                        {creatorId === member.id && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 px-2 py-0.5 bg-amber-500/5 rounded-full border border-amber-500/10">
                                                Lead
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty Slots */}
                    {Array.from({ length: maxTeamSize - teamMembers.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-4 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] flex items-center gap-4 opacity-30 group">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                <User size={24} className="text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-white/5 rounded-full mb-2" />
                                <div className="h-2 w-16 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-[2rem] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/70 mb-4 px-2">Squad Link</p>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                        <Zap size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">Boost</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                        <User size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">Invite</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WorkspaceMembersSidebar;
