import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { PolicyVerdict } from '../types';

interface Props {
  verdict: PolicyVerdict | null;
}

export const PolicyGateInspector: React.FC<Props> = ({ verdict }) => {
  const defaultRules = [
    { rule: 'CHAIN_ID_ALLOWLIST', passed: true, reason: 'Chain ID 11155111 (Sepolia) is whitelisted.' },
    { rule: 'CONTRACT_ALLOWLIST', passed: true, reason: 'Target contract is verified in allowlist registry.' },
    { rule: 'FUNCTION_ALLOWLIST', passed: true, reason: 'Target function signature is whitelisted.' },
    { rule: 'ROLE_AUTHORITY', passed: true, reason: 'Actor role possesses verified execution authority.' },
    { rule: 'NONCE_IDEMPOTENCY', passed: true, reason: 'Nonce is unique and unconsumed (Replay defense active).' },
    { rule: 'VERIFIER_APPROVAL_REQUIRED', passed: true, reason: 'Requires independent verifier approval on-chain.' },
    { rule: 'VALUE_CAP_ENFORCEMENT', passed: true, reason: 'Settlement payout bounded by max 20 mETH policy cap.' }
  ];

  const checks = verdict?.checks || defaultRules;
  const isAllowed = verdict ? verdict.allowed : true;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isAllowed ? 'var(--bg-mint-tint)' : 'var(--status-danger-bg)',
            border: `1px solid ${isAllowed ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isAllowed ? 'var(--brand-emerald)' : 'var(--status-danger)'
          }}>
            <Lock size={20} />
          </div>
          <div>
            <h2 className="section-title">Policy Engine Allowlist Gate</h2>
            <span className="section-desc">
              Independent Security Clearance (Role, Contract, Value Cap & Replay Defense)
            </span>
          </div>
        </div>

        <span className={`badge ${isAllowed ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>
          {isAllowed ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          {verdict ? (verdict.verdict === 'ALLOW' ? 'GATE: ALLOW' : 'GATE: DENY') : 'GATE: ACTIVE'}
        </span>
      </div>

      {/* Rules Evaluation List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '260px',
        overflowY: 'auto'
      }}>
        {checks.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: c.passed ? '#ffffff' : 'var(--status-danger-bg)',
              border: `1px solid ${c.passed ? 'var(--border-subtle)' : 'var(--status-danger-border)'}`,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              fontSize: '0.8rem'
            }}
          >
            {c.passed ? (
              <CheckCircle2 size={16} color="var(--brand-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <XCircle size={16} color="var(--status-danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ color: c.passed ? 'var(--text-title)' : 'var(--status-danger)', fontSize: '0.825rem' }}>
                  {c.rule.replace(/_/g, ' ')}
                </strong>
                <span className={`badge ${c.passed ? 'badge-success' : 'badge-danger'}`} style={{ padding: '2px 8px', fontSize: '0.675rem' }}>
                  {c.passed ? 'PASSED' : 'BLOCKED'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', lineHeight: 1.35, fontSize: '0.775rem' }}>
                {c.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
