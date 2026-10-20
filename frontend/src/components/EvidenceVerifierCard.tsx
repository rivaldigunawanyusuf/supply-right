import React from 'react';
import { PackageX, CheckSquare, XSquare, FileCheck2, AlertCircle, UserCheck } from 'lucide-react';
import { SystemState } from '../types';

interface Props {
  state: SystemState;
  onVerifierDecision: (approved: boolean) => void;
  loading: boolean;
}

export const EvidenceVerifierCard: React.FC<Props> = ({ state, onVerifierDecision, loading }) => {
  const { deliveryEvidence, claim } = state;

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-danger)'
          }}>
            <PackageX size={20} />
          </div>
          <div>
            <h2 className="section-title">Delivery Shortfall & Verifier</h2>
            <span className="section-desc">Warehouse Evidence & Independent Attestation</span>
          </div>
        </div>

        <span className={`badge ${
          claim.status === 'VERIFIER_APPROVED' ? 'badge-success' :
          claim.status === 'VERIFIER_REJECTED' ? 'badge-danger' :
          claim.status === 'SUBMITTED' ? 'badge-warning' : 'badge-green'
        }`}>
          {claim.status === 'NONE' ? 'Pending Claim' : claim.status.replace('_', ' ')}
        </span>
      </div>

      {/* Shortfall Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        padding: '14px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <div style={{ padding: '6px' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Delivered</span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--brand-emerald)', fontWeight: 800 }}>
            {deliveryEvidence.deliveredQuantity.toLocaleString()}
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
            ({deliveryEvidence.deliveredBatches} batches)
          </span>
        </div>

        <div style={{ padding: '6px', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Shortfall</span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--status-danger)', fontWeight: 800 }}>
            {deliveryEvidence.shortfallQuantity.toLocaleString()}
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
            ({deliveryEvidence.shortfallBatches} batches)
          </span>
        </div>

        <div style={{ padding: '6px' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Shortfall Deficit</span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--status-danger)', fontWeight: 800 }}>
            {deliveryEvidence.shortfallPercentage}%
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Contract Deficit</span>
        </div>
      </div>

      {/* Warehouse Evidence Notes */}
      <div style={{
        padding: '12px 14px',
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-title)', marginBottom: '4px', fontWeight: 600 }}>
          <FileCheck2 size={15} color="var(--brand-emerald)" />
          <span>Warehouse Receipt Proof</span>
        </div>
        <p style={{ margin: 0, lineHeight: 1.4, color: 'var(--text-secondary)' }}>
          {deliveryEvidence.evidenceNotes}
        </p>
        <span className="mono-val" style={{ display: 'block', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Hash: {deliveryEvidence.evidenceHash.slice(0, 24)}...
        </span>
      </div>

      {/* Independent Verifier Station */}
      <div style={{
        marginTop: 'auto',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-mint-tint)',
        border: '1px solid var(--status-success-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="var(--brand-pine)" />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-pine)' }}>Independent Verifier Station</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Authority: Independent Verifier ({state.parties.verifier.address.slice(0, 6)}...{state.parties.verifier.address.slice(-4)})
              </span>
            </div>
          </div>

          {claim.status === 'VERIFIER_APPROVED' && (
            <span className="badge badge-success" style={{ fontWeight: 700 }}>
              Verified Loss: 80 mETH
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: 'var(--brand-pine)', background: '#ffffff', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <AlertCircle size={14} color="var(--brand-emerald)" style={{ flexShrink: 0 }} />
          <span>Per PRD: The verifier determines eligible loss on-chain; it is NOT auto-derived by AI.</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onVerifierDecision(true)}
            disabled={loading || claim.status === 'NONE' || claim.status === 'SETTLED' || claim.status === 'VERIFIER_APPROVED'}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.825rem' }}
          >
            <CheckSquare size={15} />
            <span>Approve (80 mETH)</span>
          </button>

          <button
            onClick={() => onVerifierDecision(false)}
            disabled={loading || claim.status === 'NONE' || claim.status === 'SETTLED' || claim.status === 'VERIFIER_REJECTED'}
            className="btn-danger"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.825rem' }}
          >
            <XSquare size={15} />
            <span>Reject Claim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
