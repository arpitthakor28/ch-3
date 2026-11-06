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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<ModuleId>('hub');
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('vls_high_contrast') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('vls_reduced_motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // Apply module theme data attribute to documentElement as per PRD 4.4 and Section 5
    if (currentModule && currentModule !== 'hub') {
      document.documentElement.dataset.module = currentModule;
    } else {
      document.documentElement.dataset.module = 'hub';
    }
  }, [currentModule]);

  useEffect(() => {
    document.documentElement.dataset.highContrast = highContrast ? 'true' : 'false';
    localStorage.setItem('vls_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    localStorage.setItem('vls_reduced_motion', String(reducedMotion));
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
