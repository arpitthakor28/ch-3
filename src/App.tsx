import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme, ModuleId } from './theme/ThemeProvider';
import { Layout } from './shell/Layout';
import { ChapterQuiz } from './shell/ChapterQuiz';
import { TeacherDashboard } from './shell/TeacherDashboard';
import { ALL_MODULES, getModuleById } from './modules/registry';
import { ModuleSpec } from './modules/types';
import { api, StudentProgress } from './api/client';

export const AppContent: React.FC = () => {
  const { setModuleTheme } = useTheme();
  const [activeView, setActiveView] = useState<'hub' | 'module' | 'quiz' | 'teacher'>('hub');
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>({});

  // Load progress from API/localStorage on start
  useEffect(() => {
    async function loadAllProgress() {
      const all: Record<string, StudentProgress> = {};
      for (const m of ALL_MODULES) {
        const prog = await api.getModuleProgress(m.meta.id);
        all[m.meta.id] = prog;
      }
      setProgressMap(all);
    }
    loadAllProgress();
  }, []);

  // Listen to hash change for deep-linking (e.g. #M01, #quiz, #teacher)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toUpperCase();
      if (!hash) {
        setActiveView('hub');
        setCurrentModuleId(null);
        setModuleTheme('hub');
      } else if (hash === 'QUIZ') {
        setActiveView('quiz');
        setCurrentModuleId(null);
        setModuleTheme('hub');
      } else if (hash === 'TEACHER') {
        setActiveView('teacher');
        setCurrentModuleId(null);
        setModuleTheme('hub');
      } else {
        const matched = getModuleById(hash);
        if (matched) {
          setActiveView('module');
          setCurrentModuleId(matched.meta.id);
          setModuleTheme(matched.meta.themeId as ModuleId);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setModuleTheme]);

  const handleSelectModule = (id: string) => {
    window.location.hash = id;
    setActiveView('module');
    setCurrentModuleId(id);
    const mod = getModuleById(id);
    if (mod) {
      setModuleTheme(mod.meta.themeId as ModuleId);
    }
  };

  const handleBackToHub = () => {
    window.location.hash = '';
    setActiveView('hub');
    setCurrentModuleId(null);
    setModuleTheme('hub');
  };

  const handleOpenQuiz = () => {
    window.location.hash = 'quiz';
    setActiveView('quiz');
    setCurrentModuleId(null);
    setModuleTheme('hub');
  };

  const handleOpenTeacher = () => {
    window.location.hash = 'teacher';
    setActiveView('teacher');
    setCurrentModuleId(null);
    setModuleTheme('hub');
  };

  const handleProgressUpdate = (moduleId: string, updated: Partial<StudentProgress>) => {
    setProgressMap((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {
          _id: moduleId,
          studentId: 'STD-DEFAULT',
          chapterId: 'C9-03',
          moduleId,
          status: 'not_started',
          secondsActive: 0,
          lastAccessedAt: new Date().toISOString(),
        }),
        ...updated,
      },
    }));
  };

  const currentModule = currentModuleId ? getModuleById(currentModuleId) || null : null;

  if (activeView === 'quiz') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <ChapterQuiz onBack={handleBackToHub} />
      </div>
    );
  }

  if (activeView === 'teacher') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <TeacherDashboard onBack={handleBackToHub} />
      </div>
    );
  }

  return (
    <Layout
      currentModule={currentModule}
      onSelectModule={handleSelectModule}
      onBackToHub={handleBackToHub}
      onOpenQuiz={handleOpenQuiz}
      onOpenTeacher={handleOpenTeacher}
      progressMap={progressMap}
      onProgressUpdate={handleProgressUpdate}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

