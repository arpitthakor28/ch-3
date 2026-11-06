import React, { useState } from 'react';
import { ModuleComponentProps, ModuleSpec } from '../types';
import designValues from '../../config/designValues.json';
import { Lock, Check, RotateCw, Move, HelpCircle, Save, Sparkles, AlertCircle } from 'lucide-react';

const M10_CONFIG = designValues.M10;

type JointStationId = 'shoulder' | 'elbow' | 'neck' | 'skull';

interface JointStation {
  id: JointStationId;
  name: string;
  type: string;
  mechanicalAnalog: string;
  allowedMotions: string[];
  forbiddenMotion: string;
  blockedReason: string;
  maxAngles: string;
  color: string;
}

const JOINT_STATIONS: JointStation[] = [
  {
    id: 'shoulder',
    name: 'Shoulder Joint',
    type: 'Ball and Socket Joint',
    mechanicalAnalog: 'Ball fitted into a shallow rounded cup',
    allowedMotions: ['Forward & backward swing', 'Sideways elevation', 'Full 360° circumduction / circle'],
    forbiddenMotion: 'Attempt 180° backward arm hyperextension through torso',
    blockedReason: 'Scapula and clavicle bone socket rims physically block backward motion through the torso.',
    maxAngles: 'Full 360° conical range of motion',
    color: '#00796B',
  },
  {
    id: 'elbow',
    name: 'Elbow & Knee Joint',
    type: 'Hinge Joint',
    mechanicalAnalog: 'Door hinge swinging open and closed along a single pin',
    allowedMotions: ['Bending (flexion)', 'Straightening (extension) in one single plane'],
    forbiddenMotion: 'Attempt sideways bending or backward hyperextension',
    blockedReason: 'Interlocking trochlea bone grooves and tight collateral ligaments physically prevent sideways and backward bending.',
    maxAngles: '0° to 145° flexion only',
    color: '#7B3FA0',
  },
  {
    id: 'neck',
    name: 'Neck Joint (Atlanto-Axial)',
    type: 'Pivot Joint',
    mechanicalAnalog: 'Cylindrical bone ring rotating around a fixed peg (like a doorknob)',
    allowedMotions: ['Side-to-side rotation (shaking head for "no")', 'Forward nodding'],
    forbiddenMotion: 'Attempt full 360° continuous head spin',
    blockedReason: 'Transverse spinal ligament ring and cervical vertebra stops prevent dangerous excessive twisting, protecting spinal cord.',
    maxAngles: '-80° to +80° horizontal turn',
    color: '#B5391C',
  },
  {
    id: 'skull',
    name: 'Skull Bones (Cranial Sutures)',
    type: 'Fixed / Immovable Joint',
    mechanicalAnalog: 'Interlocking jigsaw-puzzle pieces fused with dense fibrous tissue',
    allowedMotions: ['Zero movement (Rigid protective armor)'],
    forbiddenMotion: 'Attempt sliding or bending cranial plates',
    blockedReason: 'Serrated bone edges are tightly anchored by dense fibrous collagen sutures to safeguard the delicate brain, eyes, and inner ears.',
    maxAngles: '0° (Completely immovable)',
    color: '#5A4A3A',
  },
];

