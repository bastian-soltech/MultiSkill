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
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Milestones', href: '#', icon: Target },
  { name: 'Achievements', href: '#', icon: Trophy },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout, userProfile } = useAuth();

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-indigo-600'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
            <span className="font-serif italic text-2xl tracking-tight text-slate-800">MultiSkill</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-6 px-4">Menu</div>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto space-y-6">
            <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400">Streak</div>
                    <div className="text-sm font-bold text-slate-800">12 Days Solid</div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                      {userProfile?.displayName?.[0] || 'L'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 truncate w-24">
                    {userProfile?.displayName || 'Learner'}
                  </div>
                  <div className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Pro Member</div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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
