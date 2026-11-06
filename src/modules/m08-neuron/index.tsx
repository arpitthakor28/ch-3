import React, { useState, useEffect, useRef } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Play, Pause, RotateCcw, StepForward, Award, CheckCircle2, HelpCircle, ArrowRight, Zap } from 'lucide-react';

const M08_CONFIG = designValues.M08;

interface NeuronPart {
  id: string;
  name: string;
  role: string;
  targetX: number;
  targetY: number;
  detail: string;
}

const NEURON_PARTS: NeuronPart[] = [
  {
    id: 'dendrites',
    name: 'Dendrites',
    role: 'Receives signals from sensory receptors or neighboring neurons',
    targetX: 85,
    targetY: 130,
    detail: 'Branched tree-like projections extending from cyton that catch incoming chemical & electrical signals.',
  },
  {
    id: 'cell_body',
    name: 'Cell Body (Cyton)',
    role: 'Central processing hub containing cytoplasm and major organelles',
    targetX: 190,
    targetY: 150,
    detail: 'Controls metabolic activity and integrates incoming impulses before initiating transmission down the axon.',
  },
  {
    id: 'nucleus',
    name: 'Nucleus',
    role: 'Directs all cellular functions and houses genetic material',
    targetX: 185,
    targetY: 135,
    detail: 'Large, prominent central nucleus typical of metabolically active nerve cells.',
  },
  {
    id: 'axon',
    name: 'Axon',
    role: 'Long solitary conducting fibre carrying impulses away from cyton',
    targetX: 420,
    targetY: 150,
    detail: 'Can measure up to a metre in length; rapidly propels the nerve impulse toward distant muscles or glands.',
  },
  {
    id: 'axon_terminals',
    name: 'Axon Terminals',
    role: 'Transmits message across junction to the next neuron or muscle fibre',
    targetX: 620,
    targetY: 150,
    detail: 'Fine terminal branches ending in knob-like endings that release neurotransmitter transmitters to trigger the next cell.',
  },
];

