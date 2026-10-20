import React, { useState } from 'react';
import { Bot, Terminal, ShieldAlert, Sparkles, Check, ArrowRight, Activity } from 'lucide-react';
import { SystemState, AgentAssessment, PolicyVerdict } from '../types';

interface Props {
  state: SystemState;
  assessment: AgentAssessment | null;
  policyVerdict: PolicyVerdict | null;
  thoughtLogs: string[];
  onAssess: () => void;
  onSubmitClaim: () => void;
  onSettle: () => void;
  onRunAutonomous: () => void;
  loading: boolean;
}

export const AgentCommandCenter: React.FC<Props> = ({
  state,
  assessment,
  policyVerdict,
  thoughtLogs,
  onAssess,
  onSubmitClaim,
  onSettle,
  onRunAutonomous,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'assessment'>('console');
  const { claim } = state;

  const currentStageIndex = (() => {
    if (claim.status === 'SETTLED') return 5;
    if (claim.status === 'VERIFIER_APPROVED') return 3;
    if (claim.status === 'SUBMITTED') return 2;
    if (assessment) return 1;
    return 0;
  })();

  const stages = [
    { id: 0, name: 'Read', desc: 'PO & Chain State' },
    { id: 1, name: 'Assess', desc: 'Shortfall Evidence' },
    { id: 2, name: 'Propose', desc: 'Action Formulation' },
    { id: 3, name: 'Authorize', desc: 'Policy Gate Check' },
    { id: 4, name: 'Execute', desc: 'Isolated Signer' },
    { id: 5, name: 'Audit', desc: 'On-Chain Receipt' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--brand-pine)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h2 className="section-title">Autonomous AI Agent Engine</h2>
            <span className="section-desc">
              6-Stage Decision Sequence (Read → Assess → Propose → Authorize → Execute → Audit)
            </span>
          </div>
        </div>

        <button
          onClick={onRunAutonomous}
          disabled={loading || claim.status === 'SETTLED'}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.825rem' }}
        >
          <Sparkles size={14} />
          <span>Run Autonomous Loop</span>
        </button>
      </div>

      {/* 6-Stage Stepper (Clean High-Trust Aesthetic) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        padding: '12px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {stages.map((st, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={st.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                background: isCurrent ? '#ffffff' : 'transparent',
                border: isCurrent ? '1px solid var(--brand-emerald)' : '1px solid transparent',
                boxShadow: isCurrent ? '0 2px 8px rgba(5, 150, 105, 0.1)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: isDone ? 'var(--brand-emerald)' : (isCurrent ? 'var(--brand-pine)' : '#e2e8f0'),
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                {isDone ? <Check size={13} /> : idx + 1}
              </div>
              <strong style={{ fontSize: '0.75rem', color: isCurrent ? 'var(--brand-pine)' : (isDone ? 'var(--text-title)' : 'var(--text-muted)') }}>
                {st.name}
              </strong>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1.1 }}>
                {st.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Manual Step Trigger Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onAssess}
          disabled={loading}
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem' }}
        >
          <span>1. Assess Risk</span>
        </button>

        <button
          onClick={onSubmitClaim}
          disabled={loading || claim.status !== 'NONE'}
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem' }}
        >
          <span>2. Submit Claim</span>
        </button>

        <button
          onClick={onSettle}
          disabled={loading || claim.status !== 'VERIFIER_APPROVED'}
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem' }}
        >
          <span>3. Settle Payout</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('console')}
          style={{
            background: 'none',
            padding: '8px 0',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: activeTab === 'console' ? 'var(--brand-pine)' : 'var(--text-muted)',
            borderBottom: activeTab === 'console' ? '2px solid var(--brand-emerald)' : '2px solid transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} color={activeTab === 'console' ? 'var(--brand-emerald)' : 'var(--text-muted)'} />
            <span>Agent Thought Activity</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('assessment')}
          style={{
            background: 'none',
            padding: '8px 0',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: activeTab === 'assessment' ? 'var(--brand-pine)' : 'var(--text-muted)',
            borderBottom: activeTab === 'assessment' ? '2px solid var(--brand-emerald)' : '2px solid transparent'
          }}
        >
          <span>Risk Assessment Report</span>
        </button>
      </div>

      {/* Tab Content (Clean Light Styling, No Ugly Hacker Terminal) */}
      {activeTab === 'console' ? (
        <div style={{
          background: '#ffffff',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          height: '145px',
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {thoughtLogs.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Agent is in standby. Click "1. Assess Risk" or "Run Autonomous Loop" to activate the 6-stage lifecycle.
            </span>
          ) : (
            thoughtLogs.map((log, index) => (
              <div key={index} style={{ color: 'var(--text-primary)', lineHeight: 1.4, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}>›</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{log}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-subtle)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.825rem',
          minHeight: '145px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {assessment ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-danger">
                  Deficit Detected: {assessment.shortfallPercentage}% Shortfall
                </span>
                <span className="badge badge-green">
                  Confidence: {assessment.confidenceFlag}
                </span>
              </div>
              <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                {assessment.qualitativeSummary}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.75rem', background: '#fffbeb', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7' }}>
                <ShieldAlert size={15} style={{ flexShrink: 0 }} />
                <span>{assessment.disclaimer}</span>
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Click "1. Assess Risk" to perform qualitative PO and warehouse evidence reconciliation.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
