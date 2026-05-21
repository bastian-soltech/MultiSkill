'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  ExternalLink, 
  Calendar, 
  Zap,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Box,
  Sword,
  Shield,
  Scroll,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useMode } from '@/lib/ModeContext';

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  createdAt: number;
}

interface Skill {
  id: string;
  title: string;
  projects?: Project[];
}

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { isRpgMode } = useMode();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<(Project & { skillTitle: string; skillId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit and Delete state variables for projects
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    message: string;
    action: () => void;
  } | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectDesc, setEditingProjectDesc] = useState('');
  const [editingProjectLink, setEditingProjectLink] = useState('');
  const [editingProjectSkillId, setEditingProjectSkillId] = useState<string | null>(null);

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
    async function fetchProjects() {
      if (!user) return;
      try {
        const q = query(collection(db, 'skills'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const allProjects = querySnapshot.docs.flatMap(doc => {
          const data = doc.data();
          const skillProjects = (data.projects || []) as Project[];
          return skillProjects.map(p => ({
            ...p,
            skillTitle: data.title,
            skillId: doc.id
          }));
        }).sort((a, b) => b.createdAt - a.createdAt);
        
        setProjects(allProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [user]);

  const handleStartEdit = (p: Project & { skillId: string }) => {
    setEditingProjectId(p.id);
    setEditingProjectName(p.name);
    setEditingProjectDesc(p.description);
    setEditingProjectLink(p.link || '');
    setEditingProjectSkillId(p.skillId);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editingProjectSkillId || !editingProjectName.trim()) return;
    try {
      const skillRef = doc(db, 'skills', editingProjectSkillId);
      const skillSnap = await getDoc(skillRef);
      if (skillSnap.exists()) {
        const skillData = skillSnap.data();
        const skillProjects = (skillData.projects || []) as Project[];
        const updatedProjects = skillProjects.map(p => {
          if (p.id === editingProjectId) {
            return {
              ...p,
              name: editingProjectName,
              description: editingProjectDesc,
              link: editingProjectLink
            };
          }
          return p;
        });
        await updateDoc(skillRef, { projects: updatedProjects });
        
        // Update local state
        setProjects(prev => prev.map(p => p.id === editingProjectId ? {
          ...p,
          name: editingProjectName,
          description: editingProjectDesc,
          link: editingProjectLink
        } : p));
        setEditingProjectId(null);
        setEditingProjectSkillId(null);
      }
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = async (projectId: string, skillId: string) => {
    setConfirmDelete({
      message: 'Are you sure you want to delete this project?',
      action: async () => {
        try {
          const skillRef = doc(db, 'skills', skillId);
          const skillSnap = await getDoc(skillRef);
          if (skillSnap.exists()) {
            const skillData = skillSnap.data();
            const skillProjects = (skillData.projects || []) as Project[];
            const updatedProjects = skillProjects.filter(p => p.id !== projectId);
            await updateDoc(skillRef, { projects: updatedProjects });
            
            // Update local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
          }
        } catch (err) {
          console.error('Error deleting project:', err);
        }
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 animate-pulse">
          <div className="h-12 w-48 bg-slate-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-[3rem]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`transition-colors duration-300 min-h-screen ${isRpgMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-4 sm:p-8 md:p-12`}>
        <header className="mb-16">
          <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest mb-6 ${
            isRpgMode ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Box className="w-3 h-3" />
            {isRpgMode ? t('saved_projects') : t('your_projects')}
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif italic mb-6 leading-none tracking-tight">
            {isRpgMode ? t('your_projects') : t('your_projects')}
          </h1>
          <p className={`text-sm sm:text-lg italic max-w-2xl ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRpgMode ? t('projects_desc_rpg') : t('projects_desc_pro')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div 
                key={project.id}
                className={`p-10 rounded-[3rem] border transition-all flex flex-col justify-between ${
                  isRpgMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-cyan-500 shadow-2xl shadow-black/20' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl'
                }`}
              >
                {editingProjectId === project.id ? (
                  <form onSubmit={handleUpdateProject} className="space-y-4 w-full">
                    <div className="text-xs uppercase font-black tracking-wider text-slate-500 mb-2">Edit Project</div>
                    <input 
                      className={`w-full px-4 py-3 rounded-lg font-bold text-sm focus:outline-none transition-all ${
                        isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      placeholder="Project Name" 
                      value={editingProjectName}
                      onChange={e => setEditingProjectName(e.target.value)}
                      required
                    />
                    <textarea 
                      className={`w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all min-h-[85px] ${
                        isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      placeholder="Describe your project contribution..." 
                      value={editingProjectDesc}
                      onChange={e => setEditingProjectDesc(e.target.value)}
                      required
                    />
                    <input 
                      className={`w-full px-4 py-3 rounded-lg text-xs focus:outline-none transition-all ${
                        isRpgMode ? 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      placeholder="Live Link" 
                      value={editingProjectLink}
                      onChange={e => setEditingProjectLink(e.target.value)}
                    />
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className={`px-4 py-2 text-xs rounded-lg font-black uppercase tracking-wider text-white ${isRpgMode ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingProjectId(null)} className="px-4 py-2 text-xs rounded-lg font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 pointer-events-auto">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 rounded-2xl ${isRpgMode ? 'bg-slate-950 text-cyan-400 border border-slate-800' : 'bg-indigo-50 text-indigo-600'}`}>
                          {isRpgMode ? <Sword className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isRpgMode ? 'text-slate-600' : 'text-slate-300'}`}>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleStartEdit(project)} 
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isRpgMode 
                                  ? 'bg-slate-950 border-slate-800 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-800' 
                                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                              title="Edit Project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id, project.skillId)} 
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isRpgMode 
                                  ? 'bg-slate-950 border-slate-800 text-red-500 hover:bg-red-950/20 hover:border-red-900' 
                                  : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                              }`}
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <h3 className={`text-3xl font-bold mb-3 ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>{project.name}</h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 ${isRpgMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>Skill:</span>
                        <span className={`text-[10px] font-bold leading-none ${isRpgMode ? 'text-cyan-400' : 'text-slate-600'}`}>{project.skillTitle}</span>
                      </div>
                      <p className={`text-sm leading-relaxed mb-10 line-clamp-4 ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <Link 
                        href={`/skills/${project.skillId}`}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                          isRpgMode ? 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700' : 'bg-slate-50 text-slate-900 border border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {t('view_skill')}
                      </Link>
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-lg ${
                            isRpgMode ? 'bg-cyan-600 text-white shadow-cyan-950 border-b-4 border-cyan-800' : 'bg-slate-900 text-white shadow-slate-100 hover:bg-indigo-600'
                          }`}
                        >
                          {t('view_live')}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className={`md:col-span-2 text-center py-40 rounded-[4rem] border-2 border-dashed ${
              isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {isRpgMode ? <Scroll className="w-16 h-16 mx-auto mb-8 opacity-20" /> : <Trophy className="w-16 h-16 mx-auto mb-8 opacity-20" />}
              <p className="font-serif italic text-3xl">No projects found.</p>
              <Link href="/dashboard" className={`inline-block mt-10 font-black uppercase text-[10px] tracking-widest hover:underline ${isRpgMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                {t('add_project')}
              </Link>
            </div>
          )}
        </div>
      </div>

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
