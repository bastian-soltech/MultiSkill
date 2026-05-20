'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Compass, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Target,
  Trophy,
  Zap,
  LayoutGrid,
  Globe,
  CheckSquare,
  Shield,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useMode } from '@/lib/ModeContext';
import { useLanguage } from '@/lib/LanguageContext';

const NAV_ITEMS = (t: (key: string) => string) => [
  { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
  { name: t('explore'), href: '/explore', icon: Compass },
  { name: t('milestones'), href: '/milestones', icon: CheckSquare },
  { name: t('projects'), href: '/projects', icon: LayoutGrid },
  { name: t('community'), href: '/community-projects', icon: Globe },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout, userProfile } = useAuth();
  const { isRpgMode, setIsRpgMode } = useMode();
  const { language, setLanguage, t } = useLanguage();

  const items = NAV_ITEMS(t);

  const NavLink = ({ item }: { item: ReturnType<typeof NAV_ITEMS>[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
          isActive 
            ? isRpgMode ? 'bg-cyan-600 text-white shadow-xl' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
            : isRpgMode ? 'text-slate-500 hover:bg-slate-900 hover:text-cyan-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : isRpgMode ? 'group-hover:text-cyan-400' : 'group-hover:text-indigo-600'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-72 border-r transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isRpgMode ? 'bg-slate-950 border-slate-900 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
        } ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className={`h-[100vh] max-h-screen flex flex-col p-8 pb-28 overflow-y-auto ${isRpgMode ? 'rpg-scrollbar' : 'custom-scrollbar'}`}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl ${isRpgMode ? 'bg-cyan-600' : 'bg-indigo-600'}`}>M</div>
            <span className={`font-serif italic text-2xl tracking-tight ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>MultiSkill</span>
          </div>

          {/* Language Toggle */}
          <div className="px-2 mb-4">
            <div className={`flex p-1 rounded-xl shadow-inner ${isRpgMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${language === 'en' ? (isRpgMode ? 'bg-slate-800 text-cyan-400 border border-cyan-900/50' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">English</span>
              </button>
              <button 
                onClick={() => setLanguage('id')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${language === 'id' ? (isRpgMode ? 'bg-slate-800 text-cyan-400 border border-cyan-900/50' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Indonesia</span>
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="px-2 mb-10">
            <div className={`flex p-1 rounded-xl shadow-inner ${isRpgMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <button 
                onClick={() => setIsRpgMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${!isRpgMode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Shield className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">{t('pro_mode')}</span>
              </button>
              <button 
                onClick={() => setIsRpgMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${isRpgMode ? 'bg-slate-800 text-cyan-400 shadow-md border border-cyan-900/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">{t('rpg_mode')}</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <div className={`text-[10px] uppercase font-black tracking-[0.2em] mb-6 px-4 ${isRpgMode ? 'text-slate-600' : 'text-slate-300'}`}>Menu</div>
            {items.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto space-y-6">
            <div className={`rounded-[2rem] p-6 flex flex-col gap-4 border ${isRpgMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRpgMode ? 'bg-cyan-950 text-cyan-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400">Streak</div>
                    <div className={`text-sm font-bold ${isRpgMode ? 'text-cyan-400' : 'text-slate-800'}`}>12 Days Solid</div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ${isRpgMode ? 'bg-slate-800 border-cyan-900' : 'bg-slate-200 border-white'}`}>
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                      {userProfile?.displayName?.[0] || 'L'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate w-24 ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>
                    {userProfile?.displayName || 'Learner'}
                  </div>
                  <div className={`text-[8px] uppercase font-black tracking-widest ${isRpgMode ? 'text-cyan-500' : 'text-slate-400'}`}>
                    {isRpgMode ? t('advanced_learner') : t('pro_member')}
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className={`p-2 transition-colors ${isRpgMode ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
