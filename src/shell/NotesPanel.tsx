import React, { useState } from 'react';
import { ModuleSpec } from '../modules/types';
import { FlowStep } from './useLearningFlow';
import {
  BookOpen,
  HelpCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Award,
  ChevronRight,
  Target,
} from 'lucide-react';

interface NotesPanelProps {
  moduleSpec: ModuleSpec;
  flowStep: FlowStep;
  onSetFlowStep: (step: FlowStep) => void;
  prediction: string;
  isPredictionSaved: boolean;
  onSavePrediction: (ans: string, skipped?: boolean) => void;
  explanationText: string;
  isExplanationSaved: boolean;
  onSaveExplanation: (text: string) => void;
  quizScore: { score: number; max: number; attempts: number } | null;
  onCompleteCheck: (score: number, max: number, attempts: number) => void;
  observationData: any;
  status: 'not_started' | 'in_progress' | 'completed';
  onStartModule: () => void;
  className?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  moduleSpec,
  flowStep,
  onSetFlowStep,
  prediction,
  isPredictionSaved,
  onSavePrediction,
  explanationText,
  isExplanationSaved,
  onSaveExplanation,
  quizScore,
  onCompleteCheck,
  observationData,
  status,
  onStartModule,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'notes' | 'checks'>('flow');

  // Prediction input state
  const [localPred, setLocalPred] = useState<string>(prediction || '');

  // Explanation input state
  const [localExplain, setLocalExplain] = useState<string>(explanationText || '');
  const [explainError, setExplainError] = useState<string | null>(null);

  // Check Quiz answers state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(quizScore !== null);
  const [attemptsCount, setAttemptsCount] = useState<number>(1);

  // Validate explanation (PRD 5.2: min 8 words, max 300 characters)
  const handleSaveExplainClick = () => {
    const trimmed = localExplain.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    if (wordCount < 8) {
      setExplainError('Please provide at least 8 words explaining your scientific reasoning.');
      return;
    }
    if (trimmed.length > 300) {
      setExplainError('Maximum 300 characters allowed.');
      return;
    }

    setExplainError(null);
    onSaveExplanation(trimmed);
  };

