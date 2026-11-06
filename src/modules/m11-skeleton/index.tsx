import React, { useState } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Shield, Wind, Activity, Check, Info, Heart } from 'lucide-react';

const M11_CONFIG = designValues.M11;

type SkeletonRegion = 'skull' | 'vertebral' | 'ribcage';

export const M11SkeletonExplorer: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<SkeletonRegion>('vertebral');
  const [viewedRegions, setViewedRegions] = useState<Set<string>>(new Set(['vertebral']));

  // Vertebral Spine Controls
  const [spineBend, setSpineBend] = useState<number>(0); // -30 (back) to +30 (forward)
  const [showCartilageDiscs, setShowCartilageDiscs] = useState<boolean>(true);

  // Rib Cage Breathing Controls
  const [breatheValue, setBreatheValue] = useState<number>(50); // 0 (full exhale) to 100 (full inhale)

  const handleSelectRegion = (reg: SkeletonRegion) => {
    setSelectedRegion(reg);
    const updated = new Set(viewedRegions);
    updated.add(reg);
    setViewedRegions(updated);

    if (updated.size >= 3) {
      recordInteraction('all_regions_selected');
    }
  };

  const handleBreatheChange = (val: number) => {
    setBreatheValue(val);
    recordInteraction('breathe_slider_used', { value: val });
  };

  const handleToggleDiscs = () => {
    const next = !showCartilageDiscs;
    setShowCartilageDiscs(next);
    recordInteraction('disc_view_toggled', { show: next });
  };

  // Breathing expansion factors (0 to 1)
  const breathFactor = breatheValue / 100;
  const chestExpansion = 16 * breathFactor;

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
      {/* Top Region Selector Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
            Select Axial Skeleton Region:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'skull', label: '1. Skull (Cranium)' },
              { id: 'vertebral', label: '2. Vertebral Column (Backbone)' },
              { id: 'ribcage', label: '3. Rib Cage (12 Pairs)' },
            ].map((reg) => {
              const isSelected = selectedRegion === reg.id;
              const isViewed = viewedRegions.has(reg.id);

              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleSelectRegion(reg.id as any)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isViewed && <Check size={12} color="var(--accent)" />}
                  {reg.label}
                </button>
              );
            })}
          </div>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
          {viewedRegions.size} of 3 regions explored
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(280px, 0.7fr)',
          gap: '20px',
        }}
      >
        {/* Left: Dynamic SVG Close-Up */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>
              {selectedRegion === 'skull' && 'Cranial Vault & Facial Skeleton'}
              {selectedRegion === 'vertebral' && 'Vertebral Column & Cartilage Intervertebral Discs'}
              {selectedRegion === 'ribcage' && 'Thoracic Cage (12 Pairs of Ribs & Sternum)'}
            </h4>

            {selectedRegion === 'vertebral' && (
              <button
                type="button"
                onClick={handleToggleDiscs}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  backgroundColor: showCartilageDiscs ? 'rgba(47, 93, 138, 0.15)' : 'transparent',
                  color: 'var(--secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showCartilageDiscs ? 'Hide Cartilage Discs' : 'Show Cartilage Discs'}
              </button>
            )}
          </div>

          {/* SVG Visualizer */}
          <div
            style={{
              height: '320px',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {selectedRegion === 'skull' && (
              /* Skull Detailed Diagram */
              <svg viewBox="0 0 240 220" width="220" height="200" aria-label="Human skull protective cranium diagram">
                {/* Cranium braincase */}
                <path
                  d="M 50 110 C 40 40 180 30 190 110 C 195 140 170 170 150 170 L 120 170 L 115 195 L 85 195 L 80 170 C 60 160 55 130 50 110 Z"
                  fill="#EDEBE7"
                  stroke="#5A4A3A"
                  strokeWidth="2.5"
                />
                {/* Fixed cranial sutures */}
                <path d="M 120 40 Q 115 75 130 110" stroke="#5A4A3A" strokeWidth="2" strokeDasharray="3,3" fill="none" />
                <path d="M 60 90 Q 120 100 180 85" stroke="#5A4A3A" strokeWidth="2" strokeDasharray="3,3" fill="none" />
                {/* Eye orbit sockets */}
                <ellipse cx="95" cy="115" rx="14" ry="16" fill="#26231F" />
                <ellipse cx="145" cy="115" rx="14" ry="16" fill="#26231F" />
                {/* Nasal cavity aperture */}
                <polygon points="120,130 112,150 128,150" fill="#26231F" />
                {/* Upper and lower jaw teeth */}
                <rect x="95" y="165" width="50" height="10" fill="#FFFFFF" stroke="#5A4A3A" strokeWidth="1" />
                <rect x="95" y="177" width="50" height="10" fill="#FFFFFF" stroke="#5A4A3A" strokeWidth="1" />
                <text x="120" y="25" fontSize="10" fontWeight="700" fill="#5A4A3A" textAnchor="middle">
                  Brain Vault (Fixed Protective Sutures)
                </text>
              </svg>
            )}

            {selectedRegion === 'vertebral' && (
              /* Vertebral column with 6 stacked vertebrae & intervertebral discs that bend */
              <svg viewBox="0 0 240 280" width="220" height="260" aria-label="Vertebral column and cartilage discs">
                {/* Central spinal cord line */}
                <path
                  d={`M 120 20 Q ${120 + spineBend * 0.8} 140 120 260`}
                  stroke="#FFD166"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="3,2"
                />
                <text x="175" y="45" fontSize="8" fontWeight="700" fill="#E69F00">Spinal Cord Protected Inside</text>

                {/* 6 Stacked Vertebrae with discs */}
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const y = 35 + idx * 38;
                  const bendOffset = (Math.sin((idx / 5) * Math.PI) * spineBend);

                  return (
                    <g key={idx} transform={`translate(${bendOffset}, 0)`}>
                      {/* Bone vertebra */}
                      <rect
                        x="70"
                        y={y}
                        width="100"
                        height="22"
                        rx="5"
                        fill="#EDEBE7"
                        stroke="#5A4A3A"
                        strokeWidth="2"
                      />
                      <text x="120" y={y + 15} fontSize="9" fontWeight="600" fill="#5A4A3A" textAnchor="middle">
                        Vertebra {idx + 1}
                      </text>

                      {/* Cartilage Intervertebral Disc between vertebrae */}
                      {idx < 5 && showCartilageDiscs && (
                        <rect
                          x="76"
                          y={y + 23}
                          width="88"
                          height="13"
                          rx="4"
                          fill="#2F5D8A"
                          opacity="0.85"
                          stroke="#1B2430"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {selectedRegion === 'ribcage' && (
              /* Rib cage with EXACTLY 12 pairs of ribs (PRD AC-M11-1) */
              <svg viewBox="0 0 280 280" width="260" height="260" aria-label="Thoracic rib cage with 12 rib pairs">
                {/* Central Sternum (Breastbone) */}
                <rect x="135" y="30" width="10" height="150" rx="3" fill="#EDEBE7" stroke="#5A4A3A" strokeWidth="2" />
                <text x="140" y="22" fontSize="9" fontWeight="700" fill="#5A4A3A" textAnchor="middle">
                  Sternum
                </text>

                {/* Heart & Lungs behind the ribs */}
                <ellipse cx="140" cy="110" rx={45 + chestExpansion * 0.8} ry="45" fill="#FFE8E8" opacity="0.6" />
                <circle cx="125" cy="105" r="15" fill="#B5391C" opacity="0.5" />

                {/* Exactly 12 Pairs of Ribs */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const y = 35 + num * 12;
                  const curveSpread = 20 + num * 3.5 + (chestExpansion * (num <= 7 ? 0.8 : 0.4));

                  return (
                    <g key={num}>
                      {/* Left Rib */}
                      <path
                        d={`M 135 ${y} Q ${135 - curveSpread} ${y + 6} 95 ${y + 14}`}
                        stroke="#5A4A3A"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Left Costal Cartilage connecting rib to sternum (AC-M11-2) */}
                      <path
                        d={`M 135 ${y} L ${125} ${y + 2}`}
                        stroke="#2F5D8A"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Right Rib */}
                      <path
                        d={`M 145 ${y} Q ${145 + curveSpread} ${y + 6} 185 ${y + 14}`}
                        stroke="#5A4A3A"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Right Costal Cartilage */}
                      <path
                        d={`M 145 ${y} L ${155} ${y + 2}`}
                        stroke="#2F5D8A"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {/* Airflow Animation Arrows (AC-M11-4) */}
                <g transform="translate(140, 5)">
                  {breatheValue > 50 ? (
                    /* Breathing in (Inhale: arrows pointing down into lungs) */
                    <path d="M 0 0 L 0 15 M -4 10 L 0 15 L 4 10" stroke="#0072B2" strokeWidth="2" fill="none" />
                  ) : (
                    /* Breathing out (Exhale: arrows pointing up) */
                    <path d="M 0 15 L 0 0 M -4 5 L 0 0 L 4 5" stroke="#D55E00" strokeWidth="2" fill="none" />
                  )}
                </g>
              </svg>
            )}
          </div>

          {/* Interactive Sliders */}
          <div>
            {selectedRegion === 'vertebral' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span>Spine Flexion / Bend: {spineBend > 0 ? `+${spineBend}° (Forward)` : `${spineBend}°`}</span>
                  <span style={{ color: 'var(--secondary)' }}>Discs compress & expand</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={spineBend}
                  onChange={(e) => setSpineBend(Number(e.target.value))}
                  style={{ width: '100%' }}
                  aria-label="Vertebral spine bending slider"
                />
              </div>
            )}

            {selectedRegion === 'ribcage' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span>Breathing Expansion: {breatheValue > 50 ? 'Inhaling (Chest Expands)' : 'Exhaling (Chest Contracts)'}</span>
                  <span style={{ color: 'var(--secondary)' }}>Costal cartilage flexes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={breatheValue}
                  onChange={(e) => handleBreatheChange(Number(e.target.value))}
                  style={{ width: '100%' }}
                  aria-label="Ribcage breathing slider"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Structural Physiology Facts */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
            Functional Protection Matrix
          </h4>

          {selectedRegion === 'skull' && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text)' }}>
              <p>
                <strong>Brain Armor:</strong> The skull consists of 22 flat bones joined tightly by immovable fibrous
                sutures.
              </p>
              <p>
                <strong>Vital Senses:</strong> Houses deep bony sockets that protect the brain, eyes, olfactory nerves,
                and middle/inner ears from mechanical shock.
              </p>
            </div>
          )}

          {selectedRegion === 'vertebral' && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text)' }}>
              <p>
                <strong>Backbone Architecture:</strong> Made up of 33 ring-like vertebrae stacked one above another,
                forming a hollow canal that shields the delicate spinal cord.
              </p>
              <p>
                <strong>Cartilage Discs (Shock Absorbers):</strong> Fibrocartilaginous pads between vertebrae absorb
                impact when running or jumping, allowing the spine to twist and bend safely without grinding bone.
              </p>
            </div>
          )}

          {selectedRegion === 'ribcage' && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text)' }}>
              <p>
                <strong>12 Rib Pairs:</strong> Curving from the thoracic vertebrae behind to the sternum in front.
              </p>
              <p>
                <strong>Costal Cartilage Flexibility:</strong> Flexible cartilage bridges allow the chest cavity to
                expand upward and outward during inhalation, pulling fresh oxygen into the lungs.
              </p>
              <p>
                <strong>Organ Shield:</strong> Forms a resilient cage shielding the heart and lungs from injury.
              </p>
            </div>
          )}

          {/* Yoga Box (Bridging Science and Society) */}
          <div
            style={{
              marginTop: 'auto',
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(90, 74, 58, 0.08)',
              borderLeft: '4px solid var(--primary)',
              fontSize: '0.78rem',
              lineHeight: 1.4,
            }}
          >
            🧘 <strong>Yoga & Joint Mobility:</strong> Regular gentle stretching postures maintain blood supply to
            tendons, keep cartilage discs hydrated, and preserve natural joint flexibility across a lifetime.
          </div>
        </div>
      </div>
    </div>
  );
};

