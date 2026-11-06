import React, { useState, useEffect } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Shield, Droplet, Activity, Check, Bone, Info, Filter, Eye } from 'lucide-react';

const M06_CONFIG = designValues.M06;

type MatrixCategory = 'All' | 'Fluid' | 'Hard and rigid' | 'Soft and jelly-like' | 'Strong band';

interface ConnectiveTissueCard {
  id: string;
  name: string;
  matrixType: 'Fluid' | 'Hard and rigid' | 'Soft and jelly-like' | 'Strong band';
  matrixDescription: string;
  exampleLocations: string[];
  keyFunction: string;
  cellTypes: string;
  color: string;
  badge: string;
}

const CONNECTIVE_TISSUES: ConnectiveTissueCard[] = [
  {
    id: 'blood',
    name: 'Blood',
    matrixType: 'Fluid',
    matrixDescription: 'Fluid extracellular matrix called plasma (55% volume) containing water, proteins and salts',
    exampleLocations: ['Circulatory system', 'Heart and blood vessels across the entire body'],
    keyFunction: 'Transports respiratory gases (O₂/CO₂), digested food nutrients, hormones and waste',
    cellTypes: 'Red Blood Cells (RBC), White Blood Cells (WBC), Platelets (suspended elements: 45%)',
    color: '#D55E00',
    badge: 'Liquid matrix',
  },
  {
    id: 'bone',
    name: 'Bone',
    matrixType: 'Hard and rigid',
    matrixDescription: 'Hard, dense rigid matrix composed of insoluble calcium and phosphorus compounds',
    exampleLocations: ['Skeletal framework', 'Skull, ribs, spine, arm and leg long bones'],
    keyFunction: 'Forms the supportive body framework, anchors skeletal muscles, protects vital organs',
    cellTypes: 'Osteocytes embedded in microscopic concentric matrix rings (osteons)',
    color: '#5A4A3A',
    badge: 'Mineralized solid',
  },
  {
    id: 'cartilage',
    name: 'Cartilage',
    matrixType: 'Soft and jelly-like',
    matrixDescription: 'Firm yet elastic, jelly-like matrix enriched with proteins and sugars',
    exampleLocations: ['Ear pinna', 'Nose tip', 'Larynx (voice box)', 'Ends of long bones in joints'],
    keyFunction: 'Smooths and cushions bone surfaces at joints, absorbs mechanical shocks, allows flexibility',
    cellTypes: 'Chondrocytes residing in small matrix spaces called lacunae',
    color: '#1F6F9F',
    badge: 'Flexible cushion',
  },
  {
    id: 'tendon',
    name: 'Tendon',
    matrixType: 'Strong band',
    matrixDescription: 'Dense, cord-like fibrous connective tissue with very high tensile strength and limited elasticity',
    exampleLocations: ['Ends of biceps and quadriceps muscles attaching into bones', 'Achilles tendon'],
    keyFunction: 'Transmits contractile pulling force from muscle directly onto bone to produce motion',
    cellTypes: 'Fibroblasts packed tightly in parallel collagen fibre bundles',
    color: '#8A4B00',
    badge: 'Muscle to Bone',
  },
  {
    id: 'ligament',
    name: 'Ligament',
    matrixType: 'Strong band',
    matrixDescription: 'Elastic fibrous bands containing both strong collagen and elastic fibres with minimal matrix',
    exampleLocations: ['Crossed within and around joints (e.g. knee, elbow, ankle, wrist)'],
    keyFunction: 'Connects bone to bone across joints, stabilizes joints, restricts excessive angles, prevents dislocation',
    cellTypes: 'Fibroblasts interspersed within resilient criss-crossing elastic fibres',
    color: '#00695C',
    badge: 'Bone to Bone',
  },
];

