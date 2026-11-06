import React, { useState } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { CheckCircle2, HelpCircle, Layers, Sparkles, ArrowRight, Shield, RefreshCw } from 'lucide-react';

const M05_CONFIG = designValues.M05;

interface EpithelialSubtype {
  id: string;
  name: string;
  cellShape: string;
  layers: string;
  keyRole: string;
  locations: string[];
  description: string;
  color: string;
  svgIcon: React.ReactNode;
}

const EPITHELIAL_TYPES: EpithelialSubtype[] = [
  {
    id: 'exchange',
    name: 'Exchange (Squamous)',
    cellShape: 'Thin, flat, tile-like delicate cells',
    layers: 'Single thin layer',
    keyRole: 'Rapid diffusion and exchange of gases and dissolved nutrients',
    locations: ['Lung alveoli (air sacs)', 'Blood vessel lining (capillaries)'],
    description:
      'Extremely thin, flat cells arranged edge-to-edge like floor tiles. This ultra-thin barrier allows oxygen, carbon dioxide, and nutrients to diffuse instantly across membranes.',
    color: '#0072B2',
    svgIcon: (
      <svg viewBox="0 0 120 70" width="100%" height="70" aria-label="Flat squamous exchange cells">
        <rect x="5" y="42" width="110" height="20" rx="3" fill="#E2F0F8" stroke="#0072B2" strokeWidth="2" />
        <line x1="32" y1="42" x2="32" y2="62" stroke="#0072B2" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="60" y1="42" x2="60" y2="62" stroke="#0072B2" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="88" y1="42" x2="88" y2="62" stroke="#0072B2" strokeWidth="1.5" strokeDasharray="2,2" />
        {/* nuclei (flattened) */}
        <ellipse cx="18" cy="52" rx="7" ry="3" fill="#0072B2" />
        <ellipse cx="46" cy="52" rx="7" ry="3" fill="#0072B2" />
        <ellipse cx="74" cy="52" rx="7" ry="3" fill="#0072B2" />
        <ellipse cx="102" cy="52" rx="7" ry="3" fill="#0072B2" />
        {/* diffusion arrows */}
        <path d="M 46 15 L 46 32" stroke="#25702B" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
        <path d="M 74 32 L 74 15" stroke="#D55E00" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'protection',
    name: 'Protection (Stratified Squamous)',
    cellShape: 'Multiple stacked layers of flattened cells',
    layers: 'Many layers (stratified)',
    keyRole: 'Resists wear, tear, mechanical abrasion and blocks microbe entry',
    locations: ['Outer skin epidermis', 'Lining of mouth cavity', 'Oesophagus (food pipe)'],
    description:
      'Many cell layers piled on top of each other. The surface cells are flat and wear off from friction while deeper base cells continuously divide to replenish them, protecting inner organs.',
    color: '#B0213B',
    svgIcon: (
      <svg viewBox="0 0 120 70" width="100%" height="70" aria-label="Stratified protective epithelial layers">
        <rect x="5" y="10" width="110" height="12" fill="#FCE8EC" stroke="#B0213B" strokeWidth="1.5" />
        <rect x="5" y="24" width="110" height="14" fill="#F8D4DB" stroke="#B0213B" strokeWidth="1.5" />
        <rect x="5" y="40" width="110" height="22" fill="#E8B4C0" stroke="#B0213B" strokeWidth="2" />
        <line x1="40" y1="40" x2="40" y2="62" stroke="#B0213B" strokeWidth="1" />
        <line x1="80" y1="40" x2="80" y2="62" stroke="#B0213B" strokeWidth="1" />
        {/* nuclei */}
        <circle cx="22" cy="51" r="4" fill="#8A1329" />
        <circle cx="60" cy="51" r="4" fill="#8A1329" />
        <circle cx="100" cy="51" r="4" fill="#8A1329" />
        <ellipse cx="30" cy="31" rx="5" ry="3" fill="#8A1329" />
        <ellipse cx="75" cy="31" rx="5" ry="3" fill="#8A1329" />
        <ellipse cx="50" cy="16" rx="6" ry="2" fill="#8A1329" />
      </svg>
    ),
  },
  {
    id: 'secretion',
    name: 'Secretion (Glandular / Cuboidal)',
    cellShape: 'Cube-like or columnar cells specialized to secrete fluids',
    layers: 'Single or folded glands',
    keyRole: 'Produces enzymes, hormones, mucus, sweat, and saliva',
    locations: ['Salivary glands', 'Sweat glands', 'Stomach lining (gastric juices)', 'Kidney tubules'],
    description:
      'Cube-shaped cells containing rich cytoplasmic granules that manufacture and discharge biochemical fluids such as enzymes for digestion, sweat for temperature control, or mucus for lubrication.',
    color: '#7A4E1D',
    svgIcon: (
      <svg viewBox="0 0 120 70" width="100%" height="70" aria-label="Glandular secretory cuboidal cells">
        <rect x="10" y="22" width="30" height="40" fill="#FFF2E0" stroke="#7A4E1D" strokeWidth="2" rx="2" />
        <rect x="45" y="22" width="30" height="40" fill="#FFF2E0" stroke="#7A4E1D" strokeWidth="2" rx="2" />
        <rect x="80" y="22" width="30" height="40" fill="#FFF2E0" stroke="#7A4E1D" strokeWidth="2" rx="2" />
        <circle cx="25" cy="42" r="6" fill="#7A4E1D" />
        <circle cx="60" cy="42" r="6" fill="#7A4E1D" />
        <circle cx="95" cy="42" r="6" fill="#7A4E1D" />
        {/* droplets secreting */}
        <circle cx="25" cy="12" r="3" fill="#E69F00" />
        <circle cx="60" cy="8" r="3.5" fill="#E69F00" />
        <circle cx="95" cy="13" r="3" fill="#E69F00" />
      </svg>
    ),
  },
  {
    id: 'sensory',
    name: 'Sensory (Ciliated / Neuroepithelial)',
    cellShape: 'Columnar cells with fine hair-like surface cilia',
    layers: 'Single specialized sensory layer',
    keyRole: 'Detects environmental stimuli (sound, smell, taste, fluid movement)',
    locations: ['Nostril olfactory lining (smell)', 'Tongue taste buds (taste)', 'Inner ear cochlea (hearing/balance)'],
    description:
      'Tall epithelial cells crowned with fine hair-like projections (cilia/micro-hairs). Mechanical or chemical contact bends these hairs, firing impulses into sensory neurons.',
    color: '#5B3A8E',
    svgIcon: (
      <svg viewBox="0 0 120 70" width="100%" height="70" aria-label="Ciliated sensory epithelial cells">
        <rect x="15" y="25" width="28" height="40" fill="#F2EBF9" stroke="#5B3A8E" strokeWidth="2" rx="2" />
        <rect x="47" y="25" width="28" height="40" fill="#F2EBF9" stroke="#5B3A8E" strokeWidth="2" rx="2" />
        <rect x="79" y="25" width="28" height="40" fill="#F2EBF9" stroke="#5B3A8E" strokeWidth="2" rx="2" />
        <circle cx="29" cy="46" r="5" fill="#5B3A8E" />
        <circle cx="61" cy="46" r="5" fill="#5B3A8E" />
        <circle cx="93" cy="46" r="5" fill="#5B3A8E" />
        {/* sensory hair cilia on top */}
        <line x1="20" y1="25" x2="16" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="29" y1="25" x2="29" y2="6" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="25" x2="42" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="25" x2="48" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="61" y1="25" x2="61" y2="6" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="25" x2="74" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="25" x2="80" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="93" y1="25" x2="93" y2="6" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
        <line x1="102" y1="25" x2="106" y2="8" stroke="#5B3A8E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'absorption',
    name: 'Absorption (Columnar with Microvilli)',
    cellShape: 'Tall pillar-like cells with brush border folds',
    layers: 'Single tall pillar layer',
    keyRole: 'Maximizes surface area to absorb digested nutrients into circulation',
    locations: ['Small intestine lining (villi)', 'Large intestine / colon'],
    description:
      'Tall, column-like cells standing side-by-side. Their apical surface has thousands of microscopic finger-like folds (microvilli) that vastly expand contact area for nutrient uptake.',
    color: '#00796B',
    svgIcon: (
      <svg viewBox="0 0 120 70" width="100%" height="70" aria-label="Tall columnar absorptive cells">
        {/* Brush border wavy top */}
        <path
          d="M 12 20 Q 15 15 18 20 T 24 20 T 30 20 T 36 20 T 42 20 T 48 20 T 54 20 T 60 20 T 66 20 T 72 20 T 78 20 T 84 20 T 90 20 T 96 20 T 102 20 T 108 20"
          stroke="#00796B"
          strokeWidth="2.5"
          fill="none"
        />
        <rect x="12" y="20" width="31" height="46" fill="#E6F5F2" stroke="#00796B" strokeWidth="1.5" />
        <rect x="44" y="20" width="31" height="46" fill="#E6F5F2" stroke="#00796B" strokeWidth="1.5" />
        <rect x="76" y="20" width="31" height="46" fill="#E6F5F2" stroke="#00796B" strokeWidth="1.5" />
        <ellipse cx="27" cy="48" rx="6" ry="10" fill="#00796B" />
        <ellipse cx="59" cy="48" rx="6" ry="10" fill="#00796B" />
        <ellipse cx="91" cy="48" rx="6" ry="10" fill="#00796B" />
      </svg>
    ),
  },
];

interface OrganHotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  tissueType: 'Epithelial' | 'Muscular' | 'Nervous' | 'Connective';
  epithelialSubtype?: string;
  notes: string;
}

const BODY_ORGANS: OrganHotspot[] = [
  {
    id: 'skin',
    name: 'Skin (Outer Surface)',
    x: 105,
    y: 190,
    tissueType: 'Epithelial',
    epithelialSubtype: 'protection',
    notes: 'Multilayered stratified epithelium protecting deeper tissues from abrasion and drying.',
  },
  {
    id: 'mouth',
    name: 'Mouth & Salivary Glands',
    x: 100,
    y: 75,
    tissueType: 'Epithelial',
    epithelialSubtype: 'secretion',
    notes: 'Lined with smooth protection epithelium; salivary glands secrete digestive saliva.',
  },
  {
    id: 'nose',
    name: 'Nasal Cavity (Nose)',
    x: 100,
    y: 60,
    tissueType: 'Epithelial',
    epithelialSubtype: 'sensory',
    notes: 'Ciliated olfactory sensory cells detect airborne odor molecules.',
  },
  {
    id: 'ear',
    name: 'Inner Ear',
    x: 120,
    y: 55,
    tissueType: 'Epithelial',
    epithelialSubtype: 'sensory',
    notes: 'Micro-hair receptor cells bend to sound vibrations, generating hearing signals.',
  },
  {
    id: 'lungs',
    name: 'Lungs (Air Sacs)',
    x: 88,
    y: 115,
    tissueType: 'Epithelial',
    epithelialSubtype: 'exchange',
    notes: 'Single layer of thin flat squamous cells allowing instant oxygen diffusion into capillaries.',
  },
  {
    id: 'blood_vessels',
    name: 'Blood Vessel Network',
    x: 115,
    y: 140,
    tissueType: 'Epithelial',
    epithelialSubtype: 'exchange',
    notes: 'Thin endothelium layer permits rapid nutrient and gas transfer between blood and cells.',
  },
  {
    id: 'stomach',
    name: 'Stomach',
    x: 108,
    y: 155,
    tissueType: 'Epithelial',
    epithelialSubtype: 'secretion',
    notes: 'Glandular epithelial cells secrete protective mucus and acidic gastric digestive enzymes.',
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine',
    x: 100,
    y: 185,
    tissueType: 'Epithelial',
    epithelialSubtype: 'absorption',
    notes: 'Tall columnar cells with microvilli absorb digested food into blood vessels.',
  },
];

interface MatchItem {
  id: string;
  locationLabel: string;
  correctTissue: 'Epithelial' | 'Connective' | 'Muscular' | 'Nervous';
  hint: string;
}

const MATCH_ITEMS: MatchItem[] = [
  {
    id: 'm1',
    locationLabel: 'Skin outer barrier & lining of mouth',
    correctTissue: 'Epithelial',
    hint: 'Covers and protects body surfaces; made of tightly packed sheets of cells.',
  },
  {
    id: 'm2',
    locationLabel: 'Biceps muscle pulling forearm bone',
    correctTissue: 'Muscular',
    hint: 'Responsible for contractions and active voluntary or involuntary bodily movement.',
  },
  {
    id: 'm3',
    locationLabel: 'Brain and spinal cord coordination network',
    correctTissue: 'Nervous',
    hint: 'Receives and transmits rapid electrical impulses throughout the body.',
  },
  {
    id: 'm4',
    locationLabel: 'Bones, tendons and circulating blood',
    correctTissue: 'Connective',
    hint: 'Connects, anchors and cushions tissues inside an extracellular matrix.',
  },
  {
    id: 'm5',
    locationLabel: 'Lungs alveolar wall exchanging oxygen',
    correctTissue: 'Epithelial',
    hint: 'Forms an ultra-thin cellular sheet allowing rapid molecular diffusion.',
  },
];

export const M05AnimalTissues: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'epithelial' | 'connective' | 'muscular' | 'nervous'>('epithelial');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('exchange');
  const [viewedSubtypes, setViewedSubtypes] = useState<Set<string>>(new Set(['exchange']));
  const [selectedOrgan, setSelectedOrgan] = useState<OrganHotspot | null>(BODY_ORGANS[4]); // Lungs default

  // Starter Questions State (PRD 6. M05)
  const [starterAnswers, setStarterAnswers] = useState<Record<string, string>>({});
  const [starterChecked, setStarterChecked] = useState<boolean>(false);

  // Matching Game State
  const [gameMatches, setGameMatches] = useState<Record<string, string>>({});
  const [gameFeedback, setGameFeedback] = useState<Record<string, { correct: boolean; hint?: string }>>({});
  const [selectedGameItem, setSelectedGameItem] = useState<string | null>(null);

  // Handle opening an epithelial subtype
  const handleSelectSubtype = (id: string) => {
    setSelectedSubtype(id);
    const updated = new Set(viewedSubtypes);
    updated.add(id);
    setViewedSubtypes(updated);

    if (updated.size >= 5) {
      recordInteraction('all_epithelial_viewed');
    }

    // Auto-select a matching organ hotspot
    const matching = BODY_ORGANS.find((o) => o.epithelialSubtype === id);
    if (matching) setSelectedOrgan(matching);
  };

  // Handle Starter Questions
  const handleStarterChange = (questionId: string, tissue: string) => {
    const updated = { ...starterAnswers, [questionId]: tissue };
    setStarterAnswers(updated);
  };

  const evaluateStarterQuestions = () => {
    setStarterChecked(true);
    // Correct mapping per PRD: move=muscular, sense=nervous, oxygen=epithelial, hold=connective
    const isAllCorrect =
      starterAnswers['move'] === 'Muscular' &&
      starterAnswers['sense'] === 'Nervous' &&
      starterAnswers['oxygen'] === 'Epithelial' &&
      starterAnswers['hold'] === 'Connective';

    if (isAllCorrect) {
      recordInteraction('starter_questions_answered');
      if (onObservationUpdate) {
        onObservationUpdate({ starterQuestionsPassed: true, answers: starterAnswers });
      }
    }
  };

  // Handle Match Game
  const handleAssignMatch = (itemId: string, tissue: string) => {
    const item = MATCH_ITEMS.find((m) => m.id === itemId);
    if (!item) return;

    const isCorrect = item.correctTissue === tissue;
    const nextMatches = { ...gameMatches, [itemId]: tissue };
    const nextFeedback = {
      ...gameFeedback,
      [itemId]: {
        correct: isCorrect,
        hint: isCorrect ? 'Spot on!' : item.hint,
      },
    };

    setGameMatches(nextMatches);
    setGameFeedback(nextFeedback);
    setSelectedGameItem(null);

    // Compute score
    const correctCount = MATCH_ITEMS.filter((m) => nextMatches[m.id] === m.correctTissue).length;
    const scorePercent = (correctCount / MATCH_ITEMS.length) * 100;

    if (scorePercent >= M05_CONFIG.passing_accuracy_percent) {
      recordInteraction('match_game_passed', { score: scorePercent });
    }
  };

  const resetMatchGame = () => {
    setGameMatches({});
    setGameFeedback({});
    setSelectedGameItem(null);
  };

  const currentEpi = EPITHELIAL_TYPES.find((t) => t.id === selectedSubtype) || EPITHELIAL_TYPES[0];

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
      {/* Step 1: Starter Four-Function Reflection (PRD Table 3.2 Introduction) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>
            Step 1 · Body Actions to Animal Tissues
          </h3>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: 'var(--text)', opacity: 0.9 }}>
          Every bodily action relies on one of the four primary animal tissue types. Match each everyday action to its
          specialized tissue:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { id: 'move', label: '1. Clenching fist / moving arm', correct: 'Muscular' },
            { id: 'sense', label: '2. Sensing warmth or pain', correct: 'Nervous' },
            { id: 'oxygen', label: '3. Oxygen entering blood in lungs', correct: 'Epithelial' },
            { id: 'hold', label: '4. Bones & tendons holding body together', correct: 'Connective' },
          ].map((q) => {
            const isSelected = starterAnswers[q.id];
            const isCorrect = isSelected === q.correct;

            return (
              <div
                key={q.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border:
                    starterChecked
                      ? isCorrect
                        ? '1.5px solid var(--accent)'
                        : '1.5px solid #D55E00'
                      : '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>{q.label}</div>
                <select
                  value={starterAnswers[q.id] || ''}
                  onChange={(e) => handleStarterChange(q.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                  }}
                  aria-label={q.label}
                >
                  <option value="">Select tissue...</option>
                  <option value="Epithelial">Epithelial Tissue</option>
                  <option value="Connective">Connective Tissue</option>
                  <option value="Muscular">Muscular Tissue</option>
                  <option value="Nervous">Nervous Tissue</option>
                </select>
                {starterChecked && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '4px',
                      color: isCorrect ? 'var(--accent)' : '#D55E00',
                      fontWeight: 600,
                    }}
                  >
                    {isCorrect ? '✓ Correct' : `✗ Should be ${q.correct}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '12px', gap: '10px' }}>
          <button
            type="button"
            onClick={evaluateStarterQuestions}
            disabled={Object.keys(starterAnswers).length < 4}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: Object.keys(starterAnswers).length < 4 ? 0.6 : 1,
            }}
          >
            Check Answers
          </button>
        </div>
      </div>

      {/* Step 2: Animal Tissues Hub & Interactive Organ Stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.3fr)',
          gap: '20px',
        }}
      >
        {/* Left: Anatomical Body Outline with Clickable Organs */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              Human Body Tissue Map
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>
              Tap an organ to view tissue
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.015)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Stylized Human Body Outline */}
            <svg viewBox="0 0 200 360" width="200" height="360" aria-label="Human body tissue location diagram">
              {/* Head */}
              <circle cx="100" cy="45" r="26" fill="#F8D4DB" stroke="var(--primary)" strokeWidth="2" />
              {/* Neck */}
              <rect x="93" y="70" width="14" height="15" fill="#F8D4DB" stroke="var(--primary)" strokeWidth="1.5" />
              {/* Torso */}
              <path
                d="M 60 85 L 140 85 L 132 230 L 68 230 Z"
                fill="#FFF4C9"
                stroke="var(--primary)"
                strokeWidth="2"
                opacity="0.8"
              />
              {/* Arms */}
              <path
                d="M 60 85 L 30 180 L 42 185 L 68 115"
                fill="#F8D4DB"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              <path
                d="M 140 85 L 170 180 L 158 185 L 132 115"
                fill="#F8D4DB"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              {/* Legs */}
              <path
                d="M 72 230 L 62 345 L 82 345 L 94 230"
                fill="#F8D4DB"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              <path
                d="M 128 230 L 138 345 L 118 345 L 106 230"
                fill="#F8D4DB"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />

              {/* Organ Hotspot Markers */}
              {BODY_ORGANS.map((organ) => {
                const isSelected = selectedOrgan?.id === organ.id;
                return (
                  <g
                    key={organ.id}
                    onClick={() => {
                      setSelectedOrgan(organ);
                      if (organ.epithelialSubtype) {
                        handleSelectSubtype(organ.epithelialSubtype);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${organ.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedOrgan(organ);
                        if (organ.epithelialSubtype) handleSelectSubtype(organ.epithelialSubtype);
                      }
                    }}
                  >
                    <circle
                      cx={organ.x}
                      cy={organ.y}
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? 'var(--primary)' : 'var(--secondary)'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    {isSelected && (
                      <circle
                        cx={organ.x}
                        cy={organ.y}
                        r="14"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Organ Callout */}
          {selectedOrgan && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(176, 33, 59, 0.08)',
                borderLeft: '4px solid var(--primary)',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
                {selectedOrgan.name}
              </div>
              <div style={{ color: 'var(--text)', opacity: 0.9 }}>{selectedOrgan.notes}</div>
            </div>
          )}
        </div>

        {/* Right: Epithelial Types Interactive Cards (Table 3.2) */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
              Epithelial Tissues · 5 Functional Types (Table 3.2)
            </h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>
              {viewedSubtypes.size} of 5 explored
            </span>
          </div>

          {/* Type Selector Chips */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            {EPITHELIAL_TYPES.map((type) => {
              const isSelected = selectedSubtype === type.id;
              const isViewed = viewedSubtypes.has(type.id);

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectSubtype(type.id)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isViewed && !isSelected && <CheckCircle2 size={12} color="var(--accent)" />}
                  {type.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Active Epithelial Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${currentEpi.color}`,
              backgroundColor: 'rgba(0, 0, 0, 0.015)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: currentEpi.color, fontWeight: 700 }}>
                  {currentEpi.name}
                </h5>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', opacity: 0.8, fontWeight: 500 }}>
                  {currentEpi.layers} · {currentEpi.cellShape}
                </span>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: currentEpi.color,
                }}
              >
                Structure matches function
              </span>
            </div>

            {/* Custom SVG Cell Diagram */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px',
                border: '1px solid var(--border)',
              }}
            >
              {currentEpi.svgIcon}
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.45, color: 'var(--text)' }}>
              {currentEpi.description}
            </p>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Primary Body Locations:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {currentEpi.locations.map((loc, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.74rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontWeight: 500,
                    }}
                  >
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Interactive Matching Challenge (>= 80% accuracy required) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
              Tissue Classification Challenge (PRD Goal: &ge; 80% Score)
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text)', opacity: 0.8 }}>
              Select a location on the left, then click its tissue family on the right.
            </p>
          </div>
          <button
            type="button"
            onClick={resetMatchGame}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              fontSize: '0.78rem',
              color: 'var(--text)',
            }}
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MATCH_ITEMS.map((item) => {
            const currentSelected = gameMatches[item.id];
            const feedback = gameFeedback[item.id];

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor:
                    feedback?.correct === true
                      ? 'rgba(0, 158, 115, 0.08)'
                      : feedback?.correct === false
                      ? 'rgba(213, 94, 0, 0.08)'
                      : 'rgba(0, 0, 0, 0.02)',
                  border:
                    feedback?.correct === true
                      ? '1px solid var(--accent)'
                      : feedback?.correct === false
                      ? '1px solid #D55E00'
                      : '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ flex: '1 1 260px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                    {item.locationLabel}
                  </span>
                  {feedback && (
                    <div
                      style={{
                        fontSize: '0.74rem',
                        marginTop: '2px',
                        color: feedback.correct ? 'var(--accent)' : '#D55E00',
                        fontWeight: 500,
                      }}
                    >
                      {feedback.hint}
                    </div>
                  )}
                </div>

                {/* Target tissue buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(['Epithelial', 'Connective', 'Muscular', 'Nervous'] as const).map((tissue) => {
                    const isChosen = currentSelected === tissue;
                    return (
                      <button
                        key={tissue}
                        type="button"
                        onClick={() => handleAssignMatch(item.id, tissue)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: isChosen ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: isChosen ? 'var(--primary)' : 'var(--surface)',
                          color: isChosen ? '#ffffff' : 'var(--text)',
                          fontSize: '0.78rem',
                          fontWeight: isChosen ? 700 : 500,
                        }}
                      >
                        {tissue}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const M05Spec: ModuleSpec = {
  meta: {
    id: 'M05',
    title: 'Animal Tissue Explorer',
    subtitle: 'Covering, Connecting, Moving and Signaling',
    category: 'Animal Tissues',
    themeId: 'M05',
    objective: 'Identify the four animal tissues and see how epithelial structure fits its function.',
    predictPrompt:
      'Blink, clench your fist, take a breath, touch something warm. Which tissue do you think is working in each?',
    predictOptions: [
      'Different dedicated tissues: muscular, nervous, epithelial, connective',
      'One all-purpose body tissue handles every job',
      'Only bones and muscles control all body operations',
      'Blood is the sole tissue that does work',
    ],
    notes: [
      {
        title: 'Four Animal Tissues',
        text: 'Epithelial covers and lines, connective binds and supports, muscular causes movement, nervous coordinates signals.',
      },
      {
        title: 'Epithelial Characteristics',
        text: 'Form tightly packed continuous sheets with minimal intercellular space to block water loss, microbes and chemical injury.',
      },
      {
        title: 'Structure Matches Function',
        text: 'Single thin layers speed diffusion; multiple stratified layers resist friction wear; cilia move particles and sense stimuli.',
      },
    ],
    checks: [
      {
        qid: 'M05_Q1',
        prompt: 'Why is lung lining only one thin layer of flat cells?',
        options: [
          'It allows quick diffusion of gases',
          'It provides heavy mechanical protection',
          'It secretes thick protective mucus',
          'It stores large amounts of glycogen',
        ],
        answer: 'It allows quick diffusion of gases',
        why: 'Squamous exchange epithelium in alveoli is ultra-thin to allow rapid diffusion of oxygen into capillaries and carbon dioxide out.',
      },
      {
        qid: 'M05_Q2',
        prompt: 'Which epithelial type lines the small intestine and what is its shape?',
        options: [
          'Absorption type: tall, pillar-like cells',
          'Protection type: many layers of flat cells',
          'Sensory type: short rounded cells',
          'Exchange type: hollow elastic spheres',
        ],
        answer: 'Absorption type: tall, pillar-like cells',
        why: 'Columnar absorptive epithelium features tall pillar-like cells with surface microvilli that vastly expand absorption surface area.',
      },
    ],
    requiredInteractions: ['all_epithelial_viewed', 'starter_questions_answered', 'match_game_passed'],
  },
  Component: M05AnimalTissues,
};

