import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,      // <-- THIS IS THE FIX (lowercase 'h')
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Email/Password Register ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User registered:', user);

      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        displayName: '',
        email: user.email,
        photoURL: ''
      }, { merge: true });

      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is invalid.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  // --- Social Media Login (Handles Registering too) ---
  const handleSocialLogin = async (provider) => {
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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

      if (role === 'admin') navigate('/admin');
      else if (role === 'judge') navigate('/judge');
      else navigate('/dashboard');

    } catch (err) {
      console.error('Social login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different login method.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
  };

  const handleGoogleLogin = () => {
    handleSocialLogin(new GoogleAuthProvider());
  };

  const handleGitHubLogin = () => {
    handleSocialLogin(new GithubAuthProvider()); // <-- THIS IS THE FIX
  };

  return (
    <div className="p-8 flex justify-center items-start pt-16">
      <div className="w-full max-w-sm">
        {/* --- Email/Password Form --- */}
        <form
          onSubmit={handleRegister}
          className="bg-gray-800 p-8 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Register</h1>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
              required
              minLength="6"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs italic mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition duration-300"
          >
            Create Account
          </button>
        </form>

        {/* --- "OR" Divider --- */}
        <div className="my-6 flex items-center justify-center">
          <span className="h-px w-full bg-gray-600"></span>
          <span className="mx-4 text-gray-400">OR</span>
          <span className="h-px w-full bg-gray-600"></span>
        </div>

        {/* --- Social Login Buttons --- */}
        <div className="space-y-4">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none transition duration-300 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.1 6.25C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 2.84-2.2 5.33-4.59 6.91l7.34 5.68C43.5 37.6 46.98 31.69 46.98 24.55z"></path>
              <path fill="#FBBC05" d="M10.66 28.71c-.57-1.72-.88-3.55-.88-5.46s.31-3.74.88-5.46l-8.1-6.25C.96 15.06 0 19.35 0 24s.96 8.94 2.56 12.47l8.1-6.25z"></path>
              <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.34-5.68c-2.18 1.45-4.96 2.3-8.55 2.3-6.26 0-11.57-4.22-13.44-9.91l-8.1 6.25C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign up with Google
          </button>

          {/* GitHub Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition duration-300 shadow-md border border-gray-600"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"></path>
            </svg>
            Sign up with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;