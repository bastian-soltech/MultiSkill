'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-indigo-100 border border-slate-100"
      >
        <h2 className="text-3xl sm:text-4xl font-serif italic mb-2">Welcome Back</h2>
        <p className="text-slate-500 mb-10">Continue your journey to mastery.</p>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs mb-6">{error}</div>}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block tracking-widest">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="e.g. learner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block tracking-widest">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
            Sign In
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
          Google
        </button>

        <p className="mt-10 text-center text-[10px] uppercase font-bold text-slate-400 tracking-widest">
          No account? <Link href="/register" className="text-indigo-600 hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
