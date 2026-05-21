'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useMode } from '@/lib/ModeContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { isRpgMode } = useMode();

  // Theme tokens
  const theme = {
    bg: isRpgMode ? 'bg-slate-950' : 'bg-[#F8FAFC]',
    card: isRpgMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-indigo-100',
    text: isRpgMode ? 'text-slate-100' : 'text-slate-900',
    muted: isRpgMode ? 'text-slate-400' : 'text-slate-500',
    input: isRpgMode ? 'bg-slate-950 border-slate-800 text-white focus:ring-emerald-500' : 'bg-slate-50 border-slate-100 focus:ring-indigo-500',
    button: isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-indigo-600',
    font: isRpgMode ? 'font-mono' : 'font-sans',
    heading: isRpgMode ? 'font-black uppercase tracking-tighter italic' : 'font-serif italic tracking-tight'
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 ${theme.bg} ${theme.font}`}>
      {/* Structural Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {isRpgMode ? (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-md w-full rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 border relative z-10 ${theme.card}`}
      >
        <h2 className={`text-3xl sm:text-4xl mb-2 ${theme.heading} ${theme.text}`}>{isRpgMode ? 'START NEW QUEST' : 'Join MultiSkill'}</h2>
        <p className={`${theme.muted} mb-10`}>{isRpgMode ? 'Begin your curated legendary journey.' : 'Start your curated learning journey today.'}</p>

        {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-xs mb-6 border border-red-500/20">{error}</div>}

        <form onSubmit={handleEmailRegister} className="space-y-4 mb-8">
          <div>
            <label className={`text-[10px] uppercase font-black mb-2 block tracking-widest ${theme.muted}`}>Email Address</label>
            <input 
              type="email" 
              className={`w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.input}`} 
              placeholder="e.g. learner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={`text-[10px] uppercase font-black mb-2 block tracking-widest ${theme.muted}`}>Password</label>
            <input 
              type="password" 
              className={`w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.input}`} 
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${theme.button}`}>
            {isRpgMode ? 'CREATE CHARACTER' : 'Create Account'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isRpgMode ? 'border-slate-800' : 'border-slate-100'}`}></div></div>
          <div className={`relative flex justify-center text-[10px] uppercase font-black tracking-widest ${theme.muted}`}><span className={`${isRpgMode ? 'bg-slate-900' : 'bg-white'} px-4`}>Or sign up with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className={`w-full border py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
            isRpgMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
          Google
        </button>

        <p className={`mt-10 text-center text-[10px] uppercase font-black tracking-widest ${theme.muted}`}>
          Already have an account? <Link href="/login" className={`hover:underline ${isRpgMode ? 'text-emerald-400' : 'text-indigo-600'}`}>Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}
