'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'business' | 'telemetry';

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
  formatValue: (methAmount: number | string | null | undefined, options?: { showSubtext?: boolean; precision?: number }) => {
    primary: string;
    secondary: string;
  };
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ViewMode>('business');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('supplyright_view_mode') as ViewMode | null;
      if (saved === 'telemetry' || saved === 'business') {
        setModeState(saved);
      }
    }
  }, []);

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('supplyright_view_mode', newMode);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'business' ? 'telemetry' : 'business');
  };

  // 1 mETH = $1,000 USD Trade Value
  const formatValue = (
    methAmount: number | string | null | undefined,
    options?: { showSubtext?: boolean; precision?: number }
  ) => {
    const num = Number(methAmount) || 0;
    const precision = options?.precision ?? 1;

    if (mode === 'business') {
      const usdValue = (num * 1000).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      });
      const methSubtext = `${num.toFixed(precision)} mETH`;
      return {
        primary: usdValue,
        secondary: methSubtext
      };
    } else {
      const methValue = `${num.toFixed(precision)} mETH`;
      const usdSubtext = `≈ $${(num * 1000).toLocaleString('en-US')} USD`;
      return {
        primary: methValue,
        secondary: usdSubtext
      };
    }
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggleMode, formatValue }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
};
