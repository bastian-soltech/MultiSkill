'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, Zap, CheckCircle2, Menu, X, Sword, Briefcase, Globe } from 'lucide-react';

import { useLanguage } from '@/lib/LanguageContext';
import { useMode } from '@/lib/ModeContext';
import { useAuth } from '@/lib/AuthContext';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isRpgMode, setIsRpgMode } = useMode();
  const { user, logout } = useAuth();

  // Theme tokens based on mode
  const theme = {
    bg: isRpgMode ? 'bg-slate-950' : 'bg-white',
    text: isRpgMode ? 'text-slate-100' : 'text-slate-900',
    muted: isRpgMode ? 'text-slate-400' : 'text-slate-500',
    accent: isRpgMode ? 'text-emerald-400' : 'text-indigo-600',
    accentBg: isRpgMode ? 'bg-emerald-500/10' : 'bg-indigo-50',
    accentBorder: isRpgMode ? 'border-emerald-500/20' : 'border-indigo-100',
    card: isRpgMode ? 'bg-slate-900/50 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-sm',
    button: isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100',
    font: isRpgMode ? 'font-mono' : 'font-sans',
    heading: isRpgMode ? 'font-black uppercase tracking-tighter italic' : 'font-serif italic tracking-tight'
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} selection:bg-emerald-500/30`}>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        {isRpgMode ? (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
        )}
      </div>
      
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-[100]">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: isRpgMode ? 90 : 0 }}
            className={`w-10 h-10 ${isRpgMode ? 'bg-emerald-500 rounded-none border-2 border-slate-900' : 'bg-indigo-600 rounded-xl'} flex items-center justify-center text-white font-bold text-xl`}
          >
            M
          </motion.div>
          <span className={`text-2xl ${theme.heading}`}>MultiSkill</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* Mode Toggle */}
          <div className={`flex p-1 rounded-lg ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50'}`}>
            <button 
              onClick={() => setIsRpgMode(false)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black rounded transition-all ${!isRpgMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Briefcase className="w-3 h-3" />
              PRO
            </button>
            <button 
              onClick={() => setIsRpgMode(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black rounded transition-all ${isRpgMode ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Sword className="w-3 h-3" />
              RPG
            </button>
          </div>

          <div className={`h-6 w-px ${isRpgMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* Language Toggle */}
          <div className={`flex p-1 rounded-lg ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50'}`}>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-[10px] font-black rounded transition-all ${language === 'en' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('id')}
              className={`px-3 py-1 text-[10px] font-black rounded transition-all ${language === 'id' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}
            >
              ID
            </button>
          </div>
          
          {user ? (
            <>
              <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-indigo-600'} transition-colors`}>Dashboard</Link>
              <button 
                onClick={() => logout()}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme.button}`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-indigo-600'} transition-colors`}>Login</Link>
              <Link href="/register" className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme.button}`}>
                {t('get_started')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden p-2 rounded-xl transition-all ${isRpgMode ? 'text-emerald-400 hover:bg-slate-900' : 'text-slate-900 hover:bg-slate-50'}`}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className={`fixed inset-0 z-[150] md:hidden ${isRpgMode ? 'bg-slate-950' : 'bg-white'} pt-32 px-6 flex flex-col gap-8`}
          >
            <div className="flex flex-col gap-4 mb-12">
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme.muted}`}>System Mode</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsRpgMode(false); setIsMenuOpen(false); }}
                  className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${!isRpgMode ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-800 text-slate-500'}`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-[10px] font-black">PROFESSIONAL</span>
                </button>
                <button 
                  onClick={() => { setIsRpgMode(true); setIsMenuOpen(false); }}
                  className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${isRpgMode ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-200 text-slate-400'}`}
                >
                  <Sword className="w-6 h-6" />
                  <span className="text-[10px] font-black">RPG MODE</span>
                </button>
              </div>
            </div>

            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`text-4xl ${theme.heading}`}>Dashboard</Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className={`text-left text-4xl ${theme.heading} ${theme.accent}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className={`text-4xl ${theme.heading}`}>Login</Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className={`text-4xl ${theme.heading} ${theme.accent}`}>Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>  

      <main className="max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-40 relative">
        <motion.div
          key={isRpgMode ? 'rpg' : 'pro'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          
          <h1 className={`text-5xl sm:text-7xl md:text-9xl mb-10 leading-[0.9] tracking-tighter`}>
            {isRpgMode ? (
              <span className="block">
                QUEST FOR <br />
                <span className={theme.accent}>MASTERY</span>
              </span>
            ) : (
              <span className={theme.heading}>
                {t('stop_wandering')}<br />{t('start_mastering')}
              </span>
            )}
          </h1>

          <p className={`max-w-3xl mx-auto text-lg md:text-xl ${theme.muted} mb-12 leading-relaxed px-4 font-medium`}>
            {t('landing_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
            <Link href={user ? "/dashboard" : "/register"} className={`w-full sm:w-auto px-12 py-6 rounded-none text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group ${theme.button}`}>
              {user ? "Back to Dashboard" : t('start_journey')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {isRpgMode && (
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 animate-pulse">
                [ PRESS START TO BEGIN ]
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-32 md:mt-48 px-4">
          {[
            { icon: Compass, title: t('custom_roadmaps'), text: t('custom_roadmaps_desc'), label: 'PATHFINDER' },
            { icon: Zap, title: t('daily_checkins'), text: t('daily_checkins_desc'), label: 'CONSISTENCY' },
            { icon: CheckCircle2, title: t('community_adoption'), text: t('community_adoption_desc'), label: 'NETWORK' }
          ].map((feature, i) => (
            <motion.div
              key={`${isRpgMode}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-8 md:p-12 border transition-all relative overflow-hidden group ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[2rem]'}`}
            >
              {isRpgMode && (
                <div className="absolute top-0 right-0 p-3 text-[8px] font-black text-emerald-500/20 tracking-widest">
                  LVL. 0{i+1}
                </div>
              )}
              
              <div className={`mb-8 p-3 inline-block ${isRpgMode ? 'bg-slate-900 border-2 border-emerald-500/30' : 'bg-slate-50'}`}>
                <feature.icon className={`w-8 h-8 ${theme.accent}`} />
              </div>

              {isRpgMode && (
                <div className={`text-[10px] font-black mb-2 tracking-[0.2em] ${theme.accent}`}>
                  {feature.label}
                </div>
              )}

              <h3 className={`text-2xl mb-4 ${theme.heading}`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed ${theme.muted}`}>{feature.text}</p>
              
              {!isRpgMode && (
                <div className="mt-8 pt-8 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      <footer className={`py-16 md:py-24 px-6 border-t ${isRpgMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className={`text-3xl ${theme.heading}`}>MultiSkill</div>
            <div className={`text-[10px] uppercase font-black tracking-[0.3em] ${theme.muted}`}>
              {t('made_for_mastery')}
            </div>
          </div>
          
          <div className="flex gap-8">
            <Link href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme.muted} hover:${theme.accent}`}>Twitter</Link>
            <Link href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme.muted} hover:${theme.accent}`}>Github</Link>
            <Link href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme.muted} hover:${theme.accent}`}>Discord</Link>
          </div>

          <div className={`text-[10px] uppercase font-black tracking-widest ${theme.muted}`}>
            © 2026 MultiSkill. Built with Precision.
          </div>
        </div>
      </footer>
    </div>
  );
}

