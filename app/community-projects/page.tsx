'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc, where } from 'firebase/firestore';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Globe, 
  ExternalLink, 
  Zap,
  ArrowRight,
  User,
  LayoutGrid,
  Shield,
  Award,
  Crown,
  Box,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode } from '@/lib/ModeContext';
import { useLanguage } from '@/lib/LanguageContext';

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  createdAt: number;
}

interface CommunityProject extends Project {
  skillTitle: string;
  skillId: string;
  userName?: string;
  userId: string;
}

export default function CommunityProjectsPage() {
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
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
    async function fetchCommunityProjects() {
      try {
        // Only fetch public skills
        const q = query(collection(db, 'skills'), where('isPublic', '==', true), limit(50));
        const querySnapshot = await getDocs(q);
        
        const allProjects: CommunityProject[] = [];
        const userIds = new Set<string>();

        // Phase 1: Collect unique user IDs
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId) userIds.add(data.userId);
        });

        // Phase 2: Fetch user display names
        const userMap: Record<string, string> = {};
        await Promise.all(Array.from(userIds).map(async (uid) => {
          try {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              userMap[uid] = userSnap.data().displayName || t('curious_learner');
            }
          } catch (e) {
            console.warn(`[CommunityProjects] Could not fetch profile for UID: ${uid}`, e);
          }
        }));

        // Phase 3: Build projects list with resolved names
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.projects && Array.isArray(data.projects)) {
            data.projects.forEach((p: Project) => {
              allProjects.push({
                ...p,
                skillTitle: data.title,
                skillId: doc.id,
                userName: userMap[data.userId] || data.userName || t('curious_learner'),
                userId: data.userId
              });
            });
          }
        });
        
        setProjects(allProjects.sort((a, b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error('Error fetching community projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityProjects();
  }, []);

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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-96 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
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
                {isRpgMode ? <Crown className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {isRpgMode ? t('community_showcase') : t('community_hub')}
              </div>
              <h1 className={`text-5xl sm:text-6xl mb-6 leading-none tracking-tighter ${theme.heading}`}>
                {isRpgMode ? t('hall_of_artifacts') : t('project_showroom')}
              </h1>
              <p className={`text-sm sm:text-lg italic max-w-2xl ${theme.muted}`}>
                {isRpgMode ? t('showroom_desc_rpg') : t('showroom_desc_pro')}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${project.skillId}-${project.id}`}
                    className={`group border transition-all flex flex-col overflow-hidden ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[2.5rem]'}`}
                  >
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className={`w-12 h-12 border transition-all flex items-center justify-center ${
                            isRpgMode ? 'bg-slate-950 border-slate-800 text-emerald-400 rounded-none' : 'bg-slate-900 text-white rounded-xl'
                          }`}>
                            {isRpgMode ? <Award className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                          </div>
                          <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-2 ${theme.muted}`}>
                              <User className="w-3 h-3" />
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{project.userName}</span>
                            </div>
                            <div className={`text-[8px] font-black uppercase tracking-widest mt-2 ${isRpgMode ? 'text-slate-700' : 'text-slate-300'}`}>
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${theme.text}`}>{project.name}</h3>
                        
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border transition-all mb-6 ${isRpgMode ? 'bg-slate-950 border-slate-800 rounded-none' : 'bg-slate-50 border-slate-100 rounded-full'}`}>
                          <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${theme.muted}`}>{t('progress')} Source:</span>
                          <span className={`text-[10px] font-bold leading-none ${theme.accent}`}>{project.skillTitle}</span>
                        </div>

                        <p className={`text-sm leading-relaxed mb-8 line-clamp-3 ${theme.muted}`}>
                          {project.description}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Link 
                          href={`/skills/${project.skillId}`}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-center transition-all border ${
                            isRpgMode 
                              ? 'bg-slate-950 text-emerald-400 border-emerald-900/50 hover:bg-emerald-500/10 rounded-none' 
                              : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100 rounded-xl'
                          }`}
                        >
                          {t('path_details')}
                        </Link>
                        {project.link && (
                          <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 group/link ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-xl'}`}
                          >
                            {t('live')}
                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`md:col-span-2 xl:col-span-3 text-center py-40 border-2 border-dashed ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-700 rounded-none' : 'bg-white border-slate-200 text-slate-400 rounded-[4rem]'
                }`}>
                  <Globe className="w-16 h-16 mx-auto mb-8 opacity-20" />
                  <p className="font-serif italic text-3xl">{t('no_projects_showroom')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
