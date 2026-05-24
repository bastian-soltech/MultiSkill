'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Target,
  ArrowRight,
  ChevronRight,
  Sword,
  Shield,
  Trophy,
  Scroll
} from 'lucide-react';
import Link from 'next/link';
import { useMode } from '@/lib/ModeContext';

interface SubPath {
  id: string;
  task: string;
  completed: boolean;
}

interface PathSegment {
  id: string;
  title: string;
  completed: boolean;
  subpaths: SubPath[];
}

interface Skill {
  id: string;
  title: string;
  progress: number;
  roadmap: PathSegment[];
}

export default function MilestonesPage() {
  const { user } = useAuth();
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme tokens matching landing page
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

  useEffect(() => {
    async function fetchSkills() {
      if (!user) return;
      try {
        const q = query(collection(db, 'skills'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
        setSkills(fetched);
      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, [user]);

  const allMilestones = skills.flatMap(skill => 
    skill.roadmap.map(segment => ({
      ...segment,
      skillTitle: skill.title,
      skillId: skill.id
    }))
  ).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  return (
    <DashboardLayout>
      <div className={`min-h-screen relative transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} selection:bg-emerald-500/30 p-4 sm:p-8 md:p-12 overflow-hidden`}>
        
        {/* Background Grids & Patterns matching landing page */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
          {isRpgMode ? (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
          )}
        </div>

        {loading ? (
          /* SKELETON UI */
          <div className="relative z-10 animate-pulse">
            <header className="mb-16 space-y-6">
              <div className={`h-6 w-32 ${isRpgMode ? 'bg-slate-900' : 'bg-indigo-50'} rounded-full`} />
              <div className={`h-16 w-80 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-200'} rounded-2xl`} />
              <div className={`h-4 w-96 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-lg`} />
            </header>

            <div className="space-y-6 max-w-5xl">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-32 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[2.5rem] shadow-sm'}`} />
              ))}
            </div>
          </div>
        ) : (
          /* ACTUAL CONTENT */
          <div className="relative z-10">
            <header className="mb-16">
              <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 border tracking-widest mb-6 ${
                isRpgMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-none' : 'bg-indigo-50 text-indigo-600 border-indigo-100 rounded-full'
              }`}>
                {isRpgMode ? <Trophy className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                {t('milestones')}
              </div>
              <h1 className={`text-5xl sm:text-6xl mb-6 leading-none tracking-tighter ${theme.heading}`}>
                {isRpgMode ? 'CHRONICLE OF CONQUEST' : t('active_milestones')}
              </h1>
              <p className={`text-sm sm:text-lg italic max-w-2xl ${theme.muted}`}>
                {isRpgMode ? t('milestones_desc_rpg') : t('milestones_desc_pro')}
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 max-w-5xl">
              {allMilestones.length > 0 ? (
                allMilestones.map((milestone) => (
                  <Link 
                    key={`${milestone.skillId}-${milestone.id}`}
                    href={`/skills/${milestone.skillId}`}
                    className={`group p-8 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-8 ${theme.card} ${isRpgMode ? 'rounded-none hover:border-emerald-500' : 'rounded-[2.5rem] hover:shadow-xl hover:border-indigo-100'}`}
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-14 h-14 border transition-all flex-shrink-0 flex items-center justify-center ${
                        milestone.completed 
                          ? (isRpgMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 rounded-none' : 'bg-emerald-50 text-emerald-600 border-emerald-100 rounded-2xl') 
                          : (isRpgMode ? 'bg-slate-950 text-slate-600 border-slate-800 rounded-none' : 'bg-indigo-50 text-indigo-600 border-indigo-100 rounded-2xl')
                      }`}>
                        {milestone.completed ? <CheckCircle2 className="w-7 h-7" /> : <Sword className="w-7 h-7" />}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 ${
                          milestone.completed 
                            ? (isRpgMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through') 
                            : (isRpgMode ? 'text-white font-mono uppercase' : 'text-slate-800 font-serif italic')
                        }`}>
                          {milestone.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-black uppercase tracking-widest ${
                            isRpgMode ? 'bg-slate-950 border-slate-800 text-slate-500 rounded-none' : 'bg-slate-50 border-slate-100 text-slate-500 rounded-full'
                          }`}>
                            <span className="opacity-50">Origin:</span>
                            <span className={theme.accent}>{milestone.skillTitle}</span>
                          </div>
                          {milestone.completed && (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${isRpgMode ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>[ COMPLETED ]</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isRpgMode ? 'text-emerald-400 group-hover:translate-x-2' : 'text-indigo-600 group-hover:translate-x-2'
                    }`}>
                      {isRpgMode ? 'VIEW LOGS' : 'View Path'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className={`text-center py-40 border-2 border-dashed ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-700 rounded-none' : 'bg-white border-slate-200 text-slate-400 rounded-[4rem]'
                }`}>
                  {isRpgMode ? <Scroll className="w-16 h-16 mx-auto mb-8 opacity-20" /> : <Target className="w-16 h-16 mx-auto mb-8 opacity-20" />}
                  <p className="font-serif italic text-3xl">No milestones yet.</p>
                  <p className={`mt-4 text-xs font-black uppercase tracking-widest ${theme.muted}`}>
                    Initialize a skill path to start tracking conquest.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
