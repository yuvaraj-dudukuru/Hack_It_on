import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../config/firebaseConfig.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AuthLayout from '../../components/AuthLayout.jsx';
import { teamService } from '../../services/teamService';
import { Eye, EyeOff } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animation States
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [loginState, setLoginState] = useState('idle'); // 'idle', 'success', 'error'

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role via teamService
      const userProfile = await teamService.getUserProfile(userCredential.user.uid);
      const role = userProfile ? userProfile.role : 'participant';

      setLoginState('success');
      setTimeout(() => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'judge') navigate('/judge');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
      setLoginState('error');
      setTimeout(() => setLoginState('idle'), 2000);
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists, if not create as participant
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      let role = 'participant';
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email,
          photoURL: user.photoURL || '',
          role: 'participant',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } else {
        role = userDoc.data().role;
      }

      setLoginState('success');
      setTimeout(() => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'judge') navigate('/judge');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Social login error:', err);
      setError('Failed to login.');
      setLoginState('error');
      setTimeout(() => setLoginState('idle'), 2000);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      isTypingPassword={isTypingPassword}
      showPassword={showPassword}
      loginState={loginState}
    >
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => handleSocialLogin(new GoogleAuthProvider())} className="flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.065 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" /><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" /><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" /><path fill="#FBBC05" d="M5.277 14.268A7.127 7.127 0 0 1 4.909 12c0-.782.125-1.573.368-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" /></svg>
          Google
        </button>
        <button type="button" onClick={() => handleSocialLogin(new GithubAuthProvider())} className="flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm border border-gray-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
          GitHub
        </button>
      </div>

      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-800"></div>
        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider font-medium">Or continue with</span>
        <div className="flex-grow border-t border-gray-800"></div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 tracking-wide" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // TRIGGERS CURSOR TRACKING (Not peeking)
            onFocus={() => setIsTypingPassword(false)}
            className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 tracking-wide" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // TRIGGERS THE PEEK ANIMATION
              onFocus={() => setIsTypingPassword(true)}
              onBlur={() => setIsTypingPassword(false)}
              className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || loginState === 'success'}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || loginState === 'success' ? (
            <span className="flex items-center justify-center gap-2">
              {loginState === 'success' ? 'Success! Redirecting...' : 'Signing in...'}
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-gray-400">
        Don't have an account? <Link to="/register" className="font-bold text-white hover:text-green-400 transition-colors">Sign up for free</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;