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
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const skillsQ = query(collection(db, 'skills'), where('userId', '==', user.uid));


    console.log('skillsq', skillsQ)
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

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!user || !newSkill.title.trim()) return;

   console.log('user id',user?.uid)
    
    try {
      const skillPayload = {
        userId: user?.uid,
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
      const res = await addDoc(collection(db, 'skills'), skillPayload);
      console.log('res', res)
      // setShowAddModal(false);
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

  const chartData = (skills || []).map(s => ({
    subject: s.title ? s.title.slice(0, 10) : 'Skill',
    A: s.progress || 0,
    fullMark: 100,
  }));

  return (
    <DashboardLayout>
      <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} p-4 sm:p-8 md:p-12 relative overflow-hidden`}>
        {/* Structural Decoration matching landing page */}
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

        {loading || authLoading ? (
          /* SKELETON UI */
          <div className="relative z-10 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className={`lg:col-span-2 h-72 border transition-all ${isRpgMode ? 'bg-slate-900 border-emerald-500/10 rounded-none' : 'bg-white border-slate-100 rounded-[2.5rem] shadow-sm'}`} />
              <div className={`h-72 border transition-all ${isRpgMode ? 'bg-slate-900 border-emerald-500/10 rounded-none' : 'bg-white border-slate-100 rounded-[2.5rem] shadow-sm'}`} />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
              <div className="space-y-4">
                <div className={`h-12 w-64 ${isRpgMode ? 'bg-slate-900 rounded-none' : 'bg-slate-200 rounded-xl'}`} />
                <div className={`h-4 w-48 ${isRpgMode ? 'bg-slate-900 rounded-none' : 'bg-slate-100 rounded-lg'}`} />
              </div>
              <div className={`h-16 w-56 ${isRpgMode ? 'bg-slate-900 rounded-none' : 'bg-slate-200 rounded-2xl'}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-80 border ${isRpgMode ? 'bg-slate-900/30 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
              ))}
            </div>
          </div>
        ) : (
          /* ACTUAL CONTENT */
          <div className="relative z-10">
            {/* Top Stats & Radar Section */}
            {skills.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className={`lg:col-span-2 rounded-[2.5rem] p-8 border transition-all ${theme.card} flex flex-col md:flex-row items-center gap-10`}>
                  <div className="flex-1 w-full text-center md:text-left">
                    <h3 className={`text-2xl mb-6 ${theme.heading}`}>{isRpgMode ? t('skill_matrix') : t('skill_radar')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-6 border transition-all ${isRpgMode ? 'bg-slate-950 border-slate-800 rounded-none' : 'bg-slate-50 border-transparent rounded-[2rem]'}`}>
                        <div className={`text-[10px] uppercase font-black mb-2 tracking-widest ${theme.muted}`}>{isRpgMode ? t('active_quests') : t('total_paths')}</div>
                        <div className={`text-4xl font-black ${theme.text}`}>{skills.length}</div>
                      </div>
                      <div className={`p-6 border transition-all ${isRpgMode ? 'bg-slate-950 border-emerald-950 rounded-none' : 'bg-indigo-50 border-transparent rounded-[2rem]'}`}>
                        <div className={`text-[10px] uppercase font-black mb-2 tracking-widest ${isRpgMode ? 'text-emerald-500/50' : 'text-indigo-400'}`}>
                          {isRpgMode ? 'POWER LEVEL' : 'MASTERY POINTS'}
                        </div>
                        <div className={`text-4xl font-black ${theme.accent}`}>
                          {totalXp} <span className="text-xl opacity-50">{isRpgMode ? 'XP' : 'PTS'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-80 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke={isRpgMode ? "rgba(16,185,129,0.1)" : "#e2e8f0"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: isRpgMode ? '#475569' : '#94a3b8' }} />
                        <Radar
                          dataKey="A"
                          stroke={isRpgMode ? "#10b981" : "#4f46e5"}
                          fill={isRpgMode ? "#10b981" : "#4f46e5"}
                          fillOpacity={isRpgMode ? 0.2 : 0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`rounded-[2.5rem] p-8 border transition-all ${theme.card} flex flex-col ${isRpgMode ? 'rounded-none' : 'rounded-[2.5rem]'}`}>
                  <h3 className={`text-xl mb-8 ${theme.heading}`}>{isRpgMode ? t('quest_log') : t('recent_activity')}</h3>
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <div key={log.id} className={`group transition-all ${isRpgMode ? 'bg-slate-950/50 p-4 border border-slate-800 hover:border-emerald-500/50' : 'border-l-2 border-slate-100 pl-4 py-1 hover:border-indigo-500'}`}>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.muted}`}>
                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {log.skillTitle}
                          </div>
                          <div className={`text-sm font-bold line-clamp-1 ${isRpgMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.note}</div>
                          {isRpgMode && <div className="mt-2 text-[8px] font-black text-emerald-500/30 uppercase tracking-[0.2em]">[ LOG SECURED ]</div>}
                        </div>
                      ))
                    ) : (
                      <div className={`py-10 text-center italic text-sm ${theme.muted}`}>
                        {isRpgMode ? "No scrolls recovered yet..." : "No recent activity found."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile / Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${theme.accentBg} ${theme.accentBorder} border`}>
                  {isRpgMode ? <Shield className="w-3 h-3 text-emerald-400" /> : <Target className="w-3 h-3 text-indigo-600" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme.accent}`}>{isRpgMode ? t('character_sheet') : t('profile_summary')}</span>
                </div>

                <h1 className={`text-4xl sm:text-6xl mb-4 leading-[0.9] tracking-tighter`}>
                  {t('level')} {userLevel} <span className={theme.accent}>{userClass}</span>
                </h1>

                <p className={`text-lg italic ${theme.muted}`}>
                  {isRpgMode
                    ? `“${userProfile?.displayName || t('traveler')}, ${t('rpg_greeting')}”`
                    : `${t('pro_greeting')} ${userProfile?.displayName || t('member')}.`
                  }
                </p>
              </motion.div>

              <div className="flex flex-wrap items-center gap-4">
                {!isRpgMode && (
                  <div className="bg-slate-50 border border-slate-100 p-1 rounded-2xl flex gap-1">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
                  </div>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                >
                  <Plus className="w-4 h-4" /> {isRpgMode ? t('forge_new_path') : t('new_learning_path')}
                </button>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                {isRpgMode ? <Sword className="text-emerald-400 w-6 h-6" /> : <Shield className="text-indigo-600 w-6 h-6" />}
                <h2 className={`text-3xl ${theme.heading}`}>{isRpgMode ? t('your_skills') : t('your_learning_paths')}</h2>
              </div>

              {skills.length === 0 ? (
                <div className={`p-20 text-center border-2 border-dashed ${isRpgMode ? 'bg-slate-900 border-slate-800 rounded-none' : 'bg-slate-50 border-slate-200 rounded-[3rem]'}`}>
                  <Target className={`w-16 h-16 mx-auto mb-6 ${theme.muted} opacity-20`} />
                  <h2 className={`text-3xl mb-4 ${theme.heading}`}>{t('no_skills_added')}</h2>
                  <button onClick={() => setShowAddModal(true)} className={`mt-6 px-10 py-5 font-black text-[10px] uppercase tracking-widest transition-all ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}>
                    {t('start_first_path')}
                  </button>
                </div>
              ) : (isRpgMode || viewMode === 'grid') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      whileHover={{ y: -8 }}
                      className={`relative p-10 border transition-all group overflow-hidden ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[2.5rem]'}`}
                    >
                      <div className="mb-8">
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${theme.muted}`}>
                          {t('progress')}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl font-black ${theme.text}`}>{skill.progress}%</div>
                          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isRpgMode ? 'bg-slate-950 border border-slate-800 rounded-none' : 'bg-slate-100'}`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.progress}%` }}
                              className={`h-full ${isRpgMode ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-900'}`}
                            />
                          </div>
                        </div>
                      </div>

                      <h3 className={`text-2xl mb-12 min-h-[4rem] ${theme.heading}`}>{skill.title}</h3>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/skills/${skill.id}`)}
                          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isRpgMode
                            ? 'bg-slate-950 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-500/10 rounded-none'
                            : 'bg-slate-900 text-white hover:bg-indigo-600 rounded-xl'
                            }`}
                        >
                          {isRpgMode ? 'ENTER PATH' : 'MANAGE PATH'} <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditSkill(skill); }}
                          className={`p-4 transition-all border ${isRpgMode
                            ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 rounded-none'
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-xl'
                            }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                          className={`p-4 transition-all border ${isRpgMode
                            ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/50 rounded-none'
                            : 'bg-red-50 border-red-100 text-red-400 hover:bg-white rounded-xl'
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-[2.5rem] border overflow-hidden ${theme.card}`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-[10px] uppercase font-black tracking-widest border-b ${isRpgMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <th className="px-10 py-6">{t('skill_name')}</th>
                        <th className="px-10 py-6">{t('level')}</th>
                        <th className="px-10 py-6">{t('progress')}</th>
                        <th className="px-10 py-6 text-right">{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isRpgMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                      {skills.map((skill) => (
                        <tr key={skill.id} className="group hover:bg-emerald-500/5 transition-colors">
                          <td className="px-10 py-8">
                            <div className={`font-bold ${theme.text}`}>{skill.title}</div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest ${skill.progress > 75 ? 'bg-emerald-500/10 text-emerald-500' :
                              skill.progress > 40 ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-400'
                              }`}>
                              {skill.progress > 75 ? t('advanced') : skill.progress > 40 ? t('intermediate') : t('beginner')}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4 w-48">
                              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isRpgMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <div className={`h-full ${isRpgMode ? 'bg-emerald-500' : 'bg-slate-900'}`} style={{ width: `${skill.progress}%` }} />
                              </div>
                              <span className={`text-[10px] font-black ${theme.muted}`}>{skill.progress}%</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => router.push(`/skills/${skill.id}`)} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${theme.accent}`}>
                                {isRpgMode ? 'ENTER' : 'MANAGE'}
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
        )}

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl p-12 relative transition-all border overflow-hidden ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}
              >
                {/* Modal Decoration */}
                {isRpgMode && (
                  <>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                  </>
                )}

                <button onClick={() => setShowAddModal(false)} className={`absolute top-8 right-8 p-3 rounded-full transition-colors z-10 ${isRpgMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}>
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                  <h2 className={`text-4xl mb-2 ${theme.heading} ${theme.text}`}>
                    {isRpgMode ? 'FORGE NEW PATH' : 'New Learning Path'}
                  </h2>
                  <p className={`text-sm mb-10 ${theme.muted}`}>
                    {isRpgMode ? 'Initialize a new discipline for mastery.' : 'Set the foundation for your next professional goal.'}
                  </p>

                  <form onSubmit={handleAddSkill} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>
                          {isRpgMode ? 'Discipline Name' : 'Skill Name'}
                        </label>
                        <input
                          required
                          className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                          placeholder="e.g. Quantum Computing"
                          value={newSkill.title}
                          onChange={e => setNewSkill({ ...newSkill, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('target_duration')}</label>
                        <input
                          required
                          type="number"
                          className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                          value={newSkill.targetDuration}
                          onChange={e => setNewSkill({ ...newSkill, targetDuration: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('time_unit')}</label>
                        <select
                          className={`w-full p-6 font-bold text-lg focus:outline-none cursor-pointer transition-all border appearance-none ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                          value={newSkill.targetUnit}
                          onChange={e => setNewSkill({ ...newSkill, targetUnit: e.target.value })}
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
                        className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                      >
                        {isRpgMode ? 'ACTIVATE' : 'Create Path'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showEditModal && editingSkill && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl p-12 relative transition-all border overflow-hidden ${theme.card} ${isRpgMode ? 'rounded-none' : 'rounded-[3rem]'}`}
              >
                {isRpgMode && (
                  <>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                  </>
                )}

                <button onClick={() => { setShowEditModal(false); setEditingSkill(null); }} className={`absolute top-8 right-8 p-3 rounded-full transition-colors z-10 ${isRpgMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}>
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                  <h2 className={`text-4xl mb-2 ${theme.heading} ${theme.text}`}>
                    {isRpgMode ? 'MODIFY PATH' : 'Edit Skill Path'}
                  </h2>
                  <form onSubmit={handleSaveEditSkill} className="space-y-8 mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>
                          {isRpgMode ? 'Discipline Title' : 'Skill Title'}
                        </label>
                        <input
                          required
                          className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                          placeholder="e.g. Quantum Computing"
                          value={editingSkillTitle}
                          onChange={e => setEditingSkillTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('target_duration')}</label>
                        <input
                          required
                          type="number"
                          className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                          value={editingSkillDuration}
                          onChange={e => setEditingSkillDuration(parseInt(e.target.value) || 3)}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('time_unit')}</label>
                        <select
                          className={`w-full p-6 font-bold text-lg focus:outline-none cursor-pointer transition-all border appearance-none ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
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
                        className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${theme.button} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`}
                      >
                        {isRpgMode ? 'SAVE CHANGES' : 'Update Path'}
                      </button>
                    </div>
                  </form>
                </div>
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
                className={`w-full max-w-md p-10 shadow-2xl relative transition-all border ${isRpgMode ? 'bg-slate-900 border border-slate-800 text-white rounded-none' : 'bg-white text-slate-900 rounded-[2.5rem]'
                  }`}
              >
                <button
                  onClick={() => setConfirmDelete(null)}
                  className={`absolute top-6 right-6 p-2 transition-colors ${isRpgMode ? 'hover:bg-slate-800 text-slate-400 rounded-none' : 'hover:bg-slate-100 text-slate-400 rounded-full'
                    }`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                  <div className={`p-4 mb-6 border ${isRpgMode ? 'bg-red-900/40 text-red-400 border-red-900/50 rounded-none' : 'bg-red-50 text-red-500 border border-red-100 rounded-full'
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
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border transition-colors ${isRpgMode
                        ? 'border-slate-800 text-slate-400 hover:bg-slate-800 rounded-none'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl'
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
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors bg-red-600 hover:bg-red-500 shadow-md ${isRpgMode ? 'rounded-none' : 'rounded-xl'
                        }`}
                    >
                      {t('delete') || 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
