import React, { createContext, useContext, useEffect, useState } from 'react';

export type ModuleId = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06' | 'M07' | 'M08' | 'M09' | 'M10' | 'M11' | 'hub';

interface ThemeContextType {
  currentModule: ModuleId;
  setModuleTheme: (moduleId: ModuleId) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentModule: 'hub',
  setModuleTheme: () => {},
  highContrast: false,
  setHighContrast: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
});

const safeGetItem = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Storage restricted or unavailable
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<ModuleId>('hub');
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return safeGetItem('vls_high_contrast') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      return (
        safeGetItem('vls_reduced_motion') === 'true' ||
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.dataset.module = currentModule && currentModule !== 'hub' ? currentModule : 'hub';
      }
    } catch {
      // document dataset fallback
    }
  }, [currentModule]);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.dataset.highContrast = highContrast ? 'true' : 'false';
      }
      safeSetItem('vls_high_contrast', String(highContrast));
    } catch {
      // ignore
    }
  }, [highContrast]);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
      }
      safeSetItem('vls_reduced_motion', String(reducedMotion));
    } catch {
      // ignore
    }
  }, [reducedMotion]);

  const setModuleTheme = (moduleId: ModuleId) => {
    setCurrentModule(moduleId);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentModule,
        setModuleTheme,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
