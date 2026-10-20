import React from 'react';
import { FileText, Shield, Layers, Calendar, CheckCircle2, Building, DollarSign } from 'lucide-react';
import { SystemState } from '../types';

interface Props {
  state: SystemState;
}

export const CommitmentVaultCard: React.FC<Props> = ({ state }) => {
  const { purchaseOrder, commitment, vault } = state;
  const collateralDisplay = (Number(vault.collateralWei) / 1e18).toFixed(1);

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-mint-tint)',
            border: '1px solid var(--status-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-emerald)'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h2 className="section-title">Commercial Commitment & Vault</h2>
            <span className="section-desc">Registered PO Terms & Provider Collateral</span>
          </div>
        </div>

        <span className="badge badge-green">
          <CheckCircle2 size={13} color="var(--brand-emerald)" />
          SRCOM #{commitment.tokenId}
        </span>
      </div>

      {/* PO Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        padding: '14px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.825rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', marginBottom: '2px' }}>PO Reference</span>
          <strong style={{ color: 'var(--text-title)', fontSize: '0.9rem' }}>{purchaseOrder.id}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', marginBottom: '2px' }}>Total Contract Value</span>
          <span style={{ color: 'var(--brand-emerald)', fontWeight: 700, fontSize: '0.9rem' }}>{purchaseOrder.totalValueDisplay}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', marginBottom: '2px' }}>SME Buyer</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{purchaseOrder.buyer.name}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', marginBottom: '2px' }}>Domestic Supplier</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{purchaseOrder.supplier.name}</span>
        </div>
        <div style={{ gridColumn: 'span 2', paddingTop: '4px', borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', marginBottom: '2px' }}>Product Specification</span>
          <span style={{ color: 'var(--text-secondary)' }}>{purchaseOrder.product.description}</span>
        </div>
      </div>

      {/* Quantities Ordered */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--brand-emerald)" />
          <span>Ordered: <strong style={{ color: 'var(--text-title)' }}>{purchaseOrder.quantity.ordered.toLocaleString()}</strong> units ({purchaseOrder.quantity.batches} batches)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>Deadline: 2026-10-15</span>
        </div>
      </div>

      {/* Provider Collateral Vault (Matching Reference Styling) */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: vault.active ? 'var(--bg-mint-tint)' : '#f8fafc',
        border: `1px solid ${vault.active ? 'var(--status-success-border)' : 'var(--border-subtle)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color={vault.active ? 'var(--brand-emerald)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-pine)' }}>
              Provider Protection Vault
            </span>
          </div>
          <span className={`badge ${vault.active ? 'badge-success' : 'badge-warning'}`}>
            {vault.settled ? 'Settled & Refunded' : (vault.active ? 'Collateral Active' : 'Unfunded')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Pre-Funded Collateral</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-pine)' }}>{collateralDisplay}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>mETH</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Policy Coverage</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
              {vault.coverageRateBps / 100}% Rate (Max 20 mETH)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
