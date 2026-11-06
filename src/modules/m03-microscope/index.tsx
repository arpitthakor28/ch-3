import React, { useState, useEffect } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { ZoomIn, ZoomOut, Eye, Layers, HelpCircle, Check, X, BookOpen } from 'lucide-react';

const M03_CONFIG = designValues.M03;

interface TissueInfo {
  id: string;
  name: string;
  system: 'dermal' | 'ground' | 'vascular';
  livingStatus: 'Living' | 'Dead' | 'Mostly Dead';
  complexity: 'Simple' | 'Complex';
  summary: string;
  details: string[];
}

const TISSUES: Record<string, TissueInfo> = {
  epidermis: {
    id: 'epidermis',
    name: 'Epidermis',
    system: 'dermal',
    livingStatus: 'Living',
    complexity: 'Simple',
    summary: 'Outermost single layer of tightly packed flat cells. Protects against injury, water loss and germs.',
    details: ['Waxy cuticle on outside', 'Unicellular/multicellular hairs', 'Stomata regulate gas exchange'],
  },
  collenchyma: {
    id: 'collenchyma',
    name: 'Collenchyma',
    system: 'ground',
    livingStatus: 'Living',
    complexity: 'Simple',
    summary: 'Living cells with corners thickened by pectin. Gives support with flexibility so stems bend without breaking.',
    details: ['Localized pectin corner thickenings', 'Little intercellular space', 'Provides tensile elasticity'],
  },
  parenchyma: {
    id: 'parenchyma',
    name: 'Parenchyma',
    system: 'ground',
    livingStatus: 'Living',
    complexity: 'Simple',
    summary: 'Living, thin-walled, loosely packed cells with gaps. Stores food; does photosynthesis in green parts.',
    details: ['Unspecialized thin cellulose walls', 'Large prominent central vacuole', 'Aerenchyma variant floats in water'],
  },
  sclerenchyma: {
    id: 'sclerenchyma',
    name: 'Sclerenchyma',
    system: 'ground',
    livingStatus: 'Dead',
    complexity: 'Simple',
    summary: 'Thick walls with lignin; hard and strong; mostly dead cells. Found in stems, leaf veins, coconut husk.',
    details: ['Heavy lignin wall deposition', 'Extremely narrow lumen', 'Provides mechanical rigidity'],
  },
  phloem: {
    id: 'phloem',
    name: 'Phloem',
    system: 'vascular',
    livingStatus: 'Living',
    complexity: 'Complex',
    summary: 'Carries food made in leaves to other parts; companion cells control loading and unloading of sugars.',
    details: ['Sieve tubes with perforated plates', 'Companion cells with nuclei', 'Phloem parenchyma and fibres'],
  },
  xylem: {
    id: 'xylem',
    name: 'Xylem',
    system: 'vascular',
    livingStatus: 'Mostly Dead',
    complexity: 'Complex',
    summary: 'Carries water and minerals from roots upward; tubular tracheids and vessels also give strong physical support.',
    details: ['Tracheids and hollow vessels', 'Lignified conduction pipes', 'Xylem parenchyma (living storage)'],
  },
};

const FIND_IT_QUESTIONS = [
  { tissueId: 'parenchyma', prompt: 'Find the tissue that stores food and has large intercellular spaces.' },
  { tissueId: 'sclerenchyma', prompt: 'Find the tissue with thick lignified walls made of dead cells.' },
  { tissueId: 'xylem', prompt: 'Find the vascular tissue that conducts water and minerals upwards.' },
  { tissueId: 'collenchyma', prompt: 'Find the living mechanical tissue with unevenly thickened pectin corners.' },
  { tissueId: 'phloem', prompt: 'Find the complex tissue that transports sugars made in leaves.' },
  { tissueId: 'epidermis', prompt: 'Find the outermost protective single cell layer.' },
];

