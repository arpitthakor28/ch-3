import React, { useState, useEffect, useRef } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Play, Pause, RotateCcw, Droplets, Sun, Wind, Scissors, ZoomIn } from 'lucide-react';

const M04_CONFIG = designValues.M04;

type PathwayMode = 'both' | 'xylem' | 'phloem';

export const M04Transport: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  onObservationUpdate,
  resetSignal,
}) => {
  const [pathway, setPathway] = useState<PathwayMode>('both');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [stomataOpen, setStomataOpen] = useState<boolean>(true);
  const [debarked, setDebarked] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [zoomedTube, setZoomedTube] = useState<'xylem' | 'phloem' | null>(null);

  // Particles animation position arrays (0.0 to 1.0 along normalized curve)
  const [xylemParticles, setXylemParticles] = useState<number[]>(() =>
    Array.from({ length: M04_CONFIG.particle_count }, (_, i) => i / M04_CONFIG.particle_count)
  );
  const [phloemParticles, setPhloemParticles] = useState<number[]>(() =>
    Array.from({ length: M04_CONFIG.particle_count }, (_, i) => i / M04_CONFIG.particle_count)
  );

  const animRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reset handler
    setPathway('both');
    setIsPlaying(true);
    setSpeedMultiplier(1.0);
    setStomataOpen(true);
    setDebarked(false);
    setSelectedPart(null);
    setZoomedTube(null);
    setXylemParticles(Array.from({ length: M04_CONFIG.particle_count }, (_, i) => i / M04_CONFIG.particle_count));
    setPhloemParticles(Array.from({ length: M04_CONFIG.particle_count }, (_, i) => i / M04_CONFIG.particle_count));
  }, [resetSignal]);

  // Animation loop with requestAnimationFrame
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        // Xylem speed drops to 20% if stomata are closed (AC-M04-4)
        const xylemSpeedFactor = (stomataOpen ? 1.0 : M04_CONFIG.closed_stomata_speed_ratio) * speedMultiplier * 0.15;
        const phloemSpeedFactor = speedMultiplier * 0.12;

        setXylemParticles((prev) =>
          prev.map((pos) => {
            let next = pos + dt * xylemSpeedFactor;
            if (next > 1.0) next -= 1.0;
            return next;
          })
        );

        setPhloemParticles((prev) =>
          prev.map((pos) => {
            // If debarked (girdling), food cannot pass ring (y ~ 0.5)
            if (debarked && pos >= 0.48 && pos <= 0.52) {
              return 0.48; // Accumulate / pile up above the ring
            }
            let next = pos + dt * phloemSpeedFactor;
            if (next > 1.0) next -= 1.0;
            return next;
          })
        );
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speedMultiplier, stomataOpen, debarked]);

  const toggleStomata = () => {
    setStomataOpen((prev) => {
      const next = !prev;
      recordInteraction('stomata_toggled', { open: next });
      return next;
    });
  };

  const handlePartClick = (partName: string) => {
    setSelectedPart(partName);
    recordInteraction(`click_part_${partName}`);
    if (partName === 'xylem') recordInteraction('xylem_clicked');
    if (partName === 'phloem') recordInteraction('phloem_clicked');
  };

  // Sync observations
  useEffect(() => {
    if (onObservationUpdate) {
      onObservationUpdate({
        transportExperiment: {
          pathwayStudied: pathway,
          stomataState: stomataOpen ? 'Open (Full Transpiration Pull)' : 'Closed (20% Speed)',
          girdlingDebarkDone: debarked,
          lastInvestigatedPart: selectedPart,
        },
      });
    }
  }, [pathway, stomataOpen, debarked, selectedPart, onObservationUpdate]);

  // Check completion criteria: both pathways played to completion
  useEffect(() => {
    recordInteraction('pathway_both_viewed');
  }, [pathway, recordInteraction]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Pathway Segmented Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Vascular Circuit:</span>
          {(['both', 'xylem', 'phloem'] as PathwayMode[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPathway(p);
                recordInteraction(`pathway_${p}_selected`);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background:
                  pathway === p
                    ? p === 'xylem'
                      ? 'var(--primary)'
                      : p === 'phloem'
                      ? 'var(--secondary)'
                      : '#37474F'
                    : 'transparent',
                color: pathway === p ? '#ffffff' : 'var(--text)',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {p === 'both' ? 'Both Tissues' : p === 'xylem' ? 'Xylem (Water ↑)' : 'Phloem (Food ↓)'}
            </button>
          ))}
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Speed Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: speedMultiplier === s ? 'var(--secondary)' : 'transparent',
                  color: speedMultiplier === s ? '#ffffff' : 'var(--text)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Stomata toggle */}
          <button
            onClick={toggleStomata}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: stomataOpen ? 'rgba(37, 112, 43, 0.15)' : 'rgba(213, 94, 0, 0.15)',
              color: stomataOpen ? 'var(--accent)' : 'var(--secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            <Wind size={15} />
            <span>Stomata: {stomataOpen ? 'Open (Transpiring)' : 'Closed (Slow Flow)'}</span>
          </button>

          {/* Debarking challenge (optional girdling) */}
          <button
            onClick={() => {
              setDebarked((d) => !d);
              recordInteraction('debark_toggled');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: debarked ? 'var(--secondary)' : 'transparent',
              color: debarked ? '#fff' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Scissors size={15} />
            <span>{debarked ? 'Stem Debarked (Girdled)' : 'Girdle Stem (Debark)'}</span>
          </button>
        </div>
      </div>

      {/* Main Hydraulic Stage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Whole Plant Hydraulic Visualizer */}
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>
              Dual Vascular Pipelines: Whole Plant In-Vivo
            </span>
            {stomataOpen && isPlaying && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                ↑ Transpiration Pull Active
              </span>
            )}
          </div>

          <svg viewBox="0 0 340 400" style={{ width: '100%', maxWidth: '340px', height: 'auto' }}>
            {/* Background Sky & Soil */}
            <rect x="0" y="270" width="340" height="130" fill="#E8DEC8" />
            <line x1="0" y1="270" x2="340" y2="270" stroke="#8D6E63" strokeWidth="2" />
            <text x="12" y="286" fill="#795548" fontSize="10" fontWeight="600">Soil Horizon</text>

            {/* Stem Column */}
            <rect x="135" y="70" width="70" height="200" fill="#D7E8D5" stroke="#81C784" strokeWidth="2" />

            {/* Debarked Girdle Notch on outer stem if applied */}
            {debarked && (
              <g>
                <rect x="180" y="160" width="28" height="22" fill="#E8DEC8" stroke="#D55E00" strokeWidth="1.5" />
                <line x1="175" y1="160" x2="210" y2="160" stroke="#D55E00" strokeWidth="2" />
                <line x1="175" y1="182" x2="210" y2="182" stroke="#D55E00" strokeWidth="2" />
                <text x="215" y="175" fill="#D55E00" fontSize="9" fontWeight="700">Bark Removed</text>
              </g>
            )}

            {/* Big Foliage Leaf on Left */}
            <path
              d="M 135 120 C 50 100 30 50 70 40 C 110 30 135 90 135 120 Z"
              fill="#81C784"
              stroke="#388E3C"
              strokeWidth="2"
              onClick={() => handlePartClick('stomata')}
              style={{ cursor: 'pointer' }}
            />
            {/* Stomatal pore indication */}
            <circle cx="70" cy="55" r="5" fill={stomataOpen ? '#80DEEA' : '#455A64'} />
            <text x="50" y="32" fill="#2E7D32" fontSize="10" fontWeight="700">
              Leaf (Photosynthesis)
            </text>

            {/* Transpiration water vapour puffs leaving stomata */}
            {stomataOpen && isPlaying && (
              <g className="vapour-clouds" opacity="0.8">
                <circle cx="70" cy="38" r="4" fill="#B3E5FC" />
                <circle cx="64" cy="28" r="5" fill="#E1F5FE" />
                <circle cx="78" cy="20" r="6" fill="#E1F5FE" />
              </g>
            )}

            {/* Taproot & Root hairs below soil */}
            <path d="M 170 270 L 170 380" stroke="#8D6E63" strokeWidth="12" strokeLinecap="round" />
            {/* Root hairs */}
            {[290, 315, 340, 365].map((y, i) => (
              <g key={i} onClick={() => handlePartClick('root_hair')} style={{ cursor: 'pointer' }}>
                <line x1="164" y1={y} x2="110" y2={y - 8} stroke="#A1887F" strokeWidth="2.5" />
                <line x1="176" y1={y + 10} x2="230" y2={y + 18} stroke="#A1887F" strokeWidth="2.5" />
              </g>
            ))}
            <text x="90" y="375" fill="#5D4037" fontSize="10" fontWeight="700">Root Hairs (Absorption)</text>

            {/* XYLEM PIPELINE (Solid Blue, Upward Chevrons, Inner Stem) */}
            {(pathway === 'both' || pathway === 'xylem') && (
              <g onClick={() => handlePartClick('xylem')} style={{ cursor: 'pointer' }}>
                {/* Channel Guide */}
                <path
                  d="M 125 365 Q 150 320 150 270 L 150 120 Q 150 90 90 60"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  opacity="0.25"
                />
                <path
                  d="M 125 365 Q 150 320 150 270 L 150 120 Q 150 90 90 60"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                />
                {/* Upward Chevron Arrows along path (PRD AC-M04-2: always visible even paused) */}
                {[0.2, 0.45, 0.7, 0.9].map((ratio, i) => {
                  const y = 360 - ratio * 290;
                  return (
                    <polygon
                      key={i}
                      points={`146,${y} 150,${y - 8} 154,${y}`}
                      fill="var(--primary)"
                    />
                  );
                })}

                {/* Animated Water Droplets */}
                {xylemParticles.map((t, idx) => {
                  // Parametric position along xylem curve
                  const py = 360 - t * 290;
                  const px = t < 0.25 ? 125 + (t / 0.25) * 25 : t > 0.8 ? 150 - ((t - 0.8) / 0.2) * 60 : 150;
                  return (
                    <circle
                      key={idx}
                      cx={px}
                      cy={py}
                      r="3.2"
                      fill="#0072B2"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            )}

            {/* PHLOEM PIPELINE (Vermillion Dashed, Downward Chevrons, Outer Stem) */}
            {(pathway === 'both' || pathway === 'phloem') && (
              <g onClick={() => handlePartClick('phloem')} style={{ cursor: 'pointer' }}>
                {/* Channel Guide (At least 14px gap from xylem as per PRD AC-M04-1) */}
                <path
                  d="M 90 75 Q 185 90 185 120 L 185 270 Q 185 320 215 360"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="8"
                  opacity="0.25"
                />
                <path
                  d="M 90 75 Q 185 90 185 120 L 185 270 Q 185 320 215 360"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                />
                {/* Downward Chevron Arrows along path (AC-M04-2) */}
                {[0.2, 0.45, 0.7, 0.9].map((ratio, i) => {
                  const y = 80 + ratio * 270;
                  return (
                    <polygon
                      key={i}
                      points={`181,${y} 185,${y + 8} 189,${y}`}
                      fill="var(--secondary)"
                    />
                  );
                })}

                {/* Animated Food Particles (Sucrose dots) */}
                {phloemParticles.map((t, idx) => {
                  const py = 75 + t * 280;
                  const px = t < 0.2 ? 90 + (t / 0.2) * 95 : t > 0.8 ? 185 + ((t - 0.8) / 0.2) * 30 : 185;
                  return (
                    <circle
                      key={idx}
                      cx={px}
                      cy={py}
                      r="3.2"
                      fill="#D55E00"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Histological Tube Zoom & Details */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setZoomedTube('xylem');
                recordInteraction('tube_zoom_xylem');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: zoomedTube === 'xylem' ? 'var(--primary)' : 'rgba(0, 114, 178, 0.1)',
                color: zoomedTube === 'xylem' ? '#fff' : 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Zoom: Xylem Vessel
            </button>
            <button
              onClick={() => {
                setZoomedTube('phloem');
                recordInteraction('tube_zoom_phloem');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: zoomedTube === 'phloem' ? 'var(--secondary)' : 'rgba(178, 74, 0, 0.1)',
                color: zoomedTube === 'phloem' ? '#fff' : 'var(--secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Zoom: Phloem Sieve Tube
            </button>
          </div>

          {/* Tube Schematic */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {zoomedTube === 'phloem' ? (
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '6px', fontSize: '0.95rem' }}>
                  Phloem Sieve Tube & Companion Cell:
                </div>
                <svg viewBox="0 0 240 120" style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '0 auto' }}>
                  {/* Sieve tube with end plates */}
                  <rect x="30" y="15" width="80" height="90" fill="#FFE0B2" stroke="#E65100" strokeWidth="2" />
                  {/* Perforated Sieve Plate */}
                  <line x1="30" y1="60" x2="110" y2="60" stroke="#E65100" strokeWidth="3" strokeDasharray="4,6" />
                  <text x="70" y="55" fill="#BF360C" fontSize="9" textAnchor="middle" fontWeight="bold">Sieve Plate</text>

                  {/* Companion cell attached with prominent nucleus */}
                  <rect x="115" y="25" width="60" height="70" fill="#FFF3E0" stroke="#FB8C00" strokeWidth="2" />
                  <circle cx="145" cy="60" r="12" fill="#E65100" />
                  <text x="145" y="90" fill="#E65100" fontSize="8" textAnchor="middle" fontWeight="bold">Nucleus</text>
                  <text x="145" y="20" fill="#E65100" fontSize="9" textAnchor="middle" fontWeight="bold">Companion Cell</text>
                </svg>
                <p style={{ fontSize: '0.82rem', margin: '8px 0 0 0', lineHeight: 1.4, color: 'var(--text)' }}>
                  Sieve tubes lack nuclei at maturity; their metabolic transport activities are actively regulated
                  by adjacent nucleated companion cells through plasmodesmata connections.
                </p>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', fontSize: '0.95rem' }}>
                  Xylem Vessel & Tracheids (Continuous Water Column):
                </div>
                <svg viewBox="0 0 240 120" style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '0 auto' }}>
                  {/* Thick lignified continuous hollow tube */}
                  <rect x="60" y="15" width="120" height="90" fill="#E1F5FE" stroke="#0277BD" strokeWidth="6" />
                  {/* Annular / Spiral Lignin Rings */}
                  {[30, 50, 70, 90].map((y, i) => (
                    <ellipse key={i} cx="120" cy={y} rx="50" ry="6" fill="none" stroke="#01579B" strokeWidth="2" />
                  ))}
                  <text x="120" y="112" fill="#01579B" fontSize="9" textAnchor="middle" fontWeight="bold">Hollow Lumen & Lignified Wall</text>
                </svg>
                <p style={{ fontSize: '0.82rem', margin: '8px 0 0 0', lineHeight: 1.4, color: 'var(--text)' }}>
                  Tracheids and vessels are hollow, elongated tubes with dissolved transverse walls. Thick lignified
                  walls prevent inward collapse under intense negative pressure (suction) generated by leaf transpiration.
                </p>
              </div>
            )}
          </div>

          {/* Pause and Ponder 3 Callout */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(37, 112, 43, 0.08)',
              borderLeft: '4px solid var(--accent)',
              fontSize: '0.82rem',
              lineHeight: 1.45,
            }}
          >
            <strong>Pause & Ponder:</strong> Water must travel upward against gravity without a mechanical pump.
            What keeps it moving?
            <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text)', opacity: 0.9 }}>
              Evaporation of water molecules from leaf stomatal pores creates a continuous suction (transpiration pull)
              drawing water up through xylem.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const M04Spec: ModuleSpec = {
  meta: {
    id: 'M04',
    title: 'Xylem and Phloem Transport',
    subtitle: 'Directionality and Vascular Hydraulic Circuits',
    category: 'Plant Tissues',
    themeId: 'M04',
    objective:
      'Trace water and minerals up through xylem and food from leaves through phloem, and see why the two pathways differ.',
    predictPrompt:
      'Water is absorbed at the roots. Which direction will it travel, and which tissue carries it?',
    predictOptions: [
      'Upwards towards leaves and stem, carried exclusively by xylem',
      'Downwards towards the soil, carried by phloem',
      'In both directions equally through collenchyma',
      'Sideways into the bark through epidermis',
    ],
    notes: [
      {
        title: 'Xylem Transport',
        text: 'Transports water and dissolved minerals strictly upward from roots. Vessels are hollow and thick-walled.',
      },
      {
        title: 'Phloem Transport',
        text: 'Carries food (sucrose) made in leaves to all non-green organs (bidirectional distribution).',
      },
      {
        title: 'Transpiration Pull',
        text: 'Water loss through stomatal pores creates suction pull pulling water columns against gravity.',
      },
    ],
    checks: [
      {
        qid: 'M04_Q1',
        prompt: 'If food cannot move from leaves to roots, which tissue is faulty or damaged?',
        options: ['Phloem', 'Xylem', 'Parenchyma', 'Collenchyma'],
        answer: 'Phloem',
        why: 'Phloem is the specialized complex vascular tissue responsible for the translocation of synthesized soluble food molecules.',
      },
      {
        qid: 'M04_Q2',
        prompt: 'What would happen to water movement if leaf stomata stayed tightly closed?',
        options: [
          'Transpiration pull would drop, so water would move up much more slowly',
          'Water would instantly flow backwards out of the roots',
          'Xylem vessels would burst from pressure',
          'Roots would stop absorbing minerals completely',
        ],
        answer: 'Transpiration pull would drop, so water would move up much more slowly',
        why: 'Transpiration generates suction; without open stomata, evaporation stops and xylem sap velocity drops to ~20% of normal.',
      },
    ],
    requiredInteractions: ['pathway_both_viewed', 'stomata_toggled', 'xylem_clicked', 'phloem_clicked'],
  },
  Component: M04Transport,
};
