import React from 'react';
import { ShieldCheck, RotateCcw, Cpu, ExternalLink, Globe2 } from 'lucide-react';
import { SystemState } from '../types';
import { CopyButton } from './CopyButton';

interface HeaderProps {
  state: SystemState | null;
  onReset: () => void;
  isResetting: boolean;
  onToast?: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onReset, isResetting, onToast }) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--brand-pine) 0%, var(--brand-emerald) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)',
            color: '#ffffff'
          }}>
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-title)' }}>
                Supply<span style={{ color: 'var(--brand-emerald)' }}>Right</span>
              </span>
              <span className="badge badge-green">
                <span className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                Topic F: Autonomous Wallet
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enterprise Supplier Non-Delivery Protection & Policy-Gated On-Chain Settlement
            </p>
          </div>
        </div>

        {/* Status Pills & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {state && (
            <>
              {/* Telemetry & Network Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Sepolia Testnet RPC Latency: 24ms">
                  <span className="pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-title)' }}>Sepolia</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>(11155111)</span>
                </div>

                <span style={{ color: '#cbd5e1' }}>•</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Strict Isolated Signer Address">
                  <Cpu size={13} color="var(--brand-emerald)" />
                  <span style={{ color: 'var(--text-muted)' }}>Signer:</span>
                  <span className="mono-val" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {state.parties.agent.address.slice(0, 6)}...{state.parties.agent.address.slice(-4)}
                  </span>
                  <CopyButton text={state.parties.agent.address} label="Agent Wallet Address" onToast={onToast} size={11} />
                </div>

                <span style={{ color: '#cbd5e1' }}>•</span>

                <a
                  href={`${state.chain.explorerUrl}/address/${state.contracts.claimManager}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-emerald)', textDecoration: 'none', fontWeight: 600 }}
                  title="View deployed ClaimManager contract on Sepolia"
                >
                  <Globe2 size={12} />
                  <span>Explorer</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Policy Engine Active Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'var(--bg-mint-tint)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--status-success-border)',
                fontSize: '0.78rem',
                color: 'var(--brand-pine)',
                fontWeight: 600
              }} title="Autonomous transactions cannot sign without passing 7 hard cryptographic policy checks">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-emerald)' }}></span>
                <span>Policy Gates: 7 Active</span>
              </div>
            </>
          )}

          <button
            onClick={onReset}
            disabled={isResetting}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px', fontSize: '0.825rem' }}
            title="Reset system state back to pristine initial seed fixture"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