export const M06ConnectiveTissue: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('blood');
  const [openedCards, setOpenedCards] = useState<Set<string>>(new Set(['blood']));
  const [activeFilter, setActiveFilter] = useState<MatrixCategory>('All');
  const [activeScenario, setActiveScenario] = useState<'cut' | 'infection' | 'exercise'>('cut');
  const [showKneeJoint, setShowKneeJoint] = useState<boolean>(false);
  const [feelItResponses, setFeelItResponses] = useState<Record<string, boolean>>({});

  const handleOpenCard = (id: string) => {
    setSelectedCardId(id);
    const updated = new Set(openedCards);
    updated.add(id);
    setOpenedCards(updated);

    if (updated.size >= 5) {
      recordInteraction('all_connective_opened');
    }

    if (onObservationUpdate) {
      onObservationUpdate({
        openedCount: updated.size,
        openedList: Array.from(updated),
      });
    }
  };

  const handleFilterChange = (filter: MatrixCategory) => {
    setActiveFilter(filter);
    if (filter !== 'All') {
      recordInteraction('matrix_filter_used', { filter });
    }
  };

  const handleScenarioChange = (scenario: 'cut' | 'infection' | 'exercise') => {
    setActiveScenario(scenario);
    recordInteraction('blood_scenario_played', { scenario });
  };

  const handleToggleKnee = () => {
    const nextState = !showKneeJoint;
    setShowKneeJoint(nextState);
    if (nextState) {
      recordInteraction('knee_joint_viewed');
    }
  };

  const currentTissue = CONNECTIVE_TISSUES.find((t) => t.id === selectedCardId) || CONNECTIVE_TISSUES[0];

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
      {/* Matrix Filter & Top Selection Bar */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
              Filter by Intercellular Matrix Type:
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
            Explored: <strong>{openedCards.size} of 5</strong> tissues
          </span>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['All', 'Fluid', 'Hard and rigid', 'Soft and jelly-like', 'Strong band'] as MatrixCategory[]).map(
            (cat) => {
              const isSelected = activeFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 5 Five Cards in a row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {CONNECTIVE_TISSUES.map((tissue) => {
          const isSelected = selectedCardId === tissue.id;
          const isOpened = openedCards.has(tissue.id);
          const isDimmed = activeFilter !== 'All' && tissue.matrixType !== activeFilter;

          return (
            <div
              key={tissue.id}
              onClick={() => handleOpenCard(tissue.id)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${tissue.name} connective tissue card`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenCard(tissue.id);
              }}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                border: isSelected ? `2.5px solid ${tissue.color}` : '1px solid var(--border)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                opacity: isDimmed ? 0.35 : 1,
                transform: isSelected ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: tissue.color }}>{tissue.name}</span>
                {isOpened && <Check size={14} color="var(--accent)" />}
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  color: tissue.color,
                }}
              >
                {tissue.badge}
              </span>

              <div style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8, lineHeight: 1.3 }}>
                <strong>Matrix:</strong> {tissue.matrixType}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Stage: Blood Tube Panel OR Knee Joint Model */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 0.8fr)',
          gap: '20px',
        }}
      >
        {/* Left: Active Tissue Deep-Dive (Blood Tube or Knee Joint or Tissue Card) */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: currentTissue.color, fontWeight: 700 }}>
              {currentTissue.name} Tissue Details
            </h4>
            <button
              type="button"
              onClick={handleToggleKnee}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: showKneeJoint ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: showKneeJoint ? 'var(--primary)' : 'transparent',
                color: showKneeJoint ? '#ffffff' : 'var(--text)',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <Bone size={14} /> {showKneeJoint ? 'Hide Knee Joint' : 'View Knee Joint (Tendon/Ligament)'}
            </button>
          </div>

          {!showKneeJoint ? (
            /* Selected Tissue Specific View */
            <div>
              {selectedCardId === 'blood' ? (
                /* Blood Centrifuge Tube Panel (PRD AC-M06-3: Plasma 55% & Formed Elements 45%) */
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* SVG Blood Centrifuge Test Tube with 3D Glass & Cellular Render */}
                    <div style={{ width: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <svg viewBox="0 0 90 190" width="90" height="190" aria-label="3D Centrifuged blood test tube diagram">
                        <defs>
                          <filter id="tube3d-shadow" x="-20%" y="-10%" width="140%" height="130%">
                            <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.18" />
                          </filter>
                          <linearGradient id="glassReflection3d" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                            <stop offset="25%" stopColor="#E2E8F0" stopOpacity="0.2" />
                            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.5" />
                          </linearGradient>
                          <linearGradient id="plasmaGrad3d" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FEF08A" />
                            <stop offset="50%" stopColor="#FDE047" />
                            <stop offset="100%" stopColor="#EAB308" />
                          </linearGradient>
                          <linearGradient id="rbcGrad3d" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#EF4444" />
                            <stop offset="50%" stopColor="#DC2626" />
                            <stop offset="100%" stopColor="#991B1B" />
                          </linearGradient>
                          <radialGradient id="rbcDisc3d" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#F87171" />
                            <stop offset="60%" stopColor="#DC2626" />
                            <stop offset="100%" stopColor="#7F1D1D" />
                          </radialGradient>
                        </defs>

                        {/* Outer Glass Tube with 3D drop shadow */}
                        <g filter="url(#tube3d-shadow)">
                          <path
                            d="M 20 15 L 70 15 L 70 150 C 70 175 20 175 20 150 Z"
                            fill="#F8FAFC"
                            stroke="#64748B"
                            strokeWidth="2"
                          />

                          {/* Plasma top portion: 55% */}
                          <path
                            d="M 22 70 L 68 70 L 68 18 L 22 18 Z"
                            fill="url(#plasmaGrad3d)"
                            opacity="0.9"
                          />
                          {/* Plasma meniscus */}
                          <ellipse cx="45" cy="18" rx="23" ry="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />

                          {/* Buffy coat (WBC & Platelets <1%) */}
                          <rect x="22" y="69" width="46" height="5" fill="#FFFFFF" opacity="0.9" stroke="#E2E8F0" strokeWidth="0.5" />

                          {/* Red blood cells bottom portion: 45% */}
                          <path
                            d="M 22 74 L 68 74 L 68 150 C 68 172 22 172 22 150 Z"
                            fill="url(#rbcGrad3d)"
                          />
                          {/* Top surface of packed RBC */}
                          <ellipse cx="45" cy="74" rx="23" ry="3.5" fill="#B91C1C" />

                          {/* Floating RBC biconcave discs inside */}
                          <ellipse cx="36" cy="105" rx="5" ry="3" fill="url(#rbcDisc3d)" />
                          <ellipse cx="54" cy="125" rx="5.5" ry="3.2" fill="url(#rbcDisc3d)" />
                          <ellipse cx="40" cy="145" rx="5" ry="3" fill="url(#rbcDisc3d)" />

                          {/* 3D Specular glass highlight streak */}
                          <path
                            d="M 25 20 L 30 20 L 30 150 C 30 162 26 160 25 155 Z"
                            fill="#FFFFFF"
                            opacity="0.65"
                          />

                          {/* Test Tube Calibration Scale Marks */}
                          <line x1="58" y1="40" x2="68" y2="40" stroke="#0F172A" strokeWidth="1.2" opacity="0.6" />
                          <line x1="52" y1="70" x2="68" y2="70" stroke="#0F172A" strokeWidth="2" opacity="0.8" />
                          <line x1="58" y1="105" x2="68" y2="105" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                          <line x1="58" y1="135" x2="68" y2="135" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                        </g>
                      </svg>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                        3D Blood Stratification
                      </span>
                    </div>

                    {/* Breakdown & Percentages */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFBEA',
                          borderLeft: '4px solid #E69F00',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7A4E1D' }}>
                          Plasma · {M06_CONFIG.plasma_percent}% by Volume
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.9 }}>
                          Watery fluid matrix containing dissolved food, carbon dioxide, urea, hormones and antibodies.
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#FDEAE6',
                          borderLeft: '4px solid #D55E00',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D55E00' }}>
                          Formed Elements · {M06_CONFIG.formed_elements_percent}% by Volume
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text)', opacity: 0.9 }}>
                          • <strong>RBC (Erythrocytes):</strong> Hemoglobin-packed biconcave discs, ~120 day lifespan.<br />
                          • <strong>WBC (Leukocytes):</strong> Disease-fighting defense cells.<br />
                          • <strong>Platelets:</strong> Cell fragments essential for blood clotting.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blood Physiological Scenarios (Table 3.3) */}
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                      Blood Response Scenarios (Activity 3.3):
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {[
                        { id: 'cut', label: '1. Small Cut' },
                        { id: 'infection', label: '2. Skin Infection' },
                        { id: 'exercise', label: '3. Vigorous Exercise' },
                      ].map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => handleScenarioChange(sc.id as any)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: activeScenario === sc.id ? '2px solid var(--secondary)' : '1px solid var(--border)',
                            backgroundColor: activeScenario === sc.id ? 'var(--secondary)' : 'transparent',
                            color: activeScenario === sc.id ? '#ffffff' : 'var(--text)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                          }}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--border)',
                        fontSize: '0.82rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {activeScenario === 'cut' && (
                        <span>
                          🩸 <strong>Clotting Reaction:</strong> Platelets quickly aggregate at the broken capillary,
                          releasing clotting factors that create a mesh of fibrin fibres. This traps RBCs to seal the
                          wound and prevent fatal blood loss.
                        </span>
                      )}
                      {activeScenario === 'infection' && (
                        <span>
                          🛡️ <strong>Immune Defense:</strong> White Blood Cells (WBC) squeeze out through capillary walls
                          toward bacteria. They engulf pathogens by phagocytosis. Accumulation of dead microbes and WBCs
                          forms yellowish pus with mild localized redness and swelling.
                        </span>
                      )}
                      {activeScenario === 'exercise' && (
                        <span>
                          ⚡ <strong>Oxygen Delivery:</strong> Muscle cells demand high ATP energy. Heart accelerates
                          pumping. Red blood cells rapidly load oxygen at alveoli and unload it at working skeletal
                          fibres while sweeping away metabolic CO₂.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-blood Tissue Detailed View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: currentTissue.color }}>
                      Intercellular Matrix Structure:
                    </div>
                    <p style={{ margin: '4px 0 10px 0', fontSize: '0.84rem', color: 'var(--text)' }}>
                      {currentTissue.matrixDescription}
                    </p>

                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: currentTissue.color }}>
                      Key Cells Present:
                    </div>
                    <p style={{ margin: '4px 0 10px 0', fontSize: '0.84rem', color: 'var(--text)' }}>
                      {currentTissue.cellTypes}
                    </p>

                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: currentTissue.color }}>
                      Primary Biological Function:
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text)' }}>
                      {currentTissue.keyFunction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Knee Joint Visual Anatomy (PRD AC-M06-1: Tendon muscle-to-bone; Ligament bone-to-bone) */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              <svg viewBox="0 0 320 220" width="300" height="200" aria-label="3D Knee joint showing tendon, ligament, and cartilage">
                <defs>
                  <filter id="knee3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.2" />
                  </filter>
                  <linearGradient id="femurBone3d" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#F5F2E9" />
                    <stop offset="70%" stopColor="#D5CBB5" />
                    <stop offset="100%" stopColor="#A89E88" />
                  </linearGradient>
                  <radialGradient id="cartilageKnee3d" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#E0F2FE" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </radialGradient>
                  <linearGradient id="tendonKnee3d" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#F5F3ED" />
                    <stop offset="100%" stopColor="#C8BEAC" />
                  </linearGradient>
                  <linearGradient id="ligamentKnee3d" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A7F3D0" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>

                {/* Femur (Thigh bone) in 3D */}
                <g filter="url(#knee3d-shadow)">
                  <path d="M 120 10 L 170 10 L 175 90 C 180 105 160 115 145 115 C 130 115 115 105 115 90 Z" fill="url(#femurBone3d)" stroke="#78716C" strokeWidth="2" />
                  <text x="145" y="45" fill="#44403C" fontSize="11" fontWeight="800" textAnchor="middle">Femur (Bone)</text>
                </g>

                {/* Tibia (Shin bone) in 3D */}
                <g filter="url(#knee3d-shadow)">
                  <path d="M 115 135 C 115 125 130 120 145 120 C 160 120 175 125 175 135 L 170 210 L 120 210 Z" fill="url(#femurBone3d)" stroke="#78716C" strokeWidth="2" />
                  <text x="145" y="180" fill="#44403C" fontSize="11" fontWeight="800" textAnchor="middle">Tibia (Bone)</text>
                </g>

                {/* Articular Cartilage (blue-grey cushions on bone ends) */}
                <path d="M 118 92 C 122 110 168 110 172 92" stroke="url(#cartilageKnee3d)" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 118 132 C 122 122 168 122 172 132" stroke="url(#cartilageKnee3d)" strokeWidth="6" fill="none" strokeLinecap="round" />
                <text x="210" y="112" fill="#0284C7" fontSize="10" fontWeight="800">3D Cartilage Cushion</text>
                <line x1="175" y1="110" x2="205" y2="110" stroke="#0284C7" strokeWidth="1" strokeDasharray="2,2" />

                {/* Quadriceps Muscle on thigh */}
                <path d="M 75 25 Q 60 70 85 95 L 95 90 Q 75 60 90 25 Z" fill="#F87171" stroke="#DC2626" strokeWidth="1.5" filter="url(#knee3d-shadow)" />
                <text x="50" y="55" fill="#DC2626" fontSize="10" fontWeight="800">Muscle</text>

                {/* Tendon (attaches muscle to kneecap / shin bone) in 3D */}
                <path d="M 85 95 L 98 125 L 115 145" stroke="url(#tendonKnee3d)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#knee3d-shadow)" />
                <text x="35" y="125" fill="#B45309" fontSize="10" fontWeight="800">Tendon</text>
                <text x="25" y="137" fill="#B45309" fontSize="8" fontWeight="600">(Muscle → Bone)</text>

                {/* Patella (kneecap) with 3D sphere */}
                <circle cx="100" cy="118" r="11" fill="url(#femurBone3d)" stroke="#78716C" strokeWidth="1.5" filter="url(#knee3d-shadow)" />

                {/* Ligament (crosses joint from Femur bone to Tibia bone) in 3D */}
                <path d="M 172 85 C 185 110 185 125 172 145" stroke="url(#ligamentKnee3d)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#knee3d-shadow)" />
                <text x="220" y="140" fill="#047857" fontSize="10" fontWeight="800">Ligament</text>
                <text x="220" y="152" fill="#047857" fontSize="8" fontWeight="600">(Bone → Bone)</text>
              </svg>

              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 105, 92, 0.08)',
                  borderLeft: '4px solid #00695C',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  width: '100%',
                }}
              >
                <strong>Key Anatomical Rule:</strong> Tendons connect <em>muscle to bone</em> (transmitting mechanical
                pull). Ligaments connect <em>bone to bone</em> (holding the joint together and preventing dislocation).
              </div>
            </div>
          )}
        </div>

        {/* Right: Table 3.4 "Feel-It" Self-Exploration Activity */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
            Feel-It Sensory Lab (Table 3.4)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: 'var(--text)', opacity: 0.85 }}>
            Perform these simple physical checks to feel how matrix hardness dictates tissue flexibility:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                id: 'f1',
                action: '1. Touch your elbow',
                tissue: 'Bone',
                obs: 'Rock-solid and unyielding rigid matrix (calcium/phosphate).',
              },
              {
                id: 'f2',
                action: '2. Gently press your ear pinna',
                tissue: 'Cartilage',
                obs: 'Flexible and springy; bends easily without snapping or breaking.',
              },
              {
                id: 'f3',
                action: '3. Wiggle your fingers vigorously',
                tissue: 'Tendon',
                obs: 'Feel tight cords pulling in your forearm to move finger bones.',
              },
              {
                id: 'f4',
                action: '4. Stand and bend knee backward',
                tissue: 'Ligament & Hinge',
                obs: 'Stops firmly at limit; ligaments prevent knee from bending sideways or hyper-extending.',
              },
            ].map((item) => {
              const isChecked = feelItResponses[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    const next = { ...feelItResponses, [item.id]: true };
                    setFeelItResponses(next);
                    if (Object.keys(next).length >= 4) {
                      recordInteraction('feel_it_completed');
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: isChecked ? 'rgba(0, 158, 115, 0.08)' : 'rgba(0,0,0,0.02)',
                    border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{item.action}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: isChecked ? 'var(--accent)' : 'var(--secondary)',
                      }}
                    >
                      {item.tissue}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text)', opacity: 0.85, marginTop: '3px' }}>
                    {item.obs}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table (PRD AC-M06-4: fills in as cards are opened) */}
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
          Master Comparison Summary (Table 3.4 Synthesis)
        </h4>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Tissue</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Matrix Characteristic</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Key Location</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Primary Function</th>
            </tr>
          </thead>
          <tbody>
            {CONNECTIVE_TISSUES.map((item) => {
              const isExplored = openedCards.has(item.id);
              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: isExplored ? 'transparent' : 'rgba(0, 0, 0, 0.015)',
                    opacity: isExplored ? 1 : 0.45,
                  }}
                >
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: item.color }}>
                    {item.name} {isExplored ? '' : '(Click to unlock)'}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {isExplored ? item.matrixType : '—'}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {isExplored ? item.exampleLocations[0] : '—'}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {isExplored ? item.keyFunction : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const M06Spec: ModuleSpec = {
  meta: {
    id: 'M06',
    title: 'Connective Tissue Comparison',
    subtitle: 'Matrix Diversity: Blood, Bone, Cartilage, Tendon & Ligament',
    category: 'Animal Tissues',
    themeId: 'M06',
    objective: 'Tell apart blood, bone, cartilage, tendon and ligament by matrix, location and function.',
    predictPrompt: 'Both blood and bone are connective tissues. What do you think makes them so different?',
    predictOptions: [
      'The nature and hardness of their extracellular matrix',
      'Blood has no cellular components',
      'Bone has no blood supply and is non-living',
      'They perform identical bodily functions',
    ],
    notes: [
      {
        title: 'Matrix Defines Connective Tissue',
        text: 'Connective tissues bind and support organs. Their unique physical properties depend on the nature of their extracellular matrix.',
      },
      {
        title: 'Tendon vs Ligament',
        text: 'Tendon joins muscle to bone allowing movement. Ligament joins bone to bone giving stability and preventing dislocation.',
      },
      {
        title: 'Blood Composition',
        text: 'Blood consists of 55% liquid plasma matrix and 45% formed cellular elements (RBCs, WBCs, and clotting platelets).',
      },
    ],
    checks: [
      {
        qid: 'M06_Q1',
        prompt: 'What joins a muscle to a bone?',
        options: ['Tendon', 'Ligament', 'Cartilage disc', 'Epithelium'],
        answer: 'Tendon',
        why: 'Tendons are tough, fibrous cords that anchor muscle to bone and transmit pulling forces to move the skeleton.',
      },
      {
        qid: 'M06_Q2',
        prompt: 'What limits movement at a joint and helps prevent dislocation?',
        options: ['Ligament', 'Tendon', 'Blood plasma', 'Squamous cells'],
        answer: 'Ligament',
        why: 'Ligaments connect bone to bone across a joint capsule, providing structural elasticity and preventing dislocation.',
      },
    ],
    requiredInteractions: [
      'all_connective_opened',
      'matrix_filter_used',
      'blood_scenario_played',
      'knee_joint_viewed',
    ],
  },
  Component: M06ConnectiveTissue,
};