export const M11Spec: ModuleSpec = {
  meta: {
    id: 'M11',
    title: 'Skeleton Explorer',
    subtitle: 'Protective & Supportive Roles of Skull, Spine and Rib Cage',
    category: 'Movement & Skeleton',
    themeId: 'M11',
    objective:
      'Link the skull, vertebral column and rib cage to their protective and supportive roles.',
    predictPrompt:
      'What do you think the soft discs between the backbone bones are for?',
    predictOptions: [
      'Cushion vertebrae and allow the spine to bend with flexibility',
      'Store surplus minerals like iron',
      'Prevent blood from reaching the spinal cord',
      'Hold air pockets to make bones lighter',
    ],
    notes: [
      {
        title: 'Skeletal Framework',
        text: 'The skeleton provides bodily structure, anchors muscles and shields vital delicate organs like brain, heart and lungs.',
      },
      {
        title: 'Cartilage Discs',
        text: 'Intervertebral discs act as hydraulic shock absorbers between vertebrae, enabling flexible bending while protecting the spinal cord.',
      },
      {
        title: '12 Rib Pairs & Breathing',
        text: 'Flexible costal cartilage joins the 12 pairs of ribs to the sternum, allowing thoracic expansion and contraction during breathing.',
      },
    ],
    checks: [
      {
        qid: 'M11_Q1',
        prompt: 'What cushions the vertebrae and allows the spine to bend?',
        options: ['Cartilage discs', 'Ligament bands', 'Bone marrow', 'Striated muscle fibres'],
        answer: 'Cartilage discs',
        why: 'Elastic fibrocartilage discs sit between adjacent vertebrae to absorb shock and permit smooth bending of the spinal column.',
      },
      {
        qid: 'M11_Q2',
        prompt: 'Why is the rib cage joined with flexible cartilage?',
        options: [
          'So it can expand and contract during breathing',
          'To make the ribs permanently soft',
          'To allow ribs to rotate 360 degrees',
          'To absorb stomach acid',
        ],
        answer: 'So it can expand and contract during breathing',
        why: 'Flexible costal cartilage allows the rib cage to expand upward and outward during inhalation and contract during exhalation.',
      },
    ],
    requiredInteractions: ['all_regions_selected', 'breathe_slider_used', 'disc_view_toggled'],
  },
  Component: M11SkeletonExplorer,
};