export const M10JointSandbox: React.FC<ModuleComponentProps> = ({
  recordInteraction,
  completedInteractions,
  onObservationUpdate,
}) => {
  const [selectedJointId, setSelectedJointId] = useState<JointStationId>('shoulder');
  const [movedJoints, setMovedJoints] = useState<Set<string>>(new Set());
  const [blockedAttemptedJoints, setBlockedAttemptedJoints] = useState<Set<string>>(new Set());
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);

  // Motion state per joint
  const [shoulderRotX, setShoulderRotX] = useState<number>(0); // -45 to 45
  const [shoulderRotY, setShoulderRotY] = useState<number>(0); // -45 to 45
  const [hingeAngle, setHingeAngle] = useState<number>(45); // 0 to 145
  const [neckTurnAngle, setNeckTurnAngle] = useState<number>(0); // -80 to 80

  // Identify Mode State
  const [isIdentifyMode, setIsIdentifyMode] = useState<boolean>(false);
  const [identifyQuestions, setIdentifyQuestions] = useState<Record<string, string>>({});
  const [identifyScore, setIdentifyScore] = useState<number | null>(null);

  // Table 3.5 Observations
  const [table35, setTable35] = useState<
    Record<
      string,
      { completeRot: string; partialRot: string; bending: string; other: string }
    >
  >({
    elbow: { completeRot: 'No', partialRot: 'No', bending: 'Yes', other: 'Hinges in 1 plane' },
    shoulder: { completeRot: 'Yes', partialRot: 'Yes', bending: 'Yes', other: 'Multi-directional' },
    knee: { completeRot: 'No', partialRot: 'No', bending: 'Yes', other: 'Protected by kneecap' },
    neck: { completeRot: 'No', partialRot: 'Yes', bending: 'Yes', other: 'Pivot rotation' },
    fingers: { completeRot: 'No', partialRot: 'No', bending: 'Yes', other: 'Grip movements' },
    toes: { completeRot: 'No', partialRot: 'No', bending: 'Yes', other: 'Balance support' },
    wrist: { completeRot: 'No', partialRot: 'Yes', bending: 'Yes', other: 'Gliding movement' },
  });
  const [tableSaved, setTableSaved] = useState<boolean>(false);

  const currentJoint = JOINT_STATIONS.find((j) => j.id === selectedJointId) || JOINT_STATIONS[0];

  // Mark joint moved
  const markMoved = (id: string) => {
    const updated = new Set(movedJoints);
    updated.add(id);
    setMovedJoints(updated);

    if (updated.size >= 4) {
      recordInteraction('all_joints_moved');
    }
  };

  const handleTryBlocked = () => {
    setBlockedAlert(currentJoint.blockedReason);
    const updated = new Set(blockedAttemptedJoints);
    updated.add(currentJoint.id);
    setBlockedAttemptedJoints(updated);

    if (updated.size >= 4) {
      recordInteraction('one_blocked_motion_per_joint');
    }
  };

  const handleIdentifyAnswer = (jointId: string, answer: string) => {
    const next = { ...identifyQuestions, [jointId]: answer };
    setIdentifyQuestions(next);

    if (Object.keys(next).length >= 4) {
      let score = 0;
      if (next['shoulder'] === 'Ball and socket') score++;
      if (next['elbow'] === 'Hinge') score++;
      if (next['neck'] === 'Pivot') score++;
      if (next['skull'] === 'Fixed') score++;
      setIdentifyScore(score);

      if (score >= 3) {
        recordInteraction('identify_mode_passed', { score });
      }
    }
  };

  const handleSaveTable = () => {
    setTableSaved(true);
    recordInteraction('table_3_5_saved');
    if (onObservationUpdate) {
      onObservationUpdate(table35);
    }
  };

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
      {/* Top Station Selector Bar */}
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
            Select Joint Station:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {JOINT_STATIONS.map((station) => {
              const isSelected = selectedJointId === station.id;
              const isMoved = movedJoints.has(station.id);

              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => {
                    setSelectedJointId(station.id);
                    setBlockedAlert(null);
                    markMoved(station.id);
                  }}
                  aria-pressed={isSelected}
                  style={{
                    padding: '6px 12px',
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
                  {isMoved && <Check size={12} color="var(--accent)" />}
                  {station.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsIdentifyMode(!isIdentifyMode)}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: isIdentifyMode ? '2px solid var(--secondary)' : '1px solid var(--border)',
            backgroundColor: isIdentifyMode ? 'var(--secondary)' : 'transparent',
            color: isIdentifyMode ? '#ffffff' : 'var(--text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isIdentifyMode ? 'Exit Identify Quiz' : 'Test Joint Knowledge Quiz'}
        </button>
      </div>

      {/* Main Interactive Stage: Mechanical Analogs & Movement Testing */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(280px, 0.75fr)',
          gap: '20px',
        }}
      >
        {/* Left: Joint Simulation Canvas */}
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
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: currentJoint.color, fontWeight: 700 }}>
                {currentJoint.name} · {currentJoint.type}
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
                Mechanical model: {currentJoint.mechanicalAnalog}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                fontWeight: 600,
                color: currentJoint.color,
              }}
            >
              {currentJoint.maxAngles}
            </span>
          </div>

          {/* SVG Visualizer for Joint Mechanics */}
          <div
            style={{
              height: '240px',
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
            {selectedJointId === 'shoulder' && (
              /* Ball and socket 3D Model with depth & spherical shading */
              <svg viewBox="0 0 240 180" width="220" height="170" aria-label="Ball and socket shoulder joint 3D model">
                <defs>
                  <filter id="m10-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.2" />
                  </filter>
                  <radialGradient id="sphereBall3d" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#A78BFA" />
                    <stop offset="70%" stopColor="#6D28D9" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </radialGradient>
                  <radialGradient id="socketCup3d" cx="30%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#CCFBF1" />
                    <stop offset="40%" stopColor="#5EEAD4" />
                    <stop offset="85%" stopColor="#0F766E" />
                    <stop offset="100%" stopColor="#115E59" />
                  </radialGradient>
                  <linearGradient id="boneShaft3d" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#F5F3EF" />
                    <stop offset="80%" stopColor="#DBD5C6" />
                    <stop offset="100%" stopColor="#A89E88" />
                  </linearGradient>
                </defs>

                {/* 3D Concave Hemispherical Socket */}
                <g filter="url(#m10-shadow)">
                  <path
                    d="M 50 35 C 95 35 115 65 115 90 C 115 115 95 145 50 145 Z"
                    fill="url(#socketCup3d)"
                    stroke="#115E59"
                    strokeWidth="2.5"
                  />
                  <ellipse cx="60" cy="90" rx="14" ry="45" fill="#042F2E" opacity="0.35" />
                  <text x="60" y="94" fontSize="9" fill="#FFFFFF" fontWeight="800">
                    Cavity Cup
                  </text>
                </g>

                {/* 3D Spherical Head Ball inside socket */}
                <g filter="url(#m10-shadow)">
                  <circle
                    cx={115 + shoulderRotX * 0.4}
                    cy={90 + shoulderRotY * 0.4}
                    r="25"
                    fill="url(#sphereBall3d)"
                    stroke="#4C1D95"
                    strokeWidth="2"
                  />
                  {/* Specular highlight glint on ball */}
                  <ellipse
                    cx={108 + shoulderRotX * 0.4}
                    cy={82 + shoulderRotY * 0.4}
                    rx="8"
                    ry="5"
                    fill="#FFFFFF"
                    opacity="0.65"
                    transform={`rotate(-25, ${108 + shoulderRotX * 0.4}, ${82 + shoulderRotY * 0.4})`}
                  />
                </g>

                {/* 3D Bone Shaft extending with rotational tilt */}
                <g filter="url(#m10-shadow)">
                  <line
                    x1={115 + shoulderRotX * 0.4}
                    y1={90 + shoulderRotY * 0.4}
                    x2={195 + shoulderRotX}
                    y2={90 + shoulderRotY}
                    stroke="url(#boneShaft3d)"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <line
                    x1={115 + shoulderRotX * 0.4}
                    y1={86 + shoulderRotY * 0.4}
                    x2={195 + shoulderRotX}
                    y2={86 + shoulderRotY}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>
              </svg>
            )}

            {selectedJointId === 'elbow' && (
              /* Hinge Joint 3D Model with barrel and pin mechanics */
              <svg viewBox="0 0 240 180" width="220" height="170" aria-label="Hinge elbow joint 3D model">
                <defs>
                  <filter id="m10-hinge-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.2" />
                  </filter>
                  <linearGradient id="barrelGrad3d" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="45%" stopColor="#DC2626" />
                    <stop offset="85%" stopColor="#991B1B" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                  <linearGradient id="hingePlate3d" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#EDE9E3" />
                    <stop offset="85%" stopColor="#CDC4B3" />
                    <stop offset="100%" stopColor="#A89E88" />
                  </linearGradient>
                </defs>

                {/* Fixed Upper Bone Bracket */}
                <g filter="url(#m10-hinge-shadow)">
                  <rect x="25" y="74" width="85" height="26" rx="6" fill="url(#hingePlate3d)" stroke="#78716C" strokeWidth="2" />
                  <line x1="28" y1="77" x2="105" y2="77" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
                  <text x="65" y="91" fontSize="9" fontWeight="800" fill="#44403C" textAnchor="middle">
                    Humerus Bone
                  </text>
                </g>

                {/* 3D Cylindrical Pin Joint Casing */}
                <g filter="url(#m10-hinge-shadow)">
                  <circle cx="115" cy="87" r="16" fill="url(#barrelGrad3d)" stroke="#7F1D1D" strokeWidth="2.5" />
                  <circle cx="115" cy="87" r="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
                  <circle cx="113" cy="84" r="2" fill="#FFFFFF" />
                </g>

                {/* Swinging Forearm Lever (0° to 145°) in 3D */}
                <g filter="url(#m10-hinge-shadow)">
                  <line
                    x1="115"
                    y1="87"
                    x2={115 + 90 * Math.cos(((145 - hingeAngle) * Math.PI) / 180)}
                    y2={87 - 90 * Math.sin(((145 - hingeAngle) * Math.PI) / 180)}
                    stroke="url(#hingePlate3d)"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  <line
                    x1="115"
                    y1="85"
                    x2={115 + 88 * Math.cos(((145 - hingeAngle) * Math.PI) / 180)}
                    y2={85 - 88 * Math.sin(((145 - hingeAngle) * Math.PI) / 180)}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>
              </svg>
            )}

            {selectedJointId === 'neck' && (
              /* Pivot Joint 3D Cylindrical Ring & Peg */
              <svg viewBox="0 0 240 180" width="220" height="170" aria-label="Pivot neck joint 3D model">
                <defs>
                  <filter id="m10-pivot-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.2" />
                  </filter>
                  <linearGradient id="pegGrad3d" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#E2E8F0" />
                    <stop offset="70%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>
                  <linearGradient id="ringGrad3d" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                </defs>

                {/* Fixed Odontoid Peg of Axis (Vertebra) */}
                <g filter="url(#m10-pivot-shadow)">
                  <rect x="104" y="75" width="32" height="75" rx="8" fill="url(#pegGrad3d)" stroke="#475569" strokeWidth="2" />
                  <ellipse cx="120" cy="75" rx="16" ry="6" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
                  <text x="120" y="125" fontSize="8" fontWeight="800" fill="#1E293B" textAnchor="middle">
                    Axis Peg
                  </text>
                </g>

                {/* 3D Rotating Bone Ring of Atlas (Vertebra) */}
                <g filter="url(#m10-pivot-shadow)" transform={`rotate(${neckTurnAngle * 0.45}, 120, 75)`}>
                  <ellipse
                    cx="120"
                    cy="75"
                    rx="48"
                    ry="20"
                    fill="none"
                    stroke="url(#ringGrad3d)"
                    strokeWidth="8"
                  />
                  <circle cx="120" cy="58" r="16" fill="url(#pegGrad3d)" stroke="#DC2626" strokeWidth="2" />
                  <text x="120" y="62" fontSize="9" fontWeight="800" fill="#DC2626" textAnchor="middle">
                    Skull Ring
                  </text>
                </g>
              </svg>
            )}

            {selectedJointId === 'skull' && (
              /* Immovable fixed cranial sutures in 3D */
              <svg viewBox="0 0 240 180" width="220" height="170" aria-label="Fixed cranial sutures in skull 3D model">
                <defs>
                  <filter id="m10-skull-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.2" />
                  </filter>
                  <linearGradient id="skullPlates3d" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#F8F6F0" />
                    <stop offset="70%" stopColor="#E2DAC7" />
                    <stop offset="100%" stopColor="#C4B89A" />
                  </linearGradient>
                </defs>

                <g filter="url(#m10-skull-shadow)">
                  <rect x="25" y="18" width="190" height="144" rx="22" fill="url(#skullPlates3d)" stroke="#78716C" strokeWidth="2.5" />
                  {/* Serrated interlocking 3D suture lines */}
                  <path
                    d="M 120 18 L 123 35 L 117 48 L 124 62 L 116 76 L 123 90 L 117 105 L 124 122 L 117 138 L 120 162"
                    stroke="#44403C"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 25 90 L 52 92 L 67 87 L 88 94 L 105 86 L 120 90 L 146 87 L 168 93 L 192 87 L 215 90"
                    stroke="#44403C"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <text x="70" y="52" fontSize="10" fontWeight="800" fill="#44403C">
                    Parietal Bone
                  </text>
                  <text x="170" y="52" fontSize="10" fontWeight="800" fill="#44403C">
                    Frontal Bone
                  </text>
                  <text x="120" y="125" fontSize="8" fontWeight="800" fill="#DC2626" textAnchor="middle">
                    Interlocked Fibrous Suture (0° Motion)
                  </text>
                </g>
              </svg>
            )}
          </div>

          {/* Interactive Motion Sliders */}
          <div>
            {selectedJointId === 'shoulder' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>Horizontal Conical Rotation: {shoulderRotX}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={shoulderRotX}
                  onChange={(e) => {
                    setShoulderRotX(Number(e.target.value));
                    markMoved('shoulder');
                  }}
                  style={{ width: '100%' }}
                  aria-label="Shoulder horizontal angle"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>Vertical Conical Elevation: {shoulderRotY}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={shoulderRotY}
                  onChange={(e) => {
                    setShoulderRotY(Number(e.target.value));
                    markMoved('shoulder');
                  }}
                  style={{ width: '100%' }}
                  aria-label="Shoulder vertical angle"
                />
              </div>
            )}

            {selectedJointId === 'elbow' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span>Hinge Flexion Angle: {hingeAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="145"
                  value={hingeAngle}
                  onChange={(e) => {
                    setHingeAngle(Number(e.target.value));
                    markMoved('elbow');
                  }}
                  style={{ width: '100%' }}
                  aria-label="Elbow flexion slider"
                />
              </div>
            )}

            {selectedJointId === 'neck' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span>Head Turn Pivot Angle: {neckTurnAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={neckTurnAngle}
                  onChange={(e) => {
                    setNeckTurnAngle(Number(e.target.value));
                    markMoved('neck');
                  }}
                  style={{ width: '100%' }}
                  aria-label="Neck turn angle slider"
                />
              </div>
            )}

            {selectedJointId === 'skull' && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  fontSize: '0.8rem',
                  color: 'var(--text)',
                }}
              >
                Fixed joints possess zero movable axes. Bones are permanently locked to preserve cranial cavity integrity.
              </div>
            )}
          </div>

          {/* Try Blocked Motion Button (PRD AC-M10-4) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleTryBlocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #B5391C',
                backgroundColor: 'rgba(181, 57, 28, 0.08)',
                color: '#B5391C',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Lock size={14} /> Attempt Blocked Motion Test
            </button>
          </div>

          {blockedAlert && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(181, 57, 28, 0.1)',
                borderLeft: '4px solid #B5391C',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, color: '#B5391C', marginBottom: '2px' }}>
                Blocked by Skeletal Anatomy!
              </div>
              <div style={{ color: 'var(--text)' }}>{blockedAlert}</div>
            </div>
          )}
        </div>

        {/* Right: Movement Tracker & Knowledge Quiz */}
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
          {!isIdentifyMode ? (
            /* Movement Tracker Panel */
            <>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                Biomechanics Motion Audit
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
                  ✓ Allowed Movements:
                </div>
                {currentJoint.allowedMotions.map((motion, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.76rem',
                      color: 'var(--text)',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 158, 115, 0.06)',
                    }}
                  >
                    <Check size={13} color="var(--accent)" /> {motion}
                  </div>
                ))}

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B5391C', marginTop: '6px' }}>
                  ✗ Structurally Forbidden Axis:
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: 'var(--text)',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(181, 57, 28, 0.06)',
                  }}
                >
                  <Lock size={13} color="#B5391C" /> {currentJoint.forbiddenMotion}
                </div>
              </div>
            </>
          ) : (
            /* Identify Mode Quiz (>= 3/4 required for completion) */
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  Joint Classification Quiz
                </h4>
                {identifyScore !== null && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                    Score: {identifyScore}/4
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'shoulder', label: '1. Shoulder & Hip' },
                  { id: 'elbow', label: '2. Elbow & Knee' },
                  { id: 'neck', label: '3. Neck (Head turning)' },
                  { id: 'skull', label: '4. Cranial plates' },
                ].map((q) => (
                  <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{q.label}</span>
                    <select
                      value={identifyQuestions[q.id] || ''}
                      onChange={(e) => handleIdentifyAnswer(q.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <option value="">Select type...</option>
                      <option value="Ball and socket">Ball and socket</option>
                      <option value="Hinge">Hinge</option>
                      <option value="Pivot">Pivot</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity 3.5 Table (Elbow, Shoulder, Knee, Neck, Fingers, Toes, Wrist) */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
              Activity 3.5 · Body Joint Range of Motion Log
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8 }}>
              Record how each skeletal joint behaves during active physical movement.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveTable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Save size={14} /> {tableSaved ? '✓ Observations Saved' : 'Save Observations'}
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Joint Body Location</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Complete Rotation?</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Partial Rotation?</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Bends?</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Observed Motion Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(table35).map(([jointKey, row]) => (
              <tr key={jointKey} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, textTransform: 'capitalize' }}>
                  {jointKey}
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <select
                    value={row.completeRot}
                    onChange={(e) =>
                      setTable35({ ...table35, [jointKey]: { ...row, completeRot: e.target.value } })
                    }
                    style={{ fontSize: '0.78rem', padding: '2px 6px', borderRadius: '4px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <select
                    value={row.partialRot}
                    onChange={(e) =>
                      setTable35({ ...table35, [jointKey]: { ...row, partialRot: e.target.value } })
                    }
                    style={{ fontSize: '0.78rem', padding: '2px 6px', borderRadius: '4px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <select
                    value={row.bending}
                    onChange={(e) =>
                      setTable35({ ...table35, [jointKey]: { ...row, bending: e.target.value } })
                    }
                    style={{ fontSize: '0.78rem', padding: '2px 6px', borderRadius: '4px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td style={{ padding: '6px' }}>
                  <input
                    type="text"
                    value={row.other}
                    onChange={(e) =>
                      setTable35({ ...table35, [jointKey]: { ...row, other: e.target.value } })
                    }
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '0.78rem',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const M10Spec: ModuleSpec = {
  meta: {
    id: 'M10',
    title: 'Joint Movement Sandbox',
    subtitle: 'Ball-and-Socket, Hinge, Pivot and Fixed Joints',
    category: 'Movement & Skeleton',
    themeId: 'M10',
    objective:
      'See how joint structure decides the kind of movement: ball-and-socket, hinge, pivot and fixed.',
    predictPrompt: 'Which joint do you think can move in the most directions?',
    predictOptions: [
      'Shoulder (ball and socket)',
      'Elbow (hinge)',
      'Neck (pivot)',
      'Skull cranial bones (fixed)',
    ],
    notes: [
      {
        title: 'Joint Definition',
        text: 'A joint is a point where two or more bones meet. Structural design dictates allowed planes of motion.',
      },
      {
        title: 'Four Major Joint Classes',
        text: 'Ball-and-socket allows 360° rotation; hinge allows single-plane bending; pivot allows twisting; fixed allows zero movement.',
      },
      {
        title: 'Protection vs Mobility',
        text: 'Skull sutures are fixed to protect the brain, while shoulder ball-and-socket prioritizes maximum reach and flexibility.',
      },
    ],
    checks: [
      {
        qid: 'M10_Q1',
        prompt: "Which joint type is in the knee and ankle bend asked in the chapter's Q5?",
        options: ['Hinge joint', 'Pivot joint', 'Ball-and-socket joint', 'Fixed suture'],
        answer: 'Hinge joint',
        why: 'The knee bends in one plane like a swinging door hinge, reinforced by tough ligaments and shielded by the patella.',
      },
      {
        qid: 'M10_Q2',
        prompt: 'Which joint lets you shake your head to say no?',
        options: ['Pivot joint', 'Hinge joint', 'Fixed joint', 'Ball and socket joint'],
        answer: 'Pivot joint',
        why: 'The atlanto-axial joint between the first and second cervical vertebrae acts as a pivot, letting the head rotate side to side.',
      },
    ],
    requiredInteractions: [
      'all_joints_moved',
      'one_blocked_motion_per_joint',
      'identify_mode_passed',
      'table_3_5_saved',
    ],
  },
  Component: M10JointSandbox,
};

