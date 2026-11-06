import React from 'react';
import { ALL_MODULES, MODULE_CATEGORIES } from '../modules/registry';
import { ModuleSpec } from '../modules/types';
import { CheckCircle2, Circle, Clock, Check, ChevronRight } from 'lucide-react';
import { StudentProgress } from '../api/client';

interface ChapterListProps {
  currentModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
  progressMap: Record<string, StudentProgress>;
  className?: string;
  onCloseMobileDrawer?: () => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  currentModuleId,
  onSelectModule,
  progressMap,
  className = '',
  onCloseMobileDrawer,
}) => {
  // Calculate total completed modules
  const completedCount = ALL_MODULES.filter(
    (m) => progressMap[m.meta.id]?.status === 'completed'
  ).length;
  const progressPercent = Math.round((completedCount / ALL_MODULES.length) * 100);

  return (
    <aside
      className={`vls-chapter-list ${className}`}
      style={{
        width: '280px',
        minWidth: '280px',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 54px)',
        overflowY: 'auto',
      }}
      aria-label="Chapter 3 Module Navigation"
    >
      {/* Chapter Overview Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(0, 0, 0, 0.015)',
        }}
      >
        <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)' }}>
          NCERT Grade 9
        </div>
        <h2 style={{ margin: '2px 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
          Chapter 3: Tissues
        </h2>
        <div style={{ fontSize: '0.76rem', color: 'var(--text)', opacity: 0.8, marginBottom: '10px' }}>
          {completedCount} of {ALL_MODULES.length} modules completed ({progressPercent}%)
        </div>

        {/* Overall Progress Bar */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: 'var(--accent)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Module Categories List */}
      <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {MODULE_CATEGORIES.map((catGroup) => (
          <div key={catGroup.category}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: 'var(--text)',
                opacity: 0.6,
                padding: '0 8px 6px 8px',
              }}
            >
              {catGroup.category}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {catGroup.modules.map((m) => {
                const isSelected = currentModuleId === m.meta.id;
                const status = progressMap[m.meta.id]?.status || 'not_started';

                return (
                  <button
                    key={m.meta.id}
                    type="button"
                    onClick={() => {
                      onSelectModule(m.meta.id);
                      if (onCloseMobileDrawer) onCloseMobileDrawer();
                    }}
                    aria-current={isSelected ? 'page' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid transparent',
                      backgroundColor: isSelected ? 'rgba(51, 71, 168, 0.08)' : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {/* Status Icon */}
                      {status === 'completed' ? (
                        <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                      ) : status === 'in_progress' ? (
                        <Clock size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={15} color="var(--border)" style={{ flexShrink: 0 }} />
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 700 : 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: '4px', opacity: 0.8 }}>
                            {m.meta.id}
                          </span>
                          {m.meta.title}
                        </div>
                      </div>
                    </div>

                    {isSelected && <ChevronRight size={14} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