  // Submit check quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    moduleSpec.meta.checks.forEach((q) => {
      if (selectedAnswers[q.qid] === q.answer) {
        score++;
      }
    });

    setQuizSubmitted(true);
    onCompleteCheck(score, moduleSpec.meta.checks.length, attemptsCount);
  };

  const wordCount = localExplain.trim() ? localExplain.trim().split(/\s+/).length : 0;

  return (
    <aside
      className={`vls-notes-panel ${className}`}
      style={{
        width: '340px',
        minWidth: '340px',
        backgroundColor: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 54px)',
        overflowY: 'auto',
      }}
      aria-label="Notes, Learning Flow and Checks"
    >
      {/* Top Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(0, 0, 0, 0.015)',
        }}
        role="tablist"
      >
        {[
          { id: 'flow', label: 'Learning Flow', icon: <Target size={14} /> },
          { id: 'notes', label: 'Fact Cards', icon: <BookOpen size={14} /> },
          { id: 'checks', label: 'Check Quiz', icon: <CheckCircle2 size={14} /> },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                borderBottom: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isSelected ? 'var(--primary)' : 'var(--text)',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 6-Step Learning Flow (PRD Section 5.2) */}
      {activeTab === 'flow' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1: OBJECTIVE */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: flowStep === 'OBJECTIVE' ? 'rgba(51, 71, 168, 0.08)' : 'rgba(0,0,0,0.02)',
              border: flowStep === 'OBJECTIVE' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Step 1 · Objective
              </span>
              {status !== 'not_started' && <CheckCircle2 size={14} color="var(--accent)" />}
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text)' }}>
              {moduleSpec.meta.objective}
            </p>
            {flowStep === 'OBJECTIVE' && (
              <button
                type="button"
                onClick={onStartModule}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Begin Prediction <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Step 2: PREDICT */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: flowStep === 'PREDICT' ? 'rgba(51, 71, 168, 0.08)' : 'rgba(0,0,0,0.02)',
              border: flowStep === 'PREDICT' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Step 2 · Predict Hypothesis
              </span>
              {isPredictionSaved && <CheckCircle2 size={14} color="var(--accent)" />}
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
              {moduleSpec.meta.predictPrompt}
            </p>

            {moduleSpec.meta.predictOptions ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {moduleSpec.meta.predictOptions.map((opt, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      backgroundColor: localPred === opt ? 'rgba(51, 71, 168, 0.1)' : 'transparent',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="prediction"
                      value={opt}
                      checked={localPred === opt}
                      onChange={(e) => setLocalPred(e.target.value)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={localPred}
                onChange={(e) => setLocalPred(e.target.value)}
                placeholder="Enter your hypothesis..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => onSavePrediction(localPred, false)}
                disabled={!localPred}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: localPred ? 'pointer' : 'default',
                  opacity: localPred ? 1 : 0.5,
                }}
              >
                Save Hypothesis
              </button>
              <button
                type="button"
                onClick={() => onSavePrediction('Hypothesis skipped', true)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
            </div>
          </div>

          {/* Step 3: INTERACT (Completed in simulation canvas) */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: flowStep === 'INTERACT' ? 'rgba(51, 71, 168, 0.08)' : 'rgba(0,0,0,0.02)',
              border: flowStep === 'INTERACT' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
              Step 3 · Interact & Experiment
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text)', opacity: 0.85 }}>
              Manipulate the simulation controls in the centre stage to gather empirical data and observe anatomical structures.
            </p>
          </div>

          {/* Step 4: EXPLAIN */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Step 4 · Scientific Explanation
              </span>
              {isExplanationSaved && <CheckCircle2 size={14} color="var(--accent)" />}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
              Why did this happen? Explain the structure-to-function link:
            </p>

            <textarea
              value={localExplain}
              onChange={(e) => setLocalExplain(e.target.value)}
              placeholder="Write your explanation here (min 8 words)..."
              rows={3}
              maxLength={300}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.7 }}>
                {wordCount} words · {localExplain.length}/300 chars
              </span>
              <button
                type="button"
                onClick={handleSaveExplainClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Save size={13} /> {isExplanationSaved ? 'Updated' : 'Save'}
              </button>
            </div>
            {explainError && (
              <div style={{ color: '#D55E00', fontSize: '0.74rem', marginTop: '4px', fontWeight: 600 }}>
                {explainError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Concise Fact Cards (PRD Section 5.3: max 25 words per card) */}
      {activeTab === 'notes' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8, fontWeight: 600 }}>
            Curated NCERT Class 9 Chapter 3 Key Concept Summaries:
          </div>
          {moduleSpec.meta.notes.map((note, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderLeft: '4px solid var(--primary)',
                borderTop: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                {note.title}
              </div>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--text)' }}>{note.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Module Check Questions (PRD Section 5.2 Check Step) */}
      {activeTab === 'checks' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              Knowledge Check Questions
            </span>
            {quizScore && (
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                Score: {quizScore.score}/{quizScore.max}
              </span>
            )}
          </div>

          {moduleSpec.meta.checks.map((q, qIndex) => {
            const chosen = selectedAnswers[q.qid];
            const isCorrect = chosen === q.answer;

            return (
              <div
                key={q.qid}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                  {qIndex + 1}. {q.prompt}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {q.options.map((opt, optIndex) => {
                    const isOptionChosen = chosen === opt;
                    return (
                      <label
                        key={optIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.78rem',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            quizSubmitted && opt === q.answer
                              ? 'rgba(0, 158, 115, 0.12)'
                              : isOptionChosen
                              ? 'rgba(51, 71, 168, 0.08)'
                              : 'transparent',
                          border:
                            quizSubmitted && opt === q.answer
                              ? '1px solid var(--accent)'
                              : isOptionChosen
                              ? '1px solid var(--primary)'
                              : '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={q.qid}
                          value={opt}
                          checked={isOptionChosen}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.qid]: opt })}
                          disabled={quizSubmitted}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: isCorrect ? 'rgba(0, 158, 115, 0.08)' : 'rgba(213, 94, 0, 0.08)',
                      fontSize: '0.75rem',
                      lineHeight: 1.35,
                    }}
                  >
                    <strong>{isCorrect ? '✓ Correct!' : '✗ Correction:'}</strong> {q.why}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length < moduleSpec.meta.checks.length}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: Object.keys(selectedAnswers).length >= moduleSpec.meta.checks.length ? 'pointer' : 'default',
              opacity: Object.keys(selectedAnswers).length >= moduleSpec.meta.checks.length ? 1 : 0.5,
            }}
          >
            {quizSubmitted ? 'Re-Submit Check Answers' : 'Submit Check Answers'}
          </button>
        </div>
      )}
    </aside>
  );
};

