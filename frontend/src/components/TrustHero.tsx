import React from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  FileCheck2, 
  Lock, 
  PackageCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { SystemState } from '../types';

interface Props {
  state: SystemState;
  onExecuteSettlement: () => void;
  loading: boolean;
}

export const TrustHero: React.FC<Props> = ({ state, onExecuteSettlement, loading }) => {
  const { claim, vault, deliveryEvidence } = state;
  const isSettled = claim.status === 'SETTLED';
  const isApproved = claim.status === 'VERIFIER_APPROVED';

  // Calculate score/percentage
  const shortfallPct = deliveryEvidence.shortfallPercentage;
  const coverageRate = vault.coverageRateBps / 100;

  return (
    <div style={{ marginBottom: '28px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px 32px',
          border: '1px solid #e1ede6',
          boxShadow: '0 16px 40px -6px rgba(6, 78, 59, 0.06), 0 4px 16px -2px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 280px minmax(320px, 1.2fr)', gap: '32px', alignItems: 'center' }}>
          
          {/* Left Column: Brand Hero Title */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-mint-tint)', borderRadius: 'var(--radius-full)', marginBottom: '14px', border: '1px solid var(--status-success-border)' }}>
              <ShieldCheck size={16} color="var(--brand-emerald)" />
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--brand-pine)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                On-Chain Protection Protocol
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}>
              Supplier <span style={{ color: 'var(--brand-emerald)' }}>Protection Status</span>
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '340px' }}>
              Continuous AI-assisted supplier non-delivery hedging and policy-governed atomic settlement for SMEs.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--brand-emerald)" />
                <span>Zero Hallucination</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--brand-emerald)" />
                <span>Isolated Signer</span>
              </div>
            </div>
          </div>

          {/* Center Column: Circular Trust & Health Gauge (Crotrustify Aesthetic) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            padding: '20px 16px',
            background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-subtle) 100%)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 20px -2px rgba(6, 78, 59, 0.03)'
          }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Supplier Delivery Status</span>
              <Info size={12} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Circular Gauge SVG */}
            <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                {/* Background Track */}
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="11"
                />
                {/* Active Colored Arc */}
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke={isSettled ? '#059669' : (isApproved ? '#10b981' : '#059669')}
                  strokeWidth="11"
                  strokeDasharray="389"
                  strokeDashoffset={389 - (389 * 0.8)} // 80% arc
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                />
              </svg>

              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {isSettled ? '100%' : `${shortfallPct}%`}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSettled ? 'var(--brand-emerald)' : 'var(--status-danger)', marginTop: '2px' }}>
                  {isSettled ? 'Settled' : 'Shortfall'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isSettled ? 'Paid to Buyer' : '8,000 units deficit'}
                </span>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)',
              marginTop: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}>
              <TrendingUp size={13} color="var(--brand-emerald)" />
              <span>Coverage: <strong>{coverageRate}%</strong> of verified loss</span>
            </div>
          </div>

          {/* Right Column: Trust Signals List (Crotrustify Aesthetic) */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 20px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 16px -2px rgba(6, 78, 59, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-title)' }}>
                Protection Signals & Verifications
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <span className="pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}></span>
                Live On Sepolia
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Signal 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
                    <FileCheck2 size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Commercial Commitment</span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>SupplyRight NFT (SRCOM #1)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>Active</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>

              {/* Signal 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
                    <Lock size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Provider Vault Collateral</span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>20.0 mETH Pre-Funded</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>Strong</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>

              {/* Signal 3 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-danger)' }}>
                    <PackageCheck size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Delivery Evidence Intake</span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>10 of 50 Batches Arrived</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--status-danger)' }}>80% Shortfall</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>

              {/* Signal 4 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-purple)' }}>
                    <Award size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Subrogation Rights</span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Recovery Claim NFT (SRRC #101)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--status-purple)' }}>Enforceable</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Recommendation & Conversion Strip (Direct Reference Pattern) */}
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--status-success-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
              color: 'var(--brand-pine)'
            }}>
              <AlertCircle size={20} color="var(--brand-emerald)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-pine)', letterSpacing: '0.04em' }}>
                  Autonomous Agent Recommendation:
                </span>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Action Required</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '2px 0 0', fontWeight: 500 }}>
                {isSettled
                  ? 'Settlement completed! Payout of 16.0 mETH released to buyer and Recovery Claim NFT #101 minted.'
                  : (isApproved
                    ? 'Eligible loss of 80.0 mETH verified by independent reviewer. Payout of 16.0 mETH ready for atomic execution.'
                    : 'Warehouse shortfall of 8,000 units verified. Submit claim to initiate independent verifier attestation.')
                }
              </p>
            </div>
          </div>

          {!isSettled && (
            <button
              onClick={onExecuteSettlement}
              disabled={loading || !isApproved}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <span>Execute Verified Settlement</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
