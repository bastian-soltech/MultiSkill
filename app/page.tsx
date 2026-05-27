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

  const [tickerValue, setTickerValue] = useState(128420);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTickerValue(v => v + Math.floor(Math.random() * 5)), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} selection:bg-emerald-500/30 overflow-x-hidden`}>

      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        {isRpgMode ? (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.1),transparent_70%)]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="absolute top-0 left-0 w-full h-[100vh] bg-[linear-gradient(to_bottom,white,transparent)] z-10" />
          </>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-[100] border-b border-transparent">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: isRpgMode ? 90 : 5 }}
            className={`w-12 h-12 ${isRpgMode ? 'bg-emerald-500 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 rounded-2xl shadow-xl shadow-indigo-100'} flex items-center justify-center text-white font-bold text-2xl transition-all`}
          >
            M
          </motion.div>
          <div className="flex flex-col -gap-1">
            <span className={`text-2xl leading-none ${theme.heading}`}>MultiSkill</span>
            <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${theme.muted}`}>Strategic Command</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {/* System Toggles */}
          <div className="flex items-center gap-3">
            <div className={`flex p-1 rounded-full ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <button onClick={() => setIsRpgMode(false)} className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${!isRpgMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>PRO</button>
              <button onClick={() => setIsRpgMode(true)} className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${isRpgMode ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'}`}>RPG</button>
            </div>
            
            <div className={`flex p-1 rounded-full ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${language === 'en' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
              <button onClick={() => setLanguage('id')} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${language === 'id' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}>ID</button>
            </div>
          </div>

          <div className={`h-8 w-px ${isRpgMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-indigo-600'} transition-colors underline decoration-2 underline-offset-8`}>Dashboard</Link>
                <button onClick={() => logout()} className={`px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${theme.button}`}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-indigo-600'} transition-colors`}>Login</Link>
                <Link href="/register" className={`px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${theme.button}`}>{t('get_started')}</Link>
              </>
            )}
          </div>
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`md:hidden p-3 transition-all ${isRpgMode ? 'text-emerald-400' : 'text-slate-900'}`}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Hero Section - Asymmetric / Industrial */}
      <main className="max-w-7xl mx-auto px-6 pt-20 md:pt-20 pb-40 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-20">
          <div className="flex-1 lg:max-w-3xl" data-aos="fade-up">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              
              <h1 className="text-6xl sm:text-8xl md:text-[10rem] leading-[0.85] tracking-tighter mb-12">
                {isRpgMode ? (
                  <span className="block font-black italic uppercase">
                    QUEST FOR <br />
                    <span className={theme.accent}>MASTERY</span>
                  </span>
                ) : (
                  <span className={`${theme.heading} block`}>
                    {t('stop_wandering')}<br />
                    <span className="text-slate-300">{t('start_mastering')}</span>
                  </span>
                )}
              </h1>

              <p className={`text-lg md:text-2xl leading-relaxed max-w-2xl ${theme.muted} mb-12 italic font-medium`}>
                {t('landing_desc')}
              </p>

              <div className="flex flex-wrap items-center gap-8">
                <Link href={user ? "/dashboard" : "/register"} className={`px-14 py-8 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 group ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-3xl'}`}>
                  {user ? "Enter Command Center" : t('start_journey')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                
                {isRpgMode && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-emerald-500/50 tracking-widest">[ INITIALIZING SEQUENCE... ]</span>
                    <div className="h-1 w-40 bg-slate-900 overflow-hidden">
                      <motion.div animate={{ x: [-160, 160] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="h-full w-20 bg-emerald-500/30" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Mastery Ticker - Visual Anchor */}
          <div className="w-full lg:w-80 flex flex-col gap-8" data-aos="fade-left" data-aos-delay="200">
            <div className={`p-8 border ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-6 ${theme.muted}`}>Global Mastery Flux</div>
              <div className={`text-5xl font-black tabular-nums tracking-tighter ${theme.text}`}>
                {mounted ? tickerValue.toLocaleString() : tickerValue}
                <span className="text-xl opacity-30 ml-2">XP</span>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Active Users</span>
                  <span className="text-xs font-bold">4.2k</span>
                </div>
                <div className="w-24 h-8 flex items-end gap-1">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <motion.div key={i} animate={{ height: [`${h}%`, `${h+10}%`, `${h}%`] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.1 }} className={`flex-1 ${isRpgMode ? 'bg-emerald-500/30' : 'bg-indigo-500/30'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-8 border ${theme.accentBg} ${theme.accentBorder} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-4 ${theme.accent}`}>System Integrity</div>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className={`h-1.5 flex-1 ${i < 5 ? (isRpgMode ? 'bg-emerald-500' : 'bg-indigo-600') : 'bg-slate-200'}`} />)}
              </div>
              <p className="text-[10px] font-bold opacity-50 uppercase leading-relaxed">Accountability protocols secured. Community wisdom verified.</p>
            </div>
          </div>
        </div>

        {/* Feature Schematic - Large Scale */}
        <section className="mt-60 relative">
          <div className={`absolute top-0 left-0 w-full h-px ${isRpgMode ? 'bg-emerald-500/20' : 'bg-slate-100'}`} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 pt-20">
            <div className="lg:col-span-4" data-aos="fade-right">
              <h2 className={`text-4xl md:text-6xl ${theme.heading} mb-8`}>
                {isRpgMode ? 'PATH ARCHITECTURE' : 'The System'}
              </h2>
              <p className={`text-lg ${theme.muted} max-w-sm mb-12`}>
                A structured command center designed to eliminate choice paralysis and enforce consistent growth.
              </p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:pl-20 border-l border-transparent lg:border-slate-800/30">
              {[
                { icon: Compass, title: t('custom_roadmaps'), text: t('custom_roadmaps_desc'), tag: 'MODULAR' },
                { icon: Zap, title: t('daily_checkins'), text: t('daily_checkins_desc'), tag: 'REAL-TIME' },
                { icon: CheckCircle2, title: t('community_adoption'), text: t('community_adoption_desc'), tag: 'SHARED' },
                { icon: Globe, title: 'Project Showroom', text: 'Display your tangible proofs of mastery to the world.', tag: 'PUBLIC' }
              ].map((f, i) => (
                <div key={i} data-aos="zoom-in-up" data-aos-delay={i * 100} className={`p-10 border transition-all hover:scale-[1.02] ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}>
                  <div className={`inline-flex items-center gap-2 text-[8px] font-black mb-6 tracking-[0.3em] ${theme.accent}`}>
                    <span className="opacity-30">0{i+1}</span> // {f.tag}
                  </div>
                  <div className={`w-14 h-14 border flex items-center justify-center mb-8 ${isRpgMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-900 text-white rounded-2xl shadow-xl'}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-2xl mb-4 font-bold ${theme.text}`}>{f.title}</h3>
                  <p className={`text-sm leading-relaxed ${theme.muted}`}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Narrative Section - Full Bleed Vibe */}
        <section className="mt-60 text-center" data-aos="fade-up">
           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <div className={`text-[12px] font-black uppercase tracking-[0.5em] mb-12 ${theme.accent}`}>
                Designed for the multifaceted
              </div>
              <blockquote className={`text-4xl md:text-7xl ${theme.heading} leading-none mb-16 tracking-tighter`}>
                 “The future belongs to those who learn more skills and combine them in creative ways.”
              </blockquote>
              <div className="flex flex-col items-center gap-4">
                 <div className={`w-px h-24 ${isRpgMode ? 'bg-emerald-500/30' : 'bg-slate-200'}`} />
                 <Link href="/register" className={`px-12 py-5 border ${isRpgMode ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-none' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-full'} text-[10px] font-black uppercase tracking-widest transition-all`}>
                    Begin Architecture
                 </Link>
              </div>
           </motion.div>
        </section>
      </main>

      <footer className={`mt-60 py-16 md:py-32 px-6 border-t ${isRpgMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-8 h-8 ${isRpgMode ? 'bg-emerald-500 rounded-none' : 'bg-slate-900 rounded-lg'} flex items-center justify-center text-white font-bold text-sm`}>M</div>
              <div className={`text-2xl ${theme.heading}`}>MultiSkill</div>
            </div>
            <p className={`text-sm max-w-xs mb-10 ${theme.muted}`}>
               Architecting mastery through strategic skill management and community intelligence.
            </p>
            <div className={`text-[10px] uppercase font-black tracking-[0.3em] ${theme.muted}`}>
              {t('made_for_mastery')}
            </div>
          </div>
          
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Network</span>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <a href="https://www.tiktok.com/@tyan.dev" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-black uppercase tracking-widest ${theme.muted} hover:${theme.accent} transition-colors`}>TikTok / tyan.dev</a>
                <a href="https://github.com/bastian-soltech" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-black uppercase tracking-widest ${theme.muted} hover:${theme.accent} transition-colors`}>Github / bastian-soltech</a>
              </div>
            </div>
            
            <div className={`text-[10px] uppercase font-black tracking-widest mt-auto ${theme.muted} opacity-30`}>
              © 2026 MultiSkill. Built with Precision.
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className={`fixed inset-0 z-[150] md:hidden ${isRpgMode ? 'bg-slate-950' : 'bg-white'} pt-32 px-6 flex flex-col gap-8`}
          >
            {/* Same as desktop but vertically stacked */}
            <div className="flex flex-col gap-4 mb-12">
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme.muted}`}>System Mode</span>
              <div className="flex gap-4">
                <button onClick={() => { setIsRpgMode(false); setIsMenuOpen(false); }} className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${!isRpgMode ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-800 text-slate-500'}`}>
                  <Briefcase className="w-6 h-6" />
                  <span className="text-[10px] font-black">PROFESSIONAL</span>
                </button>
                <button onClick={() => { setIsRpgMode(true); setIsMenuOpen(false); }} className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${isRpgMode ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-200 text-slate-400'}`}>
                  <Sword className="w-6 h-6" />
                  <span className="text-[10px] font-black">RPG MODE</span>
                </button>
              </div>
            </div>

            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`text-4xl ${theme.heading}`}>Dashboard</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className={`text-left text-4xl ${theme.heading} ${theme.accent}`}>Logout</button>
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
    </div>
  );
}

