'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, Zap, CheckCircle2, Menu, X } from 'lucide-react';

import { useLanguage } from '@/lib/LanguageContext';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
      
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-[100]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
          <span className="font-serif italic text-2xl tracking-tight">MultiSkill</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex bg-slate-50 p-1 rounded-lg">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-[10px] font-black rounded transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('id')}
              className={`px-3 py-1 text-[10px] font-black rounded transition-all ${language === 'id' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ID
            </button>
          </div>
          <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Login</Link>
          <Link href="/register" className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">{t('get_started')}</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-white pt-32 px-6 flex flex-col gap-6">
          <Link 
            href="/login" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-serif italic text-slate-800"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-serif italic text-indigo-600"
          >
            Get Started
          </Link>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-40 text-center relative pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-12">
            <Sparkles className="w-3 h-3" />
            {t('ai_powered')}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif italic mb-10 leading-[1.1] tracking-tight">
            {t('stop_wandering')}<br />{t('start_mastering')}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 leading-relaxed px-4">
            {t('landing_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/register" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-sm font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group">
              {t('start_journey')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 md:mt-40 px-4">
          {[
            { icon: Compass, title: t('custom_roadmaps'), text: t('custom_roadmaps_desc') },
            { icon: Zap, title: t('daily_checkins'), text: t('daily_checkins_desc') },
            { icon: CheckCircle2, title: t('community_adoption'), text: t('community_adoption_desc') }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="p-8 md:p-12 bg-white rounded-[3rem] border border-slate-100 text-left shadow-sm hover:shadow-xl transition-all"
            >
              <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 mb-6 md:mb-8" />
              <h3 className="text-xl md:text-2xl font-serif italic mb-4">{feature.title}</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="font-serif italic text-2xl text-white">MultiSkill</div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-center md:text-left">
            © 2026 MultiSkill. Made for Mastery.
          </div>
        </div>
      </footer>
    </div>
  );
}
