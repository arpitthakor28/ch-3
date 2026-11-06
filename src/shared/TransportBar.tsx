import React from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { SimClock } from '../shell/useSimClock';

interface TransportBarProps {
  clock: SimClock;
  onReset?: () => void;
  showSpeed?: boolean;
  className?: string;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  clock,
  onReset,
  showSpeed = true,
  className = '',
}) => {
  const handleReset = () => {
    clock.reset();
    if (onReset) onReset();
  };

  return (
    <div
      className={`vls-transport-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        gap: '12px',
        flexWrap: 'wrap',
      }}
      role="toolbar"
      aria-label="Simulation Playback Controls"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={clock.togglePlay}
          aria-label={clock.isPlaying ? 'Pause simulation' : 'Play simulation'}
          title={clock.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'opacity 0.2s',
          }}
        >
          {clock.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{clock.isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          type="button"
          onClick={() => clock.step(0.1)}
          aria-label="Step simulation forward 0.1s"
          title="Step forward"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <StepForward size={16} />
          <span>Step</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset simulation to initial state"
          title="Reset"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {showSpeed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text)', opacity: 0.8, fontWeight: 500 }}>
            Speed:
          </span>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => clock.setSpeed(s)}
              aria-pressed={clock.speed === s}
              aria-label={`Set speed to ${s}x`}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: clock.speed === s ? 'var(--secondary)' : 'transparent',
                color: clock.speed === s ? '#ffffff' : 'var(--text)',
                fontSize: '0.8rem',
                fontWeight: clock.speed === s ? 700 : 500,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
