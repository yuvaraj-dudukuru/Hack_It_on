import { Rocket, Trophy, Calendar, Users as UsersIcon, CheckCircle2, Github, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

function HomePage() {
  const { currentUser, role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'judge') return '/judge';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <Rocket size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-cyan-100 uppercase tracking-widest">Fraylon Technologies Presents</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Hack<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">OS</span> 2026
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Join the ultimate hackathon where innovation meets reality. Build, scale, and win prizes from a pool of <span className="text-white font-bold inline-flex items-center gap-1"><Trophy size={20} className="text-yellow-400" /> ₹25,000</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {currentUser ? (
              <Link
                to={getDashboardLink()}
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-lg transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 flex items-center gap-3"
              >
                Go to {role === 'admin' ? 'Admin' : role === 'judge' ? 'Judge' : 'Team'} Dashboard
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-10 py-5 rounded-2xl bg-white text-gray-950 font-black text-lg transition-all duration-300 hover:bg-cyan-400 hover:scale-105 shadow-xl flex items-center gap-3"
                >
                  Register Now
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- PRIZE POOL SECTION --- */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-16">The Championship Pool</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/5 p-10 rounded-[32px] hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                <Trophy size={32} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Winner</h3>
              <p className="text-4xl font-black text-white mb-4">₹12,000</p>
              <p className="text-gray-400 text-sm">Certificate of Excellence + Potential Internship</p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/5 p-10 rounded-[32px] hover:border-white/20 transition-all group scale-105 shadow-2xl shadow-cyan-500/10 border-cyan-500/20">
              <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                <Trophy size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Runner Up</h3>
              <p className="text-4xl font-black text-white mb-4">₹8,000</p>
              <p className="text-gray-400 text-sm">Certificate of Achievement</p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/5 p-10 rounded-[32px] hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                <Trophy size={32} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Third Place</h3>
              <p className="text-4xl font-black text-white mb-4">₹5,000</p>
              <p className="text-gray-400 text-sm">Certificate of Participation</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TIMELINE SECTION --- */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 text-center">Hackathon Timeline</h2>
          <div className="space-y-12">
            {[
              { title: "Registration Opens", date: "March 5th", desc: "Teams register via Google Form and verify payment." },
              { title: "Round 1: Idea Pitch", date: "March 15th", desc: "Submit your solution PPT for initial screening." },
              { title: "Round 2: Build & Deploy", date: "March 22nd", desc: "Submit your GitHub project and live demo link." },
              { title: "Grand Finale", date: "March 30th", desc: "Live demo and winner declaration." }
            ].map((step, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center font-bold text-cyan-400 group-hover:border-cyan-400 transition-colors">
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-px h-full bg-white/10 my-2" />}
                </div>
                <div className="pb-12">
                  <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-cyan-400 text-sm font-bold mb-3">{step.date}</p>
                  <p className="text-gray-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      {!currentUser && (
        <section className="py-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent shadow-inner" />
          <div className="max-w-3xl mx-auto px-6 text-center relative">
            <h2 className="text-4xl font-black mb-8">Ready to define the future?</h2>
            <Link
              to="/register"
              className="inline-flex px-12 py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              Sign Up For Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;