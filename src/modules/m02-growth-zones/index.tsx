import React, { useState, useEffect } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Graph } from '../../shared/Graph';
import { Scissors, Sparkles, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

const M02_CONFIG = designValues.M02;

type MeristemRegion = 'shoot_tip' | 'stem_side' | 'grass_node' | 'root_tip';

export const M02GrowthZones: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  onObservationUpdate,
  resetSignal,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<MeristemRegion>('shoot_tip');
  const [visitedRegions, setVisitedRegions] = useState<Set<MeristemRegion>>(new Set(['shoot_tip']));
  const [seasonsElapsed, setSeasonsElapsed] = useState<number>(0);
  const [shootCut, setShootCut] = useState<boolean>(false);
  const [grassMowed, setGrassMowed] = useState<boolean>(false);
  const [grassRegrowthStep, setGrassRegrowthStep] = useState<number>(0);
  const [showCellFeatures, setShowCellFeatures] = useState<boolean>(false);
  const [isDifferentiated, setIsDifferentiated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'plant' | 'grass' | 'tree_rings'>('plant');

  // Ring counting mini-challenge
  const [userRingGuess, setUserRingGuess] = useState<string>('');
  const [ringChallengeResult, setRingChallengeResult] = useState<boolean | null>(null);

  // Growth dimensions progression
  const [lateralSteps, setLateralSteps] = useState<number>(0);
  const [shootHeight, setShootHeight] = useState<number>(100);
  const [rootDepth, setRootDepth] = useState<number>(80);
  const [stemDiameter, setStemDiameter] = useState<number>(24);

  useEffect(() => {
    // Reset state
    setSelectedRegion('shoot_tip');
    setVisitedRegions(new Set(['shoot_tip']));
    setSeasonsElapsed(0);
    setShootCut(false);
    setGrassMowed(false);
    setGrassRegrowthStep(0);
    setShowCellFeatures(false);
    setIsDifferentiated(false);
    setActiveTab('plant');
    setUserRingGuess('');
    setRingChallengeResult(null);
    setLateralSteps(0);
    setShootHeight(100);
    setRootDepth(80);
    setStemDiameter(24);
  }, [resetSignal]);

  const selectRegion = (region: MeristemRegion) => {
    setSelectedRegion(region);
    setVisitedRegions((prev) => {
      const next = new Set(prev).add(region);
      if (next.size >= 4) {
        recordInteraction('all_regions_visited');
      }
      return next;
    });
    recordInteraction(`select_${region}`);
  };

  const advanceSeason = () => {
    if (seasonsElapsed >= M02_CONFIG.max_seasons) return;
    const nextSeason = seasonsElapsed + 1;
    setSeasonsElapsed(nextSeason);

    if (selectedRegion === 'shoot_tip') {
      if (!shootCut) {
        setShootHeight((h) => h + 18);
      }
    } else if (selectedRegion === 'root_tip') {
      setRootDepth((d) => d + 16);
    } else if (selectedRegion === 'stem_side') {
      setStemDiameter((d) => d + 8);
      const nextLateral = lateralSteps + 1;
      setLateralSteps(nextLateral);
      if (nextLateral >= 3) {
        recordInteraction('lateral_3_steps_done');
      }
    }

    if (grassMowed) {
      setGrassRegrowthStep((s) => s + 1);
    }
  };

  const cutShootTip = () => {
    setShootCut(true);
    recordInteraction('cut_shoot_tip');
  };

  const mowGrass = () => {
    setGrassMowed(true);
    setGrassRegrowthStep(0);
    recordInteraction('mow_grass');
  };

  const checkRingGuess = () => {
    const guess = parseInt(userRingGuess);
    if (guess === M02_CONFIG.ring_count_test_target) {
      setRingChallengeResult(true);
      recordInteraction('ring_count_completed');
    } else {
      setRingChallengeResult(false);
    }
  };

  // Sync observations
  useEffect(() => {
    if (onObservationUpdate) {
      onObservationUpdate({
        growthObservations: {
          regionsExplored: Array.from(visitedRegions),
          seasonsSimulated: seasonsElapsed,
          stemDiameterMm: stemDiameter,
          shootCutApplied: shootCut,
          grassRegrown: grassMowed && grassRegrowthStep >= 2,
          teakDataAnalyzed: true,
        },
      });
    }
  }, [visitedRegions, seasonsElapsed, stemDiameter, shootCut, grassMowed, grassRegrowthStep, onObservationUpdate]);

  // Teak graph series for Table 3.7
  const teakAgeLabels = M02_CONFIG.teak_table.ages.map((a) => `${a}y`);
  const teakGraphSeries = [
    {
      id: 'diameter',
      label: 'Diameter (cm)',
      color: '#2E7D32',
      markerShape: 'circle' as const,
      data: M02_CONFIG.teak_table.diameters,
    },
    {
      id: 'rings',
      label: 'Rings Formed',
      color: '#7A4E1D',
      markerShape: 'square' as const,
      lineDash: '3,3',
      data: M02_CONFIG.teak_table.rings,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--surface)',
          padding: '8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setActiveTab('plant')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'plant' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'plant' ? '#ffffff' : 'var(--text)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          1. Plant Meristem Zones
        </button>
        <button
          onClick={() => setActiveTab('grass')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'grass' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'grass' ? '#ffffff' : 'var(--text)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          2. Grass Intercalary Regrowth
        </button>
        <button
          onClick={() => setActiveTab('tree_rings')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'tree_rings' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'tree_rings' ? '#ffffff' : 'var(--text)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          3. Annual Rings & Teak Data
        </button>
      </div>

      {activeTab === 'plant' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Plant Canvas */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Whole Plant Histology</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8 }}>
                Season: {seasonsElapsed} / {M02_CONFIG.max_seasons}
              </span>
            </div>

            <svg viewBox="0 0 320 380" style={{ width: '100%', maxWidth: '320px', height: 'auto' }}>
              {/* Soil Line */}
              <rect x="0" y="240" width="320" height="140" fill="#E2D2B5" opacity="0.6" />
              <line x1="0" y1="240" x2="320" y2="240" stroke="#7A4E1D" strokeWidth="2.5" />
              <text x="10" y="258" fontSize="11" fill="#7A4E1D" fontWeight="600">
                Ground Level
              </text>

              {/* Stem (Height and Girth) */}
              {/* Stem width = stemDiameter */}
              <rect
                x={160 - stemDiameter / 2}
                y={240 - shootHeight}
                width={stemDiameter}
                height={shootHeight}
                fill="#8CB369"
                stroke="#5B8E3D"
                strokeWidth="2"
              />

              {/* Lateral Meristem ring cutaway on stem */}
              <g
                onClick={() => selectRegion('stem_side')}
                style={{ cursor: 'pointer' }}
                aria-label="Lateral meristem"
              >
                <rect
                  x={160 - stemDiameter / 2 - 3}
                  y={180}
                  width={stemDiameter + 6}
                  height="28"
                  fill="rgba(178, 74, 0, 0.25)"
                  stroke={selectedRegion === 'stem_side' ? 'var(--accent)' : '#7A4E1D'}
                  strokeWidth={selectedRegion === 'stem_side' ? 2.5 : 1}
                  strokeDasharray="2,2"
                />
                <circle cx={160 + stemDiameter / 2 + 15} cy={194} r="5" fill="var(--accent)" />
                <line x1={160 + stemDiameter / 2} y1={194} x2={160 + stemDiameter / 2 + 10} y2={194} stroke="var(--accent)" strokeWidth="1.5" />
                <text x={160 + stemDiameter / 2 + 25} y={198} fontSize="11" fontWeight="700" fill="var(--accent)">
                  Lateral (Cambium)
                </text>
              </g>

              {/* Shoot Apex / Tip */}
              {!shootCut ? (
                <g
                  onClick={() => selectRegion('shoot_tip')}
                  style={{ cursor: 'pointer' }}
                  aria-label="Apical meristem of shoot"
                >
                  <path
                    d={`M ${160 - stemDiameter / 2} ${240 - shootHeight} Q 160 ${240 - shootHeight - 16} ${160 + stemDiameter / 2} ${240 - shootHeight} Z`}
                    fill="#38B000"
                    stroke={selectedRegion === 'shoot_tip' ? 'var(--primary)' : '#2E7D32'}
                    strokeWidth={selectedRegion === 'shoot_tip' ? 3 : 1.5}
                  />
                  {/* Leaves at apex */}
                  <path
                    d={`M 160 ${240 - shootHeight} C 120 ${240 - shootHeight - 20} 125 ${240 - shootHeight - 40} 145 ${240 - shootHeight - 20} Z`}
                    fill="#43A047"
                  />
                  <path
                    d={`M 160 ${240 - shootHeight} C 200 ${240 - shootHeight - 20} 195 ${240 - shootHeight - 40} 175 ${240 - shootHeight - 20} Z`}
                    fill="#43A047"
                  />
                  <circle cx="160" cy={240 - shootHeight - 8} r="5" fill="var(--primary)" />
                  <text x="180" y={240 - shootHeight - 12} fontSize="11" fontWeight="700" fill="var(--primary)">
                    Shoot Apical
                  </text>
                </g>
              ) : (
                <g>
                  {/* Cut Flat Shoot Tip */}
                  <line
                    x1={160 - stemDiameter / 2 - 4}
                    y1={240 - shootHeight}
                    x2={160 + stemDiameter / 2 + 4}
                    y2={240 - shootHeight}
                    stroke="#D55E00"
                    strokeWidth="3"
                  />
                  <text x="175" y={240 - shootHeight + 4} fontSize="10" fill="#D55E00" fontWeight="700">
                    Shoot Apex Cut!
                  </text>
                  {/* New Lateral Branches sprouting from nodes (Fig 3.5 idea) */}
                  <path
                    d={`M ${160 - stemDiameter / 2} 160 Q 110 140 100 120`}
                    stroke="#5B8E3D"
                    strokeWidth="4"
                    fill="none"
                  />
                  <ellipse cx="95" cy="115" rx="10" ry="6" fill="#38B000" />
                  <path
                    d={`M ${160 + stemDiameter / 2} 170 Q 210 150 220 130`}
                    stroke="#5B8E3D"
                    strokeWidth="4"
                    fill="none"
                  />
                  <ellipse cx="225" cy="125" rx="10" ry="6" fill="#38B000" />
                </g>
              )}

              {/* Roots below soil line */}
              <g
                onClick={() => selectRegion('root_tip')}
                style={{ cursor: 'pointer' }}
                aria-label="Apical meristem of root"
              >
                {/* Main Taproot */}
                <path
                  d={`M 160 240 Q 158 ${240 + rootDepth * 0.5} 160 ${240 + rootDepth}`}
                  stroke="#A86F33"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Root tip cap */}
                <circle cx="160" cy={240 + rootDepth} r="6" fill="var(--primary)" />
                <text x="175" y={240 + rootDepth + 4} fontSize="11" fontWeight="700" fill="var(--primary)">
                  Root Apical
                </text>
              </g>
            </svg>

            {/* Stepper & Action Controls */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={advanceSeason}
                disabled={seasonsElapsed >= M02_CONFIG.max_seasons}
                style={{
                  padding: '7px 14px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Advance 1 Season ({seasonsElapsed}/{M02_CONFIG.max_seasons})
              </button>

              {!shootCut && (
                <button
                  onClick={cutShootTip}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    backgroundColor: 'var(--secondary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <Scissors size={15} />
                  <span>Cut Shoot Tip</span>
                </button>
              )}

              <button
                onClick={() => setShowCellFeatures((p) => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  backgroundColor: showCellFeatures ? 'var(--accent)' : 'transparent',
                  color: showCellFeatures ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Eye size={15} />
                <span>Cell Characteristics</span>
              </button>
            </div>
          </div>

          {/* Region Details & Cellular Close-up */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
              Active Selection:{' '}
              <span style={{ color: 'var(--primary)' }}>
                {selectedRegion === 'shoot_tip'
                  ? 'Apical Meristem (Shoot Apex)'
                  : selectedRegion === 'root_tip'
                  ? 'Apical Meristem (Root Apex)'
                  : selectedRegion === 'stem_side'
                  ? 'Lateral Meristem (Cambium)'
                  : 'Intercalary Meristem (Nodes)'}
              </span>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {selectedRegion === 'shoot_tip' && (
                <p style={{ margin: 0 }}>
                  <strong>Shoot Apical Meristem:</strong> Located at the tips of growing stems. Responsible
                  for primary growth (elongation). Adds height by generating new node segments and leaves.
                </p>
              )}
              {selectedRegion === 'root_tip' && (
                <p style={{ margin: 0 }}>
                  <strong>Root Apical Meristem:</strong> Situated beneath the protective root cap at the root tip.
                  Continuously pushes the root deeper into soil for water and mineral absorption.
                </p>
              )}
              {selectedRegion === 'stem_side' && (
                <p style={{ margin: 0 }}>
                  <strong>Lateral Meristem (Cambium):</strong> Arranged in concentric cylinders along the stem
                  and roots. Causes secondary growth: increases plant diameter and girth.
                </p>
              )}
              {selectedRegion === 'grass_node' && (
                <p style={{ margin: 0 }}>
                  <strong>Intercalary Meristem:</strong> Located at the base of leaves or internodes (e.g. grass).
                  Enables rapid regeneration when tips are removed by grazing animals or mowers.
                </p>
              )}
            </div>

            {/* Cell Features Diagram / Inset */}
            {showCellFeatures && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text)' }}>
                  Meristematic Cell Architecture (Close-up):
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <svg viewBox="0 0 120 120" style={{ width: '90px', height: '90px', flexShrink: 0 }}>
                    {/* Compact cells with no intercellular spaces */}
                    <rect x="10" y="10" width="45" height="45" rx="4" fill="#C8E6C9" stroke="#2E7D32" strokeWidth="1.5" />
                    <circle cx="32" cy="32" r="12" fill="#1B5E20" />
                    <rect x="60" y="10" width="45" height="45" rx="4" fill="#C8E6C9" stroke="#2E7D32" strokeWidth="1.5" />
                    <circle cx="82" cy="32" r="12" fill="#1B5E20" />
                    <rect x="10" y="60" width="45" height="45" rx="4" fill="#C8E6C9" stroke="#2E7D32" strokeWidth="1.5" />
                    <circle cx="32" cy="82" r="12" fill="#1B5E20" />
                    <rect x="60" y="60" width="45" height="45" rx="4" fill="#C8E6C9" stroke="#2E7D32" strokeWidth="1.5" />
                    <circle cx="82" cy="82" r="12" fill="#1B5E20" />
                  </svg>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text)' }}>
                    <li>Very thin cellulose cell walls</li>
                    <li>Dense, granular cytoplasm</li>
                    <li>Prominent, enlarged nucleus</li>
                    <li>No or tiny vacuoles (high metabolic rate)</li>
                    <li>Tightly packed without intercellular gaps</li>
                  </ul>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setIsDifferentiated(true);
                      recordInteraction('differentiation_clicked');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Animate Differentiation Process</span>
                  </button>
                  {isDifferentiated && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
                      ✓ Cells have taken a permanent shape, size and function (Differentiation completed).
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grass Intercalary Panel */}
      {activeTab === 'grass' && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                Intercalary Meristem: Grazing & Mowing Simulation
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8 }}>
                Grass blades cut above the node regrow through division of intercalary cells at the node base.
              </div>
            </div>
            <button
              onClick={mowGrass}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: 'var(--secondary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              <Scissors size={16} />
              <span>Mow Grass Blades</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', background: '#F1F8E9', borderRadius: '8px', padding: '20px' }}>
            <svg viewBox="0 0 360 220" style={{ width: '100%', maxWidth: '360px', height: 'auto' }}>
              {/* Soil */}
              <rect x="0" y="160" width="360" height="60" fill="#795548" />

              {/* Grass clump */}
              {Array.from({ length: 9 }).map((_, i) => {
                const baseX = 80 + i * 22;
                const nodeY = 140; // intercalary node
                let bladeHeight = 110;
                if (grassMowed) {
                  bladeHeight = 20 + Math.min(90, grassRegrowthStep * 45);
                }
                return (
                  <g key={i}>
                    {/* Node band (intercalary meristem) */}
                    <circle cx={baseX} cy={nodeY} r="4" fill="#2E7D32" />
                    {/* Stem below node */}
                    <line x1={baseX} y1="160" x2={baseX} y2={nodeY} stroke="#388E3C" strokeWidth="3" />
                    {/* Blade above node */}
                    <path
                      d={`M ${baseX} ${nodeY} Q ${baseX + (i % 2 === 0 ? 12 : -12)} ${nodeY - bladeHeight * 0.5} ${baseX + (i % 2 === 0 ? 20 : -20)} ${nodeY - bladeHeight}`}
                      stroke="#4CAF50"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              <text x="180" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600">
                Intercalary Meristem Active at Node Bases
              </text>
            </svg>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setGrassRegrowthStep((s) => s + 1);
                recordInteraction('grass_time_advanced');
              }}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              Advance Time (+1 Step)
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
              Regrowth status: {grassMowed ? (grassRegrowthStep >= 2 ? 'Fully Regrown!' : `Regrowing (Step ${grassRegrowthStep}/2)`) : 'Uncut lush grass'}
            </span>
          </div>
        </div>
      )}

      {/* Tree Rings & Table 3.7 Teak Data */}
      {activeTab === 'tree_rings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Tree Trunk SVG & Ring Count Mini-Challenge */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text)' }}>
              Tree Trunk Cross-Section (Annual Rings)
            </div>
            <svg viewBox="0 0 240 240" style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '0 auto' }}>
              {/* Bark */}
              <circle cx="120" cy="120" r="105" fill="#5D4037" />
              <circle cx="120" cy="120" r="98" fill="#8D6E63" />
              {/* 7 annual rings as per PRD 6 mini-task */}
              {[90, 78, 66, 54, 42, 30, 18].map((r, idx) => (
                <circle
                  key={idx}
                  cx="120"
                  cy="120"
                  r={r}
                  fill={idx % 2 === 0 ? '#EFEBE9' : '#D7CCC8'}
                  stroke="#6D4C41"
                  strokeWidth="2"
                />
              ))}
              <circle cx="120" cy="120" r="7" fill="#4E342E" />
            </svg>

            {/* Mini-Challenge: Count the rings */}
            <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Mini-Challenge: Count the annual rings in this trunk:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={userRingGuess}
                  onChange={(e) => setUserRingGuess(e.target.value)}
                  placeholder="e.g. 7"
                  style={{ width: '70px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
                <button
                  onClick={checkRingGuess}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  Verify
                </button>
              </div>
              {ringChallengeResult === true && (
                <div style={{ color: '#2E7D32', fontSize: '0.85rem', marginTop: '6px', fontWeight: 600 }}>
                  ✓ Correct! Exactly 7 rings, indicating an age of approximately 7 years.
                </div>
              )}
              {ringChallengeResult === false && (
                <div style={{ color: '#C62828', fontSize: '0.85rem', marginTop: '6px' }}>
                  Not quite. Count each concentric dark ring from centre to bark.
                </div>
              )}
            </div>
          </div>

          {/* Table 3.7 Teak Graph */}
          <div>
            <Graph
              title="Table 3.7 Teak Tree: Age vs Diameter and Annual Rings"
              xLabels={teakAgeLabels}
              yMin={0}
              yMax={45}
              yStep={5}
              yUnit="cm / rings"
              series={teakGraphSeries}
            />
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text)', opacity: 0.85, lineHeight: 1.4 }}>
              <strong>Observation:</strong> As the teak tree ages, lateral meristem (cambium) produces one ring
              annually, proportionally widening the breast-height diameter.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const M02Spec: ModuleSpec = {
  meta: {
    id: 'M02',
    title: 'Plant Growth-Zone Explorer',
    subtitle: 'Apical, Lateral and Intercalary Meristems',
    category: 'Plant Tissues',
    themeId: 'M02',
    objective:
      'Distinguish the three meristems: apical (length), lateral (girth), and intercalary (regrowth after cutting).',
    predictPrompt:
      'Which part of a plant grows when a tree trunk gets thicker?',
    predictOptions: [
      'A ring-shaped layer of dividing cells inside the stem (cambium)',
      'The shoot tip at the very top',
      'The root tip under the ground',
      'The nodes between the leaves',
    ],
    notes: [
      {
        title: 'Apical Meristem',
        text: 'At root and shoot tips. Makes the plant longer or deeper.',
      },
      {
        title: 'Lateral Meristem',
        text: 'A ring of dividing cells along the stem. Makes the stem thicker (girth).',
      },
      {
        title: 'Intercalary Meristem',
        text: 'Near nodes, at base of internodes in plants like grass. Helps regrowth after cutting.',
      },
    ],
    checks: [
      {
        qid: 'M02_Q1',
        prompt: 'A stem thickens over the years. Which meristem causes this?',
        options: ['Lateral meristem (cambium)', 'Apical meristem', 'Intercalary meristem', 'Parenchyma'],
        answer: 'Lateral meristem (cambium)',
        why: 'Lateral meristem (vascular and cork cambium) divides tangentially to increase stem diameter and secondary rings.',
      },
      {
        qid: 'M02_Q2',
        prompt: 'Why does grass grow back rapidly after mowing?',
        options: [
          'Intercalary meristem at its nodes keeps dividing',
          'Apical meristem in roots moves up into the air',
          'Sclerenchyma fibres multiply',
          'Epidermal cells turn into leaves',
        ],
        answer: 'Intercalary meristem at its nodes keeps dividing',
        why: 'Intercalary meristem is located at the internode bases; mowing removes top blades but leaves the intercalary zone intact.',
      },
      {
        qid: 'M02_Q3',
        prompt: 'What does counting annual rings tell scientists?',
        options: [
          'The approximate age of the tree and growing conditions each year',
          'The exact amount of chlorophyll produced',
          'The number of leaves on the tree',
          'How much fertilizer was added to the soil',
        ],
        answer: 'The approximate age of the tree and growing conditions each year',
        why: 'Each ring marks one year of secondary growth; wide rings indicate favourable moist seasons and narrow rings reflect dry stressful years.',
      },
    ],
    requiredInteractions: ['all_regions_visited', 'lateral_3_steps_done', 'cut_shoot_tip'],
  },
  Component: M02GrowthZones,
};
