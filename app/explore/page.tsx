'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import {motion} from 'framer-motion'
import { 
  Search, 
  ArrowLeft, 
  Zap,
  Plus,
  Loader2,
  Trophy,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import { useMode } from '@/lib/ModeContext';
import { useLanguage } from '@/lib/LanguageContext';

interface RoadmapStep {
  id: string;
  task: string;
  completed: boolean;
}

interface Skill {
  id: string;
  title: string;
  progress: number;
  targetDuration?: number;
  targetUnit?: string;
  roadmap?: RoadmapStep[];
}

export default function ExplorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdopting, setIsAdopting] = useState<string | null>(null);

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
    input: isRpgMode ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500',
    font: isRpgMode ? 'font-mono' : 'font-sans',
    heading: isRpgMode ? 'font-black uppercase tracking-tighter italic' : 'font-serif italic tracking-tight'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'skills'), limit(40));
        console.log(q)
        const skillsSnap = await getDocs(q);
        setSkills(skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill)));
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleAdopt = async (skill: Skill) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsAdopting(skill.id);
    try {
      const newRef = await addDoc(collection(db, 'skills'), {
        userId: user.uid,
        title: skill.title,
        targetDuration: skill.targetDuration || 3,
        targetUnit: skill.targetUnit || 'months',
        progress: 0,
        roadmap: (skill.roadmap || []).map((s: RoadmapStep) => ({ ...s, completed: false })),
        attendance: [],
        isPublic: true,
        createdAt: serverTimestamp()
      });
      router.push(`/skills/${newRef.id}`);
    } catch (error) {
      console.error("Error adopting roadmap:", error);
      setIsAdopting(null);
    }
  };

  const filteredSkills = skills.filter(s => 
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className={`min-h-screen relative transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} selection:bg-emerald-500/30 overflow-hidden`}>
        
        {/* Background Grids & Patterns matching landing page */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          {isRpgMode ? (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
          )}
        </div>

        {/* Sticky Header */}
        <header className={`h-auto min-h-[6rem] border-b px-4 sm:px-10 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 gap-4 transition-colors ${
          isRpgMode ? 'bg-slate-950 border-slate-800 shadow-[0px_4px_20px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-4 sm:gap-10 w-full md:flex-1 relative z-10">
            <Link href="/dashboard" className={`p-3 transition-all flex-shrink-0 ${
              isRpgMode ? 'hover:bg-slate-900 text-slate-500 hover:text-emerald-400 rounded-none' : 'hover:bg-slate-50 text-slate-400 rounded-full'
            }`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative flex-1 max-w-2xl">
              <Search className={`absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 ${isRpgMode ? 'text-emerald-500' : 'text-slate-400'}`} />
              <input 
                className={`w-full border pl-10 sm:pl-14 pr-6 py-3 sm:py-4 text-xs sm:text-sm font-bold focus:outline-none transition-all shadow-sm ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 text-white focus:ring-1 focus:ring-emerald-500 rounded-none' : 'bg-slate-50 border-slate-100 focus:ring-1 focus:ring-indigo-500 rounded-2xl'
                }`}
                placeholder={t('search_community')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12 relative z-10">
          {loading ? (
            /* SKELETON UI */
            <div className="animate-pulse">
              <div className="mb-12 md:mb-20 space-y-6">
                <div className={`h-6 w-48 ${isRpgMode ? 'bg-slate-900' : 'bg-indigo-50'} rounded-full mx-auto md:mx-0`} />
                <div className={`h-16 w-80 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-200'} rounded-2xl mx-auto md:mx-0`} />
                <div className={`h-4 w-96 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-lg mx-auto md:mx-0`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`h-80 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
                ))}
              </div>
            </div>
          ) : (
            /* ACTUAL CONTENT */
            <>
              <div className="mb-12 md:mb-20 text-center md:text-left">
                 <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 border tracking-widest mb-6 ${
                   isRpgMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-none' : 'bg-indigo-50 text-indigo-600 border-indigo-100 rounded-full'
                 }`}>
                   <Users className="w-3 h-3" />
                   {isRpgMode ? t('community_archives') : t('community_intelligence')}
                 </div>
                 <h1 className={`text-4xl sm:text-5xl md:text-6xl mb-4 leading-none tracking-tighter ${theme.heading}`}>
                   {isRpgMode ? t('discover_grimoires') : t('explore_roadmaps')}
                 </h1>
                 <p className={`text-sm sm:text-base md:text-lg italic ${theme.muted}`}>
                   {isRpgMode ? t('extract_wisdom') : t('adopt_wisdom')}
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
                 {filteredSkills.map(s => (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     key={s.id} 
                     className={`p-6 sm:p-10 border transition-all flex flex-col justify-between relative overflow-hidden ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}
                   >
                     <div className="relative">
                       <div className="flex justify-between items-start mb-8 sm:mb-10">
                         <div className={`p-4 border transition-all ${isRpgMode ? 'bg-slate-950 text-emerald-400 border-emerald-500/20 rounded-none' : 'bg-indigo-50 text-indigo-600 border-indigo-100 rounded-2xl'}`}>
                           {isRpgMode ? <Zap className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                         </div>
                         <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.muted}`}>
                           {s.roadmap?.length || 0} {t('modules')}
                         </div>
                       </div>
                       
                       <h3 className={`text-2xl sm:text-3xl mb-4 ${theme.heading} ${theme.text}`}>{s.title}</h3>
                       
                       <div className={`inline-flex items-center gap-2 px-3 py-1 border transition-all mb-8 ${isRpgMode ? 'bg-slate-950 border-slate-800 rounded-none' : 'bg-slate-50 border-slate-100 rounded-full'}`}>
                         <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${theme.muted}`}>{t('term')}:</span>
                         <span className={`text-[10px] font-bold leading-none ${theme.accent}`}>{s.targetDuration} {t(s.targetUnit || 'months')}</span>
                       </div>
                     </div>

                     <div className="mt-auto">
                       <button 
                         onClick={() => handleAdopt(s)}
                         disabled={isAdopting === s.id}
                         className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                           isAdopting === s.id ? 'opacity-50 cursor-not-allowed' : ''
                         } ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                       >
                         {isAdopting === s.id ? (
                           <>
                             <Loader2 className="w-4 h-4 animate-spin" />
                             Adopting...
                           </>
                         ) : (
                           <>
                             {isRpgMode ? t('adopt_grimoire') : t('adopt_roadmap')}
                             <Plus className="w-4 h-4" />
                           </>
                         )}
                       </button>
                     </div>
                   </motion.div>
                 ))}
              </div>

              {filteredSkills.length === 0 && (
                <div className={`text-center py-40 border-2 border-dashed ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-700 rounded-none' : 'bg-white border-slate-200 text-slate-400 rounded-[4rem]'
                }`}>
                  <Users className="w-16 h-16 mx-auto mb-8 opacity-20" />
                  <p className="font-serif italic text-3xl">{t('no_knowledge_paths')}</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
