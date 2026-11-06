import React, { useState, useEffect, useRef } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Zap, Heart, Activity, Play, RefreshCw, Sliders, Split, CheckCircle2 } from 'lucide-react';

const M07_CONFIG = designValues.M07;

type ExerciseLevel = 'rest' | 'walk' | 'run';

export const M07MuscleTypes: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [exerciseLevel, setExerciseLevel] = useState<ExerciseLevel>('rest');
  const [isArmMoving, setIsArmMoving] = useState<boolean>(false);
  const [nerveSignalTriggered, setNerveSignalTriggered] = useState<string | null>(null);
  const [controlAttempts, setControlAttempts] = useState<Record<string, boolean>>({});
  const [compareCellsMode, setCompareCellsMode] = useState<boolean>(false);
  const [stomachWave, setStomachWave] = useState<number>(0);
  const [heartBeatPhase, setHeartBeatPhase] = useState<number>(0);

  // Animation ticker for continuous cardiac & smooth peristalsis
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const speedMultiplier = M07_CONFIG.exercise_speeds[exerciseLevel];

      // Smooth muscle slow rhythmic peristalsis wave
      setStomachWave((prev) => (prev + dt * 0.8) % (Math.PI * 2));

      // Cardiac muscle contraction rhythm
      setHeartBeatPhase((prev) => (prev + dt * 2.2 * speedMultiplier) % (Math.PI * 2));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [exerciseLevel]);

  // Handle "Try to control" button for each muscle
  const handleTryControl = (muscle: 'skeletal' | 'smooth' | 'cardiac') => {
    setNerveSignalTriggered(muscle);
    const updated = { ...controlAttempts, [muscle]: true };
    setControlAttempts(updated);

    if (muscle === 'skeletal') {
      setIsArmMoving(true);
      setTimeout(() => setIsArmMoving(false), 1200);
    }

    if (Object.keys(updated).length >= 3) {
      recordInteraction('try_control_all_three');
    }

    setTimeout(() => setNerveSignalTriggered(null), 1000);
  };

  const handleExerciseChange = (lvl: ExerciseLevel) => {
    setExerciseLevel(lvl);
    recordInteraction('exercise_slider_moved', { level: lvl });
  };

  const handleToggleCompare = () => {
    const next = !compareCellsMode;
    setCompareCellsMode(next);
    if (next) {
      recordInteraction('compare_cells_opened');
    }
  };

  const heartScale = 1 + 0.12 * Math.sin(heartBeatPhase);
  const stomachOffset = 8 * Math.sin(stomachWave);

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
      {/* Top Controls: Exercise Level + Compare Cells Toggle */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              Body Activity State:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['rest', 'walk', 'run'] as ExerciseLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleExerciseChange(lvl)}
                aria-pressed={exerciseLevel === lvl}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: exerciseLevel === lvl ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: exerciseLevel === lvl ? 'var(--primary)' : 'transparent',
                  color: exerciseLevel === lvl ? '#ffffff' : 'var(--text)',
                  fontSize: '0.8rem',
                  fontWeight: exerciseLevel === lvl ? 700 : 500,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
            Brain signals the heart to beat faster during exercise
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleCompare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: compareCellsMode ? '2px solid var(--accent)' : '1px solid var(--border)',
            backgroundColor: compareCellsMode ? 'var(--accent)' : 'transparent',
            color: compareCellsMode ? '#1B2430' : 'var(--text)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Split size={15} /> {compareCellsMode ? 'Show Full Organs' : 'Compare Microscopic Cells'}
        </button>
      </div>

      {/* Three Columns: Skeletal (Voluntary), Smooth (Involuntary), Cardiac (Involuntary) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Column 1: Skeletal Muscle */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)', fontWeight: 700 }}>
                1. Skeletal Muscle
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.75 }}>
                Attached to bones (Arms, legs, chest)
              </span>
            </div>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 158, 115, 0.2)',
                color: '#80DEEA',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              Voluntary
            </span>
          </div>

          {/* Organ / Arm View */}
          <div
            style={{
              height: '140px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {nerveSignalTriggered === 'skeletal' && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  color: '#EA580C',
                  fontWeight: 700,
                }}
              >
                <Zap size={12} color="#EA580C" /> Motor Nerve Impulses
              </div>
            )}

            {/* Arm bending 3D graphic */}
            <svg viewBox="0 0 200 120" width="200" height="120" aria-label="Skeletal arm muscle diagram">
              <defs>
                <linearGradient id="armBone3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#EDE9E3" />
                  <stop offset="100%" stopColor="#C4B89A" />
                </linearGradient>
                <radialGradient id="armBiceps3d" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FF7A66" />
                  <stop offset="45%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </radialGradient>
              </defs>
              {/* Upper arm bone (Humerus) */}
              <line x1="40" y1="60" x2="100" y2="60" stroke="url(#armBone3d)" strokeWidth="10" strokeLinecap="round" />
              {/* Forearm bone */}
              <line
                x1="100"
                y1="60"
                x2={isArmMoving ? '135' : '165'}
                y2={isArmMoving ? '25' : '60'}
                stroke="url(#armBone3d)"
                strokeWidth="9"
                strokeLinecap="round"
                style={{ transition: 'all 0.5s ease' }}
              />
              {/* Biceps muscle bundle 3D */}
              <ellipse
                cx="70"
                cy={isArmMoving ? '48' : '52'}
                rx={isArmMoving ? '20' : '26'}
                ry={isArmMoving ? '14' : '9'}
                fill="url(#armBiceps3d)"
                stroke="#991B1B"
                strokeWidth="1.5"
                style={{ transition: 'all 0.5s ease' }}
              />
              {/* White Tendons */}
              <line x1="44" y1="58" x2="52" y2="52" stroke="#CBD5E1" strokeWidth="3" />
              <line
                x1="88"
                y1={isArmMoving ? '48' : '53'}
                x2={isArmMoving ? '108' : '108'}
                y2={isArmMoving ? '50' : '58'}
                stroke="#CBD5E1"
                strokeWidth="3"
                style={{ transition: 'all 0.5s ease' }}
              />
              {/* Joint point */}
              <circle cx="100" cy="60" r="5" fill="#2563EB" />
            </svg>
          </div>

          {/* Microscopic Cell Close-Up */}
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Microscopic Structure:
            </div>
            {/* SVG Striated Multinucleate unbranched fibre */}
            <svg viewBox="0 0 200 45" width="100%" height="45" aria-label="Skeletal striated muscle fibre">
              <rect x="5" y="8" width="190" height="28" rx="4" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
              {/* Striations (alternating light & dark vertical bands) */}
              {[15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185].map((x) => (
                <line key={x} x1={x} y1="8" x2={x} y2="36" stroke="#DC2626" strokeWidth="1.5" opacity="0.4" />
              ))}
              {/* Many peripheral nuclei (Multinucleate) */}
              <ellipse cx="40" cy="12" rx="6" ry="3" fill="#2563EB" />
              <ellipse cx="110" cy="32" rx="6" ry="3" fill="#2563EB" />
              <ellipse cx="160" cy="12" rx="6" ry="3" fill="#2563EB" />
            </svg>
            <div style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.85, marginTop: '4px' }}>
              • <strong>Long cylindrical unbranched fibres</strong><br />
              • <strong>Multinucleate:</strong> Many nuclei at outer periphery<br />
              • <strong>Distinct striations:</strong> Light and dark protein bands
            </div>
          </div>

          {/* Try to Control Button */}
          <button
            type="button"
            onClick={() => handleTryControl('skeletal')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Play size={14} /> Flex Biceps (Under Your Control)
          </button>
        </div>

        {/* Column 2: Smooth Muscle */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--secondary)', fontWeight: 700 }}>
                2. Smooth Muscle
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.75 }}>
                Internal organs (Stomach, intestines, vessels)
              </span>
            </div>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 209, 128, 0.2)',
                color: '#FFD180',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              Involuntary
            </span>
          </div>

          {/* Organ / Stomach Peristalsis View */}
          <div
            style={{
              height: '140px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {nerveSignalTriggered === 'smooth' && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  color: '#EA580C',
                  fontWeight: 700,
                }}
              >
                Autonomous Visceral Control
              </div>
            )}

            {/* Stomach outline with 3D peristaltic wave */}
            <svg viewBox="0 0 200 120" width="200" height="120" aria-label="Stomach smooth muscle peristalsis">
              <defs>
                <radialGradient id="stomachGrad3d" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FED7AA" />
                  <stop offset="45%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#C2410C" />
                </radialGradient>
              </defs>
              <path
                d={`M 70 20 C ${110 + stomachOffset} 25 150 50 145 80 C 140 105 ${100 - stomachOffset} 110 75 95 C 55 80 50 45 70 20 Z`}
                fill="url(#stomachGrad3d)"
                stroke="#9A3412"
                strokeWidth="2"
              />
              {/* Peristalsis contraction wave line */}
              <path
                d={`M 75 40 Q ${105 + stomachOffset} 60 135 75`}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                fill="none"
              />
              <text x="100" y="65" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="800">
                Peristalsis Wave
              </text>
            </svg>
          </div>

          {/* Microscopic Cell Close-Up */}
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px' }}>
              Microscopic Structure:
            </div>
            {/* SVG Spindle-shaped cells with single central nucleus, no striations */}
            <svg viewBox="0 0 200 45" width="100%" height="45" aria-label="Smooth spindle-shaped unstriated cell">
              <defs>
                <linearGradient id="spindle3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFEDD5" />
                  <stop offset="50%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
              {/* Spindle 1 */}
              <path d="M 10 22 Q 55 10 100 22 Q 55 34 10 22 Z" fill="url(#spindle3d)" stroke="#C2410C" strokeWidth="1.5" />
              <circle cx="55" cy="22" r="4.5" fill="#2563EB" />
              {/* Spindle 2 */}
              <path d="M 90 22 Q 145 10 190 22 Q 145 34 90 22 Z" fill="url(#spindle3d)" stroke="#C2410C" strokeWidth="1.5" />
              <circle cx="140" cy="22" r="4.5" fill="#2563EB" />
            </svg>
            <div style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.85, marginTop: '4px' }}>
              • <strong>Spindle-shaped cells:</strong> Pointed tapered ends<br />
              • <strong>Uninucleate:</strong> One central nucleus per cell<br />
              • <strong>Unstriated (smooth):</strong> No visible cross stripes
            </div>
          </div>

          {/* Try to Control Button */}
          <button
            type="button"
            onClick={() => handleTryControl('smooth')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Try to Pause Stomach Digestion
          </button>
        </div>

        {/* Column 3: Cardiac Muscle (Heart ONLY - PRD AC-M07-3) */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#80DEEA', fontWeight: 700 }}>
                3. Cardiac Muscle
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.75 }}>
                Exclusively in the Heart wall
              </span>
            </div>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(128, 222, 234, 0.2)',
                color: '#80DEEA',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              Involuntary
            </span>
          </div>

          {/* Organ / Heart Pumping View */}
          <div
            style={{
              height: '140px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {nerveSignalTriggered === 'cardiac' && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  color: '#EA580C',
                  fontWeight: 700,
                }}
              >
                Involuntary Pacemaker Rhythm
              </div>
            )}

            {/* Pumping 3D Heart SVG */}
            <svg
              viewBox="0 0 100 100"
              width="95"
              height="95"
              style={{
                transform: `scale(${heartScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.08s ease',
              }}
              aria-label="Pumping cardiac heart muscle"
            >
              <defs>
                <radialGradient id="heartGrad3d" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFA494" />
                  <stop offset="35%" stopColor="#EF4444" />
                  <stop offset="75%" stopColor="#B91C1C" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </radialGradient>
              </defs>
              <path
                d="M 50 30 C 50 15 25 15 25 35 C 25 60 50 78 50 78 C 50 78 75 60 75 35 C 75 15 50 15 50 30 Z"
                fill="url(#heartGrad3d)"
                stroke="#991B1B"
                strokeWidth="2"
              />
              <path
                d="M 35 25 Q 45 20 45 32"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Microscopic Cell Close-Up */}
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Microscopic Structure:
            </div>
            {/* SVG Branched cylindrical cells with intercalated discs and single nucleus */}
            <svg viewBox="0 0 200 45" width="100%" height="45" aria-label="Cardiac branched muscle fibres">
              <defs>
                <linearGradient id="cardiac3d" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEE2E2" />
                  <stop offset="45%" stopColor="#F87171" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              {/* Top branch */}
              <path d="M 5 10 L 95 10 L 130 5 L 195 5 L 195 20 L 130 20 L 95 25 L 5 25 Z" fill="url(#cardiac3d)" stroke="#B91C1C" strokeWidth="1.5" />
              {/* Bottom branch */}
              <path d="M 95 25 L 195 25 L 195 40 L 95 40 Z" fill="url(#cardiac3d)" stroke="#B91C1C" strokeWidth="1.5" />
              {/* Intercalated junctions */}
              <line x1="50" y1="10" x2="50" y2="25" stroke="#1E293B" strokeWidth="2.5" />
              <line x1="140" y1="5" x2="140" y2="20" stroke="#1E293B" strokeWidth="2.5" />
              <line x1="140" y1="25" x2="140" y2="40" stroke="#1E293B" strokeWidth="2.5" />
              {/* Single central nucleus per unit */}
              <ellipse cx="70" cy="17" rx="5" ry="3" fill="#2563EB" />
              <ellipse cx="165" cy="12" rx="5" ry="3" fill="#2563EB" />
              <ellipse cx="150" cy="32" rx="5" ry="3" fill="#2563EB" />
            </svg>
            <div style={{ fontSize: '0.72rem', color: 'var(--text)', opacity: 0.85, marginTop: '4px' }}>
              • <strong>Cylindrical, branched fibres:</strong> Joined at junctions<br />
              • <strong>Uninucleate:</strong> One central nucleus per cell<br />
              • <strong>Faint striations:</strong> Contracts tirelessly for a lifetime
            </div>
          </div>

          {/* Try to Control Button */}
          <button
            type="button"
            onClick={() => handleTryControl('cardiac')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Try to Stop Heartbeat
          </button>
        </div>
      </div>

      {/* Comparison Reference Table (PRD Table requirements) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
          Muscle Classification & Structural Characteristics (Figure 3.13)
        </h4>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Muscle Type</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Conscious Control</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Where Found</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Cell Shape</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Nuclei per Cell</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Striations</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--primary)' }}>Skeletal</td>
              <td style={{ padding: '8px 10px', color: '#80DEEA', fontWeight: 600 }}>Voluntary (Under control)</td>
              <td style={{ padding: '8px 10px' }}>Attached to skeletal bones</td>
              <td style={{ padding: '8px 10px' }}>Long cylindrical, unbranched</td>
              <td style={{ padding: '8px 10px' }}>Many (Multinucleate, peripheral)</td>
              <td style={{ padding: '8px 10px' }}>Prominent dark & light stripes</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--secondary)' }}>Smooth</td>
              <td style={{ padding: '8px 10px', color: '#FFD180', fontWeight: 600 }}>Involuntary (Automatic)</td>
              <td style={{ padding: '8px 10px' }}>Stomach, intestines, iris, vessels</td>
              <td style={{ padding: '8px 10px' }}>Spindle-shaped (tapered ends)</td>
              <td style={{ padding: '8px 10px' }}>Single central nucleus</td>
              <td style={{ padding: '8px 10px' }}>None (Unstriated)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#80DEEA' }}>Cardiac</td>
              <td style={{ padding: '8px 10px', color: '#80DEEA', fontWeight: 600 }}>Involuntary (Automatic)</td>
              <td style={{ padding: '8px 10px' }}>Exclusively in the heart</td>
              <td style={{ padding: '8px 10px' }}>Cylindrical, branched network</td>
              <td style={{ padding: '8px 10px' }}>Single central nucleus</td>
              <td style={{ padding: '8px 10px' }}>Faint striations, fatigue-free</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const M07Spec: ModuleSpec = {
  meta: {
    id: 'M07',
    title: 'Muscle Types Explorer',
    subtitle: 'Skeletal, Smooth and Cardiac Muscle Comparison',
    category: 'Animal Tissues',
    themeId: 'M07',
    objective: 'Compare skeletal, smooth and cardiac muscle and relate each to voluntary or involuntary movement.',
    predictPrompt: 'Which of these movements can you control by choice: lifting a book, digestion, heartbeat?',
    predictOptions: [
      'Lifting a book only (voluntary skeletal muscle)',
      'All three movements can be controlled at will',
      'Digestion and lifting a book, but not heartbeat',
      'Heartbeat only',
    ],
    notes: [
      {
        title: 'Skeletal Muscle',
        text: 'Voluntary, multinucleate, cylindrical and unbranched with marked striations. Attached to bones to move limbs.',
      },
      {
        title: 'Smooth Muscle',
        text: 'Involuntary, spindle-shaped with one nucleus and no striations. Found in alimentary canal, blood vessels and iris.',
      },
      {
        title: 'Cardiac Muscle',
        text: 'Involuntary, branched and cylindrical with faint striations. Exclusively in heart wall, contracts rhythmically for life without fatigue.',
      },
    ],
    checks: [
      {
        qid: 'M07_Q1',
        prompt: 'Which muscle has branched fibres and works only in the heart?',
        options: ['Cardiac muscle', 'Skeletal muscle', 'Smooth muscle', 'Cartilage tissue'],
        answer: 'Cardiac muscle',
        why: 'Cardiac muscle cells are cylindrical and uniquely branched, forming an interconnected network found solely in the heart wall.',
      },
      {
        qid: 'M07_Q2',
        prompt: 'Which two muscle types are involuntary?',
        options: [
          'Smooth and cardiac',
          'Skeletal and smooth',
          'Skeletal and cardiac',
          'Only skeletal muscle',
        ],
        answer: 'Smooth and cardiac',
        why: 'Smooth muscle (organs) and cardiac muscle (heart) contract autonomously under autonomic nerve control without conscious will.',
      },
    ],
    requiredInteractions: ['try_control_all_three', 'exercise_slider_moved', 'compare_cells_opened'],
  },
  Component: M07MuscleTypes,
};

