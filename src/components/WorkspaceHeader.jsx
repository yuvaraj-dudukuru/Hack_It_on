import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Rocket,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    Milestone,
    Monitor
} from 'lucide-react';
import HackathonTimer from './HackathonTimer.jsx';
import { cn, typography } from '../design-system/theme';

function WorkspaceHeader({
    displayTitle,
    isHackathonActive,
    hackathonEndsAt,
    isReadOnly,
    isSubmitted,
    projectLink,
    hackathonStartedAt,
    isCreator,
    setIsStartModalOpen,
    handleSubmitProject,
    hackathonId
}) {
    return (
        <div className="mb-8 shrink-0 animate-fade-in">
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">

                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">

                    {/* Left Section: Context & Title */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <Monitor size={14} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70">
                                    Active Workspace
                                </p>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight truncate">
                                {displayTitle}
                            </h1>
                        </div>

                        {/* Status Engine */}
                        <div className="flex items-center gap-4 shrink-0">
                            {isHackathonActive && hackathonEndsAt && (
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                    <HackathonTimer endsAt={hackathonEndsAt} />
                                </div>
                            )}

                            {isReadOnly && (
                                <div className={cn(
                                    "inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase border",
                                    isSubmitted
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                                )}>
                                    {isSubmitted ? (
                                        <>
                                            <CheckCircle2 size={18} className="animate-pulse" />
                                            <span>Deployment Sync Complete</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={18} />
                                            <span>Session Expired</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section: Command Actions */}
                    <div className="flex items-center gap-3 shrink-0">

                        {!hackathonStartedAt && isCreator && (
                            <button
                                onClick={() => setIsStartModalOpen(true)}
                                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-600 text-white font-black text-sm tracking-tight transition-all duration-300 shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95"
                            >
                                <Rocket size={20} className="animate-float" />
                                <span>Initiate Sequence</span>
                            </button>
                        )}

                        {isSubmitted ? (
                            <a
                                href={projectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all duration-300 border border-white/10 hover:border-cyan-500/30"
                            >
                                <span>Open Manifest</span>
                                <ExternalLink size={18} />
                            </a>
                        ) : (hackathonStartedAt && isCreator && !isReadOnly) ? (
                            <button
                                onClick={handleSubmitProject}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 text-gray-950 font-black text-sm tracking-tight transition-all duration-300 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                            >
                                <Milestone size={20} />
                                <span>Final Submission</span>
                            </button>
                        ) : null}

                        <Link
                            to={`/hackathon/${hackathonId}`}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all group"
                            title="Return to Base"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkspaceHeader;
