'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
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
  Crown
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

interface CommunityProject extends Project {
  skillTitle: string;
  skillId: string;
  userName?: string;
  userId: string;
}

export default function CommunityProjectsPage() {
  const { isRpgMode } = useMode();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunityProjects() {
      try {
        const q = query(collection(db, 'skills'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const allProjects: CommunityProject[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.projects && Array.isArray(data.projects)) {
            data.projects.forEach((p: Project) => {
              allProjects.push({
                ...p,
                skillTitle: data.title,
                skillId: doc.id,
                userName: data.userName || 'Curious Learner',
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 animate-pulse">
          <div className="h-12 w-64 bg-slate-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem]" />
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
            isRpgMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {isRpgMode ? <Crown className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {isRpgMode ? 'Community' : 'Community'}
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif italic mb-6 leading-none tracking-tight">
            {isRpgMode ? 'Community <span className="text-emerald-400">Projects</span>' : 'Community Showroom'}
          </h1>
          <p className={`text-sm sm:text-lg italic max-w-2xl ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRpgMode 
              ? "Projects built by other members of the community." 
              : "See what the world is building as they master new skills."}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div 
                key={`${project.skillId}-${project.id}`}
                className={`group rounded-[2.5rem] border transition-all flex flex-col overflow-hidden ${
                  isRpgMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-2xl shadow-black/20' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl'
                }`}
              >
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isRpgMode ? 'bg-slate-950 border border-slate-800 text-emerald-400 group-hover:bg-emerald-900 group-hover:text-emerald-300' : 'bg-slate-900 group-hover:bg-indigo-600 text-white'
                    }`}>
                      {isRpgMode ? <Award className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center gap-2 ${isRpgMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{project.userName}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className={`text-xl font-bold mb-3 line-clamp-1 transition-colors ${
                    isRpgMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-indigo-600'
                  }`}>
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-8">
                    <LayoutGrid className={`w-3 h-3 ${isRpgMode ? 'text-emerald-900' : 'text-indigo-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isRpgMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      {project.skillTitle}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed mb-6 line-clamp-4 italic ${isRpgMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    &ldquo;{project.description}&rdquo;
                  </p>
                </div>

                <div className={`p-3 border-t flex gap-2 ${isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-50'}`}>
                  <Link 
                    href={`/skills/${project.skillId}`}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${
                      isRpgMode ? 'bg-slate-900 text-slate-500 hover:text-white border border-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm'
                    }`}
                  >
                    Roadmap <ArrowRight className="w-3 h-3" />
                  </Link>
                  {project.link && (
                    <a 
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center transition-all shadow-sm ${
                        isRpgMode ? 'bg-emerald-600 text-white border-b-4 border-emerald-800 hover:bg-emerald-500' : 'bg-slate-900 text-white hover:bg-indigo-600'
                      }`}
                    >
                      View Live
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`col-span-full text-center py-40 border-2 border-dashed rounded-[4rem] ${
              isRpgMode ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-white border-slate-100 text-slate-300'
            }`}>
              <Globe className="w-16 h-16 mx-auto mb-8 opacity-20" />
              <p className="font-serif italic text-3xl">No community projects found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
