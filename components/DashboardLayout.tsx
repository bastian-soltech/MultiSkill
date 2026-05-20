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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRpgMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
        <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${isRpgMode ? 'border-cyan-500' : 'border-indigo-600'}`}></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex font-sans antialiased ${isRpgMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Mobile Top Bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-6 z-[70] transition-colors ${
        isRpgMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg ${isRpgMode ? 'bg-cyan-600' : 'bg-indigo-600'}`}>M</div>
          <span className={`font-serif italic text-xl tracking-tight ${isRpgMode ? 'text-white' : 'text-slate-800'}`}>MultiSkill</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 transition-colors ${isRpgMode ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-slate-900'}`}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 min-h-screen pt-16 lg:pt-0">
        <div className="max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