export const M03VirtualMicroscope: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  onObservationUpdate,
  resetSignal,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = Low, 2 = Medium, 3 = High
  const [selectedTissue, setSelectedTissue] = useState<TissueInfo | null>(null);
  const [clickedTissues, setClickedTissues] = useState<Set<string>>(new Set());
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showSystemsOverlay, setShowSystemsOverlay] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Find-it challenge state
  const [challengeActive, setChallengeActive] = useState<boolean>(false);
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [challengeFinished, setChallengeFinished] = useState<boolean>(false);

  useEffect(() => {
    setZoomLevel(1);
    setSelectedTissue(null);
    setClickedTissues(new Set());
    setShowLabels(false);
    setShowSystemsOverlay(false);
    setShowCompareModal(false);
    setChallengeActive(false);
    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeFeedback(null);
    setChallengeFinished(false);
  }, [resetSignal]);

  const handleTissueClick = (tissueKey: string) => {
    const tissue = TISSUES[tissueKey];
    if (!tissue) return;

    if (challengeActive && !challengeFinished) {
      const currentQ = FIND_IT_QUESTIONS[challengeIndex];
      if (tissueKey === currentQ.tissueId) {
        setChallengeFeedback(`✓ Correct! That is ${tissue.name}.`);
        setChallengeScore((s) => s + 1);
      } else {
        setChallengeFeedback(`✗ That was ${tissue.name}. Try again on the next prompt.`);
      }

      setTimeout(() => {
        if (challengeIndex + 1 < FIND_IT_QUESTIONS.length) {
          setChallengeIndex((i) => i + 1);
          setChallengeFeedback(null);
        } else {
          setChallengeFinished(true);
          const finalScore = challengeScore + (tissueKey === currentQ.tissueId ? 1 : 0);
          if (finalScore >= M03_CONFIG.find_it_pass_score) {
            recordInteraction('find_it_completed', { score: finalScore });
          }
        }
      }, 1200);
      return;
    }

    setSelectedTissue(tissue);
    setClickedTissues((prev) => {
      const next = new Set(prev).add(tissueKey);
      if (next.size >= M03_CONFIG.min_tissues_clicked) {
        recordInteraction('min_tissues_clicked');
      }
      return next;
    });
    recordInteraction(`tissue_clicked_${tissueKey}`);
  };

  const toggleLabels = () => {
    setShowLabels((prev) => {
      const next = !prev;
      if (next) recordInteraction('labels_revealed');
      return next;
    });
  };

  const openCompareModal = () => {
    setShowCompareModal(true);
    recordInteraction('compare_cells_opened');
  };

  // Sync observations
  useEffect(() => {
    if (onObservationUpdate) {
      onObservationUpdate({
        microscopeAnalysis: {
          tissuesInvestigated: Array.from(clickedTissues),
          findItScore: challengeFinished ? `${challengeScore}/${FIND_IT_QUESTIONS.length}` : null,
          tissueSystemsExplored: showSystemsOverlay,
        },
      });
    }
  }, [clickedTissues, challengeFinished, challengeScore, showSystemsOverlay, onObservationUpdate]);

  // Color coding depending on overlay mode
  const getFillColor = (tissueKey: string) => {
    if (showSystemsOverlay) {
      const sys = TISSUES[tissueKey]?.system;
      if (sys === 'dermal') return '#43A047'; // Green
      if (sys === 'ground') return '#FDD835'; // Yellow
      if (sys === 'vascular') return '#1E88E5'; // Blue
    }
    switch (tissueKey) {
      case 'epidermis':
        return '#A5D6A7';
      case 'collenchyma':
        return '#81C784';
      case 'parenchyma':
        return '#C8E6C9';
      case 'sclerenchyma':
        return '#D7CCC8';
      case 'phloem':
        return '#FFB74D';
      case 'xylem':
        return '#90CAF9';
      default:
        return '#E0E0E0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Microscope Top Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'var(--surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Zoom Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Objective Lens:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
            disabled={zoomLevel === 1}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
            }}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', minWidth: '85px', textAlign: 'center' }}>
            {zoomLevel === 1 ? '10x (Low)' : zoomLevel === 2 ? '40x (Med)' : '100x (High)'}
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 1))}
            disabled={zoomLevel === 3}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
            }}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Feature Toggles */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleLabels}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: showLabels ? 'var(--secondary)' : 'transparent',
              color: showLabels ? '#000000' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Eye size={15} />
            <span>Labels: {showLabels ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowSystemsOverlay((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: showSystemsOverlay ? 'var(--accent)' : 'transparent',
              color: showSystemsOverlay ? '#ffffff' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Layers size={15} />
            <span>Tissue Systems</span>
          </button>

          <button
            onClick={openCompareModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <BookOpen size={15} />
            <span>Compare Cell Walls</span>
          </button>

          <button
            onClick={() => {
              setChallengeActive(true);
              setChallengeIndex(0);
              setChallengeScore(0);
              setChallengeFinished(false);
              setChallengeFeedback(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <HelpCircle size={15} />
            <span>Find-It Challenge</span>
          </button>
        </div>
      </div>

      {/* Challenge Alert Bar */}
      {challengeActive && (
        <div
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
          }}
        >
          <div>
            {!challengeFinished ? (
              <span>
                <strong>Prompt ({challengeIndex + 1}/6):</strong> {FIND_IT_QUESTIONS[challengeIndex].prompt}
              </span>
            ) : (
              <span style={{ fontWeight: 700, color: challengeScore >= 4 ? '#4CAF50' : '#FF9800' }}>
                Challenge Completed! Score: {challengeScore} / 6{' '}
                {challengeScore >= 4 ? '— Excellent identification skills!' : '— Review tissue layers and retry!'}
              </span>
            )}
            {challengeFeedback && (
              <div style={{ marginTop: '4px', fontSize: '0.82rem', fontWeight: 600 }}>{challengeFeedback}</div>
            )}
          </div>
          <button
            onClick={() => setChallengeActive(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Microscope Viewport & Info Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Specimen Field (Dark Room + Light Specimen Disc #F7F3EA as per PRD 5.1) */}
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
          {/* Eyepiece circular aperture */}
          <div
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: '#F7F3EA', // Mid-tone light backdrop keeping tissue colors true
              border: '10px solid #201C45',
              boxShadow: 'inset 0 0 25px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 320 320"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${zoomLevel === 1 ? 1 : zoomLevel === 2 ? 1.7 : 2.8})`,
                transition: 'transform 0.4s ease',
              }}
            >
              {/* Sunflower Stem T.S. Histology Section */}

              {/* Central Ground Tissue / Pith */}
              <circle
                cx="160"
                cy="160"
                r="45"
                fill="#F1F8E9"
                stroke="#C5E1A5"
                strokeWidth="1.5"
                onClick={() => handleTissueClick('parenchyma')}
                style={{ cursor: 'pointer' }}
              />

              {/* Xylem Inner Ring */}
              <circle
                cx="160"
                cy="160"
                r="70"
                fill="none"
                stroke={getFillColor('xylem')}
                strokeWidth="16"
                strokeDasharray="6,2"
                onClick={() => handleTissueClick('xylem')}
                style={{ cursor: 'pointer' }}
              />

              {/* Cambium Thin Ring */}
              <circle
                cx="160"
                cy="160"
                r="80"
                fill="none"
                stroke="#7A4E1D"
                strokeWidth="3"
                opacity="0.8"
              />

              {/* Phloem Ring */}
              <circle
                cx="160"
                cy="160"
                r="92"
                fill="none"
                stroke={getFillColor('phloem')}
                strokeWidth="14"
                strokeDasharray="4,2"
                onClick={() => handleTissueClick('phloem')}
                style={{ cursor: 'pointer' }}
              />

              {/* Sclerenchyma Patches / Pericycle bundle caps */}
              <circle
                cx="160"
                cy="160"
                r="104"
                fill="none"
                stroke={getFillColor('sclerenchyma')}
                strokeWidth="10"
                strokeDasharray="14,14"
                onClick={() => handleTissueClick('sclerenchyma')}
                style={{ cursor: 'pointer' }}
              />

              {/* Parenchyma Cortex */}
              <circle
                cx="160"
                cy="160"
                r="118"
                fill="none"
                stroke={getFillColor('parenchyma')}
                strokeWidth="18"
                onClick={() => handleTissueClick('parenchyma')}
                style={{ cursor: 'pointer' }}
              />

              {/* Collenchyma Hypodermis */}
              <circle
                cx="160"
                cy="160"
                r="132"
                fill="none"
                stroke={getFillColor('collenchyma')}
                strokeWidth="10"
                onClick={() => handleTissueClick('collenchyma')}
                style={{ cursor: 'pointer' }}
              />

              {/* Outermost Epidermis with Cuticle & Trichomes */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke={getFillColor('epidermis')}
                strokeWidth="6"
                onClick={() => handleTissueClick('epidermis')}
                style={{ cursor: 'pointer' }}
              />

              {/* Multicellular epidermal hairs (trichomes) protruding */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x1 = 160 + 143 * Math.cos(rad);
                const y1 = 160 + 143 * Math.sin(rad);
                const x2 = 160 + 155 * Math.cos(rad);
                const y2 = 160 + 155 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#2E7D32"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Reticle / Measurement Crosshair */}
              <line x1="160" y1="20" x2="160" y2="300" stroke="#000000" strokeWidth="0.5" opacity="0.25" />
              <line x1="20" y1="160" x2="300" y2="160" stroke="#000000" strokeWidth="0.5" opacity="0.25" />

              {/* Labels overlay when showLabels is true */}
              {showLabels && (
                <g className="labels-overlay">
                  <rect x="180" y="30" width="80" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="220" y="42" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Epidermis</text>

                  <rect x="195" y="60" width="85" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="237" y="72" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Collenchyma</text>

                  <rect x="200" y="90" width="85" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="242" y="102" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Parenchyma</text>

                  <rect x="195" y="118" width="90" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="240" y="130" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Sclerenchyma</text>

                  <rect x="180" y="145" width="60" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="210" y="157" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Phloem</text>

                  <rect x="175" y="172" width="55" height="18" rx="3" fill="rgba(0,0,0,0.7)" />
                  <text x="202" y="184" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Xylem</text>
                </g>
              )}
            </svg>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text)', opacity: 0.8 }}>
            Click any tissue ring to open its histological function card.
          </div>
        </div>

        {/* Selected Tissue Card (max 25 words rule as per AC-M03-1) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {selectedTissue ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>
                  {selectedTissue.name}
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: selectedTissue.livingStatus === 'Living' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(239, 83, 80, 0.2)',
                      color: selectedTissue.livingStatus === 'Living' ? '#4CAF50' : '#EF5350',
                      fontWeight: 700,
                    }}
                  >
                    {selectedTissue.livingStatus}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(33, 150, 243, 0.15)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                    }}
                  >
                    {selectedTissue.complexity} Permanent Tissue
                  </span>
                </div>
              </div>

              {/* Function summary card (AC-M03-1: 25 words or fewer) */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--primary)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  color: 'var(--text)',
                }}
              >
                {selectedTissue.summary}
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text)' }}>
                  Histological Components:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)' }}>
                  {selectedTissue.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Cell Wall Inset (AC-M03-5: visible without color) */}
              <div style={{ marginTop: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                  Cell Wall Texture (Micro-structure):
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg viewBox="0 0 80 50" style={{ width: '80px', height: '50px' }}>
                    {selectedTissue.id === 'parenchyma' && (
                      <g>
                        <circle cx="20" cy="25" r="14" fill="none" stroke="var(--text)" strokeWidth="1" />
                        <circle cx="45" cy="25" r="14" fill="none" stroke="var(--text)" strokeWidth="1" />
                        <circle cx="32" cy="12" r="8" fill="rgba(0,0,0,0.15)" />
                      </g>
                    )}
                    {selectedTissue.id === 'collenchyma' && (
                      <g>
                        <polygon points="15,10 40,10 50,35 25,45 10,25" fill="none" stroke="var(--text)" strokeWidth="1.5" />
                        {/* Thickened corners */}
                        <circle cx="15" cy="10" r="4.5" fill="var(--text)" />
                        <circle cx="40" cy="10" r="4.5" fill="var(--text)" />
                        <circle cx="50" cy="35" r="4.5" fill="var(--text)" />
                        <circle cx="25" cy="45" r="4.5" fill="var(--text)" />
                        <circle cx="10" cy="25" r="4.5" fill="var(--text)" />
                      </g>
                    )}
                    {selectedTissue.id === 'sclerenchyma' && (
                      <g>
                        <polygon points="10,10 45,5 55,35 30,45 10,35" fill="rgba(0,0,0,0.2)" stroke="var(--text)" strokeWidth="5" />
                        <circle cx="32" cy="25" r="2.5" fill="var(--surface)" />
                      </g>
                    )}
                    {(selectedTissue.id === 'xylem' || selectedTissue.id === 'phloem') && (
                      <g>
                        <line x1="15" y1="10" x2="15" y2="40" stroke="var(--text)" strokeWidth="3" />
                        <line x1="45" y1="10" x2="45" y2="40" stroke="var(--text)" strokeWidth="3" />
                        <line x1="15" y1="25" x2="45" y2="25" stroke="var(--text)" strokeWidth="1" strokeDasharray="2,2" />
                      </g>
                    )}
                    {selectedTissue.id === 'epidermis' && (
                      <g>
                        <rect x="10" y="20" width="55" height="16" fill="none" stroke="var(--text)" strokeWidth="2" />
                        <line x1="10" y1="16" x2="65" y2="16" stroke="var(--primary)" strokeWidth="2.5" />
                      </g>
                    )}
                  </svg>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                    {selectedTissue.id === 'parenchyma'
                      ? 'Thin cellulose walls with visible intercellular gaps.'
                      : selectedTissue.id === 'collenchyma'
                      ? 'Thickened corners (pectin deposits) providing flexibility.'
                      : selectedTissue.id === 'sclerenchyma'
                      ? 'Heavily lignified thick walls with narrow empty lumen.'
                      : selectedTissue.id === 'epidermis'
                      ? 'Single cell layer with continuous waxy cuticle.'
                      : 'Tubular specialized conducting elements.'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text)', opacity: 0.7 }}>
              <Eye size={36} style={{ marginBottom: '8px' }} />
              <div>Click any region on the sunflower stem T.S. to reveal its cellular structure and function.</div>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Compare Cells Modal */}
      {showCompareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '700px',
              width: '100%',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>
                Comparison of Simple Permanent Tissues
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {/* Parenchyma */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary)' }}>Parenchyma</h4>
                <div style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#4CAF50', fontWeight: 600 }}>Living Cells</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                  Thin cellulose walls, loose packing with intercellular air spaces. Stores food and supports aquatic plants.
                </p>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Wall: Thin cellulose</div>
              </div>

              {/* Collenchyma */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--secondary)' }}>Collenchyma</h4>
                <div style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#4CAF50', fontWeight: 600 }}>Living Cells</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                  Unevenly thickened corners with pectin. Gives mechanical support with elasticity so branches bend without breaking.
                </p>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Wall: Pectin corner thickenings</div>
              </div>

              {/* Sclerenchyma */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--accent)' }}>Sclerenchyma</h4>
                <div style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#EF5350', fontWeight: 600 }}>Dead Cells</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                  Very thick lignified walls with narrow obliterated lumen. Gives rigid mechanical strength (coconut husk, seed coats).
                </p>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Wall: Thickened with lignin</div>
              </div>
            </div>

            <button
              onClick={() => setShowCompareModal(false)}
              style={{
                marginTop: '18px',
                padding: '8px 18px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                float: 'right',
              }}
            >
              Close Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const M03Spec: ModuleSpec = {
  meta: {
    id: 'M03',
    title: 'Virtual Tissue Microscope',
    subtitle: 'Sunflower Stem Cross-Section Histology',
    category: 'Plant Tissues',
    themeId: 'M03',
    objective:
      'Connect each permanent plant tissue structure to its function using a transverse section (T.S.) of a sunflower stem.',
    predictPrompt:
      'Look at the unlabelled stem cross-section. Which cells do you think carry water from roots upwards?',
    predictOptions: [
      'The inner vascular ring of wide tubular vessels (Xylem)',
      'The thin outermost epidermal layer',
      'The soft central pith',
      'The outer collenchyma layer',
    ],
    notes: [
      {
        title: 'Epidermis',
        text: 'Outermost single protective layer. Covered by cuticle. Regulates water loss and gas exchange.',
      },
      {
        title: 'Parenchyma',
        text: 'Living, thin-walled, loosely packed cells. Stores nutrients; green chlorenchyma does photosynthesis.',
      },
      {
        title: 'Collenchyma',
        text: 'Living cells with corners thickened by pectin. Provides mechanical flexibility and bending support.',
      },
      {
        title: 'Sclerenchyma',
        text: 'Dead cells with thick lignified walls. Makes plant tissues hard and stiff (e.g. coconut husk).',
      },
      {
        title: 'Complex Tissues',
        text: 'Xylem conducts water; phloem conducts food. Each consists of several cell types acting together.',
      },
    ],
    checks: [
      {
        qid: 'M03_Q1',
        prompt: 'Which simple tissue has thick lignified walls and mostly dead cells?',
        options: ['Sclerenchyma', 'Parenchyma', 'Collenchyma', 'Epidermis'],
        answer: 'Sclerenchyma',
        why: 'Sclerenchyma cells deposit heavy lignin in their secondary walls, obliterate the lumen, and become non-living at maturity to give rigidity.',
      },
      {
        qid: 'M03_Q2',
        prompt: 'Why are xylem and phloem called complex tissues?',
        options: [
          'Each is made of more than one type of cell working together',
          'They only exist in very large trees',
          'They do not have cell walls',
          'They cannot divide after one year',
        ],
        answer: 'Each is made of more than one type of cell working together',
        why: 'Simple tissues have only one cell type, whereas complex tissues (like xylem with tracheids, vessels, parenchyma, fibres) comprise multiple coordinated cell types.',
      },
    ],
    requiredInteractions: ['min_tissues_clicked', 'compare_cells_opened', 'find_it_completed'],
  },
  Component: M03VirtualMicroscope,
};
