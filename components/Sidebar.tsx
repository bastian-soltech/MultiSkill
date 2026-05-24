'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  const { isRpgMode, setIsRpgMode } = useMode();
  const { language, setLanguage, t } = useLanguage();
  const { userProfile, logout } = useAuth();

  const items = NAV_ITEMS(t);

  // Theme tokens matching landing page and dashboard
  const theme = {
    bg: isRpgMode ? 'bg-slate-950' : 'bg-white',
    text: isRpgMode ? 'text-slate-100' : 'text-slate-900',
    muted: isRpgMode ? 'text-slate-400' : 'text-slate-500',
    accent: isRpgMode ? 'text-emerald-400' : 'text-indigo-600',
    accentBg: isRpgMode ? 'bg-emerald-500/10' : 'bg-indigo-50',
    accentBorder: isRpgMode ? 'border-emerald-500/20' : 'border-indigo-100',
    navActive: isRpgMode ? 'bg-emerald-500 text-slate-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white shadow-xl shadow-slate-200',
    navHover: isRpgMode ? 'hover:bg-slate-900 hover:text-emerald-400' : 'hover:bg-slate-50 hover:text-indigo-600',
    card: isRpgMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100',
    font: isRpgMode ? 'font-mono' : 'font-sans',
    heading: isRpgMode ? 'font-black uppercase tracking-tighter italic' : 'font-serif italic tracking-tight'
  };

  const NavLink = ({ item }: { item: ReturnType<typeof NAV_ITEMS>[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-4 px-6 py-4 transition-all group ${isRpgMode ? 'rounded-none' : 'rounded-2xl'} ${
          isActive 
            ? theme.navActive 
            : `text-slate-500 ${theme.navHover}`
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? (isRpgMode ? 'text-slate-950' : 'text-white') : 'group-hover:scale-110 transition-transform'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-72 border-r transition-all duration-500 ease-in-out lg:translate-x-0 ${theme.bg} ${isRpgMode ? 'border-slate-900' : 'border-slate-100'} ${theme.font} ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className={`h-[100vh] max-h-screen flex flex-col p-8 pb-28 overflow-y-auto ${isRpgMode ? 'rpg-scrollbar' : 'custom-scrollbar'}`}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <motion.div 
              whileHover={{ rotate: isRpgMode ? 90 : 0 }}
              className={`w-10 h-10 flex items-center justify-center text-white font-bold text-xl ${isRpgMode ? 'bg-emerald-500 text-slate-950 rounded-none' : 'bg-indigo-600 rounded-xl'}`}
            >
              M
            </motion.div>
            <span className={`text-2xl ${theme.heading} ${theme.text}`}>MultiSkill</span>
          </div>

          {/* Language Toggle */}
          <div className="px-2 mb-4">
            <div className={`flex p-1 rounded-xl transition-all ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50'}`}>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${language === 'en' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">English</span>
              </button>
              <button 
                onClick={() => setLanguage('id')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${language === 'id' ? (isRpgMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Indonesia</span>
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="px-2 mb-10">
            <div className={`flex p-1 rounded-xl transition-all ${isRpgMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50'}`}>
              <button 
                onClick={() => setIsRpgMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${!isRpgMode ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Shield className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">PRO</span>
              </button>
              <button 
                onClick={() => setIsRpgMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${isRpgMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">RPG</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <div className={`text-[10px] uppercase font-black tracking-[0.3em] mb-6 px-4 ${theme.muted}`}>System Menu</div>
            {items.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto space-y-6">
           
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 overflow-hidden border-2 shadow-sm transition-all ${isRpgMode ? 'bg-slate-800 border-emerald-900 rounded-none' : 'bg-slate-200 border-white rounded-full'}`}>
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                      {userProfile?.displayName?.[0] || 'L'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-black truncate w-24 ${theme.text}`}>
                    {userProfile?.displayName || 'Learner'}
                  </div>
                 
                </div>
              </div>
              <button 
                onClick={logout}
                className={`p-2 transition-colors ${isRpgMode ? 'text-slate-600 hover:text-emerald-400' : 'text-slate-300 hover:text-indigo-600'}`}
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