export const M08NeuronSignal: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [activePartId, setActivePartId] = useState<string>('dendrites');
  const [clickedParts, setClickedParts] = useState<Set<string>>(new Set(['dendrites']));

  // Signal Animation State
  const [isSignalPlaying, setIsSignalPlaying] = useState<boolean>(false);
  const [signalProgress, setSignalProgress] = useState<number>(0); // 0 to 1 along neuron path
  const [hasPlayedFullSignal, setHasPlayedFullSignal] = useState<boolean>(false);

  // Labeling Mode State
  const [isLabelingMode, setIsLabelingMode] = useState<boolean>(false);
  const [placedLabels, setPlacedLabels] = useState<Record<string, string>>({}); // partId -> labelName
  const [labelHint, setLabelHint] = useState<string | null>(null);
  const [selectedLabelToPlace, setSelectedLabelToPlace] = useState<string | null>(null);

  // Reflex arc context toggle
  const [showReflexStrip, setShowReflexStrip] = useState<boolean>(false);

  // Signal ticker
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isSignalPlaying) {
        setSignalProgress((prev) => {
          const next = prev + dt * 0.45; // takes ~2.2s for full traversal
          if (next >= 1) {
            setIsSignalPlaying(false);
            setHasPlayedFullSignal(true);
            recordInteraction('signal_played_fully');
            return 1;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSignalPlaying, recordInteraction]);

  const handleSelectPart = (id: string) => {
    setActivePartId(id);
    const updated = new Set(clickedParts);
    updated.add(id);
    setClickedParts(updated);

    if (updated.size >= 5) {
      recordInteraction('all_parts_clicked');
    }
  };

  const handlePlaySignal = () => {
    if (signalProgress >= 1) {
      setSignalProgress(0);
    }
    setIsSignalPlaying(true);
  };

  const handlePauseSignal = () => {
    setIsSignalPlaying(false);
  };

  const handleResetSignal = () => {
    setIsSignalPlaying(false);
    setSignalProgress(0);
  };

  const handleStepSignal = () => {
    setIsSignalPlaying(false);
    setSignalProgress((prev) => {
      const next = Math.min(1, prev + 0.25);
      if (next >= 1) {
        setHasPlayedFullSignal(true);
        recordInteraction('signal_played_fully');
      }
      return next;
    });
  };

  // Labeling challenge placement
  const handlePlaceLabelOnTarget = (partId: string) => {
    if (!selectedLabelToPlace) {
      setLabelHint('Select a label chip below first, then click a target node on the neuron.');
      return;
    }

    const correctPart = NEURON_PARTS.find((p) => p.id === partId);
    if (!correctPart) return;

    if (correctPart.name === selectedLabelToPlace) {
      const next = { ...placedLabels, [partId]: selectedLabelToPlace };
      setPlacedLabels(next);
      setLabelHint(`Correct! ${correctPart.name} is placed.`);
      setSelectedLabelToPlace(null);

      if (Object.keys(next).length >= 5) {
        recordInteraction('labelling_mode_completed');
        if (onObservationUpdate) {
          onObservationUpdate({ labelingDone: true });
        }
      }
    } else {
      setLabelHint(`Not quite! Remember: ${correctPart.role}. Try again!`);
    }
  };

  const resetLabeling = () => {
    setPlacedLabels({});
    setLabelHint(null);
    setSelectedLabelToPlace(null);
  };

  // Map progress to X coordinate on SVG (from Dendrites x=80 to Terminals x=630)
  const pulseX = 75 + signalProgress * (630 - 75);
  const pulseY = 145 + Math.sin(signalProgress * Math.PI * 4) * 6;

  const currentPart = NEURON_PARTS.find((p) => p.id === activePartId) || NEURON_PARTS[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1050px',
        margin: '0 auto',
      }}
    >
      {/* Top Bar: Playback Controls & Mode Switch */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Signal Flow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={isSignalPlaying ? handlePauseSignal : handlePlaySignal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#15122F',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {isSignalPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isSignalPlaying ? 'Pause Impulse' : 'Send Nerve Impulse'}
          </button>

          <button
            type="button"
            onClick={handleStepSignal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <StepForward size={14} /> Step
          </button>

          <button
            type="button"
            onClick={handleResetSignal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Mode Switch: Explorer vs Labeling */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsLabelingMode(false)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: !isLabelingMode ? '2px solid var(--secondary)' : '1px solid var(--border)',
              backgroundColor: !isLabelingMode ? 'var(--secondary)' : 'transparent',
              color: !isLabelingMode ? '#15122F' : 'var(--text)',
              fontSize: '0.78rem',
              fontWeight: !isLabelingMode ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            Anatomy Explorer
          </button>

          <button
            type="button"
            onClick={() => setIsLabelingMode(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: isLabelingMode ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: isLabelingMode ? 'var(--primary)' : 'transparent',
              color: isLabelingMode ? '#15122F' : 'var(--text)',
              fontSize: '0.78rem',
              fontWeight: isLabelingMode ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            Labeling Challenge
          </button>

          <button
            type="button"
            onClick={() => setShowReflexStrip(!showReflexStrip)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: showReflexStrip ? 'rgba(255, 143, 177, 0.2)' : 'transparent',
              color: showReflexStrip ? 'var(--accent)' : 'var(--text)',
              fontSize: '0.76rem',
              cursor: 'pointer',
            }}
          >
            {showReflexStrip ? 'Hide Reflex Arc' : 'Show Reflex Arc'}
          </button>
        </div>
      </div>

      {/* Main Neuron Diagram SVG Canvas */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
        }}
      >
        {/* Signal Direction Indicator Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              Signal Vector: Dendrite → Cyton → Axon → Terminals → Target Cell
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
            One-way impulse propagation (No backward signal)
          </span>
        </div>

        {/* Large Original SVG Neuron */}
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <svg viewBox="0 0 780 280" width="100%" height="280" aria-label="Detailed 3D motor neuron diagram">
            <defs>
              <filter id="m08-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.15" />
              </filter>
              <radialGradient id="cyton3d" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="45%" stopColor="#8B5CF6" />
                <stop offset="85%" stopColor="#6D28D9" />
                <stop offset="100%" stopColor="#4C1D95" />
              </radialGradient>
              <radialGradient id="nucleus3d" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="85%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </radialGradient>
              <linearGradient id="axonCable3d" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <linearGradient id="schwann3d" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="40%" stopColor="#3B82F6" />
                <stop offset="85%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
              <radialGradient id="pulse-glow">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background direction arrow */}
            <path
              d="M 120 40 L 640 40"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.4"
            />
            <polygon points="645,40 635,35 635,45" fill="var(--primary)" opacity="0.6" />
            <text x="380" y="32" fill="var(--primary)" fontSize="11" fontWeight="700" textAnchor="middle" opacity="0.8">
              DIRECTION OF NERVE IMPULSE →
            </text>

            {/* 1. DENDRITES (Branched arborizations on left) */}
            <g id="dendrite-branches" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" filter="url(#m08-shadow)">
              <path d="M 155 145 C 130 115 100 100 65 95" />
              <path d="M 100 100 L 75 75" />
              <path d="M 155 145 C 120 145 90 145 50 140" />
              <path d="M 90 145 L 60 170" />
              <path d="M 155 155 C 130 185 100 205 60 215" />
              <path d="M 100 205 L 75 235" />
            </g>

            {/* 2. CELL BODY / CYTON (Soma) in 3D */}
            <path
              d="M 155 125 C 140 100 180 80 205 100 C 230 115 235 140 240 145 L 265 148 L 265 152 L 240 155 C 230 175 190 195 165 175 C 145 155 145 135 155 125 Z"
              fill="url(#cyton3d)"
              stroke="#5B21B6"
              strokeWidth="2.5"
              filter="url(#m08-shadow)"
            />

            {/* 3. NUCLEUS in 3D */}
            <circle cx="185" cy="142" r="18" fill="url(#nucleus3d)" stroke="#B45309" strokeWidth="2" filter="url(#m08-shadow)" />
            <circle cx="182" cy="139" r="6" fill="#FFFFFF" opacity="0.6" />
            <text x="185" y="174" fill="#1E293B" fontSize="9" fontWeight="800" textAnchor="middle">
              Nucleus
            </text>

            {/* 4. AXON CYLINDER */}
            <line x1="265" y1="150" x2="600" y2="150" stroke="url(#axonCable3d)" strokeWidth="6" />

            {/* Myelin Sheath Schwann Cells & Nodes (3D pillows) */}
            {[
              { x: 275, w: 55 },
              { x: 345, w: 55 },
              { x: 415, w: 55 },
              { x: 485, w: 55 },
              { x: 555, w: 40 },
            ].map((sheath, idx) => (
              <g key={idx} filter="url(#m08-shadow)">
                {/* Sheath segment in 3D */}
                <rect
                  x={sheath.x}
                  y="136"
                  width={sheath.w}
                  height="28"
                  rx="7"
                  fill="url(#schwann3d)"
                  stroke="#1E40AF"
                  strokeWidth="1.5"
                />
                {/* 3D Specular highlight streak on myelin */}
                <line x1={sheath.x + 6} y1="140" x2={sheath.x + sheath.w - 6} y2="140" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                {/* Schwann cell nucleus */}
                <circle cx={sheath.x + sheath.w / 2} cy="150" r="3.5" fill="#FFFFFF" opacity="0.8" />
              </g>
            ))}

            {/* 5. AXON TERMINALS (3D synaptic end-bulbs) */}
            <g id="terminals" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" filter="url(#m08-shadow)">
              <path d="M 600 150 C 625 130 645 105 670 100" />
              <circle cx="670" cy="100" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

              <path d="M 600 150 L 675 150" />
              <circle cx="675" cy="150" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

              <path d="M 600 150 C 625 170 645 195 670 200" />
              <circle cx="670" cy="200" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            </g>

            {/* TARGET EFFECTOR CELL: Striated Muscle Fibre */}
            <g id="muscle-target" filter="url(#m08-shadow)">
              <rect x="710" y="80" width="55" height="140" rx="8" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
              {[95, 110, 125, 140, 155, 170, 185, 200].map((y) => (
                <line key={y} x1="710" y1={y} x2="765" y2={y} stroke="#DC2626" strokeWidth="1.5" opacity="0.5" />
              ))}
              <text x="737" y="155" fill="#991B1B" fontSize="10" fontWeight="800" textAnchor="middle">
                Muscle
              </text>
              <text x="737" y="168" fill="#2563EB" fontSize="8" fontWeight="700" textAnchor="middle">
                Effector
              </text>
            </g>

            {/* Interactive Anatomical Click/Drop Hotspots */}
            {NEURON_PARTS.map((part) => {
              const isSelected = activePartId === part.id;
              const isPlaced = placedLabels[part.id];

              return (
                <g
                  key={part.id}
                  onClick={() => {
                    if (isLabelingMode) {
                      handlePlaceLabelOnTarget(part.id);
                    } else {
                      handleSelectPart(part.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${part.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (isLabelingMode) handlePlaceLabelOnTarget(part.id);
                      else handleSelectPart(part.id);
                    }
                  }}
                >
                  <circle
                    cx={part.targetX}
                    cy={part.targetY}
                    r={isSelected ? 10 : 7}
                    fill={isPlaced ? 'var(--accent)' : isSelected ? 'var(--primary)' : '#64748B'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  {isSelected && (
                    <circle
                      cx={part.targetX}
                      cy={part.targetY}
                      r="16"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  )}
                  {(!isLabelingMode || isPlaced) && (
                    <text
                      x={part.targetX}
                      y={part.targetY - 14}
                      fill="#0F172A"
                      fontSize="10"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {part.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Animated Traveling Nerve Impulse Pulse */}
            {signalProgress > 0 && signalProgress < 1 && (
              <g>
                <circle cx={pulseX} cy={pulseY} r="10" fill="url(#pulse-glow)" />
                <circle cx={pulseX} cy={pulseY} r="5" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>

        {/* Reflex Arc Context Strip (Optional - PRD M08 spec) */}
        {showReflexStrip && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 143, 177, 0.1)',
              borderLeft: '4px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔥 <strong>Stimulus:</strong> Finger touches hot stove</span>
              <ArrowRight size={14} color="var(--primary)" />
              <span>⚡ <strong>Sensory Neuron:</strong> Carries message to spinal cord / brain</span>
              <ArrowRight size={14} color="var(--primary)" />
              <span>💪 <strong>Motor Neuron:</strong> Triggers arm muscle contraction</span>
            </div>
          </div>
        )}

        {/* Bottom Details Panel / Labeling Trays */}
        {!isLabelingMode ? (
          /* Explorer Description Card */
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
                {currentPart.name}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--secondary)', fontWeight: 600 }}>
                {clickedParts.size} of 5 parts explored
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text)', opacity: 0.9 }}>
              <strong>Function:</strong> {currentPart.role}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
              {currentPart.detail}
            </div>
          </div>
        ) : (
          /* Interactive Labeling Challenge Tray */
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Drag / Click Labels to Match Neuron Anatomy
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', opacity: 0.8, marginLeft: '8px' }}>
                  ({Object.keys(placedLabels).length} of 5 placed)
                </span>
              </div>
              <button
                type="button"
                onClick={resetLabeling}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>

            {labelHint && (
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{labelHint}</div>
            )}

            {/* Labels tray */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {NEURON_PARTS.map((part) => {
                const isAlreadyPlaced = Object.values(placedLabels).includes(part.name);
                const isSelectedChip = selectedLabelToPlace === part.name;

                return (
                  <button
                    key={part.id}
                    type="button"
                    disabled={isAlreadyPlaced}
                    onClick={() => {
                      setSelectedLabelToPlace(part.name);
                      setLabelHint(`Selected "${part.name}". Now click its location circle on the neuron diagram!`);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: isSelectedChip ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelectedChip
                        ? 'var(--primary)'
                        : isAlreadyPlaced
                        ? 'rgba(0, 158, 115, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isSelectedChip ? '#15122F' : isAlreadyPlaced ? '#80DEEA' : 'var(--text)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: isAlreadyPlaced ? 'default' : 'pointer',
                      opacity: isAlreadyPlaced ? 0.6 : 1,
                    }}
                  >
                    {isAlreadyPlaced && '✓ '}
                    {part.name}
                  </button>
                );
              })}
            </div>

            {Object.keys(placedLabels).length >= 5 && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 158, 115, 0.2)',
                  color: '#80DEEA',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Award size={16} /> Complete! You accurately labeled all parts of the motor neuron!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const M08Spec: ModuleSpec = {
  meta: {
    id: 'M08',
    title: 'Neuron Signal Explorer',
    subtitle: 'Nerve Cells: Anatomy and Impulse Conduction',
    category: 'Animal Tissues',
    themeId: 'M08',
    objective: 'Label a neuron and follow a message from dendrites to axon terminals.',
    predictPrompt:
      'A message enters a nerve cell. Which part do you think receives it, and which part sends it on?',
    predictOptions: [
      'Dendrites receive incoming signals, and the axon conducts it to terminals',
      'Axon terminals receive signals and the cyton discharges it',
      'The central nucleus is the only part that catches messages',
      'Nerve signals travel back and forth in both directions freely',
    ],
    notes: [
      {
        title: 'Neuron Structure',
        text: 'Consists of a cell body (cyton) with nucleus, branched receiving dendrites, and a single elongated axon ending in terminals.',
      },
      {
        title: 'One-Way Impulse Direction',
        text: 'Nerve impulses travel strictly from dendrites -> cell body -> axon -> axon terminals, communicating across junctions to muscles or neurons.',
      },
      {
        title: 'Coordination System',
        text: 'Nervous tissue forms the body communication grid. The brain acts as master control centre, coordinating voluntary and involuntary movement.',
      },
    ],
    checks: [
      {
        qid: 'M08_Q1',
        prompt: 'Which part of a neuron receives signals from other neurons?',
        options: ['Dendrites', 'Axon', 'Synaptic terminals', 'Myelin sheath'],
        answer: 'Dendrites',
        why: 'Dendrites are branching cytoplasmic extensions that capture incoming signals and transmit them inward to the cyton.',
      },
      {
        qid: 'M08_Q2',
        prompt: 'Which part contains the nucleus?',
        options: ['Cell body (Cyton)', 'Axon terminal', 'Node of Ranvier', 'Dendrite tip'],
        answer: 'Cell body (Cyton)',
        why: 'The cell body or cyton houses the prominent nucleus and cytoplasm necessary for neuron metabolic upkeep.',
      },
    ],
    requiredInteractions: ['all_parts_clicked', 'signal_played_fully', 'labelling_mode_completed'],
  },
  Component: M08NeuronSignal,
};

