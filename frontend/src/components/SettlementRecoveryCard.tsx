import React from 'react';
import { Award, ExternalLink, ArrowDownLeft, Shield, CheckCircle2, UserCheck, Send } from 'lucide-react';
import { SystemState } from '../types';
import { CopyButton } from './CopyButton';

interface Props {
  state: SystemState;
  onTransferRecovery?: () => void;
  loading?: boolean;
  onToast?: (msg: string) => void;
}

export const SettlementRecoveryCard: React.FC<Props> = ({ state, onTransferRecovery, loading, onToast }) => {
  const { claim, recoveryNFT, chain, vault, parties } = state;
  const isSettled = claim.status === 'SETTLED' && recoveryNFT !== null;
  const payoutEther = (Number(claim.requestedPayoutWei) / 1e18).toFixed(1);

  const isAssigned = recoveryNFT && recoveryNFT.recipient.toLowerCase() !== parties.buyer.address.toLowerCase();

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isSettled ? 'var(--status-purple-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${isSettled ? 'var(--status-purple-border)' : 'var(--border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSettled ? 'var(--status-purple)' : 'var(--text-muted)'
          }}>
            <Award size={20} />
          </div>
          <div>
            <h2 className="section-title">Settlement & Recovery NFT</h2>
            <span className="section-desc">
              Atomic Payout + Subrogation Legal Claim Right
            </span>
          </div>
        </div>

        <span className={`badge ${isSettled ? 'badge-purple' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
          {isSettled ? 'Atomically Settled' : 'Awaiting Settlement'}
        </span>
      </div>

      {isSettled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Payout Metric Box */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-mint-tint)',
            border: '1px solid var(--status-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-pine)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Verified Settlement Payout to Buyer
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-pine)' }}>
                  +{payoutEther}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>mETH</span>
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-emerald)',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)'
            }}>
              <ArrowDownLeft size={24} />
            </div>
          </div>

          {/* Recovery NFT Asset Box (Subrogation Rights) */}
          <div style={{
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-purple-bg)',
            border: '1px solid var(--status-purple-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-purple)' }}>
                  Recovery Claim NFT (Subrogation Right)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-purple" style={{ fontWeight: 700 }}>
                  SRRC #{recoveryNFT.tokenId}
                </span>
                <CopyButton text={`SRRC #${recoveryNFT.tokenId}`} label="Recovery NFT Token ID" onToast={onToast} />
              </div>
            </div>

            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Minted atomically in the same transaction. Represents legal right to pursue {payoutEther} mETH recovery from the defaulting supplier.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', paddingTop: '4px', borderTop: '1px dashed rgba(124, 58, 237, 0.2)' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Current Legal Holder:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <strong style={{ color: isAssigned ? 'var(--brand-emerald)' : 'var(--text-title)' }}>
                  {isAssigned ? 'Apex Debt Recovery Specialist' : 'SME Buyer (Self)'}
                </strong>
                <span className="mono-val" style={{ fontSize: '0.675rem' }}>
                  ({recoveryNFT.recipient.slice(0, 6)}...{recoveryNFT.recipient.slice(-4)})
                </span>
                <CopyButton text={recoveryNFT.recipient} label="Holder Wallet" onToast={onToast} size={11} />
              </div>
            </div>

            {/* Challenge Bonus Interaction: Assign to Specialist */}
            {!isAssigned && onTransferRecovery && (
              <button
                onClick={onTransferRecovery}
                disabled={loading}
                className="btn-secondary"
                style={{
                  marginTop: '4px',
                  padding: '7px 12px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  justifyContent: 'center',
                  background: '#ffffff',
                  borderColor: 'var(--status-purple-border)',
                  color: 'var(--status-purple)',
                  fontWeight: 600
                }}
                title="Transfer ERC-721 Recovery NFT to a third-party debt collection agency (Factoring / Subrogation)"
              >
                <Send size={12} />
                <span>Assign Right to Debt Collection Agency (Subrogation Factoring)</span>
              </button>
            )}

            {isAssigned && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-emerald)', fontSize: '0.725rem', fontWeight: 600 }}>
                <UserCheck size={14} />
                <span>Subrogation claim rights successfully assigned to recovery partner!</span>
              </div>
            )}
          </div>

          {/* Collateral Reconciliation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Provider Remaining Collateral:</span>
            <strong style={{ color: 'var(--text-title)' }}>
              {(Number(vault.collateralWei) / 1e18).toFixed(1)} mETH (Refundable to Provider)
            </strong>
          </div>

          {/* On-Chain Receipt Link */}
          <div style={{
            padding: '10px 14px',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.775rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--brand-emerald)" />
              <span className="mono-val" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Tx: {claim.settlementTxHash.slice(0, 16)}...
              </span>
              <CopyButton text={claim.settlementTxHash} label="Settlement Transaction Hash" onToast={onToast} />
            </div>
            <a
              href={`${chain.explorerUrl}/tx/${claim.settlementTxHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-emerald)', textDecoration: 'none', fontWeight: 700 }}
            >
              <span>Etherscan</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '28px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          height: '100%',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-medium)'
        }}>
          <Shield size={36} color="#94a3b8" />
          <p style={{ fontSize: '0.825rem', maxWidth: '300px', margin: 0, lineHeight: 1.45, color: 'var(--text-secondary)' }}>
            Settlement triggers atomically once the independent verifier confirms eligible loss and the policy gate clears.
          </p>
        </div>
      )}
    </div>
  );
};
