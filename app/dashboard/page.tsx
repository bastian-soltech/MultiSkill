'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LogOut, 
  ChevronRight, 
  Zap, 
  Sparkles,
  LayoutGrid,
  List,
  Target
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

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
  targetDuration: number;
  targetUnit: string;
  roadmap: PathSegment[];
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [newSkill, setNewSkill] = useState({
    title: '',
    targetDuration: 3,
    targetUnit: 'months',
    roadmap: [] as PathSegment[]
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const q = query(collection(db, 'skills'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const skillsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Skill[];
      setSkills(skillsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSkill.title.trim()) return;
    try {
      await addDoc(collection(db, 'skills'), {
        userId: user.uid,
        title: newSkill.title,
        targetDuration: Number(newSkill.targetDuration),
        targetUnit: newSkill.targetUnit,
        progress: 0,
        roadmap: newSkill.roadmap,
        attendance: [],
        isPublic: true,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewSkill({ title: '', targetDuration: 3, targetUnit: 'months', roadmap: [] });
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const addPathSegment = (title: string) => {
    if (!title.trim()) return;
    setNewSkill({
      ...newSkill,
      roadmap: [...newSkill.roadmap, { 
        id: Math.random().toString(36).substr(2, 9), 
        title, 
        completed: false,
        subpaths: []
      }]
    });
  };

  const chartData = (skills || []).map(s => ({
    subject: s.title ? s.title.slice(0, 10) : 'Skill',
    A: s.progress || 0,
    fullMark: 100,
  }));

  if (loading || authLoading) return null;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 md:p-12">
        {skills.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="flex-1 w-full text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-serif italic mb-4">Your Skill Radar</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">A visual overview of your multi-disciplinary progress.</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Paths</div>
                    <div className="text-2xl font-black text-slate-800">{skills.length}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Avg Progress</div>
                    <div className="text-2xl font-black text-indigo-600">
                      {skills.length > 0 ? Math.round(skills.reduce((acc, s) => acc + (s.progress || 0), 0) / skills.length) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <Radar dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-xl flex flex-col justify-center">
              <Sparkles className="text-indigo-400 w-8 h-8 mb-6" />
              <h3 className="text-2xl font-serif italic mb-4">Focused Mastery</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Systematic learning is key.</p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                Daily Refresher
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-serif italic mb-2">Hello, Learner</h1>
            <p className="text-slate-500 text-sm">You have {skills.length} active learning paths.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1 w-fit">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
              <Plus className="w-4 h-4" /> Initialize New Path
            </button>
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Target className="text-slate-300 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif italic mb-4">A Blank Canvas for Mastery</h2>
            <p className="text-slate-400 mb-10 max-w-md mx-auto">Set your intention. Define your discipline. Begin the journey.</p>
            <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100">
              Create My First Roadmap
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <motion.div key={skill.id} whileHover={{ y: -10 }} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/20 transition-all group">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Progress</div>
                    <div className="text-2xl font-black text-slate-800 leading-none">{skill.progress}%</div>
                  </div>
                </div>
                <h3 className="text-2xl font-serif italic text-slate-800 mb-2 truncate">{skill.title}</h3>
                <div className="flex items-center gap-2 mb-8">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded">
                    {skill.targetDuration} {skill.targetUnit}
                  </div>
                </div>
                <button onClick={() => router.push(`/skills/${skill.id}`)} className="w-full bg-slate-50 text-slate-900 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all">
                  Enter Path <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">
                  <th className="px-6 sm:px-10 py-6">Learning Path</th>
                  <th className="px-6 sm:px-10 py-6">Timeline</th>
                  <th className="px-6 sm:px-10 py-6">Progress</th>
                  <th className="px-6 sm:px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 sm:px-10 py-8"><div className="font-bold text-base sm:text-lg text-slate-800">{skill.title}</div></td>
                    <td className="px-6 sm:px-10 py-8"><span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full whitespace-nowrap">{skill.targetDuration} {skill.targetUnit}</span></td>
                    <td className="px-6 sm:px-10 py-8"><div className="flex items-center gap-4 min-w-[150px]"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${skill.progress}%` }} /></div><span className="text-[10px] font-black text-slate-400">{skill.progress}%</span></div></td>
                    <td className="px-6 sm:px-10 py-8 text-right"><button onClick={() => router.push(`/skills/${skill.id}`)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap">Details <ChevronRight className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
             <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative">
               <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-colors"><LogOut className="w-5 h-5 text-slate-400" /></button>
               <h2 className="text-4xl font-serif italic mb-2">New Learning Path</h2>
               <form onSubmit={handleAddSkill} className="space-y-8 mt-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400 mb-3 block tracking-widest">Skill / Discipline Name</label><input required className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Quantum Computing" value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} /></div>
                    <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-3 block tracking-widest">Target Duration</label><input required type="number" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.targetDuration} onChange={e => setNewSkill({...newSkill, targetDuration: parseInt(e.target.value)})} /></div>
                    <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-3 block tracking-widest">Time Unit</label><select className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer" value={newSkill.targetUnit} onChange={e => setNewSkill({...newSkill, targetUnit: e.target.value})}><option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option></select></div>
                 </div>
                 <div className="pt-6 flex gap-6">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cancel</button>
                   <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 shadow-2xl transition-all">Launch Path</button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
