import React from 'react';
import { PlayCircle, ShieldAlert, FileX2, UserX, Sparkles } from 'lucide-react';

interface ScenarioBarProps {
  onRunHappyPath: () => void;
  onRunUnderCollateralized: () => void;
  onRunUnverified: () => void;
  onRunAttackerTest: () => void;
  loading: boolean;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  onRunHappyPath,
  onRunUnderCollateralized,
  onRunUnverified,
  onRunAttackerTest,
  loading
}) => {
  return (
    <div className="glass-panel" style={{ padding: '14px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--bg-mint-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-emerald)'
          }}>
            <Sparkles size={15} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-title)', display: 'block' }}>
              One-Click Judge & Test Scenarios
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Evaluate autonomous execution, policy denials, and security boundary defenses
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onRunHappyPath}
            disabled={loading}
            className="btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '9px 18px' }}
            title="Execute standard 80% shortfall claim through verified atomic settlement (TC-01)"
          >
            <PlayCircle size={16} />
            <span>TC-01: Happy Path (16 mETH)</span>
          </button>

          <button
            onClick={onRunUnderCollateralized}
            disabled={loading}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '9px 16px' }}
            title="Demonstrate policy rejection when collateral is insufficient (TC-02)"
          >
            <ShieldAlert size={15} color="var(--status-warning)" />
            <span>TC-02: Under-Collateral</span>
          </button>

          <button
            onClick={onRunUnverified}
            disabled={loading}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '9px 16px' }}
            title="Demonstrate settlement rejection without verifier approval (TC-03)"
          >
            <FileX2 size={15} color="var(--status-warning)" />
            <span>TC-03: Unverified Claim</span>
          </button>

          <button
            onClick={onRunAttackerTest}
            disabled={loading}
            className="btn-danger"
            style={{ borderRadius: 'var(--radius-full)', padding: '9px 16px' }}
            title="Demonstrate policy gate blocking unauthorized attacker wallet (TC-05/06)"
          >
            <UserX size={15} />
            <span>TC-05: Attacker Block</span>
          </button>
        </div>
      </div>
    </div>
  );
};
