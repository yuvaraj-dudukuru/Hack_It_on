import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    Trophy,
    User,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Search,
    Users,
    Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { cn } from '../design-system/theme';

const NeoSidebar = () => {
    const { currentUser, role } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { icon: <Home size={20} />, label: 'Home', path: '/' },
        {
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            path: role === 'admin' ? '/admin' : role === 'judge' ? '/judge' : '/dashboard',
            auth: true
        },
        { icon: <Trophy size={20} />, label: 'Hackathons', path: '/hackathons' },
        { icon: <Crown size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen z-50 transition-all duration-500 ease-in-out",
                "bg-white/[0.02] backdrop-blur-2xl border-r border-white/5",
                isExpanded ? "w-64" : "w-20"
            )}
        >
            {/* Sidebar Content */}
            <div className="flex flex-col h-full py-8 px-4">

                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-gray-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10 hover:scale-110 transition-transform"
                >
                    {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <span className="text-gray-950 font-black text-xl leading-none">H</span>
                    </div>
                    {isExpanded && (
                        <span className="text-2xl font-black text-white tracking-tighter animate-fade-in whitespace-nowrap">
                            Hack<span className="text-cyan-400">OS</span>
                        </span>
                    )}
                </Link>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        if (item.auth && !currentUser) return null;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-cyan-500/10 text-cyan-400"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "shrink-0 transition-transform duration-300",
                                    "group-hover:scale-110"
                                )}>
                                    {item.icon}
                                </div>
                                {isExpanded && (
                                    <span className="font-bold text-sm tracking-wide animate-fade-in whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                                {/* Active Indicator Glow */}
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-cyan-400 rounded-r-full opacity-0 group-[.active]:opacity-100 transition-opacity" />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="pt-8 border-t border-white/5 space-y-2">
                    {currentUser ? (
                        <>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                                    <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${currentUser.uid}`} alt="avatar" />
                                </div>
                                {isExpanded && (
                                    <div className="flex-1 min-w-0 animate-fade-in">
                                        <p className="text-sm font-bold truncate">{currentUser.displayName || 'Developer'}</p>
                                        <p className="text-[10px] text-cyan-500 uppercase tracking-tighter font-black">{role}</p>
                                    </div>
                                )}
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 w-full px-3 py-3 rounded-2xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300 group"
                            >
                                <LogOut size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                                {isExpanded && <span className="text-sm font-bold tracking-wide">Logout</span>}
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 w-full px-3 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <User size={18} />
                            {isExpanded && <span>Login</span>}
                        </Link>
                    )}
                </div>

            </div>
        </aside>
    );
};

export default NeoSidebar;
