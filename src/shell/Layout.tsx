import React, { useState } from 'react';
import { ModuleSpec } from '../modules/types';
import { ALL_MODULES, MODULE_CATEGORIES } from '../modules/registry';
import { Header } from './Header';
import { ChapterList } from './ChapterList';
import { NotesPanel } from './NotesPanel';
import { ModuleWorkflowView } from './ModuleWorkflowView';
import { useLearningFlow, FlowStep } from './useLearningFlow';
import { useSimClock } from './useSimClock';
import { StudentProgress } from '../api/client';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Circle,
  Play,
  Layers,
  ArrowRight,
  BookOpen,
  Award,
  GraduationCap,
  LayoutDashboard,
  X,
} from 'lucide-react';

interface LayoutProps {
  currentModule: ModuleSpec | null;
  onSelectModule: (moduleId: string) => void;
  onBackToHub: () => void;
  onOpenQuiz: () => void;
  onOpenTeacher: () => void;
  progressMap: Record<string, StudentProgress>;
  onProgressUpdate: (moduleId: string, updated: Partial<StudentProgress>) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentModule,
  onSelectModule,
  onBackToHub,
  onOpenQuiz,
  onOpenTeacher,
  progressMap,
  onProgressUpdate,
}) => {
  const [mode, setMode] = useState<'textbook' | 'lab'>('textbook');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [mobileNotesOpen, setMobileNotesOpen] = useState<boolean>(false);

  // Active module learning flow
  const learningFlow = useLearningFlow({
    moduleId: currentModule?.meta.id || 'M01',
    requiredInteractions: currentModule?.meta.requiredInteractions || [],
    onCompletion: (score) => {
      if (currentModule) {
        onProgressUpdate(currentModule.meta.id, { status: 'completed' });
      }
    },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Top Header */}
      <Header
        currentModule={currentModule}
        onBackToHub={onBackToHub}
        onOpenQuiz={onOpenQuiz}
        onOpenTeacher={onOpenTeacher}
        mode={mode}
        onToggleMode={setMode}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenMobileNotes={() => setMobileNotesOpen(true)}
        currentStepName={currentModule ? learningFlow.currentStep : undefined}
      />

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left: Chapter Modules List (Desktop) */}
        <div className="vls-desktop-drawer">
          <ChapterList
            currentModuleId={currentModule?.meta.id || null}
            onSelectModule={onSelectModule}
            progressMap={progressMap}
          />
        </div>

        {/* Mobile Left Drawer Backdrop & Drawer */}
        {mobileNavOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 200,
              display: 'flex',
            }}
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              style={{
                width: '300px',
                backgroundColor: 'var(--surface)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontWeight: 800 }}>Chapter 3 Modules</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <ChapterList
                currentModuleId={currentModule?.meta.id || null}
                onSelectModule={onSelectModule}
                progressMap={progressMap}
                onCloseMobileDrawer={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Centre: Simulation Canvas OR Hub Dashboard */}
        <main
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          role="main"
        >
          {currentModule ? (
            /* Inside Active Module Simulation */
            <div
              style={{
                width: '100%',
                maxWidth: '1100px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Learning Flow 6-Step Progress Bar (PRD Section 5.2) */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  overflowX: 'auto',
                  gap: '8px',
                }}
              >
                {(
                  [
                    'OBJECTIVE',
                    'PREDICT',
                    'INTERACT',
                    'OBSERVE',
                    'EXPLAIN',
                    'CHECK',
                  ] as FlowStep[]
                ).map((step, idx) => {
                  const isCurrent = learningFlow.currentStep === step;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => learningFlow.setCurrentStep(step)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: isCurrent ? '1.5px solid var(--primary)' : '1px solid transparent',
                        backgroundColor: isCurrent ? 'rgba(51, 71, 168, 0.1)' : 'transparent',
                        color: isCurrent ? 'var(--primary)' : 'var(--text)',
                        fontSize: '0.76rem',
                        fontWeight: isCurrent ? 800 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ opacity: 0.7 }}>{idx + 1}.</span> {step}
                    </button>
                  );
                })}
              </div>

              {/* Active Step Content (Objective, Predict, Simulation Canvas, Observe, Explain, Check Quiz) */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  minHeight: '520px',
                }}
              >
                <ModuleWorkflowView
                  moduleSpec={currentModule}
                  flowStep={learningFlow.currentStep}
                  onSetFlowStep={learningFlow.setCurrentStep}
                  mode={mode}
                  prediction={learningFlow.prediction}
                  isPredictionSaved={learningFlow.isPredictionSaved}
                  onSavePrediction={learningFlow.savePrediction}
                  observationData={learningFlow.observationData}
                  explanationText={learningFlow.explanationText}
                  isExplanationSaved={learningFlow.isExplanationSaved}
                  onSaveExplanation={learningFlow.saveExplanation}
                  quizScore={learningFlow.quizScore}
                  onCompleteCheck={learningFlow.checkCompletion}
                  recordInteraction={learningFlow.recordInteraction}
                  completedInteractions={learningFlow.completedInteractions}
                  status={learningFlow.status}
                  onStartModule={learningFlow.startModule}
                  onSelectModule={onSelectModule}
                  onOpenQuiz={onOpenQuiz}
                />
              </div>
            </div>
          ) : (
            /* Hub / Chapter Dashboard View */
            <div
              style={{
                width: '100%',
                maxWidth: '1080px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {/* Hero Banner */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '30px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'var(--primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Interactive NCERT Virtual Lab Simulator
                  </div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 800 }}>
                    Class 9 · Chapter 3: Tissues in Action
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text)', opacity: 0.85, maxWidth: '640px' }}>
                    Eleven complete simulations exploring plant meristems, vascular transport, microscopic stem cross-sections,
                    epithelial linings, connective matrices, muscle striations, neuron signals, and joint mechanics.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onOpenQuiz}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <GraduationCap size={18} /> Take Chapter Quiz
                  </button>

                  <button
                    type="button"
                    onClick={onOpenTeacher}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <LayoutDashboard size={18} /> Teacher Reports
                  </button>
                </div>
              </div>

              {/* Categorized Grid of All 11 Modules */}
              {MODULE_CATEGORIES.map((catGroup) => (
                <div key={catGroup.category}>
                  <h3
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={18} /> {catGroup.category} ({catGroup.modules.length} Simulations)
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {catGroup.modules.map((m) => {
                      const status = progressMap[m.meta.id]?.status || 'not_started';

                      return (
                        <div
                          key={m.meta.id}
                          onClick={() => onSelectModule(m.meta.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Launch ${m.meta.id}: ${m.meta.title}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') onSelectModule(m.meta.id);
                          }}
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)',
                            padding: '18px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(51, 71, 168, 0.1)',
                                  color: 'var(--primary)',
                                }}
                              >
                                {m.meta.id}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}>
                                {status === 'completed' ? (
                                  <>
                                    <CheckCircle2 size={15} color="var(--accent)" />
                                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Completed</span>
                                  </>
                                ) : status === 'in_progress' ? (
                                  <>
                                    <Clock size={15} color="var(--secondary)" />
                                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>In Progress</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={14} color="var(--border)" />
                                    <span style={{ opacity: 0.6 }}>Not Started</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <h4
                              style={{
                                margin: '0 0 4px 0',
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: 'var(--text)',
                              }}
                            >
                              {m.meta.title}
                            </h4>
                            <div
                              style={{
                                fontSize: '0.76rem',
                                color: 'var(--text)',
                                opacity: 0.75,
                                marginBottom: '10px',
                                fontWeight: 500,
                              }}
                            >
                              {m.meta.subtitle}
                            </div>

                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                lineHeight: 1.4,
                                color: 'var(--text)',
                                opacity: 0.9,
                              }}
                            >
                              {m.meta.objective}
                            </p>
                          </div>

                          <div
                            style={{
                              marginTop: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '10px',
                              borderTop: '1px solid var(--border)',
                            }}
                          >
                            <span style={{ fontSize: '0.74rem', color: 'var(--text)', opacity: 0.7 }}>
                              {m.meta.checks.length} Check Questions
                            </span>
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                              }}
                            >
                              Launch Lab <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right: Notes, Learning Flow & Check Quiz Panel (Desktop) */}
        {currentModule && (
          <div
            className="vls-desktop-drawer"
            style={{
              width: '360px',
              minWidth: '360px',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 54px)',
              overflowY: 'auto',
            }}
          >
            <NotesPanel
              moduleSpec={currentModule}
              flowStep={learningFlow.currentStep}
              onSetFlowStep={learningFlow.setCurrentStep}
              prediction={learningFlow.prediction}
              isPredictionSaved={learningFlow.isPredictionSaved}
              onSavePrediction={learningFlow.savePrediction}
              explanationText={learningFlow.explanationText}
              isExplanationSaved={learningFlow.isExplanationSaved}
              onSaveExplanation={learningFlow.saveExplanation}
              quizScore={learningFlow.quizScore}
              onCompleteCheck={learningFlow.checkCompletion}
              observationData={learningFlow.observationData}
              status={learningFlow.status}
              onStartModule={learningFlow.startModule}
            />
          </div>
        )}

        {/* Mobile Bottom Sheet for Notes & Quiz */}
        {currentModule && mobileNotesOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={() => setMobileNotesOpen(false)}
          >
            <div
              style={{
                backgroundColor: 'var(--surface)',
                maxHeight: '88vh',
                maxWidth: '680px',
                width: '100%',
                margin: '0 auto',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontWeight: 800 }}>Notes & Checks</span>
                <button
                  type="button"
                  onClick={() => setMobileNotesOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <NotesPanel
                moduleSpec={currentModule}
                flowStep={learningFlow.currentStep}
                onSetFlowStep={learningFlow.setCurrentStep}
                prediction={learningFlow.prediction}
                isPredictionSaved={learningFlow.isPredictionSaved}
                onSavePrediction={learningFlow.savePrediction}
                explanationText={learningFlow.explanationText}
                isExplanationSaved={learningFlow.isExplanationSaved}
                onSaveExplanation={learningFlow.saveExplanation}
                quizScore={learningFlow.quizScore}
                onCompleteCheck={learningFlow.checkCompletion}
                observationData={learningFlow.observationData}
                status={learningFlow.status}
                onStartModule={learningFlow.startModule}
              />
            </div>
          </div>
        )}
      </div>

      {/* Screen reader live announcement region (PRD Section 9.1) */}
      <div
        id="vls-live-announcer"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </div>
  );
};

