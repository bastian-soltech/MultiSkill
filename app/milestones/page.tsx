'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Target,
  ArrowRight,
  ChevronRight,
  Sword,
  Shield,
  Trophy
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 animate-pulse">
          <div className="h-12 w-48 bg-slate-200 rounded-xl mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`transition-colors duration-300 p-4 sm:p-8 md:p-12`}>
        <header className="mb-16">
          <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest mb-6 ${
            isRpgMode ? 'bg-amber-900/30 text-amber-500 border border-amber-800/50' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {isRpgMode ? <Trophy className="w-3 h-3" /> : <Target className="w-3 h-3" />}
            {t('milestones')}
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif italic mb-6 leading-none tracking-tight">
            {isRpgMode ? t('your_milestones') : t('active_milestones')}
          </h1>
          <p className={`text-sm sm:text-lg italic max-w-2xl ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRpgMode ? t('milestones_desc_rpg') : t('milestones_desc_pro')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 max-w-5xl">
          {allMilestones.length > 0 ? (
            allMilestones.map((milestone) => (
              <Link 
                key={`${milestone.skillId}-${milestone.id}`}
                href={`/skills/${milestone.skillId}`}
                className={`group p-8 rounded-[2.5rem] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-8 ${
                  isRpgMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-cyan-500 shadow-2xl shadow-black/20' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100'
                }`}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                    milestone.completed 
                      ? (isRpgMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-600') 
                      : (isRpgMode ? 'bg-slate-950 text-slate-600 border border-slate-800' : 'bg-indigo-50 text-indigo-600')
                  }`}>
                    {milestone.completed ? <CheckCircle2 className="w-7 h-7" /> : <Sword className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      milestone.completed 
                        ? (isRpgMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through text-slate-300') 
                        : (isRpgMode ? 'text-white' : 'text-slate-800')
                    }`}>
                      {milestone.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                       <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded leading-none ${
                         isRpgMode ? 'bg-slate-950 text-cyan-400 border border-cyan-900/50' : 'bg-slate-100 text-slate-400'
                       }`}>
                         {milestone.skillTitle}
                       </span>
                       <span className="text-[10px] font-bold text-slate-600">•</span>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                         {milestone.subpaths.length} {t('steps')}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 transition-colors ${isRpgMode ? 'text-slate-700 group-hover:text-cyan-400' : 'text-slate-300 group-hover:text-indigo-600'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{t('view_path')}</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))
          ) : (
            <div className={`text-center py-24 rounded-[4rem] border-2 border-dashed ${
              isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <p className="font-serif italic text-3xl">No milestones found.</p>
              <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-50">Start a skill to see your roadmap.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
