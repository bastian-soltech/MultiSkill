'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  Target,
  Shield,
  Gamepad2,
  Sword,
  Scroll,
  Lock,
  CheckCircle2,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useMode } from '@/lib/ModeContext';
import { useLanguage } from '@/lib/LanguageContext';

const WEEKLY_DATA = [
  { day: 'Mon', hours: 4 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 5 },
  { day: 'Sat', hours: 8 },
  { day: 'Sun', hours: 2 },
];

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
  attendance?: string[];
}

interface Log {
  id: string;
  note: string;
  date: string;
  skillId: string;
  skillTitle?: string;
}

export default function DashboardPage() {
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [newSkill, setNewSkill] = useState({
    title: '',
    targetDuration: 3,
    targetUnit: 'months',
    roadmap: [] as PathSegment[]
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    message: string;
    action: () => void;
  } | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingSkillTitle, setEditingSkillTitle] = useState('');
  const [editingSkillDuration, setEditingSkillDuration] = useState(3);
  const [editingSkillUnit, setEditingSkillUnit] = useState('months');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const skillsQ = query(collection(db, 'skills'), where('userId', '==', user.uid));
    const unsubscribeSkills = onSnapshot(skillsQ, (snapshot) => {
      const skillsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtVal = Date.now();
        if (data.createdAt) {
          if (typeof data.createdAt.toMillis === 'function') {
            createdAtVal = data.createdAt.toMillis();
          } else if (data.createdAt.seconds) {
            createdAtVal = data.createdAt.seconds * 1000;
          } else if (typeof data.createdAt === 'number') {
            createdAtVal = data.createdAt;
          }
        }
        return {
          ...data,
          id: doc.id,
          createdAt: createdAtVal
        } as unknown as Skill;
      });
      setSkills(skillsData);
    });

    const logsQ = query(collection(db, 'logs'), where('userId', '==', user.uid));
    const unsubscribeLogs = onSnapshot(logsQ, (logSnapshot) => {
      const fetchedLogs = logSnapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = new Date().toISOString();
        if (data.date) {
          if (typeof data.date === 'string') dateStr = data.date;
          else if (data.date.toDate) dateStr = data.date.toDate().toISOString();
          else if (data.date.seconds) dateStr = new Date(data.date.seconds * 1000).toISOString();
        }
        return {
          ...data,
          id: doc.id,
          date: dateStr
        } as unknown as Log;
      });
      
      setLogs(fetchedLogs);
      setLoading(false);
    }, (err) => {
      console.error("Logs listener error:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeSkills();
      unsubscribeLogs();
    };
  }, [user, authLoading, router]);

  // Derived state for logs with titles
  const recentLogs = logs
    .map(log => ({
      ...log,
      skillTitle: skills.find(s => s.id === log.skillId)?.title || 'Unknown Skill'
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalXp = skills.reduce((acc, skill) => {
    let skillXp = 0;
    // Path completion (100% progress)
    if (skill.progress >= 100) skillXp += 50;
    
    // Subpath completion
    skill.roadmap?.forEach(segment => {
      segment.subpaths?.forEach(sub => {
        if (sub.completed) skillXp += 5;
      });
    });
    
    // Attendance
    if (skill.attendance) {
      skillXp += skill.attendance.length * 10;
    }
    
    return acc + skillXp;
  }, 0);

  const getLevelInfo = () => {
    let levelNum = 1;
    let rankKey = '1_2';

    if (totalXp <= 500) {
      levelNum = totalXp <= 250 ? 1 : 2;
      rankKey = '1_2';
    } else if (totalXp <= 2000) {
      levelNum = 3 + Math.floor((totalXp - 501) / 500);
      rankKey = '3_5';
    } else if (totalXp <= 5000) {
      levelNum = 6 + Math.floor((totalXp - 2001) / 1000);
      rankKey = '6_8';
    } else if (totalXp <= 10000) {
      levelNum = 9 + Math.floor((totalXp - 5001) / 2500);
      rankKey = '9_10';
    } else {
      levelNum = 10;
      rankKey = '9_10';
    }

    // Check for MAX
    const masterSkills = skills.filter(s => s.progress >= 100).length;
    if (masterSkills >= 3 && totalXp >= 10000) {
      rankKey = 'max';
      levelNum = 10;
    }

    return { levelNum, rankKey };
  };

  const { levelNum: userLevel, rankKey } = getLevelInfo();
  const userClass = isRpgMode ? t(`rpg_title_${rankKey}`) : t(`pro_title_${rankKey}`);

  const avgProgress = skills.length > 0 ? Math.round(skills.reduce((acc, s) => acc + (s.progress || 0), 0) / skills.length) : 0;

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSkill.title.trim()) return;

    // Close the modal instantly so the user knows the skill is successfully initiated
    setShowAddModal(false);

    try {
      const skillPayload = {
        userId: user.uid,
        title: newSkill.title,
        targetDuration: Number(newSkill.targetDuration),
        targetUnit: newSkill.targetUnit,
        progress: 0,
        roadmap: newSkill.roadmap,
        attendance: [],
        isPublic: true,
        createdAt: serverTimestamp()
      };
      setNewSkill({ title: '', targetDuration: 3, targetUnit: 'months', roadmap: [] });
      await addDoc(collection(db, 'skills'), skillPayload);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const handleOpenEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setEditingSkillTitle(skill.title);
    setEditingSkillDuration(skill.targetDuration || 3);
    setEditingSkillUnit(skill.targetUnit || 'months');
    setShowEditModal(true);
  };

  const handleSaveEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editingSkillTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'skills', editingSkill.id), {
        title: editingSkillTitle,
        targetDuration: Number(editingSkillDuration),
        targetUnit: editingSkillUnit,
      });
      setShowEditModal(false);
      setEditingSkill(null);
    } catch (error) {
      console.error("Error editing skill:", error);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setConfirmDelete({
      message: 'Are you sure you want to delete this learning path? This action is permanent and will delete all progress, projects, and logs associated with this path.',
      action: async () => {
        try {
          await deleteDoc(doc(db, 'skills', skillId));
        } catch (error) {
          console.error("Error deleting skill:", error);
        }
      }
    });
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
      <div className={`transition-colors duration-300 p-4 sm:p-8 md:p-12`}>
        {skills.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className={`lg:col-span-2 rounded-[2.5rem] p-8 border ${isRpgMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} flex flex-col md:flex-row items-center gap-10`}>
              <div className="flex-1 w-full text-center md:text-left">
                <h3 className={`text-2xl font-serif italic mb-6 ${isRpgMode ? 'text-cyan-400' : 'text-slate-800'}`}>{isRpgMode ? t('skill_matrix') : t('skill_radar')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-[2rem] border ${isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-transparent'}`}>
                    <div className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">{isRpgMode ? t('active_quests') : t('total_paths')}</div>
                    <div className={`text-4xl font-black ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>{skills.length}</div>
                  </div>
                  <div className={`p-6 rounded-[2rem] border ${isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50 border-transparent'}`}>
                    <div className="text-[10px] uppercase font-black text-indigo-400 mb-2 tracking-widest">
                      {isRpgMode ? 'Total Experience' : 'Competency Score'}
                    </div>
                    <div className={`text-4xl font-black ${isRpgMode ? 'text-indigo-600' : 'text-indigo-600'}`}>
                      {totalXp} {isRpgMode ? 'XP' : 'PTS'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke={isRpgMode ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: isRpgMode ? '#94a3b8' : '#64748b' }} />
                    <Radar 
                      dataKey="A" 
                      stroke={isRpgMode ? "#22d3ee" : "#4f46e5"} 
                      fill={isRpgMode ? "#22d3ee" : "#4f46e5"} 
                      fillOpacity={isRpgMode ? 0.2 : 0.6} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={`rounded-[2.5rem] p-8 border ${isRpgMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} flex flex-col`}>
              <h3 className={`text-xl font-serif italic mb-8 ${isRpgMode ? 'text-emerald-400' : 'text-slate-800'}`}>{isRpgMode ? t('quest_log') : t('recent_activity')}</h3>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, i) => (
                    isRpgMode ? (
                      <div key={log.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{log.skillTitle}</span>
                          <span className="text-xs font-bold text-slate-300 line-clamp-1">{log.note}</span>
                        </div>
                        <span className={`bg-emerald-600/20 text-emerald-500 text-[8px] font-black px-2 py-1 rounded tracking-widest border border-emerald-900/50`}>[SYNCED]</span>
                      </div>
                    ) : (
                      <div key={log.id} className="border-l-2 border-slate-200 pl-4 py-1 hover:border-indigo-500 transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {log.skillTitle}
                        </div>
                        <div className="text-sm font-bold text-slate-700 line-clamp-1">{log.note}</div>
                      </div>
                    )
                  ))
                ) : (
                  <div className={`py-10 text-center italic text-sm ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isRpgMode ? "No scrolls recovered yet..." : "No recent activity found."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            {isRpgMode ? (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-900/30 border border-amber-700/50 rounded-full mb-4">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{t('character_sheet')}</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-5xl sm:text-6xl font-serif italic mb-2 text-white">
                    {t('level')} {userLevel} <span className="text-cyan-400">{userClass}</span>
                  </h1>
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-700/80 mb-4">
                    Experience: <span className="text-cyan-400">{totalXp} XP</span>
                  </div>
                </div>
                <p className="text-slate-400 font-bold italic text-lg">&ldquo;{userProfile?.displayName || 'Learner'}, {t('skill_collection_growing')}&rdquo;</p>
              </motion.div>
            ) : (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full mb-4">
                  <Target className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('profile_summary')}</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-4xl sm:text-5xl font-serif italic mb-2 text-slate-900">
                    {t('level')} {userLevel} <span className="text-indigo-600">{userClass}</span>
                  </h1>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Score: <span className="text-indigo-600">{totalXp} PTS</span>
                  </div>
                </div>
                <p className="text-slate-500 font-medium">{t('tracking_growth_for')} {userProfile?.displayName || 'Learner'}.</p>
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {!isRpgMode && (
              <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
              </div>
            )}
            <button 
              onClick={() => setShowAddModal(true)} 
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                isRpgMode 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1' 
                  : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" /> {isRpgMode ? t('forge new skill') : t('add new skill')}
            </button>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            {isRpgMode ? <Sword className="text-cyan-400 w-6 h-6" /> : <Shield className="text-indigo-600 w-6 h-6" />}
            <h2 className="text-3xl font-serif italic">{isRpgMode ? t('your_skills') : t('your_learning_paths')}</h2>
          </div>

          {skills.length === 0 ? (
            <div className={`rounded-[3rem] p-20 text-center border-2 border-dashed ${isRpgMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Target className={`w-16 h-16 mx-auto mb-6 ${isRpgMode ? 'text-slate-800' : 'text-slate-200'}`} />
              <h2 className="text-3xl font-serif italic mb-4">{t('no_skills_added')}</h2>
              <button onClick={() => setShowAddModal(true)} className={`mt-6 px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${isRpgMode ? 'bg-cyan-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {t('start_first_path')}
              </button>
            </div>
          ) : (isRpgMode || viewMode === 'grid') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {skills.map((skill) => (
                <motion.div 
                  key={skill.id} 
                  whileHover={{ y: -8 }} 
                  className={`relative rounded-[2.5rem] p-10 border transition-all group overflow-hidden ${
                    isRpgMode 
                      ? 'bg-slate-900 border-slate-800 hover:border-cyan-500' 
                      : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl'
                  }`}
                >
                  {isRpgMode && (
                    <div className="absolute top-0 right-0 p-6">
                      {skill.progress > 80 ? (
                        <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                      ) : skill.progress > 0 ? (
                        <Zap className="text-amber-500 w-6 h-6 animate-pulse" />
                      ) : (
                        <Lock className="text-slate-700 w-6 h-6" />
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isRpgMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRpgMode ? t('progress') : t('completion')}
                    </div>
                    <div className="flex items-center gap-3">
                       <div className={`text-4xl font-black ${isRpgMode ? 'text-cyan-400' : 'text-slate-800'}`}>{skill.progress}%</div>
                       {isRpgMode && (
                         <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                           <div className="h-full bg-cyan-600" style={{ width: `${skill.progress}%` }} />
                         </div>
                       )}
                    </div>
                  </div>

                  <h3 className={`text-2xl font-serif italic mb-10 ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>{skill.title}</h3>
                  
                  <div className="flex gap-2 w-full mt-10">
                    <button 
                      onClick={() => router.push(`/skills/${skill.id}`)} 
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        isRpgMode 
                          ? 'bg-slate-950 text-cyan-400 border border-cyan-900 hover:bg-cyan-900/20' 
                          : 'bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {isRpgMode ? t('view_path') : t('manage_path')} <ChevronRight className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditSkill(skill); }}
                      className={`p-4 rounded-xl transition-all border ${
                        isRpgMode 
                          ? 'bg-slate-950 border-slate-800 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-800' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                      title="Edit Path Title"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                      className={`p-4 rounded-xl transition-all border ${
                        isRpgMode 
                          ? 'bg-slate-955 border-slate-800 text-red-500 hover:bg-red-950/20 hover:border-red-900' 
                          : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                      }`}
                      title="Delete Path"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-slate-900">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-10 py-6">{t('skill_name')}</th>
                    <th className="px-10 py-6">{t('level')}</th>
                    <th className="px-10 py-6">{t('progress')}</th>
                    <th className="px-10 py-6 text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {skills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8">
                        <div className="font-bold text-slate-800">{skill.title}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          skill.progress > 75 ? 'bg-emerald-50 text-emerald-600' :
                          skill.progress > 40 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                        }`}>
                          {skill.progress > 75 ? t('advanced') : skill.progress > 40 ? t('intermediate') : t('beginner')}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4 w-48">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900" style={{ width: `${skill.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{skill.progress}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => router.push(`/skills/${skill.id}`)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest">
                            {t('manage_path')}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEditSkill(skill); }}
                            className="p-1.5 rounded bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                            className="p-1.5 rounded bg-red-50 border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }} 
               className={`w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative transition-colors ${
                 isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
               }`}
             >
               <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-colors">
                 <LogOut className={`w-5 h-5 ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`} />
               </button>
               <h2 className={`text-4xl font-serif italic mb-2 ${isRpgMode ? 'text-white' : 'text-slate-900'}`}>
                 {isRpgMode ? t('forge_new_path') : t('new_learning_path')}
               </h2>
               <form onSubmit={handleAddSkill} className="space-y-8 mt-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {isRpgMode ? t('discipline_name') : t('skill_discipline_name')}
                      </label>
                      <input 
                        required 
                        className={`w-full p-6 rounded-2xl font-bold text-xl focus:outline-none transition-all ${
                          isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500'
                        }`} 
                        placeholder="e.g. Quantum Computing" 
                        value={newSkill.title} 
                        onChange={e => setNewSkill({...newSkill, title: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('target_duration')}</label>
                      <input 
                        required 
                        type="number" 
                        className={`w-full p-6 rounded-2xl font-bold text-xl focus:outline-none transition-all ${
                          isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500'
                        }`} 
                        value={newSkill.targetDuration} 
                        onChange={e => setNewSkill({...newSkill, targetDuration: parseInt(e.target.value)})} 
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('time_unit')}</label>
                      <select 
                        className={`w-full p-6 rounded-2xl font-bold text-lg focus:outline-none cursor-pointer transition-all ${
                          isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 appearance-none'
                        }`} 
                        value={newSkill.targetUnit} 
                        onChange={e => setNewSkill({...newSkill, targetUnit: e.target.value})}
                      >
                        <option value="days">{t('days')}</option>
                        <option value="weeks">{t('weeks')}</option>
                        <option value="months">{t('months')}</option>
                      </select>
                    </div>
                 </div>
                 <div className="pt-6 flex gap-6">
                   <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-colors ${isRpgMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>{t('cancel')}</button>
                   <button 
                    type="submit" 
                    className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isRpgMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl'
                    }`}
                   >
                     {isRpgMode ? t('activate_grid') : t('launch_path')}
                   </button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}

        {showEditModal && editingSkill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }} 
               className={`w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative transition-colors ${
                 isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
               }`}
             >
               <button onClick={() => { setShowEditModal(false); setEditingSkill(null); }} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-colors">
                 <LogOut className={`w-5 h-5 ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`} />
               </button>
               <h2 className={`text-4xl font-serif italic mb-2 ${isRpgMode ? 'text-white' : 'text-slate-900'}`}>
                 Edit Skill Path
               </h2>
               <form onSubmit={handleSaveEditSkill} className="space-y-8 mt-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                       <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                         Skill / Discipline Name
                       </label>
                       <input 
                         required 
                         className={`w-full p-6 rounded-2xl font-bold text-xl focus:outline-none transition-all ${
                           isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500'
                         }`} 
                         placeholder="e.g. Quantum Computing" 
                         value={editingSkillTitle} 
                         onChange={e => setEditingSkillTitle(e.target.value)} 
                       />
                    </div>
                    <div>
                      <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('target_duration')}</label>
                      <input 
                        required 
                        type="number" 
                        className={`w-full p-6 rounded-2xl font-bold text-xl focus:outline-none transition-all ${
                          isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500'
                        }`} 
                        value={editingSkillDuration} 
                        onChange={e => setEditingSkillDuration(parseInt(e.target.value) || 3)} 
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('time_unit')}</label>
                      <select 
                        className={`w-full p-6 rounded-2xl font-bold text-lg focus:outline-none cursor-pointer transition-all ${
                          isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 appearance-none'
                        }`} 
                        value={editingSkillUnit} 
                        onChange={e => setEditingSkillUnit(e.target.value)}
                      >
                        <option value="days">{t('days')}</option>
                        <option value="weeks">{t('weeks')}</option>
                        <option value="months">{t('months')}</option>
                      </select>
                    </div>
                 </div>
                 <div className="pt-6 flex gap-6">
                   <button type="button" onClick={() => { setShowEditModal(false); setEditingSkill(null); }} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-colors ${isRpgMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>{t('cancel')}</button>
                   <button 
                    type="submit" 
                    className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isRpgMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl'
                    }`}
                   >
                     Save Changes
                   </button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }} 
               className={`w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative transition-colors ${
                 isRpgMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-900'
               }`}
             >
               <button 
                 onClick={() => setConfirmDelete(null)} 
                 className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                   isRpgMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                 }`}
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col items-center text-center mt-4">
                 <div className={`p-4 rounded-full mb-6 ${
                   isRpgMode ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-500 border border-red-100'
                 }`}>
                   <Trash2 className="w-8 h-8" />
                 </div>
                 
                 <h3 className="text-2xl font-serif italic mb-3">
                   {t('confirm_delete') || 'Delete Item?'}
                 </h3>
                 <p className={`text-sm mb-8 ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
                   {confirmDelete.message}
                 </p>
                 
                 <div className="flex gap-4 w-full">
                   <button 
                     type="button" 
                     onClick={() => setConfirmDelete(null)} 
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-colors ${
                       isRpgMode 
                         ? 'border-slate-800 text-slate-400 hover:bg-slate-800' 
                         : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                     }`}
                   >
                     {t('cancel') || 'Cancel'}
                   </button>
                   <button 
                     type="button" 
                     onClick={() => {
                       confirmDelete.action();
                       setConfirmDelete(null);
                     }}
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl text-white transition-colors bg-red-600 hover:bg-red-500 shadow-md`}
                   >
                     {t('delete') || 'Delete'}
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
