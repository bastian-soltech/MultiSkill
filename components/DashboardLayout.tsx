'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useMode } from '@/lib/ModeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isRpgMode } = useMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!user && !loading) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 flex antialiased ${isRpgMode ? 'bg-slate-950 text-slate-100 font-mono' : 'bg-[#F8FAFC] text-slate-900 font-sans'}`}>
      {/* Mobile Top Bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-6 z-[70] transition-colors ${
        isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center text-white font-bold text-lg ${isRpgMode ? 'bg-emerald-500 text-slate-950 rounded-none' : 'bg-indigo-600 rounded-lg'}`}>M</div>
          <span className={`text-xl ${isRpgMode ? 'font-black uppercase italic tracking-tighter' : 'font-serif italic tracking-tight text-slate-800'}`}>MultiSkill</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 transition-colors ${isRpgMode ? 'text-emerald-400 hover:bg-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 min-h-screen pt-16 lg:pt-0 overflow-hidden">
        <div className="max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
