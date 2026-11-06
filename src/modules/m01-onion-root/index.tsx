import React, { useState, useEffect, useRef } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Graph, DataSeries } from '../../shared/Graph';
import { Scissors, Ruler, ChevronRight, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';

const M01_CONFIG = designValues.M01;

export const M01OnionRoot: React.FC<ModuleComponentProps> = ({
  mode,
  seed,
  recordInteraction,
  onObservationUpdate,
  resetSignal,
}) => {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isCutApplied, setIsCutApplied] = useState<boolean>(false);
  const [showCutConfirm, setShowCutConfirm] = useState<boolean>(false);
  const [showCutIntroDialog, setShowCutIntroDialog] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Measurements recorded: index 0 = Day 1, etc.
  const [measuredA, setMeasuredA] = useState<(number | null)[]>([null, null, null, null, null, null, null]);
  const [measuredB, setMeasuredB] = useState<(number | null)[]>([null, null, null, null, null, null, null]);

  // Ruler state
  const [isMeasuringA, setIsMeasuringA] = useState<boolean>(false);
  const [isMeasuringB, setIsMeasuringB] = useState<boolean>(false);
  const [activeJar, setActiveJar] = useState<'A' | 'B'>('A');

  // Compute length for day according to PRD rules
  const getTheoreticalLength = (jar: 'A' | 'B', dayIndex: number, cut: boolean) => {
    let base = 0;
    if (jar === 'A') {
      base = M01_CONFIG.jarA_reference[dayIndex];
    } else {
      if (cut && dayIndex >= 3) {
        base = M01_CONFIG.jarB_cut_reference[dayIndex];
      } else {
        base = M01_CONFIG.jarB_uncut_reference[dayIndex];
      }
    }

    if (mode === 'lab') {
      // Seeded jitter +/- 0.15 cm
      const pseudoRand = Math.sin(seed * 100 + dayIndex * 13 + (jar === 'A' ? 7 : 3)) * M01_CONFIG.lab_mode_jitter_cm;
      base = Math.max(0.1, Number((base + pseudoRand).toFixed(1)));
    }
    return base;
  };

  // Reset when resetSignal changes
  useEffect(() => {
    setCurrentDay(1);
    setIsCutApplied(false);
    setShowCutConfirm(false);
    setWarningMessage(null);
    setMeasuredA([null, null, null, null, null, null, null]);
    setMeasuredB([null, null, null, null, null, null, null]);
  }, [resetSignal]);

  // Sync observations to parent learning flow
  useEffect(() => {
    if (onObservationUpdate) {
      onObservationUpdate({
        Table_3_1: {
          JarA_Control_cm: measuredA,
          JarB_TipsCut_cm: measuredB,
          CutApplied: isCutApplied,
          Mode: mode,
        },
      });
    }
  }, [measuredA, measuredB, isCutApplied, mode, onObservationUpdate]);

  const handleMeasure = (jar: 'A' | 'B') => {
    const dayIdx = currentDay - 1;
    const len = getTheoreticalLength(jar, dayIdx, isCutApplied);

    if (jar === 'A') {
      setIsMeasuringA(true);
      setTimeout(() => setIsMeasuringA(false), 600);
      setMeasuredA((prev) => {
        const next = [...prev];
        next[dayIdx] = len;
        return next;
      });
      recordInteraction(`measure_jarA_day${currentDay}`);
    } else {
      setIsMeasuringB(true);
      setTimeout(() => setIsMeasuringB(false), 600);
      setMeasuredB((prev) => {
        const next = [...prev];
        next[dayIdx] = len;
        return next;
      });
      recordInteraction(`measure_jarB_day${currentDay}`);
    }

    // Check if both measured for all 7 days
    const nextA = [...measuredA];
    const nextB = [...measuredB];
    if (jar === 'A') nextA[dayIdx] = len;
    if (jar === 'B') nextB[dayIdx] = len;

    const allAMeasured = nextA.every((v) => v !== null);
    const allBMeasured = nextB.every((v) => v !== null);
    if (allAMeasured && allBMeasured && isCutApplied) {
      recordInteraction('all_days_measured');
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCutClick = () => {
    if (isCutApplied) {
      showToast('✓ Jar B root tips were already cut on Day 3! Observe how elongation ceased.');
      return;
    }
    if (currentDay < 3) {
      setShowCutIntroDialog(true);
      return;
    }
    // If on Day 3 or later and not yet cut, auto-measure Days 1-3 if empty and prompt cut
    setMeasuredA((prev) => {
      const next = [...prev];
      for (let i = 0; i < currentDay; i++) {
        if (next[i] === null) next[i] = getTheoreticalLength('A', i, false);
      }
      return next;
    });
    setMeasuredB((prev) => {
      const next = [...prev];
      for (let i = 0; i < currentDay; i++) {
        if (next[i] === null) next[i] = getTheoreticalLength('B', i, false);
      }
      return next;
    });
    setWarningMessage(null);
    setShowCutConfirm(true);
  };

  const handleFastForwardAndCut = () => {
    // Fill in Days 1 to 3 baseline measurements
    setMeasuredA((prev) => {
      const next = [...prev];
      for (let i = 0; i < 3; i++) next[i] = getTheoreticalLength('A', i, false);
      return next;
    });
    setMeasuredB((prev) => {
      const next = [...prev];
      for (let i = 0; i < 3; i++) next[i] = getTheoreticalLength('B', i, false);
      return next;
    });
    setCurrentDay(3);
    setShowCutIntroDialog(false);
    setShowCutConfirm(true);
  };

  const confirmCut = () => {
    setIsCutApplied(true);
    setShowCutConfirm(false);
    recordInteraction('cut_applied');
    showToast('✂ 1 cm apical root tips excised from Jar B! Meristem cells removed.');
  };

  const handleMeasureBothAndNext = () => {
    const dayIdx = currentDay - 1;
    const lenA = getTheoreticalLength('A', dayIdx, isCutApplied);
    const lenB = getTheoreticalLength('B', dayIdx, isCutApplied);

    setIsMeasuringA(true);
    setIsMeasuringB(true);
    setTimeout(() => {
      setIsMeasuringA(false);
      setIsMeasuringB(false);
    }, 500);

    setMeasuredA((prev) => {
      const next = [...prev];
      next[dayIdx] = lenA;
      return next;
    });
    setMeasuredB((prev) => {
      const next = [...prev];
      next[dayIdx] = lenB;
      return next;
    });

    recordInteraction(`measure_jarA_day${currentDay}`);
    recordInteraction(`measure_jarB_day${currentDay}`);

    if (currentDay < 7) {
      setCurrentDay((prev) => prev + 1);
      showToast(`Recorded Day ${currentDay} lengths! Advanced to Day ${currentDay + 1}.`);
    } else {
      showToast('All 7 days recorded! Check the observation table and graph below.');
    }
  };

  const handleAutoRunAllDays = () => {
    setIsAutoPlaying(true);
    const newA = [...measuredA];
    const newB = [...measuredB];
    for (let d = 0; d < 7; d++) {
      newA[d] = getTheoreticalLength('A', d, d >= 3);
      newB[d] = getTheoreticalLength('B', d, d >= 3);
    }
    setMeasuredA(newA);
    setMeasuredB(newB);
    setIsCutApplied(true);
    setCurrentDay(7);
    recordInteraction('cut_applied');
    recordInteraction('all_days_measured');
    setTimeout(() => {
      setIsAutoPlaying(false);
      showToast('⚡ Auto-completed 7 days! Apical meristem in Jar B stopped growing on Day 3.');
    }, 600);
  };

  const handleCellEdit = (jar: 'A' | 'B', dayIdx: number, valStr: string) => {
    const parsed = parseFloat(valStr);
    const val = isNaN(parsed) ? null : Math.max(0, Math.min(10, parsed));
    if (jar === 'A') {
      setMeasuredA((prev) => {
        const next = [...prev];
        next[dayIdx] = val;
        return next;
      });
    } else {
      setMeasuredB((prev) => {
        const next = [...prev];
        next[dayIdx] = val;
        return next;
      });
    }
  };

  // Day navigation
  const nextDay = () => {
    if (currentDay < 7) {
      setCurrentDay((prev) => prev + 1);
      setWarningMessage(null);
    }
  };

  const prevDay = () => {
    if (currentDay > 1) {
      setCurrentDay((prev) => prev - 1);
      setWarningMessage(null);
    }
  };

  // Build graph series
  const graphSeries: DataSeries[] = [
    {
      id: 'jarA',
      label: 'Jar A (Control)',
      color: '#1F6F9F', // Okabe-Ito / token secondary
      markerShape: 'circle',
      data: measuredA,
    },
    {
      id: 'jarB',
      label: isCutApplied ? 'Jar B (Tips cut Day 3)' : 'Jar B (Uncut)',
      color: '#7A2E8E', // primary
      markerShape: 'diamond',
      lineDash: '4,4',
      data: measuredB,
    },
  ];

  // Faint ghost marker on Day 4 if cut was applied (PRD M01 spec: would-have-been 2.6 cm)
  const ghostMarkers =
    isCutApplied && currentDay >= 4
      ? [{ label: 'Would-be without cut', xIndex: 3, y: M01_CONFIG.day4_jarB_ghost_cm }]
      : [];

  const dayIndex = currentDay - 1;
  const currentLenA = getTheoreticalLength('A', dayIndex, isCutApplied);
  const currentLenB = getTheoreticalLength('B', dayIndex, isCutApplied);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Instructions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--surface)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
            Experimental Timeline:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={prevDay}
              disabled={currentDay === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                opacity: currentDay === 1 ? 0.4 : 1,
              }}
              aria-label="Previous day"
            >
              <ChevronLeft size={16} /> Day {currentDay - 1}
            </button>
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '4px 14px',
                borderRadius: '20px',
                background: 'var(--primary)',
                color: '#ffffff',
              }}
            >
              Day {currentDay} of 7
            </span>
            <button
              onClick={nextDay}
              disabled={currentDay === 7}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                opacity: currentDay === 7 ? 0.4 : 1,
              }}
              aria-label="Next day"
            >
              Day {currentDay + 1} <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick Simulation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={handleMeasureBothAndNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: '#F1F5F9',
              color: 'var(--text)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Record current day's measurements for both jars and advance to next day"
          >
            <Ruler size={16} color="var(--primary)" />
            <span>Measure & Next Day</span>
          </button>

          {/* Scissors Tool - Always interactive */}
          <button
            onClick={handleCutClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isCutApplied ? '#10B981' : currentDay >= 3 ? '#D97706' : '#EA580C',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease',
            }}
            title={
              isCutApplied
                ? 'Tips already cut on Day 3'
                : currentDay < 3
                  ? 'Click to learn when to cut or fast-forward to Day 3'
                  : 'Cut 1 cm off Jar B root tips'
            }
          >
            <Scissors size={17} />
            <span>
              {isCutApplied
                ? '✓ Jar B Tips Cut'
                : currentDay < 3
                  ? '✂ Cut Root Tips (Jar B)'
                  : '✂ Cut 1 cm Root Tips (Jar B)'}
            </span>
          </button>

          <button
            onClick={handleAutoRunAllDays}
            disabled={isAutoPlaying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--secondary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
            title="Auto-simulate all 7 days with Day 3 cut applied"
          >
            <RefreshCw size={14} className={isAutoPlaying ? 'animate-spin' : ''} />
            <span>Auto-Run 7 Days</span>
          </button>
        </div>
      </div>

      {/* Success / Info Toast */}
      {successToast && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #A7F3D0',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
          role="status"
        >
          <span>{successToast}</span>
        </div>
      )}

      {/* Warning / Notification Banner */}
      {warningMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#FDECEA',
            color: '#B71C1C',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #F5C6CB',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
          role="alert"
        >
          <AlertCircle size={18} />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Day 1 or Day 2 Early Cut Guidance Dialog */}
      {showCutIntroDialog && (
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #F59E0B',
            borderRadius: 'var(--radius-md)',
            padding: '18px 22px',
            boxShadow: 'var(--shadow-md)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scissors size={20} color="#D97706" />
            NCERT Activity 3.1: Apical Meristem Excision Rule
          </h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#78350F', lineHeight: 1.5 }}>
            In the textbook activity, root tips in both jars are allowed to grow for <strong>Days 1 to 3</strong> first to prove both bulbs can grow. On <strong>Day 3</strong>, about 1 cm is snipped off the root tips in Jar B to test if apical meristem removal stops elongation.
            <br />
            <em>You are currently on <strong>Day {currentDay}</strong>.</em>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={handleFastForwardAndCut}
              style={{
                padding: '8px 16px',
                backgroundColor: '#D97706',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Fast-Forward to Day 3 & Cut Root Tips
            </button>
            <button
              onClick={() => {
                setShowCutIntroDialog(false);
                handleMeasureBothAndNext();
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #D97706',
                color: '#92400E',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Measure Day {currentDay} & Advance
            </button>
            <button
              onClick={() => setShowCutIntroDialog(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #CBD5E1',
                color: 'var(--text)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCutConfirm && (
        <div
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-md)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>
            Confirm Apical Meristem Excision (Jar B)
          </h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text)' }}>
            Cut about 1 cm from the root tips of Jar B? This physically removes the apical
            meristem containing actively dividing cells.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={confirmCut}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Yes, Cut 1 cm Tips
            </button>
            <button
              onClick={() => setShowCutConfirm(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jars Simulation Stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Jar A (Control) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '1rem' }}>
              Jar A: Control
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8 }}>
              Intact Root Tips
            </span>
          </div>

          {/* SVG Apparatus for Jar A */}
          <svg viewBox="0 0 240 280" style={{ width: '100%', maxWidth: '240px', height: 'auto' }} role="img" aria-label="Jar A with onion bulb and growing roots">
            {/* Glass Jar Body */}
            <rect x="40" y="70" width="160" height="190" rx="16" fill="rgba(31, 111, 159, 0.08)" stroke="#1F6F9F" strokeWidth="2.5" />
            <path d="M 35 70 L 205 70" stroke="#1F6F9F" strokeWidth="3" />
            {/* Water level */}
            <rect x="42" y="85" width="156" height="172" rx="10" fill="rgba(86, 180, 233, 0.25)" />
            {/* Water surface meniscus */}
            <path d="M 42 85 Q 120 90 198 85" stroke="#56B4E9" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Onion Bulb */}
            <ellipse cx="120" cy="70" rx="42" ry="32" fill="#E8B87D" stroke="#A86F33" strokeWidth="2" />
            <ellipse cx="120" cy="65" rx="34" ry="25" fill="#F4D3A1" />
            {/* Onion layers texture */}
            <path d="M 100 48 Q 120 92 140 48" stroke="#A86F33" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 90 56 Q 120 98 150 56" stroke="#A86F33" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 120 40 L 120 30" stroke="#4C8C2B" strokeWidth="3" strokeLinecap="round" />

            {/* Root Bundle originating from base (y=90) */}
            {/* Root length in SVG units: 1 cm = ~22 svg pixels */}
            {Array.from({ length: 9 }).map((_, rIdx) => {
              const spread = (rIdx - 4) * 7;
              const rootLenPx = Math.min(150, currentLenA * 23);
              const endY = 92 + rootLenPx;
              return (
                <g key={rIdx}>
                  <path
                    d={`M ${120 + spread * 0.6} 90 Q ${120 + spread} ${90 + rootLenPx * 0.5} ${120 + spread * 1.1} ${endY}`}
                    stroke="#F7FAFC"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Apical meristem tip cap */}
                  <circle cx={120 + spread * 1.1} cy={endY} r="2.2" fill="#7A2E8E" />
                </g>
              );
            })}

            {/* Measurement caliper animation when reading */}
            {isMeasuringA && (
              <g className="ruler-caliper">
                <line x1="20" y1="90" x2="215" y2="90" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="20" y1={92 + currentLenA * 23} x2="215" y2={92 + currentLenA * 23} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3,3" />
                <rect x="180" y="90" width="30" height={currentLenA * 23} fill="rgba(178, 74, 0, 0.15)" stroke="var(--accent)" strokeWidth="1" />
              </g>
            )}
          </svg>

          {/* Readout & Measure button */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Current length: <strong>{currentLenA.toFixed(1)} cm</strong>
            </div>
            <button
              onClick={() => handleMeasure('A')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                backgroundColor: 'var(--secondary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Ruler size={16} />
              <span>Record Day {currentDay} Reading</span>
            </button>
          </div>
        </div>

        {/* Jar B (Treatment) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
              Jar B: {isCutApplied ? 'Tips Cut' : 'Treatment (Uncut)'}
            </span>
            <span style={{ fontSize: '0.85rem', color: isCutApplied ? 'var(--accent)' : 'var(--text)', fontWeight: isCutApplied ? 700 : 400 }}>
              {isCutApplied ? 'Tips Cut on Day 3' : 'Tip Intact'}
            </span>
          </div>

          {/* SVG Apparatus for Jar B */}
          <svg viewBox="0 0 240 280" style={{ width: '100%', maxWidth: '240px', height: 'auto' }} role="img" aria-label="Jar B with onion bulb and roots">
            {/* Glass Jar Body */}
            <rect x="40" y="70" width="160" height="190" rx="16" fill="rgba(122, 46, 142, 0.08)" stroke="#7A2E8E" strokeWidth="2.5" />
            <path d="M 35 70 L 205 70" stroke="#7A2E8E" strokeWidth="3" />
            {/* Water level */}
            <rect x="42" y="85" width="156" height="172" rx="10" fill="rgba(86, 180, 233, 0.25)" />
            <path d="M 42 85 Q 120 90 198 85" stroke="#56B4E9" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Onion Bulb */}
            <ellipse cx="120" cy="70" rx="42" ry="32" fill="#E8B87D" stroke="#A86F33" strokeWidth="2" />
            <ellipse cx="120" cy="65" rx="34" ry="25" fill="#F4D3A1" />
            <path d="M 100 48 Q 120 92 140 48" stroke="#A86F33" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 90 56 Q 120 98 150 56" stroke="#A86F33" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 120 40 L 120 30" stroke="#4C8C2B" strokeWidth="3" strokeLinecap="round" />

            {/* Root Bundle for Jar B */}
            {Array.from({ length: 9 }).map((_, rIdx) => {
              const spread = (rIdx - 4) * 7;
              const rootLenPx = Math.min(150, currentLenB * 23);
              const endY = 92 + rootLenPx;
              return (
                <g key={rIdx}>
                  <path
                    d={`M ${120 + spread * 0.6} 90 Q ${120 + spread} ${90 + rootLenPx * 0.5} ${120 + spread * 1.1} ${endY}`}
                    stroke="#F7FAFC"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap={isCutApplied ? 'butt' : 'round'}
                  />
                  {/* If intact, tip cap; if cut, flat end without dividing zone */}
                  {!isCutApplied ? (
                    <circle cx={120 + spread * 1.1} cy={endY} r="2.2" fill="#7A2E8E" />
                  ) : (
                    <line
                      x1={120 + spread * 1.1 - 2.5}
                      y1={endY}
                      x2={120 + spread * 1.1 + 2.5}
                      y2={endY}
                      stroke="var(--accent)"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Measurement caliper animation */}
            {isMeasuringB && (
              <g className="ruler-caliper">
                <line x1="20" y1="90" x2="215" y2="90" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="20" y1={92 + currentLenB * 23} x2="215" y2={92 + currentLenB * 23} stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3,3" />
                <rect x="180" y="90" width="30" height={currentLenB * 23} fill="rgba(122, 46, 142, 0.15)" stroke="var(--primary)" strokeWidth="1" />
              </g>
            )}
          </svg>

          {/* Readout & Measure button */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Current length: <strong>{currentLenB.toFixed(1)} cm</strong>
            </div>
            <button
              onClick={() => handleMeasure('B')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Ruler size={16} />
              <span>Record Day {currentDay} Reading</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table 3.1 & Line Graph Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Table 3.1: Observations of Root Length (cm) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text)' }}>
            Table 3.1: Growth of Roots in Onions (cm)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', opacity: 0.8, marginBottom: '12px' }}>
            Auto-recorded from caliper measurements; you may also edit cells directly.
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Specimen</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <th key={d} style={{ padding: '8px 6px', fontWeight: 600 }}>
                      Day {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--secondary)' }}>
                    Jar A (Control)
                  </td>
                  {measuredA.map((val, idx) => (
                    <td key={idx} style={{ padding: '4px' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={val !== null ? val : ''}
                        placeholder="—"
                        onChange={(e) => handleCellEdit('A', idx, e.target.value)}
                        style={{
                          width: '44px',
                          textAlign: 'center',
                          padding: '4px 2px',
                          borderRadius: '4px',
                          border: currentDay === idx + 1 ? '2px solid var(--secondary)' : '1px solid var(--border)',
                          backgroundColor: val !== null ? 'rgba(31, 111, 159, 0.08)' : 'transparent',
                          color: 'var(--text)',
                          fontWeight: val !== null ? 600 : 400,
                        }}
                        aria-label={`Jar A Day ${idx + 1} length`}
                      />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>
                    Jar B ({isCutApplied ? 'Cut' : 'Uncut'})
                  </td>
                  {measuredB.map((val, idx) => (
                    <td key={idx} style={{ padding: '4px' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={val !== null ? val : ''}
                        placeholder="—"
                        onChange={(e) => handleCellEdit('B', idx, e.target.value)}
                        style={{
                          width: '44px',
                          textAlign: 'center',
                          padding: '4px 2px',
                          borderRadius: '4px',
                          border: currentDay === idx + 1 ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: val !== null ? 'rgba(122, 46, 142, 0.08)' : 'transparent',
                          color: 'var(--text)',
                          fontWeight: val !== null ? 600 : 400,
                        }}
                        aria-label={`Jar B Day ${idx + 1} length`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {currentDay >= 7 && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(178, 74, 0, 0.08)',
                borderLeft: '4px solid var(--accent)',
                fontSize: '0.85rem',
                lineHeight: 1.4,
              }}
            >
              <strong>Scientific Conclusion:</strong> Roots in Jar A kept growing in length (reaching{' '}
              {measuredA[6] ?? '5.8'} cm). Roots in Jar B stopped growing after the tips were excised on Day 3
              (remaining at {measuredB[6] ?? '1.6'} cm). This proves roots grow in length strictly from apical
              meristem dividing cells situated in their tips.
            </div>
          )}
        </div>

        {/* Live Line Graph */}
        <div>
          <Graph
            title="Root Length Progression (Days 1–7)"
            xLabels={['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']}
            yMin={0}
            yMax={M01_CONFIG.graph_y_max}
            yStep={M01_CONFIG.graph_y_step}
            yUnit="cm"
            series={graphSeries}
            ghostSeries={ghostMarkers}
          />
        </div>
      </div>
    </div>
  );
};

export const M01Spec: ModuleSpec = {
  meta: {
    id: 'M01',
    title: 'Onion Root-Growth Experiment',
    subtitle: 'Apical Meristem in Action',
    category: 'Plant Tissues',
    themeId: 'M01',
    objective:
      'Show that roots grow in length from their tips, because the tips hold actively dividing cells (apical meristem).',
    predictPrompt:
      'One onion has its root tips cut on Day 3. What will happen to its roots afterwards?',
    predictOptions: [
      'Stops growing (apical cells removed)',
      'Keeps growing like Jar A',
      'Grows faster to heal itself',
      'Dies immediately',
    ],
    notes: [
      {
        title: 'Apical Meristem',
        text: 'Root tips contain cells that divide again and again. This tissue is called apical meristem.',
      },
      {
        title: 'Growth Location',
        text: 'Growth in plants occurs only in specific regions where dividing cells reside.',
      },
      {
        title: 'Chapter 2 Mitosis Link',
        text: 'You saw actively dividing cells undergoing mitosis in onion root tips in Chapter 2.',
      },
    ],
    checks: [
      {
        qid: 'M01_Q1',
        prompt: 'Which tissue is responsible for growth in length of a root?',
        options: [
          'Apical meristem (at the root tip)',
          'Lateral meristem',
          'Intercalary meristem',
          'Sclerenchyma',
        ],
        answer: 'Apical meristem (at the root tip)',
        why: 'Apical meristem is located at the growing root and shoot tips and increases the length of the plant organ.',
      },
      {
        qid: 'M01_Q2',
        prompt: 'Why did the roots in Jar B stop growing after cutting?',
        options: [
          'The dividing cells in the tips were removed',
          'The onion ran out of stored starch',
          'Water could no longer enter the roots',
          'Light was blocked from reaching the jar',
        ],
        answer: 'The dividing cells in the tips were removed',
        why: 'Removing the tip removes the apical meristem. Without these actively dividing cells, no new elongation can occur.',
      },
    ],
    requiredInteractions: ['cut_applied', 'all_days_measured'],
  },
  Component: M01OnionRoot,
};
