'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'skills'), limit(40));
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

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className={`transition-colors duration-300`}>
        <header className={`h-auto min-h-[6rem] border-b px-4 sm:px-10 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 gap-4 transition-colors ${
          isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-4 sm:gap-10 w-full md:flex-1">
            <Link href="/dashboard" className={`p-3 rounded-full transition-all ${isRpgMode ? 'hover:bg-slate-900 text-slate-500 hover:text-cyan-400' : 'hover:bg-slate-50 text-slate-400'}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative flex-1 max-w-2xl">
              <Search className={`absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`} />
              <input 
                className={`w-full border pl-10 sm:pl-14 pr-6 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none transition-all shadow-sm ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder={t('search_community')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12">
        <div className="mb-12 md:mb-20 text-center md:text-left">
           <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest mb-6 ${
             isRpgMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-indigo-50 text-indigo-600'
           }`}>
             {isRpgMode ? <Users className="w-3 h-3" /> : <Users className="w-3 h-3" />}
             {isRpgMode ? t('community_library') : t('community_intelligence')}
           </div>
           <h1 className={`text-4xl sm:text-5xl md:text-6xl font-serif italic mb-4 leading-none tracking-tight ${isRpgMode ? 'text-white' : 'text-slate-900'}`}>
             {isRpgMode ? t('explore_grimoires') : t('explore_roadmaps')}
           </h1>
           <p className={`text-sm sm:text-base md:text-lg italic ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
             {isRpgMode ? "Find proven learning paths from other users. Choose a path to start." : "Adopt proven learning paths or find inspiration for your next journey."}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
           {filteredSkills.map(s => (
             <div key={s.id} className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border shadow-sm group hover:shadow-2xl transition-all flex flex-col relative overflow-hidden ${
               isRpgMode ? 'bg-slate-900 border-slate-800 hover:border-cyan-500' : 'bg-white border-slate-100'
             }`}>
               <div className="flex justify-between items-start mb-8 sm:mb-10">
                 <div className="flex-1 min-w-0 pr-4">
                   <h4 className={`font-bold text-xl sm:text-2xl tracking-tight mb-3 transition-colors truncate ${
                     isRpgMode ? 'text-white group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-indigo-600'
                   }`}>{s.title}</h4>
                   <div className="flex items-center gap-3">
                     <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest whitespace-nowrap ${
                       isRpgMode ? 'bg-slate-950 text-cyan-400 border border-cyan-900/50' : 'bg-indigo-50 text-indigo-500'
                     }`}>
                       {s.targetDuration} {s.targetUnit}
                     </span>
                   </div>
                 </div>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
                   isRpgMode ? 'bg-slate-950 border border-slate-800 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white' : 'bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                 }`}>
                    <Zap className="w-6 h-6" />
                 </div>
               </div>

               <div className="flex-1 space-y-8 mb-8 sm:mb-10">
                 <div className={`flex items-center gap-4 text-xs font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                   <Trophy className="w-4 h-4 text-amber-500" />
                   {s.roadmap?.length || 0} {isRpgMode ? 'Milestones' : 'Milestones'}
                 </div>
                 
                 <div>
                   <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`}>
                     <span>{isRpgMode ? 'Creator Progress' : 'Creator Progress'}</span>
                     <span>{s.progress}%</span>
                   </div>
                   <div className={`h-2 rounded-full overflow-hidden ${isRpgMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50'}`}>
                     <div className={`h-full rounded-full opacity-60 ${isRpgMode ? 'bg-cyan-600' : 'bg-indigo-600'}`} style={{ width: `${s.progress}%` }} />
                   </div>
                 </div>
               </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                 <Link href={`/skills/${s.id}`} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                   isRpgMode ? 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-white' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                 }`}>
                   {isRpgMode ? t('view') : t('preview')}
                 </Link>
                 <button 
                  onClick={() => handleAdopt(s)}
                  disabled={isAdopting === s.id}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                    isRpgMode 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500 border-b-4 border-cyan-800' 
                      : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'
                  }`}
                 >
                   {isAdopting === s.id ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <><Plus className="w-4 h-4" /> {isRpgMode ? t('claim') : t('adopt')}</>
                   )}
                 </button>
               </div>
             </div>
           ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className={`text-center py-24 sm:py-40 rounded-[2rem] sm:rounded-[3rem] border border-dashed px-4 ${
            isRpgMode ? 'bg-slate-950 border-slate-800 text-slate-700' : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <p className="font-serif italic text-xl sm:text-3xl">{isRpgMode ? t('empty_explore_rpg') : t('empty_explore_pro')}</p>
          </div>
        )}
      </main>
      </div>
    </DashboardLayout>
  );
}
