import React, { useState, useEffect, useRef } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Play, RotateCcw, Zap, Eye, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

const M09_CONFIG = designValues.M09;

export const M09MuscleBoneModel: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [contractionPercent, setContractionPercent] = useState<number>(0); // 0 to 100%
  const [activeStep, setActiveStep] = useState<number>(0); // 0 = idle, 1=brain signal, 2=contracts, 3=tendon pulls, 4=bone moves
  const [isStepModeRunning, setIsStepModeRunning] = useState<boolean>(false);
  const [showAntagonisticTriceps, setShowAntagonisticTriceps] = useState<boolean>(false);

  // Layer Toggles
  const [layerMuscle, setLayerMuscle] = useState<boolean>(true);
  const [layerTendon, setLayerTendon] = useState<boolean>(true);
  const [layerLigament, setLayerLigament] = useState<boolean>(true);
  const [layerJoint, setLayerJoint] = useState<boolean>(true);
  const [layerNerve, setLayerNerve] = useState<boolean>(true);

  // Dragging interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [ligamentWarningTriggered, setLigamentWarningTriggered] = useState<boolean>(false);
  const armSvgRef = useRef<SVGSVGElement>(null);

  // Angle derived from contraction
  const angleDeg = Math.min(145, Math.max(0, contractionPercent * M09_CONFIG.angle_multiplier || contractionPercent * 1.45));

  // Step mode runner
  useEffect(() => {
    let timer: number;
    if (isStepModeRunning) {
      if (activeStep < 4) {
        timer = window.setTimeout(() => {
          const next = activeStep + 1;
          setActiveStep(next);

          if (next === 1) {
            setContractionPercent(0);
          } else if (next === 2) {
            setContractionPercent(35);
          } else if (next === 3) {
            setContractionPercent(70);
          } else if (next === 4) {
            setContractionPercent(100);
            setIsStepModeRunning(false);
            recordInteraction('step_mode_completed');
          }
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [activeStep, isStepModeRunning, recordInteraction]);

  const handleStartStepMode = () => {
    setActiveStep(1);
    setIsStepModeRunning(true);
    setContractionPercent(0);
  };

  const handleContractionChange = (val: number) => {
    setContractionPercent(val);
    recordInteraction('contract_relax_used', { percent: val });
    if (val === 0 || val >= 99) {
      setLigamentWarningTriggered(true);
    }
  };

  const handleRelax = () => {
    setContractionPercent(0);
    recordInteraction('contract_relax_used', { percent: 0 });
    setLigamentWarningTriggered(true);
  };

  const handleToggleLayer = (layer: 'muscle' | 'tendon' | 'ligament' | 'joint' | 'nerve') => {
    if (layer === 'muscle') setLayerMuscle(!layerMuscle);
    if (layer === 'tendon') {
      setLayerTendon(!layerTendon);
      recordInteraction('tendon_toggle_opened');
    }
    if (layer === 'ligament') {
      setLayerLigament(!layerLigament);
      recordInteraction('ligament_toggle_opened');
    }
    if (layer === 'joint') {
      setLayerJoint(!layerJoint);
      recordInteraction('joint_toggle_opened');
    }
    if (layer === 'nerve') setLayerNerve(!layerNerve);
  };

  // Keyboard navigation for forearm adjustment (PRD AC-M09-5)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      setContractionPercent((prev) => (prev > 50 ? 0 : 100));
      recordInteraction('contract_relax_used');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setContractionPercent((prev) => Math.min(100, prev + 10));
      recordInteraction('contract_relax_used');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setContractionPercent((prev) => Math.max(0, prev - 10));
      recordInteraction('contract_relax_used');
    }
  };

  // Dragging calculation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !armSvgRef.current) return;
    const rect = armSvgRef.current.getBoundingClientRect();
    const pivotX = rect.left + (rect.width * 200) / 450;
    const pivotY = rect.top + (rect.height * 200) / 300;

    const dx = e.clientX - pivotX;
    const dy = pivotY - e.clientY; // upward is positive angle
    let angleRad = Math.atan2(dy, dx);
    let deg = (angleRad * 180) / Math.PI;

    if (deg < 0) deg = 0;
    if (deg > 145) {
      deg = 145;
      setLigamentWarningTriggered(true);
    }

    const calcContract = (deg / 145) * 100;
    setContractionPercent(calcContract);
    recordInteraction('contract_relax_used', { percent: calcContract });
  };

  // Dynamic muscle thickness calculations
  // Muscle bulges as it shortens: length = rest * (1 - 0.2 * contraction)
  const contractFactor = contractionPercent / 100;
  const bicepsRadiusY = 12 + 10 * contractFactor; // bulges thicker
  const bicepsRadiusX = 45 * (1 - 0.2 * contractFactor); // visibly shortens

  // Forearm coordinate transformation
  const elbowX = 200;
  const elbowY = 200;
  const forearmLength = 150;
  const rad = (angleDeg * Math.PI) / 180;
  const handX = elbowX + forearmLength * Math.cos(rad);
  const handY = elbowY - forearmLength * Math.sin(rad);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1050px',
        margin: '0 auto',
        outline: 'none',
      }}
      aria-label="Muscle-bone movement model simulator. Press space to flex or relax, arrow keys to adjust angle."
    >
      {/* Top Bar: Controls & 4-Step Learning Mode */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>
              Elbow Hinge & Musculoskeletal Mechanics
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
              Use slider, drag forearm directly, or trigger the 4-step nervous-muscle sequence.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleStartStepMode}
              disabled={isStepModeRunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: isStepModeRunning ? 0.6 : 1,
              }}
            >
              <Play size={15} /> Play 4-Step Contraction Sequence
            </button>

            <button
              type="button"
              onClick={handleRelax}
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
              <RotateCcw size={14} /> Full Relax (0°)
            </button>
          </div>
        </div>

        {/* 4 Steps Indicator Bar (PRD AC-M09-4) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}
        >
          {[
            { step: 1, text: '1. Brain sends signal', icon: <Zap size={14} /> },
            { step: 2, text: '2. Biceps muscle contracts & bulges', icon: <ChevronRight size={14} /> },
            { step: 3, text: '3. Tendon pulls forearm bone', icon: <ChevronRight size={14} /> },
            { step: 4, text: '4. Forearm hinges up (0° → 145°)', icon: <CheckCircle2 size={14} /> },
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            const isPassed = activeStep > item.step;

            return (
              <div
                key={item.step}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCurrent
                    ? 'rgba(51, 71, 168, 0.12)'
                    : isPassed
                    ? 'rgba(0, 158, 115, 0.08)'
                    : 'rgba(0,0,0,0.02)',
                  border: isCurrent
                    ? '1.5px solid var(--primary)'
                    : isPassed
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : isPassed ? 'var(--accent)' : 'var(--text)',
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage & Anatomy Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(260px, 0.8fr)',
          gap: '20px',
        }}
      >
        {/* Left: Dynamic Arm Mechanical Simulation SVG */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                Elbow Hinge Angle:
              </span>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {angleDeg.toFixed(0)}°
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>
                (Clamped: 0° to 145°)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAntagonisticTriceps(!showAntagonisticTriceps)}
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: showAntagonisticTriceps ? 'rgba(0, 121, 107, 0.15)' : 'transparent',
                color: showAntagonisticTriceps ? 'var(--accent)' : 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {showAntagonisticTriceps ? 'Hide Triceps' : '+ Show Triceps (Extra)'}
            </button>
          </div>

          {/* SVG Canvas for Arm Side-View */}
          <div
            style={{
              width: '100%',
              height: '320px',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
          >
            <svg
              ref={armSvgRef}
              viewBox="0 0 450 300"
              width="100%"
              height="300"
              aria-label="Elbow arm movement simulator"
            >
              <defs>
                <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.18" />
                </filter>
                <linearGradient id="boneHumerus3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="30%" stopColor="#F8F6F0" />
                  <stop offset="65%" stopColor="#E2DAC7" />
                  <stop offset="100%" stopColor="#BCB094" />
                </linearGradient>
                <linearGradient id="forearmBone3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#F5F2E9" />
                  <stop offset="70%" stopColor="#DDD4C0" />
                  <stop offset="100%" stopColor="#B3A588" />
                </linearGradient>
                <radialGradient id="bicepsMuscle3d" cx="38%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FF8573" />
                  <stop offset="35%" stopColor="#E63926" />
                  <stop offset="75%" stopColor="#A81B0E" />
                  <stop offset="100%" stopColor="#5C0A02" />
                </radialGradient>
                <radialGradient id="tricepsMuscle3d" cx="38%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FF9B8A" />
                  <stop offset="50%" stopColor="#C93222" />
                  <stop offset="100%" stopColor="#690E05" />
                </radialGradient>
                <radialGradient id="cartilage3d" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#E0F2FE" />
                  <stop offset="45%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0284C7" />
                </radialGradient>
                <linearGradient id="tendon3d" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#F1EFEA" />
                  <stop offset="100%" stopColor="#C4BDB0" />
                </linearGradient>
                <linearGradient id="ligament3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Shoulder joint anchor 3D */}
              <circle cx="80" cy="180" r="16" fill="url(#boneHumerus3d)" stroke="#94A3B8" strokeWidth="2" filter="url(#shadow3d)" />
              <text x="80" y="218" fontSize="10" fontWeight="700" fill="#2563EB" textAnchor="middle">
                Shoulder Joint
              </text>

              {/* Upper arm bone (Humerus) with 3D cylinder depth */}
              <g filter="url(#shadow3d)">
                <path
                  d="M 80 180 L 200 200"
                  stroke="url(#boneHumerus3d)"
                  strokeWidth="26"
                  strokeLinecap="round"
                />
                {/* 3D Specular bone ridge highlight */}
                <path
                  d="M 80 176 L 200 196"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>
              <text x="140" y="195" fontSize="10" fontWeight="700" fill="#475569" textAnchor="middle">
                Humerus Bone
              </text>

              {/* Forearm bones (Radius & Ulna) with 3D depth */}
              <g filter="url(#shadow3d)">
                <path
                  d={`M ${elbowX} ${elbowY} L ${handX} ${handY}`}
                  stroke="url(#forearmBone3d)"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${elbowX} ${elbowY - 3} L ${handX} ${handY - 3}`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
              {/* Hand at tip with 3D sphere */}
              <circle cx={handX} cy={handY} r="14" fill="url(#boneHumerus3d)" stroke="#2563EB" strokeWidth="2.5" filter="url(#shadow3d)" />
              <text x={handX} y={handY - 18} fontSize="10" fontWeight="800" fill="#2563EB" textAnchor="middle">
                Hand (Drag 0°–145°)
              </text>

              {/* Joint & Cartilage Cushion (3D) */}
              {layerJoint && (
                <g filter="url(#shadow3d)">
                  {/* Articular cartilage cushion */}
                  <circle cx={elbowX} cy={elbowY} r="15" fill="url(#cartilage3d)" opacity="0.85" />
                  <circle cx={elbowX} cy={elbowY} r="8" fill="#FFFFFF" opacity="0.7" />
                  <text x={elbowX} y={elbowY + 30} fontSize="9" fontWeight="800" fill="#0284C7" textAnchor="middle">
                    Cartilage Cushion
                  </text>
                </g>
              )}

              {/* Ligament crossing the joint (3D) */}
              {layerLigament && (
                <g filter="url(#shadow3d)">
                  <path
                    d={`M 188 190 Q ${elbowX} ${elbowY + (angleDeg > 140 ? 12 : 5)} ${elbowX + 16 * Math.cos(rad)} ${elbowY - 16 * Math.sin(rad)}`}
                    stroke={ligamentWarningTriggered ? '#DC2626' : 'url(#ligament3d)'}
                    strokeWidth={ligamentWarningTriggered ? 7 : 5}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <text
                    x={elbowX}
                    y={elbowY - 22}
                    fontSize="9"
                    fontWeight="800"
                    fill={ligamentWarningTriggered ? '#DC2626' : '#047857'}
                    textAnchor="middle"
                  >
                    Ligament (Bone to Bone)
                  </text>
                </g>
              )}

              {/* Biceps Muscle & Tendons (Front of arm) - 3D Bulging render */}
              {layerMuscle && (
                <g filter="url(#shadow3d)">
                  {/* Tendons (Muscle to Bone) in 3D */}
                  {layerTendon && (
                    <g>
                      {/* Upper tendon attaching to humerus head */}
                      <path
                        d={`M 88 175 L ${135 - bicepsRadiusX} ${150 + 15 * contractFactor}`}
                        stroke="url(#tendon3d)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      {/* Lower tendon attaching to radius bone */}
                      <path
                        d={`M ${135 + bicepsRadiusX} ${150 + 15 * contractFactor} L ${elbowX + 35 * Math.cos(rad)} ${elbowY - 35 * Math.sin(rad)}`}
                        stroke="url(#tendon3d)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <text x="175" y="125" fontSize="9" fontWeight="800" fill="#B45309">
                        Tendon (Muscle → Bone)
                      </text>
                    </g>
                  )}

                  {/* Biceps belly (3D bulging and shortening) */}
                  <ellipse
                    cx={135}
                    cy={150 + 15 * contractFactor}
                    rx={bicepsRadiusX}
                    ry={bicepsRadiusY}
                    fill="url(#bicepsMuscle3d)"
                    stroke="#991B1B"
                    strokeWidth="1.5"
                    transform={`rotate(${angleDeg * 0.15}, 135, ${150 + 15 * contractFactor})`}
                  />
                  {/* Specular muscle sheen highlight */}
                  <ellipse
                    cx={133}
                    cy={146 + 15 * contractFactor}
                    rx={bicepsRadiusX * 0.7}
                    ry={bicepsRadiusY * 0.3}
                    fill="#FFFFFF"
                    opacity="0.3"
                    transform={`rotate(${angleDeg * 0.15}, 135, ${150 + 15 * contractFactor})`}
                  />
                  <text
                    x="135"
                    y={154 + 15 * contractFactor}
                    fontSize="10"
                    fontWeight="800"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    Biceps Muscle
                  </text>
                </g>
              )}

              {/* Optional Antagonistic Triceps Muscle (Back of arm in 3D) */}
              {showAntagonisticTriceps && (
                <g filter="url(#shadow3d)">
                  <ellipse
                    cx={140}
                    cy={225}
                    rx={42 * (1 - 0.2 * (1 - contractFactor))}
                    ry={10 + 6 * (1 - contractFactor)}
                    fill="url(#tricepsMuscle3d)"
                    stroke="#991B1B"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                  <text x="140" y="228" fontSize="9" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
                    Triceps (Straightens Arm)
                  </text>
                </g>
              )}

              {/* Nerve Signal Impulse Line (Glowing electric pulse) */}
              {layerNerve && activeStep === 1 && (
                <g>
                  <path
                    d="M 50 120 Q 80 140 120 150"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeDasharray="5,5"
                    fill="none"
                  />
                  <circle cx="120" cy="150" r="7" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          {/* Ligament Boundary Alert Callout (PRD Edge Case rule) */}
          {ligamentWarningTriggered && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 121, 107, 0.1)',
                borderLeft: '4px solid var(--accent)',
                fontSize: '0.8rem',
                color: 'var(--text)',
                lineHeight: 1.4,
              }}
            >
              🛡️ <strong>Ligaments limit movement and help prevent dislocation:</strong> Strong ligaments hold the
              humerus and forearm bones together so the elbow hinges strictly in one plane and cannot bend backwards!
            </div>
          )}

          {/* Slider for Contraction */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600 }}>Muscle Contraction: {contractionPercent.toFixed(0)}%</span>
              <span style={{ color: 'var(--text)', opacity: 0.7 }}>Angle = {angleDeg.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={contractionPercent}
              onChange={(e) => handleContractionChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
              aria-label="Biceps muscle contraction slider"
            />
          </div>
        </div>

        {/* Right: Layer Toggles & Structural Principles */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
            Anatomical Layers & Definitions
          </h4>

          {/* Layer toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                id: 'muscle',
                name: 'Muscle (Biceps)',
                active: layerMuscle,
                color: '#B5391C',
                desc: 'Contracts and actively shortens to generate pulling force.',
              },
              {
                id: 'tendon',
                name: 'Tendon (Muscle → Bone)',
                active: layerTendon,
                color: '#8A4B00',
                desc: 'Inelastic white fibrous cord transmitting pull to forearm bone.',
              },
              {
                id: 'ligament',
                name: 'Ligament (Bone → Bone)',
                active: layerLigament,
                color: '#00796B',
                desc: 'Elastic band stabilizing joint; prevents overextension & dislocation.',
              },
              {
                id: 'joint',
                name: 'Hinge Joint & Cartilage',
                active: layerJoint,
                color: '#1F6F9F',
                desc: 'Smooth cushion allowing single-plane rotation.',
              },
              {
                id: 'nerve',
                name: 'Nerve Signal',
                active: layerNerve,
                color: '#E69F00',
                desc: 'Motor impulses commanding contraction.',
              },
            ].map((layer) => (
              <div
                key={layer.id}
                onClick={() => handleToggleLayer(layer.id as any)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: layer.active ? `1.5px solid ${layer.color}` : '1px solid var(--border)',
                  backgroundColor: layer.active ? 'rgba(0,0,0,0.02)' : 'transparent',
                  cursor: 'pointer',
                  opacity: layer.active ? 1 : 0.45,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: layer.color }}>
                    {layer.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: layer.active ? 'var(--accent)' : 'var(--text)' }}>
                    {layer.active ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text)', opacity: 0.85, marginTop: '2px' }}>
                  {layer.desc}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(51, 71, 168, 0.06)',
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
              lineHeight: 1.4,
            }}
          >
            <strong>Core Concept:</strong> Muscles can only <em>pull</em>, they cannot push. To straighten the arm back out, an antagonistic muscle on the opposite side (the triceps) must contract.
          </div>
        </div>
      </div>
    </div>
  );
};

export const M09Spec: ModuleSpec = {
  meta: {
    id: 'M09',
    title: 'Muscle-Bone Movement Model',
    subtitle: 'Elbow Hinge Mechanics, Tendons and Ligaments',
    category: 'Movement & Skeleton',
    themeId: 'M09',
    objective:
      'Show that muscles pull on bones through tendons, producing movement at a joint, under nervous control.',
    predictPrompt: 'When your arm bends at the elbow, what actually pulls the forearm up?',
    predictOptions: [
      'The biceps muscle contracts and pulls through its tendon',
      'The bones push themselves upwards without muscles',
      'Ligaments push the bones together',
      'Blood pressure inflates the elbow joint',
    ],
    notes: [
      {
        title: 'Musculoskeletal System',
        text: 'Bones, muscles, joints, cartilage, tendons and ligaments work together under nervous control to move limbs.',
      },
      {
        title: 'Tendons Pull Bones',
        text: 'Muscles pull on bones via inelastic tendons. Muscles can only pull; they never push.',
      },
      {
        title: 'Ligaments Limit Angles',
        text: 'Ligaments connect bone to bone across the joint, limiting angles to 0–145° and preventing dislocation.',
      },
    ],
    checks: [
      {
        qid: 'M09_Q1',
        prompt: 'What transmits the force from muscle to bone?',
        options: ['Tendon', 'Ligament', 'Cartilage disc', 'Nerve myelin'],
        answer: 'Tendon',
        why: 'Tendons are tough fibrous bands of connective tissue that firmly attach skeletal muscles to bones, conveying mechanical tension.',
      },
      {
        qid: 'M09_Q2',
        prompt: 'Why can the elbow not bend backwards?',
        options: [
          'It is a hinge joint; its shape and ligaments limit movement to one direction',
          'Bone marrow fills the joint cavity preventing motion',
          'Blood flows only in one direction in the arm',
          'Arm muscles only contract downwards',
        ],
        answer: 'It is a hinge joint; its shape and ligaments limit movement to one direction',
        why: 'The elbow is a hinge joint whose interlocking bone surfaces and tough joint ligaments physically restrict rotation beyond 0 degrees.',
      },
    ],
    requiredInteractions: [
      'step_mode_completed',
      'contract_relax_used',
      'tendon_toggle_opened',
      'ligament_toggle_opened',
      'joint_toggle_opened',
    ],
  },
  Component: M09MuscleBoneModel,
};
