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
      <div className="min-h-screen bg-transparent">
        <header className="h-auto min-h-[6rem] bg-white border-b border-slate-100 px-4 sm:px-10 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 gap-4">
          <div className="flex items-center gap-4 sm:gap-10 w-full md:flex-1">
            <Link href="/dashboard" className="p-3 hover:bg-slate-50 rounded-full transition-all">
              <ArrowLeft className="text-slate-400 w-5 h-5" />
            </Link>
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                className="w-full bg-slate-50 border border-slate-100 pl-10 sm:pl-14 pr-6 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
                placeholder="Search community pathways..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12">
        <div className="mb-12 md:mb-20 text-center md:text-left">
           <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full tracking-widest mb-6">
             <Users className="w-3 h-3" />
             Community Intelligence
           </div>
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic mb-4 leading-none tracking-tight">Explore Roadmaps</h1>
           <p className="text-slate-500 text-sm sm:text-base md:text-lg italic">Adopt proven learning paths or find inspiration for your next journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
           {filteredSkills.map(s => (
             <div key={s.id} className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all flex flex-col relative overflow-hidden">
               <div className="flex justify-between items-start mb-8 sm:mb-10">
                 <div className="flex-1 min-w-0 pr-4">
                   <h4 className="font-bold text-xl sm:text-2xl tracking-tight mb-2 group-hover:text-indigo-600 transition-colors truncate">{s.title}</h4>
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full tracking-widest whitespace-nowrap">
                       {s.targetDuration} {s.targetUnit}
                     </span>
                   </div>
                 </div>
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm flex-shrink-0">
                    <Zap className="w-6 h-6" />
                 </div>
               </div>

               <div className="flex-1 space-y-6 mb-8 sm:mb-10">
                 <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <Trophy className="w-4 h-4 text-yellow-500" />
                   {s.roadmap?.length || 0} Milestones
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                     <span>Creator Progress</span>
                     <span>{s.progress}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600 rounded-full opacity-60" style={{ width: `${s.progress}%` }} />
                   </div>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                 <Link href={`/skills/${s.id}`} className="flex-1 py-4 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-100 transition-colors">
                   Preview
                 </Link>
                 <button 
                  onClick={() => handleAdopt(s)}
                  disabled={isAdopting === s.id}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-100"
                 >
                   {isAdopting === s.id ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <><Plus className="w-4 h-4" /> Adopt</>
                   )}
                 </button>
               </div>
             </div>
           ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-24 sm:py-40 bg-white rounded-[2rem] sm:rounded-[3rem] border border-dashed border-slate-200 px-4">
            <p className="text-slate-400 font-serif italic text-xl sm:text-2xl">The collection is vast, but that path is yet to be forged.</p>
          </div>
        )}
      </main>
      </div>
    </DashboardLayout>
  );
}
