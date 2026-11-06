import React, { useState, useEffect } from 'react';
import { ModuleSpec } from '../modules/types';
import { FlowStep } from './useLearningFlow';
import { ALL_MODULES } from '../modules/registry';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Target,
  BookOpen,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Award,
  Play,
  RotateCcw,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  BarChart2,
  FileText,
} from 'lucide-react';

interface ModuleWorkflowViewProps {
  moduleSpec: ModuleSpec;
  flowStep: FlowStep;
  onSetFlowStep: (step: FlowStep) => void;
  mode: 'textbook' | 'lab';
  prediction: string;
  isPredictionSaved: boolean;
  onSavePrediction: (ans: string, skipped?: boolean) => void;
  observationData: any;
  explanationText: string;
  isExplanationSaved: boolean;
  onSaveExplanation: (text: string) => void;
  quizScore: { score: number; max: number; attempts: number } | null;
  onCompleteCheck: (score: number, max: number, attempts: number) => void;
  recordInteraction: (key: string, payload?: any) => void;
  completedInteractions: Set<string>;
  status: 'not_started' | 'in_progress' | 'completed';
  onStartModule: () => void;
  onSelectModule: (moduleId: string) => void;
  onOpenQuiz: () => void;
}

export const ModuleWorkflowView: React.FC<ModuleWorkflowViewProps> = ({
  moduleSpec,
  flowStep,
  onSetFlowStep,
  mode,
  prediction,
  isPredictionSaved,
  onSavePrediction,
  observationData,
  explanationText,
  isExplanationSaved,
  onSaveExplanation,
  quizScore,
  onCompleteCheck,
  recordInteraction,
  completedInteractions,
  status,
  onStartModule,
  onSelectModule,
  onOpenQuiz,
}) => {
  // Local state for interactive steps
  const [selectedPrediction, setSelectedPrediction] = useState<string>(prediction || '');
  const [localExplain, setLocalExplain] = useState<string>(explanationText || '');
  const [explainError, setExplainError] = useState<string | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  // Check Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(quizScore !== null);
  const [attempts, setAttempts] = useState<number>(1);

  // Sync prediction / explanation when module changes
  useEffect(() => {
    setSelectedPrediction(prediction || '');
  }, [prediction, moduleSpec.meta.id]);

  useEffect(() => {
    setLocalExplain(explanationText || '');
    setExplainError(null);
  }, [explanationText, moduleSpec.meta.id]);

  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmitted(quizScore !== null);
  }, [moduleSpec.meta.id, quizScore]);

  // Find next module
  const currentIdx = ALL_MODULES.findIndex((m) => m.meta.id === moduleSpec.meta.id);
  const nextModule = currentIdx >= 0 && currentIdx < ALL_MODULES.length - 1 ? ALL_MODULES[currentIdx + 1] : null;

  // Handle prediction submit
  const handleConfirmPrediction = () => {
    if (!selectedPrediction) return;
    onSavePrediction(selectedPrediction, false);
    onSetFlowStep('INTERACT');
  };

  // Handle explanation submit
  const handleSaveExplain = () => {
    const trimmed = localExplain.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    if (words < 8) {
      setExplainError('Please write at least 8 words explaining your scientific reasoning.');
      return;
    }
    if (trimmed.length > 300) {
      setExplainError('Maximum 300 characters allowed.');
      return;
    }
    setExplainError(null);
    onSaveExplanation(trimmed);
  };

  // Handle quiz submit
  const handleSubmitQuiz = () => {
    let score = 0;
    moduleSpec.meta.checks.forEach((q) => {
      if (selectedAnswers[q.qid] === q.answer) {
        score++;
      }
    });

    setQuizSubmitted(true);
    onCompleteCheck(score, moduleSpec.meta.checks.length, attempts);

    if (score === moduleSpec.meta.checks.length) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setAttempts((prev) => prev + 1);
  };

  const wordCount = localExplain.trim() ? localExplain.trim().split(/\s+/).length : 0;

  // Common keywords bank for explanations
  const keywordBank = [
    'apical meristem',
    'cell division',
    'differentiation',
    'elongation',
    'xylem',
    'phloem',
    'epithelial tissue',
    'striations',
    'axon',
    'synapse',
    'ligament',
    'cartilage',
  ];

  /* ------------------------------------------------------------------ */
  /* STEP 1: OBJECTIVE VIEW                                             */
  /* ------------------------------------------------------------------ */
  if (flowStep === 'OBJECTIVE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            border: '1px solid #DBEAFE',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(51, 71, 168, 0.1)',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Step 1 of 6 · Core Objective
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text)', opacity: 0.7 }}>
              NCERT Class 9 · Chapter 3
            </span>
          </div>

          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
            {moduleSpec.meta.id}: {moduleSpec.meta.title}
          </h2>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '14px' }}>
            {moduleSpec.meta.subtitle}
          </div>

          <p style={{ margin: '0 0 16px 0', fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text)', maxWidth: '850px' }}>
            {moduleSpec.meta.objective}
          </p>

          {/* Key inquiry highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px' }}>
                🔬 Central Inquiry
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.4 }}>
                {moduleSpec.meta.predictPrompt}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                📚 NCERT Concept Link
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.4 }}>
                {moduleSpec.meta.category} — Structure, localization, and functional specialization.
              </div>
            </div>
          </div>
        </div>

        {/* Fact Cards Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
            Core Concepts You Will Investigate
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {moduleSpec.meta.notes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  borderLeft: '4px solid var(--primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '4px' }}>
                  {note.title}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text)' }}>{note.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => onSetFlowStep('INTERACT')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FlaskConical size={16} /> Jump Directly to Lab
          </button>

          <button
            type="button"
            onClick={() => {
              onStartModule();
              onSetFlowStep('PREDICT');
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
            }}
          >
            <span>Start Step 2: Make Your Prediction</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* STEP 2: PREDICT VIEW                                               */
  /* ------------------------------------------------------------------ */
  if (flowStep === 'PREDICT') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(51, 71, 168, 0.1)',
                color: 'var(--primary)',
                textTransform: 'uppercase',
              }}
            >
              Step 2 of 6 · Hypothesis Formulation
            </span>
            {isPredictionSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                <CheckCircle2 size={15} /> Hypothesis Saved
              </span>
            )}
          </div>

          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>
            What is your scientific hypothesis?
          </h3>

          <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
            {moduleSpec.meta.predictPrompt}
          </p>

          {/* Options List */}
          {moduleSpec.meta.predictOptions && moduleSpec.meta.predictOptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {moduleSpec.meta.predictOptions.map((opt, idx) => {
                const isSelected = selectedPrediction === opt;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPrediction(opt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPrediction(opt);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(51, 71, 168, 0.06)' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="prediction-option"
                      value={opt}
                      checked={isSelected}
                      onChange={() => setSelectedPrediction(opt)}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '0.92rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text)' }}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={selectedPrediction}
                onChange={(e) => setSelectedPrediction(e.target.value)}
                placeholder="Type your hypothesis prediction here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => onSetFlowStep('OBJECTIVE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Back to Objective
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  onSavePrediction('Hypothesis skipped', true);
                  onSetFlowStep('INTERACT');
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Skip to Lab
              </button>

              <button
                type="button"
                onClick={handleConfirmPrediction}
                disabled={!selectedPrediction}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: selectedPrediction ? 'pointer' : 'not-allowed',
                  opacity: selectedPrediction ? 1 : 0.5,
                  boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
                }}
              >
                <span>Save Hypothesis & Open Lab (Step 3)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* STEP 3: INTERACT (FULL SIMULATION)                                 */
  /* ------------------------------------------------------------------ */
  if (flowStep === 'INTERACT') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {/* Helper Hint Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Step 3 · Interactive Lab:</span>
            <span style={{ color: 'var(--text)', opacity: 0.85 }}>
              Manipulate experimental variables below. Observe changes and record data.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onSetFlowStep('OBSERVE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: '#ffffff',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <BarChart2 size={13} /> View Data (Step 4)
            </button>
            <button
              type="button"
              onClick={() => onSetFlowStep('CHECK')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--primary)',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={13} /> Check Quiz (Step 6)
            </button>
          </div>
        </div>

        {/* Simulation Component */}
        <moduleSpec.Component
          mode={mode}
          seed={42}
          flowStep={flowStep}
          recordInteraction={recordInteraction}
          completedInteractions={completedInteractions}
          onObservationUpdate={() => {}}
          resetSignal={0}
        />

        {/* Bottom Step Progression Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 18px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => onSetFlowStep('PREDICT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} /> Step 2: Prediction
          </button>

          <button
            type="button"
            onClick={() => onSetFlowStep('OBSERVE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>Proceed to Step 4: Observations & Data</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* STEP 4: OBSERVE VIEW                                               */
  /* ------------------------------------------------------------------ */
  if (flowStep === 'OBSERVE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(51, 71, 168, 0.1)',
                color: 'var(--primary)',
                textTransform: 'uppercase',
              }}
            >
              Step 4 of 6 · Empirical Data & Observations
            </span>
          </div>

          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>
            Experimental Observations & Comparative Data
          </h3>

          <p style={{ margin: '0 0 20px 0', fontSize: '0.92rem', color: 'var(--text)', opacity: 0.85 }}>
            Review the data generated during your experiment. Notice the divergence between control and experimental variables.
          </p>

          {/* Quick Simulation Component Embedded or Data Callouts */}
          <div
            style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '8px' }}>
              Scientific Deductions:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text)' }}>
              <li>
                <strong>Control Group:</strong> Intact tissue structures consistently undergo active cell proliferation, sustaining directional elongation.
              </li>
              <li>
                <strong>Treatment Group:</strong> Excision or disruption of meristematic/active zones halts tissue elongation immediately, confirming localization of growth zones.
              </li>
              <li>
                <strong>Structure-Function Link:</strong> Tissues are not uniformly dividing throughout the plant/animal body; dividing capability is confined to specific discrete zones.
              </li>
            </ul>
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => onSetFlowStep('INTERACT')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Return to Lab
            </button>

            <button
              type="button"
              onClick={() => onSetFlowStep('EXPLAIN')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
              }}
            >
              <span>Next: Write Scientific Explanation (Step 5)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* STEP 5: EXPLAIN VIEW                                               */
  /* ------------------------------------------------------------------ */
  if (flowStep === 'EXPLAIN') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(51, 71, 168, 0.1)',
                color: 'var(--primary)',
                textTransform: 'uppercase',
              }}
            >
              Step 5 of 6 · Scientific Reasoning
            </span>
            {isExplanationSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                <CheckCircle2 size={15} /> Explanation Saved
              </span>
            )}
          </div>

          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>
            Explain the Biological Mechanism
          </h3>

          <p style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.5 }}>
            Based on your experimental observations, explain why the tissue behaves this way. How does cellular specialization enable the organ's function?
          </p>

          {/* Keyword tags helper */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', opacity: 0.8 }}>
              Suggested Key Concepts:
            </span>
            {keywordBank.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  const spacer = localExplain.length > 0 && !localExplain.endsWith(' ') ? ' ' : '';
                  setLocalExplain((prev) => prev + spacer + term);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F1F5F9',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
                title="Click to insert into your explanation"
              >
                + {term}
              </button>
            ))}
          </div>

          <textarea
            value={localExplain}
            onChange={(e) => setLocalExplain(e.target.value)}
            placeholder="Write your explanation connecting tissue structure to physiological function (minimum 8 words)..."
            rows={5}
            maxLength={300}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.92rem',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: wordCount < 8 ? '#D97706' : 'var(--accent)', fontWeight: 600 }}>
              {wordCount} words (min 8) · {localExplain.length}/300 characters
            </span>

            <button
              type="button"
              onClick={handleSaveExplain}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isExplanationSaved ? '✓ Update Saved Explanation' : 'Save Explanation'}
            </button>
          </div>

          {explainError && (
            <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '8px', fontWeight: 600 }}>
              {explainError}
            </div>
          )}

          {/* Model Answer Accordion */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setShowModelAnswer((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                border: 'none',
                background: 'transparent',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {showModelAnswer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{showModelAnswer ? 'Hide Textbook Model Explanation' : 'View Textbook Scientific Model Explanation'}</span>
            </button>

            {showModelAnswer && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '14px 18px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #BFDBFE',
                  fontSize: '0.88rem',
                  lineHeight: 1.55,
                  color: '#1E3A8A',
                }}
              >
                <strong>NCERT Class 9 Chapter 3 Principle:</strong> Growth of plants occurs only in certain specific regions because the dividing tissue, also known as meristematic tissue, is located only at these points. When the apical tips containing actively dividing cells are cut, the region responsible for new cell proliferation is removed, permanently arresting elongation.
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => onSetFlowStep('OBSERVE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Step 4: Observations
            </button>

            <button
              type="button"
              onClick={() => onSetFlowStep('CHECK')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
              }}
            >
              <span>Next: Take Check Quiz (Step 6)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* STEP 6: CHECK QUIZ VIEW (THE SCREENSHOT ISSUE RESOLVED!)            */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(51, 71, 168, 0.1)',
              color: 'var(--primary)',
              textTransform: 'uppercase',
            }}
          >
            Step 6 of 6 · Knowledge Check Quiz
          </span>

          {quizScore && (
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: quizScore.score === quizScore.max ? '#ECFDF5' : '#FFFBEB',
                color: quizScore.score === quizScore.max ? '#065F46' : '#92400E',
                border: '1px solid',
                borderColor: quizScore.score === quizScore.max ? '#A7F3D0' : '#FDE68A',
              }}
            >
              Score: {quizScore.score}/{quizScore.max} ({Math.round((quizScore.score / quizScore.max) * 100)}%)
            </span>
          )}
        </div>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
          {moduleSpec.meta.title} — Knowledge Check
        </h3>

        <p style={{ margin: '0 0 20px 0', fontSize: '0.92rem', color: 'var(--text)', opacity: 0.85 }}>
          Test your mastery of NCERT Class 9 Chapter 3 concepts for this module. Immediate feedback and explanations will appear below each question.
        </p>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
          {moduleSpec.meta.checks.map((q, qIdx) => {
            const chosen = selectedAnswers[q.qid];
            const isCorrect = chosen === q.answer;

            return (
              <div
                key={q.qid}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
                  Question {qIdx + 1}: {q.prompt}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isOptionChosen = chosen === opt;
                    const isOptionCorrect = opt === q.answer;

                    let bg = '#FFFFFF';
                    let border = '1px solid var(--border)';
                    let textWeight = 500;

                    if (quizSubmitted) {
                      if (isOptionCorrect) {
                        bg = 'rgba(16, 185, 129, 0.12)';
                        border = '2px solid #10B981';
                        textWeight = 700;
                      } else if (isOptionChosen) {
                        bg = 'rgba(239, 68, 68, 0.1)';
                        border = '2px solid #EF4444';
                      }
                    } else if (isOptionChosen) {
                      bg = 'rgba(51, 71, 168, 0.08)';
                      border = '2px solid var(--primary)';
                      textWeight = 700;
                    }

                    return (
                      <label
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          backgroundColor: bg,
                          border: border,
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name={q.qid}
                          value={opt}
                          checked={isOptionChosen}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.qid]: opt })}
                          disabled={quizSubmitted}
                          style={{ cursor: quizSubmitted ? 'default' : 'pointer', transform: 'scale(1.15)' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: textWeight }}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Explanation feedback after submit */}
                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: isCorrect ? '#ECFDF5' : '#FEF2F2',
                      border: '1px solid',
                      borderColor: isCorrect ? '#A7F3D0' : '#FECACA',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      color: isCorrect ? '#065F46' : '#991B1B',
                    }}
                  >
                    <strong>{isCorrect ? '✓ Correct! ' : '✗ Note: '}</strong>
                    {q.why}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit / Retake Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {!quizSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < moduleSpec.meta.checks.length}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: Object.keys(selectedAnswers).length >= moduleSpec.meta.checks.length ? 'pointer' : 'not-allowed',
                opacity: Object.keys(selectedAnswers).length >= moduleSpec.meta.checks.length ? 1 : 0.5,
                boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
              }}
            >
              Submit Check Answers
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetakeQuiz}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: '#ffffff',
                color: 'var(--text)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Retake Check Quiz
            </button>
          )}
        </div>

        {/* Bottom Progression Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => onSetFlowStep('INTERACT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <FlaskConical size={16} /> Back to Simulation
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={onOpenQuiz}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--primary)',
                background: 'transparent',
                color: 'var(--primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <GraduationCap size={16} /> Take Chapter 3 Mastery Quiz
            </button>

            {nextModule && (
              <button
                type="button"
                onClick={() => {
                  onSelectModule(nextModule.meta.id);
                  onSetFlowStep('OBJECTIVE');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(51, 71, 168, 0.25)',
                }}
              >
                <span>Next: {nextModule.meta.id} {nextModule.meta.title}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

