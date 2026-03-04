import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedMascots from './AnimatedMascots';

// Simple Digital Rain Component
const DigitalRain = () => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    // Create 20 random drops
    const newDrops = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {drops.map(drop => (
        <div
          key={drop.id}
          className="absolute top-[-10%] text-cyan-500/40 font-mono text-xs writing-vertical-rl"
          style={{
            left: `${drop.left}%`,
            animation: `rain ${drop.duration}s linear infinite`,
            animationDelay: `${drop.delay}s`,
            textOrientation: 'upright'
          }}
        >
          {/* Random sci-fi string */}
          {'0101 HACK OS NEO 1010 SYSTEM'}
        </div>
      ))}
      <style>{`
                @keyframes rain {
                    0% { transform: translateY(-100%); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                .writing-vertical-rl { writing-mode: vertical-rl; }
            `}</style>
    </div>
  );
};

function AuthLayout({ children, title, subtitle, isTypingPassword = false, showPassword = false, loginState = 'idle' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    if (window.innerWidth >= 1024) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-[#030712] overflow-hidden">

      {/* LEFT COLUMN: Mascot Stage */}
      <div ref={containerRef} className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-cyan-500/10 group">

        {/* Layer 1: 3D Grid */}
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(20deg) scale(1.5)',
              transformOrigin: 'top center',
              animation: 'grid-move 20s linear infinite'
            }}
          />
          {/* Radial Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-cyan-900/10 via-transparent to-transparent" />
        </div>

        {/* Layer 2: Digital Rain */}
        <DigitalRain />

        {/* Layer 3: Mascots */}
        <AnimatedMascots
          mousePos={mousePos}
          isTypingPassword={isTypingPassword}
          showPassword={showPassword}
          loginState={loginState}
        />
      </div>

      {/* RIGHT COLUMN: Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-16 bg-[#030712] relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-3 group mb-8">
              <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center transform transition group-hover:rotate-12 shadow-lg shadow-cyan-500/20 border border-white/10">
                <span className="text-white font-black text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">HackOS <span className="text-cyan-400">Neo</span></span>
            </Link>
            <h2 className="text-3xl font-bold text-white mt-2">{title}</h2>
            <p className="mt-2 text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes grid-move {
            0% { transform: perspective(500px) rotateX(20deg) scale(1.5) translateY(0); }
            100% { transform: perspective(500px) rotateX(20deg) scale(1.5) translateY(40px); }
        }
      `}</style>
    </div>
  );
}

export default AuthLayout;
