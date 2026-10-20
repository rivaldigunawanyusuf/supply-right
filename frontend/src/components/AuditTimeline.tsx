import React from 'react';
import { History, CheckCircle2, XCircle, ArrowUpRight, Download, FileJson } from 'lucide-react';
import { AuditRecord } from '../types';
import { CopyButton } from './CopyButton';

interface Props {
  auditTrail: AuditRecord[];
  onToast?: (msg: string) => void;
}

export const AuditTimeline: React.FC<Props> = ({ auditTrail, onToast }) => {
  const handleExportJSON = () => {
    const exportData = {
      title: 'SupplyRight AI — Verification & Settlement Audit Trail',
      exportedAt: new Date().toISOString(),
      standard: 'Fintechathon 2026 Topic F Autonomous Wallet Compliance',
      chain: {
        name: 'Ethereum Sepolia',
        chainId: 11155111
      },
      totalRecords: auditTrail.length,
      records: auditTrail
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplyright-audit-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onToast) onToast('Audit report downloaded successfully (JSON)!');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
            <History size={20} />
          </div>
          <div>
            <h2 className="section-title">Immutable Audit Trail</h2>
            <span className="section-desc">
              End-to-End Decision & Transaction History (Propose → Gate → Sign → Receipt)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-green" style={{ fontWeight: 700 }}>
            {auditTrail.length} Records Logged
          </span>

          <button
            onClick={handleExportJSON}
            disabled={auditTrail.length === 0}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            title="Download full structured audit report as JSON for enterprise compliance"
          >
            <Download size={13} />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '280px',
        overflowY: 'auto'
      }}>
        {auditTrail.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            No audit records logged yet. Run a scenario or stage above to generate verifiable on-chain actions.
          </div>
        ) : (
          [...auditTrail].reverse().map((record) => {
            const isSuccess = record.status === 'CONFIRMED' || record.status === 'ALLOWED';
            const isDenied = record.status === 'DENIED' || record.status === 'FAILED';

            return (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isDenied ? 'var(--status-danger-bg)' : '#ffffff',
                  border: `1px solid ${isDenied ? 'var(--status-danger-border)' : 'var(--border-subtle)'}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {isSuccess ? (
                    <CheckCircle2 size={16} color="var(--brand-emerald)" />
                  ) : isDenied ? (
                    <XCircle size={16} color="var(--status-danger)" />
                  ) : (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--brand-pine)' }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-green" style={{ padding: '2px 8px', fontSize: '0.675rem' }}>
                        {record.stage}
                      </span>
                      <strong style={{ color: 'var(--text-title)', fontSize: '0.85rem' }}>
                        {record.actionType}
                      </strong>
                    </div>

                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ margin: '3px 0 6px', color: 'var(--text-secondary)', lineHeight: 1.4, fontSize: '0.775rem' }}>
                    {record.rationale}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', flexWrap: 'wrap', gap: '6px' }}>
                    {record.targetContract && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="mono-val" style={{ color: 'var(--text-muted)' }}>
                          Target: {record.targetContract.slice(0, 10)}...
                        </span>
                        {record.targetContract.startsWith('0x') && (
                          <CopyButton text={record.targetContract} label="Contract Address" onToast={onToast} />
                        )}
                      </div>
                    )}

                    {record.txHash && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="mono-val" style={{ color: 'var(--brand-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Tx: {record.txHash.slice(0, 10)}...
                          <ArrowUpRight size={11} />
                        </span>
                        <CopyButton text={record.txHash} label="Transaction Hash" onToast={onToast} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
