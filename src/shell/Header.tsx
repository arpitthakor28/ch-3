import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { ArrowLeft, Moon, Sun, FastForward, Sliders, Eye, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';
import { ModuleSpec } from '../modules/types';

interface HeaderProps {
  currentModule: ModuleSpec | null;
  onBackToHub: () => void;
  onOpenQuiz: () => void;
  onOpenTeacher: () => void;
  mode: 'textbook' | 'lab';
  onToggleMode: (mode: 'textbook' | 'lab') => void;
  onOpenMobileNav: () => void;
  onOpenMobileNotes: () => void;
  currentStepName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onBackToHub,
  onOpenQuiz,
  onOpenTeacher,
  mode,
  onToggleMode,
  onOpenMobileNav,
  onOpenMobileNotes,
  currentStepName,
}) => {
  const { highContrast, setHighContrast, reducedMotion, setReducedMotion } = useTheme();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        transition: 'background-color 0.3s ease',
      }}
      role="banner"
    >
      {/* Left: Back button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentModule ? (
          <button
            type="button"
            onClick={onBackToHub}
            aria-label="Back to Chapter 3 Module Hub"
            title="Return to Chapter Index"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span className="vls-hide-mobile">All Modules</span>
          </button>
        ) : null}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(51, 71, 168, 0.1)',
                color: 'var(--primary)',
              }}
            >
              NCERT Class 9 · Ch 3
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {currentModule ? `${currentModule.meta.id}: ${currentModule.meta.title}` : 'Tissues in Action (VLS)'}
            </h1>
          </div>
          {currentModule && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text)', opacity: 0.75, marginTop: '2px' }}>
              {currentModule.meta.subtitle} {currentStepName && `· [${currentStepName}]`}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Mode (Textbook/Lab) + Accessibility Toggles + Quiz + Teacher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Textbook vs Lab Mode Switch */}
        {currentModule && (
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              padding: '2px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
            }}
            role="group"
            aria-label="Simulation Data Mode"
          >
            <button
              type="button"
              onClick={() => onToggleMode('textbook')}
              aria-pressed={mode === 'textbook'}
              title="Deterministic reference values from textbook"
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: mode === 'textbook' ? 'var(--primary)' : 'transparent',
                color: mode === 'textbook' ? '#ffffff' : 'var(--text)',
                fontSize: '0.74rem',
                fontWeight: mode === 'textbook' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              Textbook
            </button>
            <button
              type="button"
              onClick={() => onToggleMode('lab')}
              aria-pressed={mode === 'lab'}
              title="Seeded random variation for independent student data"
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: mode === 'lab' ? 'var(--secondary)' : 'transparent',
                color: mode === 'lab' ? '#ffffff' : 'var(--text)',
                fontSize: '0.74rem',
                fontWeight: mode === 'lab' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              Lab Mode
            </button>
          </div>
        )}

        {/* Chapter Quiz Button */}
        <button
          type="button"
          onClick={onOpenQuiz}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Class 9 Chapter 3 Full Mastery Quiz"
        >
          <GraduationCap size={14} color="var(--primary)" />
          <span className="vls-hide-mobile">Chapter Quiz</span>
        </button>

        {/* Teacher Dashboard Button */}
        <button
          type="button"
          onClick={onOpenTeacher}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Teacher Dashboard & Progress Reports"
        >
          <LayoutDashboard size={14} color="var(--accent)" />
          <span className="vls-hide-mobile">Teacher View</span>
        </button>

        {/* High Contrast Toggle */}
        <button
          type="button"
          onClick={() => setHighContrast(!highContrast)}
          aria-pressed={highContrast}
          aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
          title="Toggle High Contrast Mode (WCAG AAA)"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: highContrast ? 'var(--text)' : 'transparent',
            color: highContrast ? 'var(--surface)' : 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Eye size={15} />
        </button>

        {/* Reduced Motion Toggle */}
        <button
          type="button"
          onClick={() => setReducedMotion(!reducedMotion)}
          aria-pressed={reducedMotion}
          aria-label={reducedMotion ? 'Enable animations' : 'Reduce animations'}
          title="Toggle Reduced Motion"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: reducedMotion ? 'var(--secondary)' : 'transparent',
            color: reducedMotion ? '#ffffff' : 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FastForward size={15} />
        </button>

        {/* Mobile Nav Button (shown under 900px) */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="vls-show-mobile-only"
          aria-label="Toggle modules navigation menu"
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Modules
        </button>

        {/* Mobile Notes Sheet Button (shown under 900px when inside a module) */}
        {currentModule && (
          <button
            type="button"
            onClick={onOpenMobileNotes}
            className="vls-show-mobile-only"
            aria-label="Open notes and learning check"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Notes & Quiz
          </button>
        )}
      </div>
    </header>
  );
};

