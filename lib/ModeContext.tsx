'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModeContextType {
  isRpgMode: boolean;
  setIsRpgMode: (mode: boolean) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [isRpgMode, setIsRpgMode] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('isRpgMode');
    if (saved !== null) {
      setIsRpgMode(saved === 'true');
    }
  }, []);

  const toggleMode = (val: boolean) => {
    setIsRpgMode(val);
    localStorage.setItem('isRpgMode', val.toString());
  };

  return (
    <ModeContext.Provider value={{ isRpgMode, setIsRpgMode: toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
