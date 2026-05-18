'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Calendar,
  Zap,
  ArrowRight,
  Plus,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';

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
  userId?: string;
  title: string;
  progress: number;
  targetDuration: number;
  targetUnit: string;
  roadmap: PathSegment[];
  attendance?: string[]; 
}

interface Log {
  id: string;
  note: string;
  date: string;
}

interface Recommendation {
  skill?: string;
  advice?: string;
  task?: string;
}

export default function SkillDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLog, setNewLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    const unsubSkill = onSnapshot(doc(db, 'skills', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSkill({ 
          id: snapshot.id, 
          userId: data.userId,
          title: data.title,
          progress: data.progress,
          targetDuration: data.targetDuration,
          targetUnit: data.targetUnit,
          roadmap: data.roadmap || [],
          attendance: data.attendance || []
        });
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    });

    const logsQuery = query(collection(db, 'logs'), where('skillId', '==', id));
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log)));
    });

    return () => { unsubSkill(); unsubLogs(); };
  }, [id, user, router]);

  const isOwner = skill?.userId === user?.uid;
  const today = new Date().toISOString().split('T')[0];
  const hasStudiedToday = skill?.attendance?.includes(today);

  const calculateProgress = (roadmap: PathSegment[]) => {
    let totalSubpaths = 0;
    let completedSubpaths = 0;

    roadmap.forEach(path => {
      if (path.subpaths.length === 0) {
        totalSubpaths += 1;
        if (path.completed) completedSubpaths += 1;
      } else {
        path.subpaths.forEach(sub => {
          totalSubpaths += 1;
          if (sub.completed) completedSubpaths += 1;
        });
      }
    });

    return totalSubpaths === 0 ? 0 : Math.round((completedSubpaths / totalSubpaths) * 100);
  };

  const togglePath = async (pathId: string) => {
    if (!skill || !isOwner) return;
    const newRoadmap = skill.roadmap.map((p: PathSegment) => {
      if (p.id === pathId) {
        const newCompleted = !p.completed;
        // If marking path as completed, mark all subpaths as completed too
        return { 
          ...p, 
          completed: newCompleted,
          subpaths: p.subpaths.map(s => ({ ...s, completed: newCompleted }))
        };
      }
      return p;
    });
    
    await updateDoc(doc(db, 'skills', id), { 
      roadmap: newRoadmap, 
      progress: calculateProgress(newRoadmap) 
    });
  };

  const toggleSubPath = async (pathId: string, subId: string) => {
    if (!skill || !isOwner) return;
    const newRoadmap = skill.roadmap.map((p: PathSegment) => {
      if (p.id === pathId) {
        const newSubpaths = p.subpaths.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        // Path is completed only if all subpaths are completed
        const allSubCompleted = newSubpaths.every(s => s.completed);
        return { ...p, subpaths: newSubpaths, completed: allSubCompleted };
      }
      return p;
    });

    await updateDoc(doc(db, 'skills', id), { 
      roadmap: newRoadmap, 
      progress: calculateProgress(newRoadmap) 
    });
  };

  const addPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !newStep.trim() || !isOwner) return;
    const newRoadmap = [...skill.roadmap, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: newStep, 
      completed: false,
      subpaths: [] 
    }];
    await updateDoc(doc(db, 'skills', id), { 
      roadmap: newRoadmap, 
      progress: calculateProgress(newRoadmap) 
    });
    setNewStep('');
  };

  const addSubPath = async (pathId: string, task: string) => {
    if (!skill || !task.trim() || !isOwner) return;
    const newRoadmap = skill.roadmap.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          subpaths: [...p.subpaths, { id: Math.random().toString(36).substr(2, 9), task, completed: false }],
          completed: false // Adding an incomplete subpath makes the parent incomplete
        };
      }
      return p;
    });
    await updateDoc(doc(db, 'skills', id), { 
      roadmap: newRoadmap, 
      progress: calculateProgress(newRoadmap) 
    });
  };

  const handleCheckIn = async () => {
    if (!skill || !user || !isOwner) return;
    const newAttendance = skill.attendance ? [...skill.attendance] : [];
    
    if (newAttendance.includes(today)) {
      const index = newAttendance.indexOf(today);
      newAttendance.splice(index, 1);
    } else {
      newAttendance.push(today);
    }
    
    await updateDoc(doc(db, 'skills', id), { attendance: newAttendance });
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim() || !user || !isOwner) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'logs'), { 
        skillId: id, 
        userId: user.uid, 
        note: newLog, 
        date: new Date().toISOString() 
      });
      setNewLog('');
    } finally { setIsSubmitting(false); }
  };

  const handleAdopt = async () => {
    if (!skill || !user) return;
    setIsSubmitting(true);
    try {
      const newRef = await addDoc(collection(db, 'skills'), {
        userId: user.uid,
        title: skill.title,
        targetDuration: skill.targetDuration,
        targetUnit: skill.targetUnit,
        progress: 0,
        roadmap: skill.roadmap.map(s => ({ ...s, completed: false })),
        attendance: [],
        isPublic: true,
        createdAt: serverTimestamp()
      });
      router.push(`/skills/${newRef.id}`);
    } catch (error) {
      console.error("Error adopting roadmap:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecommendations = async () => {
    if (!skill) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skill.title, roadmap: skill.roadmap })
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recs error:", err);
    } finally { setIsSubmitting(false); }
  };

  if (loading) return null;
  if (!skill) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        <header className="h-auto min-h-[6rem] bg-white border-b border-slate-100 flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 py-4 sticky top-0 z-50 gap-4">
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
            <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="min-w-0">
              <h2 className="font-serif italic text-xl sm:text-2xl text-slate-800 leading-none mb-1 truncate">{skill.title}</h2>
              {!isOwner && <span className="bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest whitespace-nowrap">Public Roadmap</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {isOwner ? (
               <button 
                 onClick={handleCheckIn}
                 className={`flex-1 md:flex-none px-6 sm:px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                   hasStudiedToday 
                   ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xl shadow-emerald-50' 
                   : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-100'
                 }`}
               >
                 {hasStudiedToday ? 'Check-in Complete' : 'Learned Today?'}
               </button>
             ) : (
               <button 
                 onClick={handleAdopt}
                 disabled={isSubmitting}
                 className="flex-1 md:flex-none bg-indigo-600 text-white px-6 sm:px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
               >
                 {isSubmitting ? 'Adopting...' : 'Adopt This Roadmap'}
               </button>
             )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Path section */}
          <section className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
              <Zap className="w-24 h-24 sm:w-40 sm:h-40" />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start mb-12 sm:mb-16 gap-4">
              <div>
                <h3 className="text-3xl sm:text-4xl font-serif italic mb-3">Learning Path</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Target: {skill.targetDuration} {skill.targetUnit} of learning
                </p>
              </div>
              <div className="text-5xl sm:text-6xl font-black text-indigo-600 tracking-tighter self-end sm:self-auto">{skill.progress}%</div>
            </div>

            <div className="space-y-8 sm:space-y-10 relative">
              {skill.roadmap.map((path) => (
                <div key={path.id} className="space-y-4">
                  <div 
                    onClick={() => isOwner && togglePath(path.id)} 
                    className={`flex gap-4 sm:gap-6 items-center p-4 sm:p-6 border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] transition-all ${
                      isOwner ? 'hover:bg-slate-50 cursor-pointer shadow-sm hover:shadow-md' : 'opacity-80'
                    } ${path.completed ? 'bg-indigo-50/30' : 'bg-white'}`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 border-2 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      path.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'
                    }`}>
                      {path.completed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                    </div>
                    <span className={`text-lg sm:text-xl font-bold transition-all ${path.completed ? 'text-indigo-900 line-through opacity-60' : 'text-slate-800'}`}>
                      {path.title}
                    </span>
                  </div>

                  {/* Subpaths */}
                  <div className="pl-10 sm:pl-14 space-y-3">
                    {path.subpaths.map((sub) => (
                      <div 
                        key={sub.id} 
                        onClick={(e) => { e.stopPropagation(); isOwner && toggleSubPath(path.id, sub.id); }}
                        className={`flex gap-3 sm:gap-4 items-center p-3 sm:p-4 border border-slate-50 rounded-xl sm:rounded-2xl transition-all ${
                          isOwner ? 'hover:bg-slate-50 cursor-pointer' : ''
                        } ${sub.completed ? 'bg-indigo-50/20' : 'bg-white'}`}
                      >
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                          sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200'
                        }`}>
                          {sub.completed && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${sub.completed ? 'text-indigo-700 line-through opacity-50' : 'text-slate-600'}`}>
                          {sub.task}
                        </span>
                      </div>
                    ))}
                    
                    {isOwner && (
                      <div className="flex gap-2 pt-2">
                        <input 
                          type="text"
                          placeholder="Add subpath..."
                          className="flex-1 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = (e.target as HTMLInputElement);
                              if (target.value.trim()) {
                                addSubPath(path.id, target.value);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isOwner && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newStep.trim()) {
                      addPath(e);
                    }
                  }} 
                  className="flex flex-col sm:flex-row gap-4 pt-8"
                >
                  <input 
                    className="flex-1 bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] font-bold text-base sm:text-lg italic focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Forge a new path..." 
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                  />
                  <button type="submit" className="bg-slate-900 text-white px-8 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Add Milestone</button>
                </form>
              )}
            </div>
          </section>

          {/* Logs section */}
          {isOwner && (
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <MessageSquare className="text-indigo-600 w-6 h-6" />
                <h3 className="text-3xl font-serif italic">Learning Logs</h3>
              </div>
              
              <form onSubmit={handleAddLog} className="space-y-6">
                <textarea 
                  className="w-full p-8 bg-white border border-slate-100 rounded-[3rem] min-h-[200px] text-lg font-bold italic focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
                  placeholder="What did you conquer today?" 
                  value={newLog} 
                  onChange={e=>setNewLog(e.target.value)} 
                />
                <button 
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100"
                >
                  {isSubmitting ? 'Saving...' : 'Commit Note'}
                </button>
              </form>

              <div className="space-y-6 pt-10">
                  {logs.length === 0 ? (
                    <div className="p-12 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center text-slate-400 italic">
                      No logs yet. Documentation is the key to memory.
                    </div>
                  ) : (
                    logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                      <div key={log.id} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all">
                        <p className="italic font-serif text-2xl text-slate-700 leading-relaxed mb-8">&ldquo;{log.note}&rdquo;</p>
                        <div className="flex items-center gap-3 text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em]">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-12">
           {/* Consistency Graph */}
           {isOwner && (
             <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Consistency</h4>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[...Array(28)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (27 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const attended = skill.attendance?.includes(dateStr);
                    return (
                      <div 
                        key={i} 
                        title={dateStr}
                        className={`w-4 h-4 rounded-md transition-all ${
                          attended ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-100' : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-8 italic font-bold">Activity over the last 28 days.</p>
             </section>
           )}

           {/* AI Recommendations */}
           <section className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
              
              <Sparkles className="text-indigo-400 mb-8 w-10 h-10" />
              <h4 className="font-serif italic text-3xl mb-8 leading-tight">{isOwner ? 'AI Tutor Advisor' : 'Path Potential'}</h4>
              
              {!recommendations.length ? (
                <button 
                  onClick={getRecommendations} 
                  disabled={isSubmitting}
                  className="w-full text-[10px] border border-slate-700 p-5 rounded-2xl uppercase font-black tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : 'Request Advice'}
                </button>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((r,i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="text-sm text-slate-300 italic p-6 border border-slate-800 rounded-3xl bg-slate-800/30"
                    >
                      {r.advice || r.task || r.skill}
                    </motion.div>
                  ))}
                  <button 
                    onClick={() => setRecommendations([])} 
                    className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Reset Analysis
                  </button>
                </div>
              )}
           </section>
        </aside>
      </main>
      </div>
    </DashboardLayout>
  );
}
