import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const TestnetDisclaimer: React.FC = () => {
  return (
    <div style={{
      background: '#fffbeb',
      border: '1px solid #fef3c7',
      borderRadius: 'var(--radius-md)',
      padding: '12px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontSize: '0.8rem',
      color: '#92400e',
      boxShadow: '0 1px 3px rgba(217, 119, 6, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={15} color="#b45309" />
        </div>
        <div>
          <strong style={{ color: '#b45309' }}>Testnet Demonstration Notice (FR-11 Compliant):</strong>{' '}
          Operating on <strong>Ethereum Sepolia (Chain ID 11155111)</strong> using mock mETH tokens.
          Tokens hold <strong>NO real monetary value</strong>. This system simulates non-delivery protection, verified claim adjudication, and atomic subrogation NFT settlement for competition judging.
        </div>
      </div>
      <span className="badge badge-warning" style={{ flexShrink: 0, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
        <ShieldAlert size={12} /> Testnet Environment
      </span>
    </div>
  );
};
