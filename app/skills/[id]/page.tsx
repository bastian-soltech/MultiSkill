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
  serverTimestamp,
  deleteDoc
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
  BarChart3,
  Shield,
  Sword,
  Scroll,
  Lock,
  Box,
  Compass,
  Trophy,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { useMode } from '@/lib/ModeContext';
import { useLanguage } from '@/lib/LanguageContext';

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

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  createdAt: number;
}

interface Skill {
  id: string;
  userId?: string;
  userName?: string;
  title: string;
  progress: number;
  targetDuration: number;
  targetUnit: string;
  roadmap: PathSegment[];
  attendance?: string[]; 
  isPublic?: boolean;
  projects?: Project[];
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
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLog, setNewLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [newStep, setNewStep] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLink, setNewProjectLink] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Edit and Delete state variables
  const [showEditSkillModal, setShowEditSkillModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    message: string;
    action: () => void;
  } | null>(null);
  const [editSkillTitle, setEditSkillTitle] = useState('');
  const [editSkillDuration, setEditSkillDuration] = useState(3);
  const [editSkillUnit, setEditSkillUnit] = useState('months');
  const [editSkillIsPublic, setEditSkillIsPublic] = useState(true);

  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingPathTitle, setEditingPathTitle] = useState('');

  const [editingSubPathId, setEditingSubPathId] = useState<string | null>(null);
  const [editingSubPathTitle, setEditingSubPathTitle] = useState('');
  const [editingSubPathParentId, setEditingSubPathParentId] = useState<string | null>(null);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectDesc, setEditingProjectDesc] = useState('');
  const [editingProjectLink, setEditingProjectLink] = useState('');

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
    if (!id || !user) return;

    const unsubSkill = onSnapshot(doc(db, 'skills', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSkill({ 
          id: snapshot.id, 
          userId: data.userId,
          userName: data.userName,
          title: data.title,
          progress: data.progress,
          targetDuration: data.targetDuration,
          targetUnit: data.targetUnit,
          roadmap: data.roadmap || [],
          attendance: data.attendance || [],
          isPublic: data.isPublic,
          projects: (data.projects || []).map((p: any) => {
            let pCreatedAt = Date.now();
            if (p.createdAt) {
              if (typeof p.createdAt.toMillis === 'function') {
                pCreatedAt = p.createdAt.toMillis();
              } else if (p.createdAt.seconds) {
                pCreatedAt = p.createdAt.seconds * 1000;
              } else if (typeof p.createdAt === 'number') {
                pCreatedAt = p.createdAt;
              }
            }
            return {
              ...p,
              createdAt: pCreatedAt
            };
          })
        });
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    });

    const logsQuery = query(collection(db, 'logs'), where('skillId', '==', id));
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = new Date().toISOString();
        if (data.date) {
          if (typeof data.date === 'string') dateStr = data.date;
          else if (data.date.toDate) dateStr = data.date.toDate().toISOString();
          else if (data.date.seconds) dateStr = new Date(data.date.seconds * 1000).toISOString();
        }
        return { 
          id: doc.id, 
          ...data,
          date: dateStr
        } as Log;
      }));
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

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !newProjectName.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc,
      link: newProjectLink,
      createdAt: Date.now(),
    };

    const updatedProjects = [...(skill.projects || []), project];
    try {
      await updateDoc(doc(db, 'skills', id), {
        projects: updatedProjects,
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectLink('');
      setIsAddingProject(false);
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  // Edit and Delete handlers for Skill, Roadmap Segments, Subpaths & Projects
  const handleOpenEditSkill = () => {
    if (!skill) return;
    setEditSkillTitle(skill.title);
    setEditSkillDuration(skill.targetDuration);
    setEditSkillUnit(skill.targetUnit);
    setEditSkillIsPublic(skill.isPublic ?? true);
    setShowEditSkillModal(true);
  };

  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !editSkillTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'skills', id), {
        title: editSkillTitle,
        targetDuration: Number(editSkillDuration),
        targetUnit: editSkillUnit,
        isPublic: editSkillIsPublic
      });
      setShowEditSkillModal(false);
    } catch (err) {
      console.error('Error updating skill:', err);
    }
  };

  const handleDeleteSkill = async () => {
    if (!skill) return;
    setConfirmDelete({
      message: t('confirm_delete_skill') || 'Are you sure you want to delete this skill path? This cannot be undone.',
      action: async () => {
        try {
          await deleteDoc(doc(db, 'skills', id));
          router.push('/dashboard');
        } catch (err) {
          console.error('Error deleting skill:', err);
        }
      }
    });
  };

  const handleStartEditPath = (pathId: string, title: string) => {
    setEditingPathId(pathId);
    setEditingPathTitle(title);
  };

  const handleSavePathTitle = async (pathId: string) => {
    if (!skill || !editingPathTitle.trim() || !isOwner) return;
    const newRoadmap = skill.roadmap.map(p => {
      if (p.id === pathId) {
        return { ...p, title: editingPathTitle };
      }
      return p;
    });
    try {
      await updateDoc(doc(db, 'skills', id), { roadmap: newRoadmap });
      setEditingPathId(null);
    } catch (err) {
      console.error('Error updating path segment:', err);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!skill || !isOwner) return;
    setConfirmDelete({
      message: 'Are you sure you want to delete this step? All sub-quests under it will also be deleted.',
      action: async () => {
        const newRoadmap = skill.roadmap.filter(p => p.id !== pathId);
        try {
          await updateDoc(doc(db, 'skills', id), { 
            roadmap: newRoadmap,
            progress: calculateProgress(newRoadmap)
          });
        } catch (err) {
          console.error('Error deleting path segment:', err);
        }
      }
    });
  };

  const handleStartEditSubPath = (parentId: string, subId: string, task: string) => {
    setEditingSubPathParentId(parentId);
    setEditingSubPathId(subId);
    setEditingSubPathTitle(task);
  };

  const handleSaveSubPathTitle = async () => {
    if (!skill || !editingSubPathParentId || !editingSubPathId || !editingSubPathTitle.trim() || !isOwner) return;
    const newRoadmap = skill.roadmap.map(p => {
      if (p.id === editingSubPathParentId) {
        const newSubpaths = p.subpaths.map(s => {
          if (s.id === editingSubPathId) {
            return { ...s, task: editingSubPathTitle };
          }
          return s;
        });
        return { ...p, subpaths: newSubpaths };
      }
      return p;
    });
    try {
      await updateDoc(doc(db, 'skills', id), { roadmap: newRoadmap });
      setEditingSubPathId(null);
      setEditingSubPathParentId(null);
    } catch (err) {
      console.error('Error updating sub-task title:', err);
    }
  };

  const handleDeleteSubPath = async (parentId: string, subId: string) => {
    if (!skill || !isOwner) return;
    setConfirmDelete({
      message: 'Are you sure you want to delete this task?',
      action: async () => {
        const newRoadmap = skill.roadmap.map(p => {
          if (p.id === parentId) {
            const newSubpaths = p.subpaths.filter(s => s.id !== subId);
            // Recalculate parent completion based on remaining subpaths
            const allCompleted = newSubpaths.length > 0 ? newSubpaths.every(s => s.completed) : p.completed;
            return { ...p, subpaths: newSubpaths, completed: allCompleted };
          }
          return p;
        });
        try {
          await updateDoc(doc(db, 'skills', id), { 
            roadmap: newRoadmap,
            progress: calculateProgress(newRoadmap)
          });
        } catch (err) {
          console.error('Error deleting subtask:', err);
        }
      }
    });
  };

  const handleStartEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setEditingProjectName(p.name);
    setEditingProjectDesc(p.description);
    setEditingProjectLink(p.link || '');
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !editingProjectId || !editingProjectName.trim()) return;
    const updatedProjects = (skill.projects || []).map(p => {
      if (p.id === editingProjectId) {
        return {
          ...p,
          name: editingProjectName,
          description: editingProjectDesc,
          link: editingProjectLink,
        };
      }
      return p;
    });
    try {
      await updateDoc(doc(db, 'skills', id), { projects: updatedProjects });
      setEditingProjectId(null);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!skill) return;
    setConfirmDelete({
      message: 'Are you sure you want to delete this project?',
      action: async () => {
        const updatedProjects = (skill.projects || []).filter(p => p.id !== projectId);
        try {
          await updateDoc(doc(db, 'skills', id), { projects: updatedProjects });
        } catch (err) {
          console.error('Error deleting project:', err);
        }
      }
    });
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

  return (
    <DashboardLayout>
      <div className={`min-h-screen relative transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} selection:bg-emerald-500/30`}>
        
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
          <div className="relative z-10 animate-pulse p-4 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
              <div className="flex items-center gap-6 w-full">
                <div className={`w-10 h-10 rounded-full ${isRpgMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                <div className="space-y-3">
                  <div className={`h-8 w-64 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-200'} rounded-xl`} />
                  <div className={`h-4 w-32 ${isRpgMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-lg`} />
                </div>
              </div>
              <div className={`h-14 w-48 ${isRpgMode ? 'bg-slate-900 rounded-none' : 'bg-slate-200 rounded-2xl'}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <div className={`h-[500px] border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
                <div className={`h-64 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
              </div>
              <div className="space-y-12">
                <div className={`h-72 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
                <div className={`h-96 border ${isRpgMode ? 'bg-slate-900/50 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem] shadow-sm'}`} />
              </div>
            </div>
          </div>
        ) : !skill ? null : (
          /* ACTUAL CONTENT */
          <div className="relative z-10">
            <header className={`h-auto min-h-[6rem] border-b flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 py-4 sticky top-0 z-50 gap-4 transition-colors ${
              isRpgMode ? 'bg-slate-950 border-slate-800 shadow-[0px_4px_20px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                <Link href="/dashboard" className={`p-2 transition-colors flex-shrink-0 ${
                  isRpgMode ? 'hover:bg-slate-900 text-slate-400 hover:text-emerald-400 rounded-none' : 'hover:bg-slate-50 text-slate-400 rounded-full'
                }`}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className={`font-serif italic text-xl sm:text-2xl leading-none mb-1 truncate ${isRpgMode ? 'text-emerald-400 font-mono font-black uppercase' : 'text-slate-800'}`}>{skill.title}</h2>
                    {isOwner && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={handleOpenEditSkill}
                          className={`p-1.5 border transition-colors ${
                            isRpgMode
                              ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-800 rounded-none'
                              : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 rounded-lg'
                          }`}
                          title="Edit Skill"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleDeleteSkill}
                          className={`p-1.5 border transition-colors ${
                            isRpgMode
                              ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-red-950/20 hover:border-red-900 rounded-none'
                              : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 rounded-lg'
                          }`}
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {!isOwner && (
                    <span className={`${
                      isRpgMode 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-none' 
                        : 'bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-lg'
                    } text-[10px] font-black uppercase px-2 py-0.5 tracking-widest whitespace-nowrap`}>
                      Public Roadmap
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                {isOwner ? (
                   <button 
                     onClick={handleCheckIn}
                     className={`flex-1 md:flex-none px-6 sm:px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                       hasStudiedToday 
                       ? (isRpgMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800 shadow-xl shadow-slate-950 rounded-none' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xl shadow-slate-200 rounded-xl') 
                       : (isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 rounded-none shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100 rounded-xl')
                     }`}
                   >
                     {hasStudiedToday ? (isRpgMode ? '[QUEST COMPLETE]' : 'Check-in Complete') : (isRpgMode ? '[PRACTICE MANA]' : 'Learned Today?')}
                   </button>
                 ) : (
                   <button 
                     onClick={handleAdopt}
                     disabled={isSubmitting}
                     className={`flex-1 md:flex-none px-6 sm:px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                       isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] rounded-none' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100 rounded-xl'
                     }`}
                   >
                     {isSubmitting ? 'Adopting...' : 'Adopt This Roadmap'}
                   </button>
                 )}
              </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
              <div className="lg:col-span-2 space-y-16">
                {/* Path section */}
                <section className={`p-6 sm:p-12 border transition-colors ${
                  isRpgMode ? 'bg-slate-900/50 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] rounded-none' : 'bg-white border-slate-100 shadow-sm rounded-[3rem]'
                }`}>
                  <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
                    {isRpgMode ? <Compass className="w-24 h-24 sm:w-40 sm:h-40 text-emerald-400" /> : <Zap className="w-24 h-24 sm:w-40 sm:h-40 text-indigo-600" />}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-12 sm:mb-16 gap-4">
                    <div>
                      <h3 className={`text-3xl sm:text-4xl font-serif italic mb-3 ${isRpgMode ? 'text-white font-mono font-black uppercase' : 'text-slate-800'}`}>
                        {isRpgMode ? t('skill_roadmap') : t('learning_path')}
                      </h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t('goal')}: {skill.targetDuration} {t(skill.targetUnit)}
                      </p>
                    </div>
                    <div className={`text-5xl sm:text-6xl font-black tracking-tighter self-end sm:self-auto ${isRpgMode ? 'text-emerald-400' : 'text-indigo-600'}`}>
                      {skill.progress}%
                    </div>
                  </div>

                  <div className="space-y-12 relative">
                    {isRpgMode ? (
                      <div className="absolute left-[27px] sm:left-[31px] top-10 bottom-10 w-0.5 bg-slate-800" />
                    ) : (
                      <div className="absolute left-[27px] sm:left-[31px] top-10 bottom-10 w-0.5 bg-slate-100" />
                    )}
                    
                    {skill.roadmap.map((path, idx) => (
                      <div key={path.id} className="relative z-10 space-y-6">
                        <div 
                          onClick={() => isOwner && editingPathId !== path.id && togglePath(path.id)} 
                          className={`flex gap-4 sm:gap-6 items-center p-4 sm:p-7 border transition-all ${
                            isOwner && editingPathId !== path.id ? 'hover:scale-[1.01] cursor-pointer shadow-sm' : 'opacity-80'
                          } ${
                            isRpgMode 
                              ? (path.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 rounded-none' : 'bg-slate-950 border-slate-800 text-slate-400 rounded-none') 
                              : (path.completed ? 'bg-indigo-50/30 border-indigo-100 text-indigo-900 rounded-[2rem]' : 'bg-white border-slate-100 text-slate-800 rounded-[2rem]')
                          }`}
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            path.completed 
                              ? (isRpgMode ? 'bg-emerald-500 border-emerald-500 rounded-none' : 'bg-indigo-600 border-indigo-600 rounded-xl') 
                              : (isRpgMode ? 'border-slate-800 bg-slate-900 rounded-none' : 'border-slate-200 bg-white rounded-xl')
                          }`}>
                            {path.completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : (isRpgMode && <Lock className="w-4 h-4 text-slate-700" />)}
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {editingPathId === path.id ? (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex-1 flex items-center gap-2"
                              >
                                <input 
                                  type="text" 
                                  className={`w-full p-2 text-base focus:outline-none focus:ring-2 ${
                                    isRpgMode ? 'bg-slate-900 text-white border border-slate-700 focus:ring-emerald-500 rounded-none' : 'bg-slate-100 border border-slate-200 focus:ring-indigo-500 rounded-xl'
                                  }`}
                                  value={editingPathTitle} 
                                  onChange={(e) => setEditingPathTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSavePathTitle(path.id);
                                    }
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e?.stopPropagation();
                                    e?.preventDefault();
                                    handleSavePathTitle(path.id);
                                  }} 
                                  className={`p-2.5 flex-shrink-0 cursor-pointer text-white ${
                                    isRpgMode ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-none' : 'bg-indigo-600 hover:bg-indigo-500 rounded-xl'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e?.stopPropagation();
                                    e?.preventDefault();
                                    setEditingPathId(null);
                                  }} 
                                  className={`p-2.5 flex-shrink-0 cursor-pointer bg-slate-500 hover:bg-slate-400 text-white ${
                                    isRpgMode ? 'rounded-none' : 'rounded-xl'
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${path.completed ? 'opacity-50' : 'opacity-30'}`}>
                                    {isRpgMode ? `Milestone 0${idx + 1}` : 'Module'}
                                  </div>
                                  <span className={`text-lg sm:text-2xl font-serif italic transition-all ${
                                    isRpgMode ? 'font-mono not-italic uppercase font-bold text-lg sm:text-xl' : ''
                                  } ${path.completed ? 'line-through opacity-60' : ''}`}>
                                    {path.title}
                                  </span>
                                </div>
                                {isOwner && (
                                  <div className="flex gap-2 self-start sm:self-center" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      onClick={() => handleStartEditPath(path.id, path.title)} 
                                      className={`p-2 border transition-colors ${
                                        isRpgMode 
                                          ? 'bg-slate-950 border-slate-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-800 rounded-none' 
                                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 rounded-xl'
                                      }`}
                                      title="Edit Title"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePath(path.id)} 
                                      className={`p-2 border transition-colors ${
                                        isRpgMode 
                                          ? 'bg-slate-950 border-slate-800 text-red-400 hover:bg-red-950/20 hover:border-red-900 rounded-none' 
                                          : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 rounded-xl'
                                      }`}
                                      title="Delete Milestone"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Subpaths / Tasks */}
                        <div className="pl-12 sm:pl-16 space-y-3">
                          {path.subpaths.map((sub) => (
                            <div 
                              key={sub.id} 
                              onClick={(e) => { e.stopPropagation(); isOwner && editingSubPathId !== sub.id && toggleSubPath(path.id, sub.id); }}
                              className={`flex gap-3 sm:gap-5 items-center p-4 sm:p-5 border rounded-2xl transition-all ${
                                isOwner && editingSubPathId !== sub.id ? 'hover:bg-opacity-80 cursor-pointer' : ''
                              } ${
                                isRpgMode 
                                  ? (sub.completed ? 'bg-emerald-900/10 border-emerald-900/50 text-emerald-400 rounded-none' : 'bg-slate-900/50 border-slate-800 text-slate-500 rounded-none') 
                                  : (sub.completed ? 'bg-slate-50 border-slate-200 text-slate-600 rounded-xl' : 'bg-white border-slate-100 text-slate-500 rounded-xl')
                              }`}
                            >
                              {editingSubPathId === sub.id ? (
                                <div 
                                  onClick={e => e.stopPropagation()} 
                                  className="flex-1 flex items-center gap-2"
                                >
                                  <input 
                                    type="text" 
                                    className={`flex-1 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 ${
                                      isRpgMode ? 'bg-slate-800 text-white border border-slate-700 focus:ring-emerald-500 rounded-none' : 'bg-slate-50 border border-slate-200 focus:ring-indigo-500 rounded-xl'
                                    }`}
                                    value={editingSubPathTitle} 
                                    onChange={(e) => setEditingSubPathTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveSubPathTitle();
                                      }
                                    }}
                                  />
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e?.stopPropagation();
                                      e?.preventDefault();
                                      handleSaveSubPathTitle();
                                    }} 
                                    className={`p-1.5 cursor-pointer text-white ${
                                      isRpgMode ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-none' : 'bg-emerald-600 hover:bg-emerald-500 rounded-lg'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e?.stopPropagation();
                                      e?.preventDefault();
                                      setEditingSubPathId(null); 
                                      setEditingSubPathParentId(null);
                                    }} 
                                    className={`p-1.5 cursor-pointer bg-slate-500 hover:bg-slate-400 text-white ${
                                      isRpgMode ? 'rounded-none' : 'rounded-lg'
                                    }`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    sub.completed 
                                      ? (isRpgMode ? 'bg-emerald-500 border-emerald-500 rounded-none' : 'bg-slate-900 border-slate-900 rounded-lg') 
                                      : (isRpgMode ? 'border-slate-800 rounded-none' : 'border-slate-200 rounded-lg')
                                  }`}>
                                    {sub.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                  <span className={`text-sm font-bold flex-1 ${sub.completed ? 'line-through opacity-50' : ''}`}>
                                    {sub.task}
                                  </span>
                                  {isOwner && (
                                    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                                      <button 
                                        onClick={() => handleStartEditSubPath(path.id, sub.id, sub.task)} 
                                        className={`p-1.5 transition-colors ${
                                          isRpgMode ? 'hover:bg-slate-800 rounded-none text-slate-400 hover:text-emerald-400' : 'hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600'
                                        }`}
                                        title="Edit Task"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSubPath(path.id, sub.id)} 
                                        className={`p-1.5 transition-colors ${
                                          isRpgMode ? 'hover:bg-slate-800 rounded-none text-red-400 hover:text-red-500' : 'hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500'
                                        }`}
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                          
                          {isOwner && (
                            <div className="flex gap-2 pt-2">
                              <input 
                                type="text"
                                placeholder={isRpgMode ? "Add sub-quest..." : "Add task..."}
                                className={`flex-1 px-4 py-3 text-xs focus:outline-none transition-all ${
                                  isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-1 focus:ring-emerald-500 rounded-none' : 'bg-slate-100 border border-slate-200 focus:ring-1 focus:ring-indigo-400 rounded-xl'
                                }`}
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
                        className="flex flex-col sm:flex-row gap-4 pt-12"
                      >
                        <input 
                          className={`flex-1 p-6 font-bold text-lg focus:outline-none transition-all ${
                            isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-100 italic focus:ring-2 focus:ring-indigo-500 shadow-sm rounded-[2rem]'
                          }`}
                          placeholder={isRpgMode ? "Add new step..." : "Add new step..."} 
                          value={newStep}
                          onChange={(e) => setNewStep(e.target.value)}
                        />
                        <button type="submit" className={`px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-none shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white hover:bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100'
                        }`}>
                          {isRpgMode ? t('add_step') : t('add_step')}
                        </button>
                      </form>
                    )}
                  </div>
                </section>

                {/* Logs section */}
                {isOwner && (
                  <div className="space-y-16">
                     <section className="space-y-8">
                      <div className="flex items-center gap-4 mb-4">
                        {isRpgMode ? <Scroll className="text-emerald-400 w-6 h-6" /> : <MessageSquare className="text-indigo-600 w-6 h-6" />}
                        <h3 className={`text-3xl font-serif italic ${isRpgMode ? 'text-white font-mono font-black uppercase' : 'text-slate-800'}`}>
                          {isRpgMode ? t('study_logs') : t('learning_logs')}
                        </h3>
                      </div>
                      
                      <form onSubmit={handleAddLog} className="space-y-6">
                        <textarea 
                          className={`w-full p-8 min-h-[200px] text-lg font-bold italic focus:outline-none transition-all shadow-sm ${
                            isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500 rounded-[3rem]'
                          }`}
                          placeholder={isRpgMode ? "What did you learn today?" : "Record your progress for today..."} 
                          value={newLog} 
                          onChange={e=>setNewLog(e.target.value)} 
                        />
                        <button 
                          disabled={isSubmitting}
                          className={`px-12 py-5 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all ${
                            isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-none shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white hover:bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100'
                          }`}
                        >
                          {isSubmitting ? 'Saving...' : (isRpgMode ? t('save_log') : t('save_note'))}
                        </button>
                      </form>

                      <div className="space-y-6 pt-10">
                          {logs.length === 0 ? (
                            <div className={`p-12 border border-dashed text-center italic ${isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-600 rounded-none' : 'bg-white border-slate-200 text-slate-400 rounded-[3rem]'}`}>
                              No entries yet. Documentation leads to mastery.
                            </div>
                          ) : (
                            logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                              <div key={log.id} className={`p-10 border shadow-sm hover:shadow-xl transition-all ${isRpgMode ? 'bg-slate-900 border-slate-800 rounded-none' : 'bg-white border-slate-100 rounded-[3rem]'}`}>
                                <p className={`italic font-serif text-2xl leading-relaxed mb-8 ${isRpgMode ? 'text-slate-300 font-mono not-italic text-lg' : 'text-slate-700'}`}>&ldquo;{log.note}&rdquo;</p>
                                <div className={`flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] ${isRpgMode ? 'text-emerald-400' : 'text-indigo-500'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                              </div>
                            ))
                          )}
                      </div>
                    </section>
                  </div>
                )}

                {/* Projects Section */}
                 <section className={`p-6 sm:p-12 border shadow-sm transition-colors ${
                  isRpgMode ? 'bg-slate-900 border-slate-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-sm rounded-[3rem]'
                }`}>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className={`text-3xl sm:text-4xl font-serif italic ${isRpgMode ? 'text-white font-mono font-black uppercase' : 'text-slate-800'}`}>
                      {isRpgMode ? t('project_artifacts') : t('projects')}
                    </h3>
                    {isOwner && !isAddingProject && (
                      <button 
                        onClick={() => setIsAddingProject(true)}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-none shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white hover:bg-indigo-600 rounded-xl active:scale-95'
                        }`}
                      >
                        {isRpgMode ? '[+ ARTIFACT]' : 'New Project'}
                      </button>
                    )}
                  </div>

                  {isAddingProject && (
                    <form onSubmit={addProject} className={`p-6 border mb-10 space-y-4 transition-colors ${
                      isRpgMode ? 'bg-slate-950 border-slate-800 rounded-none' : 'bg-slate-50 border-slate-100 rounded-[2rem]'
                    }`}>
                      <input 
                        className={`w-full px-6 py-4 font-bold text-sm focus:outline-none transition-all ${
                          isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl'
                        }`}
                        placeholder="Project Name" 
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        required
                      />
                      <textarea 
                        className={`w-full px-6 py-4 text-sm focus:outline-none transition-all min-h-[100px] ${
                          isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl'
                        }`}
                        placeholder="Describe your contribution or artifact..." 
                        value={newProjectDesc}
                        onChange={e => setNewProjectDesc(e.target.value)}
                        required
                      />
                      <input 
                        className={`w-full px-6 py-4 text-xs focus:outline-none transition-all ${
                          isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl'
                        }`}
                        placeholder="Live Link / Repository (optional)" 
                        value={newProjectLink}
                        onChange={e => setNewProjectLink(e.target.value)}
                      />
                      <div className="flex gap-4 pt-2">
                        <button type="submit" className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
                          isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] rounded-none' : 'bg-indigo-600 text-white shadow-indigo-100 rounded-xl'
                        }`}>
                          {isRpgMode ? t('save_artifact') : t('save_project')}
                        </button>
                        <button type="button" onClick={() => setIsAddingProject(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-6">
                    {skill.projects?.map((project) => (
                      <div key={project.id} className={`group p-6 sm:p-8 border transition-all ${
                        isRpgMode ? 'bg-slate-950 border-slate-800 hover:border-emerald-500 rounded-none' : 'bg-slate-50/50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 rounded-[2rem]'
                      }`}>
                        {editingProjectId === project.id ? (
                          <form onSubmit={handleUpdateProject} className="space-y-4 w-full">
                            <div className="text-xs uppercase font-black tracking-wider text-slate-500 mb-2">Edit Project</div>
                            <input 
                              className={`w-full px-4 py-3 font-bold text-sm focus:outline-none transition-all ${
                                isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg'
                              }`}
                              placeholder="Project Name" 
                              value={editingProjectName}
                              onChange={e => setEditingProjectName(e.target.value)}
                              required
                            />
                            <textarea 
                              className={`w-full px-4 py-3 text-sm focus:outline-none transition-all min-h-[85px] ${
                                isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg'
                              }`}
                              placeholder="Describe your project contribution..." 
                              value={editingProjectDesc}
                              onChange={e => setEditingProjectDesc(e.target.value)}
                              required
                            />
                            <input 
                              className={`w-full px-4 py-3 text-xs focus:outline-none transition-all ${
                                isRpgMode ? 'bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 rounded-none' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg'
                              }`}
                              placeholder="Live Link" 
                              value={editingProjectLink}
                              onChange={e => setEditingProjectLink(e.target.value)}
                            />
                            <div className="flex gap-3">
                              <button type="submit" className={`px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all ${
                                isRpgMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-none' : 'bg-indigo-600 hover:bg-indigo-500 rounded-lg'
                              }`}>
                                Save
                              </button>
                              <button type="button" onClick={() => setEditingProjectId(null)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 transition-all ${
                                isRpgMode ? 'rounded-none' : 'rounded-lg'
                              }`}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                              <h4 className={`text-xl font-bold ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>{project.name}</h4>
                              <div className="flex items-center gap-2">
                                {project.link && (
                                  <a 
                                    href={project.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all ${
                                      isRpgMode ? 'bg-slate-900 border border-emerald-900 text-emerald-400 rounded-none' : 'bg-white border border-indigo-50 text-indigo-600 rounded-lg'
                                    }`}
                                  >
                                    Visit <ArrowRight className="w-3 h-3" />
                                  </a>
                                )}
                                {isOwner && (
                                  <>
                                    <button 
                                      onClick={() => handleStartEditProject(project)} 
                                      className={`p-1.5 border transition-colors ${
                                        isRpgMode 
                                          ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-800 rounded-none' 
                                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 rounded-lg'
                                      }`}
                                      title="Edit Project"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProject(project.id)} 
                                      className={`p-1.5 border transition-colors ${
                                        isRpgMode 
                                          ? 'bg-slate-900 border-slate-800 text-red-500 hover:bg-red-950/20 hover:border-red-900 rounded-none' 
                                          : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 rounded-lg'
                                      }`}
                                      title="Delete Project"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed mb-6 ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>{project.description}</p>
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isRpgMode ? 'text-slate-700' : 'text-slate-300'}`}>
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {(!skill.projects || skill.projects.length === 0) && (
                      <div className={`text-center py-20 border border-dashed transition-colors ${
                        isRpgMode ? 'bg-slate-950 border-slate-800 rounded-none' : 'bg-slate-50/30 border-slate-100 rounded-[2rem]'
                      }`}>
                        <p className={`font-serif italic text-lg leading-relaxed ${isRpgMode ? 'text-slate-700 font-mono not-italic' : 'text-slate-300'}`}>
                          No items in the gallery yet. {isOwner ? 'Build something to prove your mastery.' : 'This learner is still crafting their path.'}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-12">
                 {/* Consistency Graph */}
                 {isOwner && (
                    <section className={`border p-10 shadow-sm transition-colors ${
                      isRpgMode ? 'bg-slate-900 border-slate-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 rounded-[3rem]'
                    }`}>
                      <div className="flex items-center gap-3 mb-8">
                        {isRpgMode ? <Trophy className="w-5 h-5 text-emerald-400" /> : <BarChart3 className="w-5 h-5 text-indigo-600" />}
                        <h4 className={`text-[10px] uppercase font-black tracking-widest ${isRpgMode ? 'text-slate-500 font-mono' : 'text-slate-400'}`}>
                          {isRpgMode ? 'ACTIVITY' : 'ACTIVITY'}
                        </h4>
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
                              className={`w-4 h-4 transition-all ${
                                attended 
                                  ? (isRpgMode ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-950 rounded-none' : 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-100 rounded-md') 
                                  : (isRpgMode ? 'bg-slate-950 rounded-none' : 'bg-slate-100 rounded-md')
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className={`text-[10px] mt-8 italic font-bold ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isRpgMode ? 'Sessions tracked over 28 days.' : 'Activity over the last 28 days.'}
                      </p>
                    </section>
                 )}

                 {/* AI Recommendations */}
                 {/* <section className={`p-12 border shadow-2xl relative overflow-hidden group transition-colors ${
                   isRpgMode ? 'bg-slate-900 border-slate-800 rounded-none' : 'bg-slate-900 border-slate-800 text-white rounded-[3.5rem]'
                 }`}>
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity ${isRpgMode ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                    
                    <Sparkles className={`${isRpgMode ? 'text-emerald-400' : 'text-indigo-400'} mb-8 w-10 h-10`} />
                    <h4 className="font-serif italic text-3xl mb-8 leading-tight">{isRpgMode ? t('ai_advice') : t('ai_career_advice')}</h4>
                    
                    {!recommendations.length ? (
                      <button 
                        onClick={getRecommendations} 
                        disabled={isSubmitting}
                        className={`w-full text-[10px] border p-5 uppercase font-black tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                          isRpgMode ? 'border-emerald-900 text-emerald-400 hover:bg-emerald-950/40 font-black rounded-none' : 'border-slate-700 text-white hover:bg-slate-800 rounded-xl'
                        }`}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRpgMode ? t('get_advice') : t('request_advice'))}
                      </button>
                    ) : (
                      <div className="space-y-6">
                        {recommendations.map((r,i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className={`text-sm italic p-6 border transition-all ${
                              isRpgMode ? 'bg-slate-950 border-emerald-950/50 text-emerald-100 rounded-none' : 'bg-slate-800/30 border-slate-800 text-slate-300 rounded-[2rem]'
                            }`}
                          >
                            {r.advice || r.task || r.skill}
                          </motion.div>
                        ))}
                        <button 
                          onClick={() => setRecommendations([])} 
                          className={`text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors ${
                            isRpgMode ? 'text-emerald-400' : 'text-indigo-400'
                          }`}
                        >
                          Reset Analysis
                        </button>
                      </div>
                    )}
                 </section> */}
              </aside>
            </main>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }} 
               className={`w-full max-w-md p-10 shadow-2xl relative transition-all border ${
                 isRpgMode ? 'bg-slate-900 border border-slate-800 text-white rounded-none' : 'bg-white text-slate-900 rounded-[2.5rem]'
               }`}
             >
               <button 
                 onClick={() => setConfirmDelete(null)} 
                 className={`absolute top-6 right-6 p-2 transition-colors ${
                   isRpgMode ? 'hover:bg-slate-800 text-slate-400 rounded-none' : 'hover:bg-slate-100 text-slate-400 rounded-full'
                 }`}
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col items-center text-center mt-4">
                 <div className={`p-4 mb-6 border ${
                   isRpgMode ? 'bg-red-900/40 text-red-400 border-red-900/50 rounded-none' : 'bg-red-50 text-red-500 border border-red-100 rounded-full'
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
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                       isRpgMode 
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
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors bg-red-600 hover:bg-red-500 shadow-md ${
                       isRpgMode ? 'rounded-none' : 'rounded-xl'
                     }`}
                   >
                     {t('delete') || 'Delete'}
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}

        {showEditSkillModal && (
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

               <button onClick={() => setShowEditSkillModal(false)} className={`absolute top-8 right-8 p-3 rounded-full transition-colors z-10 ${isRpgMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}>
                 <X className="w-5 h-5" />
               </button>
               
               <div className="relative z-10">
                 <h2 className={`text-4xl mb-2 ${theme.heading} ${theme.text}`}>
                   {isRpgMode ? 'MODIFY PATH' : 'Edit Skill Path'}
                 </h2>
                 <form onSubmit={handleUpdateSkill} className="space-y-8 mt-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                         <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>
                           {isRpgMode ? 'Discipline Title' : 'Skill Title'}
                         </label>
                         <input 
                           required 
                           className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`} 
                           placeholder="e.g. Quantum Computing" 
                           value={editSkillTitle} 
                           onChange={e => setEditSkillTitle(e.target.value)} 
                         />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('target_duration')}</label>
                        <input 
                          required 
                          type="number" 
                          className={`w-full p-6 font-bold text-xl focus:outline-none transition-all border ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`} 
                          value={editSkillDuration} 
                          onChange={e => setEditSkillDuration(parseInt(e.target.value) || 3)} 
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-black mb-3 block tracking-widest ${theme.muted}`}>{t('time_unit')}</label>
                        <select 
                          className={`w-full p-6 font-bold text-lg focus:outline-none cursor-pointer transition-all border appearance-none ${theme.input} ${isRpgMode ? 'rounded-none' : 'rounded-2xl'}`} 
                          value={editSkillUnit} 
                          onChange={e => setEditSkillUnit(e.target.value)}
                        >
                          <option value="days">{t('days')}</option>
                          <option value="weeks">{t('weeks')}</option>
                          <option value="months">{t('months')}</option>
                        </select>
                      </div>
                   </div>
                   <div className="pt-6 flex gap-6">
                     <button type="button" onClick={() => setShowEditSkillModal(false)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-colors ${isRpgMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>{t('cancel')}</button>
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
    </DashboardLayout>
  );
}
